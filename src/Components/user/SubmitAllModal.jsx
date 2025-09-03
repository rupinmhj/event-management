import React, { useEffect, useState } from 'react';
import { ChevronDown, Upload, Check, Clock, FileText, Link, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import useAxiosAuth from '@/hooks/useAxiosAuth';
import { toast, ToastContainer } from 'react-toastify'
import JoditEditor from 'jodit-react';
import 'jodit/es2021/jodit.min.css';
import { useNavigate } from 'react-router-dom';

const SubmitAllModal = ({ isOpen, onClose, events, onRefresh }) => {
    const [selectedEventId, setSelectedEventId] = useState(null);
    const [submissions, setSubmissions] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [participationDetails, setParticipationDetails] = useState({});
    const [ownParticipations, setOwnParticipations] = useState({});
    const [loading, setLoading] = useState(false);
    const api = useAxiosAuth();
    const has_profile = localStorage.getItem("has_profile");
    const navigate = useNavigate();
    // Preselect first event when modal opens
    useEffect(() => {
        if (isOpen && events?.length && !selectedEventId) {
            setSelectedEventId(events[0].id);
        }
    }, [isOpen, events, selectedEventId]);

    // Fetch participation data when modal opens or event changes
    useEffect(() => {
        if (isOpen && selectedEventId) {
            fetchParticipationData(selectedEventId);
        }
    }, [isOpen, selectedEventId]);

    const fetchParticipationData = async (eventId) => {
        setLoading(true);
        try {
            // Fetch own participation list to get participant ID
            const ownParticipationRes = await api.get(`/api/event/own-participation-list/?event=${eventId}`);
            const ownParticipationData = ownParticipationRes.data;

            setOwnParticipations(prev => ({
                ...prev,
                [eventId]: ownParticipationData
            }));

            // If we have own participation data, get detailed participation
            let participationData = null;
            if (ownParticipationData && ownParticipationData.length > 0) {
                const participantId = ownParticipationData[0].id;

                try {
                    const participationRes = await api.get(`/api/event/participation-detail/${participantId}/`);
                    participationData = participationRes.data;
                } catch (error) {
                    console.log(`No participation detail found for participant ${participantId}`);
                }
            }

            setParticipationDetails(prev => ({
                ...prev,
                [eventId]: participationData
            }));

            // Prefill submissions with existing data
            prefillSubmissions(eventId, participationData, ownParticipationData);

        } catch (error) {
            console.error('Error fetching participation data:', error);
            setOwnParticipations(prev => ({
                ...prev,
                [eventId]: []
            }));
            setParticipationDetails(prev => ({
                ...prev,
                [eventId]: null
            }));
        } finally {
            setLoading(false);
        }
    };

    const prefillSubmissions = (eventId, participationData, ownParticipationData) => {
        const selectedEvent = events.find(e => e.id === eventId);
        if (!selectedEvent) return;

        const newSubmissions = {};

        selectedEvent.requirements?.forEach(requirement => {
            // First try to get data from participation detail (submitted responses)
            const response = getResponseForRequirement(participationData, requirement.id);

            // If no submitted response, try to get from own participation (drafts)
            const ownParticipation = getOwnParticipationForRequirement(ownParticipationData, requirement.id);

            const existingData = response || ownParticipation;

            if (existingData) {
                if (requirement.type === 'FILE') {
                    // For files, we can't prefill the actual file object, but we can show the filename
                    // The file input will need special handling to show existing file info
                    if (existingData.file) {
                        newSubmissions[`${requirement.id}_filename`] = existingData.file.split('/').pop();
                        // If file path is relative, prepend base URL
                        newSubmissions[`${requirement.id}_fileurl`] = existingData.file.startsWith('http')
                            ? existingData.file
                            : `${api.defaults.baseURL}${existingData.file}`;
                    }
                } else {
                    // For text/URL, prefill the value
                    if (existingData.value) {
                        newSubmissions[requirement.id] = existingData.value;
                    }
                }
            }
        });

        setSubmissions(newSubmissions);
    };

    // Helper functions (same as in RequirementCard)
    const getResponseForRequirement = (participationData, requirementId) => {
        if (!participationData || !participationData.responses) return null;
        return participationData.responses.find(response =>
            response.requirement === requirementId
        );
    };

    const getOwnParticipationForRequirement = (ownParticipationData, requirementId) => {
        if (!ownParticipationData || !Array.isArray(ownParticipationData)) return null;
        return ownParticipationData.find(participation =>
            participation.requirement === requirementId
        );
    };

    const selectedEvent = events.find(e => e.id === selectedEventId) || null;
    const allRequirements = selectedEvent?.requirements || [];

    const getTypeIcon = (type) => {
        switch (type) {
            case 'URL': return <Link className="w-3 h-3 sm:w-4 sm:h-4" />;
            case 'FILE': return <Upload className="w-3 h-3 sm:w-4 sm:h-4" />;
            default: return <FileText className="w-3 h-3 sm:w-4 sm:h-4" />;
        }
    };

    const getTypeColor = () => 'bg-gray-100 text-gray-700 border-gray-200';

    const isDeadlineNear = (deadline) => {
        if (!deadline) return false;
        const deadlineDate = new Date(deadline);
        const now = new Date();
        const diffInDays = Math.ceil((deadlineDate - now) / (1000 * 60 * 60 * 24));
        return diffInDays <= 3;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log('submitAll', has_profile)
        if (has_profile == "undefined" || has_profile==="false") {
            toast.info('Please complete your profile before submitting requirements.');
            setTimeout(() => {
                navigate('/user/setup-profile');
            }, 1000)
            return;
        }
        if (!selectedEventId) {
            toast.success('Please select an event.');
            return;
        }

        const submissionData = allRequirements
            .filter(req => submissions[req.id]) // Include all requirements with data, regardless of submission status
            .map(req => ({
                requirement_id: req.id,
                type: req.type,
                value: submissions[req.id]
            }));

        if (submissionData.length === 0) {
            toast.success('Please fill at least one requirement.');
            return;
        }

        setIsSubmitting(true);

        try {
            const formData = new FormData();
            formData.append('event_id', selectedEventId);

            // Add participation_id for editing existing submissions
            const ownParticipationData = ownParticipations[selectedEventId];
            if (ownParticipationData && ownParticipationData.length > 0) {
                const participationId = ownParticipationData[0].id;
                formData.append('participation_id', participationId);
            }

            submissionData.forEach((sub, index) => {
                formData.append(`responses[${index}][requirement_id]`, sub.requirement_id);
                if (sub.type === 'FILE') {
                    formData.append(`responses[${index}][file]`, sub.value);
                } else {
                    formData.append(`responses[${index}][value]`, sub.value);
                }
            });
            formData.forEach((value, key) => {
                console.log(key, value);
            });

            const res = await api.post('/api/event/participation/submit-response/', formData);
            console.log(res);
            if (res.status == 200) {
                toast.success("Requirements  successfully submitted")
            }

            setTimeout(() => {
                setSubmissions({});
                onRefresh?.();
                onClose();
            }, 1000);
        } catch (error) {
            console.error('Error submitting requirements:', error);
            toast.error('Failed to submit. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleValueChange = (requirementId, value) => {
        setSubmissions(prev => ({ ...prev, [requirementId]: value }));
    };

    const handleFileChange = (requirementId, e) => {
        const file = e.target.files?.[0];
        if (file) {
            handleValueChange(requirementId, file);
            // Clear the filename display when new file is selected
            setSubmissions(prev => ({ ...prev, [`${requirementId}_filename`]: undefined }));
        }
    };

    const isRequirementSubmitted = (requirementId) => {
        const participationData = participationDetails[selectedEventId];
        const response = getResponseForRequirement(participationData, requirementId);
        return response && response.is_submitted;
    };

    const hasExistingFile = (requirementId) => {
        return submissions[`${requirementId}_filename`];
    };

    const getCompletedCount = () =>
        allRequirements.filter(req => submissions[req.id]).length; // Count all requirements with current form data

    const getAvailableRequirements = () =>
        allRequirements; // Show all requirements, including submitted ones for editing

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="w-[95vw] sm:w-[90vw] md:w-[80vw] max-w-7xl max-h-[90vh] overflow-y-auto py-0 bb">
                <div className="sticky top-0 bg-white border-b pb-3 sm:pb-4 z-40">
                    <DialogTitle className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 pt-3 sm:pt-4">
                        Submit Requirements
                    </DialogTitle>
                    <p className="text-xs sm:text-sm text-gray-600 mt-1">
                        Fill out pending requirements for the selected event. Progress: {getCompletedCount()}/{getAvailableRequirements().length} selected
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
                    {/* Event selection */}
                    {events.length > 0 && (
                        <Card className="bg-white border border-gray-200">
                            <CardHeader className="pb-2 sm:pb-3">
                                <CardTitle className="text-base sm:text-lg text-gray-900">Select Event</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <Select
                                    value={selectedEventId ? String(selectedEventId) : undefined}
                                    onValueChange={(value) => setSelectedEventId(parseInt(value))}
                                >
                                    <SelectTrigger className="bg-white border-gray-200">
                                        <SelectValue placeholder="Select an event" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {events.map(event => (
                                            <SelectItem key={event.id} value={String(event.id)}>
                                                {event.title}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </CardContent>
                        </Card>
                    )}

                    {/* Loading state */}
                    {loading && (
                        <Card className="bg-blue-50 border border-blue-200">
                            <CardContent className="p-3 sm:p-4 text-blue-800 flex items-center justify-center">
                                <div className="animate-spin rounded-full h-4 w-4 sm:h-5 sm:w-5 border-b-2 border-blue-500 mr-2"></div>
                                <span className="text-sm sm:text-base">Loading participation data...</span>
                            </CardContent>
                        </Card>
                    )}

                    {/* Guard if no event is selected */}
                    {!selectedEvent && !loading && (
                        <Card className="bg-yellow-50 border border-yellow-200">
                            <CardContent className="p-3 sm:p-4 text-yellow-800 text-sm sm:text-base">
                                Please select an event to view and submit its requirements.
                            </CardContent>
                        </Card>
                    )}

                    {/* Requirements for the selected event */}
                    {selectedEvent && !loading && (
                        <div className="space-y-3 sm:space-y-4">
                            {getAvailableRequirements().map((requirement) => {
                                const eventTitle = selectedEvent.title;
                                const eventIcon = selectedEvent.icon;
                                const isCompleted = !!submissions[requirement.id];
                                const isOverdue = requirement.deadline && new Date(requirement.deadline) < new Date();
                                const hasExistingData = hasExistingFile(requirement.id) || submissions[requirement.id];

                                return (
                                    <Card
                                        key={requirement.id}
                                        className={`bg-white border border-gray-200 shadow-sm transition-all duration-300 ${isCompleted ? 'border-green-300 shadow-md' : ''} ${isOverdue ? 'border-red-200 bg-red-50' : ''} ${hasExistingData && !isCompleted ? 'border-blue-300 bg-blue-50' : ''}`}
                                    >
                                        <CardHeader className="pb-2 sm:pb-3">
                                            <div className="flex items-start justify-between gap-2 sm:gap-4">
                                                <div className="flex-1 min-w-0">
                                                    <CardTitle className="text-base sm:text-lg font-semibold text-gray-900 mb-1 truncate">
                                                        {eventTitle}
                                                    </CardTitle>
                                                    <div className="flex flex-wrap items-center gap-1 sm:gap-2 mb-2">
                                                        {requirement.is_required && (
                                                            <Badge className="text-xs bg-red-100 text-red-700 border-red-200">
                                                                Required
                                                            </Badge>
                                                        )}
                                                        {hasExistingData && !isCompleted && (
                                                            <Badge className="text-xs bg-blue-100 text-blue-700 border-blue-200">
                                                                Has Draft
                                                            </Badge>
                                                        )}
                                                        {isCompleted && (
                                                            <Badge className="text-xs bg-green-100 text-green-700 border-green-200">
                                                                <Check className="w-2 h-2 sm:w-3 sm:h-3 mr-1" />
                                                                <span className="hidden sm:inline">Ready to Submit</span>
                                                                <span className="sm:hidden">Ready</span>
                                                            </Badge>
                                                        )}
                                                    </div>
                                                </div>
                                                {eventIcon && (
                                                    <img
                                                        src={eventIcon}
                                                        alt={eventTitle}
                                                        className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg object-cover flex-shrink-0"
                                                        onError={(e) => {
                                                            e.currentTarget.src = 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=100&h=100&fit=crop';
                                                        }}
                                                    />
                                                )}
                                            </div>
                                        </CardHeader>

                                        <CardContent className="pt-0">
                                            <div className="flex items-center gap-2 font-medium text-gray-900 mb-2">
                                                <span className="text-sm sm:text-base">{requirement.label}</span>
                                            </div>

                                            <p className="text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4">
                                                {requirement.description}
                                            </p>

                                            {requirement.deadline && (
                                                <div
                                                    className={`flex items-center gap-2 mb-3 sm:mb-4 text-xs sm:text-sm ${isDeadlineNear(requirement.deadline) ? 'text-red-600' : 'text-gray-500'
                                                        }`}
                                                >
                                                    <Clock className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                                                    <span>
                                                        Deadline:{' '}
                                                        {new Date(requirement.deadline).toLocaleDateString('en-US', {
                                                            year: 'numeric',
                                                            month: 'short',
                                                            day: 'numeric',
                                                        })}
                                                    </span>
                                                </div>
                                            )}

                                            {isOverdue && (
                                                <div className="bg-red-50 border border-red-200 rounded-md p-2 sm:p-3 mb-3 sm:mb-4">
                                                    <p className="text-red-600 text-xs sm:text-sm font-medium">
                                                        ⚠️ This requirement deadline has passed
                                                    </p>
                                                </div>
                                            )}

                                            {/* Show existing data info */}
                                            {hasExistingData && !isCompleted && (
                                                <div className="bg-blue-50 border border-blue-200 rounded-md p-2 sm:p-3 mb-3 sm:mb-4">
                                                    {submissions[requirement.id] && requirement.type !== 'FILE' && (
                                                        <p className="text-blue-600 text-xs">
                                                            Current text: {submissions[requirement.id].length > 50
                                                                ? `${submissions[requirement.id].substring(0, 50)}...`
                                                                : submissions[requirement.id]}
                                                        </p>
                                                    )}
                                                </div>
                                            )}

                                            {/* Inputs */}
                                            {requirement.type === 'FILE' ? (
                                                <div className="space-y-2">
                                                    {/* Show existing file info */}
                                                    {hasExistingFile(requirement.id) && !submissions[requirement.id] && (
                                                        <div className="p-2 sm:p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                                            <a
                                                                href={submissions[`${requirement.id}_fileurl`]}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="flex items-center text-blue-700 text-xs sm:text-sm hover:underline hover:text-blue/90"
                                                            >
                                                                <Eye className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 flex-shrink-0" />
                                                                <span>View current file</span>
                                                            </a>
                                                            <p className="text-xs text-blue-600 mt-1">
                                                                Upload a new file to replace this one
                                                            </p>
                                                        </div>
                                                    )}

                                                    <div className="flex items-center justify-center w-full">
                                                        <label
                                                            htmlFor={`file-${requirement.id}`}
                                                            className="flex flex-col items-center justify-center w-full h-20 sm:h-24 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors"
                                                        >
                                                            <div className="flex flex-col items-center justify-center pt-2 pb-2 sm:pb-3">
                                                                <Upload className="w-5 h-5 sm:w-6 sm:h-6 mb-1 sm:mb-2 text-gray-400" />
                                                                <p className="text-xs text-gray-500 text-center px-2">
                                                                    <span className="font-semibold">
                                                                        {hasExistingFile(requirement.id) ? 'Click to replace file' : 'Click to upload'}
                                                                    </span>
                                                                </p>
                                                            </div>
                                                            <input
                                                                id={`file-${requirement.id}`}
                                                                type="file"
                                                                disabled={isOverdue}
                                                                className="hidden"
                                                                onChange={(e) => handleFileChange(requirement.id, e)}
                                                                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif"
                                                            />
                                                        </label>
                                                    </div>

                                                    {/* Show newly selected file */}
                                                    {submissions[requirement.id] instanceof File && (
                                                        <div className="p-2 sm:p-3 bg-green-50 border border-green-200 rounded-lg">
                                                            <p className="text-xs sm:text-sm text-green-700">
                                                                ✓ New file selected: {submissions[requirement.id].name}
                                                            </p>
                                                            {hasExistingFile(requirement.id) && (
                                                                <p className="text-xs text-green-600 mt-1">
                                                                    This will replace: {submissions[`${requirement.id}_filename`]}
                                                                </p>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            ) : requirement.type === 'URL' ? (
                                                <Input
                                                    type="url"
                                                    disabled={isOverdue}
                                                    placeholder="https://example.com"
                                                    value={submissions[requirement.id] || ''}
                                                    onChange={(e) => handleValueChange(requirement.id, e.target.value)}
                                                    className="bg-white border-gray-200 focus:border-blue-500 text-sm"
                                                />
                                            ) : requirement.type === 'TEXTAREA' ? (
                                                <div className="relative">
                                                    <JoditEditor
                                                        value={submissions[requirement.id] || ''}
                                                        config={{
                                                            readonly: false,
                                                            height: 200,
                                                            removeButtons: [
                                                                'source', 'image', 'file', 'video', 'speechRecognize',
                                                                'print', 'about', 'fullsize', 'selectall',
                                                                'symbol', 'copyformat', 'preview', 'find', 'emoticons',
                                                                'brush', 'fontsize', 'paragraph', 'link', 'table', 'hr', 'classSpan', 'superscript', 'subscript'
                                                            ],
                                                            style: {
                                                                backgroundColor: '#ffffff',
                                                                color: '#000000',
                                                                paddingLeft: '20px',
                                                                fontSize: '14px'
                                                            },
                                                        }}
                                                        onBlur={(newContent) => {
                                                            handleValueChange(requirement.id, newContent || '');
                                                        }}
                                                    />
                                                    <div className="absolute w-full bottom-0 h-[20px] bg-white dark:bg-[#5f5c5c]"></div>
                                                </div>
                                            ) : (
                                                <Textarea
                                                    placeholder="Enter your text here..."
                                                    disabled={isOverdue}
                                                    value={submissions[requirement.id] || ''}
                                                    onChange={(e) => handleValueChange(requirement.id, e.target.value)}
                                                    rows={3}
                                                    className="bg-white border-gray-200 focus:border-blue-500 resize-none text-sm"
                                                />
                                            )}
                                        </CardContent>
                                    </Card>
                                );
                            })}
                        </div>
                    )}

                    {selectedEvent && !loading && getAvailableRequirements().length === 0 && (
                        <Card className="bg-green-50 border border-green-200">
                            <CardContent className="p-4 sm:p-6 text-center">
                                <Check className="w-10 h-10 sm:w-12 sm:h-12 text-green-600 mx-auto mb-3 sm:mb-4" />
                                <h3 className="text-base sm:text-lg font-semibold text-green-800 mb-2">
                                    All Requirements Completed!
                                </h3>
                                <p className="text-sm sm:text-base text-green-600">
                                    You have successfully submitted all requirements for this event.
                                </p>
                            </CardContent>
                        </Card>
                    )}

                    <div className="flex sticky bottom-0 bg-white mt-4 sm:mt-6">
                        <div className="flex w-full gap-2 sm:gap-3 pt-4 sm:pt-6 border-t border-gray-200 px-2 sm:px-4 py-4 sm:py-6">
                            <Button
                                type="button"
                                variant="secondary"
                                onClick={onClose}
                                className="flex-1 sm:w-[100px] border-gray-300 hover:bg-red-600 text-white hover:text-white bg-red-500 text-sm sm:text-base"
                                disabled={isSubmitting}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                className="flex-1 bg-blue hover:bg-blue/90 text-white font-medium transition-colors duration-200 text-sm sm:text-base"
                                disabled={isSubmitting || !selectedEventId || loading}
                            >
                                {isSubmitting ? (
                                    <>
                                        <div className="animate-spin rounded-full h-3 w-3 sm:h-4 sm:w-4 border-b-2 border-white mr-2"></div>
                                        <span className="hidden sm:inline">Submitting...</span>
                                        <span className="sm:hidden">...</span>
                                    </>
                                ) : (
                                    `Submit`
                                )}
                            </Button>
                        </div>
                    </div>
                </form>
            </DialogContent>
            <ToastContainer />
        </Dialog>
    );
};

export default SubmitAllModal;
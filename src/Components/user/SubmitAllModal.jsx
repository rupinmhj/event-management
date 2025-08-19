import React, { useEffect, useState } from 'react';
import { ChevronDown, Upload, Check, Clock, FileText, Link } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import useAxiosAuth from '@/hooks/useAxiosAuth';

const SubmitAllModal = ({ isOpen, onClose, events, onRefresh }) => {
    const [selectedEventId, setSelectedEventId] = useState(null);
    const [submissions, setSubmissions] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const api = useAxiosAuth();

    // Preselect first event when modal opens
    useEffect(() => {
        if (isOpen && events?.length && !selectedEventId) {
            setSelectedEventId(events[0].id);
        }
    }, [isOpen, events, selectedEventId]);

    const selectedEvent = events.find(e => e.id === selectedEventId) || null;
    // Only requirements of the selected event
    const allRequirements = selectedEvent?.requirements || [];

    const getTypeIcon = (type) => {
        switch (type) {
            case 'URL': return <Link className="w-4 h-4" />;
            case 'FILE': return <Upload className="w-4 h-4" />;
            default: return <FileText className="w-4 h-4" />;
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

        if (!selectedEventId) {
            alert('Please select an event.');
            return;
        }

        const submissionData = allRequirements
            .filter(req => submissions[req.id] && !req.submitted)
            .map(req => ({
                requirement_id: req.id,
                type: req.type,
                value: submissions[req.id]
            }));

        if (submissionData.length === 0) {
            alert('Please fill at least one requirement.');
            return;
        }

        setIsSubmitting(true);

        try {
            const formData = new FormData();
            formData.append('event_id', selectedEventId);

            submissionData.forEach((sub, index) => {
                formData.append(`responses[${index}][requirement_id]`, sub.requirement_id);
                if (sub.type === 'FILE') {
                    formData.append(`responses[${index}][file]`, sub.value);
                } else {
                    formData.append(`responses[${index}][value]`, sub.value);
                }
            });

            await api.post('/api/event/participation/submit-response/', formData);

            setSubmissions({});
            // keep the selected event, or reset if you prefer:
            // setSelectedEventId(null);
            onRefresh?.();
            onClose();
        } catch (error) {
            console.error('Error submitting requirements:', error);
            alert('Failed to submit. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleValueChange = (requirementId, value) => {
        setSubmissions(prev => ({ ...prev, [requirementId]: value }));
    };

    const handleFileChange = (requirementId, e) => {
        const file = e.target.files?.[0];
        if (file) handleValueChange(requirementId, file);
    };

    const getCompletedCount = () =>
        allRequirements.filter(req => submissions[req.id] && !req.submitted).length;

    const getAvailableRequirements = () =>
        allRequirements.filter(req => !req.submitted);

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto ">
                <div className="sticky top-0 bg-white border-b pb-4 ">
                    <DialogTitle className="text-2xl font-bold text-gray-900">
                        Submit All Requirements
                    </DialogTitle>
                    <p className="text-sm text-gray-600">
                        Fill out pending requirements for the selected event. Progress: {getCompletedCount()}/{getAvailableRequirements().length} selected
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Event selection (no "All") */}
                    {events.length > 0 && (
                        <Card className="bg-white border border-gray-200">
                            <CardHeader className="pb-3">
                                <CardTitle className="text-lg text-gray-900">Select Event</CardTitle>
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

                    {/* Guard if no event is selected */}
                    {!selectedEvent && (
                        <Card className="bg-yellow-50 border border-yellow-200">
                            <CardContent className="p-4 text-yellow-800">
                                Please select an event to view and submit its requirements.
                            </CardContent>
                        </Card>
                    )}

                    {/* Requirements for the selected event */}
                    {selectedEvent && (
                        <div className="space-y-4">
                            {getAvailableRequirements().map((requirement) => {
                                const eventTitle = selectedEvent.title;
                                const eventIcon = selectedEvent.icon;
                                const isCompleted = !!submissions[requirement.id];
                                const isOverdue = requirement.deadline && new Date(requirement.deadline) < new Date();

                                return (
                                    <Card
                                        key={requirement.id}
                                        className={`bg-white border border-gray-200 shadow-sm transition-all duration-300 ${isCompleted ? 'border-green-300 shadow-md' : ''} ${isOverdue ? 'border-red-200 bg-red-50' : ''}`}
                                    >
                                        <CardHeader className="pb-3">
                                            <div className="flex items-start justify-between gap-4">
                                                <div className="flex-1">
                                                    <CardTitle className="text-lg font-semibold text-gray-900 mb-1">
                                                        {eventTitle}
                                                    </CardTitle>
                                                    <div className="flex items-center gap-2 mb-2">

                                                        {requirement.is_required && (
                                                            <Badge className="text-xs bg-red-100 text-red-700 border-red-200">
                                                                Required
                                                            </Badge>
                                                        )}
                                                        {isCompleted && (
                                                            <Badge className="text-xs bg-green-100 text-green-700 border-green-200">
                                                                <Check className="w-3 h-3 mr-1" />
                                                                Ready to Submit
                                                            </Badge>
                                                        )}
                                                    </div>
                                                </div>
                                                {eventIcon && (
                                                    <img
                                                        src={eventIcon}
                                                        alt={eventTitle}
                                                        className="w-12 h-12 rounded-lg object-cover"
                                                        onError={(e) => {
                                                            e.currentTarget.src = 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=100&h=100&fit=crop';
                                                        }}
                                                    />
                                                )}
                                            </div>
                                        </CardHeader>

                                        <CardContent className="pt-0">
                                            <div className="flex items-center gap-2 font-medium text-gray-900 mb-2">
                                                <span>{requirement.label}</span>
                                                <Badge
                                                    variant="secondary"
                                                    className={`${getTypeColor(requirement.type)} flex items-center gap-1`}
                                                >
                                                    {getTypeIcon(requirement.type)}
                                                    {requirement.type}
                                                </Badge>
                                            </div>

                                            <p className="text-sm text-gray-600 mb-4">
                                                {requirement.description}
                                            </p>

                                            {requirement.deadline && (
                                                <div
                                                    className={`flex items-center gap-2 mb-4 text-sm ${isDeadlineNear(requirement.deadline) ? 'text-red-600' : 'text-gray-500'
                                                        }`}
                                                >
                                                    <Clock className="w-4 h-4" />
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
                                                <div className="bg-red-50 border border-red-200 rounded-md p-3 mb-4">
                                                    <p className="text-red-600 text-sm font-medium">
                                                        ⚠️ This requirement deadline has passed
                                                    </p>
                                                </div>
                                            )}

                                            {/* Inputs */}
                                            {requirement.type === 'FILE' ? (
                                                <div className="space-y-2">
                                                    <div className="flex items-center justify-center w-full">
                                                        <label
                                                            htmlFor={`file-${requirement.id}`}
                                                            className="flex flex-col items-center justify-center w-full h-24 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors"
                                                        >
                                                            <div className="flex flex-col items-center justify-center pt-2 pb-3">
                                                                <Upload className="w-6 h-6 mb-2 text-gray-400" />
                                                                <p className="text-xs text-gray-500">
                                                                    <span className="font-semibold">Click to upload</span>
                                                                </p>
                                                            </div>
                                                            <input
                                                                id={`file-${requirement.id}`}
                                                                type="file"
                                                                className="hidden"
                                                                onChange={(e) => handleFileChange(requirement.id, e)}
                                                                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif"
                                                            />
                                                        </label>
                                                    </div>
                                                    {submissions[requirement.id] instanceof File && (
                                                        <p className="text-sm text-green-600">
                                                            Selected: {submissions[requirement.id].name}
                                                        </p>
                                                    )}
                                                </div>
                                            ) : requirement.type === 'URL' ? (
                                                <Input
                                                    type="url"
                                                    placeholder="https://example.com"
                                                    value={submissions[requirement.id] || ''}
                                                    onChange={(e) => handleValueChange(requirement.id, e.target.value)}
                                                    className="bg-white border-gray-200 focus:border-blue-500"
                                                />
                                            ) : (
                                                <Textarea
                                                    placeholder="Enter your text here..."
                                                    value={submissions[requirement.id] || ''}
                                                    onChange={(e) => handleValueChange(requirement.id, e.target.value)}
                                                    rows={3}
                                                    className="bg-white border-gray-200 focus:border-blue-500 resize-none"
                                                />
                                            )}
                                        </CardContent>
                                    </Card>
                                );
                            })}
                        </div>
                    )}

                    {selectedEvent && getAvailableRequirements().length === 0 && (
                        <Card className="bg-green-50 border border-green-200">
                            <CardContent className="p-6 text-center">
                                <Check className="w-12 h-12 text-green-600 mx-auto mb-4" />
                                <h3 className="text-lg font-semibold text-green-800 mb-2">
                                    All Requirements Completed!
                                </h3>
                                <p className="text-green-600">
                                    You have successfully submitted all requirements for this event.
                                </p>
                            </CardContent>
                        </Card>
                    )}

                    <div className="flex gap-3 pt-6 border-t border-gray-200 sticky bottom-0 bg-white">
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={onClose}
                            className="flex-1 border-gray-300 hover:bg-red-600 text-white hover:text-white bg-red-500"
                            disabled={isSubmitting}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            className="flex-1 bg-blue hover:bg-blue/90 text-white font-medium transition-colors duration-200"
                            disabled={isSubmitting || !selectedEventId}
                        >
                            {isSubmitting ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                    Submitting...
                                </>
                            ) : (
                                `Submit All (${getCompletedCount()})`
                            )}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default SubmitAllModal;

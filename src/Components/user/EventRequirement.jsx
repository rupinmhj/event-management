import React, { useState, useEffect, useContext } from 'react';
import { Clock, FileText, Link, Upload, Edit, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import useAxiosAuth from '@/hooks/useAxiosAuth';
import SubmissionModal from './SubmissionModal';
import SubmitAllModal from './SubmitAllModal';
import AuthContext from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const RequirementCard = () => {
    const [events, setEvents] = useState([]);
    const [participationDetails, setParticipationDetails] = useState({}); // Store participation details by event ID
    const [ownParticipations, setOwnParticipations] = useState({}); // Store own participation data by event ID
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState({});
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [selectedRequirement, setSelectedRequirement] = useState(null);
    const [selectedResponse, setSelectedResponse] = useState(null); // For edit mode
    const [selectedParticipationId, setSelectedParticipationId] = useState(null); // For updating
    const [isEditMode, setIsEditMode] = useState(false);
    const [submitAllModalOpen, setSubmitAllModalOpen] = useState(false);
    const { hasProfile } = useContext(AuthContext);
    const api = useAxiosAuth();
    const navigate = useNavigate();

    useEffect(() => {
        fetchEventsAndParticipations();
    }, [api]);

    const fetchEventsAndParticipations = async () => {
        try {
            setLoading(true);

            // Fetch events
            const eventsRes = await api.get("/api/event/active-events/");
            console.log('Events data:', eventsRes.data);
            setEvents(eventsRes.data);

            // Fetch participation details for each event
            const participationData = {};
            const ownParticipationData = {};

            for (const event of eventsRes.data) {
                try {
                    // First fetch own participation list to get participant ID
                    const ownParticipationRes = await api.get(`/api/event/own-participation-list/?event=${event.id}`);
                    ownParticipationData[event.id] = ownParticipationRes.data;
                    console.log(`Own participation data for event ${event.id}:`, ownParticipationRes.data);

                    // If we have own participation data, get the participant ID and fetch detailed participation
                    if (ownParticipationRes.data && ownParticipationRes.data.length > 0) {
                        const participantId = ownParticipationRes.data[0].id;

                        try {
                            // Fetch participation detail using participant ID
                            const participationRes = await api.get(`/api/event/participation-detail/${participantId}/`);
                            participationData[event.id] = participationRes.data;
                            console.log(`Participation detail for participant ${participantId}:`, participationRes.data);
                        } catch (error) {
                            console.log(`No participation detail found for participant ${participantId}`);
                            participationData[event.id] = null;
                        }
                    } else {
                        participationData[event.id] = null;
                    }

                } catch (error) {
                    console.log(`No own participation found for event ${event.id}`);
                    ownParticipationData[event.id] = [];
                    participationData[event.id] = null;
                }
            }

            setParticipationDetails(participationData);
            setOwnParticipations(ownParticipationData);

        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    const getTypeIcon = (type) => {
        switch (type) {
            case 'URL':
                return <Link className="w-4 h-4" />;
            case 'FILE':
                return <Upload className="w-4 h-4" />;
            default:
                return <FileText className="w-4 h-4" />;
        }
    };

    const getTypeColor = () => {
        return 'bg-gray-100 text-gray-700 border-gray-200';
    };

    const isDeadlineNear = (deadline) => {
        if (!deadline) return false;
        const deadlineDate = new Date(deadline);
        const now = new Date();
        const diffInDays = Math.ceil((deadlineDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        return diffInDays <= 3; // Only near if deadline hasn't passed yet
    };

    const isDeadlinePassed = (deadline) => {
        if (!deadline) return false;
        return new Date(deadline) < new Date();
    };

    // Get response data for a specific requirement (from participation-detail)
    const getResponseForRequirement = (eventId, requirementId) => {
        const participation = participationDetails[eventId];
        if (!participation || !participation.responses) return null;

        return participation.responses.find(response =>
            response.requirement === requirementId
        );
    };

    // Get own participation data for editing (from own-participation-list)
    const getOwnParticipationForRequirement = (eventId, requirementId) => {
        const eventParticipations = ownParticipations[eventId];
        if (!eventParticipations || !Array.isArray(eventParticipations)) return null;

        // Find participation entry that matches the requirement
        return eventParticipations.find(participation =>
            participation.requirement === requirementId
        );
    };

    // Get participation ID for updating
    const getParticipationId = (eventId) => {
        const eventParticipationList = ownParticipations[eventId];
        if (!eventParticipationList || !Array.isArray(eventParticipationList) || eventParticipationList.length === 0) {
            return null;
        }
        return eventParticipationList[0].id; // Get the first participation ID
    };

    const handleSubmitClick = (event, requirement) => {
        if (!hasProfile) {
            toast.info('Please complete your profile before submitting requirements.');
            setTimeout(() => {
                navigate('/user/setup-profile');
            }, 1000)
            return;
        }
        const existingResponse = getResponseForRequirement(event.id, requirement.id);
        const ownParticipation = getOwnParticipationForRequirement(event.id, requirement.id);
        const participationId = getParticipationId(event.id);

        console.log('Event:', event);
        console.log('Requirement:', requirement);
        console.log('Existing response:', existingResponse);
        console.log('Own participation:', ownParticipation);
        console.log('Participation ID:', participationId);

        setSelectedEvent(event);
        setSelectedRequirement(requirement);
        setSelectedResponse(existingResponse || ownParticipation || null);
        setSelectedParticipationId(participationId);
        setIsEditMode(!!existingResponse && existingResponse.is_submitted);
        setModalOpen(true);
    };

    const handleModalSubmit = async (formData) => {
        try {
            let res;

            // If editing, append participation_id
            if (isEditMode && selectedParticipationId) {
                formData.append('participation_id', selectedParticipationId);
            }

            // Use the same POST endpoint for both create and update
            res = await api.post("/api/event/participation/submit-response/", formData);
            console.log('Submission response:', res.data);

            // Refresh data after submission
            await fetchEventsAndParticipations();

        } catch (error) {
            console.error('Error submitting:', error);
            throw error; // Re-throw to let modal handle the error
        }
    };

    const handleSubmitAll = async () => {
        setSubmitAllModalOpen(true);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto px-4 py-8">
            <div className="flex justify-end items-center mb-8">
                <Button
                    onClick={handleSubmitAll}
                    className="bg-blue hover:bg-blue/80 text-white py-2 px-4 rounded-lg"
                >
                    Submit All Requirements
                </Button>
            </div>

            <div className="flex flex-col gap-6">
                {events.map((event) =>
                    event.requirements?.map((requirement) => {
                        const isOverdue = isDeadlinePassed(requirement.deadline);
                        const isNearDeadline = isDeadlineNear(requirement.deadline);
                        const isSubmittingThis = submitting[`${event.id}-${requirement.id}`];
                        const response = getResponseForRequirement(event.id, requirement.id);
                        const ownParticipation = getOwnParticipationForRequirement(event.id, requirement.id);
                        const isSubmitted = response && response.is_submitted;
                        const canEdit = isSubmitted && !isOverdue;

                        return (
                            <Card
                                key={`${event.id}-${requirement.id}`}
                                className={`${isNearDeadline ? 'bg-red-50' : 'bg-blue/5'} border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300`}
                            >
                                <CardHeader className="pb-2">
                                    <div className="flex items-start justify-between gap-2">
                                        <div className="flex-1">
                                            <CardTitle onClick={() => navigate(`/user/event/${event.id}`)} className="text-lg font-semibold text-blue mb-1 hover:text-blue/80 cursor-pointer">
                                                {event.title}
                                            </CardTitle>
                                            <div className="flex items-center gap-2 mb-2 disabled">
                                                {isSubmitted && (
                                                    <Badge className="text-xs bg-green-100 text-green-700 border-green-200 ">
                                                        Submitted
                                                    </Badge>
                                                )}

                                            </div>
                                        </div>
                                        <p onClick={() => navigate(`/user/event/${event.id}`)} className='text-[14px] cursor-pointer hover:text-blue'>View Details</p>
                                    </div>
                                </CardHeader>

                                <CardContent className="pt-0 flex flex-col h-full ">
                                    <h4 className="font-medium text-gray-900 mb-2">
                                        {requirement.label}
                                    </h4>
                                    <p className="text-sm text-gray-600 mb-2">
                                        {requirement.description}
                                    </p>

                                    {requirement.deadline && (
                                        <div className={`flex items-center justify-between  gap-2  text-sm ${isNearDeadline
                                            ? 'text-red-600'
                                            : 'text-gray-500'
                                            }`}>
                                            <div className="flex gap-2 items-center">
                                                <Clock className="w-4 h-4" />
                                                <span>
                                                    Deadline: {new Date(requirement.deadline).toLocaleDateString('en-US', {
                                                        year: 'numeric',
                                                        month: 'short',
                                                        day: 'numeric',
                                                    })}
                                                </span>
                                            </div>

                                            <div className="mt-auto w-[100px] pt-4 ">
                                                <Button
                                                    onClick={() => handleSubmitClick(event, requirement)}
                                                    disabled={isSubmittingThis || isSubmitted || (isOverdue && !isSubmitted)}
                                                    className={`w-full font-medium transition-colors duration-200
        ${isSubmitted && canEdit
                                                            ? 'bg-blue hover:bg-blue/90'
                                                            : isSubmitted
                                                                ? 'bg-green-600 cursor-not-allowed'
                                                                : ownParticipation
                                                                    ? 'bg-yellow-600 hover:bg-yellow-700'
                                                                    : 'bg-blue hover:bg-blue/90'
                                                        } text-white`}
                                                >
                                                    {isSubmittingThis ? (
                                                        <>
                                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                                            {isSubmitted ? 'Updating...' : 'Submitting...'}
                                                        </>
                                                    ) : isSubmitted ? (
                                                        canEdit ? (
                                                            <>
                                                                <Edit className="w-4 h-4" />
                                                                <span className="ml-2">Edit</span>
                                                            </>
                                                        ) : (
                                                            <>✓ Submitted</>
                                                        )
                                                    ) : ownParticipation ? (
                                                        <>
                                                            <Edit className="w-4 h-4" />
                                                            <span className="ml-2">Continue Draft</span>
                                                        </>
                                                    ) : (
                                                        <>
                                                            {getTypeIcon(requirement.type)}
                                                            <span className="ml-2">Apply</span>
                                                        </>
                                                    )}
                                                </Button>

                                            </div>

                                        </div>
                                    )}

                                    {/* Show own participation data if available but not submitted */}
                                    {!isSubmitted && ownParticipation && (
                                        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3 mb-4 ">
                                            <a
                                                href={ownParticipation.file}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center text-yellow-600 text-xs mb-1 hover:underline"
                                            >
                                                <Eye className="w-4 h-4 mr-1" /> View File
                                            </a>
                                            {ownParticipation.value && (
                                                <p className="text-yellow-600 text-xs mb-1">
                                                    <strong>Text:</strong> {ownParticipation.value.length > 50
                                                        ? `${ownParticipation.value.substring(0, 50)}...`
                                                        : ownParticipation.value}
                                                </p>
                                            )}
                                            {ownParticipation.file && (
                                                <a
                                                    href={ownParticipation.file}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex items-center text-yellow-600 text-xs mb-1 hover:underline"
                                                >
                                                    <Eye className="w-4 h-4 mr-1" /> View File
                                                </a>
                                            )}
                                            <p className="text-yellow-600 text-xs">
                                                You have a saved draft for this requirement
                                            </p>
                                        </div>
                                    )}

                                    {isOverdue && !isSubmitted && (
                                        <div className=" rounded-md p-3 ">
                                            <p className="text-red-600 text-sm font-medium">
                                                ⚠️ This requirement deadline has passed
                                            </p>
                                        </div>
                                    )}


                                </CardContent>
                            </Card>
                        );
                    })
                )}
            </div>

            <SubmissionModal
                isOpen={modalOpen}
                onClose={() => {
                    setModalOpen(false);
                    setIsEditMode(false);
                    setSelectedResponse(null);
                    setSelectedParticipationId(null);
                }}
                event={selectedEvent}
                requirement={selectedRequirement}
                response={selectedResponse} // Pass existing response/participation for prefilling
                participationId={selectedParticipationId} // Pass participation ID for updates
                isEditMode={isEditMode}
                onSubmit={handleModalSubmit}
            />
            <SubmitAllModal
                isOpen={submitAllModalOpen}
                onClose={() => setSubmitAllModalOpen(false)}
                events={events}
                onRefresh={fetchEventsAndParticipations}
            />
        </div>
    );
};

export default RequirementCard;


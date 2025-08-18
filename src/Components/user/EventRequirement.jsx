import React, { useState, useEffect } from 'react';
import { Clock, FileText, Link, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import useAxiosAuth from '@/hooks/useAxiosAuth';
import SubmissionModal from './SubmissionModal';
import SubmitAllModal from './SubmitAllModal';
const RequirementCard = () => {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState({});
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [selectedRequirement, setSelectedRequirement] = useState(null);
    const [submitAllModalOpen, setSubmitAllModalOpen] = useState(false);
    const api = useAxiosAuth();

    useEffect(() => {
        const fetchEventsAndRequirements = async () => {
            try {
                setLoading(true);
                const res = await api.get("/api/event/active-events/");
                console.log('Events data:', res.data);
                setEvents(res.data);
            } catch (error) {
                console.error('Error fetching events:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchEventsAndRequirements();
    }, [api]);

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
        return diffInDays <= 3;
    };

    const handleSubmitClick = (event, requirement) => {
        setSelectedEvent(event);
        setSelectedRequirement(requirement);
        setModalOpen(true);
    };

   const handleModalSubmit = async (formData) => {
 const res= await api.post("/api/event/participation/submit-response/", formData);
 console.log(res.data);

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
        <div className="max-w-7xl mx-auto px-6 py-8">
            <div className="flex justify-end items-center mb-8">

                <Button
                    onClick={handleSubmitAll}
                    className="bg-blue hover:bg-blue/80 text-white py-2 px-4 rounded-lg"
                >
                    Submit All Requirements
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {events.map((event) =>
                    event.requirements?.map((requirement) => {
                        const isOverdue = requirement.deadline && new Date(requirement.deadline) < new Date();
                        const isSubmittingThis = submitting[`${event.id}-${requirement.id}`];
                        const isSubmitted = requirement.submitted;

                        return (
                            <Card
                                key={`${event.id}-${requirement.id}`}
                                className="bg-white border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300"
                            >
                                <CardHeader className="pb-3">
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex-1">
                                            <CardTitle className="text-lg font-semibold text-gray-900 mb-1">
                                                {event.title}
                                            </CardTitle>
                                            <div className="flex items-center gap-2 mb-2">
                                                <Badge
                                                    variant="secondary"
                                                    className={`${getTypeColor(requirement.type)} flex items-center gap-1`}
                                                >
                                                    {getTypeIcon(requirement.type)}
                                                    {requirement.type}
                                                </Badge>
                                                {isSubmitted && (
                                                    <Badge className="text-xs bg-green-100 text-green-700 border-green-200">
                                                        Submitted
                                                    </Badge>
                                                )}
                                            </div>
                                        </div>
                                        <img
                                            src={event.icon}
                                            alt={event.title}
                                            className="w-12 h-12 rounded-lg object-cover"
                                            onError={(e) => {
                                                e.currentTarget.src = 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=100&h=100&fit=crop';
                                            }}
                                        />
                                    </div>
                                </CardHeader>

                                <CardContent className="pt-0">
                                    <h4 className="font-medium text-gray-900 mb-2">
                                        {requirement.label}
                                    </h4>
                                    <p className="text-sm text-gray-600 mb-4">
                                        {requirement.description}
                                    </p>

                                    {requirement.deadline && (
                                        <div className={`flex items-center gap-2 mb-4 text-sm ${isDeadlineNear(requirement.deadline)
                                                ? 'text-red-600'
                                                : 'text-gray-500'
                                            }`}>
                                            <Clock className="w-4 h-4" />
                                            <span>
                                                Deadline: {new Date(requirement.deadline).toLocaleDateString('en-US', {
                                                    year: 'numeric',
                                                    month: 'short',
                                                    day: 'numeric',
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                })}
                                            </span>
                                            {/* {isDeadlineNear(requirement.deadline) && (
                                                <Badge className="text-xs ml-auto bg-red-100 text-red-700 border-red-200">
                                                    Urgent
                                                </Badge>
                                            )} */}
                                        </div>
                                    )}

                                    {isOverdue && (
                                        <div className="bg-red-50 border border-red-200 rounded-md p-3 mb-4">
                                            <p className="text-red-600 text-sm font-medium">
                                                ⚠️ This requirement deadline has passed
                                            </p>
                                        </div>
                                    )}

                                    <Button
                                        onClick={() => handleSubmitClick(event, requirement)}
                                        disabled={isSubmittingThis || isOverdue || isSubmitted}
                                        className={`w-full font-medium transition-colors duration-200 ${isSubmitted
                                                ? 'bg-green-600 hover:bg-green-700'
                                                : 'bg-blue hover:bg-blue-700'
                                            } text-white`}
                                    >
                                        {isSubmittingThis ? (
                                            <>
                                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                                Submitting...
                                            </>
                                        ) : isSubmitted ? (
                                            <>
                                                ✓ Submitted
                                            </>
                                        ) : (
                                            <>
                                                {getTypeIcon(requirement.type)}
                                                <span className="ml-2">Apply {requirement.label}</span>
                                            </>
                                        )}
                                    </Button>
                                </CardContent>
                            </Card>
                        );
                    })
                )}
            </div>

            <SubmissionModal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                event={selectedEvent}
                requirement={selectedRequirement}
                onSubmit={handleModalSubmit}
            />
            <SubmitAllModal
                isOpen={submitAllModalOpen}
                onClose={() => setSubmitAllModalOpen(false)}
                events={events}
                onRefresh={() => {
                    // Refresh the events data after bulk submission
                    const fetchEventsAndRequirements = async () => {
                        try {
                            const res = await api.get("/api/event/active-events/");
                            setEvents(res.data);
                        } catch (error) {
                            console.error('Error refreshing events:', error);
                        }
                    };
                    fetchEventsAndRequirements();
                }}
            />
        </div>
    );
};

export default RequirementCard;
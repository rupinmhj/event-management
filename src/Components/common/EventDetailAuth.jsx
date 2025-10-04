import React, { useState, useEffect, useContext } from 'react';
import { ChevronLeft, Calendar, MapPin, CheckCircle, Circle, Tag, Hourglass, Shield } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import AuthContext from '@/context/AuthContext';
import useAxiosAuth from '@/hooks/useAxiosAuth';
import Navbar from './Navbar'
import { toast, ToastContainer } from 'react-toastify'
const EventDetailAuth = ({ eventId }) => {
    // Simplified state management - removed duplicate loading states
    const [event, setEvent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [applying, setApplying] = useState(false);
    const [ownParticipationLength, setOwnParticipationLength] = useState(0);
    const [ownParticipationData, setOwnParticipationData] = useState([]);

    const { id } = useParams();
    const { authTokens, authReady } = useContext(AuthContext);
    const api = useAxiosAuth();
    const navigate = useNavigate();

    useEffect(() => {
        const fetchEvent = async () => {
            try {
                setLoading(true);
                setError(null);


                const res = await api.get(`/api/event/get-event-detail/${id}/`);
                const data = res.data;
                console.log('Event details', data);
                setEvent(data);



            } catch (error) {
                console.error("Error fetching event:", error);
                setError("Failed to load event details");
            } finally {
                setLoading(false); // This was missing!
            }
        };

        if (id) {
            fetchEvent();
        }
    }, [id, authTokens, authReady, api]);

    useEffect(() => {
        window.scrollTo({ top: 0, behavior: "smooth" });
    }, [eventId]);

    const handleStartApplication = () => {
        toast.info('Please sign in first !');
        setTimeout(() => navigate("/"), 1000);
    };


    const handleBackToEvents = () => {
        window.history.back();
    };

    const handleContactOrganizer = async () => {
        try {
            console.log('Contacting organizer...');
        } catch (err) {
            console.error('Error contacting organizer:', err);
        }
    };

    // Utility functions - updated to use 'event' instead of 'eventData'
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
            timeZone: "UTC",
        });
    };

    const calculateSpotsRemaining = () => {
        if (!event) return 0;
        return event.max_capacity - event.registered;
    };

    const calculateProgress = () => {
        if (!event) return 0;
        return (event.registered / event.max_capacity) * 100;
    };

    const isDeadlinePassed = () => {
        if (!event) return false;
        return new Date() > new Date(event.application_deadline);
    };

    // Helper function to check if a requirement is completed by the user
    const isRequirementCompleted = (requirementId) => {
        const participation = ownParticipationData.find(p => p.requirement_id === requirementId);
        if (!participation) return false;

        // Check if the requirement has a value based on its type
        switch (participation.type) {
            case 'FILE':
                // For files, check multiple possible fields where file data might be stored
                return (
                    (participation.value !== null && participation.value !== '') ||
                    (participation.file_url !== null && participation.file_url !== '') ||
                    (participation.file_path !== null && participation.file_path !== '') ||
                    (participation.file_name !== null && participation.file_name !== '') ||
                    (participation.uploaded_file !== null && participation.uploaded_file !== '')
                );
            case 'TEXT':
            case 'TEXTAREA':
            case 'URL':
                return participation.value !== null && participation.value.trim() !== '';
            default:
                return participation.value !== null && participation.value !== '';
        }
    };

    // Helper function to get participation data for a requirement
    const getParticipationData = (requirementId) => {
        return ownParticipationData.find(p => p.requirement_id === requirementId);
    };

    // Helper function to render requirement status
    const renderRequirementIcon = (requirement) => {
        const isCompleted = isRequirementCompleted(requirement.id);
        if (isCompleted) {
            return <CheckCircle className="w-6 h-6 text-green-500" />;
        } else {
            return <Circle className="w-6 h-6 text-gray-400" />;
        }
    };

    // Helper function to render verification badge
    const renderVerificationBadge = (requirement) => {
        const isCompleted = isRequirementCompleted(requirement.id);
        const participationData = getParticipationData(requirement.id);

        if (isCompleted && requirement.is_verification_required) {
            // Check if the submission is verified (you might need to add this field to your API response)
            const isVerified = participationData?.is_verified || false;
            return (
                <span className={`inline-flex items-center ml-2 px-2 py-1 rounded-full text-xs font-medium ${isVerified
                    ? 'bg-green-100 text-green-800'
                    : 'bg-yellow-100 text-yellow-800'
                    }`}>
                    <Shield className="w-3 h-3 mr-1" />
                    {isVerified ? 'Verified' : 'Pending Verification'}
                </span>
            );
        } else if (requirement.is_verification_required && !isCompleted) {
            return (
                <span className="inline-flex items-center ml-2 px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                    <Shield className="w-3 h-3 mr-1" />
                    Verification Required
                </span>
            );
        }
        return null;
    };

    // Calculate completion stats
    const getCompletionStats = () => {
        if (!event.requirements) return { completed: 0, total: 0, percentage: 0 };

        const completed = event.requirements.filter(req => isRequirementCompleted(req.id)).length;
        const total = event.requirements.length;
        const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

        return { completed, total, percentage };
    };

    // Loading state
    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading event details...</p>
                </div>
            </div>
        );
    }

    // Error state - updated to check 'event' instead of 'eventData'
    if (error || !event) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="text-red-600 text-xl mb-4">{error || 'Event not found'}</div>
                    <button
                        onClick={handleBackToEvents}
                        className="text-purple-600 hover:text-purple-700"
                    >
                        ← Back to Events
                    </button>
                </div>
            </div>
        );
    }

    const completionStats = getCompletionStats();

    return (
        <div className="">
            <Navbar />
            <div className="min-h-screen bg-gray-50 px-4 md:px-12 lg:px-16 pt-8 pb-4">
                <div className="max-w-7xl mx-auto">
                    {/* Header */}
                    <div className="flex items-center mb-6">
                        <button
                            onClick={handleBackToEvents}
                            className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
                        >
                            <ChevronLeft className="w-5 h-5 mr-2" />
                            Back to Events
                        </button>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 ">
                        {/* Main Content */}
                        <div className="lg:col-span-2">
                            {/* Title */}
                            <h1 className="text-3xl font-bold text-gray-900 mb-6 ">
                                {event.title}
                            </h1>

                            {/* Event Details */}
                            <div className="flex flex-wrap items-center gap-6 mb-8 text-gray-600">
                                <div className="flex items-center">
                                    <Calendar className="w-5 h-5 mr-2" />
                                    {formatDate(event.start_date)}
                                </div>
                                <div className="flex items-center">
                                    <MapPin className="w-5 h-5 mr-2" />
                                    {event.location}
                                </div>
                                <div className="flex items-center">
                                    <Tag className="w-5 h-5 mr-2" />
                                    {event.event_type}
                                </div>
                                <div className="flex items-center">
                                    <Hourglass className="w-5 h-5 mr-2" />
                                    {event.duration}
                                </div>
                            </div>

                            {/* About Section */}
                            <section className="mb-8">
                                <h2 className="text-2xl font-bold text-gray-900 mb-4">About This Event</h2>
                                <p className="text-gray-700 leading-relaxed">
                                    {event.description}
                                </p>
                            </section>

                            {/* Submission Requirements */}
                            <section>
                                <div className="flex items-center justify-between mb-4">
                                    <h2 className="text-2xl font-bold text-gray-900">
                                        Submission Requirements
                                    </h2>
                                    {completionStats.total > 0 && (
                                        <div className="text-sm text-gray-600">
                                            {completionStats.completed}/{completionStats.total} completed ({completionStats.percentage}%)
                                        </div>
                                    )}
                                </div>

                                <p className="text-gray-600 mb-6">
                                    Ensure the requirements listed below are filled or uploaded as needed. Mandatory fields are indicated with an asterisk (*).
                                </p>

                                {/* Progress Bar */}
                                {completionStats.total > 0 && (
                                    <div className="w-full bg-gray-200 rounded-full h-2 mb-6">
                                        <div
                                            className="bg-green-500 h-2 rounded-full transition-all duration-500"
                                            style={{ width: `${completionStats.percentage}%` }}
                                        ></div>
                                    </div>
                                )}

                                <div className="space-y-4">
                                    {event.requirements?.map((requirement) => {
                                        const isCompleted = isRequirementCompleted(requirement.id);
                                        const participationData = getParticipationData(requirement.id);

                                        return (
                                            <div key={requirement.id} className="flex items-start p-3 rounded-lg border border-gray-200 bg-white">
                                                <div className="mr-4 mt-0.5 flex-shrink-0">
                                                    {renderRequirementIcon(requirement)}
                                                </div>
                                                <div className="flex-1">
                                                    <div className="flex items-center flex-wrap">
                                                        <span className={`${isCompleted ? 'text-gray-500 line-through' : 'text-gray-700'
                                                            }`}>
                                                            {requirement.label}
                                                        </span>
                                                        {requirement.is_required && (
                                                            <span className="text-red-500 ml-1">*</span>
                                                        )}
                                                        {renderVerificationBadge(requirement)}
                                                    </div>
                                                    {requirement.description && (
                                                        <p className="text-sm text-gray-500 mt-1">
                                                            {requirement.description}
                                                        </p>
                                                    )}
                                                    {/* Show current value if completed */}
                                                    {isCompleted && participationData && (
                                                        <div className="mt-2 text-sm text-gray-600">
                                                            {participationData.type === 'FILE' ? (
                                                                <span className="text-green-600">✓ File uploaded</span>
                                                            ) : participationData.type === 'URL' ? (
                                                                <span className="text-blue-600">🔗 {participationData.value}</span>
                                                            ) : (
                                                                <div className="bg-gray-50 p-2 rounded text-xs">
                                                                    {participationData.type === 'TEXTAREA'
                                                                        ? <div dangerouslySetInnerHTML={{ __html: participationData.value }} />
                                                                        : participationData.value
                                                                    }
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </section>
                        </div>

                        {/* Sidebar */}
                        <div className="lg:col-span-1">
                            {/* Apply Now Card */}
                            <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
                                <h3 className="text-xl font-bold text-gray-900 mb-4">Apply Now</h3>

                                <div className="text-center mb-4">
                                    <div className="text-4xl font-bold text-purple-600 mb-1">
                                        { }
                                    </div>
                                    <div className="text-gray-600 text-sm">spots remaining</div>
                                </div>

                                <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
                                    <div
                                        className="bg-purple-600 h-2 rounded-full transition-all duration-500"
                                        style={{ width: `${calculateProgress()}%` }}
                                    ></div>
                                </div>

                                {/* Requirements Completion Status */}
                                {completionStats.total > 0 && (
                                    <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-gray-600">Requirements:</span>
                                            <span className={`font-medium ${completionStats.percentage === 100 ? 'text-green-600' : 'text-gray-700'}`}>
                                                {completionStats.completed}/{completionStats.total}
                                            </span>
                                        </div>
                                    </div>
                                )}

                                <button
                                    onClick={handleStartApplication}
                                    disabled={applying || isDeadlinePassed() || calculateSpotsRemaining() <= 0}
                                    className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${applying || isDeadlinePassed() || calculateSpotsRemaining() <= 0
                                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                        : 'bg-purple-600 text-white hover:bg-purple-700'
                                        }`}
                                >
                                    {applying ? 'Starting...' :
                                        isDeadlinePassed() ? 'Deadline Passed' :
                                            calculateSpotsRemaining() <= 0 ? 'Event Full' :
                                                ownParticipationLength >= 1 ? 'Continue Application' : 'Start Application'}
                                </button>
                            </div>

                            {/* Event Organizer Card */}
                            <div className="bg-white rounded-lg shadow-sm border p-6">
                                <h3 className="text-xl font-bold text-gray-900 mb-4">Event Organizer</h3>
                                {console.log(event)}
                                <div className="flex items-start mb-4">
                                    <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold mr-4 flex-shrink-0">
                                        {event.organizer?.avatar || event.organizer?.name?.charAt(0) || 'O'}
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="font-semibold text-gray-900">{event.organizer?.name || 'Event Organizer'}</h4>
                                        <p className="text-gray-600 text-sm">{event.organizer?.role}</p>
                                    </div>
                                </div>

                                <p className="text-gray-700 text-sm mb-4">
                                    {event.organizer?.description}
                                </p>

                                {event.organizer?.contactable && (
                                    <button
                                        onClick={handleContactOrganizer}
                                        className="w-full border border-gray-300 text-gray-700 py-2 px-4 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                                    >
                                        Contact Organizer
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <ToastContainer />
        </div>

    );
};

export default EventDetailAuth;
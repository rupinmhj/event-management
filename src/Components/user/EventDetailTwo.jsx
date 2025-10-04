import React, { useState, useEffect, useContext } from 'react';
import { ChevronLeft, Calendar, MapPin, Users, Clock, AlertTriangle, CheckCircle, Circle, Tag, Hourglass, Shield, XCircle, MessageSquare, X, Phone, Mail } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import AuthContext from '@/context/AuthContext';
import useAxiosAuth from '@/hooks/useAxiosAuth';

const EventDetailTwo = ({ eventId }) => {
    const [event, setEvent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [applying, setApplying] = useState(false);
    const [ownParticipationLength, setOwnParticipationLength] = useState(0);
    const [ownParticipationData, setOwnParticipationData] = useState([]);
    const [organizationDetail, setOrganizationDetail] = useState();
    const [remarksModal, setRemarksModal] = useState({ isOpen: false, requirement: null, remarks: '' });

    const { id } = useParams();
    const { authTokens, authReady } = useContext(AuthContext);
    const api = useAxiosAuth();
    const navigate = useNavigate();

    const isDeadlinePassed = (date) => {
        const deadline = new Date(date);
        const now = new Date();
        return now > deadline;
    };

    useEffect(() => {
        const fetchEvent = async () => {
            try {
                setLoading(true);
                setError(null);

                if (!authTokens && !authReady) return;

                const res = await api.get(`/api/event/get-event-detail/${id}/`);
                const data = res.data;
                console.log('-----Event details----', data);
                setEvent(data);

                const ownParticipationRes = await api.get(`/api/event/own-participation-list/?event=${id}`);
                const participationResponses = ownParticipationRes.data[0]?.responses || [];
                setOwnParticipationLength(participationResponses.length);
                setOwnParticipationData(participationResponses);
                console.log('-----ownParticipation----', participationResponses);

                const organizationDetail = await api.get('/api/account/get-organization-detail/');
                console.log('organizationDetail-------', organizationDetail);
                setOrganizationDetail(organizationDetail.data[0]);

            } catch (error) {
                console.error("Error fetching event:", error);
                setError("Failed to load event details");
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchEvent();
        }
    }, [id, authTokens, authReady, api]);

    useEffect(() => {
        window.scrollTo({ top: 0, behavior: "smooth" });
    }, [eventId]);

    const handleStartApplication = async () => {
        setApplying(true);
        await navigate(`/user/event/submit/${id}/`)
    };

    const handleBackToEvents = () => {
        window.history.back();
    };

    const openRemarksModal = (requirement, remarks) => {
        setRemarksModal({
            isOpen: true,
            requirement,
            remarks
        });
    };

    const closeRemarksModal = () => {
        setRemarksModal({ isOpen: false, requirement: null, remarks: '' });
    };

    const formatDate = (dateString) => {
        console.log('dateString', dateString);
        const date = new Date(dateString);

        const nepalOffset = 5 * 60 + 45;
        const utc = date.getTime() + date.getTimezoneOffset() * 60000;
        const nepalTime = new Date(utc + nepalOffset * 60 * 1000);

        return nepalTime.toLocaleString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            hour12: true
        });
    };

    const calculateSpotsRemaining = () => {
        if (!event) return 0;
        return event.max_capacity - event.registered;
    };

    const isRequirementCompleted = (requirementId) => {
        const participation = ownParticipationData.find(p => p.requirement_id === requirementId);
        if (!participation) return false;

        return participation.is_submitted === true;
    };

    const getParticipationData = (requirementId) => {
        return ownParticipationData.find(p => p.requirement_id === requirementId);
    };

    const renderRequirementIcon = (requirement) => {
        const isCompleted = isRequirementCompleted(requirement.id);
        const participationData = getParticipationData(requirement.id);

        if (isCompleted) {
            if (participationData?.status === 'verified') {
                return <CheckCircle className="w-6 h-6 text-green-500" />;
            } else if (participationData?.status === 'rejected') {
                return <XCircle className="w-6 h-6 text-red-500" />;
            } else {
                return <Clock className="w-6 h-6 text-yellow-500" />;
            }
        } else {
            return <Circle className="w-6 h-6 text-gray-400" />;
        }
    };

    const renderVerificationBadge = (requirement) => {
        const isCompleted = isRequirementCompleted(requirement.id);
        const participationData = getParticipationData(requirement.id);

        if (isCompleted && requirement.is_verification_required) {
            switch (participationData?.status) {
                case 'verified':
                    return (
                        <span className="inline-flex items-center ml-2 px-2 py-1 rounded-full text-xs font-medium  text-green-800">
                            <Shield className="w-3 h-3 mr-1" />
                            Verified
                        </span>
                    );
                case 'rejected':
                    return (
                        <div className="inline-flex items-center ml-2">
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium  text-red-800">
                                <XCircle className="w-3 h-3 mr-1" />
                                Rejected
                            </span>
                            {participationData.remarks && (
                                <button
                                    onClick={() => openRemarksModal(requirement, participationData.remarks)}
                                    className="ml-1 p-1 text-[10px] text-white rounded-xl"
                                    title="View rejection remarks"
                                >
                                    {/* <MessageSquare className="w-3 h-3" /> */}
                                    <button className=' bg-blue/70 hover-blue/60 px-2 py-1 rounded'>Show remarks</button>
                                </button>
                            )}
                        </div>
                    );
                case 'submitted':
                default:
                    return (
                        <span className="inline-flex items-center ml-2 px-2 py-1 rounded-full text-xs font-medium  text-yellow-800">
                            <Clock className="w-3 h-3 mr-1" />
                            Pending Verification
                        </span>
                    );
            }
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

    const getCompletionStats = () => {
        if (!event.requirements) return { completed: 0, total: 0, percentage: 0 };

        const completed = event.requirements.filter(req => isRequirementCompleted(req.id)).length;
        const total = event.requirements.length;
        const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

        return { completed, total, percentage };
    };

    const RemarksModal = () => {
        if (!remarksModal.isOpen) return null;

        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center">
                {/* Backdrop */}
                <div
                    className="fixed inset-0 bg-black bg-opacity-50"
                    onClick={closeRemarksModal}
                />

                {/* Modal Content */}
                <div className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[80vh] flex flex-col">
                    {/* Header */}
                    <div className="flex items-center justify-between p-4 border-b">
                        <h3 className="text-lg font-semibold text-red-600">Rejection Remarks</h3>
                        <button
                            onClick={closeRemarksModal}
                            className="text-gray-400 hover:text-gray-600"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-y-auto p-4">
                        {/* <div className="mb-4 ">
                            <h4 className="font-medium text-gray-900 mb-2">
                                {remarksModal.requirement?.label}
                            </h4>
                            <p className="text-sm text-gray-600 mb-4">
                                {remarksModal.requirement?.description}
                            </p>
                        </div> */}

                        <div className="bg-red-50 border border-red-200 rounded-md p-4 ">
                            <div className="flex items-start gap-3 ">
                                <MessageSquare className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                                <div>
                                    <h5 className="text-sm font-medium text-red-800 mb-2">Admin Feedback:</h5>
                                    <p className="text-sm text-red-700 leading-relaxed">
                                        {remarksModal.remarks}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="flex justify-end p-4 border-t gap-2">
                        <button
                            onClick={closeRemarksModal}
                            className="px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
                        >
                            Close
                        </button>
                        <button
                            onClick={() => {
                                closeRemarksModal();
                                navigate(`/user/event/submit/${id}/`);
                            }}
                            className="px-4 py-2 bg-blue text-white rounded hover:bg-blue/80 transition-colors"
                        >
                            Update Submission
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading event details...</p>
                </div>
            </div>
        );
    }

    if (error || !event) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="text-red-600 text-xl max-md:text-lg mb-4">{error || 'Event not found'}</div>
                    <button
                        onClick={handleBackToEvents}
                        className="text-purple-600 max-md:text-[14px] hover:text-purple-700"
                    >
                        ← Back to Events
                    </button>
                </div>
            </div>
        );
    }

    const completionStats = getCompletionStats();

    return (
        <div className="min-h-screen  px-4 md:px-12 lg:px-16 pt-8 pb-4">
            <div className="max-w-7xl mx-auto max-md:px-2">
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

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content */}

                    <div className="lg:col-span-2">
                        <h1 className="text-3xl max-md:text-xl font-bold text-blue/95 mb-6">
                            {event.title}
                        </h1>

                        {/* Event Details */}
                        <div className="flex flex-wrap items-center gap-6 max-md:gap-4 mb-8 text-gray-600 max-md:text-[13px]">
                            <div className="flex items-center">
                                <Calendar className="w-5 h-5 max-md:w-3 max-md:h-3 mr-2" />
                                {formatDate(event.start_date)}
                            </div>
                            <div className="flex items-center">
                                <MapPin className="w-5 h-5 mr-2 max-md:w-3 max-md:h-3" />
                                {event.location}
                            </div>
                            <div className="flex items-center">
                                <Tag className="w-5 h-5 mr-2 max-md:w-3 max-md:h-3" />
                                {event.event_type}
                            </div>
                            <div className="flex items-center">
                                <Hourglass className="w-5 h-5 mr-2 max-md:w-3 max-md:h-3" />
                                {event.duration}
                            </div>
                        </div>

                        {/* About Section */}
                        <section className="mb-8">
                            <h2 className="text-2xl max-md:text-xl font-bold text-blue/80 mb-4">About This Event</h2>
                            <p className="text-gray-700 leading-relaxed max-md:text-[14px]">
                                {event.description}
                            </p>
                        </section>

                        {/* Submission Requirements */}
                        <section>
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-2xl max-md:text-xl font-bold text-blue/80">
                                    Submission Requirements
                                </h2>
                            </div>

                            <p className="text-gray-600 mb-6 max-md:text-[13px]">
                                Ensure the requirements listed below are filled or uploaded as needed. Mandatory fields are indicated with an asterisk (*).
                            </p>

                            {/* Progress Bar */}
                            {completionStats.total > 0 && (
                                <div className="w-full  rounded-full h-2 mb-6">
                                    <div
                                        className="bg-green-500 h-2 rounded-full transition-all duration-500"
                                        style={{ width: `${completionStats.percentage}%` }}
                                    ></div>
                                </div>
                            )}

                            <div className="space-y-4 ">
                                {event.requirements?.map((requirement) => {
                                    const isCompleted = isRequirementCompleted(requirement.id);
                                    const participationData = getParticipationData(requirement.id);

                                    return (
                                        <div key={requirement.id} className="flex items-start p-3 md:p-4 rounded-lg border border-gray-400 bg-black/10 ">

                                            <div className="flex-1 pl-2">
                                                <div className="flex items-center flex-wrap max-md:text-[13px]">
                                                    <span className={`${isCompleted ? 'text-gray-500' : 'text-gray-700'}`}>
                                                        {requirement.label}
                                                    </span>
                                                    {requirement.is_required && (
                                                        <span className="text-red-500 ml-1">*</span>
                                                    )}
                                                    {renderVerificationBadge(requirement)}
                                                </div>
                                                {requirement.description && (
                                                    <p className="text-sm max-md:text-[12px] text-gray-500 mt-1">
                                                        {requirement.description}
                                                    </p>
                                                )}
                                                {/* Show current value if completed */}
                                                {isCompleted && participationData && (
                                                    <div className="mt-2 text-sm text-gray-600">
                                                        {participationData.type === 'FILE' ? (
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-green-600">File uploaded</span>
                                                                {participationData.file && (
                                                                    <button
                                                                        onClick={() => window.open(participationData.file, '_blank')}
                                                                        className="px-2  text-[10px] bg-blue/70 text-white rounded hover:bg-blue/70 transition-colors"
                                                                    >
                                                                        View File
                                                                    </button>
                                                                )}
                                                            </div>
                                                        ) : participationData.type === 'URL' ? (
                                                            <span className="text-blue-600 max-md:text-[13px]">🔗 {participationData.value}</span>
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
                        {!isDeadlinePassed(event.start_date) && (
                            <div className="bg-white/40 rounded-lg shadow-sm border p-6 mb-6">
                                <h3 className="text-xl max-md:text-lg font-bold text-gray-900 mb-4">Apply Now</h3>

                                <div className="text-center mb-4">
                                    <div className="text-4xl max-md:text-2xl font-bold text-blue/60 mb-1">
                                        {event.remaining_seat || 0} / {event.number_of_seat}
                                    </div>
                                    <div className="text-gray-600 text-sm">spots remaining</div>
                                </div>

                                {/* Requirements Completion Status */}
                                {completionStats.total > 0 && (
                                    <div className="mb-4 p-3 rounded-lg">
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-gray-600">Requirements:</span>
                                            <span className={`font-medium ${completionStats.percentage === 100 ? 'text-green-600' : 'text-gray-700'}`}>
                                                {completionStats.completed}/{completionStats.total}
                                            </span>
                                        </div>
                                    </div>
                                )}

                                {!isDeadlinePassed(event.start_date) && (
                                    <button
                                        onClick={handleStartApplication}
                                        disabled={applying || calculateSpotsRemaining() <= 0}
                                        className={`w-full max-md:text-[14px] py-3 px-4 rounded-lg font-medium transition-colors ${applying || calculateSpotsRemaining() <= 0
                                            ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                                            : "bg-blue text-white hover:bg-blue/80"
                                            }`}
                                    >
                                        {applying
                                            ? "Starting..."
                                            : calculateSpotsRemaining() <= 0
                                                ? "Event Full"
                                                : ownParticipationLength >= 1
                                                    ? "Continue Application"
                                                    : "Start Application"}
                                    </button>
                                )}
                            </div>
                        )}

                        {/* Event Organizer Card */}
                        <div className="bg-white/40 rounded-lg shadow-sm border p-6">
                            <h3 className="text-xl font-bold text-gray-900 mb-4">Event Organizer</h3>

                            <div className="flex items-start mb-4">
                                <div className="flex-1">
                                    <h4 className="font-semibold text-gray-900">
                                        {organizationDetail?.name || 'Event Organizer'}
                                    </h4>
                                    <p className="text-gray-600 text-sm">
                                        {event.organizer?.role || 'Organizer'}
                                    </p>
                                </div>
                            </div>

                            <p className="text-gray-700 text-sm mb-4">
                                {organizationDetail?.description || 'No description available.'}
                            </p>


                            <div className="space-y-2">
                                {organizationDetail?.phone_number && (
                                    <button
                                        // onClick={() => window.open(`tel:${organizationDetail.phone_number}`, "_self")}
                                        className="flex items-center  gap-4 w-full border border-gray-300 text-gray-700 py-2 px-4 rounded-lg font-medium text-center hover:bg-gray-50 transition-colors"
                                    >
                                        <Phone className="w-5 h-5" />
                                        {organizationDetail.phone_number}
                                    </button>
                                )}
                                {organizationDetail?.email && (
                                    <button
                                        // onClick={() => window.open(`mailto:${organizationDetail.email}`, "_self")}
                                        className="flex items-center  gap-4 w-full border border-gray-300 text-gray-700 py-2 px-4 rounded-lg font-medium text-center hover:bg-gray-50 transition-colors"
                                    >
                                        <Mail className="w-5 h-5" />
                                        {organizationDetail.email}
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Remarks Modal */}
            <RemarksModal />
        </div>
    );
};

export default EventDetailTwo;
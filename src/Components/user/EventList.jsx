import { useContext, useDebugValue, useEffect, useState } from "react";
import { Card, CardContent, CardFooter, CardHeader } from "@/Components/ui/card";
import { Button } from "@/Components/ui/button";
import { Badge } from "@/Components/ui/badge";
import { Input } from "@/Components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/Components/ui/select";
import AuthContext from "@/context/AuthContext";
import useAxiosAuth from "@/hooks/useAxiosAuth";
import { MdRemoveRedEye } from "react-icons/md";
import {
    Calendar,
    MapPin,
    Clock,
    DollarSign,
    Users,
    Search,
    Filter,
    ChevronLeft,
    ChevronRight,
    Image as ImageIcon,
    Globe,
    Building,
    UserPlus,
    ExternalLink,
    CheckCircle,
    XCircle

} from "lucide-react";
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

export default function ParticipantEventList() {
    const navigate = useNavigate();
    const [events, setEvents] = useState([]);
    const [filteredEvents, setFilteredEvents] = useState([]);
    const [ownParticipations, setOwnParticipations] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [eventsPerPage] = useState(500);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterType, setFilterType] = useState("all");
    const [filterPayment, setFilterPayment] = useState("all");
    const has_profile = localStorage.getItem('has_profile');
    const api = useAxiosAuth();
    const { authTokens, authReady } = useContext(AuthContext);

    // Check if user has submitted requirements for an event
    const hasSubmittedRequirements = (eventId) => {
        const participation = ownParticipations.find(p => p.event === eventId);
        return participation && participation.responses && participation.responses.length > 0;
    };
    const isParticipantEvent = (eventId) => {
        const participation = ownParticipations.find(p => p.event === eventId);
        console.log('--participation--', participation);
        return participation && participation?.id;
    }

    // Check if all required requirements are submitted
    const areAllRequirementsSubmitted = (eventId) => {
        const participation = ownParticipations.find(p => p.event === eventId);
        if (!participation) return false;

        const event = events.find(e => e.id === eventId);
        if (!event || !event.requirements) return false;

        const requiredCount = event.requirements.length;
        const submittedCount = participation.responses ? participation.responses.length : 0;
        console.log('----requiredCount---submittedCount', requiredCount, submittedCount, eventId);
        return requiredCount > 0 && submittedCount >= requiredCount;

    };

    // Get participation status for an event
    const getParticipationStatus = (eventId) => {
        const participation = ownParticipations.find(p => p.event === eventId);
        if (!participation) return { status: 'not_applied', hasResponses: false };

        const hasResponses = participation.responses && participation.responses.length > 0;
        const event = events.find(e => e.id === eventId);

        if (hasResponses && event && event.requirements) {
            const requiredCount = event.requirements.filter(req => req.is_required).length;
            const submittedCount = participation.responses.length;

            if (requiredCount > 0 && submittedCount >= requiredCount) {
                return { status: 'requirements_complete', hasResponses: true };
            } else {
                return { status: 'requirements_partial', hasResponses: true };
            }
        }

        return { status: 'applied_no_requirements', hasResponses: false };
    };

    // Fetch events (only active events for participants)
    useEffect(() => {
        const fetchEvents = async () => {
            try {
                setIsLoading(true);
                if (!authTokens && !authReady) return;

                const res = await api.get("/api/event/active-events/");
                const data = res.data;
                console.log('Event list', data);

                const ownParticipationRes = await api.get(`/api/event/own-participation-list/`);
                console.log('----ownParticipationRes----', ownParticipationRes.data);

                // Store own participations
                setOwnParticipations(ownParticipationRes.data || []);

                // Filter only active events for participants
                const activeEvents = data.filter(event => event.is_active);
                const sortedEvents = activeEvents.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

                setEvents(sortedEvents);
                setFilteredEvents(sortedEvents);
            } catch (error) {
                console.error("Error fetching events:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchEvents();
    }, [authTokens, authReady, api]);

    //handle apply
    const handleApply = (id) => {
        // console.log('has_profile', has_profile);
        // if (has_profile == 'false' || has_profile == 'undefined') {
        //     toast.error('Setup the profile first!!')
        //     setTimeout(() => navigate('/user/setup-profile/'), 1000)

        //     return;
        // } else
        navigate(`/user/event/submit/${id}`)
    }

    // Filter and search logic
    useEffect(() => {
        let filtered = events;
        window.scrollTo(0, 0);
        // Search filter
        if (searchTerm) {
            filtered = filtered.filter(event =>
                event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                event.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
                event.description?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // Event type filter
        if (filterType !== "all") {
            filtered = filtered.filter(event => event.event_type === filterType);
        }

        // Payment filter
        if (filterPayment !== "all") {
            const isPaid = filterPayment === "paid";
            filtered = filtered.filter(event => event.is_payment_required === isPaid);
        }

        setFilteredEvents(filtered);
        setCurrentPage(1); // Reset to first page when filtering
    }, [events, searchTerm, filterType, filterPayment]);

    // Pagination logic
    const indexOfLastEvent = currentPage * eventsPerPage;
    const indexOfFirstEvent = indexOfLastEvent - eventsPerPage;
    const currentEvents = filteredEvents.slice(indexOfFirstEvent, indexOfLastEvent);
    const totalPages = Math.ceil(filteredEvents.length / eventsPerPage);

    const handleView = (id) => {

        navigate(`/user/event-detail/${id}`)
    }

    const handleJoinEvent = (eventId) => {
        // Handle event registration/join logic
        navigate(`/participant/event/join/${eventId}`);
    }

    // Format date
    const formatDate = (dateString) => {
        console.log('dateString', dateString)
        const date = new Date(dateString);

        // Nepal timezone offset in minutes (+5:45 = 345 minutes)
        const nepalOffset = 5 * 60 + 45;

        // Convert date to UTC in milliseconds
        const utc = date.getTime() + date.getTimezoneOffset() * 60000;

        // Convert UTC to Nepal time
        const nepalTime = new Date(utc + nepalOffset * 60 * 1000);

        // Format Nepali date/time
        return nepalTime.toLocaleString("en-US", {
            year: "numeric",
            month: "short",  // e.g. Sep
            day: "numeric",  // e.g. 29
            hour: "2-digit",
            minute: "2-digit",
            hour12: true     // 12-hour clock with AM/PM
        });
    };

    // Check if event is upcoming
    const isUpcoming = (startDate) => {
        return new Date(startDate) > new Date();
    };

    // Card variants for animation
    const cardVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: -20 }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue"></div>
            </div>
        );
    }
    const isNewEvent = (event) => {
        if (!event.created_at) return false;
        const createdDate = new Date(event.created_at);
        const now = new Date();
        const diffInDays = (now - createdDate) / (1000 * 60 * 60 * 24);
        return diffInDays <= 3; // Last 3 days
    };


    return (
        <div className="">
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="space-y-6 pt-8 pb-8 px-12 max-md:px-6 min-h-screen   mx-auto  "
            >
                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 ">
                    <div>
                        {/* <h2 className="text-2xl font-bold text-gray-800">Available Events</h2> */}
                        <p className="text-muted-foreground">Discover and join exciting events</p>
                    </div>
                </div>

                {/* Event Cards Grid */}
                <AnimatePresence mode="wait">
                    {currentEvents.length ? (
                        <motion.div
                            key="events-grid"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-8 md:items-stretch"
                        >
                            {console.log('-----------currentEvents--------', currentEvents)}
                            {currentEvents.map((event, index) => {
                                const participationStatus = getParticipationStatus(event.id);
                                const hasSubmitted = hasSubmittedRequirements(event.id);
                                const isParticipant = isParticipantEvent(event.id);
                                const allComplete = areAllRequirementsSubmitted(event.id);

                                return (
                                    <motion.div
                                        key={event.id}
                                        variants={cardVariants}
                                        initial="hidden"
                                        animate="visible"
                                        exit="exit"
                                        transition={{ duration: 0.3, delay: index * 0.1 }}
                                        className="h-full"
                                    >
                                        <Card className={`h-full flex flex-col group hover:shadow-xl transition-all duration-300 hover:-translate-y-1  ${allComplete ? "bg-green-50/50" :
                                            hasSubmitted ? "bg-yellow-50/50" : "bg-white/60"
                                            } relative overflow-hidden ${!isUpcoming(event.start_date) ? "" : ""} ...`}>

                                            {/* Event Status Badge */}
                                            <div className="absolute top-3 right-3 z-10 flex gap-2 ">
                                                {/* Event Open/Closed Badge */}
                                                <Badge
                                                    variant={isUpcoming(event.start_date) ? "default" : "secondary"}
                                                    className={isUpcoming(event.start_date) ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}
                                                >
                                                    {isUpcoming(event.start_date) ? "Open" : "Closed"}
                                                </Badge>
                                            </div>

                                            <CardHeader className={`pb-3 cursor-pointer`} onClick={() => handleView(event.id)}>
                                                <div className="flex items-start justify-between">
                                                    <div className="flex-1 pr-10">
                                                        <h3 className="font-bold text-lg text-gray-900 group-hover:text-blue transition-colors line-clamp-2 ">
                                                            {event.title}
                                                            {isNewEvent(event) && isUpcoming(event.start_date) && (
                                                                <span className="ml-2 inline-block  text-[10px]  text-green-700 rounded-full">
                                                                    New
                                                                </span>
                                                            )}
                                                        </h3>

                                                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2  min-h-[2.5rem]">
                                                            {event.description || "No description available"}
                                                        </p>
                                                    </div>
                                                </div>
                                            </CardHeader>

                                            <CardContent className="space-y-3">
                                                {/* Event Type */}
                                                <div className="flex items-center gap-2">
                                                    {event.event_type === "ONLINE" ? (
                                                        <Globe className="w-4 h-4 text-gray-500" />
                                                    ) : (
                                                        <Building className="w-4 h-4 text-gray-500" />
                                                    )}
                                                    <span className="text-sm font-medium">
                                                        {event.event_type === "ONLINE" ? "Online Event" : "Physical Event"}
                                                    </span>
                                                </div>

                                                {/* Location */}
                                                <div className="flex items-center gap-2 ">
                                                    <MapPin className="w-4 h-4 text-gray-500" />
                                                    <span className="text-sm text-muted-foreground truncate">
                                                        {event.location}
                                                    </span>
                                                </div>

                                                {/* Date and Duration */}
                                                <div className="flex items-center gap-2">
                                                    <Calendar className="w-4 h-4 text-gray-500" />
                                                    <span className="text-sm text-muted-foreground">
                                                        {formatDate(event.start_date)}
                                                    </span>
                                                </div>

                                                <div className="flex items-center gap-2">
                                                    <Clock className="w-4 h-4 text-gray-500" />
                                                    <span className="text-sm text-muted-foreground">
                                                        {event.duration}
                                                    </span>
                                                </div>

                                                {/* Requirements Section with Status */}
                                                <div className="flex flex-col items-start gap-2 md:min-h-[7.5rem] ">
                                                    <div className="flex items-center gap-2 ">
                                                        <p className="text-sm font-medium pl-1  ">Requirements</p>
                                                        {hasSubmitted && (
                                                            <div className="flex items-center gap-1">
                                                                {allComplete ? (
                                                                    <CheckCircle className="w-4 h-4 text-green-600" />
                                                                ) : (
                                                                    <Clock className="w-4 h-4 text-yellow-600" />
                                                                )}

                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
                                                        {event.requirements.length === 0 ? (
                                                            <span className="text-gray-400">N/A</span>
                                                        ) : (
                                                            <>
                                                                {event.requirements.slice(0, 2).map((req, index) =>
                                                                    req.label.length === 0 ? (
                                                                        <span key={index} className="px-2 py-1 rounded-lg bg-gray-100 text-gray-500 text-xs">
                                                                            N/A
                                                                        </span>
                                                                    ) : (
                                                                        <span
                                                                            key={index}
                                                                            className={`px-3 py-1 rounded-full border text-xs font-medium hover:bg-blue-100 transition ${hasSubmitted
                                                                                ? allComplete
                                                                                    ? "bg-green-100 text-green-700 border-green-200"
                                                                                    : "bg-yellow-100 text-yellow-700 border-yellow-200"
                                                                                : "bg-blue-50 text-blue-700 border-blue-200"
                                                                                }`}
                                                                        >
                                                                            {req.label}
                                                                            {hasSubmitted && req.is_required && (
                                                                                <CheckCircle className={`inline-block ml-1 w-3 h-3 ${allComplete ? "text-green-600" : "text-yellow-600"
                                                                                    }`} />
                                                                            )}
                                                                        </span>
                                                                    )
                                                                )}
                                                                {event.requirements.length > 2 && (
                                                                    <span className="px-3 py-1 rounded-full bg-gray-100 text-gray-600 border border-gray-200 text-xs font-medium">
                                                                        +{event.requirements.length - 2} more
                                                                    </span>
                                                                )}
                                                            </>
                                                        )}
                                                    </div>
                                                </div>
                                            </CardContent>
                                            <CardFooter
                                                className={`mt-auto border-t px-6 py-4 flex justify-between items-center ${allComplete ? "bg-green-50/30" :
                                                    hasSubmitted ? "bg-yellow-50/30" : "bg-white/30"
                                                    }`}
                                            >
                                                <div className="flex items-center justify-between w-full gap-2">
                                                    <Button
                                                        onClick={() => handleView(event.id)}
                                                        size="sm"
                                                        variant="outline"
                                                        className="hover:bg-blue/60 hover:text-white transition-colors"
                                                    >
                                                        <MdRemoveRedEye className="w-3 h-3 mr-1" />
                                                        View Details
                                                    </Button>
                                                    <Button
                                                        onClick={() => handleApply(event.id)}
                                                        size="sm"
                                                        variant="outline"
                                                        className={`transition-colors ${!isUpcoming(event.start_date) ? "hidden" : ""}
        ${hasSubmitted
                                                                ? "hover:bg-blue/80 bg-blue hover:text-white text-white"
                                                                : "hover:bg-blue/80 bg-blue hover:text-white text-white"
                                                            }`}
                                                    >
                                                        {isParticipant ? "Edit Application" : "Apply Now"}
                                                    </Button>
                                                </div>
                                            </CardFooter>

                                        </Card>
                                    </motion.div>
                                );
                            })}
                        </motion.div>
                    ) : (
                        <motion.div
                            key="no-events"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="text-center py-12"
                        >
                            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Calendar className="w-12 h-12 text-gray-400" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Events Found</h3>
                            <p className="text-muted-foreground mb-4">
                                {searchTerm || filterType !== "all" || filterPayment !== "all"
                                    ? "No events match your current filters. Try adjusting your search criteria."
                                    : "No events are currently available. Check back later for new events."
                                }
                            </p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        </div>
    );
}
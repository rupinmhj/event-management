import { useContext, useDebugValue, useEffect, useState } from "react";
import { Card, CardContent, CardFooter, CardHeader } from "@/Components/ui/card";
import { Button } from "@/Components/ui/button";
import { Badge } from "@/Components/ui/badge";
import { Input } from "@/Components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/Components/ui/select";
import AuthContext from "@/context/AuthContext";
import useAxiosAuth from "@/hooks/useAxiosAuth";
import { MdRemoveRedEye } from "react-icons/md";
import { toast, ToastContainer } from 'react-toastify'
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
    ExternalLink

} from "lucide-react";
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from "react-router-dom";

function EventList() {
    const navigate = useNavigate();
    const [events, setEvents] = useState([]);
    const [filteredEvents, setFilteredEvents] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [eventsPerPage] = useState(6);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterType, setFilterType] = useState("all");
    const [filterPayment, setFilterPayment] = useState("all");

    const api = useAxiosAuth();
    const { authTokens, authReady } = useContext(AuthContext);

    // Fetch events (only active events for participants)
    useEffect(() => {
        const fetchEvents = async () => {
            try {
                setIsLoading(true);

                const res = await api.get("/api/event/unauth-event-list/");
                const data = res.data;
                console.log('Event list', data);

                // Filter only active events for participants
                const activeEvents = data.filter(event => event.is_active);
                setEvents(activeEvents);
                setFilteredEvents(activeEvents);
            } catch (error) {
                console.error("Error fetching events:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchEvents();
    }, [api]);

    //handle apply
    const handleApply = (id) => {
        toast.info('Please sign in first !');
        setTimeout(() => window.scrollTo(0, 0), 1000);
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
        navigate(`/event/${id}`)
    }

    const handleJoinEvent = (eventId) => {
        // Handle event registration/join logic
        navigate(`/participant/event/join/${eventId}`);
    }

    // Format date
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleString("en-US", {
            year: "numeric",
            month: "short",  // e.g. Oct
            day: "numeric",  // e.g. 15
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,    // 12-hour clock with AM/PM
            timeZone: "UTC", // keep consistent with "Z" (UTC) in your string
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




    return (
        <div className="">
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="space-y-6 pt-8 pb-8 px-4 md:px-12 max-w-[90dvw] mx-auto "
            >
                {/* Header */}
                <div className="flex flex-col  justify-between items-start items-center gap-4 pb-10  ">

                    <p className="text-[24px] md:text-[30px] font-semibold">Featured Events</p>
                    <p className="text-[18px] md:text-[24px] text-gray-700 text-center">Don't miss out on these exciting opportunities</p>

                </div>

                {/* Event Cards Grid */}
                <AnimatePresence mode="wait">
                    {currentEvents.length > 0 ? (
                        <motion.div
                            key="events-grid"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 "
                        >
                            {currentEvents.map((event, index) => (
                                <motion.div
                                    key={event.id}
                                    variants={cardVariants}
                                    initial="hidden"
                                    animate="visible"
                                    exit="exit"
                                    transition={{ duration: 0.3, delay: index * 0.1 }}
                                >
                                    <Card className={`group  hover:shadow-xl transition-all duration-300 hover:-translate-y-1 relative overflow-hidden ${!isUpcoming(event.start_date) ? "" : ""
                                        }`}>
                                        {/* Event Status Badge */}
                                        {
                                            event?.banner ? (
                                                <div className="w-full aspect-[16/9] overflow-hidden rounded-lg shadow-md">
                                                    <img
                                                        src={event?.banner}
                                                        alt="Event Banner"
                                                        className="w-full h-full object-cover"
                                                    />
                                                </div>
                                            ) :
                                                (
                                                    <div className="w-full h-full aspect-[16/9] flex items-center justify-center bg-blue/40">
                                                        <ImageIcon className="w-24 h-24 text-muted-foreground" />
                                                    </div>
                                                )

                                        }


                                        <div className="absolute top-3 right-3 ">
                                            <Badge
                                                variant={isUpcoming(event.start_date) ? "default" : "secondary"}
                                                className={isUpcoming(event.start_date) ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}
                                            >
                                                {isUpcoming(event.start_date) ? "Open" : "Closed"}
                                            </Badge>
                                        </div>



                                        <CardHeader className="pb-3 cursor-pointer " onClick={() => handleView(event.id)}>
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1">
                                                    <h3 className="font-bold text-lg text-gray-900 group-hover:text-blue transition-colors line-clamp-2">
                                                        {event.title}
                                                    </h3>
                                                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2 min-h-[2.5rem]">
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
                                            <div className="flex items-center gap-2">
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



                                        </CardContent>

                                        <CardFooter className="pt-4 border-t bg-gray-50/50">
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
                                                    className="hover:bg-blue/80 bg-blue hover:text-white text-white transition-colors"
                                                >
                                                    Apply Now
                                                </Button>

                                            </div>
                                        </CardFooter>
                                    </Card>
                                </motion.div>
                            ))}
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
            <ToastContainer />
        </div>

    );
}
export default EventList;
import { useContext, useEffect, useState } from "react";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
    ExternalLink

} from "lucide-react";
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from "react-router-dom";

export default function ParticipantEventList() {
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
                if (!authTokens && !authReady) return;

                const res = await api.get("/api/event/active-events/");
                const data = res.data;
                console.log('Event list', data);
                
                // Filter only active events for participants
                const activeEvents = data.filter(event => event.is_active );
                setEvents(activeEvents);
                setFilteredEvents(activeEvents);
            } catch (error) {
                console.error("Error fetching events:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchEvents();
    }, [authTokens, authReady, api]);

    // Filter and search logic
    useEffect(() => {
        let filtered = events;

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
        navigate(`/user/event/${id}`)
    }

    const handleJoinEvent = (eventId) => {
        // Handle event registration/join logic
        navigate(`/participant/event/join/${eventId}`);
    }

    // Format date
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
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
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-6 pt-4 pb-8 px-12"
        >
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">Available Events</h2>
                    <p className="text-muted-foreground">Discover and join exciting events</p>
                </div>
            </div>

            {/* Filters and Search */}
            {/* <Card className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search events..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10"
                        />
                    </div>

                    <Select value={filterType} onValueChange={setFilterType}>
                        <SelectTrigger>
                            <SelectValue placeholder="Event Type" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Types</SelectItem>
                            <SelectItem value="ONLINE">Online</SelectItem>
                            <SelectItem value="PHYSICAL">Physical</SelectItem>
                        </SelectContent>
                    </Select>

                    <Select value={filterPayment} onValueChange={setFilterPayment}>
                        <SelectTrigger>
                            <SelectValue placeholder="Payment Type" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Payment Types</SelectItem>
                            <SelectItem value="paid">Paid Events</SelectItem>
                            <SelectItem value="free">Free Events</SelectItem>
                        </SelectContent>
                    </Select>

                    <div className="text-sm text-muted-foreground flex items-center justify-center">
                        <Filter className="w-4 h-4 mr-2" />
                        {filteredEvents.length} events available
                    </div>
                </div>
            </Card> */}

            {/* Event Cards Grid */}
            <AnimatePresence mode="wait">
                {currentEvents.length > 0 ? (
                    <motion.div
                        key="events-grid"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
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
                                <Card className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 relative overflow-hidden">
                                    {/* Event Status Badge */}
                                    <div className="absolute top-3 right-3 z-10">
                                        <Badge 
                                            variant={isUpcoming(event.start_date) ? "default" : "secondary"}
                                            className={isUpcoming(event.start_date) ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}
                                        >
                                            {isUpcoming(event.start_date) ? "Upcoming" : "Past"}
                                        </Badge>
                                    </div>

                                    {/* Event Banner */}
                                    <div className="relative h-36 bg-gradient-to-br from-blue/20 to-purple-500/20 overflow-hidden cursor-pointer" onClick={() => handleView(event.id)}>
                                        {event.banner ? (
                                            <img
                                                src={event.banner}
                                                alt={event.title}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                                                <ImageIcon className="w-16 h-16 text-gray-400" />
                                            </div>
                                        )}

                                        {/* Event Icon Overlay */}
                                        <div className="absolute bottom-3 left-3">
                                            <div className="w-12 h-12 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg">
                                                {event.icon ? (
                                                    <img
                                                        src={event.icon}
                                                        alt="Event icon"
                                                        className="w-8 h-8 object-contain rounded-full"
                                                    />
                                                ) : (
                                                    <Calendar className="w-6 h-6 text-blue" />
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <CardHeader className="pb-3 cursor-pointer" onClick={() => handleView(event.id)}>
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <h3 className="font-bold text-lg text-gray-900 group-hover:text-blue transition-colors line-clamp-2">
                                                    {event.title}
                                                </h3>
                                                <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                                                    {event.description || "No description available"}
                                                </p>
                                            </div>
                                        </div>
                                    </CardHeader>

                                    <CardContent className="space-y-3">
                                        {/* Event Type */}
                                        <div className="flex items-center gap-2">
                                            {event.event_type === "ONLINE" ? (
                                                <Globe className="w-4 h-4 text-green-600" />
                                            ) : (
                                                <Building className="w-4 h-4 text-blue-600" />
                                            )}
                                            <span className="text-sm font-medium">
                                                {event.event_type === "ONLINE" ? "Online Event" : "Physical Event"}
                                            </span>
                                        </div>

                                        {/* Location */}
                                        <div className="flex items-center gap-2">
                                            <MapPin className="w-4 h-4 text-red-500" />
                                            <span className="text-sm text-muted-foreground truncate">
                                                {event.location}
                                            </span>
                                        </div>

                                        {/* Date and Duration */}
                                        <div className="flex items-center gap-2">
                                            <Calendar className="w-4 h-4 text-purple-500" />
                                            <span className="text-sm text-muted-foreground">
                                                {formatDate(event.start_date)}
                                            </span>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <Clock className="w-4 h-4 text-orange-500" />
                                            <span className="text-sm text-muted-foreground">
                                                {event.duration}
                                            </span>
                                        </div>

                                        {/* Payment Status */}
                                        <div className="flex items-center gap-2">
                                            <DollarSign className="w-4 h-4 text-green-500" />
                                            <Badge variant={event.is_payment_required ? "paid" : "secondary"}>
                                                {event.is_payment_required ? "Paid" : "Free"}
                                            </Badge>
                                        </div>
                                    </CardContent>

                                    <CardFooter className="pt-4 border-t bg-gray-50/50">
                                        <div className="flex items-center justify-between w-full gap-2">
                                            <Button
                                                onClick={() => handleView(event.id)}
                                                size="sm"
                                                variant="outline"
                                                className="hover:bg-blue hover:text-white transition-colors"
                                            >
                                                <MdRemoveRedEye className="w-3 h-3 mr-1" />
                                                View Details
                                            </Button>

                                            {/* {isUpcoming(event.start_date) ? (
                                                <Button
                                                    onClick={() => handleJoinEvent(event.id)}
                                                    size="sm"
                                                    className="bg-green-600 hover:bg-green-700 text-white"
                                                >
                                                    <UserPlus className="w-3 h-3 mr-1" />
                                                    Join Event
                                                </Button>
                                            ) : (
                                                <Button
                                                    onClick={() => handleView(event.id)}
                                                    size="sm"
                                                    variant="secondary"
                                                    className="text-gray-600"
                                                >
                                                    <ExternalLink className="w-3 h-3 mr-1" />
                                                    View Past Event
                                                </Button>
                                            )} */}
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

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">
                        Showing {indexOfFirstEvent + 1} to {Math.min(indexOfLastEvent, filteredEvents.length)} of {filteredEvents.length} events
                    </div>
                    
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                            disabled={currentPage === 1}
                        >
                            <ChevronLeft className="w-4 h-4" />
                            Previous
                        </Button>
                        
                        <span className="text-sm">
                            Page {currentPage} of {totalPages}
                        </span>
                        
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                            disabled={currentPage === totalPages}
                        >
                            Next
                            <ChevronRight className="w-4 h-4" />
                        </Button>
                    </div>
                </div>
            )}
        </motion.div>
    );
}
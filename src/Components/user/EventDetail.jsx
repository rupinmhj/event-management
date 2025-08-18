import { useContext, useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
    ArrowLeft,
    Calendar,
    MapPin,
    Clock,
    DollarSign,
    Globe,
    Building,
    Image as ImageIcon,
    Users,
    Info,
    Share2,
    Heart,
    Bookmark
} from "lucide-react";
import { motion } from 'framer-motion';
import AuthContext from "@/context/AuthContext";
import useAxiosAuth from "@/hooks/useAxiosAuth";

export function EventDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [event, setEvent] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isBookmarked, setIsBookmarked] = useState(false);
    const [isLiked, setIsLiked] = useState(false);

    const api = useAxiosAuth();
    const { authTokens, authReady } = useContext(AuthContext);

    // Fetch single event
    useEffect(() => {
        const fetchEvent = async () => {
            try {
                setIsLoading(true);
                if (!authTokens && !authReady) return;
                const res = await api.get(`/api/event/active-events/${id}/`);
                const data = res.data;
                console.log('Event details', data);
                setEvent(data);
            } catch (error) {
                console.error("Error fetching event:", error);
                setError("Failed to load event details");
            } finally {
                setIsLoading(false);
            }
        };

        if (id) {
            fetchEvent();
        }
    }, [id, authTokens, authReady, api]);

    // Format date
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    // Format time
    const formatTime = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const handleBack = () => {
        navigate('/events');
    };

    const handleRegister = () => {
        navigate(`/user/event-form/${id}`);
    };

    const toggleBookmark = () => {
        setIsBookmarked(!isBookmarked);
        // Add API call to save/remove bookmark
    };

    const toggleLike = () => {
        setIsLiked(!isLiked);
        // Add API call to like/unlike event
    };

    const handleShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: event.title,
                    text: event.description,
                    url: window.location.href,
                });
            } catch (error) {
                console.log('Error sharing:', error);
            }
        } else {
            // Fallback: copy to clipboard
            navigator.clipboard.writeText(window.location.href);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (error || !event) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen space-y-4">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-foreground mb-2">Event Not Found</h2>
                    <p className="text-muted-foreground mb-4">{error || "The event you're looking for doesn't exist."}</p>
                    <Button onClick={handleBack} variant="outline">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Go Back
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="min-h-screen bg-background"
        >
            <div className="max-w-5xl mx-auto px-6 py-8">


                {/* Hero Section */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    className="relative mb-8"
                >
                    <Card className="overflow-hidden">
                        {/* Banner Image */}
                        <div className="relative h-64 md:h-96 bg-gradient-to-br from-muted to-accent">
                            {event.banner ? (
                                <img
                                    src={event.banner}
                                    alt={event.title}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                    <ImageIcon className="w-24 h-24 text-muted-foreground" />
                                </div>
                            )}



                            {/* Event Icon */}
                            {event.icon && (
                                <div className="absolute bottom-4 left-4">
                                    <div className="w-20 h-20 bg-background/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg">
                                        <img
                                            src={event.icon}
                                            alt="Event icon"
                                            className="w-12 h-12 object-contain rounded-full"
                                        />
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Event Header */}
                        <CardHeader className="pb-6">
                            <div className="flex items-start justify-between gap-4">
                                <div className="flex-1">
                                    <h1 className="text-[20px]  font-bold text-gray-800 mb-3">
                                        {event.title}
                                    </h1>
                                    <div className="flex items-center gap-3 mb-4">
                                        {event.event_type === "ONLINE" ? (
                                            <Globe className="w-5 h-5 text-green-600" />
                                        ) : (
                                            <Building className="w-5 h-5 text-blue-600" />
                                        )}
                                        <span className="text-[16px] font-medium text-muted-foreground">
                                            {event.event_type === "ONLINE" ? "Online Event" : "Physical Event"}
                                        </span>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                         <button
                                    className={`text-sm px-3 py-1 rounded font-medium ${event.is_payment_required
                                        ? "bg-yellow-200 text-yellow-800"
                                        : "bg-gray-100 text-gray-800"
                                        }`}
                                >
                                    {event.is_payment_required ? "Paid Event" : "Free Event"}
                                </button>
                                        {/* <Badge
                                            variant={event.is_active ? "default" : "outline"}
                                            className="text-sm px-3 py-1"
                                        >
                                            {event.is_active ? "Active" : "Inactive"}
                                        </Badge> */}
                                    </div>
                                </div>
                            </div>
                        </CardHeader>
                    </Card>
                </motion.div>

                {/* Main Content */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="grid grid-cols-1 lg:grid-cols-3 gap-8"
                >
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Description */}
                        <Card>
                            <CardHeader>
                                <div className="flex items-center gap-2">
                                    <Info className="w-5 h-5 text-primary" />
                                    <h2 className="text-[16px] font-semibold">About This Event</h2>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <p className="text-muted-foreground leading-relaxed text-[13px]">
                                    {event.description || "No description provided for this event."}
                                </p>
                            </CardContent>
                        </Card>

                        {/* Event Details */}
                        <Card>
                            <CardHeader>
                                <h2 className="text-[16px] font-semibold">Event Details</h2>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="flex items-start gap-4">
                                        <div className="w-12 h-12  rounded-full flex items-center justify-center">
                                            <Calendar className="w-5 h-5 text-primary" />
                                        </div>
                                        <div>
                                            <p className="font-semibold text-foreground text-[14px] mb-1">Date</p>
                                            <p className="text-muted-foreground text-[14px]">
                                                {formatDate(event.start_date)}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-4">
                                        <div className="w-12 h-12  rounded-full flex items-center justify-center">
                                            <Clock className="w-5 h-5 text-primary" />
                                        </div>
                                        <div>
                                            <p className="font-semibold text-foreground mb-1 text-[14px]">Duration</p>
                                            <p className="text-muted-foreground text-[14px]">
                                                {event.duration}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-4">
                                        <div className="w-12 h-12  rounded-full flex items-center justify-center">
                                            <MapPin className="w-5 h-5 text-primary" />
                                        </div>
                                        <div>
                                            <p className="font-semibold text-foreground mb-1 text-[14px]">Location</p>
                                            <p className="text-muted-foreground text-[14px]">
                                                {event.location}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-4">
                                        <div className="w-12 h-12  rounded-full flex items-center justify-center">
                                            <DollarSign className="w-5 h-5 text-primary" />
                                        </div>
                                        <div>
                                            <p className="font-semibold text-foreground mb-1 text-[14px]">Cost</p>
                                            <p className="text-muted-foreground text-[14px]">
                                                {event.is_payment_required ? "Paid Event" : "Free Event"}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Registration Card */}
                        <Card className="sticky top-8">
                            <CardHeader>
                                <h3 className="text-lg font-semibold text-center">Join This Event</h3>
                            </CardHeader>
                            <CardContent className="space-y-4">
                              

                                <Separator />

                                <button
                                    onClick={handleRegister}
                                    className="w-full py-6 text-[18px] bg-blue text-white hover:bg-opacity-80 font-semibold  h-10 rounded-lg flex justify-center items-center"
                                    disabled={!event.is_active}
                                >
                                    {event.is_active ? "Register Now" : "Registration Closed"}
                                </button>

                                <div className="space-y-2 text-sm text-muted-foreground">
                                    <div className="flex items-center justify-between">
                                        <span>Event Type:</span>
                                        <span className="font-medium">{event.event_type}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span>Status:</span>
                                         <button
                                                        className={`px-2 py-1 rounded text-[14px] font-medium ${event.is_active
                                                            ? "bg-green-100 text-green-800"
                                                            : "bg-gray-100 text-gray-800"
                                                            }`}
                                                    >
                                                        {event.is_active ? "Active" : "Inactive"}
                                                    </button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Event Highlights */}
                        <Card>
                            <CardHeader>
                                <h3 className="font-semibold">Event Highlights</h3>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                                    {event.event_type === "ONLINE" ? (
                                        <Globe className="w-5 h-5 text-green-600" />
                                    ) : (
                                        <Building className="w-5 h-5 text-blue-600" />
                                    )}
                                    <span className="text-sm font-medium">
                                        {event.event_type === "ONLINE" ? "Join from anywhere" : "Physical attendance required"}
                                    </span>
                                </div>

                                {!event.is_payment_required && (
                                    <div className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-950 rounded-lg">
                                        <DollarSign className="w-5 h-5 text-green-600" />
                                        <span className="text-sm font-medium text-green-800 dark:text-green-200">
                                            Free participation
                                        </span>
                                    </div>
                                )}

                                <div className="flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
                                    <Users className="w-5 h-5 text-blue-600" />
                                    <span className="text-sm font-medium text-blue-800 dark:text-blue-200">
                                        Open registration
                                    </span>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </motion.div>
            </div>
        </motion.div>
    );
}

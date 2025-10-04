import { useContext, useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader } from "@/Components/ui/card";
import { Button } from "@/Components/ui/button";
import { Badge } from "@/Components/ui/badge";
import { Separator } from "@/Components/ui/separator";
import { ScrollArea, ScrollBar } from "@/Components/ui/scroll-area";
import { MyPayment } from "./MyPayment";
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/Components/ui/tabs";
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
    Bookmark,
    FileText,
    CreditCard
} from "lucide-react";
import { motion } from 'framer-motion';
import AuthContext from "@/context/AuthContext";
import useAxiosAuth from "@/hooks/useAxiosAuth";
import { RequirementsView } from "./RequirementsView";
import { TicketPriceView } from "./TicketPriceView";

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

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [id])

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
            <div className="max-w-6xl mx-auto px-6 py-8">
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
                        <CardHeader className="pb-4">
                            <div className="flex items-start justify-between gap-4">
                                <div className="flex-1">
                                    <h1 className="text-[20px] font-bold text-gray-800 mb-3">
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
                                        {/* <button
                                            className={`text-sm px-3 py-1 rounded font-medium ${event.is_payment_required
                                                ? "bg-yellow-200 text-yellow-800"
                                                : "bg-gray-100 text-gray-800"
                                                }`}
                                        >
                                            {event.is_payment_required ? "Paid Event" : "Free Event"}
                                        </button> */}
                                    </div>
                                </div>
                            </div>
                        </CardHeader>
                    </Card>
                </motion.div>

                {/* Tabs Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                >
                    <Tabs defaultValue="overview">
                        <ScrollArea>
                            <TabsList className="bg-background mb-6 h-auto -space-x-px p-0 shadow-xs rtl:space-x-reverse">
                                <TabsTrigger
                                    value="overview"
                                    className="text-gray-600 data-[state=active]:bg-muted data-[state=active]:after:bg-primary relative overflow-hidden rounded-none border py-2 after:pointer-events-none after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 first:rounded-s last:rounded-e"
                                >
                                    <Info
                                        className="-ms-0.5 me-1.5 opacity-90"
                                        size={16}
                                        aria-hidden="true"
                                    />
                                    Overview
                                </TabsTrigger>
                                <TabsTrigger
                                    value="requirements"
                                    className="text-gray-600 data-[state=active]:bg-muted data-[state=active]:after:bg-primary relative overflow-hidden rounded-none border py-2 after:pointer-events-none after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 first:rounded-s last:rounded-e"
                                >
                                    <FileText
                                        className="-ms-0.5 me-1.5 opacity-60"
                                        size={16}
                                        aria-hidden="true"
                                    />
                                    Requirements
                                </TabsTrigger>
                                <TabsTrigger
                                    value="ticket-price"
                                    className="text-gray-600 data-[state=active]:bg-muted data-[state=active]:after:bg-primary relative overflow-hidden rounded-none border py-2 after:pointer-events-none after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 first:rounded-s last:rounded-e"
                                >
                                    <CreditCard
                                        className="-ms-0.5 me-1.5 opacity-60"
                                        size={16}
                                        aria-hidden="true"
                                    />
                                    Ticket Price
                                </TabsTrigger>
                                <TabsTrigger
                                    value="my-payment"
                                    className="text-gray-600 data-[state=active]:bg-muted data-[state=active]:after:bg-primary relative overflow-hidden rounded-none border py-2 after:pointer-events-none after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 first:rounded-s last:rounded-e"
                                >
                                    <CreditCard
                                        className="-ms-0.5 me-1.5 opacity-90"
                                        size={16}
                                        aria-hidden="true"
                                    />
                                    My payment
                                </TabsTrigger>
                            </TabsList>
                            <ScrollBar orientation="horizontal" />
                        </ScrollArea>

                        {/* Overview Tab Content */}
                        <TabsContent value="overview">
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
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
                                            <h2 className="text-[16px] font-semibold">Event Information</h2>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div className="space-y-3">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center">
                                                            <Calendar className="w-5 h-5 text-primary" />
                                                        </div>
                                                        <div>
                                                            <p className="font-medium text-[14px]">Date</p>
                                                            <p className="text-[14px] text-muted-foreground">
                                                                {formatDate(event.start_date)}
                                                            </p>
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center">
                                                            <Clock className="w-5 h-5 text-primary" />
                                                        </div>
                                                        <div>
                                                            <p className="font-medium text-[14px]">Duration</p>
                                                            <p className="text-[14px] text-muted-foreground">
                                                                {event.duration}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="space-y-3">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center">
                                                            <MapPin className="w-5 h-5 text-primary" />
                                                        </div>
                                                        <div>
                                                            <p className="font-medium text-[14px]">Location</p>
                                                            <p className="text-[14px] text-muted-foreground">
                                                                {event.location}
                                                            </p>
                                                        </div>
                                                    </div>

                                                    {/* <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center">
                                                            <DollarSign className="w-5 h-5 text-primary" />
                                                        </div>
                                                        <div>
                                                            <p className="font-medium text-[14px]">Cost</p>
                                                            <p className="text-[14px] text-muted-foreground">
                                                                {event.is_payment_required ? "Paid Event" : "Free Event"}
                                                            </p>
                                                        </div>
                                                    </div> */}
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>

                                {/* Sidebar */}
                                <div className="space-y-6">
                                    {/* Registration Action */}


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

                                            {/* {!event.is_payment_required && (
                                                <div className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-950 rounded-lg">
                                                    <DollarSign className="w-5 h-5 text-green-600" />
                                                    <span className="text-sm font-medium text-green-800 dark:text-green-200">
                                                        Free participation
                                                    </span>
                                                </div>
                                            )} */}

                                            <div className="flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
                                                <Users className="w-5 h-5 text-blue-600" />
                                                <span className="text-sm font-medium text-blue-800 dark:text-blue-200">
                                                    Open registration
                                                </span>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>
                            </div>
                        </TabsContent>

                        {/* Requirements Tab Content */}
                        <RequirementsView requirements={event.requirements} />

                        {/* Ticket Price Tab Content */}

                        <TabsContent value="ticket-price">
                            <TicketPriceView />
                        </TabsContent>

                        <TabsContent value='my-payment'>
                            <MyPayment />
                        </TabsContent>

                    </Tabs>
                </motion.div>
            </div>
        </motion.div>
    );
}
import { useContext, useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import AuthContext from "@/context/AuthContext";
import useAxiosAuth from "@/hooks/useAxiosAuth";
import {
    ArrowLeft,
    Calendar,
    MapPin,
    Clock,
    DollarSign,
    Globe,
    Building,
    Image as ImageIcon,
    Edit,
    Users,
    Info,
    Delete
} from "lucide-react";
import { motion } from 'framer-motion';

export function EventView() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [event, setEvent] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    const api = useAxiosAuth();
    const { authTokens, authReady } = useContext(AuthContext);

    // Fetch single event
    useEffect(() => {
        const fetchEvent = async () => {
            try {
                setIsLoading(true);
                if (!authTokens && !authReady) return;
                // http://192.168.1.14:8000/api/event/get-event-detail/6/
                const res = await api.get(`/api/event/get-event-detail/${id}/`);
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
        navigate('/admin/events');
    };

    const handleEdit = () => {
        navigate(`/admin/event-edit/${id}`);
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
            className="min-h-screen bg-background "
        >
            {/* Header */}
            <div className="bg-card border-b">
                <div className="max-w-4xl mt-20 mx-auto px-6 py-4">
                    <div className="flex items-center justify-between">
                        <Button
                            onClick={handleBack}
                            variant="ghost"
                            className="hover:bg-accent"
                        >
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Back to Events
                        </Button>
                         <Button
                                    onClick={handleEdit}
                                    size="sm"
                                    variant="outline"
                                    className="hover:bg-blue hover:text-white transition-colors"
                                >
                                    <Edit className="w-3 h-3 mr-1" />
                                    Edit
                                </Button>
                    </div>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-6 py-8">
                {/* Hero Section */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    className="relative mb-8 "
                >
                    <Card className="overflow-hidden">
                        {/* Banner Image */}
                        <div className="relative h-64 md:h-80 bg-gradient-to-br from-muted to-accent">
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

                            {/* Status Badge Overlay */}
                            <div className="absolute top-4 right-4">
                                <Badge
                                    variant={event.is_active ? "success" : "secondary"}
                                    className="bg-background/90 backdrop-blur-sm"
                                >
                                    {event.is_active ? "Active" : "Inactive"}
                                </Badge>
                            </div>

                            {/* Event Icon */}
                            {event.icon && (
                                <div className="absolute bottom-4 left-4">
                                    <div className="w-16 h-16 bg-background/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg">
                                        <img
                                            src={event.icon}
                                            alt="Event icon"
                                            className="w-10 h-10 object-contain rounded-full"
                                        />
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Event Title and Type */}
                        <CardHeader className="pb-4">
                            <div className="flex items-start justify-between gap-4">
                                <div className="flex-1">
                                    <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">
                                        {event.title}
                                    </h1>
                                    <div className="flex items-center gap-2 mb-4">
                                        {event.event_type === "ONLINE" ? (
                                            <Globe className="w-5 h-5 text-green-600" />
                                        ) : (
                                            <Building className="w-5 h-5 text-blue-600" />
                                        )}
                                        <span className="text-lg font-medium text-muted-foreground">
                                            {event.event_type === "ONLINE" ? "Online Event" : "Physical Event"}
                                        </span>
                                    </div>
                                </div>
                                <Badge
                                    variant={event.is_payment_required ? "paid" : "secondary"}
                                    className="text-sm px-3 py-1"
                                >
                                    {event.is_payment_required ? "Paid Event" : "Free Event"}
                                </Badge>
                            </div>
                        </CardHeader>
                    </Card>
                </motion.div>

                {/* Event Details Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Content */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="lg:col-span-2 space-y-6"
                    >
                        {/* Description */}
                        <Card>
                            <CardHeader>
                                <div className="flex items-center gap-2">
                                    <Info className="w-5 h-5 text-primary" />
                                    <h2 className="text-xl font-semibold">About This Event</h2>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <p className="text-muted-foreground leading-relaxed text-base">
                                    {event.description || "No description provided for this event."}
                                </p>
                            </CardContent>
                        </Card>

                        {/* Additional Details */}
                        <Card>
                            <CardHeader>
                                <h2 className="text-xl font-semibold">Event Information</h2>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center">
                                                <Calendar className="w-5 h-5 text-primary" />
                                            </div>
                                            <div>
                                                <p className="font-medium">Date</p>
                                                <p className="text-sm text-muted-foreground">
                                                    {formatDate(event.start_date)}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center">
                                                <Clock className="w-5 h-5 text-primary" />
                                            </div>
                                            <div>
                                                <p className="font-medium">Duration</p>
                                                <p className="text-sm text-muted-foreground">
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
                                                <p className="font-medium">Location</p>
                                                <p className="text-sm text-muted-foreground">
                                                    {event.location}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center">
                                                <DollarSign className="w-5 h-5 text-primary" />
                                            </div>
                                            <div>
                                                <p className="font-medium">Cost</p>
                                                <p className="text-sm text-muted-foreground">
                                                    {event.is_payment_required ? "Paid Event" : "Free Event"}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>

                    {/* Sidebar */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: 0.3 }}
                        className="space-y-6"
                    >
                        {/* Quick Info */}
                        <Card>
                            <CardHeader>
                                <h3 className="font-semibold">Quick Info</h3>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm font-medium">Status</span>
                                        <Badge variant={event.is_active ? "default" : "secondary"}>
                                            {event.is_active ? "Active" : "Inactive"}
                                        </Badge>
                                    </div>

                                    <Separator />

                                    <div className="flex justify-between items-center">
                                        <span className="text-sm font-medium">Type</span>
                                        <span className="text-sm text-muted-foreground">
                                            {event.event_type}
                                        </span>
                                    </div>

                                    <Separator />

                                    <div className="flex justify-between items-center">
                                        <span className="text-sm font-medium">Payment</span>
                                        <Badge variant={event.is_payment_required ? "paid" : "secondary"}>
                                            {event.is_payment_required ? "Required" : "Free"}
                                        </Badge>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Actions */}
                        <Card>
                            <CardHeader>
                                <h3 className="font-semibold">Actions</h3>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                 <Button 
                                    onClick={handleEdit}
                                    className="w-full bg-blue hover:bg-blue/80"
                                >
                                    <Edit className="w-4 h-4 mr-2" />
                                    Edit Event
                                </Button>

                                <Button
                                    variant="outline"
                                    className="w-full hover:bg-red-400 text-white bg-red-800 hover:text-white"
                                >
                                    <Delete className="w-4 h-4 mr-2" />
                                    Delete Event
                                </Button>
                            </CardContent>
                        </Card>
                    </motion.div>
                </div>
            </div>
        </motion.div>
    );
}
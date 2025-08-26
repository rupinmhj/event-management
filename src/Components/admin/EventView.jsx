import { useContext, useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs";
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
    Delete,
    FileText,
    CreditCard,
    UserCheck,
    X,
    Trash2,
    AlertTriangle
} from "lucide-react";
import { motion } from 'framer-motion';
import { RequirementsView } from "./RequirementsView";
import GeneralContext from "@/context/GeneralContext";
import { ParticipationList } from "./ParticipationList";

// Delete Confirmation Modal Component
const DeleteConfirmationModal = ({ isOpen, onClose, onConfirm, eventTitle, isDeleting = false }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-red-100 rounded-full">
                            <AlertTriangle className="w-6 h-6 text-red-600" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900">Delete Event</h3>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                        disabled={isDeleting}
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6">
                    <p className="text-gray-600 mb-4">
                        Are you sure you want to delete the event{' '}
                        <span className="font-medium text-gray-900">"{eventTitle}"</span>?
                    </p>
                    <p className="text-sm text-red-600">
                        This action cannot be undone. All event data will be permanently removed.
                    </p>
                </div>

                {/* Footer */}
                <div className="flex justify-end gap-3 p-6 border-t bg-gray-50">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                        disabled={isDeleting}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={isDeleting}
                    >
                        {isDeleting ? (
                            <>
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                Deleting...
                            </>
                        ) : (
                            <>
                                <Trash2 className="w-4 h-4" />
                                Delete Event
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export function EventView() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [event, setEvent] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const api = useAxiosAuth();
    const { authTokens, authReady } = useContext(AuthContext);
    const { eventNameFunc } = useContext(GeneralContext);

    // Fetch single event
    useEffect(() => {
        const fetchEvent = async () => {
            try {
                setIsLoading(true);
                if (!authTokens && !authReady) return;
                const res = await api.get(`/api/event/get-event-detail/${id}/`);
                const data = res.data;
                console.log('Event details', data);
                setEvent(data);
                eventNameFunc(data.title);
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

    const handleDelete = async () => {
        setIsDeleting(true);
        try {
            const res = await api.delete(`/api/event/delete-event/${id}/`);
            
            if (res.status === 200 || res.status === 204) {
                console.log('Event deleted successfully');
                setShowDeleteModal(false);
                // Navigate back to events list after successful deletion
                navigate('/admin/events');
                // You can also show a success toast here
            }
        } catch (error) {
            console.error('Error deleting event:', error);
            // Handle error (show error message, etc.)
            // You can show an error toast here
        } finally {
            setIsDeleting(false);
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
            <div className="max-w-6xl mx-auto px-6 py-24">
                {/* Hero Section */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    className="relative mb-8"
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
                                <button
                                    className={`px-2 py-1 rounded text-sm font-medium ${event.is_active
                                        ? "bg-green-100 text-green-800"
                                        : "bg-gray-100 text-gray-800"
                                        }`}
                                >
                                    {event.is_active ? "Active" : "Inactive"}
                                </button>
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
                                    <h1 className="text-[18px] md:text-[20px] font-bold text-gray-800 mb-2">
                                        {event.title}
                                    </h1>
                                    <div className="flex items-center gap-2 mb-4">
                                        {event.event_type === "ONLINE" ? (
                                            <Globe className="w-5 h-5 text-green-600" />
                                        ) : (
                                            <Building className="w-5 h-5 text-blue-600" />
                                        )}
                                        <span className="text-[16px] font-medium text-muted-foreground">
                                            {event.event_type === "ONLINE" ? "Online Event" : "Physical Event"}
                                        </span>
                                    </div>
                                </div>
                                <button
                                    className={`text-sm px-3 py-1 rounded font-medium ${event.is_payment_required
                                        ? "bg-yellow-200 text-yellow-800"
                                        : "bg-gray-100 text-gray-800"
                                        }`}
                                >
                                    {event.is_payment_required ? "Paid Event" : "Free Event"}
                                </button>
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
                            <TabsList className="bg-background mb-6 h-auto -space-x-px p-0 shadow-xs rtl:space-x-reverse ">
                                <TabsTrigger
                                    value="overview"
                                    className=" text-gray-600 data-[state=active]:bg-muted data-[state=active]:after:bg-primary relative overflow-hidden rounded-none border py-2 after:pointer-events-none after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 first:rounded-s last:rounded-e"
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
                                    value="participants"
                                    className="text-gray-600 data-[state=active]:bg-muted data-[state=active]:after:bg-primary relative overflow-hidden rounded-none border py-2 after:pointer-events-none after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 first:rounded-s last:rounded-e"
                                >
                                    <UserCheck
                                        className="-ms-0.5 me-1.5 opacity-60"
                                        size={16}
                                        aria-hidden="true"
                                    />
                                    Participants
                                </TabsTrigger>
                            </TabsList>
                            <ScrollBar orientation="horizontal" />
                        </ScrollArea>

                        {/* Overview Tab Content */}
                        <TabsContent value="overview">
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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
                                            <p className="text-muted-foreground text-[13px] leading-relaxed text-base">
                                                <span className="text-[13px]">
                                                    {event.description || "No description provided for this event."}
                                                </span>
                                            </p>
                                        </CardContent>
                                    </Card>

                                    {/* Additional Details */}
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

                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center">
                                                            <DollarSign className="w-5 h-5 text-primary" />
                                                        </div>
                                                        <div>
                                                            <p className="font-medium text-[14px]">Cost</p>
                                                            <p className="text-[14px] text-muted-foreground">
                                                                {event.is_payment_required ? "Paid Event" : "Free Event"}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>

                                {/* Sidebar */}
                                <div className="space-y-6">
                                    {/* Quick Info */}
                                    <Card>
                                        <CardHeader>
                                            <h3 className="font-semibold">Quick Info</h3>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            <div className="space-y-3">
                                                <div className="flex justify-between items-center">
                                                    <span className="text-[14px] font-medium">Status</span>
                                                    <button
                                                        className={`px-2 py-1 rounded text-[14px] font-medium ${event.is_active
                                                            ? "bg-green-100 text-green-800"
                                                            : "bg-gray-100 text-gray-800"
                                                            }`}
                                                    >
                                                        {event.is_active ? "Active" : "Inactive"}
                                                    </button>
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
                                                onClick={() => setShowDeleteModal(true)}
                                            >
                                                <Delete className="w-4 h-4 mr-2" />
                                                Delete Event
                                            </Button>
                                        </CardContent>
                                    </Card>
                                </div>
                            </div>
                        </TabsContent>

                        {/* Requirements Tab Content */}
                        <TabsContent value="requirements">
                            {event && event.requirements ? (
                                <RequirementsView requirements={event.requirements}/>
                            ) : (
                                <div className="text-center py-8">
                                    <p className="text-muted-foreground">No requirements data available</p>
                                </div>
                            )}
                        </TabsContent>

                        {/* Ticket Price Tab Content */}
                        <TabsContent value="ticket-price">
                            <div className="text-center py-8">
                                <p className="text-muted-foreground">Ticket price information coming soon...</p>
                            </div>
                        </TabsContent>

                        {/* Participants Tab Content */}
                        <TabsContent value="participants">
                            <ParticipationList />
                        </TabsContent>
                    </Tabs>
                </motion.div>

                {/* Delete Confirmation Modal */}
                <DeleteConfirmationModal
                    isOpen={showDeleteModal}
                    onClose={() => setShowDeleteModal(false)}
                    onConfirm={handleDelete}
                    eventTitle={event.title}
                    isDeleting={isDeleting}
                />
            </div>
        </motion.div>
    );
}
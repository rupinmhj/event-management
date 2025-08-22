import { useState, useRef, useEffect } from "react";
import { toast, ToastContainer } from 'react-toastify';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Mail, Send, Users, X, Plus, CheckCircle, Circle, Calendar, User } from "lucide-react";
import useAxiosAuth from "@/hooks/useAxiosAuth";
import { useNavigate } from "react-router-dom";
import JoditEditor from 'jodit-react';
import 'jodit/es2021/jodit.min.css';
const SendEmail = () => {
    const api = useAxiosAuth();
    const navigate = useNavigate();

    // Form states
    const [subject, setSubject] = useState("");
    const [htmlMessage, setHtmlMessage] = useState("");
    const [selectedEvent, setSelectedEvent] = useState("");
    const [message, setMessage] = useState("");
    const [selectedUserIds, setSelectedUserIds] = useState([]);

    // Mode selection
    const [isEventBased, setIsEventBased] = useState(true);

    // Data states
    const [activeEvents, setActiveEvents] = useState([]);
    const [eventParticipants, setEventParticipants] = useState([]);
    const [allUsers, setAllUsers] = useState([]);

    // UI states
    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingEvents, setIsLoadingEvents] = useState(false);
    const [isLoadingParticipants, setIsLoadingParticipants] = useState(false);
    const [isLoadingUsers, setIsLoadingUsers] = useState(false);
    const [errors, setErrors] = useState({});

    // Fetch active events on component mount
    useEffect(() => {
        fetchActiveEvents();
        if (!isEventBased) {
            fetchAllUsers();
        }
    }, [isEventBased]);

    // Fetch participants when event is selected
    useEffect(() => {
        if (selectedEvent && isEventBased) {
            fetchEventParticipants(selectedEvent);
        }
    }, [selectedEvent, isEventBased]);

    const fetchActiveEvents = async () => {
        setIsLoadingEvents(true);
        try {
            const response = await api.get('/api/event/active-events/');
            setActiveEvents(response.data || []);
        } catch (error) {
            console.error("Error fetching active events:", error);
            toast.error("Failed to load active events");
            setActiveEvents([]);
        } finally {
            setIsLoadingEvents(false);
        }
    };

    const fetchEventParticipants = async (eventId) => {
        setIsLoadingParticipants(true);
        try {
            const response = await api.get(`/api/event/${eventId}/participation-list/`);
            setEventParticipants(response.data || []);
            setSelectedUserIds([]); // Reset selected users when event changes
        } catch (error) {
            console.error("Error fetching event participants:", error);
            toast.error("Failed to load event participants");
            setEventParticipants([]);
        } finally {
            setIsLoadingParticipants(false);
        }
    };

    const fetchAllUsers = async () => {
        setIsLoadingUsers(true);
        try {
            const response = await api.get('/api/account/user-list/');
            setAllUsers(response.data || []);
        } catch (error) {
            console.error("Error fetching all users:", error);
            toast.error("Failed to load users");
            setAllUsers([]);
        } finally {
            setIsLoadingUsers(false);
        }
    };

    const handleModeChange = (eventBased) => {
        setIsEventBased(eventBased);
        setSelectedEvent("");
        setSelectedUserIds([]);
        setEventParticipants([]);
        setErrors({});
    };

    const handleUserSelection = (userId, isSelected) => {
        if (isSelected) {
            setSelectedUserIds(prev => [...prev, userId]);
        } else {
            setSelectedUserIds(prev => prev.filter(id => id !== userId));
        }
        // Clear recipient errors when users are selected
        setErrors(prev => ({ ...prev, recipients: "" }));
    };

    const handleSelectAll = () => {
        const currentUserList = isEventBased ? eventParticipants : allUsers;
        const allUserIds = currentUserList.map(user =>
            isEventBased ? user.user : user.id
        );

        if (selectedUserIds.length === allUserIds.length) {
            // Deselect all
            setSelectedUserIds([]);
        } else {
            // Select all
            setSelectedUserIds(allUserIds);
        }
    };

    const getCurrentUserList = () => {
        return isEventBased ? eventParticipants : allUsers;
    };

    const getUserDisplayName = (user) => {
        return isEventBased ? user.participant_name : user.full_name_en;
    };

    const getUserId = (user) => {
        return isEventBased ? user.user : user.id;
    };

    const validateForm = () => {
        const newErrors = {};

        if (!subject.trim()) newErrors.subject = "Email subject is required";
        if (!htmlMessage.trim()) newErrors.htmlMessage = "Email message is required";

        if (isEventBased && !selectedEvent) {
            newErrors.event = "Please select an event";
        }

        if (selectedUserIds.length === 0) {
            newErrors.recipients = "Please select at least one recipient";
        }

        // Validate subject length
        if (subject.trim().length > 200) {
            newErrors.subject = "Subject should be less than 200 characters";
        }

        // Validate message length
        if (htmlMessage.trim().length < 10) {
            newErrors.htmlMessage = "Message should be at least 10 characters long";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            toast.error("Please fix the validation errors before sending");
            return;
        }

        setIsLoading(true);

        try {
            setErrors({});
            const payload = {
                subject: subject.trim(),
                html_message: htmlMessage.trim(),
                message: " ",
                event: isEventBased ? selectedEvent : null,
                recipient_ids: selectedUserIds
            };
            console.log("Sending email with payload:", payload);
            const response = await api.post('/api/event/send-email/', payload);
            console.log("Email sent response:", response.data);
            toast.success(`Email sent successfully to ${selectedUserIds.length} recipient(s)!`);

            // Reset form
            setSubject("");
            setHtmlMessage("");
            setSelectedEvent("");
            setMessage("");
            setSelectedUserIds([]);
            setErrors({});

            // Optional: Navigate back or to a success page
            setTimeout(() => {
                navigate('/admin'); // Adjust navigation as needed
            }, 1000);

        } catch (error) {
            console.error("Error sending email:", error);
            const errorMessage = error.response?.data?.detail ||
                error.response?.data?.message ||
                "Failed to send email. Please try again.";
            toast.error(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    const currentUserList = getCurrentUserList();
    const allUserIds = currentUserList.map(user => getUserId(user));
    const isAllSelected = selectedUserIds.length > 0 && selectedUserIds.length === allUserIds.length;

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4 w-full">
            <div className="max-w-6xl mx-auto pt-10">


                <Card className="shadow-xl border-0 bg-white">
                    <CardHeader className="text-center pb-4">
                        <CardTitle className="text-xl flex items-center justify-center gap-2">
                            <Send className="w-5 h-5" />
                            Email Composition
                        </CardTitle>
                        <CardDescription>
                            Fill in the details below to send your email
                        </CardDescription>
                    </CardHeader>

                    <CardContent className="space-y-6 pt-4">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Email Mode Selection */}
                            <div className="space-y-4">
                                <Label className="text-base font-semibold">Email Mode</Label>
                                <div className="flex gap-6">
                                    <div className="flex items-center space-x-2">
                                        <Checkbox
                                            id="event-based"
                                            checked={isEventBased}
                                            onCheckedChange={() => handleModeChange(true)}
                                        />
                                        <Label htmlFor="event-based" className="flex items-center gap-2 cursor-pointer">
                                            <Calendar className="w-4 h-4" />
                                            Event-based Email
                                        </Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <Checkbox
                                            id="independent"
                                            checked={!isEventBased}
                                            onCheckedChange={() => handleModeChange(false)}
                                        />
                                        <Label htmlFor="independent" className="flex items-center gap-2 cursor-pointer">
                                            <User className="w-4 h-4" />
                                            Independent Email
                                        </Label>
                                    </div>
                                </div>
                                <p className="text-xs text-gray-600">
                                    {isEventBased
                                        ? "Send email to specific event participants"
                                        : "Send email to any users regardless of event participation"
                                    }
                                </p>
                            </div>

                            {/* Event Selection (only for event-based mode) */}
                            {isEventBased && (
                                <div className="space-y-2">
                                    <Label htmlFor="event">Select Event *</Label>
                                    <Select onValueChange={setSelectedEvent} value={selectedEvent} disabled={isLoadingEvents}>
                                        <SelectTrigger>
                                            <SelectValue placeholder={isLoadingEvents ? "Loading events..." : "Choose an event"} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {activeEvents.map((event) => (
                                                <SelectItem key={event.id} value={event.id.toString()}>
                                                    {event.title}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.event && (
                                        <p className="text-sm text-red-600">{errors.event}</p>
                                    )}
                                </div>
                            )}

                            {/* Recipients Selection */}
                            {((isEventBased && selectedEvent && eventParticipants.length > 0) ||
                                (!isEventBased && allUsers.length > 0)) && (
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <Label className="text-base font-semibold">
                                                Select Recipients *
                                                <span className="text-sm font-normal text-gray-500 ml-2">
                                                    ({selectedUserIds.length} selected)
                                                </span>
                                            </Label>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                onClick={handleSelectAll}
                                                className="flex items-center gap-2"
                                            >
                                                {isAllSelected ? (
                                                    <>
                                                        <CheckCircle className="w-4 h-4" />
                                                        Deselect All
                                                    </>
                                                ) : (
                                                    <>
                                                        <Circle className="w-4 h-4" />
                                                        Select All
                                                    </>
                                                )}
                                            </Button>
                                        </div>

                                        {/* User List */}
                                        <div className="border rounded-lg max-h-64 overflow-y-auto">
                                            {(isLoadingParticipants || isLoadingUsers) ? (
                                                <div className="p-4 text-center text-gray-500">
                                                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto mb-2"></div>
                                                    Loading {isEventBased ? 'participants' : 'users'}...
                                                </div>
                                            ) : (
                                                currentUserList.map((user) => {
                                                    const userId = getUserId(user);
                                                    const displayName = getUserDisplayName(user);
                                                    const isSelected = selectedUserIds.includes(userId);

                                                    return (
                                                        <div
                                                            key={userId}
                                                            className={`flex items-center space-x-3 p-3 border-b last:border-b-0 hover:bg-gray-50 transition-colors ${isSelected ? 'bg-blue-50' : ''
                                                                }`}
                                                        >
                                                            <Checkbox
                                                                id={`user-${userId}`}
                                                                checked={isSelected}
                                                                onCheckedChange={(checked) => handleUserSelection(userId, checked)}
                                                            />
                                                            <Label
                                                                htmlFor={`user-${userId}`}
                                                                className="flex-1 cursor-pointer"
                                                            >
                                                                <div className="flex items-center gap-2">
                                                                    <Users className="w-4 h-4 text-gray-400" />
                                                                    <div>
                                                                        <div className="font-medium">{displayName}</div>
                                                                        {!isEventBased && user.email && (
                                                                            <div className="text-sm text-gray-500">{user.email}</div>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </Label>
                                                        </div>
                                                    );
                                                })
                                            )}
                                        </div>

                                        {errors.recipients && (
                                            <p className="text-sm text-red-600">{errors.recipients}</p>
                                        )}
                                    </div>
                                )}

                            {/* Show message when no data is available */}
                            {isEventBased && selectedEvent && eventParticipants.length === 0 && !isLoadingParticipants && (
                                <div className="text-center py-8 text-gray-500">
                                    <Users className="w-12 h-12 mx-auto mb-2 opacity-50" />
                                    <p>No participants found for this event.</p>
                                </div>
                            )}

                            {!isEventBased && allUsers.length === 0 && !isLoadingUsers && (
                                <div className="text-center py-8 text-gray-500">
                                    <Users className="w-12 h-12 mx-auto mb-2 opacity-50" />
                                    <p>No users found.</p>
                                </div>
                            )}

                            {/* Email Subject */}
                            <div className="space-y-2">
                                <Label htmlFor="subject">Email Subject *</Label>
                                <Input
                                    id="subject"
                                    placeholder="Enter email subject"
                                    value={subject}
                                    onChange={(e) => setSubject(e.target.value)}
                                    maxLength={200}
                                />
                                <div className="flex justify-between items-center">
                                    {errors.subject && (
                                        <p className="text-sm text-red-600">{errors.subject}</p>
                                    )}
                                    <p className="text-xs text-gray-500 ml-auto">
                                        {subject.length}/200 characters
                                    </p>
                                </div>
                            </div>

                            {/* Email Message */}
                            <div className="space-y-2 relative ">
                                <Label htmlFor="htmlMessage">Email Message *</Label>
                                <JoditEditor
                                    value={htmlMessage || ''}
                                    config={{
                                        readonly: false,
                                        height: 250,
                                        removeButtons: [
                                            'source', 'image', 'file', 'video', 'speechRecognize',
                                            'print', 'about', 'fullsize', 'selectall',
                                            'symbol', 'copyformat', 'preview', 'find', 'emoticons',
                                            'brush', 'fontsize', 'paragraph', 'link', 'table', 'hr', 'classSpan', 'superscript', 'subscript'
                                        ],
                                        style: {
                                            backgroundColor: '#ffffff',
                                            color: '#000000',
                                            paddingLeft: '50px',
                                            fontSize: '14px'
                                        },

                                    }}
                                    onBlur={(newContent) => {
                                        setHtmlMessage(newContent || '');
                                    }}
                                />

                                {errors.htmlMessage && (
                                    <p className="text-sm text-red-600">{errors.htmlMessage}</p>
                                )}
                                <div className="absolute w-full bottom-0 h-[21px] bg-white dark:bg-[#5f5c5c]"> </div>



                            </div>

                            {/* Submit Buttons */}
                            <div className="flex gap-4 pt-6 w-full ">
                              

                                <Button
                                    type="submit"
                                    disabled={isLoading}
                                    className="bg-blue w-full text-primary-foreground transition-all duration-300 hover:scale-[1.02] hover:bg-blue/90"
                                >
                                    {isLoading ? (
                                        <div className="flex items-center">
                                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                                            Sending Email...
                                        </div>
                                    ) : (
                                        <div className="flex items-center">
                                            <Send className="w-5 h-5 mr-2" />
                                            Send Email ({selectedUserIds.length})
                                        </div>
                                    )}
                                </Button>
                                  <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => navigate(-1)}
                                    className="hover:bg-destructive hover:text-destructive-foreground transition-all duration-300 hover:scale-[1.02] w-full bg-red-600 text-white"
                                    disabled={isLoading}
                                >
                                    Cancel
                                </Button>
                            </div>

                        </form>
                    </CardContent>
                </Card>
            </div>
            <ToastContainer
                position="top-right"
                autoClose={5000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
            />
        </div>
    );
};

export default SendEmail;
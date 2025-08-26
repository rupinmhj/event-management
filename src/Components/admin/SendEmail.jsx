import { useState, useEffect, useContext } from "react";
import { toast, ToastContainer } from 'react-toastify';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import {
    Mail,
    Send,
    Users,
    CheckCircle,
    XCircle,
    Clock,
    Search,
    Eye,
    AlertTriangle,
    Plus,
    Inbox,
    Edit3,
    Archive,
    Star,
    Trash2,
    Menu,
    X,
    Calendar,
    User,
    Circle,
    ChevronLeft,
    MoreVertical,
    Settings,
    FileText,
    Tag,
    Copy,
    RefreshCw
} from "lucide-react";
import AuthContext from "@/context/AuthContext";
import useAxiosAuth from "@/hooks/useAxiosAuth";
import { useNavigate } from "react-router-dom";
import JoditEditor from 'jodit-react';
import 'jodit/es2021/jodit.min.css';

export const SendEmail = () => {
    const api = useAxiosAuth();
    const navigate = useNavigate();
    const { authReady, authTokens } = useContext(AuthContext);

    // Navigation state
    const [currentView, setCurrentView] = useState('compose'); // 'inbox', 'compose', 'sent'
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [selectedEmail, setSelectedEmail] = useState(null);

    // Email history states
    const [emails, setEmails] = useState([]);
    const [filteredEmails, setFilteredEmails] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedStatus, setSelectedStatus] = useState("ALL");
    const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);

    // Compose email states
    const [subject, setSubject] = useState("");
    const [htmlMessage, setHtmlMessage] = useState("");
    const [selectedEvent, setSelectedEvent] = useState("");
    const [selectedUserIds, setSelectedUserIds] = useState([]);
    const [isEventBased, setIsEventBased] = useState(true);
    const [activeEvents, setActiveEvents] = useState([]);
    const [eventParticipants, setEventParticipants] = useState([]);
    const [allUsers, setAllUsers] = useState([]);

    // Loading states
    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingEvents, setIsLoadingEvents] = useState(false);
    const [isLoadingParticipants, setIsLoadingParticipants] = useState(false);
    const [isLoadingUsers, setIsLoadingUsers] = useState(false);
    const [errors, setErrors] = useState({});
    const [messageError, setMessageError] = useState("")
    // handleViewEmail function
    const handleViewEmail = (email) => {
        setSelectedEmail(email);
        setIsEmailModalOpen(true);
    };

    // Close modal function
    const handleCloseEmailModal = () => {
        setSelectedEmail(null);
        setIsEmailModalOpen(false);
    };

    const EmailDetailModal = ({ email, isOpen, onClose }) => {
        if (!isOpen || !email) return null;

        const getStatusBadgeColor = (status) => {
            switch (status) {
                case 'SENT':
                    return 'bg-green-100 text-green-800';
                case 'FAILED':
                    return 'bg-red-100 text-red-800';
                default:
                    return 'bg-gray-100 text-gray-800';
            }
        };

        return (
            <div className="fixed inset-0 z-50 overflow-y-auto">
                {/* Backdrop */}
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
                    onClick={onClose}
                ></div>

                {/* Modal */}
                <div className="flex min-h-full items-center justify-center p-4">
                    <div className="relative bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
                        {/* Header */}
                        <div className="border-b border-gray-200 px-6 py-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <h2 className="text-xl font-semibold text-gray-900 truncate max-w-md">
                                        {email.subject}
                                    </h2>
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeColor(email.status)}`}>
                                        {email.status}
                                    </span>
                                </div>
                                <button
                                    onClick={onClose}
                                    className="text-gray-400 hover:text-gray-600 transition-colors"
                                >
                                    <X className="w-6 h-6" />
                                </button>
                            </div>
                        </div>

                        {/* Email details */}
                        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                <div className="flex items-center gap-2">
                                    <Calendar className="w-4 h-4 text-gray-400" />
                                    <span className="text-gray-600">Sent:</span>
                                    <span className="font-medium">
                                        {new Date(email.created_at).toLocaleString('en-US', {
                                            year: 'numeric',
                                            month: 'short',
                                            day: 'numeric',
                                            hour: 'numeric',
                                            minute: '2-digit',
                                            hour12: true
                                        })}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Users className="w-4 h-4 text-gray-400" />
                                    <span className="text-gray-600">Recipients:</span>
                                    <span className="font-medium">
                                        {email.recipients.length} recipient{email.recipients.length !== 1 ? 's' : ''}
                                    </span>
                                </div>
                                {email.event_name && (
                                    <div className="flex items-center gap-2">
                                        <Tag className="w-4 h-4 text-gray-400" />
                                        <span className="text-gray-600">Event:</span>
                                        <span className="font-medium">{email.event_name}</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Recipients list */}
                        <div className="px-6 py-4 border-b border-gray-100">
                            <h3 className="text-sm font-medium text-gray-900 mb-3">
                                Recipients ({email.recipients.length})
                            </h3>
                            <div className="max-h-32 overflow-y-auto">
                                {email.recipients.length <= 10 ? (
                                    // Show all recipients if 20 or fewer
                                    <div className="flex flex-wrap gap-2">
                                        {email.recipients.map((recipient, index) => (
                                            <span
                                                key={index}
                                                className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
                                            >
                                                <Mail className="w-3 h-3 mr-1" />
                                                {recipient}
                                            </span>
                                        ))}
                                    </div>
                                ) : (
                                    // Show condensed view for large lists
                                    <div className="space-y-2">
                                        <div className="flex flex-wrap gap-2">
                                            {email.recipients.slice(0, 10).map((recipient, index) => (
                                                <span
                                                    key={index}
                                                    className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
                                                >
                                                    <Mail className="w-3 h-3 mr-1" />
                                                    {recipient}
                                                </span>
                                            ))}
                                        </div>
                                        {email.recipients.length > 10 && (
                                            <details className="group">
                                                <summary className="cursor-pointer text-sm text-blue-600 hover:text-blue-800 font-medium">
                                                    Show {email.recipients.length - 10} more recipients
                                                </summary>
                                                <div className="mt-2 pt-2 border-t border-gray-100">
                                                    <div className="flex flex-wrap gap-2">
                                                        {email.recipients.slice(10).map((recipient, index) => (
                                                            <span
                                                                key={index + 10}
                                                                className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
                                                            >
                                                                <Mail className="w-3 h-3 mr-1" />
                                                                {recipient}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                            </details>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Email content */}
                        <div className="flex-1 overflow-y-auto  ">
                            <div className="px-6 py-4  pb-8 ">
                                {/* <h3 className="text-sm font-medium text-gray-900 mb-3">Message Content</h3> */}
                                <div className="max-h-80  pb-4 pt-2 px-2 overflow-y-auto border border-gray-200 rounded-md">
                                    {email.html_message ? (
                                        <div
                                            className="prose prose-sm max-w-none p-4 overflow-auto"
                                            dangerouslySetInnerHTML={{ __html: email.html_message }}
                                        />
                                    ) : (
                                        <div className="whitespace-pre-wrap text-sm text-gray-700 bg-gray-50 p-4 overflow-auto">
                                            {email.message}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Footer actions */}
                        <div className="border-t border-gray-200 px-6 py-4 bg-gray-50">
                            <div className="flex items-center justify-between">
                                <div className="flex gap-2">
                                    {email.status === 'FAILED' && (
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="text-orange-600 border-orange-200 hover:bg-orange-50"
                                        >
                                            <RefreshCw className="w-4 h-4 mr-1" />
                                            Retry Send
                                        </Button>
                                    )}
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="text-blue-600 border-blue-200 hover:bg-blue-50"
                                    >
                                        <Copy className="w-4 h-4 mr-1" />
                                        Duplicate
                                    </Button>
                                </div>
                                <Button
                                    onClick={onClose}
                                    className="bg-blue-600 hover:bg-blue-700 text-white"
                                >
                                    Close
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    };


    // Fetch sent emails when auth is ready and viewing inbox/sent
    useEffect(() => {
        if (!authReady || !authTokens) return;

        if (currentView === 'inbox' || currentView === 'sent') {
            fetchSentEmails();
        }
    }, [authReady, authTokens, currentView]);

    // Fetch data for compose view
    useEffect(() => {
        if (!authReady || !authTokens) return;

        if (currentView === 'compose') {
            fetchActiveEvents();
            if (!isEventBased) {
                fetchAllUsers();
            }
        }
    }, [authReady, authTokens, currentView, isEventBased]);

    // Fetch participants when event is selected
    useEffect(() => {
        if (!authReady || !authTokens) return;

        if (selectedEvent && isEventBased && currentView === 'compose') {
            fetchEventParticipants(selectedEvent);
        }
    }, [selectedEvent, isEventBased, currentView, authReady, authTokens]);

    // Filter emails
    useEffect(() => {
        filterEmails();
    }, [emails, searchTerm, selectedStatus]);

    const fetchSentEmails = async () => {
        setIsLoading(true);
        try {
            const response = await api.get('/api/event/sent-mail-list/');
            console.log("Fetched sent emails:", response.data);
            setEmails(response.data || []);
        } catch (error) {
            console.error("Error fetching sent emails:", error);
            toast.error("Failed to load email history");
            setEmails([]);
        } finally {
            setIsLoading(false);
        }
    };

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
            setSelectedUserIds([]);
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

    const filterEmails = () => {
        let filtered = [...emails];

        if (searchTerm.trim()) {
            filtered = filtered.filter(email =>
                email.subject.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        if (selectedStatus !== "ALL") {
            filtered = filtered.filter(email => email.status === selectedStatus);
        }

        filtered.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        setFilteredEmails(filtered);
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'SENT':
                return <CheckCircle className="w-4 h-4 text-green-600" />;
            case 'FAILED':
                return <XCircle className="w-4 h-4 text-red-600" />;
            default:
                return <AlertTriangle className="w-4 h-4 text-gray-600" />;
        }
    };

    const getStatusBadge = (status) => {
        const variants = {
            'SENT': 'bg-green-100 text-green-800 border-green-200',
            'FAILED': 'bg-red-100 text-red-800 border-red-200',
            // 'PENDING': 'bg-yellow-100 text-yellow-800 border-yellow-200'
        };

        return (
            <Badge className={`${variants[status] || 'bg-gray-100 text-gray-800 border-gray-200'} border text-xs`}>
                <span className="flex items-center gap-1">
                    {getStatusIcon(status)}
                    {status}
                </span>
            </Badge>
        );
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInHours = (now - date) / (1000 * 60 * 60);

        if (diffInHours < 24) {
            return date.toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit'
            });
        } else {
            return date.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric'
            });
        }
    };

    const truncateMessage = (html, maxLength = 100) => {
        const text = html.replace(/<[^>]*>/g, '');
        return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
    };

    // Compose form handlers
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
        setErrors(prev => ({ ...prev, recipients: "" }));
    };

    const handleSelectAll = () => {
        const currentUserList = isEventBased ? eventParticipants : allUsers;
        const allUserIds = currentUserList.map(user =>
            isEventBased ? user.user : user.id
        );

        if (selectedUserIds.length === allUserIds.length) {
            setSelectedUserIds([]);
        } else {
            setSelectedUserIds(allUserIds);
        }
    };

    const validateForm = () => {
        const newErrors = {};

        if (!subject.trim()) newErrors.subject = "Email subject is required";
        console.log(htmlMessage);
        if (!htmlMessage.trim()) newErrors.htmlMessage = "Email message is required";

        if (isEventBased && !selectedEvent) {
            newErrors.event = "Please select an event";
        }

        if (selectedUserIds.length === 0) {
            newErrors.recipients = "Please select at least one recipient";
        }

        if (subject.trim().length > 200) {
            newErrors.subject = "Subject should be less than 200 characters";
        }

        if (htmlMessage.trim().length < 10) {
            newErrors.htmlMessage = "Message should be at least 10 characters long";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
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
            setSelectedUserIds([]);
            setErrors({});

            // Switch to sent view
            setTimeout(() => {
                setCurrentView('sent');
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

    // Sidebar navigation items
    const sidebarItems = [
        // { id: 'inbox', icon: Inbox, label: 'Inbox', count: filteredEmails.length },
        { id: 'compose', icon: Edit3, label: 'Compose' },
        { id: 'sent', icon: Send, label: 'Sent',  }
    ];

    const currentUserList = isEventBased ? eventParticipants : allUsers;
    const allUserIds = currentUserList.map(user => isEventBased ? user.user : user.id);
    const isAllSelected = selectedUserIds.length > 0 && selectedUserIds.length === allUserIds.length;

    // Render sidebar
    const renderSidebar = () => (
        <div className={`${sidebarOpen ? 'w-64' : 'w-[78px]'} bg-white border-r border-gray-200 flex flex-col transition-all duration-300 h-full`}>
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">

                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                >
                    <Menu className="w-4 h-4" />
                </Button>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4 ">
                <ul className="space-y-2">
                    {sidebarItems.map((item) => (
                        <li key={item.id}>
                            <Button
                                variant={currentView === item.id ? "default" : "ghost"}
                                className={`w-full justify-start ${!sidebarOpen && 'px-3'}`}
                                onClick={() => setCurrentView(item.id)}
                            >
                                <item.icon className="w-5 h-5 mr-2 " />
                                {sidebarOpen && (
                                    <>
                                        <span>{item.label}</span>
                                        {item.count !== undefined && (
                                            <Badge variant="secondary" className="ml-auto">
                                                {item.count}
                                            </Badge>
                                        )}
                                    </>
                                )}
                            </Button>
                        </li>
                    ))}
                </ul>
            </nav>
        </div>
    );

    // Render inbox/sent view
    const renderEmailList = () => (
        <div className="flex w-full justify-center  ">
            <div className="flex-1 flex flex-col  max-w-6xl">
                {/* Header */}
                <div className="border-b border-gray-200 p-4">
                    {/* <div className="flex items-center justify-between mb-4">
                <h1 className="text-2xl font-bold capitalize">{currentView}</h1>
            </div> */}

                    {/* Search and filters */}
                    <div className="flex gap-4">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                            <Input
                                placeholder="Search emails..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                        <div className="flex gap-2">
                            {['ALL', 'SENT', 'FAILED'].map((status) => (
                                <Button
                                    key={status}
                                    variant={selectedStatus === status ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => setSelectedStatus(status)}
                                    className="whitespace-nowrap"
                                >
                                    {status === 'ALL' ? 'All' : status}
                                </Button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Email list */}
                <div className="flex-1 overflow-auto">
                    {isLoading ? (
                        <div className="flex items-center justify-center h-64">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        </div>
                    ) : filteredEmails.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-64 text-gray-500 ">
                            <Mail className="w-16 h-16 mb-4 opacity-50" />
                            <h3 className="text-lg font-medium mb-2">No emails found</h3>
                            <p className="text-sm">
                                {searchTerm || selectedStatus !== 'ALL'
                                    ? "No emails match your current filters."
                                    : "You haven't sent any emails yet."
                                }
                            </p>
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-200 ">
                            {filteredEmails.map((email) => (
                                <div
                                    key={email.id}
                                    className="p-4 hover:bg-gray-50 cursor-pointer transition-colors border-l-4  hover:border-blue-200 "
                                    onClick={() => handleViewEmail(email)}
                                >
                                    <div className="flex items-start justify-between ">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-3 mb-2">
                                                <h3 className="font-semibold text-gray-900 truncate text-base">
                                                    {email.subject}
                                                </h3>
                                                {getStatusBadge(email.status)}
                                            </div>

                                            <p className="text-sm text-gray-600 truncate mb-3">
                                                {truncateMessage(email.html_message || email.message, 120)}
                                            </p>

                                            <div className="flex items-center gap-4 text-xs text-gray-500">
                                                <div className="flex items-center gap-1">
                                                    <Calendar className="w-3 h-3" />
                                                    {formatDate(email.created_at)}
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <Users className="w-3 h-3" />
                                                    {email.recipients.length} recipient{email.recipients.length !== 1 ? 's' : ''}
                                                </div>
                                                {email.event_name && (
                                                    <Badge variant="outline" className="text-xs px-2 py-0.5">
                                                        {email.event_name}
                                                    </Badge>
                                                )}
                                            </div>
                                        </div>

                                        <div className="ml-4 flex items-center gap-2">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleViewEmail(email);
                                                }}
                                                className="opacity-0 group-hover:opacity-100 hover:bg-blue-100 transition-all"
                                            >
                                                <Eye className="w-4 h-4" />
                                            </Button>
                                            <div className="text-xs text-gray-400 min-w-fit">
                                                {new Date(email.sent_at).toLocaleTimeString('en-US', {
                                                    hour: 'numeric',
                                                    minute: '2-digit',
                                                    hour12: true
                                                })}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>

    );

    // Render compose view
    const renderCompose = () => (
        <div className="flex justify-center">
            <div className="flex-1 flex flex-col ">


                <div className="flex-1 overflow-auto p-6">
                    <Card className="max-w-6xl mx-auto">
                        <CardContent className="p-6">
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
                                </div>

                                {/* Event Selection */}
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

                                            <div className="border rounded-lg max-h-64 overflow-y-auto">
                                                {(isLoadingParticipants || isLoadingUsers) ? (
                                                    <div className="p-4 text-center text-gray-500">
                                                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto mb-2"></div>
                                                        Loading {isEventBased ? 'participants' : 'users'}...
                                                    </div>
                                                ) : (
                                                    currentUserList.map((user) => {
                                                        const userId = isEventBased ? user.user : user.id;
                                                        const displayName = isEventBased ? user.participant_name : user.full_name_en;
                                                        const isSelected = selectedUserIds.includes(userId);

                                                        return (
                                                            <div
                                                                key={userId}
                                                                className={`flex items-center space-x-3 p-3 border-b last:border-b-0 hover:bg-gray-50 transition-colors ${isSelected ? 'bg-blue-50' : ''}`}
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

                                {/* Email Subject */}
                                <div className="space-y-2">
                                    <Label htmlFor="subject">Subject *</Label>
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
                                    <Label htmlFor="htmlMessage">Message *</Label>
                                    <div className="relative">
                                        <JoditEditor
                                            value={htmlMessage || ''}
                                            config={{
                                                readonly: false,
                                                height: 300,
                                                removeButtons: [
                                                    'source', 'image', 'file', 'video', 'speechRecognize',
                                                    'print', 'about', 'fullsize', 'selectall',
                                                    'symbol', 'copyformat', 'preview', 'find', 'emoticons',
                                                    'brush', 'fontsize', 'paragraph', 'link', 'table', 'hr', 'classSpan', 'superscript', 'subscript'
                                                ],
                                                style: {
                                                    backgroundColor: '#ffffff',
                                                    color: '#000000',
                                                    fontSize: '14px',
                                                    paddingLeft: '20px'
                                                },
                                            }}
                                            onBlur={(newContent) => {
                                                setHtmlMessage(newContent || '');
                                            }}
                                        />
                                        <div className="absolute w-full bottom-0 h-[21px] bg-white "></div>
                                    </div>

                                    {errors.htmlMessage && (
                                        <p className=" text-sm text-red-600 ">{errors.htmlMessage}</p>
                                    )}
                                </div>

                                {/* Submit Buttons */}
                                <div className="flex justify-center gap-4 pt-6">
                                    <Button
                                        type="submit"
                                        disabled={isLoading}
                                        className="flex-1 bg-blue transition-all duration-300 hover:scale-[1.02] text-primary-foreground hover:bg-blue/90"
                                        size="lg"
                                    >
                                        {isLoading ? (
                                            <div className="flex items-center">
                                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                                                Sending...
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
                                        onClick={() => {
                                            setSubject("");
                                            setHtmlMessage("");
                                            setSelectedEvent("");
                                            setSelectedUserIds([]);
                                            setErrors({});
                                        }}
                                        disabled={isLoading}
                                        size="lg"
                                        className="hover:bg-destructive text-white hover:text-destructive-foreground transition-all duration-300 hover:scale-[1.02] bg-red-800"
                                    >
                                        Clear
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>

    );

    if (!authReady || !authTokens) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 pt-16">
            <div className="flex h-screen">
                {/* Sidebar */}
                {renderSidebar()}

                {/* Main Content */}
                <div className="flex-1 flex flex-col min-w-0">
                    {currentView === 'compose' ? renderCompose() : renderEmailList()}
                </div>
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
            {isEmailModalOpen && (
                <EmailDetailModal
                    email={selectedEmail}
                    isOpen={isEmailModalOpen}
                    onClose={handleCloseEmailModal}
                />
            )}
        </div>
    );
};


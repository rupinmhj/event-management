import { useState, useEffect, useContext } from "react";
import { toast, ToastContainer } from 'react-toastify';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/Components/ui/card";
import { Button } from "@/Components/ui/button";
import { Badge } from "@/Components/ui/badge";
import { Input } from "@/Components/ui/input";
import AuthContext from "@/context/AuthContext";
import {
    Mail,
    Calendar,
    Users,
    CheckCircle,
    XCircle,
    Clock,
    Search,
    Eye,
    AlertTriangle,
    Plus
} from "lucide-react";
import useAxiosAuth from "@/hooks/useAxiosAuth";
import { useNavigate } from "react-router-dom";

const EmailHistory = () => {
    const api = useAxiosAuth();
    const navigate = useNavigate();
    const { authReady, authTokens } = useContext(AuthContext);
    // State management
    const [emails, setEmails] = useState([]);
    const [filteredEmails, setFilteredEmails] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedStatus, setSelectedStatus] = useState("ALL");

    useEffect(() => {
        if (!authReady || !authTokens) return;
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

        fetchSentEmails();
    }, [authReady, authTokens]);

    useEffect(() => {
        if (!authReady || !authTokens) return;
        filterEmails();
    }, [emails, searchTerm, selectedStatus, authReady, authTokens]);


    const filterEmails = () => {
        let filtered = [...emails];

        // Filter by search term (subject)
        if (searchTerm.trim()) {
            filtered = filtered.filter(email =>
                email.subject.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // Filter by status
        if (selectedStatus !== "ALL") {
            filtered = filtered.filter(email => email.status === selectedStatus);
        }

        // Sort by creation date (newest first)
        filtered.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

        setFilteredEmails(filtered);
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'SENT':
                return <CheckCircle className="w-4 h-4 text-green-600" />;
            case 'FAILED':
                return <XCircle className="w-4 h-4 text-red-600" />;
            case 'PENDING':
                return <Clock className="w-4 h-4 text-yellow-600" />;
            default:
                return <AlertTriangle className="w-4 h-4 text-gray-600" />;
        }
    };

    const getStatusBadge = (status) => {
        const variants = {
            'SENT': 'bg-green-100 text-green-800 border-green-200',
            'FAILED': 'bg-red-100 text-red-800 border-red-200',
            'PENDING': 'bg-yellow-100 text-yellow-800 border-yellow-200'
        };

        return (
            <Badge className={`${variants[status] || 'bg-gray-100 text-gray-800 border-gray-200'} border`}>
                <span className="flex items-center gap-1">
                    {getStatusIcon(status)}
                    {status}
                </span>
            </Badge>
        );
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const truncateMessage = (html, maxLength = 100) => {
        // Strip HTML tags for preview
        const text = html.replace(/<[^>]*>/g, '');
        return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
    };

    const handleViewDetails = (email) => {
        // You can implement a modal or navigate to a detail page
        console.log("View email details:", email);
        // For now, just show the full message in a simple alert
        // In a real app, you'd want to show this in a proper modal or detail page
        // alert(`Subject: ${email.subject}\n\nRecipients: ${email.recipients.join(', ')}\n\nMessage: ${email.message.replace(/<[^>]*>/g, '')}`);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4 w-full">
            <div className="max-w-6xl mx-auto pt-12">
                {/* Header */}


                {/* Filters */}
                <Card className="shadow-lg border-0 bg-white mb-6">
                    <CardContent className="p-4">
                        <div className="flex flex-col md:flex-row gap-4">
                            {/* Search */}
                            <div className="flex-1 relative">
                                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                <Input
                                    placeholder="Search by subject..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10"
                                />
                            </div>

                            {/* Status Filter */}
                            <div className="flex gap-2">
                                {['ALL', 'SENT', 'FAILED'].map((status) => (
                                    <Button
                                        key={status}
                                        variant={selectedStatus === status ? "default" : "outline"}
                                        size="sm"
                                        onClick={() => setSelectedStatus(status)}
                                        className="whitespace-nowrap"
                                    >
                                        {status === 'ALL' ? 'All Emails' : status}
                                    </Button>
                                ))}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Email List */}
                <Card className="shadow-xl border-0 bg-white">
                    <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                            <span>Sent Emails ({filteredEmails.length})</span>
                            {isLoading && (
                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                            )}
                        </CardTitle>
                    </CardHeader>

                    <CardContent>
                        {isLoading ? (
                            <div className="text-center py-12">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                                <p className="text-gray-600">Loading email history...</p>
                            </div>
                        ) : filteredEmails.length === 0 ? (
                            <div className="text-center py-12 text-gray-500">
                                <Mail className="w-16 h-16 mx-auto mb-4 opacity-50" />
                                <h3 className="text-lg font-medium mb-2">No emails found</h3>
                                <p className="text-sm">
                                    {searchTerm || selectedStatus !== 'ALL'
                                        ? "No emails match your current filters."
                                        : "You haven't sent any emails yet."
                                    }
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {filteredEmails.map((email) => (
                                    <div
                                        key={email.id}
                                        className="border rounded-lg p-4 hover:shadow-md transition-shadow bg-gray-50 hover:bg-gray-100"
                                    >
                                        <div className="flex items-start justify-between">
                                            {/* Email Info */}
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <h3 className="font-semibold text-lg text-gray-900">
                                                        {email.subject}
                                                    </h3>
                                                    {getStatusBadge(email.status)}
                                                </div>

                                                <div className="text-sm text-gray-600 mb-3">
                                                    <p className="mb-1">
                                                        {truncateMessage(email.html_message || email.message)}
                                                    </p>
                                                </div>

                                                <div className="flex items-center gap-4 text-xs text-gray-500">
                                                    <div className="flex items-center gap-1">
                                                        <Calendar className="w-3 h-3" />
                                                        {formatDate(email.created_at)}
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        <Users className="w-3 h-3" />
                                                        {email.recipients.length} recipient(s)
                                                    </div>
                                                    {email.event_name && (
                                                        <div className="flex items-center gap-1">
                                                            <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">
                                                                {email.event_name}
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>


                                            </div>

                                            {/* Action Button */}
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleViewDetails(email)}
                                                className="ml-4"
                                            >
                                                <Eye className="w-4 h-4 mr-1" />
                                                View
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
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

export default EmailHistory;
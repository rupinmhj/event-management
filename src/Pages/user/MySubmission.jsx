import React, { useContext, useEffect, useState } from 'react';
import { Search, Calendar, FileText, Clock, Eye, CheckCircle, XCircle } from 'lucide-react';
import AuthContext from '@/context/AuthContext';
import useAxiosAuth from '@/hooks/useAxiosAuth';
import { useNavigate } from 'react-router-dom';

const MySubmissions = () => {
    const [activeFilter, setActiveFilter] = useState('All Submissions');
    const [searchTerm, setSearchTerm] = useState('');
    const [submissions, setSubmissions] = useState([]);
    const [loading, setLoading] = useState(true);
    const api = useAxiosAuth();
    const { authTokens, authReady } = useContext(AuthContext);
    const navigate = useNavigate();

    const formatDateTime = (dateString) => {
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
    useEffect(() => {
        if (!authTokens && !authReady) return;

        const fetchData = async () => {
            try {
                setLoading(true);
                const ownParticipationResTwo = await api.get(`/api/event/own-participation-list/`);
                console.log('---event----ownParticipationResTwo', ownParticipationResTwo.data);



                // Transform API data to match component structure
                const transformedSubmissions = ownParticipationResTwo.data.map(item => ({
                    id: item.id,
                    eventId: item.event,
                    title: item.event_name,
                    event_start_date: item.event_start_date,
                    category: 'Event', // Default category since it's not in API
                    status: getSubmissionStatus(item.responses),
                    eventDate: 'TBD', // Not available in API, you might need another API call
                    submittedDate: 'N/A', // Not available in API
                    daysAgo: 0, // Calculate if needed
                    statusColor: getStatusColor(getSubmissionStatus(item.responses)),
                    responses: item.responses,
                    message: null
                }));

                setSubmissions(transformedSubmissions);

            } catch (error) {
                console.error('Error fetching submissions:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [authTokens, authReady]);

    // Determine status based on responses
    const getSubmissionStatus = (responses) => {
        if (!responses || responses.length === 0) {
            return 'Pending Review';
        }

        // Check if all required responses are filled
        const hasIncompleteResponses = responses.some(response =>
            !response.value || response.value.trim() === ''
        );

        if (hasIncompleteResponses) {
            return 'Under Review';
        }

        return 'Approved';
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'Under Review':
                return 'bg-orange-100 text-orange-700';
            case 'Approved':
                return 'bg-green-100 text-green-700';
            case 'Pending Review':
                return 'bg-gray-100 text-gray-700';
            case 'Rejected':
                return 'bg-red-100 text-red-700';
            default:
                return 'bg-gray-100 text-gray-700';
        }
    };

    const statusCounts = {
        'All Submissions': submissions.length,
        'Pending': submissions.filter(s => s.status === 'Pending Review').length,
        'Under Review': submissions.filter(s => s.status === 'Under Review').length,
        'Approved': submissions.filter(s => s.status === 'Approved').length,
        'Rejected': submissions.filter(s => s.status === 'Rejected').length
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'Pending Review':
                return <Clock className="w-6 h-6 text-gray-500" />;
            case 'Under Review':
                return <FileText className="w-6 h-6 text-orange-500" />;
            case 'Approved':
                return <CheckCircle className="w-6 h-6 text-green-500" />;
            case 'Rejected':
                return <XCircle className="w-6 h-6 text-red-500" />;
            default:
                return <Clock className="w-6 h-6 text-gray-500" />;
        }
    };

    const getStatusBadgeColor = (status) => {
        switch (status) {
            case 'Under Review':
                return 'bg-orange-500 text-white';
            case 'Approved':
                return 'bg-green-400 text-white';
            case 'Pending Review':
                return 'bg-gray-400 text-white';
            case 'Rejected':
                return 'bg-red-400 text-white';
            default:
                return 'bg-gray-400 text-white';
        }
    };

    const filteredSubmissions = submissions.filter(submission => {
        const matchesFilter = activeFilter === 'All Submissions' ||
            (activeFilter === 'Pending' && submission.status === 'Pending Review') ||
            (activeFilter === 'Under Review' && submission.status === 'Under Review') ||
            (activeFilter === 'Approved' && submission.status === 'Approved') ||
            (activeFilter === 'Rejected' && submission.status === 'Rejected');

        const safeSearch = (searchTerm || "").toLowerCase();
        const matchesSearch =
            (submission.title || "").toLowerCase().includes(safeSearch) ||
            (submission.category || "").toLowerCase().includes(safeSearch);

        return matchesFilter && matchesSearch;
    });


    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue"></div>
                <span className="ml-3">Loading submissions...</span>
            </div>
        );
    }

    return (
        <div className="min-h-screen  p-6">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="flex justify-between items-start mb-8">
                    <div>
                        <h1 className="text-xl  md:text-2xl font-bold text-gray-900 mb-2">My Submissions</h1>
                        <p className="text-gray-600 max-md:text-[14px]">Track the status of your event applications</p>
                    </div>
                    <button onClick={() => navigate('/user/events')} className="max-md:text-[12px] bg-blue hover:bg-blue/80 text-white px-2 md:px-6 md:py-3 py-1  rounded-lg font-medium transition-colors">
                        Browse More Events
                    </button>
                </div>

                {/* Search and Filters */}
                {/* <div className="flex flex-col md:flex-row gap-4 mb-6">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Search submissions..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-white/40 max-md:text-[14px] pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        />
                    </div>
                </div> */}

                {/* Submissions List */}
                <div className="space-y-4">
                    {filteredSubmissions.map((submission) => (
                        <div key={submission.id} className="bg-white/40 rounded-lg p-6 shadow-sm border">
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-start gap-4">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">

                                        </div>
                                        <h3 className="text-lg leading-tight font-semibold text-gray-900 mb-3  max-md:w-[200px]">
                                            {submission.title}
                                        </h3>
                                        <div className="flex  max-md:flex-col max-md:gap-2 max-md:text-[12px] items-start gap-6 text-sm text-gray-500  w-full">
                                            <div className="flex items-center gap-2 ">
                                                <Calendar className="w-4 h-4" />
                                                Start Date: {formatDateTime(submission.event_start_date)}
                                            </div>
                                            <div className="flex items-center gap-2 ">
                                                <FileText className="w-4 h-4" />
                                                Requirements Submitted: {submission.responses.length}
                                            </div>
                                        </div>

                                        {/* Show response details if available */}
                                        {/* {submission.responses.length > 0 && (
                                            <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                                                <h4 className="text-sm font-medium text-gray-700 mb-2">Submitted Information:</h4>
                                                <div className="space-y-1">
                                                    {submission.responses.map((response, index) => (
                                                        <div key={response.id} className="text-sm flex text-gray-600">
                                                            <span className="font-medium">{response.label}:</span>
                                                            {response.type === 'FILE' ? (
                                                                <span className="ml-1 text-blue-600">

                                                                    {response.file ? 'File uploaded' : 'No file uploaded'}
                                                                </span>
                                                            ) : (
                                                                <span className="ml-1"
                                                                    dangerouslySetInnerHTML={{
                                                                        __html: response.value || "Not provided"
                                                                    }}
                                                                />
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )} */}
                                    </div>
                                </div>
                                <div className="flex gap-2 ">
                                    <button onClick={() => navigate(`/user/event-detail/${submission.eventId}`)} className="btn-blue-secondary  ">
                                        <Eye className="w-4 h-4" />
                                        <span className='whitespace-nowrap'>View Event</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {filteredSubmissions.length === 0 && !loading && (
                    <div className="text-center py-12">
                        <div className="text-gray-400 text-lg mb-2">No submissions found</div>
                        <p className="text-gray-500">Try adjusting your search or filters</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MySubmissions;
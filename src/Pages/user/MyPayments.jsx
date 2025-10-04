import React, { useState, useEffect, useContext } from 'react';
import { Search, Eye, Calendar, CreditCard, User, CheckCircle, Clock, XCircle, ArrowLeft } from 'lucide-react';
import useAxiosAuth from '@/hooks/useAxiosAuth';
import AuthContext from '@/context/AuthContext';
import { PaginationControls } from '@/utils/PaginationControls';
import { useNavigate } from 'react-router-dom';

const MyPayments = () => {
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedPayment, setSelectedPayment] = useState(null);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const api = useAxiosAuth();
    const { authReady, authTokens } = useContext(AuthContext);
    const navigate = useNavigate();

    useEffect(() => {
        if (!authReady && !authTokens) return;
        fetchPayments();
    }, [api, authReady, authTokens, page, searchTerm]);

    const fetchPayments = async () => {
        try {
            setLoading(true);
            const params = {
                page: page,
            };
            if (searchTerm) {
                params.search = searchTerm;
            }
            const res = await api.get(`/api/event/payment-list/`, { params });
            console.log(res.data);
            setPayments(res.data.results || []);
            setTotalPages(res.data.total_pages || 1);
            setTotalCount(res.data.count || 0);
        } catch (error) {
            console.error('Error fetching payments:', error);
        } finally {
            setLoading(false);
        }
    };

    // Group payments by event
    const groupedPayments = payments.reduce((groups, payment) => {
        const eventId = payment.event;
        if (!groups[eventId]) {
            groups[eventId] = {
                event_id: eventId,
                event_title: payment.event_title,
                payments: []
            };
        }
        groups[eventId].payments.push(payment);
        return groups;
    }, {});

    // Convert grouped object to array and filter by search term
    const filteredGroupedPayments = Object.values(groupedPayments).filter(group =>
        group.event_title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        group.payments.some(payment =>
            payment.participant_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            payment.payment_method?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            payment.transaction_id?.toLowerCase().includes(searchTerm.toLowerCase())
        )
    );

    const getStatusColor = (status) => {
        switch (status?.toUpperCase()) {
            case 'SUCCESS':
                return 'bg-green-100 text-green-800 border-green-200';
            case 'PENDING':
                return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'FAILED':
                return 'bg-red-100 text-red-800 border-red-200';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const getStatusIcon = (status) => {
        switch (status?.toUpperCase()) {
            case 'SUCCESS':
                return <CheckCircle className="w-4 h-4" />;
            case 'PENDING':
                return <Clock className="w-4 h-4" />;
            case 'FAILED':
                return <XCircle className="w-4 h-4" />;
            default:
                return <Clock className="w-4 h-4" />;
        }
    };

    const formatDate = (dateString) => {
        console.log('dateString', dateString)
        const date = new Date(dateString);

        // Nepal timezone offset in minutes (+5:45 = 345 minutes)
        const nepalOffset = 5 * 60 + 45;

        // Convert date to UTC in milliseconds
        const utc = date.getTime() + date.getTimezoneOffset() * 60000;

        // Convert UTC to Nepal time
        const nepalTime = new Date(utc + nepalOffset * 60 * 1000);
        console.log('nepalTime', nepalTime)

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

    const formatAmount = (amount) => {
        return `Rs. ${parseFloat(amount).toFixed(2)}`;
    };

    const getTotalAmountForEvent = (payments) => {
        return payments.reduce((total, payment) => total + parseFloat(payment.amount), 0);
    };

    const getTotalTicketsForEvent = (payments) => {
        return payments.reduce((total, payment) => total + (payment.participant_tickets_list?.length || 0), 0);
    };

    const handleViewDetail = (payment) => {
        setSelectedPayment(payment);
        setShowDetailModal(true);
    };

    const closeDetailModal = () => {
        setShowDetailModal(false);
        setSelectedPayment(null);
    };

    const handleSearch = (value) => {
        setSearchTerm(value);
        setPage(1); // Reset to first page when searching
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue"></div>
                <span className="ml-3">Loading payments...</span>
            </div>
        );
    }

    return (
        <div className="min-h-screen  p-6">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="flex justify-between items-start mb-8">
                    <div>
                        <h1 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">My Payments</h1>
                        <p className="text-gray-600 max-md:text-[14px]">Track your payment history and transaction details</p>
                        <p className="text-sm text-gray-500 mt-1">
                            Showing {payments.length} of {totalCount} payments
                        </p>
                    </div>
                    <button onClick={() => navigate('/user/events')} className="max-md:text-[12px] bg-blue hover:bg-blue/80 text-white px-2 md:px-6 py-3 rounded-lg font-medium transition-colors">
                        Browse More Events
                    </button>
                </div>

                {/* Search and Filters */}
                {/* <div className=" rounded-xl shadow-sm mb-6 ">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Search payments..."
                            value={searchTerm}
                            onChange={(e) => handleSearch(e.target.value)}
                            className="w-full bg-black/20 max-md:text-[14px] pl-10 pr-4 py-3  rounded-lg focus:outline-none focus:ring-2 focus:ring-black/40 focus:border-transparent placeholder:white"
                        />
                    </div>
                </div> */}

                {/* Grouped Payments List */}
                <div className="space-y-4 ">
                    {filteredGroupedPayments.length === 0 ? (
                        <div className="bg-white/40 rounded-xl shadow-sm p-12 text-center">
                            <div className="text-gray-400 mb-4">
                                <CreditCard className="w-16 h-16 mx-auto" />
                            </div>
                            <h3 className="text-lg font-medium text-gray-900 mb-2">No payments found</h3>
                            <p className="text-gray-600">
                                {searchTerm ? 'Try adjusting your search terms' : 'You haven\'t made any payments yet'}
                            </p>
                        </div>
                    ) : (
                        filteredGroupedPayments.map((group) => (
                            <div key={group.event_id} className=" rounded-xl shadow-sm overflow-hidden">
                                {/* Event Header */}
                                <div className="bg-black bg-opacity-20 px-6 py-4  ">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h3 className="text-xl max-md:text-lg font-semibold text-gray-900">
                                                {group.event_title}
                                            </h3>
                                            <p className="text-sm max-md:text-[10px] text-gray-600 mt-1">
                                                {group.payments.length} payment{group.payments.length > 1 ? 's' : ''} • {getTotalTicketsForEvent(group.payments)} ticket{getTotalTicketsForEvent(group.payments) > 1 ? 's' : ''}
                                            </p>
                                        </div>
                                        <div className="text-right ">
                                            <div className="text-2xl max-md:text-xl  font-bold text-green-700">
                                                {formatAmount(getTotalAmountForEvent(group.payments))}
                                            </div>
                                            <div className="text-sm max-md:text-xs text-gray-500">Total Amount</div>
                                        </div>
                                    </div>
                                </div>

                                {/* Individual Payments */}
                                <div className="divide-y divide-gray-100 bg-white/20  ">
                                    {group.payments.map((payment, index) => (
                                        <div key={payment.id} className="px-6 py-4 hover:bg-black/5 transition-colors ">
                                            <div className="flex items-center justify-between ">
                                                <div className="flex-1">
                                                    {/* <div className="flex items-center gap-3 mb-2 ">
                                                        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(payment.status)}`}>
                                                            {getStatusIcon(payment.status)}
                                                            {payment.status}
                                                        </span>
                                                        <span className="text-sm text-gray-500">
                                                            Payment #{index + 1}
                                                        </span>
                                                    </div> */}

                                                    <div className="flex flex-col max-md:text-[12px] gap-2 text-sm text-gray-600 max-md:w-[150px] ">
                                                        <div className="flex items-center gap-2">
                                                            <Calendar className="w-4 h-4 text-gray-400" />
                                                            <span>{formatDate(payment.created_at)}</span>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <CreditCard className="w-4 h-4 text-gray-400" />
                                                            <span>{payment.payment_method}</span>
                                                        </div>
                                                        {/* <div className="flex items-center gap-2">
                                                            <User className="w-4 h-4 text-gray-400" />
                                                            <span>{payment.payment_by_name}</span>
                                                        </div> */}
                                                    </div>
                                                </div>

                                                <div className="flex   gap-6 ml-6  ">
                                                    <div className="flex justify-between gap-4 items-center ">
                                                        <div className="text-lg font-bold text-gray-800 max-md:text-[12px] whitespace-nowrap">
                                                            {formatAmount(payment.amount)}
                                                        </div>
                                                        <div className="text-sm text-gray-500 max-md:text-[13px]">
                                                            {payment.participant_tickets_list?.length || 0} ticket(s)
                                                        </div>
                                                    </div>
                                                    <button
                                                        onClick={() => handleViewDetail(payment)}
                                                        className="btn-blue-secondary"
                                                    >
                                                        <Eye className="w-4 h-4" />
                                                        <span className='max-md:hidden text-[14px]'>View Detail</span>

                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="mt-8 flex justify-center">
                        <PaginationControls
                            currentPage={page}
                            totalPages={totalPages}
                            onPageChange={setPage}
                        />
                    </div>
                )}

                {/* Payment Detail Modal */}
                {showDetailModal && selectedPayment && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                        <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                            <div className="p-6 border-b border-gray-200">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-xl font-bold text-gray-900">Payment Details</h2>
                                    <button
                                        onClick={closeDetailModal}
                                        className="text-gray-400 hover:text-gray-600 transition-colors"
                                    >
                                        <ArrowLeft className="w-6 h-6" />
                                    </button>
                                </div>
                            </div>

                            <div className="p-6 space-y-6">
                                {/* Payment Overview */}
                                <div className="bg-gray-50 rounded-lg p-4 ">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="font-semibold text-gray-900">{selectedPayment.event_title}</h3>
                                        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(selectedPayment.status)}`}>
                                            {getStatusIcon(selectedPayment.status)}
                                            {selectedPayment.status}
                                        </span>
                                    </div>
                                    <div className="text-3xl font-bold text-green-500 mb-2">
                                        {formatAmount(selectedPayment.amount)}
                                    </div>
                                </div>

                                {/* Transaction Details */}
                                <div>
                                    <h4 className="font-semibold text-gray-900 mb-4">Transaction Information</h4>
                                    <div className="grid grid-cols-1 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-500 mb-1">Transaction ID</label>
                                            <div className="text-sm text-gray-900 bg-gray-50 p-2 rounded font-mono break-words">
                                                {selectedPayment.transaction_id}
                                            </div>

                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-500 mb-1">Payment Method</label>
                                            <div className="text-sm text-gray-900">{selectedPayment.payment_method}</div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-500 mb-1">Payment Date</label>
                                            <div className="text-sm text-gray-900">{formatDate(selectedPayment.created_at)}</div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-500 mb-1">Paid By</label>
                                            <div className="text-sm text-gray-900">{selectedPayment.payment_by_name}</div>
                                        </div>
                                    </div>
                                </div>

                                {/* Tickets */}
                                <div>
                                    <h4 className="font-semibold text-gray-900 mb-4">Tickets Purchased</h4>
                                    <div className="space-y-3">
                                        {selectedPayment.participant_tickets_list?.map((ticket, index) => (
                                            <div key={ticket.id} className="border border-gray-200 rounded-lg p-4">
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <h5 className="font-medium text-gray-900">{ticket.ticket_label}</h5>
                                                        {/* <div className="text-sm text-gray-600 mt-1">
                                                            Ticket ID: #{ticket.id}
                                                        </div> */}
                                                    </div>
                                                    <div className="text-right">
                                                        <div className="font-semibold text-gray-900">
                                                            {formatAmount(ticket.paid_amount)}
                                                        </div>
                                                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${ticket.is_paid ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                                                            {ticket.is_paid ? <CheckCircle className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                                                            {ticket.is_paid ? 'Paid' : 'Unpaid'}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="p-6 border-t border-gray-200">
                                <button
                                    onClick={closeDetailModal}
                                    className="w-full bg-red-600 text-white py-3 px-4 rounded-lg hover:bg-red-400 transition-colors"
                                >
                                    Close Details
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
export default MyPayments;


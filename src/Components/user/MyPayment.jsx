import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Card, CardContent, CardHeader } from "@/Components/ui/card";
import { Button } from "@/Components/ui/button";
import { ScrollArea } from "@/Components/ui/scroll-area";
import { toast, ToastContainer } from 'react-toastify'
import {
    CreditCard,
    Eye,
    X,
    Calendar,
    User,
    Hash,
    Banknote,
    CheckCircle,
    Clock,
    XCircle,
    Receipt,
    Ticket,
    ShoppingCart,
    AlertCircle,
    Plus
} from "lucide-react";
import useAxiosAuth from "@/hooks/useAxiosAuth";

export const MyPayment = () => {
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedPayment, setSelectedPayment] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const { id } = useParams(); // eventId from route
    const api = useAxiosAuth();
    const navigate = useNavigate();
    useEffect(() => {
        const fetchMyPayments = async () => {
            try {
                setLoading(true);
                const res = await api.get(`/api/event/payment-list/?event=${id}`);
                console.log('my payments', res.data);
                setPayments(res.data || []);
            } catch (error) {
                console.error("Error fetching my payments:", error);
                setPayments([]);
            } finally {
                setLoading(false);
            }
        };

        fetchMyPayments();
    }, [id, api]);

    const getStatusIcon = (status) => {
        switch (status.toUpperCase()) {
            case 'COMPLETED':
            case 'SUCCESS':
                return <CheckCircle className="w-4 h-4 text-green-600" />;
            case 'PENDING':
                return <Clock className="w-4 h-4 text-yellow-600" />;
            case 'FAILED':
            case 'CANCELLED':
                return <XCircle className="w-4 h-4 text-red-600" />;
            default:
                return <Clock className="w-4 h-4 text-gray-600" />;
        }
    };

    const getStatusColor = (status) => {
        switch (status.toUpperCase()) {
            case 'COMPLETED':
            case 'SUCCESS':
                return 'text-green-600 bg-green-100';
            case 'PENDING':
                return 'text-yellow-600 bg-yellow-100';
            case 'FAILED':
            case 'CANCELLED':
                return 'text-red-600 bg-red-100';
            default:
                return 'text-gray-600 bg-gray-100';
        }
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

    const formatTicketsList = (ticketsList) => {
        if (!ticketsList || ticketsList.length === 0) return "No tickets";

        // Group tickets by label and sum quantities
        const ticketGroups = ticketsList.reduce((acc, ticket) => {
            const label = ticket.ticket_label || 'Unknown Ticket';
            if (acc[label]) {
                acc[label].count += 1;
                acc[label].totalAmount += parseFloat(ticket.paid_amount || 0);
            } else {
                acc[label] = {
                    count: 1,
                    totalAmount: parseFloat(ticket.paid_amount || 0)
                };
            }
            return acc;
        }, {});

        return Object.entries(ticketGroups)
            .map(([label, data]) => `${label} (${data.count})`)
            .join(", ");
    };

    const formatTicketsListDetailed = (ticketsList) => {
        if (!ticketsList || ticketsList.length === 0) return [];

        // Group tickets by label and sum quantities
        const ticketGroups = ticketsList.reduce((acc, ticket) => {
            const label = ticket.ticket_label || 'Unknown Ticket';
            if (acc[label]) {
                acc[label].count += 1;
                acc[label].totalAmount += parseFloat(ticket.paid_amount || 0);
                acc[label].tickets.push(ticket);
            } else {
                acc[label] = {
                    count: 1,
                    totalAmount: parseFloat(ticket.paid_amount || 0),
                    tickets: [ticket]
                };
            }
            return acc;
        }, {});

        return Object.entries(ticketGroups);
    };

    const getTotalPaymentAmount = () => {
        return payments.reduce((total, payment) => total + parseFloat(payment.amount || 0), 0);
    };

    const getTotalTicketsCount = () => {
        return payments.reduce((total, payment) => {
            return total + (payment.participant_tickets_list?.length || 0);
        }, 0);
    };

    const handleViewDetails = (payment) => {
        setSelectedPayment(payment);
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setSelectedPayment(null);
    };

    // Close modal on escape key
    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === 'Escape') {
                closeModal();
            }
        };

        if (showModal) {
            document.addEventListener('keydown', handleEscape);
            return () => document.removeEventListener('keydown', handleEscape);
        }
    }, [showModal]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[200px]">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    return (
        <>
            <Card>
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                            <Receipt className="w-5 h-5 text-primary" />
                            <div>
                                <h2 className="text-[16px] font-semibold">My Payment History</h2>
                                {payments.length > 0 && (
                                    <p className="text-sm text-gray-600">
                                        {payments.length} payment{payments.length > 1 ? 's' : ''} • {getTotalTicketsCount()} ticket{getTotalTicketsCount() > 1 ? 's' : ''} • Rs. {getTotalPaymentAmount().toLocaleString()} total
                                    </p>
                                )}
                            </div>
                        </div>
                        {payments.length > 0 && (
                            <div className="text-right">
                                <p className="text-sm text-gray-600">Total Spent</p>
                                <p className="text-lg font-bold text-gray-900">Rs. {getTotalPaymentAmount().toLocaleString()}</p>
                            </div>
                        )}
                    </div>
                </CardHeader>

                <CardContent>
                    {payments.length > 0 ? (
                        <ScrollArea className="max-h-[500px] overflow-auto">
                            <table className="min-w-full divide-y-2 divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr className="*:font-medium *:text-gray-900 text-[14px]">
                                        <th className="px-3 py-2 whitespace-nowrap text-left">Payment </th>
                                        <th className="px-3 py-2 whitespace-nowrap text-left">Date</th>
                                        {/* <th className="px-3 py-2 whitespace-nowrap text-left">Participant</th> */}
                                        <th className="px-3 py-2 whitespace-nowrap text-left">Tickets</th>
                                        <th className="px-3 py-2 whitespace-nowrap text-left">Payment Method</th>
                                        <th className="px-3 py-2 whitespace-nowrap text-right">Amount</th>
                                        <th className="px-3 py-2 whitespace-nowrap text-center">Status</th>
                                        <th className="px-3 py-2 whitespace-nowrap text-center">Actions</th>
                                    </tr>
                                </thead>

                                <tbody className="divide-y divide-gray-200">
                                    {payments.map((payment, idx) => (
                                        <tr key={payment.id} className="hover:bg-gray-50">
                                            <td className="px-3 py-2 text-[13px] text-left font-medium">
                                                {idx + 1}
                                            </td>
                                            <td className="px-3 py-2 text-[13px] text-left">
                                                {formatDate(payment.created_at)}
                                            </td>
                                            {/* <td className="px-3 py-2 text-[13px] text-left font-medium">
                                                {payment.participant_name}
                                            </td> */}
                                            <td className="px-3 py-2 text-[13px] text-left">
                                                <div className="max-w-[200px]">
                                                    {formatTicketsList(payment.participant_tickets_list)}
                                                </div>
                                            </td>
                                            <td className="px-3 py-2 text-[13px] text-left">
                                                <div className="flex items-center gap-1">
                                                    <Banknote className="w-3 h-3 text-gray-400" />
                                                    {payment.payment_method}
                                                </div>
                                            </td>
                                            <td className="px-3 py-2 text-[13px] text-right font-semibold">
                                                Rs. {parseFloat(payment.amount).toLocaleString()}
                                            </td>
                                            <td className="px-3 py-2 text-center">
                                                <div className="flex items-center justify-center gap-1">
                                                    {getStatusIcon(payment.status)}
                                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(payment.status)}`}>
                                                        {payment.status}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-3 py-2 text-center">
                                                <button
                                                    className="p-1 rounded hover:bg-blue-100/20 text-blue-600 transition-colors"
                                                    title="View Payment Details"
                                                    onClick={() => handleViewDetails(payment)}
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </ScrollArea>
                    ) : (
                        /* Enhanced Empty State - No Payments */
                        <div className="text-center py-6">
                            <div className="flex flex-col items-center max-w-md mx-auto ">
                                <div className="p-6 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-full mb-6 ">
                                    <ShoppingCart className="w-12 h-12 text-blue-500" />
                                </div>
                                <h3 className="text-xl font-semibold text-gray-900 mb-3">No Tickets Purchased Yet</h3>
                                <p className="text-gray-500 mb-6 leading-relaxed">
                                    You haven't bought any tickets for this event yet. Once you make a purchase, all your payment history and ticket details will appear here.
                                </p>

                                {/* Call to Action */}
                                <Button
                                    className="bg-blue hover:bg-blue/80 text-white flex items-center gap-2"
                                    onClick={() => {
                                        // Navigate to ticket purchase or show ticket selection
                                        navigate('/user/tickets')

                                    }}
                                >
                                    <Plus className="w-4 h-4" />
                                    Buy Tickets Now
                                </Button>
                                <p className="text-xs text-gray-400 mt-3">
                                    Browse available tickets for this event
                                </p>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Enhanced Payment Details Modal */}
            {showModal && selectedPayment && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">                        {/* Modal Header */}
                        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-100 rounded-full">
                                    <Receipt className="w-6 h-6 text-blue-600" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900">Payment Receipt</h3>
                                    {/* <p className="text-sm text-gray-600">Transaction #{selectedPayment.id}</p> */}
                                </div>
                            </div>
                            <button
                                onClick={closeModal}
                                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                            >
                                <X className="w-5 h-5 text-gray-500" />
                            </button>
                        </div>

                        {/* Modal Content */}
                        <ScrollArea className="max-h-[calc(90vh-120px)]">
                            <div className="p-6 space-y-6">
                                {/* Payment Status & Amount */}
                                <div className="text-center py-6 border-b border-gray-100">
                                    <div className="flex items-center justify-center gap-2 mb-3">
                                        {getStatusIcon(selectedPayment.status)}
                                        <span className={`px-4 py-2 rounded-full font-medium ${getStatusColor(selectedPayment.status)}`}>
                                            Payment {selectedPayment.status}
                                        </span>
                                    </div>
                                    <p className="text-4xl font-bold text-gray-900 mb-2">
                                        Rs. {parseFloat(selectedPayment.amount).toLocaleString()}
                                    </p>
                                    <p className="text-gray-600">Paid via {selectedPayment.payment_method}</p>
                                    <p className="text-sm text-gray-500 mt-1">{formatDate(selectedPayment.created_at)}</p>
                                </div>

                                {/* Event & Participant Info */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-2">
                                            <Calendar className="w-4 h-4 text-gray-500" />
                                            <span className="text-sm font-medium text-gray-700">Event Information</span>
                                        </div>
                                        <div className="bg-gray-50 p-4 rounded-lg">
                                            <p className="font-medium text-gray-900 mb-1">{selectedPayment.event_title}</p>
                                            {/* <p className="text-sm text-gray-600">Event ID: {selectedPayment.event}</p> */}
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <div className="flex items-center gap-2">
                                            <User className="w-4 h-4 text-gray-500" />
                                            <span className="text-sm font-medium text-gray-700">Participant Details</span>
                                        </div>
                                        <div className="bg-gray-50 p-4 rounded-lg">
                                            <p className="font-medium text-gray-900 mb-1">{selectedPayment.participant_name}</p>
                                            {/* <p className="text-sm text-gray-600">Payment by: {selectedPayment.payment_by_name}</p> */}
                                            {/* <p className="text-xs text-gray-500 mt-1">Participation ID: {selectedPayment.participation}</p> */}
                                        </div>
                                    </div>
                                </div>

                                {/* Transaction Details */}
                                <div className="space-y-3">
                                    <div className="flex items-center gap-2">
                                        <Hash className="w-4 h-4 text-gray-500" />
                                        <span className="text-sm font-medium text-gray-700">Transaction Information</span>
                                    </div>
                                    <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                                        <div>
                                            <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Transaction ID</label>
                                            <div className="flex items-center gap-2 mt-1">
                                                <p className="text-sm text-gray-900 font-mono bg-white px-3 py-2 rounded border flex-1 break-all">
                                                    {selectedPayment.transaction_id}
                                                </p>
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => {
                                                        navigator.clipboard.writeText(selectedPayment.transaction_id);
                                                        toast.success("Transaction ID copied!", { autoClose: 1500 });
                                                    }}
                                                    className="px-3 py-2 text-xs hover:bg-gray-600"
                                                >
                                                    Copy
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Tickets Details */}
                                <div className="space-y-3">
                                    <div className="flex items-center gap-2">
                                        <Ticket className="w-4 h-4 text-gray-500" />
                                        <span className="text-sm font-medium text-gray-700">Purchased Tickets</span>
                                    </div>
                                    <div className="space-y-3">
                                        {selectedPayment.participant_tickets_list && selectedPayment.participant_tickets_list.length > 0 ? (
                                            <>
                                                {formatTicketsListDetailed(selectedPayment.participant_tickets_list).map(([label, data], index) => (
                                                    <div key={index} className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-100">
                                                        <div className="flex justify-between items-start mb-3">
                                                            <div className="flex items-center gap-2">
                                                                <Ticket className="w-5 h-5 text-blue-600" />
                                                                <div>
                                                                    <p className="font-medium text-gray-900">{label}</p>
                                                                    <p className="text-sm text-gray-600">Quantity: {data.count}</p>
                                                                </div>
                                                            </div>
                                                            <div className="text-right">
                                                                <p className="text-sm text-gray-600">Subtotal</p>
                                                                <p className="font-bold text-lg text-gray-900">Rs. {data.totalAmount.toLocaleString()}</p>
                                                            </div>
                                                        </div>

                                                        {/* Individual Tickets */}
                                                        <div className="space-y-2">
                                                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Individual Tickets:</p>
                                                            {data.tickets.map((ticket) => (
                                                                <div key={ticket.id} className="bg-white p-3 rounded border border-blue-200">
                                                                    <div className="flex justify-between items-center">
                                                                        <div className="flex items-center gap-3">
                                                                            {/* <span className="text-xs font-mono text-gray-500 bg-gray-100 px-2 py-1 rounded">#{ticket.id}</span> */}
                                                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${ticket.is_paid ? 'text-green-600 bg-green-100' : 'text-red-600 bg-red-100'}`}>
                                                                                {ticket.is_paid ? '✓ Verified' : '✗ Pending'}
                                                                            </span>
                                                                        </div>
                                                                        <p className="font-medium text-gray-900">Rs. {parseFloat(ticket.paid_amount).toLocaleString()}</p>
                                                                    </div>
                                                                    <p className="text-xs text-gray-500 mt-1">
                                                                        Issued: {formatDate(ticket.created_at)}
                                                                    </p>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                ))}


                                            </>
                                        ) : (
                                            <div className="text-center py-8">
                                                <AlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                                <p className="text-gray-500">No ticket details available for this payment</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </ScrollArea>


                    </div>
                    <ToastContainer />
                </div>
            )}
        </>
    );
};
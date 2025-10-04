import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader } from "@/Components/ui/card";
import { Button } from "@/Components/ui/button";
import { ScrollArea } from "@/Components/ui/scroll-area";
import { CreditCard, Eye, ArrowRight, Download, X, Calendar, User, Hash, Banknote } from "lucide-react";
import useAxiosAuth from "@/hooks/useAxiosAuth";
import { PaginationControls } from "@/utils/PaginationControls"

export const ParticipationPayment = () => {
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedPayment, setSelectedPayment] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const { id } = useParams(); // eventId from route
    const api = useAxiosAuth();
    const navigate = useNavigate();
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);


    useEffect(() => {
        const fetchPayments = async () => {
            try {
                setLoading(true);
                const res = await api.get(`/api/event/payment-list/?event=${id}&page=${page}&page_size=10`);
                console.log('payments', res.data);
                setPayments(res.data.results);
                setTotalPages(res.data.total_pages);
            } catch (error) {
                console.error("Error fetching payment list:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchPayments();
    }, [id, api]);

    const exportPaymentDetails = async (eventId) => {
        try {
            const res = await api.get(`/api/event/${eventId}/payment-export/`, {
                responseType: "blob", // important
            });

            // Create a download URL
            const url = window.URL.createObjectURL(new Blob([res.data]));
            const link = document.createElement("a");
            link.href = url;

            // You can dynamically name the file if backend sends filename in headers
            const contentDisposition = res.headers["content-disposition"];
            let fileName = "payment-details.xlsx";
            if (contentDisposition) {
                const match = contentDisposition.match(/filename="?([^"]+)"?/);
                if (match?.[1]) fileName = match[1];
            }

            link.setAttribute("download", fileName);
            document.body.appendChild(link);
            link.click();
            link.remove();

            // Clean up URL
            window.URL.revokeObjectURL(url);
        } catch (err) {
            console.error("Payment export failed:", err);
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

    const formatTicketsList = (ticketsList) => {
        if (!ticketsList || ticketsList.length === 0) return "No tickets";

        // Group tickets by label and sum quantities
        const ticketGroups = ticketsList.reduce((acc, ticket) => {
            const label = ticket.ticket_label;
            if (acc[label]) {
                acc[label].count += 1;
                acc[label].totalAmount += parseFloat(ticket.paid_amount);
            } else {
                acc[label] = {
                    count: 1,
                    totalAmount: parseFloat(ticket.paid_amount)
                };
            }
            return acc;
        }, {});

        return Object.entries(ticketGroups)
            .map(([label, data]) => `${label} (${data.count})`)
            .join(", ");
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
                            <CreditCard className="w-5 h-5 text-primary" />
                            <h2 className="text-[16px] font-semibold">Payment Details</h2>
                        </div>
                        {/* <Button
                            className="flex items-center gap-2 bg-green-600/90 text-white hover:text-white hover:bg-green-600/70"
                            onClick={() => exportPaymentDetails(id)}
                        >
                            <Download className="w-4 h-4" />
                            Export Payment Details
                            <ArrowRight className="w-4 h-4 transform transition-transform duration-200 hover:scale-x-110" />
                        </Button> */}
                    </div>
                </CardHeader>

                <CardContent>
                    <ScrollArea className="max-h-[500px] overflow-auto">
                        <table className="min-w-full divide-y-2 divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr className="*:font-medium *:text-gray-900 text-[14px]">
                                    <th className="px-3 py-2 whitespace-nowrap text-left">S.N</th>
                                    <th className="px-3 py-2 whitespace-nowrap text-left">Participant Name</th>
                                    <th className="px-3 py-2 whitespace-nowrap text-left">Tickets</th>
                                    <th className="px-3 py-2 whitespace-nowrap text-right">Total Amount</th>
                                    <th className="px-3 py-2 whitespace-nowrap text-center">Status</th>
                                    <th className="px-3 py-2 whitespace-nowrap text-center">View Details</th>
                                </tr>
                            </thead>

                            <tbody className="divide-y divide-gray-200">
                                {payments.length > 0 ? (
                                    payments.map((payment, idx) => (
                                        <tr key={payment.id} className="hover:bg-gray-50">
                                            <td className="px-3 py-2 text-[13px] text-left">{idx + 1}</td>
                                            <td className="px-3 py-2 text-[13px] text-left font-medium">
                                                {payment.participant_name}
                                            </td>
                                            <td className="px-3 py-2 text-[13px] text-left">
                                                {formatTicketsList(payment.participant_tickets_list)}
                                            </td>
                                            <td className="px-3 py-2 text-[13px] text-right font-semibold">
                                                Rs. {parseFloat(payment.amount).toLocaleString()}
                                            </td>
                                            <td className="px-3 py-2 text-center">
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(payment.status)}`}>
                                                    {payment.status}
                                                </span>
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
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="6" className="text-center py-4 text-gray-500">
                                            No payment records found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </ScrollArea>
                </CardContent>
            </Card>

            {/* Payment Details Modal */}
            {showModal && selectedPayment && (
                <div className="fixed inset-0 bg-black/50  z-50 p-4 ">
                    <div className="bg-white rounded-lg shadow-xl max-w-5xl   max-h-[90vh] overflow-y-auto mx-auto mt-5
">
                        {/* Modal Header */}
                        <div className="flex items-center justify-between p-6 border-b border-gray-200">
                            <div className="flex items-center gap-3">
                                <CreditCard className="w-6 h-6 text-blue-600" />
                                <h3 className="text-lg font-semibold text-gray-900">Payment Details</h3>
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
                                {/* Payment Overview */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-2">
                                            <User className="w-4 h-4 text-gray-500" />
                                            <span className="text-sm font-medium text-gray-700">Participant Information</span>
                                        </div>
                                        <div className="bg-gray-50 p-3 rounded-lg">
                                            <p className="font-medium text-gray-900">{selectedPayment.participant_name}</p>
                                            <p className="text-sm text-gray-600">Paid by: {selectedPayment.payment_by_name}</p>
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <div className="flex items-center gap-2">
                                            <Banknote className="w-4 h-4 text-gray-500" />
                                            <span className="text-sm font-medium text-gray-700">Payment Information</span>
                                        </div>
                                        <div className="bg-gray-50 p-3 rounded-lg">
                                            <p className="font-semibold text-xl text-gray-900">Rs. {parseFloat(selectedPayment.amount).toLocaleString()}</p>
                                            <p className="text-sm text-gray-600">via {selectedPayment.payment_method}</p>
                                            <div className="flex items-center gap-2 mt-2">
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedPayment.status)}`}>
                                                    {selectedPayment.status}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Transaction Details */}
                                <div className="space-y-3">
                                    <div className="flex items-center gap-2">
                                        <Hash className="w-4 h-4 text-gray-500" />
                                        <span className="text-sm font-medium text-gray-700">Transaction Details</span>
                                    </div>
                                    <div className="bg-gray-50 p-4 rounded-lg">
                                        <div className="grid grid-cols-1 gap-3">
                                            <div>
                                                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Transaction ID</label>
                                                <p className="text-sm text-gray-900 font-mono bg-white px-2 py-1 rounded border mt-1">
                                                    {selectedPayment.transaction_id}
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <div>
                                                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Payment Date</label>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <Calendar className="w-3 h-3 text-gray-400" />
                                                        <p className="text-sm text-gray-900">{formatDate(selectedPayment.created_at)}</p>
                                                    </div>
                                                </div>
                                                <div>
                                                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Event</label>
                                                    <p className="text-sm text-gray-900 mt-1">{selectedPayment.event_title}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Tickets Details */}
                                <div className="space-y-3">
                                    <div className="flex items-center gap-2">
                                        <CreditCard className="w-4 h-4 text-gray-500" />
                                        <span className="text-sm font-medium text-gray-700">Ticket Details</span>
                                    </div>
                                    <div className="bg-gray-50 p-4 rounded-lg">
                                        {selectedPayment.participant_tickets_list && selectedPayment.participant_tickets_list.length > 0 ? (
                                            <div className="space-y-3">
                                                {selectedPayment.participant_tickets_list.map((ticket, index) => (
                                                    <div key={ticket.id} className="bg-white p-3 rounded border">
                                                        <div className="flex justify-between items-start">
                                                            <div>
                                                                <p className="font-medium text-gray-900">{ticket.ticket_label}</p>
                                                                <p className="text-xs text-gray-500 mt-1">
                                                                    Ticket ID: {ticket.id} |
                                                                    Created: {formatDate(ticket.created_at)}
                                                                </p>
                                                                <div className="flex items-center gap-2 mt-2">
                                                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${ticket.is_paid ? 'text-green-600 bg-green-100' : 'text-red-600 bg-red-100'}`}>
                                                                        {ticket.is_paid ? 'Paid' : 'Unpaid'}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                            <div className="text-right">
                                                                <p className="font-semibold text-gray-900">Rs. {parseFloat(ticket.paid_amount).toLocaleString()}</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}

                                                {/* Total Summary */}
                                                <div className="border-t pt-3 mt-3">
                                                    <div className="flex justify-between items-center">
                                                        <span className="font-medium text-gray-700">Total Amount:</span>
                                                        <span className="font-bold text-lg text-gray-900">
                                                            Rs. {parseFloat(selectedPayment.amount).toLocaleString()}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        ) : (
                                            <p className="text-gray-500 text-center py-4">No ticket details available</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </ScrollArea>

                        {/* Modal Footer */}
                        <div className="flex justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
                            <Button
                                variant="outline"
                                onClick={closeModal}
                                className="px-4 py-2"
                            >
                                Close
                            </Button>

                        </div>
                    </div>
                    <PaginationControls
                        currentPage={page}
                        totalPages={totalPages}
                        onPageChange={setPage}
                    />
                </div>
            )}
        </>
    );
};
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { TabsContent } from "@/components/ui/tabs";
import { CreditCard, Eye, ArrowRight, Download } from "lucide-react";
import useAxiosAuth from "@/hooks/useAxiosAuth";

export const ParticipationPayment = () => {
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);
    const { id } = useParams(); // eventId from route
    const api = useAxiosAuth();
    const navigate = useNavigate();

    useEffect(() => {
        const fetchPayments = async () => {
            try {
                setLoading(true);
                const res = await api.get(`/api/event/payment-list/?event=${id}`);
                console.log('payments', res.data);
                setPayments(res.data);
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

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[200px]">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    return (
        <TabsContent value="payments">
            <Card>
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                            <CreditCard className="w-5 h-5 text-primary" />
                            <h2 className="text-[16px] font-semibold">Payment Details</h2>
                        </div>
                        <Button
                            className="flex items-center gap-2 bg-green-600/90 text-white hover:text-white hover:bg-green-600/70"
                            onClick={() => exportPaymentDetails(id)}
                        >
                            <Download className="w-4 h-4" />
                            Export Payment Details
                            <ArrowRight className="w-4 h-4 transform transition-transform duration-200 hover:scale-x-110" />
                        </Button>
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
                                                    className="p-1 rounded hover:bg-blue/20 text-blue-600"
                                                    title="View Payment Details"
                                                    onClick={() => navigate(`/admin/payment-details/${payment.id}`)}
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
        </TabsContent>
    );
};
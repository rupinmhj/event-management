import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Card, CardContent } from "@/Components/ui/card";
import { Button } from "@/Components/ui/button";
import { Ticket, Pencil, Trash2, Plus, DollarSign } from "lucide-react";
import { TabsContent } from "@/Components/ui/tabs";
import useAxiosAuth from "@/hooks/useAxiosAuth";

export const PricingView = () => {
    const [ticketsData, setTicketsData] = useState([]);
    const [loading, setLoading] = useState(true);
    const api = useAxiosAuth();
    const navigate = useNavigate();
    const { id } = useParams();
    const eventId = id;

    useEffect(() => {
        const fetchTickets = async () => {
            if (!id) {
                setLoading(false);
                return;
            }

            try {
                const response = await api.get('/api/event/create-tickets/');
                // Filter tickets for the current event
                const eventTickets = response.data.filter(ticket => ticket.event == eventId);
                console.log("eventId", eventId);
                console.log("ticketId", response.data[0])
                setTicketsData(eventTickets);
                console.log(eventTickets)

            } catch (error) {
                console.error("Error fetching tickets:", error);
                setTicketsData([]);
            } finally {
                setLoading(false);
            }
        };

        fetchTickets();
    }, [api, id]);

    const handleDeleteTicket = async (ticketId) => {
        if (!window.confirm("Are you sure you want to delete this ticket?")) {
            return;
        }

        try {
            // Optimistic UI update
            setTicketsData((prev) => prev.filter((ticket) => ticket.id !== ticketId));

            await api.delete(`/api/event/create-tickets/${ticketId}/`);
        } catch (error) {
            console.error("Error deleting ticket:", error);
            // Revert state on error - refetch data
            const response = await api.get('/api/event/create-tickets/');
            const eventTickets = response.data.filter(ticket => ticket.event === eventId);
            setTicketsData(eventTickets);
        }
    };

    const formatCurrency = (amount) => {
        return `Rs. ${parseFloat(amount).toLocaleString()}`;
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

    if (loading) {
        return (
            <TabsContent value="pricing" className="min-h-[70vh]">
                <Card>
                    <CardContent className="text-center py-10">
                        Loading tickets...
                    </CardContent>
                </Card>
            </TabsContent>
        );
    }

    return (
        <TabsContent value="ticket-price" className="min-h-[70vh]">
            <Card>
                <div>
                    <div className="flex justify-between md:px-8 px-2 md:py-6 py-3 ">
                        <div className="flex items-center gap-2 min-lg:hidden">
                            <DollarSign className="w-5 h-5 text-primary" />
                            <h2 className="text-[16px] font-semibold">Event Pricing</h2>
                        </div>

                        {/* Show Add Ticket button if we have an event ID */}
                        {eventId && (
                            <Button
                                onClick={() =>
                                    navigate("/admin/tickets-pricing", {
                                        state: { eventId },
                                    })
                                }
                                className="bg-blue hover:bg-blue/90 text-white shadow-lg hover:shadow-xl transition-all duration-200 flex items-center"
                            >
                                <Plus className="w-4 h-4 mr-2" />
                                <span className="hidden md:inline">Add Ticket</span>
                            </Button>
                        )}
                    </div>
                </div>

                {/* If no tickets, show a message */}
                {ticketsData.length === 0 ? (
                    <CardContent className="text-center text-gray-500 py-10">
                        <Ticket className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                        <p>No tickets set up yet.</p>
                        {eventId && (
                            <Button
                                onClick={() =>
                                    navigate("/admin/tickets-pricing", {
                                        state: { eventId },
                                    })
                                }
                                className="mt-4 bg-blue hover:bg-blue/90"
                            >
                                Create Your First Ticket
                            </Button>
                        )}
                    </CardContent>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y-2 divide-gray-200">
                            <thead className="ltr:text-left rtl:text-right">
                                <tr className="*:font-medium *:text-gray-900 *:first:sticky *:first:left-0 *:first:bg-white text-[16px]">
                                    <th className="px-3 py-2 whitespace-nowrap text-[14px]">Ticket type</th>
                                    <th className="px-3 py-2 whitespace-nowrap text-[14px]">Description</th>
                                    <th className="px-3 py-2 whitespace-nowrap text-[14px]">Amount</th>
                                    <th className="px-3 py-2 whitespace-nowrap text-[14px]">Deadline</th>
                                    <th className="px-3 py-2 whitespace-nowrap text-center text-[14px]">Actions</th>
                                </tr>
                            </thead>

                            <tbody className="divide-y divide-gray-200">
                                {ticketsData.map((ticket) => (
                                    <tr key={ticket.id}>
                                        <td className="px-3 py-2 whitespace-nowrap text-[13px]">
                                            <div className="flex items-center gap-2">
                                                <Ticket className="w-4 h-4 text-blue-600" />
                                                <span className="font-medium">{ticket.label}</span>
                                            </div>
                                        </td>
                                        <td className="px-3 py-2 text-[13px] max-w-xs">
                                            <div className="truncate" title={ticket.description}>
                                                {ticket.description}
                                            </div>
                                        </td>
                                        <td className="px-3 py-2 whitespace-nowrap text-[13px]">
                                            <span className="font-semibold text-green-600">
                                                {formatCurrency(ticket.amount)}
                                            </span>
                                        </td>
                                        <td className="px-3 py-2 whitespace-nowrap text-[13px]">
                                            {formatDate(ticket.deadline)}
                                        </td>
                                        <td className="px-3 py-2 whitespace-nowrap text-center">
                                            <div className="flex gap-2 justify-center">
                                                <button
                                                    onClick={() => navigate(`/admin/ticket-update/${ticket.id}`)}
                                                    className="p-1 rounded hover:bg-blue/20 text-blue-600"
                                                    title="Edit"
                                                >
                                                    <Pencil className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteTicket(ticket.id)}
                                                    className="p-1 rounded hover:bg-red-100 text-red-600"
                                                    title="Delete"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </Card>
        </TabsContent>
    );
};
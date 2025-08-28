import React, { useEffect, useState, useContext } from 'react';
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TabsContent } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import useAxiosAuth from '@/hooks/useAxiosAuth';
import AuthContext from '@/context/AuthContext';
import { useNavigate, useParams } from "react-router-dom";
import { toast } from 'react-toastify';
import {
    Ticket,
    CreditCard,
    ShoppingCart,
    Clock,
    DollarSign,
    Calendar,
    CheckCircle,
    AlertCircle
} from "lucide-react";

export function TicketPriceView() {
    const [ticketsData, setTicketsData] = useState([]);
    const [selectedTickets, setSelectedTickets] = useState(new Set());
    const [isLoading, setIsLoading] = useState(true);
    const [isProcessingPayment, setIsProcessingPayment] = useState(false);
    const [processingTicketId, setProcessingTicketId] = useState(null);
    const { hasProfile } = useContext(AuthContext);
    const api = useAxiosAuth();
    const navigate = useNavigate();
    const { id: eventId } = useParams();

    useEffect(() => {
        const fetchTickets = async () => {
            setIsLoading(true);
            try {
                const res = await api.get(`/api/event/ticket-list/?event=${eventId}`);
                setTicketsData(res.data || []);
            } catch (error) {
                console.error("Error fetching tickets:", error);
                toast.error('Failed to load tickets. Please try again.');
            } finally {
                setIsLoading(false);
            }
        };

        if (eventId) {
            fetchTickets();
        }
    }, [eventId, api]);

    const handleTicketSelection = (ticketId, checked) => {
        const newSelection = new Set(selectedTickets);
        if (checked) newSelection.add(ticketId);
        else newSelection.delete(ticketId);
        setSelectedTickets(newSelection);
    };

    const handleSelectAll = (checked) => {
        if (checked) {
            const availableTicketIds = ticketsData
                .filter(ticket => !isDeadlinePassed(ticket.deadline))
                .map(ticket => ticket.id);
            setSelectedTickets(new Set(availableTicketIds));
        } else {
            setSelectedTickets(new Set());
        }
    };

    const getSelectedTicketsData = () => {
        return ticketsData.filter(ticket => selectedTickets.has(ticket.id));
    };

    const getTotalAmount = () => {
        return getSelectedTicketsData().reduce((total, ticket) => total + parseFloat(ticket.amount), 0);
    };

    const isDeadlineNear = (deadline) => {
        if (!deadline) return false;
        const deadlineDate = new Date(deadline);
        const now = new Date();
        const diffInDays = Math.ceil((deadlineDate - now) / (1000 * 60 * 60 * 24));
        return diffInDays <= 3 && diffInDays > 0;
    };

    const isDeadlinePassed = (deadline) => {
        if (!deadline) return false;
        return new Date(deadline) < new Date();
    };

    const formatDeadline = (deadline) => {
        if (!deadline) return 'No deadline';
        const date = new Date(deadline);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    const handleSingleTicketPurchase = async (ticket) => {
        if (!hasProfile) {
            toast.info('Please complete your profile before purchasing tickets.');
            setTimeout(() => {
                navigate('/user/setup-profile');
            }, 1000);
            return;
        }

        if (isDeadlinePassed(ticket.deadline)) {
            toast.error('Ticket sales deadline has passed.');
            return;
        }

        try {
            setProcessingTicketId(ticket.id);
            
            // Get participation ID for this event
            const participationRes = await api.get(`/api/event/own-participation-list/?event=${eventId}`);
            console.log('Participation data:', participationRes.data);
            const pid = participationRes.data[0].id;
            console.log('Participation ID:', pid);
            
            // Create payload with selected ticket
            const payload = {
                tickets: [{ ticket_id: ticket.id }]
            };
            console.log('Single ticket payload:', payload);

            // Make the API call to create ticket order
            const orderRes = await api.post(
                `/api/event/participation/${pid}/tickets/`,
                payload
            );
            console.log('Order response:', orderRes.data);
            const { total_amount } = orderRes.data;
            console.log("Total amount:", total_amount);

            // Navigate to payment page
            navigate(`/user/payment/${pid}`, { 
                state: { 
                    totalAmount: total_amount,
                    pid: pid 
                } 
            });

        } catch (error) {
            console.error('Payment initiation failed:', error);
            toast.error('Failed to initiate payment. Please try again.');
        } finally {
            setProcessingTicketId(null);
        }
    };

    const handleBulkPayment = async () => {
        if (!hasProfile) {
            toast.info('Please complete your profile before purchasing tickets.');
            setTimeout(() => {
                navigate('/user/setup-profile');
            }, 1000);
            return;
        }

        if (selectedTickets.size === 0) {
            toast.warning('Please select at least one ticket.');
            return;
        }

        const selectedTicketsData = getSelectedTicketsData();
        const expiredTickets = selectedTicketsData.filter(ticket => isDeadlinePassed(ticket.deadline));

        if (expiredTickets.length > 0) {
            toast.error('Some selected tickets have expired. Please remove them and try again.');
            return;
        }

        try {
            setIsProcessingPayment(true);
            
            // Get participation ID for this event
            const participationRes = await api.get(`/api/event/own-participation-list/?event=${eventId}`);
            console.log('Participation data:', participationRes.data);
            const pid = participationRes.data[0].id;
            console.log('Participation ID:', pid);

            // Create payload with selected tickets
            const payload = {
                tickets: selectedTicketsData.map(ticket => ({ ticket_id: ticket.id }))
            };
            console.log('Bulk payment payload:', payload);

            // Make the API call for bulk payment
            const orderRes = await api.post(
                `/api/event/participation/${pid}/tickets/`,
                payload
            );
            console.log('Bulk order response:', orderRes.data);
            const { total_amount } = orderRes.data;
            console.log("Total amount:", total_amount);

            // Navigate to payment page
            navigate(`/user/payment/${pid}`, { 
                state: { 
                    totalAmount: total_amount,
                    pid: pid 
                } 
            });

            // Clear selections after successful initiation
            setSelectedTickets(new Set());

        } catch (error) {
            console.error('Bulk payment initiation failed:', error);
            toast.error('Failed to initiate bulk payment. Please try again.');
        } finally {
            setIsProcessingPayment(false);
        }
    };

    const totalTickets = ticketsData.length;
    const availableTickets = ticketsData.filter(ticket => !isDeadlinePassed(ticket.deadline)).length;
    const expiredTickets = totalTickets - availableTickets;

    if (isLoading) {
        return (
            <TabsContent value="tickets">
                <Card>
                    <CardContent className="flex items-center justify-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </CardContent>
                </Card>
            </TabsContent>
        );
    }

    return (
        <Card>
            <CardContent>
                {!ticketsData || ticketsData.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                            <Ticket className="w-8 h-8 text-muted-foreground" />
                        </div>
                        <h3 className="text-[16px] font-semibold mb-2">No Tickets Available</h3>
                        <p className="text-[13px] text-muted-foreground max-w-md">
                            This event currently has no tickets available for purchase.
                        </p>
                    </div>
                ) : (
                    <>
                        {/* Summary Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                            <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg">
                                <div className="flex items-center gap-2">
                                    <Ticket className="w-5 h-5 text-blue-600" />
                                    <div>
                                        <p className="text-sm font-medium text-blue-800 dark:text-blue-200">
                                            Total Tickets
                                        </p>
                                        <p className="text-xl font-bold text-blue-900 dark:text-blue-100">
                                            {totalTickets}
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-green-50 dark:bg-green-950 p-4 rounded-lg">
                                <div className="flex items-center gap-2">
                                    <CheckCircle className="w-5 h-5 text-green-600" />
                                    <div>
                                        <p className="text-sm font-medium text-green-800 dark:text-green-200">
                                            Available
                                        </p>
                                        <p className="text-xl font-bold text-green-900 dark:text-green-100">
                                            {availableTickets}
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-orange-50 dark:bg-orange-950 p-4 rounded-lg">
                                <div className="flex items-center gap-2">
                                    <AlertCircle className="w-5 h-5 text-orange-600" />
                                    <div>
                                        <p className="text-sm font-medium text-orange-800 dark:text-orange-200">
                                            Expired
                                        </p>
                                        <p className="text-xl font-bold text-orange-900 dark:text-orange-100">
                                            {expiredTickets}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Bulk Selection Controls */}
                        {availableTickets > 1 && (
                            <div className="bg-muted/50 p-4 rounded-lg mb-6">
                                <div className="flex items-center justify-between flex-wrap gap-4">
                                    <div className="flex items-center gap-3">
                                        <Checkbox
                                            id="select-all"
                                            checked={selectedTickets.size === availableTickets && availableTickets > 0}
                                            onCheckedChange={handleSelectAll}
                                        />
                                        <label htmlFor="select-all" className="text-sm font-medium">
                                            Select all available tickets
                                        </label>
                                    </div>
                                    {selectedTickets.size > 0 && (
                                        <div className="flex items-center gap-4">
                                            <div className="text-sm text-muted-foreground">
                                                {selectedTickets.size} ticket{selectedTickets.size > 1 ? 's' : ''} selected
                                            </div>
                                            <div className="text-lg font-semibold text-primary">
                                                Rs. {getTotalAmount().toFixed(2)}
                                            </div>
                                            <Button
                                                onClick={handleBulkPayment}
                                                disabled={isProcessingPayment}
                                                className="bg-primary hover:bg-primary/80"
                                            >
                                                {isProcessingPayment ? (
                                                    <>
                                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                                        Processing...
                                                    </>
                                                ) : (
                                                    <>
                                                        <ShoppingCart className="w-4 h-4 mr-2" />
                                                        Pay Now
                                                    </>
                                                )}
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y-2 divide-gray-200">
                                <thead className="ltr:text-left rtl:text-right">
                                    <tr className="*:font-medium *:text-gray-900 *:first:sticky *:first:left-0 *:first:bg-white">
                                        {availableTickets > 1 && (
                                            <th className="px-3 py-2 whitespace-nowrap text-xs sm:text-sm md:text-base lg:text-[16px] w-12">
                                                Select
                                            </th>
                                        )}
                                        <th className="px-3 py-2 whitespace-nowrap text-xs sm:text-sm md:text-base lg:text-[16px] w-16">S.N</th>
                                        <th className="px-3 py-2 whitespace-nowrap text-xs sm:text-sm md:text-base lg:text-[16px] min-w-[200px]">Ticket Type</th>
                                        <th className="px-3 py-2 whitespace-nowrap text-xs sm:text-sm md:text-base lg:text-[16px] min-w-[250px]">Description</th>
                                        <th className="px-3 py-2 whitespace-nowrap text-xs sm:text-sm md:text-base lg:text-[16px] w-32">Price</th>
                                        <th className="px-3 py-2 whitespace-nowrap text-xs sm:text-sm md:text-base lg:text-[16px] w-40">Deadline</th>
                                        <th className="px-3 py-2 whitespace-nowrap text-center text-xs sm:text-sm md:text-base lg:text-[16px] min-w-[120px]">Action</th>
                                    </tr>
                                </thead>

                                <tbody className="divide-y divide-gray-200">
                                    {ticketsData.map((ticket, index) => {
                                        const isExpired = isDeadlinePassed(ticket.deadline);
                                        const isNearDeadline = isDeadlineNear(ticket.deadline);
                                        const isSelected = selectedTickets.has(ticket.id);
                                        const isProcessing = processingTicketId === ticket.id;

                                        return (
                                            <tr
                                                key={ticket.id}
                                                className={`hover:bg-gray-50 ${isExpired ? "bg-red-50 text-gray-400" : ""
                                                    } ${isSelected ? "bg-blue-50" : ""}`}
                                            >
                                                {/* Select Checkbox */}
                                                {availableTickets > 1 && (
                                                    <td className="px-3 py-2 whitespace-nowrap">
                                                        <Checkbox
                                                            checked={isSelected}
                                                            onCheckedChange={(checked) =>
                                                                handleTicketSelection(ticket.id, checked)
                                                            }
                                                            disabled={isExpired}
                                                        />
                                                    </td>
                                                )}

                                                {/* S.N */}
                                                <td className="px-3 py-2 whitespace-nowrap text-xs sm:text-sm md:text-base lg:text-[14px] font-medium">
                                                    {index + 1}
                                                </td>

                                                {/* Ticket Type */}
                                                <td className="px-3 py-2 whitespace-nowrap text-xs sm:text-sm md:text-base lg:text-[14px] font-medium">
                                                    <div className="flex items-center gap-2">
                                                        <Ticket className="w-4 h-4 text-primary" />
                                                        <span className="truncate">{ticket.label}</span>
                                                    </div>
                                                </td>

                                                {/* Description */}
                                                <td className="px-3 py-2 text-xs sm:text-sm md:text-base lg:text-[14px]">
                                                    <div className="max-w-xs truncate" title={ticket.description}>
                                                        {ticket.description}
                                                    </div>
                                                </td>

                                                {/* Price */}
                                                <td className="px-3 py-2 whitespace-nowrap text-xs sm:text-sm md:text-base lg:text-[14px] font-semibold">
                                                    <div className="flex items-center gap-1">
                                                        <DollarSign className="w-4 h-4 text-green-600" />
                                                        Rs. {parseFloat(ticket.amount).toFixed(2)}
                                                    </div>
                                                </td>

                                                {/* Deadline */}
                                                <td className="px-3 py-2 whitespace-nowrap text-xs sm:text-sm md:text-base lg:text-[14px]">
                                                    <div className="flex items-center gap-1">
                                                        <Calendar className="w-4 h-4 text-muted-foreground" />
                                                        <span className={isNearDeadline ? "text-orange-600 font-medium" : ""}>
                                                            {formatDeadline(ticket.deadline)}
                                                        </span>
                                                    </div>
                                                    {isNearDeadline && !isExpired && (
                                                        <Badge className="bg-orange-100 text-orange-800 text-xs mt-1">
                                                            <Clock className="w-3 h-3 mr-1" />
                                                            Ending Soon
                                                        </Badge>
                                                    )}
                                                    {isExpired && (
                                                        <Badge className="bg-red-100 text-red-800 text-xs mt-1">
                                                            Expired
                                                        </Badge>
                                                    )}
                                                </td>

                                                {/* Actions */}
                                                <td className="px-3 py-2 whitespace-nowrap text-center">
                                                    <Button
                                                        size="sm"
                                                        className={`min-w-[80px] text-xs sm:text-sm ${isExpired
                                                            ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                                                            : "bg-blue text-white hover:bg-blue/80"
                                                            }`}
                                                        onClick={() => handleSingleTicketPurchase(ticket)}
                                                        disabled={isExpired || isProcessing}
                                                    >
                                                        {isExpired ? (
                                                            "Expired"
                                                        ) : isProcessing ? (
                                                            <>
                                                                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-1"></div>
                                                                Processing...
                                                            </>
                                                        ) : (
                                                            <>
                                                                <CreditCard className="w-3 h-3 mr-1" />
                                                                Buy Now
                                                            </>
                                                        )}
                                                    </Button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </>
                )}
            </CardContent>
        </Card>
    );
}
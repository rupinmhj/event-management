import React, { useState, useEffect, useContext } from 'react';
import { Clock, CreditCard, Check, ShoppingCart, Users, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import useAxiosAuth from '@/hooks/useAxiosAuth';
import AuthContext from '@/context/AuthContext';
import { useNavigate, useParams, Navigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';

export const Tickets = () => {
  const [tickets, setTickets] = useState([]);
  const [paidTickets, setPaidTickets] = useState([]);
  const [unpaidTickets, setUnpaidTickets] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTickets, setSelectedTickets] = useState(new Set());
  const [processingPayment, setProcessingPayment] = useState(false);
  const [processingBulk, setProcessingBulk] = useState({});
  const { hasProfile } = useContext(AuthContext);
  const api = useAxiosAuth();
  const navigate = useNavigate();
  const { id: eventId } = useParams();
  const [tid, setTid] = useState([]);

  useEffect(() => {
    window.scrollTo(0, 0)
    fetchTicketsAndEvents();
  }, [api, eventId]);

  const fetchTicketsAndEvents = async () => {
    try {
      setLoading(true);

      // Fetch tickets (with optional event filter)
      const ticketUrl = eventId
        ? `/api/event/ticket-list/?event=${eventId}`
        : '/api/event/ticket-list';

      const ticketsRes = await api.get(ticketUrl);
      console.log('Tickets data:', ticketsRes.data);
      setTickets(ticketsRes.data);

      // Fetch events for display names and get paid/unpaid status for each event
      if (!eventId) {
        const eventsRes = await api.get("/api/event/active-events/");
        setEvents(eventsRes.data);
        console.log('Events data:', eventsRes.data);

        // Get paid/unpaid status for all active events
        const allPaidTickets = [];
        const allUnpaidTickets = [];

        for (const event of eventsRes.data) {
          try {
            const ticketData = await api.get(`/api/event/${event.id}/tickets/`);
            console.log(`Tickets with paid/unpaid for event ${event.id}:`, ticketData.data);

            allPaidTickets.push(...(ticketData.data.paid_tickets || []));
            allUnpaidTickets.push(...(ticketData.data.unpaid_tickets || []));
          } catch (eventError) {
            console.warn(`Failed to fetch ticket status for event ${event.id}:`, eventError);
          }
        }

        setPaidTickets(allPaidTickets);
        setUnpaidTickets(allUnpaidTickets);
      } else {
        // For specific event, fetch its paid/unpaid status
        try {
          const ticketData = await api.get(`/api/event/${eventId}/tickets/`);
          console.log('Tickets with paid/unpaid', ticketData.data);
          setPaidTickets(ticketData.data.paid_tickets || []);
          setUnpaidTickets(ticketData.data.unpaid_tickets || []);
        } catch (eventError) {
          console.warn(`Failed to fetch ticket status for event ${eventId}:`, eventError);
          setPaidTickets([]);
          setUnpaidTickets([]);
        }
      }

    } catch (error) {
      console.error('Error fetching tickets and events:', error);
      toast.error('Failed to load tickets');
    } finally {
      setLoading(false);
    }
  };

  const getEventName = (eventId) => {
    const event = events.find(e => e.id === eventId);
    return event ? event.title : `Event ${eventId}`;
  };

  const isDeadlineNear = (deadline) => {
    if (!deadline) return false;
    const deadlineDate = new Date(deadline);
    const now = new Date();
    const diffInDays = Math.ceil((deadlineDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return diffInDays <= 3 && diffInDays > 0;
  };

  const isDeadlinePassed = (deadline) => {
    if (!deadline) return false;
    return new Date(deadline) < new Date();
  };

  const isTicketPaid = (ticketId) => {
    return paidTickets.some(ticket => ticket.id === ticketId);
  };

  const formatPrice = (amount) => {
    return `Rs. ${parseFloat(amount).toLocaleString()}`;
  };

  const handleTicketSelection = (ticketId, checked) => {
    const newSelected = new Set(selectedTickets);
    if (checked) {
      newSelected.add(ticketId);
    } else {
      newSelected.delete(ticketId);
    }
    setSelectedTickets(newSelected);
  };

  const handleIndividualPayment = async (ticket) => {
    if (!hasProfile) {
      toast.info('Please complete your profile before purchasing tickets.');
      setTimeout(() => {
        navigate('/user/setup-profile');
      }, 1000);
      return;
    }

    try {
      const { event } = ticket;
      const res2 = await api.get(`/api/event/own-participation-list/?event=${event}`);
      console.log(res2.data);
      const pid = res2.data[0]?.id;
      console.log(pid);
      if (!pid) {
        toast.error("Fill the requirements first!!");
        setTimeout(() => {
          navigate('/user')
        }, 1000)

        return;
      }
      console.log('Participation ID:', pid);

      setProcessingPayment(ticket.id);
      console.log('Ticket ID:', ticket.id);

      const payload = {
        tickets: [
          { ticket_id: ticket.id }
        ]
      };
      console.log('Payload:', payload);

      const res = await api.post(
        `/api/event/participation/${pid}/tickets/`,
        payload
      );
      console.log('Response:', res.data);
      // const { total_amount } = res.data;
      const { total_amount, participant_ticket_ids } = res.data;


      setTid(participant_ticket_ids);
      console.log("Total amount:", total_amount);

      // Navigate to payment page with correct path
      navigate(`/user/payment/${pid}`, {
        state: {
          tid: participant_ticket_ids,
          totalAmount: total_amount,
          pid: pid
        }
      });

    } catch (error) {
      console.error('Payment failed:', error);
      toast.error('Payment failed. Please try again.');
    } finally {
      setProcessingPayment(null);
    }
  };

  const handleBulkPayment = async (eventId) => {
    if (!hasProfile) {
      toast.info('Please complete your profile before purchasing tickets.');
      setTimeout(() => {
        navigate('/user/setup-profile');
      }, 1000);
      return;
    }

    const eventTickets = tickets.filter(ticket =>
      ticket.event === eventId &&
      selectedTickets.has(ticket.id) &&
      !isTicketPaid(ticket.id) &&
      !isDeadlinePassed(ticket.deadline)
    );

    if (eventTickets.length === 0) {
      toast.warning('Please select at least one unpaid ticket for bulk payment.');
      return;
    }

    try {
      setProcessingBulk(prev => ({ ...prev, [eventId]: true }));

      // Get participation ID for this event
      const res2 = await api.get(`/api/event/own-participation-list/?event=${eventId}`);
      console.log(res2.data);
      const pid = res2.data[0]?.id;
      console.log(pid);
      if (!pid) {
        toast.error("Fill the requirements first!!");
        setTimeout(() => {
          navigate('/user')
        }, 1000)
        return;
      }

      console.log('Participation ID:', pid);

      // Create payload with selected tickets for this event
      const payload = {
        tickets: eventTickets.map(ticket => ({ ticket_id: ticket.id }))
      };
      console.log('Bulk payload:', payload);

      // Make the API call for bulk payment
      const res = await api.post(
        `/api/event/participation/${pid}/tickets/`,
        payload
      );
      console.log('Bulk payment response:', res.data);
      const { total_amount, participant_ticket_ids } = res.data;
      setTid(participant_ticket_ids);
      console.log("Total amount:", total_amount);

      // Navigate to payment page
      navigate(`/user/payment/${pid}`, {
        state: {
          tid: participant_ticket_ids,
          totalAmount: total_amount,
          pid: pid
        }
      });

      // Clear selections for this event
      const newSelected = new Set(selectedTickets);
      eventTickets.forEach(ticket => newSelected.delete(ticket.id));
      setSelectedTickets(newSelected);

    } catch (error) {
      console.error('Bulk payment failed:', error);
      toast.error('Bulk payment failed. Please try again.');
    } finally {
      setProcessingBulk(prev => ({ ...prev, [eventId]: false }));
    }
  };

  const handleSelectAllForEvent = (eventId, checked) => {
    const eventTickets = tickets.filter(ticket =>
      ticket.event === eventId &&
      !isDeadlinePassed(ticket.deadline) &&
      !isTicketPaid(ticket.id)
    );

    const newSelected = new Set(selectedTickets);
    eventTickets.forEach(ticket => {
      if (checked) {
        newSelected.add(ticket.id);
      } else {
        newSelected.delete(ticket.id);
      }
    });
    setSelectedTickets(newSelected);
  };

  const getSelectedTicketsForEvent = (eventId) => {
    return tickets.filter(ticket =>
      ticket.event === eventId &&
      selectedTickets.has(ticket.id) &&
      !isTicketPaid(ticket.id)
    );
  };

  const getTotalAmountForEvent = (eventId) => {
    const eventSelectedTickets = getSelectedTicketsForEvent(eventId);
    return eventSelectedTickets.reduce((sum, ticket) =>
      sum + parseFloat(ticket.amount), 0
    );
  };

  const groupTicketsByEvent = () => {
    const grouped = {};
    tickets.forEach(ticket => {
      if (!grouped[ticket.event]) {
        grouped[ticket.event] = [];
      }
      grouped[ticket.event].push(ticket);
    });
    return grouped;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const groupedTickets = groupTicketsByEvent();

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="space-y-8">
        {Object.entries(groupedTickets).map(([eventId, eventTickets]) => {
          const selectedCount = getSelectedTicketsForEvent(parseInt(eventId)).length;
          const totalAmount = getTotalAmountForEvent(parseInt(eventId));
          const availableTickets = eventTickets.filter(ticket =>
            !isDeadlinePassed(ticket.deadline) && !isTicketPaid(ticket.id)
          );

          return (
            <div key={eventId} className="space-y-4">
              {/* Event Header */}
              <div className="flex items-center justify-between p-4 bg-card rounded-lg border">
                <div className="flex items-center space-x-3">
                  <Users className="w-6 h-6 text-primary" />
                  <div>
                    <h2 className="text-xl font-semibold text-gray-800">
                      {getEventName(parseInt(eventId))}
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      {eventTickets.length} ticket type{eventTickets.length > 1 ? 's' : ''} • {availableTickets.length} available for purchase
                    </p>
                  </div>
                </div>

                {availableTickets.length > 1 && (
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id={`select-all-${eventId}`}
                        checked={selectedCount === availableTickets.length && availableTickets.length > 0}
                        onCheckedChange={(checked) =>
                          handleSelectAllForEvent(parseInt(eventId), checked)
                        }
                      />
                      <label
                        htmlFor={`select-all-${eventId}`}
                        className="text-sm font-medium cursor-pointer"
                      >
                        Select All Available
                      </label>
                    </div>

                    {selectedCount > 0 && (
                      <div className="flex items-center space-x-2">
                        <Badge variant="secondary" className="bg-primary/10 text-primary">
                          {selectedCount} selected • {formatPrice(totalAmount)}
                        </Badge>
                        <Button
                          onClick={() => handleBulkPayment(parseInt(eventId))}
                          disabled={processingBulk[eventId]}
                          className="bg-blue hover:bg-blue/90 text-primary-foreground"
                        >
                          {processingBulk[eventId] ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                              Processing...
                            </>
                          ) : (
                            <>
                              <ShoppingCart className="w-4 h-4 mr-2" />
                              Pay Selected ({formatPrice(totalAmount)})
                            </>
                          )}
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Tickets for this event */}
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {eventTickets.map((ticket) => {
                  const isOverdue = isDeadlinePassed(ticket.deadline);
                  const isNearDeadline = isDeadlineNear(ticket.deadline);
                  const isSelected = selectedTickets.has(ticket.id);
                  const isProcessing = processingPayment === ticket.id;
                  const isPaid = isTicketPaid(ticket.id);

                  return (
                    <Card
                      key={ticket.id}
                      className={`relative transition-all duration-300 ${isPaid ? 'bg-green-50 border-green-200' :
                        isSelected ? 'ring-2 ring-green-600 bg-primary/5' :
                          isNearDeadline ? 'bg-destructive/5 border-destructive/20' :
                            'bg-card hover:shadow-md'
                        } ${isOverdue ? 'opacity-50' : ''}`}
                    >
                      {/* Paid Badge */}
                      {isPaid && (
                        <div className="absolute top-3 right-3">
                          <Badge className="bg-green-500 text-white">
                            <Check className="w-3 h-3 mr-1" />
                            Purchased
                          </Badge>
                        </div>
                      )}

                      {/* Selection Checkbox - only for unpaid, non-overdue tickets */}
                      {!isOverdue && !isPaid && availableTickets.length > 1 && (
                        <div className="absolute top-3 right-3">
                          <Checkbox
                            checked={isSelected}
                            onCheckedChange={(checked) =>
                              handleTicketSelection(ticket.id, checked)
                            }
                            className="border-2"
                          />
                        </div>
                      )}

                      <CardHeader className="pb-2">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center space-x-2">
                            <Tag className="w-5 h-5 text-primary" />
                            <CardTitle className="text-lg font-semibold text-gray-700">
                              {ticket.label}
                            </CardTitle>
                          </div>
                        </div>
                        <div className={`text-2xl font-bold ${isPaid ? 'text-green-600' : 'text-green-600'}`}>
                          {formatPrice(ticket.amount)}
                        </div>
                      </CardHeader>

                      <CardContent>
                        <p className="text-sm text-muted-foreground mb-4">
                          {ticket.description}
                        </p>

                        {ticket.deadline && (
                          <div className={`flex items-center gap-2 text-sm mb-4 ${isNearDeadline ? 'text-destructive' : 'text-muted-foreground'
                            }`}>
                            <Clock className="w-4 h-4" />
                            <span>
                              Deadline: {new Date(ticket.deadline).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                              })}
                            </span>
                          </div>
                        )}

                        {isPaid ? (
                          <div className="bg-green-50 border border-green-200 rounded-md p-3">
                            <p className="text-green-700 text-sm font-medium flex items-center">
                              <Check className="w-4 h-4 mr-2" />
                              Ticket purchased successfully
                            </p>
                          </div>
                        ) : isOverdue ? (
                          <div className="bg-destructive/10 border border-destructive/20 rounded-md p-3">
                            <p className="text-destructive text-sm font-medium">
                              ⚠️ Deadline has passed
                            </p>
                          </div>
                        ) : (
                          <Button
                            onClick={() => handleIndividualPayment(ticket)}
                            disabled={isProcessing}
                            className="w-full bg-blue hover:bg-blue/90 text-primary-foreground"
                          >
                            {isProcessing ? (
                              <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                Processing...
                              </>
                            ) : (
                              <>
                                <CreditCard className="w-4 h-4 mr-2" />
                                Buy Now
                              </>
                            )}
                          </Button>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {tickets.length === 0 && (
        <div className="text-center py-12">
          <Tag className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">No tickets available</h3>
          <p className="text-muted-foreground">
            There are currently no tickets available for purchase.
          </p>
        </div>
      )}
      <ToastContainer />
    </div>
  );
};
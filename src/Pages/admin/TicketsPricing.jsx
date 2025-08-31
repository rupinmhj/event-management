import React, { useContext, useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { motion } from 'framer-motion'
import { toast, ToastContainer } from 'react-toastify'
import { useLocation, useNavigate } from 'react-router-dom';
import {
  MdCalendarToday,
  MdAttachFile,
  MdPayment,
  MdVerifiedUser
} from 'react-icons/md';
import { FaTimes } from 'react-icons/fa'
import AuthContext from '@/context/AuthContext';
import useAxiosAuth from '@/hooks/useAxiosAuth';
import DatePicker from '@/utils/DatePicker';

export const TicketsPricing = () => {
  const { authTokens, authReady } = useContext(AuthContext);
  const api = useAxiosAuth();
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [loading, setLoading] = useState(false);
  const location = useLocation();
  
  const [ticketPricing, setTicketPricing] = useState({
    event: null,
    ticket_type: '',
    description: '',
    file: null,
    deadline: null,
    amount: '',
    is_verification_required: false
  });

  // Validation errors state
  const [errors, setErrors] = useState({
    event: '',
    ticket_type: '',
    deadline: '',
    file: '',
    amount: ''
  });

  // Keep ticketPricing.event in sync with selectedEvent (store id)
  useEffect(() => {
    setTicketPricing(prev => ({
      ...prev,
      event: selectedEvent ? selectedEvent.id : null
    }));
  }, [selectedEvent]);

  useEffect(() => {
    const { eventId } = location.state || {};
    console.log("eventId from location:", eventId);

    if (eventId && events.length > 0) {
      const event = events.find(e => Number(e.id) === Number(eventId));
      console.log("Matched event:", event);

      if (event) {
        setSelectedEvent(event);
      } else {
        console.warn("No event found for eventId:", eventId);
      }
    }
  }, [events, location.state]);

  useEffect(() => {
    if (!authTokens || !authReady) return;

    const fetchData = async () => {
      try {
        const res = await api.get('/api/event/active-events/');
        setEvents(res.data);
        console.log('Event list:', res.data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchData();
  }, [authReady, authTokens, api]);

  const formatDateForAPI = (value) => {
    if (!value) return null;
    if (typeof value === 'string') return value;
    if (value instanceof Date && !isNaN(value)) {
      const y = value.getFullYear();
      const m = String(value.getMonth() + 1).padStart(2, '0');
      const d = String(value.getDate()).padStart(2, '0');
      return `${y}-${m}-${d}`;
    }
    return null;
  };

  // Clear specific error when user starts typing/selecting
  const clearError = (field) => {
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  // Validation function
  const validateForm = () => {
    const newErrors = {
      event: '',
      ticket_type: '',
      deadline: '',
      file: '',
      amount: ''
    };

    // Event validation
    if (!ticketPricing.event) {
      newErrors.event = "Event selection is required";
    }

    // Ticket type validation
    if (!ticketPricing.ticket_type || ticketPricing.ticket_type.trim() === '') {
      newErrors.ticket_type = "Ticket type is required";
    }

    // Deadline validation
    if (!ticketPricing.deadline) {
      newErrors.deadline = "Deadline is required";
    }

    // Amount validation
    if (!ticketPricing.amount || ticketPricing.amount.trim() === '') {
      newErrors.amount = "Amount is required";
    } else if (isNaN(ticketPricing.amount) || parseFloat(ticketPricing.amount) <= 0) {
      newErrors.amount = "Amount must be a valid positive number";
    }

    setErrors(newErrors);

    // Return true if no errors
    return Object.values(newErrors).every(error => error === '');
  };

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [])

  const saveTicketPricing = async () => {
    // Validate form
    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append('event', ticketPricing.event);
      formData.append('label', ticketPricing.ticket_type || '');
      formData.append('description', ticketPricing.description || '');
      formData.append('amount', ticketPricing.amount || '');
      formData.append('is_verification_required', String(!!ticketPricing.is_verification_required));
      const deadline = formatDateForAPI(ticketPricing.deadline);
      if (deadline) formData.append('deadline', deadline);
      if (ticketPricing.file) formData.append('file', ticketPricing.file);

      formData.forEach((value, key) => {
        console.log(key, value);
      });

      const res = await api.post('/api/event/create-tickets/', formData);
      const data = res.data;
      console.log('ticket pricing post', data);
      const res2 = await api.get('/api/event/create-tickets/');

      console.log('Posting payload (FormData):', {
        event: ticketPricing.event,
        ticket_type: ticketPricing.ticket_type,
        description: ticketPricing.description,
        amount: ticketPricing.amount,
        is_verification_required: ticketPricing.is_verification_required,
        deadline,
        file: ticketPricing.file ? ticketPricing.file.name : null,
      });

      // Reset form on success
      setTicketPricing({
        event: null,
        ticket_type: '',
        description: '',
        file: null,
        deadline: null,
        amount: '',
        is_verification_required: false
      });
      setSelectedEvent(null);
      setErrors({
        event: '',
        ticket_type: '',
        deadline: '',
        file: '',
        amount: ''
      });

      // Success handling here (toast, navigate, etc.)
      toast.success("Ticket pricing successfully saved")
      setTimeout(() => {
        navigate('/admin/events');
      }, 1000);

    } catch (err) {
      console.error('Failed to save ticket pricing:', err);
      // Error handling (toast, etc.)
      toast.error('Failed to save ticket pricing. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6 pt-4 pb-8 md:px-12 "
    >
      <div className="min-h-screen bg-gradient-to-br from-background via-primary-soft to-background md:p-20 pt-10 ">
        <div className="max-w-6xl mx-auto space-y-8">

          {/* Event Selection */}
          <Card className="shadow-lg border-0 bg-gradient-to-r from-card to-primary-soft/20 ">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MdCalendarToday className="h-5 w-5 text-event-primary" />
                Event Information
              </CardTitle>
              <CardDescription>
                Select the event for which this ticket pricing applies *
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="event-select">Event</Label>
                <Select
                  value={selectedEvent ? selectedEvent?.id.toString() : ""}
                  onValueChange={(value) => {
                    const ev = events.find(e => e.id === parseInt(value));
                    setSelectedEvent(ev || null);
                    clearError('event');
                  }}
                >
                  <SelectTrigger
                    id="event-select"
                    className={`border-event-primary/20 ${errors.event ? 'border-red-500' : ''}`}
                  >
                    <SelectValue placeholder="Select an event..." />
                  </SelectTrigger>
                  <SelectContent position="popper" className='w-full'>
                    {events.map((ev) => (
                      <SelectItem key={ev.id} value={ev.id.toString()}>
                        {ev.title} ({ev.event_type})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.event && (
                  <p className='text-red-500 text-[12px] mt-1'>{errors.event}</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Ticket Pricing */}
          <Card className="shadow-lg border-0 bg-gradient-to-r from-card to-primary-soft/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                Ticket Pricing
              </CardTitle>
              <CardDescription>
                Configure the ticket pricing for your event
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Ticket Type + Amount */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Ticket Type */}
                <div className="space-y-2 max-w-sm">
                  <Label>Ticket Type</Label>
                  <Input
                    placeholder="E.g., General Admission, VIP, Early Bird..."
                    value={ticketPricing.ticket_type}
                    onChange={(e) => {
                      setTicketPricing({ ...ticketPricing, ticket_type: e.target.value });
                      clearError('ticket_type');
                    }}
                    className={`border-event-primary/20 focus:border-event-primary ${errors.ticket_type ? 'border-red-500' : ''}`}
                  />
                  {errors.ticket_type && (
                    <p className='text-red-500 text-[12px] mt-1'>{errors.ticket_type}</p>
                  )}
                </div>

                {/* Amount Field */}
                <div className="space-y-2 max-w-sm">
                  <Label>Amount (Rs.)</Label>
                  <Input
                    type="number"
                    placeholder="Enter ticket price..."
                    value={ticketPricing.amount}
                    onChange={(e) => {
                      setTicketPricing({ ...ticketPricing, amount: e.target.value });
                      clearError('amount');
                    }}
                    className={`border-event-primary/20 focus:border-event-primary ${errors.amount ? 'border-red-500' : ''}`}
                  />
                  {errors.amount && (
                    <p className='text-red-500 text-[12px] mt-1'>{errors.amount}</p>
                  )}
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label>Description (Optional)</Label>
                <Textarea
                  placeholder="Describe what this ticket includes..."
                  value={ticketPricing.description}
                  onChange={(e) => setTicketPricing({ ...ticketPricing, description: e.target.value })}
                  className="border-event-primary/20 focus:border-event-primary resize-none h-[150px]"
                  rows={2}
                />
              </div>

              {/* Deadline */}
              <div className="space-y-2 max-w-sm">
                <Label>Sale End Date</Label>
                <DatePicker
                  value={ticketPricing.deadline}
                  onChange={(value) => {
                    setTicketPricing({ ...ticketPricing, deadline: value });
                    clearError('deadline');
                  }}
                  minDate={new Date()}
                  maxDate={new Date(2040, 12, 30)}
                />
                {errors.deadline && (
                  <p className='text-red-500 text-[12px] mt-1'>{errors.deadline}</p>
                )}
              </div>

              {/* File Upload (optional image for the ticket) */}
              <div className="space-y-2">
                <Label htmlFor="ticket-file">
                  Ticket Image (optional)
                </Label>
                <Input
                  id="ticket-file"
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const f = e.target.files && e.target.files[0] ? e.target.files[0] : null;
                    setTicketPricing({ ...ticketPricing, file: f });
                    clearError('file');
                  }}
                  className={`border-event-primary/20 focus:border-event-primary ${errors.file ? 'border-red-500' : ''}`}
                />
                {errors.file && (
                  <p className='text-red-500 text-[12px] mt-1'>{errors.file}</p>
                )}
              </div>

              {/* Admin Verification Required */}
              <div className="space-y-2 pt-4">
                <label htmlFor="is_verification_required" className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="is_verification_required"
                    checked={ticketPricing.is_verification_required || false}
                    onChange={e => setTicketPricing({
                      ...ticketPricing,
                      is_verification_required: e.target.checked
                    })}
                    className="accent-blue-600 h-4 w-4"
                  />
                  <span className="text-sm font-medium">Admin verification required</span>
                </label>
                <p className="text-xs text-gray-500">
                  If checked, purchases of this ticket type must be verified by an admin.
                </p>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-center gap-4 pt-6 md:px-0 px-4">
            <Button
              onClick={saveTicketPricing}
              disabled={loading}
              className="flex-1 bg-blue transition-all duration-300 hover:scale-[1.02] text-primary-foreground hover:bg-blue/90"
              size='lg'
            >
              {loading ? 'Saving...' : 'Save Ticket Pricing'}
            </Button>
            <Button
              onClick={() => navigate(-1)}
              disabled={loading}
              className="hover:bg-destructive text-white hover:text-destructive-foreground transition-all duration-300 hover:scale-[1.02] bg-red-800"
              size='lg'
            >
              <FaTimes className="w-4 h-4 mr-2" />
              Cancel
            </Button>
          </div>
        </div>
      </div>
      <ToastContainer />
    </motion.div>
  );
};
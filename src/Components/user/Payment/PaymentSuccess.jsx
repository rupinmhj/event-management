// src/components/user/payment/PaymentSuccess.jsx
import React, { useEffect, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, Calendar, MapPin, Users, ArrowRight, Download, Mail } from "lucide-react";
import { motion } from 'framer-motion';
import useAxiosAuth from "@/hooks/useAxiosAuth";

const PaymentSuccess = () => {
  const { productdata: encodedData } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const api = useAxiosAuth();
  
  const [paymentStatus, setPaymentStatus] = useState('processing');
  const [bookingDetails, setBookingDetails] = useState(null);
  const [error, setError] = useState(null);
  const [countdown, setCountdown] = useState(10);

  useEffect(() => {
    const processPayment = async () => {
      try {
        // Get response data from eSewa
        const base64Response = searchParams.get("data");
        
        if (!encodedData || !base64Response) {
          throw new Error("Missing payment data");
        }

        // Decode transaction data and eSewa response
        const transactionData = JSON.parse(atob(encodedData));
        const esewaResponse = JSON.parse(atob(base64Response));

        console.log("Transaction Data:", transactionData);
        console.log("eSewa Response:", esewaResponse);

        // Prepare booking data to send to your backend
        const bookingData = {
          // Event booking details
          event_id: transactionData.event_id,
          user_id: transactionData.user_id,
          ticket_quantity: transactionData.ticket_quantity,
          total_amount: transactionData.total_amount,
          
          // Payment details
          payment_method: 'esewa',
          payment_status: esewaResponse.status,
          payment_ref_id: esewaResponse.transaction_code,
          transaction_uuid: transactionData.transaction_uuid,
          
          // Additional info
          booking_date: new Date().toISOString(),
          event_title: transactionData.event_title,
          amount_per_ticket: transactionData.amount_per_ticket
        };

        // Send booking data to your backend
        const result = await api.post('/api/event/bookings/', bookingData);
        
        if (result.data) {
          setPaymentStatus('success');
          setBookingDetails({
            eventTitle: transactionData.event_title,
            ticketQuantity: transactionData.ticket_quantity,
            totalAmount: transactionData.total_amount,
            amountPerTicket: transactionData.amount_per_ticket,
            transactionId: esewaResponse.transaction_code,
            bookingId: result.data.booking_id || result.data.id,
            bookingReference: result.data.booking_reference || `EVT-${result.data.id}`,
            eventDate: result.data.event_date,
            eventLocation: result.data.event_location
          });
        } else {
          throw new Error("Failed to create booking");
        }

      } catch (error) {
        console.error("Error processing payment:", error);
        setError(error.message);
        setPaymentStatus('failed');
      }
    };

    processPayment();
  }, [encodedData, searchParams, api]);

  // Countdown for auto redirect
  useEffect(() => {
    if (paymentStatus === 'success' && bookingDetails) {
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            navigate('/user/my-bookings');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [paymentStatus, bookingDetails, navigate]);

  if (paymentStatus === 'processing') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto mb-6"></div>
          <h2 className="text-2xl font-semibold mb-2">Processing Payment...</h2>
          <p className="text-muted-foreground">Please wait while we confirm your booking.</p>
        </motion.div>
      </div>
    );
  }

  if (paymentStatus === 'failed' || error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full mx-4"
        >
          <Card className="border-red-200">
            <CardContent className="text-center pt-6">
              <div className="text-red-500 text-6xl mb-4">❌</div>
              <h2 className="text-2xl font-semibold mb-2 text-red-600">Payment Failed</h2>
              <p className="text-muted-foreground mb-6">
                {error || "There was an issue processing your payment. Please try again."}
              </p>
              <div className="space-y-3">
                <Button onClick={() => window.history.back()} className="w-full">
                  Try Again
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => navigate('/events')} 
                  className="w-full"
                >
                  Back to Events
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  if (paymentStatus === 'success' && bookingDetails) {
    return (
      <div className="min-h-screen bg-background py-8">
        <div className="max-w-3xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Success Header */}
            <Card className="border-green-200 bg-green-50/50">
              <CardContent className="text-center pt-6">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
                </motion.div>
                <h1 className="text-3xl font-bold text-green-700 mb-2">
                  Payment Successful!
                </h1>
                <p className="text-green-600 mb-4">
                  Your event tickets have been booked successfully.
                </p>
                <div className="bg-white/70 backdrop-blur-sm rounded-lg p-3 inline-block">
                  <p className="text-sm text-muted-foreground">
                    Booking Reference: <span className="font-mono font-medium">{bookingDetails.bookingReference}</span>
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Booking Details */}
            <Card>
              <CardHeader>
                <h2 className="text-xl font-semibold">Booking Details</h2>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <Calendar className="w-5 h-5 text-primary" />
                      <div>
                        <p className="font-medium">Event</p>
                        <p className="text-sm text-muted-foreground">{bookingDetails.eventTitle}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <Users className="w-5 h-5 text-primary" />
                      <div>
                        <p className="font-medium">Tickets</p>
                        <p className="text-sm text-muted-foreground">{bookingDetails.ticketQuantity} ticket(s)</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                        <span className="text-xs text-white font-bold">₹</span>
                      </div>
                      <div>
                        <p className="font-medium">Total Amount</p>
                        <p className="text-sm text-muted-foreground">NPR {bookingDetails.totalAmount}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="w-5 h-5 bg-green-600 rounded-full flex items-center justify-center">
                        <span className="text-xs text-white">✓</span>
                      </div>
                      <div>
                        <p className="font-medium">Transaction ID</p>
                        <p className="text-sm text-muted-foreground font-mono">{bookingDetails.transactionId}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Payment Summary */}
                <div className="bg-muted/50 p-4 rounded-lg">
                  <h3 className="font-medium mb-3">Payment Summary</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Price per ticket:</span>
                      <span>NPR {bookingDetails.amountPerTicket}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Number of tickets:</span>
                      <span>{bookingDetails.ticketQuantity}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Payment method:</span>
                      <span className="flex items-center gap-1">
                        <img
                          src="https://seeklogo.com/images/E/esewa-logo-DA36F8FD2F-seeklogo.com.png"
                          alt="eSewa"
                          className="h-4 w-4"
                        />
                        eSewa
                      </span>
                    </div>
                    <div className="border-t pt-2 mt-2">
                      <div className="flex justify-between font-medium">
                        <span>Total Amount Paid:</span>
                        <span>NPR {bookingDetails.totalAmount}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Next Steps */}
            <Card>
              <CardHeader>
                <h2 className="text-xl font-semibold">What's Next?</h2>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                    <Mail className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-blue-900">Email Confirmation</h4>
                      <p className="text-sm text-blue-700">Check your email for booking confirmation and event details.</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3 p-3 bg-purple-50 rounded-lg">
                    <Download className="w-5 h-5 text-purple-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-purple-900">Digital Tickets</h4>
                      <p className="text-sm text-purple-700">Your tickets will be available in your booking history.</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                onClick={() => navigate('/user/my-bookings')}
                className="flex-1"
              >
                View My Bookings
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
              <Button
                variant="outline"
                onClick={() => navigate('/events')}
                className="flex-1"
              >
                Browse More Events
              </Button>
            </div>

            {/* Auto Redirect Notice */}
            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                Redirecting to your bookings in {countdown} seconds...
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  return null;
};

export default PaymentSuccess;
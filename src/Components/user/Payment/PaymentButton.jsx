// Components/user/payment/PaymentButton.jsx
import React, { useState } from 'react';
import { generateEsewaPayment, submitEsewaPayment } from '../../../utils/esewaConfig';

const PaymentButton = ({ 
  event, 
  user, 
  ticketQuantity = 1,
  onPaymentStart,
  className = "",
  disabled = false 
}) => {
  const [isProcessing, setIsProcessing] = useState(false);

  const handleEsewaPayment = () => {
    try {
      setIsProcessing(true);
      
      // Prepare event data for payment
      const eventData = {
        eventId: event.id,
        eventTitle: event.title,
        ticketPrice: event.ticket_price,
        ticketQuantity: ticketQuantity,
        totalAmount: event.ticket_price * ticketQuantity
      };

      // User info (you'll get this from your auth context/state)
      const userInfo = {
        id: user.id,
        name: user.name,
        email: user.email
      };

      // Generate payment data
      const paymentData = generateEsewaPayment(eventData, userInfo);

      // Optional: Call parent component function before payment
      if (onPaymentStart) {
        onPaymentStart(eventData);
      }

      console.log('Initiating eSewa payment:', paymentData);

      // Submit payment to eSewa
      submitEsewaPayment(paymentData);

    } catch (error) {
      console.error('Payment initiation failed:', error);
      alert('Payment could not be initiated. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="payment-section">
      <div className="payment-summary mb-4">
        <h3 className="text-lg font-semibold mb-2">Payment Summary</h3>
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex justify-between mb-2">
            <span>Event:</span>
            <span className="font-medium">{event?.title}</span>
          </div>
          <div className="flex justify-between mb-2">
            <span>Ticket Price:</span>
            <span>NPR {event?.ticket_price}</span>
          </div>
          <div className="flex justify-between mb-2">
            <span>Quantity:</span>
            <span>{ticketQuantity}</span>
          </div>
          <hr className="my-2" />
          <div className="flex justify-between font-bold">
            <span>Total Amount:</span>
            <span>NPR {event?.ticket_price * ticketQuantity}</span>
          </div>
        </div>
      </div>

      <div className="payment-methods">
        <h4 className="text-md font-medium mb-3">Select Payment Method</h4>
        
        <button
          onClick={handleEsewaPayment}
          disabled={disabled || isProcessing}
          className={`payment-button esewa-button flex items-center justify-center w-full p-3 border-2 rounded-lg hover:bg-gray-50 transition-colors ${className} ${
            disabled || isProcessing ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
          }`}
        >
          <img
            src="https://seeklogo.com/images/E/esewa-logo-DA36F8FD2F-seeklogo.com.png"
            alt="eSewa"
            className="h-8 mr-3"
          />
          <span className="font-medium">
            {isProcessing ? 'Processing...' : 'Pay with eSewa'}
          </span>
        </button>

        {/* You can add more payment methods here */}
        <button
          disabled={true}
          className="payment-button khalti-button flex items-center justify-center w-full p-3 border-2 rounded-lg mt-2 opacity-50 cursor-not-allowed"
        >
          <img
            src="https://seeklogo.com/images/F/fonepay-logo-C9B7151FD6-seeklogo.com.png"
            alt="FonePay"
            className="h-8 mr-3"
          />
          <span className="font-medium">Pay with FonePay (Coming Soon)</span>
        </button>
      </div>
    </div>
  );
};

export default PaymentButton;
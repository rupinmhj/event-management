import AuthContext from '@/context/AuthContext';
import useAxiosAuth from '@/hooks/useAxiosAuth';
import React, { useContext, useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

// Helper function to decode transaction data
const decodeTransactionData = (encodedData) => {
  try {
    if (!encodedData) return null;
    
    const decodedString = atob(encodedData);
    return JSON.parse(decodedString);
  } catch (error) {
    console.error("Error decoding transaction data:", error);
    return null;
  }
};

export const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [paymentData, setPaymentData] = useState(null);
  const [extractedData, setExtractedData] = useState({
    participationId: null,
    ticketIds: []
  });
  const api = useAxiosAuth();
  const { authTokens, authReady } = useContext(AuthContext);

  // Function to extract participation_id and ticket_ids from transaction_uuid
  const extractTransactionData = (transactionUuid) => {
    if (!transactionUuid) return { participationId: null, ticketIds: [] };
    
    const decodedData = decodeTransactionData(transactionUuid);
    
    if (!decodedData) {
      console.error("Failed to decode transaction data");
      return { participationId: null, ticketIds: [] };
    }
    
    return {
      participationId: decodedData.p,
      ticketIds: decodedData.t || []
    };
  };

  useEffect(() => {
    if (!authReady) return; // Wait for auth to be ready

    const processPayment = async () => {
      try {
        // Get the base64 encoded data from URL query params
        const base64Response = searchParams.get("data");
        console.log("Base64 Response:", base64Response);

        if (!base64Response) {
          setError("No payment data found");
          setLoading(false);
          return;
        }

        // Decode the base64 data
        const decodedData = JSON.parse(atob(base64Response));
        console.log("Payment Response:", decodedData);

        // Extract participation_id and ticket_ids from transaction_uuid
        const transactionData = extractTransactionData(decodedData?.transaction_uuid);
        console.log("Extracted Participation ID:", transactionData.participationId);
        console.log("Extracted Ticket IDs:", transactionData.ticketIds);

        if (!transactionData.participationId) {
          setError("No participation ID found in transaction");
          setLoading(false);
          return;
        }

        if (!transactionData.ticketIds || transactionData.ticketIds.length === 0) {
          setError("No ticket information found in transaction");
          setLoading(false);
          return;
        }

        setPaymentData(decodedData);
        setExtractedData(transactionData);

        // Check if payment was successful
        if (decodedData.status !== 'COMPLETE') {
          setError(`Payment ${decodedData.status.toLowerCase()}. Please try again.`);
          setLoading(false);
          return;
        }

        // Verify the payment with your backend
        const verificationResult = await verifyPayment(
          decodedData, 
          transactionData.participationId, 
          transactionData.ticketIds
        );

        if (verificationResult.success) {
          // Payment verified successfully
          toast.success('Payment completed successfully!');
          setTimeout(() => {
            // Navigate back to user dashboard
            navigate('/user', {
              state: {
                paymentSuccess: true,
                transactionCode: decodedData.transaction_code
              }
            });
          }, 3000);
        } else {
          setError(verificationResult.error || "Payment verification failed");
        }
      } catch (error) {
        console.error("Error processing payment:", error);
        setError("Failed to process payment data");
        toast.error('Payment processing failed');
      } finally {
        setLoading(false);
      }
    };

    processPayment();
  }, [searchParams, navigate, authTokens, authReady, api]);

  // Function to verify payment with backend
  const verifyPayment = async (paymentData, participationId, ticketIds) => {
    try {
      console.log("Verifying payment with backend...");

      const response = await api.post(
        '/api/event/payment/',
        {
          participation_id: participationId,
          participant_ticket_ids: ticketIds,
          transaction_uuid: paymentData.transaction_uuid,
          transaction_code: paymentData.transaction_code,
          total_amount: paymentData.total_amount,
          product_code: paymentData.product_code,
          signature: paymentData.signature
        }
      );

      console.log("Payment verification response:", response.data);

      // Axios automatically throws for HTTP error status codes
      return { success: true, data: response.data };

    } catch (error) {
      console.error("Payment verification error:", error);

      // Handle different types of errors
      if (error.response) {
        // Server responded with error status
        const errorMessage = error.response.data?.message || error.response.data?.error || 'Verification failed';
        return { success: false, error: errorMessage };
      } else if (error.request) {
        // Request was made but no response received
        return { success: false, error: "Network error - please check your connection" };
      } else {
        // Something else happened
        return { success: false, error: "Unexpected error during verification" };
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md text-center max-w-md">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-700 mb-2">Processing Payment</h2>
          <p className="text-gray-500">Please wait while we verify your payment...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md text-center max-w-md">
          <div className="h-16 w-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="h-8 w-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h2 className="text-2xl font-semibold text-gray-800 mb-2">Payment Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <div className="space-y-2">
            <button
              onClick={() => navigate('/user/tickets')}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-md transition-colors"
            >
              Try Again
            </button>
            <button
              onClick={() => navigate('/user')}
              className="w-full bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-md transition-colors"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-md text-center max-w-md">
        <div className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-2xl font-semibold text-gray-800 mb-2">Payment Successful!</h2>
        <p className="text-gray-600 mb-4">Your payment has been processed successfully.</p>

        {paymentData && (
          <div className="bg-gray-50 p-4 rounded-lg mb-4 text-left">
            <h3 className="font-semibold mb-2">Transaction Details:</h3>
            <p className="text-sm"><strong>Transaction ID:</strong> {paymentData.transaction_code}</p>
            {/* <p className="text-sm"><strong>Participation ID:</strong> {extractedData.participationId}</p> */}
            {/* <p className="text-sm"><strong>Ticket IDs:</strong> {extractedData.ticketIds.join(', ')}</p> */}
            <p className="text-sm"><strong>Amount:</strong> Rs. {paymentData.total_amount}</p>
            <p className="text-sm"><strong>Status:</strong> {paymentData.status}</p>
          </div>
        )}

        <p className="text-sm text-gray-500 mb-4">Redirecting to dashboard in a moment...</p>

        <button
          onClick={() => navigate('/user')}
          className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-md transition-colors"
        >
          Go to Dashboard
        </button>
      </div>
    </div>
  );
};
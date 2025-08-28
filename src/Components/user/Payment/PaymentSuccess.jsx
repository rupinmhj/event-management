import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';

export const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [paymentData, setPaymentData] = useState(null);

  useEffect(() => {
    const processPayment = async () => {
      try {
        // Get the base64 encoded data from URL query params
        const base64Response = searchParams.get("data");
        
        if (!base64Response) {
          setError("No payment data found");
          setLoading(false);
          return;
        }

        // Decode the base64 data
        const decodedData = JSON.parse(atob(base64Response));
        console.log("Payment Response:", decodedData);
        
        setPaymentData(decodedData);

        // Verify the payment with your backend
        const verificationResult = await verifyPayment(decodedData);
        
        if (verificationResult.success) {
          // Payment verified successfully
          setTimeout(() => {
            // Navigate back to user dashboard or appropriate page
            navigate('/user', { 
              state: { 
                paymentSuccess: true, 
                transactionCode: decodedData.transaction_code 
              } 
            });
          }, 3000);
        } else {
          setError("Payment verification failed");
        }
      } catch (error) {
        console.error("Error processing payment:", error);
        setError("Failed to process payment data");
      } finally {
        setLoading(false);
      }
    };

    processPayment();
  }, [searchParams, navigate]);

  // Function to verify payment with backend
  const verifyPayment = async (paymentData) => {
    try {
      const response = await fetch('/api/verify-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Add authorization headers if needed
          // 'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          transaction_code: paymentData.transaction_code,
          status: paymentData.status,
          total_amount: paymentData.total_amount,
          transaction_uuid: paymentData.transaction_uuid,
          product_code: paymentData.product_code,
          signature: paymentData.signature
        }),
      });

      if (!response.ok) {
        throw new Error('Verification request failed');
      }

      return await response.json();
    } catch (error) {
      console.error("Payment verification error:", error);
      return { success: false, error: "Verification failed" };
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
              onClick={() => navigate('/user/payment')}
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
            <p className="text-sm"><strong>Amount:</strong> Rs. {paymentData.total_amount}</p>
            <p className="text-sm"><strong>Status:</strong> {paymentData.status}</p>
            <p className="text-sm"><strong>UUID:</strong> {paymentData.transaction_uuid}</p>
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
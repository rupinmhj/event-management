import React, { useState, useEffect, useContext } from 'react';
import { v4 as uuidv4 } from "uuid";
import CryptoJS from "crypto-js";
import { useLocation, useParams, useNavigate } from 'react-router-dom';
import AuthContext from '@/context/AuthContext';
import { AlertCircle, CreditCard, Shield, ArrowLeft } from 'lucide-react';

// Environment-based configuration
const ESEWA_CONFIG = {
  development: {
    url: "https://rc-epay.esewa.com.np/api/epay/main/v2/form",
    product_code: "EPAYTEST"
  },
  production: {
    url: "https://epay.esewa.com.np/api/epay/main/v2/form",
    product_code: "EPAYTEST"
  }
};

const isProduction = process.env.NODE_ENV === 'production';
const esewaConfig = ESEWA_CONFIG[isProduction ? 'production' : 'development'];

// Helper function to encode participation and ticket data
const encodeTransactionData = (participationId, ticketIds) => {
  const data = {
    p: participationId, // participation ID
    t: ticketIds,      // ticket IDs array
    u: uuidv4()        // unique UUID
  };
  
  // Convert to base64 for URL safety
  return btoa(JSON.stringify(data));
};

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

export const Payment = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { pid } = useParams();
  const totalAmount = location.state?.totalAmount || 0;
  const tid = location.state?.tid;
  const participationId = location.state?.pid || pid;

  const { user_full_name } = useContext(AuthContext);
  const currentDomain = window.location.origin;

  // State for form handling
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFormValid, setIsFormValid] = useState(false);

  // Create a structured transaction UUID
  const generateTransactionUUID = (participationId, ticketIds) => {
    return encodeTransactionData(participationId, ticketIds);
  };

  const [formData, setFormData] = useState({
    amount: totalAmount.toString(),
    tax_amount: "0",
    total_amount: totalAmount.toString(),
    transaction_uuid: generateTransactionUUID(participationId, tid),
    product_service_charge: "0",
    product_delivery_charge: "0",
    product_code: esewaConfig.product_code,
    success_url: `${currentDomain}/user/payment-success/`,
    failure_url: `${currentDomain}/user/payment-failure/`,
    signed_field_names: "total_amount,transaction_uuid,product_code",
    signature: "",
    secret: "8gBm/:&EnhH.1/q",
  });

  console.log("Transaction UUID with encoded data:", formData.transaction_uuid);
  console.log("Participation ID:", participationId);
  console.log("Ticket IDs:", tid);
  console.log("Total Amount:", totalAmount);

  // Validation function
  const validateForm = () => {
    const newErrors = {};

    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      newErrors.amount = 'Amount must be greater than 0';
    }

    if (!participationId) {
      newErrors.participation = 'Participation ID is required';
    }

    if (!tid || tid.length === 0) {
      newErrors.tickets = 'Ticket information is required';
    }

    if (parseFloat(formData.amount) > 100000) {
      newErrors.amount = 'Amount cannot exceed Rs. 100,000';
    }

    setErrors(newErrors);
    const isValid = Object.keys(newErrors).length === 0;
    setIsFormValid(isValid);
    return isValid;
  };

  // Generate signature function
  const generateSignature = (
    total_amount,
    transaction_uuid,
    product_code,
    secret,
  ) => {
    const hashString = `total_amount=${total_amount},transaction_uuid=${transaction_uuid},product_code=${product_code}`;
    console.log('hashString', hashString);

    const hash = CryptoJS.HmacSHA256(hashString, secret);
    const hashedSignature = CryptoJS.enc.Base64.stringify(hash);
    return hashedSignature;
  };

  // Update signature when amount changes
  useEffect(() => {
    const { total_amount, transaction_uuid, product_code, secret } = formData;
    const hashedSignature = generateSignature(
      total_amount,
      transaction_uuid,
      product_code,
      secret,
    );

    console.log('hashedSignature', hashedSignature);

    setFormData(prev => ({ ...prev, signature: hashedSignature }));
    validateForm();
  }, [formData.amount, formData.total_amount, formData.transaction_uuid]);

  // Initial validation and scroll to top
  useEffect(() => {
    console.log('tid', tid);
    window.scrollTo(0, 0);
    validateForm();
  }, [tid]);

  // Handle form submission
  const handleSubmit = (e) => {
    console.log("Submitting payment form with data:", formData);

    if (!validateForm()) {
      e.preventDefault();
      return false;
    }

    setIsSubmitting(true);

    // Add a small delay to show loading state
    setTimeout(() => {
      // Form will submit automatically to eSewa
      console.log("Form validated and submitting to eSewa...");
    }, 500);
  };

  // Handle amount change
  const handleAmountChange = (e) => {
    const value = e.target.value;
    setFormData(prev => ({
      ...prev,
      amount: value,
      total_amount: value,
    }));
  };

  // Go back handler
  const handleGoBack = () => {
    navigate(-1);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden md:max-w-2xl">
        <div className="p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 text-green-600">
                <Shield className="w-5 h-5" />
                <span className="text-sm font-medium">Secure Payment</span>
              </div>
            </div>

            <div className="flex justify-center mb-4">
              <div className="p-3 bg-green-100 rounded-full">
                <CreditCard className="w-8 h-8 text-green-600" />
              </div>
            </div>

            <h1 className="text-2xl font-bold text-gray-900">Complete Payment</h1>
            <p className="mt-2 text-sm text-gray-600">Complete your payment via eSewa</p>
          </div>

          {/* Error Display */}
          {Object.keys(errors).length > 0 && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
              <div className="flex items-start">
                <AlertCircle className="w-5 h-5 text-red-400 mt-0.5 mr-3 flex-shrink-0" />
                <div className="text-sm text-red-700">
                  <p className="font-medium mb-1">Please fix the following errors:</p>
                  <ul className="list-disc list-inside space-y-1">
                    {Object.values(errors).map((error, index) => (
                      <li key={index}>{error}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          <form
            action={esewaConfig.url}
            method="POST"
            className="space-y-6"
            onSubmit={handleSubmit}
            noValidate
          >
            {/* Amount Input */}
            <div>
              <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
                Amount (Rs.) *
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <input
                  type="number"
                  id="amount"
                  name="amount"
                  min="1"
                  max="100000"
                  step="0.01"
                  className={`block w-full pl-2 pr-12 py-3 border rounded-md focus:ring-2 focus:ring-offset-2 ${errors.amount
                    ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                    : 'border-gray-300 focus:ring-green-500 focus:border-green-500'
                    }`}
                  placeholder="0.00"
                  value={formData.amount}
                  onChange={handleAmountChange}
                  required
                  readOnly
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 sm:text-sm">Rs.</span>
                </div>
              </div>
              {errors.amount && (
                <p className="mt-1 text-sm text-red-600">{errors.amount}</p>
              )}
            </div>

            {/* Payment Details */}
            <div className="bg-gray-50 p-4 rounded-lg border">
              <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                <CreditCard className="w-4 h-4" />
                Payment Summary
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal:</span>
                  <span className="font-medium">Rs. {parseFloat(formData.amount || 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Service Charge:</span>
                  <span className="font-medium">Rs. 0.00</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Tax:</span>
                  <span className="font-medium">Rs. 0.00</span>
                </div>
                <hr className="my-2" />
                <div className="flex justify-between text-base font-semibold">
                  <span>Total Amount:</span>
                  <span className="text-green-600">Rs. {parseFloat(formData.amount || 0).toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Transaction Info */}
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <h4 className="text-sm font-medium text-blue-800 mb-2">Transaction Information</h4>
              <div className="text-xs text-blue-700 space-y-1">
                <p><strong>Payment Gateway:</strong> eSewa</p>
              </div>
            </div>

            {/* Hidden fields required for eSewa */}
            <input type="hidden" id="tax_amount" name="tax_amount" value={formData.tax_amount} required />
            <input type="hidden" id="total_amount" name="total_amount" value={formData.total_amount} required />
            <input type="hidden" id="transaction_uuid" name="transaction_uuid" value={formData.transaction_uuid} required />
            <input type="hidden" id="product_code" name="product_code" value={formData.product_code} required />
            <input type="hidden" id="product_service_charge" name="product_service_charge" value={formData.product_service_charge} required />
            <input type="hidden" id="product_delivery_charge" name="product_delivery_charge" value={formData.product_delivery_charge} required />
            <input type="hidden" id="success_url" name="success_url" value={formData.success_url} required />
            <input type="hidden" id="failure_url" name="failure_url" value={formData.failure_url} required />
            <input type="hidden" id="signed_field_names" name="signed_field_names" value={formData.signed_field_names} required />
            <input type="hidden" id="signature" name="signature" value={formData.signature} required />

            {/* Submit Button */}
            <div>
              <button
                type="submit"
                disabled={isSubmitting || !isFormValid}
                className={`w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white transition-all duration-200 ${isSubmitting || !isFormValid
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 hover:shadow-lg transform hover:-translate-y-0.5'
                  }`}
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing Payment...
                  </>
                ) : (
                  <>
                    <Shield className="w-5 h-5 mr-2" />
                    Pay Rs. {parseFloat(formData.amount || 0).toLocaleString()} with eSewa
                  </>
                )}
              </button>
            </div>

            {/* Footer Info */}
            <div className="text-center space-y-2">
              <p className="text-xs text-gray-500">
                You will be redirected to eSewa to complete your payment securely.
              </p>
              <p className="text-xs text-gray-400">
                By proceeding, you agree to eSewa's terms and conditions.
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

// Payment Success Component
export const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [paymentData, setPaymentData] = useState(null);
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
        const { participationId, ticketIds } = extractTransactionData(decodedData?.transaction_uuid);
        console.log("Extracted Participation ID:", participationId);
        console.log("Extracted Ticket IDs:", ticketIds);

        if (!participationId) {
          setError("No participation ID found in transaction");
          setLoading(false);
          return;
        }

        if (!ticketIds || ticketIds.length === 0) {
          setError("No ticket information found in transaction");
          setLoading(false);
          return;
        }

        setPaymentData(decodedData);

        // Check if payment was successful
        if (decodedData.status !== 'COMPLETE') {
          setError(`Payment ${decodedData.status.toLowerCase()}. Please try again.`);
          setLoading(false);
          return;
        }

        // Verify the payment with your backend
        const verificationResult = await verifyPayment(decodedData, participationId, ticketIds);

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

  const { participationId, ticketIds } = extractTransactionData(paymentData?.transaction_uuid);

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
            <p className="text-sm"><strong>Participation ID:</strong> {participationId}</p>
            <p className="text-sm"><strong>Ticket IDs:</strong> {ticketIds.join(', ')}</p>
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
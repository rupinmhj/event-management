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

export const Payment = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { pid } = useParams(); // to be removed&&&
  const totalAmount = location.state?.totalAmount || 0;
  const tid = location.state?.tid;


  const participationId = location.state?.pid || pid; // Use from state or params
  const { user_full_name } = useContext(AuthContext);
  const currentDomain = window.location.origin;

  // State for form handling
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFormValid, setIsFormValid] = useState(false);

  // Create a transaction UUID that includes the participation_id
  // Format: participationId-uuid (e.g., "123-c58caf1b-7aba-4983-bb5d-46ef777363bf")
  const generateTransactionUUID = (participationId) => {
    const uuid = uuidv4();
    return participationId ? `${participationId}-${uuid}` : uuid;
  };


  const [formData, setFormData] = useState({
    amount: totalAmount.toString(),
    tax_amount: "0",
    total_amount: totalAmount.toString(),
    // participant_ticket_ids: tid.join,
    transaction_uuid: `${generateTransactionUUID(participationId)}___${tid.join("__")}`,
    product_service_charge: "0",
    product_delivery_charge: "0",
    product_code: esewaConfig.product_code,
    success_url: `${currentDomain}/user/payment-success/`,
    failure_url: `${currentDomain}/user/payment-failure/`,
    signed_field_names: "total_amount,transaction_uuid,product_code",
    signature: "",
    secret: "8gBm/:&EnhH.1/q",
  });

  console.log("Transaction UUID with participation_id:", formData.transaction_uuid);
  console.log("Participation ID:", participationId);
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

    // if (!formData.participant_ticket_ids || formData.participant_ticket_ids.length === 0) {
    //   newErrors.tickets = 'Ticket information is required';
    // }

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
              {/* <button
                onClick={handleGoBack}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="text-sm">Back</span>
              </button> */}
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
                {/* <p><strong>Environment:</strong> {isProduction ? 'Production' : 'Test Mode'}</p> */}
                {/* <p><strong>Transaction ID:</strong> {formData.transaction_uuid.substring(0, 20)}...</p> */}
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

            {/* Add participant ticket IDs */}
            <input type="hidden" id="participant_ticket_ids" name="participant_ticket_ids" value={formData.participant_ticket_ids} />

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
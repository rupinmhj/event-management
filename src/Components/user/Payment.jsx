import React, { useState, useEffect, useContext } from 'react';
import { v4 as uuidv4 } from "uuid";
import CryptoJS from "crypto-js";
import { useLocation, useParams } from 'react-router-dom';
import AuthContext from '@/context/AuthContext';

export const Payment = () => {
  const location = useLocation();
  const { pid } = useParams(); // Get participation ID from URL params
  const totalAmount = location.state?.totalAmount || 0;
  const participationId = location.state?.pid || pid; // Use from state or params
  const { user_full_name } = useContext(AuthContext);
  const currentDomain = window.location.origin;
  
  // Create a transaction UUID that includes the participation_id
  // Format: participationId-uuid (e.g., "123-c58caf1b-7aba-4983-bb5d-46ef777363bf")

  useEffect(()=>{
    window.scrollTo(0,0);
  })

  const generateTransactionUUID = (participationId) => {
    const uuid = uuidv4();
    return participationId ? `${participationId}-${uuid}` : uuid;
  };
  
  const [formData, setformData] = useState({
    amount: totalAmount.toString(),
    tax_amount: "0",
    total_amount: totalAmount.toString(),
    transaction_uuid: generateTransactionUUID(participationId),
    product_service_charge: "0",
    product_delivery_charge: "0",
    product_code: "EPAYTEST",
    success_url: `${currentDomain}/user/payment-success/`,
    failure_url: `${currentDomain}/user/payment-success/`,
    signed_field_names: "total_amount,transaction_uuid,product_code",
    signature: "",
    secret: "8gBm/:&EnhH.1/q",
  });

  console.log("Transaction UUID with participation_id:", formData.transaction_uuid);
  console.log("Participation ID:", participationId);
  console.log("Total Amount:", totalAmount);

  // Generate signature function
  const generateSignature = (
    total_amount,
    transaction_uuid,
    product_code,
    secret
  ) => {
    const hashString = `total_amount=${total_amount},transaction_uuid=${transaction_uuid},product_code=${product_code}`;
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
      secret
    );

    setformData(prev => ({ ...prev, signature: hashedSignature }));
  }, [formData.amount, formData.total_amount, formData.transaction_uuid]);

  // Handle form submission
  const handleSubmit = (e) => {
    console.log("Submitting payment form with data:", formData);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden md:max-w-2xl">
        <div className="p-8">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-900">Complete Payment</h1>
            <p className="mt-2 text-sm text-gray-600">Complete your payment via eSewa</p>
            {/* <p className="mt-1 text-xs text-gray-500">
              Participation ID: {participationId}
            </p> */}
          </div>

          <form
            action="https://rc-epay.esewa.com.np/api/epay/main/v2/form"
            method="POST"
            className="space-y-6"
            onSubmit={handleSubmit}
          >
            {/* Amount Input */}
            <div>
              <label htmlFor="amount" className="block text-sm font-medium text-gray-700">
                Amount (Rs.)
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <input
                  type="number"
                  id="amount"
                  name="amount"
                  min="1"
                  step="0.01"
                  className="block w-full pl-2 pr-12 py-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder="0.00"
                  value={formData.amount}
                  onChange={({ target }) =>
                    setformData(prev => ({
                      ...prev,
                      amount: target.value,
                      total_amount: target.value,
                    }))
                  }
                  required
                  readOnly
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 sm:text-sm">Rs.</span>
                </div>
              </div>
            </div>

            {/* Display transaction details */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Payment Details</h3>
              <div className="space-y-1 text-xs text-gray-600">
                <p><strong>Amount:</strong> Rs. {formData.amount}</p>
                {/* <p><strong>Transaction UUID:</strong> {formData.transaction_uuid}</p> */}
                {/* <p><strong>Participation ID:</strong> {participationId}</p> */}
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
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors duration-200"
              >
                Pay Rs. {formData.amount} with eSewa
              </button>
            </div>

            <div className="text-center mt-4">
              <p className="text-xs text-gray-500">
                You will be redirected to eSewa to complete your payment securely.
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
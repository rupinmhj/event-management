import React, { useState, useEffect, useContext } from 'react';
import { v4 as uuidv4 } from "uuid";
import CryptoJS from "crypto-js";
import { useLocation } from 'react-router-dom';
import AuthContext from '@/context/AuthContext';
export const Payment = () => {
  const location = useLocation();
  const totalAmount = location.state?.totalAmount || 0;
  const { user_full_name } = useContext(AuthContext);
  const currentDomain = window.location.origin;
  const [formData, setformData] = useState({
    amount: totalAmount.toString(),
    tax_amount: "0",
    total_amount: totalAmount.toString(),
    transaction_uuid: uuidv4(),
    product_service_charge: "0",
    product_delivery_charge: "0",
    product_code: "EPAYTEST",
    success_url: `${currentDomain}/payment-success/`,
    failure_url: `${currentDomain}/payment-success/`,
    signed_field_names: "total_amount,transaction_uuid,product_code",
    signature: "",
    secret: "8gBm/:&EnhH.1/q",
  });

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

    setformData({ ...formData, signature: hashedSignature });
  }, [formData.amount]);


  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden md:max-w-2xl">
        <div className="p-8">
          <div className="text-center mb-8">
            {/* <h2 className="text-3xl font-bold text-gray-900">Checkout</h2> */}
            <p className="mt-2 text-sm text-gray-600">Complete your payment via eSewa</p>
          </div>

          <form
            action="https://rc-epay.esewa.com.np/api/epay/main/v2/form"
            method="POST"
            className="space-y-6"
          >
            {/* Amount Input */}
            <div>
              <label htmlFor="amount" className="block text-sm font-medium text-gray-700">
                Amount (Rs.)
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  {/* <span className="text-gray-500 sm:text-sm ">Rs.</span> */}
                </div>
                <input
                  type="number"
                  id="amount"
                  name="amount"
                  min="1"
                  className="block w-full pl-7 pr-12 pl-2 py-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder="0.00"
                  value={formData.amount}
                  onChange={({ target }) =>
                    setformData({
                      ...formData,
                      amount: target.value,
                      total_amount: target.value,
                    })
                  }
                  // readOnly
                  required
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 sm:text-sm ">Rs.</span>
                </div>
              </div>
            </div>

            {/* Customer Information */}
            {/* <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Customer Information</h3>

              <div className="grid grid-cols-1 gap-y-4 gap-x-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="first-name" className="block text-sm font-medium text-gray-700">
                    Full name
                  </label>
                  <input
                    type="text"
                    id="first-name"
                    value={user_full_name}
                    className="mt-1 block w-full border border-gray-300 rounded-md py-2 px-3 shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>


              </div>
            </div> */}

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
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
              >
                Pay with eSewa
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
// src/utils/esewaConfig.js
import CryptoJS from "crypto-js";

export const esewaConfig = {
  // Test credentials (replace with live credentials for production)
  merchantId: "EPAYTEST",
  secretKey: "8gBm/:&EnhH.1/q", 
  paymentUrl: "https://rc-epay.esewa.com.np/api/epay/main/v2/form", // Test URL
  
  // For production, use:
  // paymentUrl: "https://epay.esewa.com.np/api/epay/main/v2/form"
};

export const generateEsewaPayment = (eventData, userInfo) => {
  const {
    eventId,
    eventTitle,
    ticketPrice,
    ticketQuantity,
    totalAmount
  } = eventData;

  // Generate unique transaction UUID
  const uuid = Date.now().toString();
  
  // Prepare transaction data to pass through payment flow
  const transactionData = {
    user_id: userInfo.id,
    event_id: eventId,
    event_title: eventTitle,
    ticket_quantity: ticketQuantity,
    amount_per_ticket: ticketPrice,
    total_amount: totalAmount,
    transaction_uuid: uuid,
    timestamp: new Date().toISOString()
  };

  // Encode transaction data for URL
  const transactionJson = JSON.stringify(transactionData);
  const encodedTransactionData = btoa(transactionJson);

  // Create signature for security
  const signatureString = `total_amount=${totalAmount},transaction_uuid=${uuid},product_code=${esewaConfig.merchantId}`;
  const hash = CryptoJS.HmacSHA256(signatureString, esewaConfig.secretKey);
  const signature = CryptoJS.enc.Base64.stringify(hash);

  // Get current domain for redirect URLs
  const currentDomain = window.location.origin;

  // Prepare payment form data
  const paymentData = {
    amount: totalAmount,
    failure_url: `${currentDomain}/payment-failed`,
    product_delivery_charge: 0,
    product_service_charge: 0,
    product_code: esewaConfig.merchantId,
    signature: signature,
    signed_field_names: "total_amount,transaction_uuid,product_code",
    success_url: `${currentDomain}/payment-success/${encodedTransactionData}/`,
    tax_amount: 0,
    total_amount: totalAmount,
    transaction_uuid: uuid,
  };

  return paymentData;
};

export const submitEsewaPayment = (paymentData) => {
  // Create and submit form to eSewa
  const form = document.createElement("form");
  form.method = "POST";
  form.action = esewaConfig.paymentUrl;

  Object.keys(paymentData).forEach((key) => {
    const input = document.createElement("input");
    input.type = "hidden";
    input.name = key;
    input.value = paymentData[key];
    form.appendChild(input);
  });

  document.body.appendChild(form);
  form.submit();
};
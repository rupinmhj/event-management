import React from "react";
import { useLocation, useParams } from "react-router-dom";
import { useGetData } from "../../../service";
import { Flex, Box, Avatar, Button } from "@chakra-ui/react";
import CryptoJS from "crypto-js";
const apiUrl = process.env.REACT_APP_API_URL;

export const Articlepreview = () => {
  const { slug } = useParams();
  const location = useLocation();
  const post_id = location.state?.postid;

  // console.log(post_id)

  const { rows: post, loading } = useGetData(`content/contents/${post_id}/`);

  const handleEsewaPayment = () => {
    const merchantId = "EPAYTEST"; 
    const contentAmount = post?.price?.price; 
    const contentslug = slug;  
    const uuid =  Date.now()
    const secretKey= "8gBm/:&EnhH.1/q"

    const transactionData = {
        user_id: post?.user?.id,   
        product_id: post?.id,      
        contentAmount: post?.price?.price,
        slug: post_id,
        transaction_uuid: uuid
      };

      const transactionJson = JSON.stringify(transactionData);
      const encodedTransactionData = btoa(transactionJson);

    const signatureString = `total_amount=${contentAmount},transaction_uuid=${uuid},product_code=${merchantId}`;
    console.log("Signature String: ", signatureString);  


    const hash = CryptoJS.HmacSHA256(signatureString, secretKey);
    const signature = CryptoJS.enc.Base64.stringify(hash);

    const currentDomain = window.location.origin;
    const paymentData = {
      amount: contentAmount,
      failure_url: `${currentDomain}/payment-fail`,  
      product_delivery_charge: 0,
      product_service_charge: 0,
      product_code: merchantId,  
      signature: signature,  
      signed_field_names: "total_amount,transaction_uuid,product_code",  
      success_url: `${currentDomain}/payment-success/${encodedTransactionData}/`,  
      tax_amount: 0,
      total_amount: contentAmount,
      transaction_uuid: uuid,  
    };

    console.log("Payment Data: ", paymentData);  // For debugging


    const form = document.createElement("form");
    form.method = "POST";
    form.action = "https://rc-epay.esewa.com.np/api/epay/main/v2/form";  
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


  return (
    <div className="w-[80%] mx-auto py-20 flex justify-between">
      <div className="content-container-box w-[60%]">
        <h1 className="post-preview-title">{post?.title}</h1>

        <div>
          <Flex spacing="4" alignItems="center">
            <Flex flex="1" gap="3" alignItems="center" flexWrap="wrap">
              <Avatar name={post?.user?.full_name} src="" />
              <Box>
                <h1 className="font-medium text-[14px]">
                  {post?.user?.full_name}
                </h1>
                <p className="text-[14px] mb-0 mt-[-6px]">{post?.user?.post}</p>
              </Box>
            </Flex>
            <p className="mb-0">
              <span className="font-semibold">Published On</span>{" "}
              {post?.created_at}
            </p>
          </Flex>

          <div className="profile-navigations-list mt-6">
            <p className="mb-2 text-[rgba(0,0,0,0.8)">
              <span className="font-semibold text-[#173da6]">Services : </span>
              {post?.services?.map((service) => service.name_en).join(", ")}
            </p>
            <p className="mb-2 text-[rgba(0,0,0,0.8)">
              <span className="font-semibold text-[#173da6]">Levels : </span>
              {post?.levels?.map((level) => level.name_en).join(", ")}
            </p>
            <p className="mb-2 text-[rgba(0,0,0,0.8)">
              <span className="font-semibold text-[#173da6]">
                Categories :{" "}
              </span>{" "}
              {post?.categories?.map((category) => category.name_en).join(", ")}
            </p>
            <p className="mb-0 text-[rgba(0,0,0,0.8)">
              <span className="font-semibold text-[#173da6]">Overview : </span>
              <br />
              {post?.excerpt}
            </p>
          </div>
        </div>
      </div>

      <div className="content-container-box w-[40%] ms-6">
        <h1 className="font-semibold text-[16px] mb-3">
          Select payment method
        </h1>

        <p className="mb-0 text-[rgba(0,0,0,0.8)">
          <span className="font-semibold text-[#173da6]">Price : </span>
          NRs. {post?.price?.price}
        </p>

        <div className="mt-3 flex justify-between">
          <Button className="payment-option" onClick={handleEsewaPayment}>
            <img
              src="https://seeklogo.com/images/E/esewa-logo-DA36F8FD2F-seeklogo.com.png"
              alt="esewa"
              width="50%"
            />
          </Button>
          <Button className="payment-option ms-2">
            <img
              src="https://seeklogo.com/images/F/fonepay-logo-C9B7151FD6-seeklogo.com.png"
              alt="fonepay"
              width="50%"
            />
          </Button>
        </div>
      </div>
    </div>
  );
};
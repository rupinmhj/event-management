// src/components/user/payment/PaymentFailure.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { XCircle, RefreshCw, ArrowLeft, MessageCircle, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';

const PaymentFailure = () => {
  const navigate = useNavigate();

  const commonIssues = [
    {
      icon: "💳",
      title: "Insufficient Funds",
      description: "Your account may not have enough balance"
    },
    {
      icon: "🌐",
      title: "Network Issues",
      description: "Connection problems during payment processing"
    },
    {
      icon: "❌",
      title: "Payment Cancelled",
      description: "Transaction was cancelled by user or system"
    },
    {
      icon: "⚠️",
      title: "Technical Error",
      description: "Temporary issue with payment gateway"
    }
  ];

  const handleRetry = () => {
    window.history.back();
  };

  const handleContactSupport = () => {
    // You can implement your support contact logic here
    // For now, we'll navigate to a support page or show contact info
    navigate('/support');
  };

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-2xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Error Header */}
          <Card className="border-red-200 bg-red-50/50">
            <CardContent className="text-center pt-6">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2 }}
              >
                <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
              </motion.div>
              <h1 className="text-3xl font-bold text-red-700 mb-2">
                Payment Failed
              </h1>
              <p className="text-red-600 mb-4">
                Unfortunately, your payment could not be processed.
              </p>
              <div className="bg-white/70 backdrop-blur-sm rounded-lg p-3 inline-block">
                <p className="text-sm text-muted-foreground">
                  Don't worry - no amount has been deducted from your account.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Common Issues */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 mb-4">
                <AlertTriangle className="w-5 h-5 text-orange-500" />
                <h2 className="text-lg font-semibold">Common Issues</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {commonIssues.map((issue, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg"
                  >
                    <span className="text-2xl">{issue.icon}</span>
                    <div>
                      <h4 className="font-medium text-sm">{issue.title}</h4>
                      <p className="text-xs text-muted-foreground mt-1">
                        {issue.description}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Troubleshooting Tips */}
          <Card>
            <CardContent className="pt-6">
              <h2 className="text-lg font-semibold mb-4">What You Can Do</h2>
              
              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                  <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                    1
                  </div>
                  <div>
                    <h4 className="font-medium text-blue-900">Check Your Account</h4>
                    <p className="text-sm text-blue-700">
                      Verify you have sufficient funds in your eSewa account or linked bank account.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
                  <div className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                    2
                  </div>
                  <div>
                    <h4 className="font-medium text-green-900">Try Different Payment Method</h4>
                    <p className="text-sm text-green-700">
                      Consider using a different payment method or contact your bank.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-purple-50 rounded-lg">
                  <div className="w-6 h-6 bg-purple-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                    3
                  </div>
                  <div>
                    <h4 className="font-medium text-purple-900">Check Internet Connection</h4>
                    <p className="text-sm text-purple-700">
                      Ensure you have a stable internet connection and try again.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Button
              onClick={handleRetry}
              className="flex-1 bg-blue-600 hover:bg-blue-700"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Payment Again
            </Button>
            
            <Button
              variant="outline"
              onClick={() => navigate('/events')}
              className="flex-1"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Events
            </Button>
          </div>

          {/* Support Section */}
          <Card className="border-orange-200 bg-orange-50/50">
            <CardContent className="pt-6">
              <div className="text-center">
                <MessageCircle className="w-12 h-12 text-orange-600 mx-auto mb-3" />
                <h3 className="text-lg font-semibold text-orange-800 mb-2">
                  Still Having Issues?
                </h3>
                <p className="text-orange-700 mb-4 text-sm">
                  Our support team is here to help you complete your booking.
                </p>
                <Button
                  onClick={handleContactSupport}
                  variant="outline"
                  className="border-orange-300 text-orange-700 hover:bg-orange-100"
                >
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Contact Support
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Additional Info */}
          <div className="text-center">
            <p className="text-xs text-muted-foreground">
              If you continue to experience issues, please try again later or contact our support team.
              Reference this page when contacting support for faster assistance.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default PaymentFailure;
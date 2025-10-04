// src/Components/user/payment/PaymentFailure.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from "@/Components/ui/card";
import { Button } from "@/Components/ui/button";
import { XCircle, RefreshCw, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';

const PaymentFailure = () => {
  const navigate = useNavigate();

  const handleRetry = () => {
    window.history.back();
  };

  const handleBack = () => {
    navigate('/user/events');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <Card className="p-6 text-center">
          <CardContent>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.1 }}
            >
              <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            </motion.div>

            <h1 className="text-2xl font-bold text-red-600 mb-2">
              Payment Failed
            </h1>
            <p className="text-sm text-muted-foreground mb-6">
              Your payment could not be processed. Don’t worry, no amount has been deducted.
              Please try again or return to events.
            </p>

            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                onClick={handleRetry}
                className="flex-1 bg-blue-600 hover:bg-blue-700"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Try Again
              </Button>
              <Button
                variant="outline"
                onClick={handleBack}
                className="flex-1"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Events
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default PaymentFailure;

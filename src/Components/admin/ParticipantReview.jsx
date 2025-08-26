import React, { useEffect, useState, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import DOMPurify from "dompurify";
import {
  ArrowLeft,
  FileText,
  Download,
  CheckCircle,
  XCircle,
  Clock,
  User,
  Calendar,
  AlertCircle,
  Eye,
} from "lucide-react";

import useAxiosAuth from "@/hooks/useAxiosAuth";
import AuthContext from "@/context/AuthContext";
export const ParticipantReview = () => {
  const [participantData, setParticipantData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState({});
  const { id } = useParams(); // participantId from route
  const participantId = id; // Adjust based on your route setup
  const api = useAxiosAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();
  const { authReady, authTokens } = useContext(AuthContext);
  useEffect(() => {
    const fetchParticipantDetail = async () => {
      try {
        if (!authReady && !authTokens) return;
        setLoading(true);
        const res = await api.get(`/api/event/participation-detail/${participantId}/`);
        console.log('participant detail', res.data);
        setParticipantData(res.data);
      } catch (error) {
        console.error("Error fetching participant details:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchParticipantDetail();
  }, [participantId, api, authReady, authTokens]);

  const handleVerification = async (responseId, isVerified) => {
    setVerifying(prev => ({ ...prev, [responseId]: true }));

    try {
      const res = await api.put(`/api/event/response/${responseId}/verify/`, {
        is_verified: isVerified
      });
      console.log('isVerified', res.data);
      // Update local state
      setParticipantData(prev => ({
        ...prev,
        responses: prev.responses.map(response =>
          response.id === responseId
            ? { ...response, is_verified: isVerified }
            : response
        )
      }));
    } catch (error) {
      console.error("Error updating verification:", error);
    } finally {
      setVerifying(prev => ({ ...prev, [responseId]: false }));
    }
  };


  const getStatusBadge = (response) => {
    if (!response.is_submitted) {
      return <Badge variant="destructive" className="text-xs">Not Submitted</Badge>;
    }

    if (response.requirement_detail.is_verification_required) {
      if (response.is_verified) {
        return <Badge variant="default" className="bg-green-600 text-xs">Verified</Badge>;
      } else {
        return <Badge variant="secondary" className="text-xs">Pending Verification</Badge>;
      }
    }

    return <Badge variant="default" className="bg-blue-600 text-xs">Submitted</Badge>;
  };

  const getDeadlineStatus = (deadline) => {
    const today = new Date();
    const deadlineDate = new Date(deadline);
    const daysDiff = Math.ceil((deadlineDate - today) / (1000 * 60 * 60 * 24));

    if (daysDiff < 0) {
      return { status: 'overdue', text: `${Math.abs(daysDiff)} days overdue`, color: 'text-red-600' };
    } else if (daysDiff === 0) {
      return { status: 'today', text: 'Due today', color: 'text-orange-600' };
    } else if (daysDiff <= 3) {
      return { status: 'soon', text: `${daysDiff} days left`, color: 'text-yellow-600' };
    } else {
      return { status: 'normal', text: `${daysDiff} days left`, color: 'text-green-600' };
    }
  };

  const renderRequirementValue = (response) => {
    const { type } = response.requirement_detail;
    console.log('response', response)

    switch (type) {
      case 'FILE':
        return (
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-gray-500" />
            <span className="text-sm font-medium">{response.file?.split("/").pop()}</span>
            {response.file && (
              <Button
                size="sm"
                variant="outline"
                className="ml-2 h-6 text-xs"
                onClick={() => window.open(response.file, '_blank')}
              >
                <Eye className="w-3 h-3 mr-1" />
                View
              </Button>
            )}
          </div>
        );
      case 'TEXT':
        return <span className="text-sm">{response.value}</span>;
      case 'TEXTAREA':
        return (
          <>
            {/* Preview with click to expand */}
            <div
              className="bg-gray-50 p-3 rounded-md text-sm prose cursor-pointer hover:bg-gray-100 transition-colors relative"
              onClick={() => setIsModalOpen(true)}
            >
              <div
                className="line-clamp-3"
                dangerouslySetInnerHTML={{
                  __html: DOMPurify.sanitize(response.value)
                }}
              />
              <div className="absolute bottom-2 right-2 text-xs text-gray-500">
                Click to expand
              </div>
            </div>

            {/* Modal */}
            {isModalOpen && (
              <div className="fixed inset-0 z-50 flex items-center justify-center">
                {/* Backdrop */}
                <div
                  className="fixed inset-0 bg-black bg-opacity-50"
                  onClick={() => setIsModalOpen(false)}
                />

                {/* Modal Content */}
                <div className="relative bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[80vh] flex flex-col">
                  {/* Header */}
                  <div className="flex items-center justify-between p-4 border-b">
                    <h3 className="text-lg font-semibold">Content</h3>
                    <button
                      onClick={() => setIsModalOpen(false)}
                      className="text-gray-400 hover:text-gray-600 text-xl"
                    >
                      ×
                    </button>
                  </div>

                  {/* Scrollable Content */}
                  <div className="flex-1 overflow-y-auto p-4">
                    <div
                      className="prose max-w-none"
                      dangerouslySetInnerHTML={{
                        __html: DOMPurify.sanitize(response.value)
                      }}
                    />
                  </div>

                  {/* Footer */}
                  <div className="flex justify-end p-4 border-t">
                    <button
                      onClick={() => setIsModalOpen(false)}
                      className="px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        );

      default:
        return <span className="text-sm">{response.value}</span>;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!participantData) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Participant data not found</p>
          <Button onClick={() => navigate(-1)} className="mt-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 pt-20 max-w-6xl  ">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">

      </div>

      {/* Participant Info Card */}
      <Card className="mb-6 border ">
        <CardHeader>
          <div className="flex items-center justify-between gap-3">
            <div className="flex gap-4 items-center">
              <User className="w-5 h-5 text-primary" />
              <h2 className="text-xl font-semibold text-gray-800">Participant Information</h2>
            </div>
            <div className="">
              <button
                
                onClick={() => navigate(`/admin/user-profile/${participantData.user}`)}
              >
                <Eye className="w-5 h-5 text-gray-600 hover:text-blue/80" />
              </button>
            </div>

          </div>
        </CardHeader>
        <CardContent className="relative cursor-pointer"  onClick={() => navigate(`/admin/user-profile/${participantData.user}`)}>
          {/* Eye icon at top-right */}


          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Name</p>
              <p className="font-semibold text-lg text-gray-800">{participantData.participant_name}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Event</p>
              <p className="font-semibold text-gray-800">{participantData["event-title"]}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Email</p>
              <p className="font-semibold text-gray-800">{participantData?.user_detail?.email}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Contact Number</p>
              <p className="font-semibold text-gray-800">{participantData?.user_detail?.phone_number}</p>
            </div>
          </div>
        </CardContent>


      </Card>

      {/* Requirements Review */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-end">
            {/* <div className="flex items-center gap-3">
              <FileText className="w-5 h-5 text-primary" />
              <h2 className="text-xl font-semibold">Requirements Review</h2>
            </div> */}
            <div className="text-sm text-gray-600">
              {participantData.responses.filter(r => r.is_submitted).length} / {participantData.responses.length} submitted
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <ScrollArea className="">
            <div className="space-y-6">
              {participantData.responses.map((response, index) => {
                const deadlineInfo = getDeadlineStatus(response.requirement_detail.deadline);

                return (
                  <div key={response.requirement} className="border rounded-lg p-4">
                    {/* Requirement Header */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-lg">{response.requirement_detail.label}</h3>
                          {getStatusBadge(response)}
                        </div>
                        <p className="text-gray-600 text-sm mb-2">
                          {response.requirement_detail.description}
                        </p>
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            <span>Due: {response.requirement_detail.deadline}</span>
                          </div>
                          <div className={`flex items-center gap-1 ${deadlineInfo.color}`}>
                            <Clock className="w-3 h-3" />
                            <span>{deadlineInfo.text}</span>
                          </div>
                        </div>
                      </div>
                    </div>



                    {/* Submitted Content */}
                    {response.is_submitted ? (
                      <div className="space-y-3">
                        <div>
                          <p className="text-sm font-medium text-gray-700 mb-2">Submitted Content:</p>
                          {renderRequirementValue(response)}
                        </div>

                        {/* Verification Actions */}
                        {response.requirement_detail.is_verification_required && (
                          <div className="flex items-center gap-3 pt-3 border-t">
                            <p className="text-sm font-medium text-gray-700">Verification:</p>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant={response.is_verified ? "default" : "outline"}
                                onClick={() => handleVerification(response.id, true)} // ✅ use response.id
                                disabled={verifying[response.id]}
                                className="h-7 text-xs"
                              >
                                {verifying[response.id] ? (
                                  <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                                ) : (
                                  <CheckCircle className="w-3 h-3 mr-1" />
                                )}
                                Verify
                              </Button>

                              <Button
                                size="sm"
                                variant={!response.is_verified ? "destructive" : "outline"}
                                onClick={() => handleVerification(response.id, false)}
                                disabled={verifying[response.id]}
                                className="h-7 text-xs"
                              >
                                {verifying[response.id] ? (
                                  <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                                ) : (
                                  <XCircle className="w-3 h-3 mr-1" />
                                )}
                                Reject
                              </Button>

                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <FileText className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                        <p className="text-sm">No submission yet</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
};
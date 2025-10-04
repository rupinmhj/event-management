import React, { useEffect, useState, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader } from "@/Components/ui/card";
import { Button } from "@/Components/ui/button";
import { Badge } from "@/Components/ui/badge";
import { ScrollArea } from "@/Components/ui/scroll-area";
import { Textarea } from "@/Components/ui/textarea";
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
  MessageSquare,
} from "lucide-react";

import useAxiosAuth from "@/hooks/useAxiosAuth";
import AuthContext from "@/context/AuthContext";

export const ParticipantReview = () => {
  const [participantData, setParticipantData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState({});
  const [remarks, setRemarks] = useState({});
  const [showRemarksInput, setShowRemarksInput] = useState({});
  const { id } = useParams(); // participantId from route
  const participantId = id;
  const api = useAxiosAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();
  const { authReady, authTokens } = useContext(AuthContext);

  const formatDate = (dateString) => {
    console.log('dateString', dateString);
    const date = new Date(dateString);

    // Nepal timezone offset in minutes (+5:45 = 345 minutes)
    const nepalOffset = 5 * 60 + 45;

    // Convert date to UTC in milliseconds
    const utc = date.getTime() + date.getTimezoneOffset() * 60000;

    // Convert UTC to Nepal time
    const nepalTime = new Date(utc + nepalOffset * 60 * 1000);

    // Format Nepali date/time
    return nepalTime.toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true
    });
  };

  useEffect(() => {
    const fetchParticipantDetail = async () => {
      try {
        if (!authReady && !authTokens) return;
        setLoading(true);
        const res = await api.get(`/api/event/participation-detail/${participantId}/`);
        console.log('participant detail---', res.data);
        setParticipantData(res.data);
      } catch (error) {
        console.error("Error fetching participant details:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchParticipantDetail();
  }, [participantId, api, authReady, authTokens]);

  const handleStatusUpdate = async (responseId, status, remarksText = '') => {
    setUpdating(prev => ({ ...prev, [responseId]: true }));

    try {
      const requestData = {
        status: status
      };

      // Add remarks if provided
      if (remarksText.trim()) {
        requestData.remarks = remarksText.trim();
      }

      const res = await api.put(`/api/event/response/${responseId}/verify/`, requestData);
      console.log('status update response', res.data);

      // Update local state
      setParticipantData(prev => ({
        ...prev,
        responses: prev.responses.map(response =>
          response.id === responseId
            ? {
              ...response,
              status: status,
              remarks: requestData.remarks || response.remarks
            }
            : response
        )
      }));

      // Clear remarks input and hide it
      setRemarks(prev => ({ ...prev, [responseId]: '' }));
      setShowRemarksInput(prev => ({ ...prev, [responseId]: false }));

    } catch (error) {
      console.error("Error updating status:", error);
    } finally {
      setUpdating(prev => ({ ...prev, [responseId]: false }));
    }
  };

  const handleRemarksChange = (responseId, value) => {
    setRemarks(prev => ({ ...prev, [responseId]: value }));
  };

  const toggleRemarksInput = (responseId) => {
    setShowRemarksInput(prev => ({ ...prev, [responseId]: !prev[responseId] }));
  };

  const getStatusBadge = (response) => {
    if (!response.is_submitted) {
      return <Badge variant="destructive" className="text-xs">Not Submitted</Badge>;
    }

    if (response.requirement_detail.is_verification_required) {
      switch (response.status) {
        case 'verified':
          return <Badge variant="default" className="bg-green-600 text-xs">Verified</Badge>;
        case 'rejected':
          return <Badge variant="destructive" className="text-xs">Rejected</Badge>;
        case 'submitted':
        default:
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
    console.log('response', response);

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
                className="text-white hover:text-white flex items-center gap-1 text-sm font-medium bg-blue/90 hover:bg-blue/70 px-3 py-2 rounded-md"
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
    <div className="container mx-auto p-6 pt-20 max-w-6xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">

      </div>

      {/* Participant Info Card */}
      <Card className="mb-6 border">
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
        <CardContent className="relative cursor-pointer" onClick={() => navigate(`/admin/user-profile/${participantData.user}`)}>
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
                            <span>Due: {formatDate(response.requirement_detail.deadline)}</span>
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

                        {/* Display existing remarks if any */}
                        {response.remarks && response.status === 'rejected' && (
                          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
                            <div className="flex items-start gap-2">
                              <MessageSquare className="w-4 h-4 text-yellow-600 mt-0.5" />
                              <div>
                                <p className="text-sm font-medium text-yellow-800">Admin Remarks:</p>
                                <p className="text-sm text-yellow-700">{response.remarks}</p>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Status Actions */}
                        {response.requirement_detail.is_verification_required && (
                          <div className="space-y-3 pt-3 border-t">
                            <div className="flex items-center gap-3">
                              {/* <p className="text-sm font-medium text-gray-700">Status:</p> */}
                              <div className="flex gap-2">
                                {/* Show Verify button only if not verified */}
                                {response.status !== 'verified' && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleStatusUpdate(response.id, 'verified')}
                                    disabled={updating[response.id]}
                                    className="h-7 text-xs"
                                  >
                                    {updating[response.id] ? (
                                      <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-gray-600"></div>
                                    ) : (
                                      <CheckCircle className="w-3 h-3 mr-1" />
                                    )}
                                    Verify
                                  </Button>
                                )}

                                {/* Show Reject button only if not rejected */}
                                {response.status !== 'verified' && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => toggleRemarksInput(response.id)}
                                    disabled={updating[response.id]}
                                    className="h-7 text-xs border-red-300 text-red-600 hover:bg-red-50 "
                                  >
                                    <XCircle className="w-3 h-3 mr-1" />
                                    Reject
                                  </Button>
                                )}


                              </div>
                            </div>

                            {/* Remarks input section for rejection */}
                            {showRemarksInput[response.id] && (
                              <div className="space-y-3 p-3 bg-gray-50 rounded-md">
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Rejection Remarks
                                  </label>
                                  <Textarea
                                    placeholder="Provide feedback on why this submission was rejected..."
                                    value={remarks[response.id] || ''}
                                    onChange={(e) => handleRemarksChange(response.id, e.target.value)}
                                    rows={3}
                                    className="w-full text-sm"
                                  />
                                </div>
                                <div className="flex gap-2 justify-end">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => toggleRemarksInput(response.id)}
                                    className="h-7 text-xs"
                                  >
                                    Cancel
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="destructive"
                                    onClick={() => handleStatusUpdate(response.id, 'rejected', remarks[response.id])}
                                    disabled={updating[response.id] || !remarks[response.id]?.trim()}
                                    className="h-7 text-xs"
                                  >
                                    {updating[response.id] ? (
                                      <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                                    ) : (
                                      <XCircle className="w-3 h-3 mr-1" />
                                    )}
                                    Reject Submission
                                  </Button>
                                </div>
                              </div>
                            )}
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
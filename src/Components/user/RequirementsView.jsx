import React, { useContext, useEffect, useState } from 'react';
import { Card, CardContent, CardHeader } from "@/Components/ui/card";
import { Button } from "@/Components/ui/button";
import { Badge } from "@/Components/ui/badge";
import { TabsContent } from "@/Components/ui/tabs";
import ViewSubmissionModal from './ViewSubmissionModal';
import { toast, ToastContainer } from 'react-toastify'
import {
    FileText,
    Eye,
    Edit,
    Plus,
    CheckCircle,
    AlertCircle,
    Upload,
    Link,
    Clock
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import AuthContext from "@/context/AuthContext";
import useAxiosAuth from "@/hooks/useAxiosAuth";

import SubmissionModal from './SubmissionModal';

export function RequirementsView({ requirements = [] }) {
    const [requirementsData, setRequirementsData] = useState(requirements || []);
    const [participationDetails, setParticipationDetails] = useState(null);
    const [ownParticipations, setOwnParticipations] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    // Modal states
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedRequirement, setSelectedRequirement] = useState(null);
    const [selectedResponse, setSelectedResponse] = useState(null);
    const [selectedParticipationId, setSelectedParticipationId] = useState(null);
    const [isEditMode, setIsEditMode] = useState(false);

    const api = useAxiosAuth();
    const has_profile = localStorage.getItem('has_profile')
    const navigate = useNavigate();
    const { id: eventId } = useParams();
    const { authTokens, authReady, hasProfile } = useContext(AuthContext);

    const [viewModalOpen, setViewModalOpen] = useState(false);
    const [selectedViewRequirement, setSelectedViewRequirement] = useState(null);
    const [selectedViewResponse, setSelectedViewResponse] = useState(null);
    const handleViewSubmission = (requirement) => {
        const response = getResponseForRequirement(requirement.id);
        setSelectedViewRequirement(requirement);
        setSelectedViewResponse(response);
        setViewModalOpen(true);
    };

    useEffect(() => {
        console.log('requirements', requirements)
    }, [requirements])

    useEffect(() => {
        const fetchParticipationData = async () => {
            try {
                console.log('reqData', requirementsData);
                if (!authTokens || !authReady || !eventId) return;
                setIsLoading(true);
                const ownParticipationRes = await api.get(`/api/event/own-participation-list/?event=${eventId}`);
                console.log("ownParticipationRes", ownParticipationRes.data.data)
                setOwnParticipations(ownParticipationRes.data || []);
                if (ownParticipationRes.data && ownParticipationRes.data.length > 0) {
                    const participantId = ownParticipationRes.data[0].id;
                    try {
                        const participationRes = await api.get(`/api/event/participation-detail/${participantId}/`);
                        setParticipationDetails(participationRes.data);
                    } catch {
                        setParticipationDetails(null);
                    }
                } else {
                    setParticipationDetails(null);
                }
            } catch {
                setOwnParticipations([]);
                setParticipationDetails(null);
            } finally {
                setIsLoading(false);
            }
        };
        fetchParticipationData();
    }, [eventId, authTokens, authReady, api]);

    // Helper functions
    const getResponseForRequirement = (requirementId) => {
        if (!participationDetails || !participationDetails.responses) return null;
        return participationDetails.responses.find(response =>
            response.requirement === requirementId || response.requirement_detail?.id === requirementId
        );
    };

    const getOwnParticipationForRequirement = (requirementId) => {
        if (!ownParticipations || !Array.isArray(ownParticipations)) return null;
        return ownParticipations.find(participation =>
            participation.requirement === requirementId
        );
    };

    const getParticipationId = () => {
        if (!ownParticipations || !Array.isArray(ownParticipations) || ownParticipations.length === 0) {
            return null;
        }
        return ownParticipations[0].id;
    };

    useEffect(() => {
        console.log('participationData', participationDetails);

    }, [participationDetails])
    const getTypeIcon = (type) => {
        switch (type) {
            case 'URL':
                return <Link className="w-4 h-4" />;
            case 'FILE':
                return <Upload className="w-4 h-4" />;
            default:
                return <FileText className="w-4 h-4" />;
        }
    };

    const isDeadlineNear = (deadline) => {
        if (!deadline) return false;
        const deadlineDate = new Date(deadline);
        const now = new Date();
        const diffInDays = Math.ceil((deadlineDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        return diffInDays <= 3 && diffInDays > 0;
    };

    const isDeadlinePassed = (deadline) => {
        if (!deadline) return false;
        return new Date(deadline) < new Date();
    };

    const getSubmissionStatus = (requirement) => {
        const response = getResponseForRequirement(requirement.id);
        const ownParticipation = getOwnParticipationForRequirement(requirement.id);

        if (response && response.is_submitted) {
            if (response.status === 'approved') return 'approved';
            if (response.status === 'rejected') return 'rejected';
            return 'submitted';
        }
        if (ownParticipation) {
            return 'draft';
        }
        return 'not_filled';
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'true':
                return <Badge className="bg-green-100 text-green-800 text-xs">{status}Verified</Badge>;
            case 'false':
                return <Badge className="bg-red-100 text-red-800 text-xs">Not verified</Badge>;
            // case 'submitted':
            //     return <Badge className="bg-blue-100 text-blue-800 text-xs">Submitted</Badge>;
            // case 'draft':
            //     return <Badge className="bg-yellow-100 text-yellow-800 text-xs">Draft</Badge>;
            // case 'not_filled':
            //     return <Badge className="bg-gray-100 text-gray-800 text-xs">Not Started</Badge>;
            default:
                return <Badge className="bg-gray-100 text-gray-800 text-xs">{status}Unknown</Badge>;
        }
    };

    // Modal handler
    const handleRequirementModal = (requirement) => {
        if (has_profile == 'undefined' || has_profile==="false") {
            toast.info('Please complete your profile before submitting requirements.');
            setTimeout(() => {
                navigate('/user/setup-profile');
            }, 1000);
            return;
        }
        const response = getResponseForRequirement(requirement.id);
        const ownParticipation = getOwnParticipationForRequirement(requirement.id);
        const participationId = getParticipationId();
        setSelectedRequirement(requirement);
        setSelectedResponse(response || ownParticipation || null);
        setSelectedParticipationId(participationId);
        setIsEditMode(!!(response && response.is_submitted));
        setModalOpen(true);
    };

    // Submission handler
    const handleModalSubmit = async (formData) => {
        try {
            if (isEditMode && selectedParticipationId) {
                formData.append('participation_id', selectedParticipationId);
            }
            await api.post("/api/event/participation/submit-response/", formData);
            // Refresh data after submission
            setModalOpen(false);
            setSelectedRequirement(null);
            setSelectedResponse(null);
            setSelectedParticipationId(null);
            setIsEditMode(false);
            // Refetch participation data
            const ownParticipationRes = await api.get(`/api/event/own-participation-list/?event=${eventId}`);
            setOwnParticipations(ownParticipationRes.data || []);
            if (ownParticipationRes.data && ownParticipationRes.data.length > 0) {
                const participantId = ownParticipationRes.data[0].id;
                try {
                    const participationRes = await api.get(`/api/event/participation-detail/${participantId}/`);
                    setParticipationDetails(participationRes.data);
                } catch {
                    setParticipationDetails(null);
                }
            } else {
                setParticipationDetails(null);
            }
        } catch (error) {
            toast.error('Failed to submit. Please try again.');
        }
    };

    // Summary counts
    const totalRequirements = requirementsData.filter(req => req.is_active !== false).length;
    const completedRequirements = requirementsData.filter(req => {
        const status = getSubmissionStatus(req);
        return status === 'submitted' || status === 'approved';
    }).length;
    const pendingRequirements = totalRequirements - completedRequirements;

    if (isLoading) {
        return (
            <TabsContent value="requirements">
                <Card>
                    <CardContent className="flex items-center justify-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </CardContent>
                </Card>
            </TabsContent>
        );
    }

    return (
        <TabsContent value="requirements">
            <Card>
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <FileText className="w-5 h-5 text-primary" />
                        <h2 className="text-[16px] font-semibold">Event Requirements</h2>
                    </div>
                    <p className="text-[13px] text-muted-foreground">
                        Complete all required submissions to secure your registration.
                    </p>
                </CardHeader>
                <CardContent>
                    {!requirementsData || requirementsData.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 text-center">
                            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                                <CheckCircle className="w-8 h-8 text-green-600" />
                            </div>
                            <h3 className="text-[16px] font-semibold mb-2">No Requirements</h3>
                            <p className="text-[13px] text-muted-foreground max-w-md">
                                This event has no special requirements. You can register directly without any additional submissions.
                            </p>
                        </div>
                    ) : (
                        <>
                            {/* Summary Cards */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                                <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg">
                                    <div className="flex items-center gap-2">
                                        <FileText className="w-5 h-5 text-blue-600" />
                                        <div>
                                            <p className="text-sm font-medium text-blue-800 dark:text-blue-200">
                                                Total Requirements
                                            </p>
                                            <p className="text-xl font-bold text-blue-900 dark:text-blue-100">
                                                {totalRequirements}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-green-50 dark:bg-green-950 p-4 rounded-lg">
                                    <div className="flex items-center gap-2">
                                        <CheckCircle className="w-5 h-5 text-green-600" />
                                        <div>
                                            <p className="text-sm font-medium text-green-800 dark:text-green-200">
                                                Completed
                                            </p>
                                            <p className="text-xl font-bold text-green-900 dark:text-green-100">
                                                {completedRequirements}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                {/* <div className="bg-orange-50 dark:bg-orange-950 p-4 rounded-lg">
                                    <div className="flex items-center gap-2">
                                        <AlertCircle className="w-5 h-5 text-orange-600" />
                                        <div>
                                            <p className="text-sm font-medium text-orange-800 dark:text-orange-200">
                                                Pending
                                            </p>
                                            <p className="text-xl font-bold text-orange-900 dark:text-orange-100">
                                                {pendingRequirements}
                                            </p>
                                        </div>
                                    </div>
                                </div> */}
                            </div>

                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y-2 divide-gray-200">
                                    <thead className="ltr:text-left rtl:text-right">
                                        <tr className="*:font-medium *:text-gray-900 *:first:sticky *:first:left-0 *:first:bg-white">
                                            <th className="px-3 py-2 whitespace-nowrap text-xs sm:text-sm md:text-base lg:text-[16px] w-16">S.N</th>
                                            <th className="px-3 py-2 whitespace-nowrap text-xs sm:text-sm md:text-base lg:text-[16px] min-w-[200px]">Name</th>
                                            <th className="px-3 py-2 whitespace-nowrap text-xs sm:text-sm md:text-base lg:text-[16px] w-40">Status</th>
                                            <th className="px-3 py-2 whitespace-nowrap text-center text-xs sm:text-sm md:text-base lg:text-[16px] min-w-[200px]">Action</th>
                                        </tr>
                                    </thead>

                                    <tbody className="divide-y divide-gray-200">
                                        {requirementsData
                                            .filter((req) => req.is_active !== false)
                                            .map((req, index) => {
                                                const response = getResponseForRequirement(req.id);
                                                const isOverdue = isDeadlinePassed(req.deadline);

                                                return (
                                                    <tr
                                                        key={req.id}
                                                        className={`hover:bg-gray-50 ${isOverdue && !response ? "bg-red-100" : ""
                                                            }`}
                                                    >
                                                        {/* S.N */}
                                                        <td className="px-3 py-2 whitespace-nowrap text-xs sm:text-sm md:text-base lg:text-[14px] font-medium">
                                                            {index + 1}
                                                        </td>

                                                        {/* Name */}
                                                        <td className="px-3 py-2 whitespace-nowrap text-xs sm:text-sm md:text-base lg:text-[14px] font-medium">
                                                            <div className="flex items-center gap-2">

                                                                <span className="truncate">{req.label || req.type}</span>
                                                            </div>
                                                        </td>

                                                        {/* Status */}
                                                        <td className="px-3 py-2 whitespace-nowrap text-xs sm:text-sm md:text-base lg:text-[14px]">
                                                            {response ? (
                                                                req.is_verification_required ? (
                                                                    response.is_verified ? (
                                                                        <Badge className="bg-green-100 text-green-800 text-xs sm:text-sm">
                                                                            Verified
                                                                        </Badge>
                                                                    ) : (
                                                                        <Badge className="bg-yellow-100 text-yellow-800 text-xs sm:text-sm">
                                                                            Pending Verification
                                                                        </Badge>
                                                                    )
                                                                ) : (
                                                                    <Badge className="bg-blue-100 text-blue-800 text-xs sm:text-sm">
                                                                        Submitted
                                                                    </Badge>
                                                                )
                                                            ) : (
                                                                <Badge className="bg-gray-100 text-gray-800 text-xs sm:text-sm">
                                                                    Not Started
                                                                </Badge>
                                                            )}
                                                        </td>

                                                        {/* Actions */}
                                                        <td className="px-3 py-2 whitespace-nowrap text-center">
                                                            <div className="flex gap-1 justify-center flex-wrap">
                                                                {response && (
                                                                    <Button
                                                                        size="sm"
                                                                        variant="outline"
                                                                        className="min-w-[70px] border-blue-300 text-blue-600 hover:bg-blue-50 text-xs sm:text-sm"
                                                                        onClick={() => handleViewSubmission(req)}
                                                                    >
                                                                        <Eye className="w-3 h-3 mr-1" />
                                                                        View
                                                                    </Button>
                                                                )}

                                                                <Button
                                                                    size="sm"
                                                                    className={`min-w-[86.6px] text-xs sm:text-sm ${!response
                                                                        ? "bg-blue text-white hover:bg-blue/80"
                                                                        : "bg-gray-200 text-gray-800 hover:bg-gray-300"
                                                                        }`}
                                                                    onClick={() => handleRequirementModal(req)}
                                                                    disabled={isOverdue || response?.is_verified}
                                                                >
                                                                    {isOverdue ? (
                                                                        "Overdue"
                                                                    ) : !response ? (
                                                                        <>
                                                                            <Plus className="w-3 h-3 mr-1" />
                                                                            Apply
                                                                        </>
                                                                    ) : (
                                                                        <>
                                                                            <Edit className="w-3 h-3 mr-1" />
                                                                            Edit
                                                                        </>
                                                                    )}
                                                                </Button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                    </tbody>
                                </table>
                            </div>


                        </>
                    )}
                </CardContent>
            </Card>
            {/* Submission Modal */}
            <SubmissionModal
                isOpen={modalOpen}
                onClose={() => {
                    setModalOpen(false);
                    setIsEditMode(false);
                    setSelectedResponse(null);
                    setSelectedParticipationId(null);
                    setSelectedRequirement(null);
                }}
                event={{ id: eventId, title: requirementsData[0]?.event_name }}
                requirement={selectedRequirement}
                response={selectedResponse}
                participationId={selectedParticipationId}
                isEditMode={isEditMode}
                onSubmit={handleModalSubmit}
            />
            <ViewSubmissionModal
                isOpen={viewModalOpen}
                onClose={() => {
                    setViewModalOpen(false);
                    setSelectedViewRequirement(null);
                    setSelectedViewResponse(null);
                }}
                event={{ id: eventId, title: requirementsData[0]?.event_name }}
                requirement={selectedViewRequirement}
                response={selectedViewResponse}
            />
            <ToastContainer />
        </TabsContent>
    );
}
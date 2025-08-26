import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { FileText, Pencil, Trash2, Eye, Plus } from "lucide-react";
import { TabsContent } from "@/components/ui/tabs";
import useAxiosAuth from "@/hooks/useAxiosAuth";

export const RequirementsView = ({ requirements }) => {
    const [requirementsData, setRequirementsData] = useState(requirements || []);
    const api = useAxiosAuth();
    const navigate = useNavigate();

    // Safely get event ID if there is at least one requirement
    const eventId = requirementsData.length > 0 ? requirementsData[0].event : null;

    const handleStatusToggle = async (reqId, currentStatus) => {
        try {
            const newStatus = !currentStatus;

            // Optimistic UI update
            setRequirementsData((prev) =>
                prev.map((req) =>
                    req.id === reqId ? { ...req, is_active: newStatus } : req
                )
            );

            await api.put(`/api/event/requirement-status-change/${reqId}/`, {
                is_active: newStatus,
            });
        } catch (error) {
            console.error("Error updating event status:", error);
            // Revert state on error
            setRequirementsData((prev) =>
                prev.map((req) =>
                    req.id === reqId ? { ...req, is_active: currentStatus } : req
                )
            );
        }
    };

    return (
        <TabsContent value="requirements" className="min-h-[70vh]">
            <Card>
                <div>
                    <div className="flex justify-between md:px-8 px-2 md:py-6 py-3 ">
                        <div className="flex items-center gap-2 min-lg:hidden">
                            <FileText className="w-5 h-5 text-primary" />
                            <h2 className="text-[16px] font-semibold">Event Requirements</h2>
                        </div>

                        {/* Show Add Requirements button if we have an event ID */}
                        {eventId && (
                            <Button
                                onClick={() =>
                                    navigate("/admin/requirement-setup", {
                                        state: { eventId },
                                    })
                                }
                                className="bg-blue hover:bg-blue/90 text-white shadow-lg hover:shadow-xl transition-all duration-200 flex items-center"
                            >
                                <Plus className="w-4 h-4 mr-2" />
                                <span className="hidden md:inline">Add requirements</span>
                            </Button>

                        )}
                    </div>
                </div>

                {/* If no requirements, show a message */}
                {requirementsData.length === 0 ? (
                    <CardContent className="text-center text-gray-500 py-10">
                        No requirements set up yet.
                    </CardContent>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y-2 divide-gray-200">
                            <thead className="ltr:text-left rtl:text-right">
                                <tr className="*:font-medium *:text-gray-900 *:first:sticky *:first:left-0 *:first:bg-white text-[16px]">
                                    <th className="px-3 py-2 whitespace-nowrap text-[14px]">Type</th>
                                    <th className="px-3 py-2 whitespace-nowrap text-[14px]">Label</th>
                                    <th className="px-3 py-2 whitespace-nowrap text-[14px]">Description</th>
                                    <th className="px-3 py-2 whitespace-nowrap text-[14px]">File</th>
                                    <th className="px-3 py-2 whitespace-nowrap text-[14px]">Status</th>
                                    <th className="px-3 py-2 whitespace-nowrap text-[14px]">Deadline</th>
                                    <th className="px-3 py-2 whitespace-nowrap text-center text-[14px]">Actions</th>
                                </tr>
                            </thead>

                            <tbody className="divide-y divide-gray-200">
                                {requirementsData.map((req) => (
                                    <tr key={req.id}>
                                        <td className="px-3 py-2 whitespace-nowrap text-[13px]">{req.type}</td>
                                        <td className="px-3 py-2 whitespace-nowrap text-[13px]">{req.label}</td>
                                        <td className="px-3 py-2 whitespace-nowrap text-[13px]">{req.description}</td>
                                        <td className="px-3 py-2 whitespace-nowrap text-[13px]">
                                            {req.file ? (
                                                <a
                                                    href={req.file}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-blue-600 hover:underline"
                                                >
                                                    <Eye className="h-[16px] hover:text-blue" />
                                                </a>
                                            ) : (
                                                "—"
                                            )}
                                        </td>
                                        <td className="px-3 py-2 whitespace-nowrap">
                                            <div className="flex items-center gap-2">
                                                <Switch
                                                    checked={req.is_active !== false}
                                                    onCheckedChange={() =>
                                                        handleStatusToggle(req.id, req.is_active)
                                                    }
                                                    className={
                                                        req.is_active
                                                            ? "data-[state=checked]:bg-green-600"
                                                            : "data-[state=unchecked]:bg-gray-400"
                                                    }
                                                />
                                                <span className="text-xs text-muted-foreground w-[47.53px]">
                                                    {req.is_active !== false ? "Active" : "Inactive"}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-3 py-2 whitespace-nowrap text-[13px]">
                                            {req.deadline || "—"}
                                        </td>
                                        <td className="px-3 py-2 whitespace-nowrap text-center">
                                            <div className="flex gap-2 justify-center">
                                                <button
                                                    onClick={() => navigate(`/admin/requirement-update/${req.id}`)}
                                                    className="p-1 rounded hover:bg-blue/20 text-blue-600"
                                                    title="Edit"
                                                >
                                                    <Pencil className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => console.log("Delete", req.id)}
                                                    className="p-1 rounded hover:bg-red-100 text-red-600"
                                                    title="Delete"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </Card>
        </TabsContent>
    );
};

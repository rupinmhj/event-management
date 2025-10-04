import React, { useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { Card, CardContent, CardHeader } from "@/Components/ui/card";
import { Switch } from "@/Components/ui/switch";
import { Button } from "@/Components/ui/button";
import { FileText, Pencil, Trash2, Eye, Plus } from "lucide-react";
import { TabsContent } from "@/Components/ui/tabs";
import useAxiosAuth from "@/hooks/useAxiosAuth";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogDescription,
    AlertDialogTrigger,
} from "@/Components/ui/alert-dialog"

export const RequirementsView = ({ requirements }) => {
    const [requirementsData, setRequirementsData] = useState(requirements || []);
    const api = useAxiosAuth();
    const navigate = useNavigate();
    const location = useLocation()
    // Safely get event ID if there is at least one requirement
    const { id: eventId } = useParams();
    const formatDate = (dateString) => {
        console.log('dateString', dateString)
        const date = new Date(dateString);

        // Nepal timezone offset in minutes (+5:45 = 345 minutes)
        const nepalOffset = 5 * 60 + 45;

        // Convert date to UTC in milliseconds
        const utc = date.getTime() + date.getTimezoneOffset() * 60000;

        // Convert UTC to Nepal time
        const nepalTime = new Date(utc + nepalOffset * 60 * 1000);
        console.log('nepalTime', nepalTime)

        // Format Nepali date/time
        return nepalTime.toLocaleString("en-US", {
            year: "numeric",
            month: "short",  // e.g. Sep
            day: "numeric",  // e.g. 29
            hour: "2-digit",
            minute: "2-digit",
            hour12: true     // 12-hour clock with AM/PM
        });
    };

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

    const handleDelete = async (id) => {
        try {
            const res = await api.delete(`/api/event/delete-requirements/${id}/`);
            console.log(res.data);

            // Update local state after successful delete
            setRequirementsData((prev) => prev.filter((req) => req.id !== id));
        } catch (error) {
            console.error("Delete failed:", error);
        }
    };


    return (
        <TabsContent value="requirements" className="min-h-[70vh]">
            <Card>
                <div >
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
                                className="bg-blue hover:bg-blue/90 text-white shadow-lg hover:shadow-xl transition-all duration-200 flex items-center "
                            >
                                <Plus className="w-4 h-4 mr-2" />
                                <span className="hidden md:inline">Add requirements</span>
                            </Button>

                        )}
                    </div>
                </div>

                {/* If no requirements, show a message */}
                {requirementsData.length === 0 ? (
                    <CardContent className="text-center text-gray-500 py-10 ">
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
                                            {req.deadline
                                                ? formatDate(req.deadline)
                                                : "—"}
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

                                                {/* Delete confirmation modal */}
                                                <AlertDialog>
                                                    <AlertDialogTrigger asChild>
                                                        <button
                                                            className="p-1 rounded hover:bg-red-100 text-red-600"
                                                            title="Delete"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </AlertDialogTrigger>
                                                    <AlertDialogContent>
                                                        <AlertDialogHeader>
                                                            <AlertDialogTitle>Delete Requirement</AlertDialogTitle>
                                                            <AlertDialogDescription>
                                                                Are you sure you want to delete this requirement? This action cannot be undone.
                                                            </AlertDialogDescription>
                                                        </AlertDialogHeader>
                                                        <AlertDialogFooter>
                                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                            <AlertDialogAction
                                                                className="bg-red-600 hover:bg-red-700"
                                                                onClick={() => handleDelete(req.id)}
                                                            >
                                                                Delete
                                                            </AlertDialogAction>
                                                        </AlertDialogFooter>
                                                    </AlertDialogContent>
                                                </AlertDialog>
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

import React from 'react'
import { useContext, useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Pencil, Plus, Trash2 } from "lucide-react";
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs";
// import AuthContext from "@/context/AuthContext";
import useAxiosAuth from "@/hooks/useAxiosAuth";
import {
    ArrowLeft,
    Calendar,
    MapPin,
    Clock,
    DollarSign,
    Globe,
    Building,
    Image as ImageIcon,
    Edit,
    Users,
    Info,
    Delete,
    FileText,
    CreditCard,
    UserCheck,
    Eye
} from "lucide-react";
import { motion } from 'framer-motion';
import AuthContext from '@/context/AuthContext';
export const RequirementsView = ({ requirements }) => {
    const [requirementsData, setRequirementsData] = useState(requirements || []);
    const api = useAxiosAuth();
    const navigate = useNavigate();
    const handleStatusToggle = async (eventId, currentStatus) => {
        try {
            const newStatus = !currentStatus;
            setRequirementsData((prev) =>
                prev.map((req) =>
                    req.id === eventId ? { ...req, is_active: newStatus } : req
                )
            );
            console.log(newStatus);
            const res2 = await api.put(`/api/event/requirement-status-change/${eventId}/`, {
                is_active: newStatus
            });
            console.log(res2.data);
        } catch (error) {
            console.error("Error updating event status:", error);
            setRequirementsData((prev) =>
                prev.map((req) =>
                    req.id === eventId ? { ...req, is_active: currentStatus } : req
                )
            );
        }
    };
    return (
        <>
            <TabsContent value="requirements">
                <Card>
                    <CardHeader >
                        <div className='flex  justify-between '>
                            <div className="flex items-center gap-2">
                                <FileText className="w-5 h-5 text-primary" />
                                <h2 className="text-[16px] font-semibold">Event Requirements</h2>
                            </div>
                            <div className="">
                                <Button
                                    onClick={() => navigate('/admin/requirement-setup')}
                                    className="bg-blue hover:bg-blue/90 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                                >
                                    <Plus className="w-4 h-4 mr-2" />
                                    Add requirements
                                </Button>
                            </div>
                        </div>


                    </CardHeader>



                    <div className="overflow-x-auto ">
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
                                    <tr
                                        key={req.id}
                                    >
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
                                                    <Eye className='h-[16px] hover:text-blue' />
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
                                            {req.deadline ? req.deadline : "—"}
                                        </td>
                                        <td className="px-3 py-2 whitespace-nowrap text-center">
                                            <div className="flex gap-2 justify-center">
                                                <button
                                                    onClick={() => navigate(`/admin/requirement-update/${req.id}`)}
                                                    className="p-1 rounded hover:bg-blue/20 text-blue-600 "
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


                </Card>
            </TabsContent>
        </>
    )
}

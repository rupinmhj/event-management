import React, { useState, useEffect, useContext } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { MdTextFields, MdAttachFile, MdLink, MdSend } from 'react-icons/md';
import useAxiosAuth from '@/hooks/useAxiosAuth';
import AuthContext from '@/context/AuthContext';

const DynamicRequirementForm = () => {
    const { id } = useParams();
    const [formData, setFormData] = useState({});
    const [errors, setErrors] = useState({});
    const [participationData, setParticipationData] = useState({});
    const [requirements, setRequirements] = useState([]);
    const api = useAxiosAuth();
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const { authTokens, authReady } = useContext(AuthContext);

    // Fetch participation data and requirements
    useEffect(() => {
        if (!authTokens && !authReady) return;
        
        const fetchData = async () => {
            try {
                setLoading(true);
                const res = await api.post(`/api/event/events/${id}/participate/`);
                console.log('Participation data:', res.data.data);
                
                setParticipationData(res.data.data);
                setRequirements(res.data.data.responses || []);
                
                // Initialize form data with existing values or empty values
                const initialData = {};
                if (res.data.data.responses) {
                    res.data.data.responses.forEach(response => {
                        initialData[response.requirement_id] = response.value || (response.type === 'FILE' ? null : '');
                    });
                }
                setFormData(initialData);
                
            } catch (error) {
                console.error("Error fetching participation data:", error);
            } finally {
                setLoading(false);
            }
        };
        
        if (id) {
            fetchData();
        }
    }, [id, authTokens, authReady, api]);

    const handleInputChange = (requirementId, value) => {
        setFormData(prev => ({
            ...prev,
            [requirementId]: value
        }));

        // Clear error when user starts typing
        if (errors[requirementId]) {
            setErrors(prev => ({
                ...prev,
                [requirementId]: ''
            }));
        }
    };

    const validateForm = () => {
        const newErrors = {};

        requirements.forEach(req => {
            if (req.is_active) {
                const value = formData[req.requirement_id];

                if (!value || (typeof value === 'string' && value.trim() === '')) {
                    newErrors[req.requirement_id] = `${req.label} is required`;
                }

                // Additional validation for URL type
                if (req.type === 'URL' && value) {
                    const urlPattern = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/;
                    if (!urlPattern.test(value)) {
                        newErrors[req.requirement_id] = 'Please enter a valid URL';
                    }
                }
            }
        });

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        try {
            setSubmitting(true);
            
            // Prepare submission data
            const submissionData = requirements.map(req => ({
                requirement_id: req.requirement_id,
                value: formData[req.requirement_id],
                type: req.type
            }));

            console.log('Submitting:', submissionData);
            
            // Here you would make the API call to submit the form
            // const response = await api.post(`/api/event/events/${id}/submit-requirements/`, {
            //     responses: submissionData
            // });
            
            // For now, just log success
            console.log('Form submitted successfully');
            
        } catch (error) {
            console.error('Error submitting form:', error);
        } finally {
            setSubmitting(false);
        }
    };

    const renderField = (requirement) => {
        const { requirement_id, type, label, description, deadline } = requirement;
        const hasError = errors[requirement_id];
        const isOverdue = deadline && new Date(deadline) < new Date();

        const baseClasses = `border-primary/20 focus:border-primary ${hasError ? 'border-red-500' : ''}`;

        switch (type) {
            case 'TEXT':
                return (
                    <Input
                        placeholder={`Enter ${label.toLowerCase()}...`}
                        value={formData[requirement_id] || ''}
                        onChange={(e) => handleInputChange(requirement_id, e.target.value)}
                        className={baseClasses}
                        disabled={isOverdue}
                    />
                );

            case 'FILE':
                return (
                    <Input
                        type="file"
                        onChange={(e) => handleInputChange(requirement_id, e.target.files[0])}
                        className={baseClasses}
                        disabled={isOverdue}
                        accept="*/*"
                    />
                );

            case 'URL':
                return (
                    <Input
                        type="url"
                        placeholder="https://example.com"
                        value={formData[requirement_id] || ''}
                        onChange={(e) => handleInputChange(requirement_id, e.target.value)}
                        className={baseClasses}
                        disabled={isOverdue}
                    />
                );

            default:
                return (
                    <Textarea
                        placeholder={`Enter ${label.toLowerCase()}...`}
                        value={formData[requirement_id] || ''}
                        onChange={(e) => handleInputChange(requirement_id, e.target.value)}
                        className={`${baseClasses} resize-none h-24`}
                        disabled={isOverdue}
                    />
                );
        }
    };

    const getFieldIcon = (type) => {
        switch (type) {
            case 'FILE': return <MdAttachFile className="h-4 w-4" />;
            case 'URL': return <MdLink className="h-4 w-4" />;
            default: return <MdTextFields className="h-4 w-4" />;
        }
    };

    const formatDeadline = (dateString) => {
        if (!dateString) return null;
        
        const date = new Date(dateString);
        const now = new Date();
        const isOverdue = date < now;

        return (
            <span className={`text-xs ${isOverdue ? 'text-red-600' : 'text-gray-600'}`}>
                Deadline: {date.toLocaleDateString()}
                {isOverdue && ' (Overdue)'}
            </span>
        );
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (!requirements?.length) {
        return (
            <div className="max-w-5xl mx-auto px-6 py-8">
                <Card className="shadow-lg">
                    <CardContent className="p-8 text-center">
                        <MdTextFields className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600 text-lg">No requirements set for this event.</p>
                        <p className="text-gray-500 text-sm mt-2">You can proceed without completing any forms.</p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto px-6 py-8">
            <form onSubmit={handleSubmit} className="space-y-6">
                <Card className="shadow-lg border-0">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-[20px] text-gray-800">
                            Event Requirements
                        </CardTitle>
                        <CardDescription className="text-base">
                            Please complete all required information to participate in this event
                        </CardDescription>
                    </CardHeader>

                    <CardContent className="space-y-8">
                        {requirements
                            .filter(req => req.is_active !== false) // Include if is_active is undefined or true
                            .map((requirement, index) => {
                                const isOverdue = requirement.deadline && new Date(requirement.deadline) < new Date();
                                const activeRequirements = requirements.filter(req => req.is_active !== false);

                                return (
                                    <div key={requirement.requirement_id} className="space-y-4">
                                        <div className="flex items-start justify-between">
                                            <div className="flex items-center gap-3">
                                              
                                                <div>
                                                    <Label className="text-base font-semibold">
                                                        {requirement.label}
                                                        <span className="text-red-500 ml-1">*</span>
                                                    </Label>
                                                </div>
                                            </div>
                                            {/* {requirement.deadline && formatDeadline(requirement.deadline)} */}
                                        </div>

                                        {requirement.description && (
                                            <div className="">
                                                <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                                                    {requirement.description}
                                                </p>
                                            </div>
                                        )}

                                        <div className=" space-y-2">
                                            {renderField(requirement)}
                                            {errors[requirement.requirement_id] && (
                                                <p className="text-red-500 text-sm flex items-center gap-1">
                                                    <span className="text-red-500">⚠</span>
                                                    {errors[requirement.requirement_id]}
                                                </p>
                                            )}
                                            {isOverdue && (
                                                <p className="text-red-500 text-sm flex items-center gap-1">
                                                    <span className="text-red-500">⏰</span>
                                                    This requirement deadline has passed
                                                </p>
                                            )}
                                        </div>

                                        {index < activeRequirements.length - 1 && (
                                            <div className="border-t border-gray-200 pt-2"></div>
                                        )}
                                    </div>
                                );
                            })}
                    </CardContent>
                </Card>

                <div className="flex justify-center pt-4">
                    <Button
                        type="submit"
                        disabled={submitting}
                        size="lg"
                        className="bg-primary hover:bg-primary/90 text-white px-12 py-4 rounded-lg shadow-lg text-base font-semibold"
                    >
                        {submitting ? (
                            <>
                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                                Submitting Requirements...
                            </>
                        ) : (
                            <>
                                <MdSend className="h-5 w-5 mr-3" />
                                Submit Requirements
                            </>
                        )}
                    </Button>
                </div>
            </form>
        </div>
    );
};

export default DynamicRequirementForm;
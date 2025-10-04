import React, { useContext, useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Textarea } from '@/Components/ui/textarea';
import { motion } from 'framer-motion'
import { toast, ToastContainer } from 'react-toastify'
import { useNavigate } from 'react-router-dom';
import {
    MdInfo,
    MdPhone,
    MdEmail,
    MdPerson,
    MdEdit,
    MdAdd,
    MdRefresh
} from 'react-icons/md';
import { FaTimes, FaSave } from 'react-icons/fa'
import AuthContext from '@/context/AuthContext';
import useAxiosAuth from '@/hooks/useAxiosAuth';

export const AboutUs = () => {
    const { authTokens, authReady } = useContext(AuthContext);
    const api = useAxiosAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);
    const [isEditMode, setIsEditMode] = useState(false);
    const [id, setId] = useState();
    const [aboutUsData, setAboutUsData] = useState({
        name: '',
        phone: '',
        email: '',
        description: ''
    });

    // Validation errors state
    const [errors, setErrors] = useState({
        name: '',
        phone: '',
        email: '',
        description: ''
    });

    // Clear specific error when user starts typing
    const clearError = (field) => {
        if (errors[field]) {
            setErrors(prev => ({
                ...prev,
                [field]: ''
            }));
        }
    };

    // Email validation regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    // Phone validation regex (Nepal format - flexible)
    const phoneRegex = /^(\+977)?[9][0-9]{9}$|^[0-9]{7,15}$/;

    // Validation function
    const validateForm = () => {
        const newErrors = {
            name: '',
            phone: '',
            email: '',
            description: ''
        };

        // Name validation
        if (!aboutUsData.name || aboutUsData.name.trim() === '') {
            newErrors.name = "Name is required";
        } else if (aboutUsData.name.trim().length < 2) {
            newErrors.name = "Name must be at least 2 characters long";
        } else if (aboutUsData.name.trim().length > 100) {
            newErrors.name = "Name must not exceed 100 characters";
        }

        // Phone validation
        if (!aboutUsData.phone || aboutUsData.phone.trim() === '') {
            newErrors.phone = "Phone number is required";
        } else if (!phoneRegex.test(aboutUsData.phone.replace(/[\s-]/g, ''))) {
            newErrors.phone = "Please enter a valid phone number";
        }

        // Email validation
        if (!aboutUsData.email || aboutUsData.email.trim() === '') {
            newErrors.email = "Email is required";
        } else if (!emailRegex.test(aboutUsData.email.trim())) {
            newErrors.email = "Please enter a valid email address";
        }

        // Description validation
        if (!aboutUsData.description || aboutUsData.description.trim() === '') {
            newErrors.description = "Description is required";
        } else if (aboutUsData.description.trim().length < 10) {
            newErrors.description = "Description must be at least 10 characters long";
        } else if (aboutUsData.description.trim().length > 2000) {
            newErrors.description = "Description must not exceed 2000 characters";
        }

        setErrors(newErrors);

        // Return true if no errors
        return Object.values(newErrors).every(error => error === '');
    };

    // Fetch existing about us data on component mount
    useEffect(() => {
        if (!authTokens || !authReady) return;

        const fetchAboutUsData = async () => {
            try {
                setInitialLoading(true);
                const res = await api.get('api/account/get-organization-detail/');
                console.log('res.data', res.data);

                setId(res.data[0].id);
                // Check if response has data
                if (res.data && typeof res.data === 'object') {
                    // If it's an array and has items
                    if (Array.isArray(res.data) && res.data.length > 0) {
                        const data = res.data[0]; // Take first item
                        setAboutUsData({
                            name: data.name || '',
                            phone: data.phone_number || '',
                            email: data.email || '',
                            description: data.description || ''
                        });
                        (data.id);
                        setIsEditMode(true);
                    }
                    // If it's a direct object with data
                    else if (!Array.isArray(res.data) && (res.data.name || res.data.phone || res.data.email || res.data.description)) {
                        setAboutUsData({
                            name: res.data.name || '',
                            phone: res.data.phone || '',
                            email: res.data.email || '',
                            description: res.data.description || ''
                        });
                        (res.data.id);
                        setIsEditMode(true);
                    }
                    // If response is empty or no meaningful data
                    else {
                        setAboutUsData({
                            name: '',
                            phone: '',
                            email: '',
                            description: ''
                        });
                        setIsEditMode(false);
                    }
                } else {
                    // No data found, keep empty form
                    setAboutUsData({
                        name: '',
                        phone: '',
                        email: '',
                        description: ''
                    });
                    setIsEditMode(false);
                }
            } catch (err) {
                console.error('Failed to fetch about us data:', err);
                // If API call fails (404, etc.), assume no data exists
                setAboutUsData({
                    name: '',
                    phone: '',
                    email: '',
                    description: ''
                });
                setIsEditMode(false);
            } finally {
                setInitialLoading(false);
            }
        };

        fetchAboutUsData();
    }, [authReady, authTokens, api]);

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [])

    const saveAboutUs = async () => {
        // Validate form
        if (!validateForm()) {
            toast.error("Please fix the errors before submitting");
            return;
        }

        try {
            setLoading(true);

            // Prepare payload
            const payload = {
                name: aboutUsData.name.trim(),
                phone_number: aboutUsData.phone.trim(),
                email: aboutUsData.email.trim(),
                description: aboutUsData.description.trim()
            };

            console.log('Sending payload:', payload);

            let res;

            if (isEditMode) {
                res = await api.put(`/api/account/update-organization-detail/${id}/`, payload);
                toast.success("Information updated successfully!");
            }
            else {
                res = await api.post('/api/account/organization-detail/', payload);
                toast.success("Information saved successfully!");
                setIsEditMode(true);
            }

            console.log('About Us save/update response:', res.data);

            // Optional: Navigate back after successful save
            setTimeout(() => {
                navigate('/admin/');
            }, 2000);

        } catch (err) {
            console.error('Failed to save about us data:', err);

            // Handle different error scenarios
            if (err.response) {
                if (err.response.status === 400) {
                    // Validation errors from backend
                    const errorData = err.response.data;
                    if (typeof errorData === 'object') {
                        // Set field-specific errors if available
                        const newErrors = { ...errors };
                        Object.keys(errorData).forEach(key => {
                            if (newErrors.hasOwnProperty(key)) {
                                newErrors[key] = Array.isArray(errorData[key])
                                    ? errorData[key][0]
                                    : errorData[key];
                            }
                        });
                        setErrors(newErrors);
                    }
                    toast.error("Please correct the form errors");
                } else if (err.response.status === 401) {
                    toast.error("Unauthorized. Please login again.");
                    navigate('/login');
                } else if (err.response.status === 403) {
                    toast.error("You don't have permission to perform this action");
                } else if (err.response.status === 409) {
                    toast.error("Contact information already exists. Try updating instead.");
                } else {
                    toast.error("Failed to save. Please try again.");
                }
            } else {
                toast.error("Network error. Please check your connection and try again.");
            }
        } finally {
            setLoading(false);
        }
    };



    // Check for unsaved changes
    const hasUnsavedChanges = () => {
        if (!isEditMode) {
            return aboutUsData.name || aboutUsData.phone || aboutUsData.email || aboutUsData.description;
        }
        // In edit mode, check if current data differs from what was initially loaded
        return false; // You can implement this based on your needs
    };

    // Handle browser back/refresh with unsaved changes
    useEffect(() => {
        const handleBeforeUnload = (e) => {
            if (hasUnsavedChanges()) {
                e.preventDefault();
                e.returnValue = '';
            }
        };

        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }, [aboutUsData]);

    const resetForm = () => {
        setAboutUsData({
            name: '',
            phone: '',
            email: '',
            description: ''
        });
        setErrors({
            name: '',
            phone: '',
            email: '',
            description: ''
        });
        setIsEditMode(false);
    };

    // Show loading spinner while initial data is being fetched
    if (initialLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue"></div>
                <span className="ml-3">Loading ...</span>
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-6 pt-4 pb-8 md:px-12 "
        >
            <div className="min-h-screen bg-gradient-to-br from-background via-primary-soft to-background md:p-20 pt-10 ">
                <div className="max-w-6xl mx-auto space-y-8">

                    {/* Header Card */}
                    {/* <Card className="shadow-lg border-0 bg-gradient-to-r from-card to-primary-soft/20 ">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <MdInfo className="h-5 w-5 text-blue-600" />
                                About Us

                            </CardTitle>
                            <CardDescription>
                                {isEditMode
                                    ? "Update your organization's contact information and description"
                                    : "Add your organization's contact information and description"
                                }
                            </CardDescription>
                        </CardHeader>
                    </Card> */}

                    {/* Contact Information */}
                    <Card className="shadow-lg border-0 bg-gradient-to-r from-card to-primary-soft/10">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                Contact Information
                            </CardTitle>
                            <CardDescription>
                                Provide your primary contact details
                            </CardDescription>
                        </CardHeader>

                        <CardContent className="space-y-6">
                            {/* Name and Phone */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Name */}
                                <div className="space-y-2">
                                    <Label htmlFor="name">Organization/Company Name *</Label>
                                    <div className="relative">
                                        <Input
                                            id="name"
                                            placeholder="Enter organization name..."
                                            value={aboutUsData.name}
                                            onChange={(e) => {
                                                setAboutUsData({ ...aboutUsData, name: e.target.value });
                                                clearError('name');
                                            }}
                                            className={`pl-10 border-event-primary/20 focus:border-event-primary ${errors.name ? 'border-red-500' : ''}`}
                                        />
                                    </div>
                                    {errors.name && (
                                        <p className='text-red-500 text-[12px] mt-1'>{errors.name}</p>
                                    )}
                                </div>

                                {/* Phone */}
                                <div className="space-y-2">
                                    <Label htmlFor="phone">Phone Number *</Label>
                                    <div className="relative">
                                        <Input
                                            id="phone"
                                            type="tel"
                                            placeholder="e.g., 9841234567 or +977-9841234567"
                                            value={aboutUsData.phone}
                                            onChange={(e) => {
                                                setAboutUsData({ ...aboutUsData, phone: e.target.value });
                                                clearError('phone');
                                            }}
                                            className={`pl-10 border-event-primary/20 focus:border-event-primary ${errors.phone ? 'border-red-500' : ''}`}
                                        />
                                    </div>
                                    {errors.phone && (
                                        <p className='text-red-500 text-[12px] mt-1'>{errors.phone}</p>
                                    )}
                                </div>
                            </div>

                            {/* Email */}
                            <div className="space-y-2">
                                <Label htmlFor="email">Email Address *</Label>
                                <div className="relative">
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="Enter email address..."
                                        value={aboutUsData.email}
                                        onChange={(e) => {
                                            setAboutUsData({ ...aboutUsData, email: e.target.value });
                                            clearError('email');
                                        }}
                                        className={`pl-10 border-event-primary/20 focus:border-event-primary ${errors.email ? 'border-red-500' : ''}`}
                                    />
                                </div>
                                {errors.email && (
                                    <p className='text-red-500 text-[12px] mt-1'>{errors.email}</p>
                                )}
                            </div>

                            {/* Description */}
                            <div className="space-y-2">
                                <Label htmlFor="description">Description *</Label>
                                <Textarea
                                    id="description"
                                    placeholder="Describe your organization, mission, services, or any other relevant information..."
                                    value={aboutUsData.description}
                                    onChange={(e) => {
                                        setAboutUsData({ ...aboutUsData, description: e.target.value });
                                        clearError('description');
                                    }}
                                    className={`border-event-primary/20 focus:border-event-primary resize-none h-[150px] ${errors.description ? 'border-red-500' : ''}`}
                                    rows={8}
                                />
                                <div className="flex justify-between items-center">
                                    {errors.description && (
                                        <p className='text-red-500 text-[12px]'>{errors.description}</p>
                                    )}

                                </div>
                            </div>
                            {/* Primary Actions */}
                            <div className="flex justify-center gap-4 pt-4 pb-4 md:px-0 px-4">
                                <Button
                                    onClick={saveAboutUs}
                                    disabled={loading}
                                    className="flex-1 bg-blue transition-all duration-300 hover:scale-[1.02] text-primary-foreground hover:bg-blue/90"
                                    size="lg"
                                >
                                    <FaSave className="w-4 h-4 mr-2" />
                                    {loading
                                        ? isEditMode
                                            ? "Updating..."
                                            : "Saving..."
                                        : isEditMode
                                            ? "Update"
                                            : "Save"}
                                </Button>

                                <Button
                                    onClick={() => navigate(-1)}
                                    disabled={loading}
                                    className="hover:bg-destructive text-white hover:text-destructive-foreground transition-all duration-300 hover:scale-[1.02] bg-red-800"
                                    size="lg"
                                >
                                    <FaTimes className="w-4 h-4 mr-2" />
                                    Cancel
                                </Button>
                            </div>





                        </CardContent>

                    </Card>

                    {/* Action Buttons with Enhanced Layout */}


                    {/* Help Text */}
                    {/* <div className="mt-6 p-4 bg-blue-50 border-l-4 border-blue-400 rounded-r">
                        <div className="flex">
                            <div className="ml-3">
                                <p className="text-sm text-blue-700">
                                    <strong>Note:</strong> This information will be displayed on your public About Us page.
                                    Make sure all details are accurate and professional.
                                </p>
                                {isEditMode && (
                                    <p className="text-xs text-blue-600 mt-1">
                                        Last updated: {new Date().toLocaleDateString()}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div> */}
                </div>
            </div>
            <ToastContainer />
        </motion.div>
    );
};
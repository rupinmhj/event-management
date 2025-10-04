import React, { useState, useContext, useEffect } from 'react';
import { useForm, useFieldArray, Controller } from "react-hook-form";
import {
    FaPlus, FaTrash, FaSave, FaTimes, FaCalendar, FaMapMarkerAlt,
    FaFileImage, FaMoneyBillWave, FaListUl, FaInfoCircle, FaSpinner
} from 'react-icons/fa';
import { SiMaterialdesignicons } from "react-icons/si";
import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card";
import { Button } from "@/Components/ui/button";
import { Input } from "@/Components/ui/input";
import { Label } from "@/Components/ui/label";
import { Textarea } from "@/Components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/Components/ui/select";
import GeneralContext from '@/context/GeneralContext';
import { motion } from 'framer-motion'
import DatePicker from '../../utils/DatePicker'
import useAxiosAuth from '@/hooks/useAxiosAuth';
import { useParams, useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify'
import DateTimePicker from '@/utils/DateTimePicker';
import Cropper from "react-easy-crop";
import { useCallback } from "react";
const EditEvent = ({ eventId, onCancel, onSubmit }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingData, setIsLoadingData] = useState(true);
    const [bannerPreview, setBannerPreview] = useState('');
    const [iconPreview, setIconPreview] = useState('');
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
    const [showCropper, setShowCropper] = useState(false);
    const [selectedImage, setSelectedImage] = useState(null);
    const [eventData, setEventData] = useState(null);
    const { submitCreate, create } = useContext(GeneralContext)
    const api = useAxiosAuth();
    const { id } = useParams();
    const navigate = useNavigate();

    const {
        register,
        handleSubmit,
        control,
        watch,
        setValue,
        reset,
        formState: { errors }
    } = useForm({
        defaultValues: {
            title: '',
            description: '',
            event_type: '',
            start_date: '',
            duration: '',
            location: '',
            banner: null,
            icon: null,
            is_payment_required: 'False',
            is_active: 'false',
            number_of_seat: null,
            requirements: [
                {
                    label: '',
                    value: '',
                    fee: '',
                    file: null
                }
            ]
        }
    });

    const is_payment_required = watch("is_payment_required");
    const { fields, append, remove } = useFieldArray({
        control,
        name: "requirements"
    });

    const watchedBanner = watch("banner");
    const watchedIcon = watch('icon');

    // Fetch existing event data
    useEffect(() => {
        const fetchEventData = async () => {
            try {
                setIsLoadingData(true);
                console.log("get data by id")
                const response = await api.get(`/api/event/get-event-detail/${id}/`);
                const data = response.data;
                console.log(data);

                setEventData(data);

                // Reset form with fetched data
                reset({
                    title: data.title || '',
                    description: data.description || '',
                    event_type: data.event_type || '',
                    start_date: data.start_date || '',
                    duration: data.duration || '',
                    location: data.location || '',
                    is_active: data.is_active || '',
                    number_of_seat: data.number_of_seat || '',
                    banner: null, // We'll handle existing images separately
                    icon: null,
                    is_payment_required: data.is_payment_required ? 'True' : 'False',
                    requirements: data.requirements && data.requirements.length > 0
                        ? data.requirements.map(req => ({
                            label: req.label || '',
                            value: req.value || '',
                            fee: req.fee || '',
                            file: null
                        }))
                        : [{
                            label: '',
                            value: '',
                            fee: '',
                            file: null
                        }]
                });

                // Set image previews if they exist
                if (data.banner) {
                    setBannerPreview(data.banner);
                }
                if (data.icon) {
                    setIconPreview(data.icon);
                }

            } catch (error) {
                console.error('Error fetching event data:', error);
            } finally {
                setIsLoadingData(false);
            }
        };

        if (id) {
            fetchEventData();
        }
    }, [id, api, reset]);

    // Handle banner file upload
    const handleBannerChange = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            if (!file.type.startsWith("image/")) return;
            if (file.size > 5 * 1024 * 1024) return;

            const imageUrl = URL.createObjectURL(file);
            setSelectedImage(imageUrl);
            setShowCropper(true); // open cropper instead of directly setting preview
        }
    };


    const getCroppedImage = async (imageSrc, croppedAreaPixels) => {
        const image = await createImage(imageSrc);
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        canvas.width = croppedAreaPixels.width;
        canvas.height = croppedAreaPixels.height;

        ctx.drawImage(
            image,
            croppedAreaPixels.x,
            croppedAreaPixels.y,
            croppedAreaPixels.width,
            croppedAreaPixels.height,
            0,
            0,
            croppedAreaPixels.width,
            croppedAreaPixels.height
        );

        return new Promise((resolve) => {
            canvas.toBlob((blob) => {
                resolve(blob);
            }, "image/jpeg");
        });
    };

    // Helper to load image
    const createImage = (url) =>
        new Promise((resolve, reject) => {
            const image = new Image();
            image.addEventListener("load", () => resolve(image));
            image.addEventListener("error", (error) => reject(error));
            image.setAttribute("crossOrigin", "anonymous");
            image.src = url;
        });

    // Handle icon file upload
    const handleIconChange = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            if (!file.type.startsWith('image/')) {
                return;
            }
            if (file.size > 1 * 1024 * 1024) {
                return;
            }

            setValue('icon', file);
            setIconPreview(URL.createObjectURL(file));
        }
    };
    const clearIcon = () => {
        setValue('icon', null); // reset form value
        setIconPreview(null);   // remove preview
    };
    const clearBanner = () => {
        setValue('banner', null); // reset form value
        setBannerPreview(null);   // remove preview
    };

    // Handle requirement file upload
    const handleRequirementFileChange = (index, e) => {
        const file = e.target.files?.[0];
        if (file) {
            setValue(`requirements.${index}.file`, file);
        }
    };

    // Add new requirement
    const addRequirement = () => {
        append({
            label: '',
            value: '',
            fee: '',
            file: null
        });
    };

    // Handle form submission
    const onSubmitForm = async (data) => {
        setIsLoading(true);

        try {
            const submitData = new FormData();

            // Add basic fields
            submitData.append('title', data.title);
            submitData.append('description', data.description);
            submitData.append('event_type', data.event_type);
            submitData.append('start_date', data.start_date);
            submitData.append('duration', data.duration);
            submitData.append('location', data.location);
            submitData.append('is_active', data.is_active);
            submitData.append('is_payment_required', data.is_payment_required);
            submitData.append('number_of_seat', data.number_of_seat);

            // Add banner if a new file is selected
            if (data.banner && data.banner instanceof File) {
                submitData.append('banner', data.banner);
            }

            // Add icon if a new file is selected
            if (data.icon && data.icon instanceof File) {
                submitData.append('icon', data.icon);
            }

            // Add requirements
            data.requirements.forEach((req, index) => {
                submitData.append(`requirements[${index}]label`, req.label);
                submitData.append(`requirements[${index}]value`, req.value);
                submitData.append(`requirements[${index}]fee`, req.fee);
                if (req.file) {
                    submitData.append(`requirements[${index}]file`, req.file);
                }
            });

            console.log("edit event submit form data:")
            for (let [key, value] of submitData.entries()) {
                console.log(key, value);
            }

            const res = await api.put(`/api/event/update-event/${id}/`, submitData);
            console.log(res.data);

            if (onSubmit) {
                onSubmit(res.data);
            } else {
                submitCreate();
            }
            toast.success("Event updated successfully")
            setTimeout(() => navigate('/admin/events'), 1000);

        } catch (error) {
            console.error('Error updating event:', error);
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoadingData) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-background to-muted/30 flex items-center justify-center">
                <div className="text-center">
                    <FaSpinner className="animate-spin h-8 w-8 text-blue mx-auto mb-4" />
                    <p className="text-muted-foreground">Loading event data...</p>
                </div>
            </div>
        );
    }
    const cancel = () => {
        navigate('/admin/events');
    }

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, delay: 0.15 }}
        >
            <div className="min-h-screen bg-gradient-to-br from-background to-muted/30 px-4 sm:px-6 lg:px-8 py-6 pt-20">
                <div className="max-w-6xl mx-auto">
                    {/* <div className="text-center mb-8">
                        <h1 className="text-3xl font-semibold text-gray-800 mb-2">Edit Event</h1>
                        <p className="text-muted-foreground">Update your event details</p>
                    </div> */}

                    <Card className="shadow-xl border bg-card">
                        <CardHeader className="text-center pb-6">
                            <CardTitle className="text-xl flex items-center text-gray-800 justify-center gap-2">
                                <FaCalendar className="text-gray-800" />
                                Event Information
                            </CardTitle>
                        </CardHeader>

                        <CardContent className="space-y-6">
                            <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-6">

                                {/* Basic Information */}
                                <div className="space-y-6">
                                    <h3 className="text-lg font-semibold text-card-foreground flex items-center gap-2">
                                        <FaInfoCircle className="text-gray-800" />
                                        Basic Information
                                    </h3>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="title">Event Title *</Label>
                                            <Input
                                                id="title"
                                                {...register("title", { required: "Event title is required" })}
                                                placeholder="Enter event title"
                                            />
                                            {errors.title && (
                                                <p className="text-sm text-destructive">{errors.title.message}</p>
                                            )}
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="event_type">Event Type *</Label>
                                            <Controller
                                                name="event_type"
                                                control={control}
                                                rules={{ required: "Event type is required" }}
                                                render={({ field }) => (
                                                    <Select onValueChange={field.onChange} value={field.value}>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Select event type" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="PHYSICAL">Physical</SelectItem>
                                                            <SelectItem value="ONLINE">Online</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                )}
                                            />
                                            {errors.event_type && (
                                                <p className="text-sm text-destructive">{errors.event_type.message}</p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="start_date">Start Date *</Label>
                                            <Controller
                                                name="start_date"
                                                control={control}
                                                rules={{ required: "Start date is required" }}
                                                render={({ field }) => (
                                                    <DateTimePicker
                                                        value={field.value}
                                                        onChange={field.onChange}
                                                        minDate={new Date()}
                                                        maxDate={new Date(2028, 1, 1)}
                                                        placeholder={"Start Date"}
                                                    />
                                                )}
                                            />
                                            {errors.start_date && (
                                                <p className="text-sm text-destructive">{errors.start_date.message}</p>
                                            )}
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="duration">Duration *</Label>
                                            <Input
                                                id="duration"
                                                {...register("duration", { required: "Duration is required" })}
                                                placeholder="e.g., 3 days, 5 hours"
                                            />
                                            {errors.duration && (
                                                <p className="text-sm text-destructive">{errors.duration.message}</p>
                                            )}
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="location">Location *</Label>
                                            <Input
                                                id="location"
                                                {...register("location", { required: "Location is required" })}
                                                placeholder="Event location"
                                            />
                                            {errors.location && (
                                                <p className="text-sm text-destructive">{errors.location.message}</p>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="description">Description *</Label>
                                    <Textarea
                                        id="description"
                                        {...register("description", { required: "Event description is required" })}
                                        placeholder="Describe your event..."
                                        className="resize-none"
                                        rows={6}
                                    />
                                    {errors.description && (
                                        <p className="text-sm text-destructive">{errors.description.message}</p>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="seat">Number of seats</Label>
                                    <Input
                                        id="seat"
                                        type="number"
                                        min={1}
                                        {...register("number_of_seat", {
                                            setValueAs: (v) => (v === "" ? null : Number(v)), // convert "" → null
                                            validate: (value) =>
                                                value === null || value >= 1 || "Number of seats must be greater than 0",
                                        })}
                                        placeholder="Number of seats"
                                    />
                                    {errors.number_of_seat && (
                                        <p className="text-sm text-destructive">{errors.number_of_seat.message}</p>
                                    )}
                                </div>



                                {/* Event Icon Upload */}
                                <div className="space-y-4">
                                    <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                                        {/* <SiMaterialdesignicons className="text-gray-800" /> */}
                                        Event Icon
                                    </h3>

                                    <div className="space-y-2">
                                        <Label htmlFor="icon">Upload Icon</Label>
                                        <div className="flex items-center justify-center w-full">
                                            <label
                                                htmlFor="icon"
                                                className="flex flex-col items-center justify-center w-24 h-24 border-2 border-dashed border-border rounded-lg cursor-pointer bg-muted/30 hover:bg-muted/50 transition-colors"
                                            >
                                                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                                    {iconPreview ? (
                                                        <img
                                                            src={iconPreview}
                                                            alt="Icon preview"
                                                            className="h-12 w-12 object-contain rounded"
                                                        />
                                                    ) : (
                                                        <>
                                                            {/* <SiMaterialdesignicons className="w-6 h-6 mb-2 text-muted-foreground" /> */}
                                                            <p className="text-xs text-muted-foreground text-center">
                                                                <span className="font-semibold">Click to upload</span> icon
                                                            </p>
                                                        </>
                                                    )}
                                                </div>
                                                <input
                                                    id="icon"
                                                    type="file"
                                                    className="hidden"
                                                    accept="image/*"
                                                    onChange={handleIconChange}
                                                />
                                            </label>
                                        </div>
                                        {iconPreview && (
                                            <button
                                                type="button"
                                                onClick={clearIcon}
                                                className="text-red-500 hover:text-red-700 flex items-center gap-1 text-sm font-medium"
                                            >
                                                <FaTimes className="inline-block" /> Clear
                                            </button>

                                        )}
                                    </div>
                                </div>

                                {/* Banner Upload */}
                                <div className="space-y-4">
                                    <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                                        {/* <FaFileImage className="text-gray-800" /> */}
                                        Event Banner
                                    </h3>

                                    <div className="space-y-2">
                                        <Label htmlFor="banner">Upload Banner</Label>
                                        <div className="flex items-center justify-center w-full">
                                            <label
                                                htmlFor="banner"
                                                className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-border rounded-lg cursor-pointer bg-muted/30 hover:bg-muted/50 transition-colors"
                                            >
                                                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                                    {bannerPreview ? (
                                                        <img
                                                            src={bannerPreview}
                                                            alt="Banner preview"
                                                            className="h-20 w-auto object-contain rounded"
                                                        />
                                                    ) : (
                                                        <>
                                                            {/* <FaFileImage className="w-8 h-8 mb-3 text-muted-foreground" /> */}
                                                            <p className="mb-2 text-sm text-muted-foreground">
                                                                <span className="font-semibold">Click to upload</span> banner image
                                                            </p>
                                                            <p className="text-xs text-muted-foreground">PNG, JPG (MAX. 5MB)</p>
                                                        </>
                                                    )}
                                                </div>
                                                <input
                                                    id="banner"
                                                    type="file"
                                                    className="hidden"
                                                    accept=".png, .jpg, .jpeg,"
                                                    onChange={handleBannerChange}
                                                />
                                            </label>
                                        </div>
                                        {bannerPreview && (
                                            <button
                                                type="button"
                                                onClick={clearBanner}
                                                className="text-red-500 hover:text-red-700 flex items-center gap-1 text-sm font-medium"
                                            >
                                                <FaTimes className="inline-block" /> Clear
                                            </button>

                                        )}
                                    </div>
                                </div>

                                {/* Form Actions */}
                                <div className="flex gap-4 pt-6">
                                    <Button
                                        type="submit"
                                        disabled={isLoading}
                                        className="flex-1 bg-blue transition-all duration-300 hover:scale-[1.02] text-primary-foreground hover:bg-blue/90"
                                        size="lg"
                                    >
                                        <FaSave className="w-4 h-4 mr-2" />
                                        {isLoading ? "Updating Event..." : "Update Event"}
                                    </Button>

                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => { submitCreate(); cancel() }}
                                        disabled={isLoading}
                                        size="lg"
                                        className="hover:bg-destructive text-white hover:text-destructive-foreground transition-all duration-300 hover:scale-[1.02] bg-red-800"
                                    >
                                        <FaTimes className="w-4 h-4 mr-2" />
                                        Cancel
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            </div>
            {showCropper && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 bb">
                    <div className="bg-white p-4 rounded-lg shadow-lg w-[90%] max-w-xl">
                        <h2 className="text-lg font-semibold mb-2">Crop Banner (16:9)</h2>

                        <div className="relative w-full h-64 md:h-[70dvh] bg-gray-200">
                            <Cropper
                                image={selectedImage}
                                crop={crop}
                                zoom={zoom}
                                aspect={16 / 9} // FIXED RATIO
                                onCropChange={setCrop}
                                onZoomChange={setZoom}
                                onCropComplete={(croppedArea, croppedAreaPixels) =>
                                    setCroppedAreaPixels(croppedAreaPixels)
                                }
                            />
                        </div>

                        <div className="flex justify-end gap-3 mt-4">
                            <Button
                                variant="outline"
                                onClick={() => {
                                    setShowCropper(false);
                                    setSelectedImage(null);
                                }}
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={async () => {
                                    const croppedBlob = await getCroppedImage(
                                        selectedImage,
                                        croppedAreaPixels
                                    );
                                    const croppedFile = new File([croppedBlob], "banner.jpg", {
                                        type: "image/jpeg",
                                    });

                                    setValue("banner", croppedFile);
                                    setBannerPreview(URL.createObjectURL(croppedFile));

                                    setShowCropper(false);
                                }}
                            >
                                Save Crop
                            </Button>
                        </div>
                    </div>
                </div>
            )}
            <ToastContainer />

        </motion.div>
    );
};

export default EditEvent;
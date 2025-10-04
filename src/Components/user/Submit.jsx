import { useState, useEffect, useContext } from "react";
import {
    FaUser, FaMapMarkerAlt, FaPhone, FaEdit, FaBirthdayCake,
    FaVenusMars, FaBuilding, FaIdBadge, FaFileAlt,
    FaGraduationCap, FaInfoCircle, FaUpload, FaCamera,
    FaCalendar, FaChevronLeft, FaChevronRight, FaSave, FaTimes, FaEye, FaTicketAlt, FaCheck, FaTrash
} from "react-icons/fa";
import { ArrowLeft, ChevronLeft, ChevronRight, Upload, FileText, CheckCircle, User, Mail, Phone, Calendar, CreditCard, ShoppingCart, Clock, XCircle, Shield } from "lucide-react";
import { toast, ToastContainer } from 'react-toastify';
import useAxiosAuth from "@/hooks/useAxiosAuth";
import { useNavigate, useParams } from "react-router-dom";
import AuthContext from "@/context/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/Components/ui/card";
import { Checkbox } from "@/Components/ui/checkbox";

import DatePicker from "@/utils/DatePicker";
import { Label } from "@/Components/ui/label";
import { Textarea } from "@/Components/ui/textarea";
import { useRef } from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/Components/ui/avatar";
import images from "@/assets/images";
import { Input } from "@/Components/ui/input"
import JoditEditor from 'jodit-react';
import 'jodit/es2021/jodit.min.css';
import { set } from "date-fns";

// Progress Component
const ProgressIndicator = ({ currentStep, totalSteps, completedPercentage, hasTickets }) => {
    const baseSteps = [
        { number: 1, title: "Profile Setup", key: "profile" },
        { number: 2, title: "Requirements", key: "requirements" }
    ];

    const steps = hasTickets
        ? [...baseSteps, { number: 3, title: "Tickets", key: "tickets" }]
        : baseSteps;

    return (
        <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
                <span className="text-sm font-medium text-gray-500">
                    Step {currentStep} of {totalSteps}
                </span>
                <span className="text-sm font-medium text-blue/60">
                    {completedPercentage}% Complete
                </span>
            </div>

            <div className="w-full bg-gray-200 rounded-full h-2 mb-6">
                <div
                    className="bg-blue/60 h-2 rounded-full transition-all duration-500 ease-out"
                    style={{ width: `${(currentStep / totalSteps) * 100}%` }}
                />
            </div>

            <div className="flex justify-between">
                {steps.map((step, index) => (
                    <div
                        key={step.key}
                        className={`flex flex-col items-center ${index < currentStep ? 'text-blue/60' :
                            index === currentStep - 1 ? 'text-blue/60 font-medium' :
                                'text-gray-500'
                            }`}
                    >
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium mb-2 ${index < currentStep ? 'bg-blue/60 text-white' :
                            index === currentStep - 1 ? 'bg-blue/60 text-white' :
                                'bg-gray-200 text-gray-500'
                            }`}>
                            {index < currentStep ? <CheckCircle className="w-4 h-4" /> : step.number}
                        </div>
                        <span className="text-xs text-center">{step.title}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

// Dynamic Field Component
const DynamicField = ({ requirement, value, onChange, error }) => {
    const { type, label, description, is_required } = requirement;

    const renderField = () => {
        switch (type) {
            case 'TEXT':
                return (
                    <Input
                        type="text"
                        value={value || ''}
                        onChange={(e) => onChange(e.target.value)}
                        placeholder={`Enter ${label.toLowerCase()}`}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-[14px]"
                    />
                );

            case 'TEXTAREA':
                return (
                    <div className="relative">
                        <JoditEditor
                            value={value || ''}
                            config={{
                                readonly: false,
                                height: 200,
                                removeButtons: [
                                    'source', 'image', 'file', 'video', 'speechRecognize',
                                    'print', 'about', 'fullsize', 'selectall',
                                    'symbol', 'copyformat', 'preview', 'find', 'emoticons',
                                    'brush', 'fontsize', 'paragraph', 'link', 'table', 'hr', 'classSpan', 'superscript', 'subscript'
                                ],
                                style: {
                                    backgroundColor: '#ffffff',
                                    color: '#000000',
                                    paddingLeft: '20px',
                                    fontSize: '14px'
                                },
                            }}
                            onBlur={(value) => {
                                onChange(value || '');
                            }}

                        />
                        <div className="absolute w-full bottom-0 h-[20px] bg-white dark:bg-[#5f5c5c]"></div>
                    </div>
                );

            case 'URL':
                return (
                    <Input
                        type="url"
                        placeholder="https://example.com"
                        value={value || ''}
                        onChange={(e) => onChange(e.target.value)}
                        className="bg-white border-gray-200 focus:border-blue-500 text-sm"
                    />
                );




            case 'FILE':
                return (
                    <FileUploadField
                        file={value}
                        onChange={onChange}
                        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                        label={label}
                    />
                );



            default:
                return (
                    <Input
                        type="text"
                        value={value || ''}
                        onChange={(e) => onChange(e.target.value)}
                        placeholder={`Enter ${label.toLowerCase()}`}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-[14px]"
                    />
                );
        }
    };

    return (
        <div className="space-y-2">
            <label className="block text-sm font-medium">
                {label} {is_required && <span className="text-red-500">*</span>}
            </label>
            {renderField()}
            {description && (
                <p className="text-xs text-gray-500 ">{description}</p>
            )}
            {error && <p className="text-sm text-red-500">{error}</p>}
        </div>
    );
};


// File Upload Component
const FileUploadField = ({ file, onChange, accept, label }) => {
    const handleFileChange = (e) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            // Validate file size
            if (selectedFile.size > 10 * 1024 * 1024) {
                toast.error("File size should be less than 10MB");
                return;
            }

            // Validate file type for requirements
            const allowedTypes = ['.pdf', '.doc', '.docx', '.jpg', '.jpeg', '.png'];
            const fileExtension = '.' + selectedFile.name.split('.').pop().toLowerCase();
            if (!allowedTypes.includes(fileExtension)) {
                toast.error("Please upload a valid file type (PDF, DOC, DOCX, JPG, JPEG, PNG)");
                return;
            }

            onChange(selectedFile);
        }
    };

    const removeFile = () => {
        onChange(null);
    };

    return (
        <div className="space-y-2">
            {!file ? (
                <label className="flex items-center justify-center w-full h-20 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
                    <div className="flex flex-col items-center">
                        <Upload className="w-5 h-5 text-gray-500 mb-1" />
                        <span className="text-sm text-gray-500">Upload {label}</span>
                    </div>
                    <input
                        type="file"
                        className="hidden"
                        accept={accept}
                        onChange={handleFileChange}
                    />
                </label>
            ) : (
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                    <div className="flex items-center">
                        <FileText className="w-4 h-4 text-green-600 mr-2" />
                        <span className="text-sm font-medium text-gray-900">{file.name}</span>
                    </div>
                    <button
                        type="button"
                        onClick={removeFile}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50 px-2 py-1 rounded text-sm"
                    >
                        Remove
                    </button>
                </div>
            )}
        </div>
    );
};

const DetailItemDocument = ({ icon, label, value, onClear, className = "", onUpload }) => {
    const hasDocument = Boolean(value);

    // If it's a File, create preview URL, else assume it's already a string URL
    const getDocumentUrl = () => {
        if (value instanceof File) {
            return URL.createObjectURL(value);
        }
        return value; // backend URL
    };

    return (
        <div className={`flex items-start gap-3 group ${className}`}>
            <span className="text-muted-foreground mt-1 group-hover:text-primary transition-colors">
                {icon}
            </span>

            <div className="min-w-0 flex-1">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    {label}
                </p>

                {hasDocument ? (
                    <div className="mt-1 flex items-center gap-3 ">
                        <button
                            type="button"
                            onClick={() => window.open(getDocumentUrl(), "_blank", "noopener,noreferrer")}
                            className="text-white hover:text-white flex items-center gap-1 text-sm font-medium bg-blue/90 hover:bg-blue/70 px-3 py-2 rounded-md"
                        >
                            <FaEye className="w-4 h-4 mr-2" /> View Document
                        </button>


                        {onClear && (
                            <button
                                type="button"
                                onClick={onClear}
                                className="text-red-500 hover:text-red-700 flex items-center gap-1 text-sm font-medium"
                            >
                                <FaTimes className="inline-block" /> Clear
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="mt-2">
                        <label className="flex items-center justify-center w-full h-20 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
                            <div className="flex flex-col items-center">
                                <Upload className="w-5 h-5 text-gray-500 mb-1" />
                                <span className="text-sm text-gray-500">Upload</span>
                            </div>
                            <input
                                type="file"
                                className="hidden"
                                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                                onChange={(e) => onUpload && onUpload(e.target.files?.[0])}
                            />
                        </label>
                    </div>
                )}
            </div>
        </div>
    );
};

const PreviousResponseCard = ({ response, requirement, onEdit }) => {
    const getStatusBadge = () => {
        if (!requirement.is_verification_required) return null;

        return (
            <span className={`inline-flex max-md:text-[10px] items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${response.is_verified
                ? 'bg-green-100 text-green-800'
                : 'bg-yellow-100 text-yellow-800'
                }`}>
                {response.is_verified ? '✓ Verified' : '⏳ Verification Pending'}
            </span>
        );
    };

    const renderValue = () => {
        if (response.type === 'FILE') {
            return (
                <div className="flex items-center gap-2 hover:text-blue/90 cursor-pointer">
                    <a
                        href={response?.file}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-white hover:text-white flex items-center gap-1 text-sm font-medium bg-blue/90 hover:bg-blue/70 px-3 py-2 rounded-md"
                    >
                        <FaEye className="w-4 h-4" />
                        View File
                    </a>
                </div>
            );
        } else if (response.type === 'TEXTAREA') {
            return (
                <div
                    className="text-gray-700 text-[14px] prose prose-sm max-w-none "
                    dangerouslySetInnerHTML={{ __html: response.value }}
                />
            );
        } else {
            return <p className="text-gray-700 text-[14px]">{response.value}</p>;
        }
    };

    const renderVerificationBadge = (requirement) => {
        console.log('----------requirement--------', requirement)

        if (requirement.is_verification_required) {
            switch (requirement?.status) {
                case 'verified':
                    return (
                        <span className="inline-flex items-center ml-2 px-2 py-1 rounded-full text-xs font-medium  text-green-800">
                            <Shield className="w-3 h-3 mr-1" />
                            Verified
                        </span>
                    );
                case 'rejected':
                    return (
                        <div className="inline-flex items-center ml-2">
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium  text-red-800">
                                <XCircle className="w-3 h-3 mr-1" />
                                Rejected
                            </span>
                        </div>
                    );
                case 'submitted':
                default:
                    return (
                        <span className="inline-flex items-center ml-2 px-2 py-1 rounded-full text-xs font-medium  text-yellow-800">
                            <Clock className="w-3 h-3 mr-1" />
                            Pending Verification
                        </span>
                    );
            }
        } else if (requirement.is_verification_required) {
            return (
                <span className="inline-flex items-center ml-2 px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                    <Shield className="w-3 h-3 mr-1" />

                </span>
            );
        }
        return null;
    };

    return (
        <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
            <div className="flex justify-between items-start mb-3">
                <div>
                    <div className="font-medium flex  max-md:text-[14px] text-gray-900 flex items-center gap-2">
                        <span className=" flex max-md:flex-1  max-md:w-[150px] ">{response.label}</span>
                        {/* <span>{getStatusBadge()}</span> */}
                        {/* {console.log('-------req----------', requirement)} */}
                        {renderVerificationBadge(response)}

                    </div>
                    {requirement.description && (
                        <p className="text-sm text-gray-500 mt-1">{requirement.description}</p>
                    )}
                </div>
                {console.log('-----------response.status----------', response.status)}
                {

                    (response.status === "submitted" || response.status === "rejected") && (
                        <button
                            // disabled={response.is_verified}
                            onClick={() => onEdit(response.requirement_id)}
                            className="text-blue-600 max-md:text-[12px] hover:text-blue-800 text-sm font-medium flex items-center gap-1 disabled:text-gray-500 "
                        >
                            <FaEdit className="w-3 h-3 max-md:w-2" />
                            Edit
                        </button>
                    )
                }

            </div>
            <div className="mt-2">
                {renderValue()}
            </div>
        </div>
    );
};

export const Submit = () => {
    const api = useAxiosAuth();
    const navigate = useNavigate();
    const { id } = useParams();
    const { user } = useContext(AuthContext);

    const [currentStep, setCurrentStep] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const [profile, setProfile] = useState(null);
    const [eventDetails, setEventDetails] = useState(null);
    const [requirements, setRequirements] = useState([]);
    const [profileImage, setProfileImage] = useState(null);
    const [previousResponses, setPreviousResponses] = useState([]);
    const [editingRequirements, setEditingRequirements] = useState({});
    const [pendingRequirements, setPendingRequirements] = useState([]);
    const [previewUrl, setPreviewUrl] = useState("");
    const [showPrevious, setShowPrevious] = useState(false);
    const imageRef = useRef(null);
    const defaultProfileImage = images.profile_default;
    const [requirementLength, setRequirementLength] = useState(0);
    const [ticketsData, setTicketsData] = useState([]);
    const [paidTickets, setPaidTickets] = useState([]);
    const [unpaidTickets, setUnpaidTickets] = useState([]);
    const [selectedTickets, setSelectedTickets] = useState(new Set());
    const [totalSteps, setTotalSteps] = useState(2);
    const [isProcessingPayment, setIsProcessingPayment] = useState(false);
    const [processingTicketId, setProcessingTicketId] = useState(null);
    const [hasTickets, setHasTickets] = useState(false);
    const [pid, setPid] = useState();
    const [showProfileModal, setShowProfileModal] = useState(false);
    const [expanded, setExpanded] = useState(false);
    const has_profile = localStorage.getItem('has_profile');
    const user_full_name2 = localStorage.getItem('user_full_name');
    const email2 = localStorage.getItem('email');
    const phone_number2 = localStorage.getItem('phone_number');
    // Separate form data for profile setup and requirements
    const [profileData, setProfileData] = useState(() => ({
        profileImage: "",
        fullName: localStorage.getItem('user_full_name') || "",
        email: localStorage.getItem('email') || "",
        phoneNumber: localStorage.getItem('phone_number') || "",
        address: "",
        dateOfBirth: "",
        sex: "",
        organization: "",
        designation: "",
        employeeId: "",
        educationLevel: "",
        bio: "",
        supportDocument: "",
    }));


    const [requirementData, setRequirementData] = useState({});
    const [errors, setErrors] = useState({});

    console.log()
    // Fetch data on component mount
    useEffect(() => {
        window.scrollTo({ top: 0, behavior: "smooth" });

        const fetchData = async () => {
            try {
                setIsLoading(true);

                // Fetch user profile
                const profileResponse = await api.get('/api/account/profile/');
                const profileInfo = profileResponse.data;
                setProfile(profileInfo);

                // Fetch event details
                if (id) {
                    const eventResponse = await api.get(`/api/event/active-events/${id}/`);
                    const eventInfo = eventResponse.data;
                    setEventDetails(eventInfo);
                    setRequirements(eventInfo.requirements || []);
                    console.log('----eventInfo.requirements-----', eventInfo.requirements);
                    setRequirementLength(eventInfo.requirements.length);

                    // Fetch previous responses
                    const ownParticipationRes = await api.get(`/api/event/own-participation-list/?event=${id}`);
                    console.log('-----ownParticipationRes-----', ownParticipationRes);
                    const previousResponsesData = ownParticipationRes.data[0]?.responses || [];

                    console.log('---', ownParticipationRes.data)
                    // setPid(ownParticipationRes.data[0]?.id);
                    console.log(previousResponsesData)
                    setPreviousResponses(previousResponsesData);

                    const ticketStatusRes = await api.get(`/api/event/${id}/tickets/`);
                    const ticketData = ticketStatusRes.data;
                    setPaidTickets(ticketData.paid_tickets || []);
                    setUnpaidTickets(ticketData.unpaid_tickets || []);
                    setTicketsData([...(ticketData.paid_tickets || []), ...(ticketData.unpaid_tickets || [])]);

                    const hasAnyTickets = (ticketData.paid_tickets?.length > 0) || (ticketData.unpaid_tickets?.length > 0);
                    console.log('------hasAnyTickets', hasTickets);
                    setHasTickets(hasAnyTickets);
                    setTotalSteps(hasAnyTickets ? 3 : 2);

                    // Separate requirements into completed and pending
                    const completedIds = previousResponsesData.map(response => response.requirement_id);
                    const pending = eventInfo.requirements.filter(req => !completedIds.includes(req.id));
                    const completed = eventInfo.requirements.filter(req => completedIds.includes(req.id));

                    setPendingRequirements(pending);

                    // Pre-populate requirement data for editing
                    const editData = {};
                    previousResponsesData.forEach(response => {
                        if (response.type === 'FILE') {
                            editData[response.requirement_id] = response.file_url;
                        } else {
                            editData[response.requirement_id] = response.value;
                        }
                    });
                    setRequirementData(editData);
                }

                // if (id) {
                //     try {
                //         // Run some requests in parallel
                //         const [eventResponse, ownParticipationRes, ticketStatusRes] = await Promise.all([
                //             api.get(`/api/event/active-events/${id}/`),
                //             api.get(`/api/event/own-participation-list/?event=${id}`),
                //             api.get(`/api/event/${id}/tickets/`)
                //         ]);

                //         console.log('ownParticipationRes', ownParticipationRes);

                //         // Event info
                //         const eventInfo = eventResponse.data;
                //         setEventDetails(eventInfo);
                //         setRequirements(eventInfo.requirements || []);
                //         setRequirementLength(eventInfo.requirements?.length || 0);

                //         // Participation info
                //         const previousResponsesData = ownParticipationRes.data[0]?.responses || [];

                //         setPid(ownParticipationRes.data[0]?.id);
                //         setPreviousResponses(previousResponsesData);

                //         // Tickets info
                //         const ticketData = ticketStatusRes.data;
                //         setPaidTickets(ticketData.paid_tickets || []);
                //         setUnpaidTickets(ticketData.unpaid_tickets || []);
                //         setTicketsData([
                //             ...(ticketData.paid_tickets || []),
                //             ...(ticketData.unpaid_tickets || [])
                //         ]);

                //         const hasAnyTickets = (ticketData.paid_tickets?.length > 0) || (ticketData.unpaid_tickets?.length > 0);
                //         setHasTickets(hasAnyTickets);
                //         setTotalSteps(hasAnyTickets ? 3 : 2);

                //         // Completed vs pending requirements
                //         const completedIds = previousResponsesData.map(r => r.requirement_id);
                //         const pending = eventInfo.requirements.filter(req => !completedIds.includes(req.id));
                //         const completed = eventInfo.requirements.filter(req => completedIds.includes(req.id));

                //         setPendingRequirements(pending);

                //         // Pre-fill responses for editing
                //         const editData = {};
                //         previousResponsesData.forEach(response => {
                //             if (response.type === 'FILE') {
                //                 editData[response.requirement_id] = response.file_url;
                //             } else {
                //                 editData[response.requirement_id] = response.value;
                //             }
                //         });
                //         setRequirementData(editData);

                //     } catch (error) {
                //         console.error("Error fetching event data:", error);
                //     }
                // }


                // Pre-fill profile data (existing code)
                if (profileInfo) {
                    setProfileData({
                        profileImage: profileInfo.profile_picture || "",
                        fullName: profileInfo.user_detail?.full_name_en || "",
                        email: profileInfo.user_detail?.email || "",
                        phoneNumber: profileInfo.user_detail?.phone_number || "",
                        address: profileInfo.address || "",
                        dateOfBirth: profileInfo.date_of_birth || "",
                        sex: profileInfo.sex || "",
                        organization: profileInfo.organization || "",
                        designation: profileInfo.designation || "",
                        employeeId: profileInfo.employee_id || "",
                        educationLevel: profileInfo.education_level || "",
                        bio: profileInfo.bio || "",
                        supportDocument: profileInfo.support_document || "",
                    });
                }

            } catch (error) {
                console.error("Error fetching data:", error);
                if (has_profile == 'true') {
                    toast.error("Failed to load application data");
                }
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [id]);

    const handlePreviousToggle = () => {
        console.log(showPrevious);
        if (showPrevious === true) {
            setShowPrevious(false)
        }
        else (
            setShowPrevious(true)
        )
    }

    const hasUnfilledRequiredFields = () => {
        // Check pending requirements
        const unfilledPending = pendingRequirements.some(req => {
            if (!req.is_required) return false;
            const value = requirementData[req.id];
            return !value || value === '' || (typeof value === 'string' && value.trim() === '');
        });

        // Check editing requirements
        const unfilledEditing = Object.keys(editingRequirements).some(reqId => {
            if (!editingRequirements[reqId]) return false;
            const req = requirements.find(r => r.id == reqId);
            if (!req?.is_required) return false;
            const value = requirementData[reqId];
            return !value || value === '' || (typeof value === 'string' && value.trim() === '');
        });

        return unfilledPending || unfilledEditing;
    };
    const handleProfilePictureChange = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            if (!file.type.startsWith('image/')) {
                setErrors(prev => ({ ...prev, profileImage: "Please select a valid image file" }));
                return;
            }

            if (file.size > 2 * 1024 * 1024) {
                setErrors(prev => ({ ...prev, profileImage: "Image size should be less than 2MB" }));
                return;
            }

            setProfileImage(file);
            setPreviewUrl(URL.createObjectURL(file));
            setProfileData(prev => ({ ...prev, profileImage: file }));
            setErrors(prev => ({ ...prev, profileImage: "" }));
        }
    };

    const validateProfileStep = () => {
        const newErrors = {};

        if (!profileData.fullName.trim()) newErrors.fullName = "Full name is required";
        if (!profileData.email.trim()) newErrors.email = "Email address is required";
        if (!profileData.phoneNumber.trim()) newErrors.phoneNumber = "Phone number is required";
        if (!profileData.address.trim()) newErrors.address = "Address is required";
        if (!profileData.dateOfBirth) newErrors.dateOfBirth = "Date of birth is required";
        if (!profileData.sex) newErrors.sex = "Gender is required";
        if (!profileData.educationLevel) newErrors.educationLevel = "Education level is required";

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const validateRequirementsStep = () => {
        const newErrors = {};

        // Validate pending requirements
        pendingRequirements.forEach(req => {
            if (req.is_required && (!requirementData[req.id] || requirementData[req.id] === '')) {
                newErrors[`requirement_${req.id}`] = `${req.label} is required`;
            }
        });

        // Validate editing requirements
        Object.keys(editingRequirements).forEach(reqId => {
            if (editingRequirements[reqId]) {
                const req = requirements.find(r => r.id == reqId);
                if (req?.is_required && (!requirementData[reqId] || requirementData[reqId] === '')) {
                    newErrors[`requirement_${reqId}`] = `${req.label} is required`;
                }
            }
        });

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleEditRequirement = (requirementId) => {
        setEditingRequirements(prev => ({
            ...prev,
            [requirementId]: true
        }));
    };

    const handleCancelEdit = (requirementId) => {
        setEditingRequirements(prev => ({
            ...prev,
            [requirementId]: false
        }));

        // Restore original value
        const originalResponse = previousResponses.find(r => r.requirement_id === requirementId);
        if (originalResponse) {
            setRequirementData(prev => ({
                ...prev,
                [requirementId]: originalResponse.type === 'FILE' ? originalResponse.file_url : originalResponse.value
            }));
        }
    };

    const nextStep = async () => {
        if (currentStep === 1 && validateProfileStep()) {
            try {
                await handleProfileSubmission();
                setCurrentStep(2);
                window.scrollTo({ top: 0, behavior: "smooth" });
            } catch (error) {
                console.error("Profile submission failed:", error);
                toast.error("Failed to update profile. Please try again.");
                return;
            }
        } else if (currentStep === 2) {
            // Check if there are unfilled required fields
            if (hasUnfilledRequiredFields()) {
                toast.warning("Please complete all required fields before proceeding.");
                return;
            }

            if (hasTickets) {
                await submitApplication();
                setCurrentStep(3);
                window.scrollTo({ top: 0, behavior: "smooth" });
            } else {
                // If no tickets, submit requirements directly
                if (validateRequirementsStep()) {
                    await submitApplication();
                }
            }
        }
    };

    const previousStep = () => {
        setCurrentStep(prev => Math.max(prev - 1, 1));
    };

    const submitApplication = async () => {
        if (!validateRequirementsStep()) return;

        setIsLoading(true);
        try {
            const formData = new FormData();
            formData.append('event_id', id);

            let responseIndex = 0;

            // Submit pending requirements
            pendingRequirements.forEach((requirement) => {
                const value = requirementData[requirement.id];
                if (value) {
                    formData.append(`responses[${responseIndex}][requirement_id]`, requirement.id);
                    if (requirement.type === 'FILE' && value instanceof File) {
                        formData.append(`responses[${responseIndex}][file]`, value);
                    } else {
                        formData.append(`responses[${responseIndex}][value]`, value);
                    }
                    responseIndex++;
                }
            });

            // Submit edited requirements
            Object.keys(editingRequirements).forEach(reqId => {
                if (editingRequirements[reqId]) {
                    const requirement = requirements.find(r => r.id == reqId);
                    const value = requirementData[reqId];

                    if (value && requirement) {
                        formData.append(`responses[${responseIndex}][requirement_id]`, reqId);
                        if (requirement.type === 'FILE' && value instanceof File) {
                            formData.append(`responses[${responseIndex}][file]`, value);
                        } else {
                            formData.append(`responses[${responseIndex}][value]`, value);
                        }
                        responseIndex++;
                    }
                }
            });

            const res = await api.post('/api/event/participation/submit-response/', formData);
            console.log('----/api/event/participation/submit-response/---', res.data);

            currentStep === 3 ? toast.success("Application updated successfully!") : toast.success("Requirements updated successfully!");

            // Refresh the data to show updated responses
            console.log('------hasAnyTickets', hasTickets)
            if (currentStep === 2 && !hasTickets) {
                setTimeout(() => {
                    navigate('/user/events')
                    // window.location.reload();
                }, 1000);
            }
            if (currentStep === 3) {
                setTimeout(() => {
                    navigate('/user/events')
                    // window.location.reload();
                }, 1000);
            }


        } catch (error) {
            console.error("Requirements submission error:", error);
            toast.error(error.response?.data?.detail || "Failed to submit application. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const getCompletedPercentage = () => {
        return Math.round((currentStep / totalSteps) * 100);
    };

    if (isLoading && !profile) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading application form...</p>
                </div>
            </div>
        );
    }

    const handleProfileSubmission = async () => {
        setIsLoading(true);
        try {
            const profileFormData = new FormData();
            profileFormData.append('full_name_en', profileData.fullName);
            profileFormData.append('phone_number', profileData.phoneNumber);
            profileFormData.append('address', profileData.address);
            profileFormData.append('date_of_birth', profileData.dateOfBirth);
            profileFormData.append('sex', profileData.sex);
            profileFormData.append('organization', profileData.organization);
            profileFormData.append('designation', profileData.designation);
            profileFormData.append('employee_id', profileData.employeeId);
            profileFormData.append('education_level', profileData.educationLevel);
            profileFormData.append('bio', profileData.bio);

            // Fix these conditions
            if (profileImage) {
                profileFormData.append('profile_picture', profileImage);
            }
            if (profileData.supportDocument instanceof File) {
                profileFormData.append('support_document', profileData.supportDocument);
            }


            const has_profile = localStorage.getItem('has_profile');
            profileFormData.forEach((value, key) => {
                console.log(key, value);
            });

            if (has_profile == 'true') {
                await api.put('/api/account/profile/update/', profileFormData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
            } else {
                await api.post('/api/account/profile/', profileFormData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                localStorage.setItem('has_profile', 'true'); // Fix: set as string 'true'
            }

            toast.success("Profile updated successfully!");

        } catch (error) {
            console.log("Profile submission error:", error);

            // Try to get Axios response data
            const responseData = error?.response?.data;

            if (responseData && typeof responseData === "object") {
                // Loop through each field in the error object
                Object.keys(responseData).forEach((field) => {
                    const messages = responseData[field];
                    if (Array.isArray(messages)) {
                        // Show each message as a toast
                        messages.forEach((msg) => toast.error(msg));
                    } else if (messages) {
                        toast.error(messages);
                    }
                });
            } else {
                // Fallback
                toast.error("Failed to update profile. Please try again.");
            }

            throw error;
        }

        finally {
            setIsLoading(false);
        }
    };
    const isTicketPaid = (ticketId) => {
        return paidTickets.some(ticket => ticket.id === ticketId);
    };

    const isDeadlineNear = (deadline) => {
        if (!deadline) return false;
        const deadlineDate = new Date(deadline);
        const now = new Date();
        const diffInDays = Math.ceil((deadlineDate - now) / (1000 * 60 * 60 * 24));
        return diffInDays <= 3 && diffInDays > 0;
    };

    const isDeadlinePassed = (deadline) => {
        if (!deadline) return false;
        return new Date(deadline) < new Date();
    };

    const formatDeadline = (deadline) => {
        if (!deadline) return 'No deadline';
        const date = new Date(deadline);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    const handleTicketSelection = (ticketId, checked) => {
        if (isTicketPaid(ticketId)) return;

        const newSelection = new Set(selectedTickets);
        if (checked) newSelection.add(ticketId);
        else newSelection.delete(ticketId);
        setSelectedTickets(newSelection);
    };

    const handleSelectAll = (checked) => {
        if (checked) {
            const availableTicketIds = unpaidTickets
                .filter(ticket => !isDeadlinePassed(ticket.deadline))
                .map(ticket => ticket.id);
            setSelectedTickets(new Set(availableTicketIds));
        } else {
            setSelectedTickets(new Set());
        }
    };

    const getTotalAmount = () => {
        const selectedTicketsData = unpaidTickets.filter(ticket => selectedTickets.has(ticket.id));
        return selectedTicketsData.reduce((total, ticket) => total + parseFloat(ticket.amount), 0);
    };

    const handleSingleTicketPurchase = async (ticket) => {
        if (isDeadlinePassed(ticket.deadline)) {
            toast.error('Ticket sales deadline has passed.');
            return;
        }

        if (isTicketPaid(ticket.id)) {
            toast.info('This ticket has already been purchased.');
            return;
        }

        try {

            setProcessingTicketId(ticket.id);

            const payload = {
                tickets: [{ ticket_id: ticket.id, event_id: id }],
                event_id: id
            };

            const orderRes = await api.post(`/api/event/participation/tickets/`, payload);
            console.log('---------orderRes---------', orderRes);
            const { total_amount, participant_ticket_ids, participation_id } = orderRes.data;
            // setPid(participation_id[0]);
            console.log('participation_id', participation_id);

            if (participation_id) {
                navigate(`/user/payment/${participation_id}`, {
                    state: {
                        tid: participant_ticket_ids,
                        totalAmount: total_amount,
                        eventId: id,
                        ticketDetails: [ticket]
                    }
                });
            }


        } catch (error) {
            console.error('Payment initiation failed:', error);
            toast.error('Failed to initiate payment. Please try again.');
        } finally {
            setProcessingTicketId(null);
        }
    };

    const handleBulkPayment = async () => {
        if (selectedTickets.size === 0) {
            toast.warning('Please select at least one ticket.');
            return;
        }

        const selectedTicketsData = unpaidTickets.filter(ticket => selectedTickets.has(ticket.id));
        const expiredTickets = selectedTicketsData.filter(ticket => isDeadlinePassed(ticket.deadline));

        if (expiredTickets.length > 0) {
            toast.error('Some selected tickets have expired. Please remove them and try again.');
            return;
        }

        try {
            setIsProcessingPayment(true);

            const payload = {
                tickets: selectedTicketsData.map(ticket => ({
                    ticket_id: ticket.id,
                    event_id: id
                })),
                event_id: id
            };

            const orderRes = await api.post(`/api/event/participation/tickets/`, payload);
            const { total_amount, participant_ticket_ids, participation_id } = orderRes.data;
            setPid(participation_id);

            if (participation_id) {
                navigate(`/user/payment/${participation_id}`, {
                    state: {
                        tid: participant_ticket_ids,
                        totalAmount: total_amount,
                        eventId: id,
                        ticketDetails: selectedTicketsData
                    }
                });
            }


            setSelectedTickets(new Set());

        } catch (error) {
            console.error('Bulk payment initiation failed:', error);
            toast.error('Failed to initiate bulk payment. Please try again.');
        } finally {
            setIsProcessingPayment(false);
        }
    };

    return (
        <div className="min-h-screen py-8 px-4 ">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="mb-8 ">
                    <button
                        onClick={() => navigate('/user')}
                        className="mb-4  text-gray-500 hover:text-gray-700 flex items-center"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Events
                    </button>

                    <div className="text-center">
                        <h1 className="text-3xl max-md:text-2xl font-bold text-gray-900 mb-2">
                            Apply to {eventDetails?.title || "Event"}
                        </h1>
                        <p className="text-gray-600 max-md:text-[14px]">
                            Complete all steps to submit your application
                        </p>
                    </div>
                </div>

                <div className="bg-white/50 shadow-lg rounded-lg border-0">
                    <div className="p-6 pb-4 ">
                        <ProgressIndicator
                            currentStep={currentStep}
                            totalSteps={totalSteps}
                            completedPercentage={getCompletedPercentage()}
                            hasTickets={hasTickets}
                        />
                    </div>

                    <div className="px-6 pb-6 ">
                        {/* Step 1: Profile Setup */}
                        {currentStep === 1 && (
                            <div className="space-y-6 ">
                                <div>
                                    <h2 className="text-xl font-bold mb-2">Personal Information</h2>
                                </div>

                                {/* Profile Fields */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="block text-sm font-medium flex items-center">
                                            Full Name *
                                        </label>
                                        <input
                                            type="text"
                                            value={profileData.fullName}
                                            onChange={(e) => setProfileData(prev => ({ ...prev, fullName: e.target.value }))}
                                            placeholder="Enter your full name"
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-[14px]"
                                        />
                                        {errors.fullName && <p className="text-sm text-red-500">{errors.fullName}</p>}
                                    </div>

                                    <div className="space-y-2">
                                        <label className="block text-sm font-medium flex items-center">
                                            Email Address *
                                        </label>
                                        <input
                                            type="email"
                                            readOnly
                                            value={profileData?.email}
                                            className="w-full px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-100 text-[14px]"
                                        />
                                        {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
                                    </div>

                                    <div className="space-y-2">
                                        <label className="block text-sm font-medium flex items-center">
                                            Phone Number *
                                        </label>
                                        <input
                                            type="text"
                                            value={profileData.phoneNumber}
                                            onChange={(e) => setProfileData(prev => ({ ...prev, phoneNumber: e.target.value }))}
                                            placeholder="Enter your phone number"
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-[14px]"
                                        />
                                        {errors.phoneNumber && <p className="text-sm text-red-500">{errors.phoneNumber}</p>}
                                    </div>

                                    <div className="space-y-2">
                                        <label className="block text-sm font-medium">Gender *</label>
                                        <select
                                            value={profileData.sex}
                                            onChange={(e) => setProfileData(prev => ({ ...prev, sex: e.target.value }))}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-[14px]"
                                        >
                                            <option value="">Select gender</option>
                                            <option value="MALE">Male</option>
                                            <option value="FEMALE">Female</option>
                                            <option value="OTHER">Other</option>
                                        </select>
                                        {errors.sex && <p className="text-sm text-red-500">{errors.sex}</p>}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="dateOfBirth">Date of Birth *</Label>
                                        <DatePicker
                                            value={profileData.dateOfBirth}
                                            onChange={(date) =>
                                                setProfileData((prev) => ({ ...prev, dateOfBirth: date }))
                                            }
                                            minDate={new Date(1950, 0, 1)}
                                            maxDate={new Date()}
                                        />

                                        {errors.dateOfBirth && (
                                            <p className="text-sm text-red-600">{errors.dateOfBirth}</p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <label className="block text-sm font-medium">Education Level *</label>
                                        <select
                                            value={profileData.educationLevel}
                                            onChange={(e) => setProfileData(prev => ({ ...prev, educationLevel: e.target.value }))}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-[14px]"
                                        >
                                            <option value="">Select education level</option>
                                            <option value="HIGH_SCHOOL">High School</option>
                                            <option value="BACHELORS">Bachelor's Degree</option>
                                            <option value="MASTERS">Master's Degree</option>
                                            <option value="PHD">PhD</option>
                                        </select>
                                        {errors.educationLevel && <p className="text-sm text-red-500">{errors.educationLevel}</p>}
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="block text-sm font-medium">Address *</label>
                                    <textarea
                                        value={profileData.address}
                                        onChange={(e) => setProfileData(prev => ({ ...prev, address: e.target.value }))}
                                        placeholder="Enter your full address"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none text-[14px]"
                                        rows={2}
                                    />
                                    {errors.address && <p className="text-sm text-red-500">{errors.address}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="bio">Bio</Label>
                                    <textarea
                                        id="bio"
                                        placeholder="Tell us a bit about yourself..."
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500  text-[14px]"
                                        rows={4}
                                        value={profileData.bio}
                                        onChange={(e) => setProfileData(prev => ({ ...prev, bio: e.target.value }))}
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="block text-sm font-medium">Organization</label>
                                        <input
                                            type="text"
                                            value={profileData.organization}
                                            onChange={(e) => setProfileData(prev => ({ ...prev, organization: e.target.value }))}
                                            placeholder="Your organization name"
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-[14px]"
                                        />
                                    </div>

                                    {profileData.organization && (
                                        <div className="space-y-2">
                                            <label className="block text-sm font-medium">Designation</label>
                                            <input
                                                type="text"
                                                value={profileData.designation}
                                                onChange={(e) => setProfileData(prev => ({ ...prev, designation: e.target.value }))}
                                                placeholder="Your job title"
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-[14px]"
                                            />
                                        </div>
                                    )}
                                </div>

                                {profileData.organization && (
                                    <div className="space-y-2">
                                        <label className="block text-sm font-medium">Employee ID</label>
                                        <input
                                            type="text"
                                            value={profileData.employeeId}
                                            onChange={(e) => setProfileData(prev => ({ ...prev, employeeId: e.target.value }))}
                                            placeholder="Your employee ID"
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-[14px]"
                                        />
                                    </div>
                                )}
                                <div className="space-y-2">
                                    <label className="block text-sm font-medium">Profile Picture <span className="text-[10px]">(Max 2 MB)</span></label>
                                    <div className="flex items-center justify-start space-x-4 ml-2">

                                        {/* Upload Button (only if no profile picture exists) */}
                                        {!(profileData.profileImage || previewUrl) && (
                                            <label className="flex items-center justify-center w-full h-20 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
                                                <FaCamera className="w-4 h-4 mr-2" />
                                                <span className="text-sm text-gray-500">Upload Picture</span>
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    className="hidden"
                                                    onChange={handleProfilePictureChange}
                                                    ref={imageRef}
                                                />
                                            </label>
                                        )}

                                        {/* View & Clear Buttons (if picture exists) */}
                                        {(profileData.profileImage || previewUrl) && (
                                            <>
                                                <button
                                                    type="button"
                                                    onClick={() => setShowProfileModal(true)}
                                                    className="text-white hover:text-white flex items-center gap-1 text-sm font-medium bg-blue/90 hover:bg-blue/70 px-3 py-2 rounded-md"
                                                >
                                                    <FaEye className="w-4 h-4 mr-2" /> View profile picture
                                                </button>

                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setProfileData(prev => ({ ...prev, profileImage: null }));
                                                        setPreviewUrl(null);
                                                    }}
                                                    className="text-red-500 hover:text-red-700 flex items-center gap-1 text-sm font-medium"
                                                >
                                                    <FaTimes className="inline-block" /> Clear
                                                </button>
                                            </>
                                        )}
                                    </div>

                                    {errors.profileImage && (
                                        <p className="text-sm text-red-600">{errors.profileImage}</p>
                                    )}
                                </div>
                                {/* Document Section */}
                                <div className="space-y-4">
                                    <h3 className="text-lg font-semibold">Documents</h3>

                                    {/* Profile Picture Upload */}



                                    {/* Verification Document */}
                                    <DetailItemDocument
                                        label="Verification Document"
                                        value={profileData.supportDocument}
                                        onClear={() => setProfileData(prev => ({ ...prev, supportDocument: null }))}
                                        onUpload={(file) => setProfileData(prev => ({ ...prev, supportDocument: file }))}
                                    />
                                </div>



                            </div>
                        )}

                        {/* Step 2: Dynamic Requirements */}
                        {currentStep === 2 && (
                            <div className="space-y-6">
                                {
                                    requirementLength >= 1 && (
                                        <div>
                                            <h2 className="text-xl font-bold mb-2">Event Requirements</h2>
                                            <div className="flex max-lg:flex-col justify-between items-center gap-2">

                                                <p className="text-gray-600 max-lg:text-[14px] flex-[0.9]">
                                                    Complete the following requirements for {eventDetails?.title}
                                                </p>

                                                {
                                                    previousResponses.length > 0 && (
                                                        <button onClick={handlePreviousToggle} className="text-white hover:text-white flex items-center gap-1 text-sm font-medium bg-blue/90 hover:bg-blue/70 px-3 py-2 rounded-md">{showPrevious ? 'Hide previous uploads' : 'View previous uploads'}</button>

                                                    )
                                                }
                                            </div>
                                        </div>
                                    )
                                }


                                {/* Previous Responses Section */}

                                {previousResponses.length > 0 && showPrevious && (
                                    <div className="space-y-4 ">
                                        <div className="border-b border-gray-200 pb-4">
                                            <h3 className="text-lg font-semibold text-gray-900 mb-3">
                                                Previously Submitted Requirements
                                            </h3>
                                            <div className="space-y-4 ">
                                                {previousResponses.map((response) => {
                                                    const requirement = requirements.find(r => r.id === response.requirement_id);
                                                    if (!requirement) return null;

                                                    return editingRequirements[response.requirement_id] ? (
                                                        <div key={response.requirement_id} className="border border-blue-200 rounded-lg p-4 bg-blue-50">
                                                            <div className="flex justify-between items-center mb-3">
                                                                <h4 className="font-medium max-md:text-[14px] text-gray-900">
                                                                    Editing: {response.label}
                                                                </h4>
                                                                <button
                                                                    onClick={() => handleCancelEdit(response.requirement_id)}
                                                                    className="text-gray-500 max-md:text-[12px] hover:text-gray-700 text-sm flex items-center gap-1"
                                                                >
                                                                    <FaTimes className="w-3 h-3" />
                                                                    Cancel
                                                                </button>
                                                            </div>
                                                            <DynamicField
                                                                requirement={requirement}
                                                                value={requirementData[requirement.id]}
                                                                onChange={(value) =>
                                                                    setRequirementData(prev => ({
                                                                        ...prev,
                                                                        [requirement.id]: value
                                                                    }))
                                                                }
                                                                error={errors[`requirement_${requirement.id}`]}
                                                            />
                                                        </div>
                                                    ) : (
                                                        <PreviousResponseCard
                                                            key={response.requirement_id}
                                                            response={response}
                                                            requirement={requirement}
                                                            onEdit={handleEditRequirement}
                                                        />
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Pending Requirements Section */}
                                {pendingRequirements.length > 0 ? (
                                    <div className="space-y-4">
                                        <h3 className="text-lg font-semibold text-gray-900 mb-3">
                                            Pending Requirements
                                        </h3>
                                        <div className="space-y-6">
                                            {pendingRequirements.map((requirement) => (
                                                <DynamicField
                                                    key={requirement.id}
                                                    requirement={requirement}
                                                    value={requirementData[requirement.id]}
                                                    onChange={(value) =>
                                                        setRequirementData(prev => ({
                                                            ...prev,
                                                            [requirement.id]: value
                                                        }))
                                                    }
                                                    error={errors[`requirement_${requirement.id}`]}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                ) : previousResponses.length > 0 && Object.keys(editingRequirements).every(key => !editingRequirements[key]) ? (
                                    <div className="text-center py-8 bg-green-50 border border-green-200 rounded-lg">
                                        <p className="text-green-700 font-medium max-md:text-[12px]">All requirements completed!</p>
                                        <p className="text-green-600 text-sm max-md:text-[11px]">You can edit any requirement above if needed.</p>
                                    </div>
                                ) : null}

                                {pendingRequirements.length === 0 && previousResponses.length === 0 && (
                                    <div className="text-center py-8">
                                        <p className="text-gray-500">No specific requirements for this event.</p>
                                    </div>
                                )}

                                {(Object.keys(errors).some(key => key.startsWith('requirement_')) ||
                                    pendingRequirements.some(req => req.is_required && (!requirementData[req.id] || requirementData[req.id] === ''))) && (
                                        <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                                            <p className="text-sm text-orange-600 font-medium">
                                                ⚠️ Please complete all required fields before proceeding.
                                            </p>
                                        </div>
                                    )}
                            </div>
                        )}

                        {currentStep === 3 && hasTickets && (
                            <div className="space-y-6">
                                <div>
                                    <h2 className="text-xl font-bold mb-2">Event Tickets</h2>
                                    <p className="text-gray-600 max-md:text-[14px]">Purchase tickets for {eventDetails?.title} (Optional)</p>
                                </div>

                                {/* Show purchased tickets if any */}
                                {paidTickets.length > 0 && (
                                    <div className="space-y-4">
                                        <h3 className="text-lg font-semibold text-green-700">Purchased Tickets</h3>
                                        <div className="space-y-3">
                                            {paidTickets.map((ticket) => (
                                                <div key={ticket.id} className="bg-green-50 border border-green-200 rounded-lg p-4">
                                                    <div className="flex justify-between items-start">
                                                        <div className="flex items-center gap-3">
                                                            <div className="bg-green-600 p-2 rounded-full">
                                                                <FaTicketAlt className="w-4 h-4 text-white" />
                                                            </div>
                                                            <div>
                                                                <h4 className="font-semibold text-green-900">{ticket.label}</h4>
                                                                <p className="text-sm text-green-700">{ticket.description}</p>
                                                            </div>
                                                        </div>
                                                        <div className="text-right">
                                                            <div className="flex items-center gap-1 text-green-600 font-semibold">
                                                                <FaCheck className="w-4 h-4" />
                                                                <span>Purchased</span>
                                                            </div>
                                                            <p className="text-lg font-bold text-green-900">Rs. {parseFloat(ticket.amount).toFixed(2)}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Show unpaid tickets if any */}
                                {unpaidTickets.length > 0 && (
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center">
                                            <h3 className="text-lg font-semibold text-gray-900">Available Tickets</h3>
                                            {unpaidTickets.filter(ticket => !isDeadlinePassed(ticket.deadline)).length > 1 && (
                                                <div className="flex items-center gap-3">
                                                    <Checkbox
                                                        id="select-all-tickets"
                                                        checked={selectedTickets.size === unpaidTickets.filter(ticket => !isDeadlinePassed(ticket.deadline)).length}
                                                        onCheckedChange={handleSelectAll}
                                                    />
                                                    <label htmlFor="select-all-tickets" className="text-sm font-medium">
                                                        Select all available
                                                    </label>
                                                </div>
                                            )}
                                        </div>

                                        {/* Bulk payment controls */}
                                        {selectedTickets.size > 0 && (
                                            <div className="bg-blue/5 border border-blue/20 rounded-lg p-4 ">
                                                <div className="flex justify-between items-center">
                                                    <div>
                                                        <p className="text-sm text-blue/80">
                                                            {selectedTickets.size} ticket{selectedTickets.size > 1 ? 's' : ''} selected
                                                        </p>
                                                        <p className="text-lg font-bold text-blue/90">
                                                            Total: Rs. {getTotalAmount().toFixed(2)}
                                                        </p>
                                                    </div>
                                                    <button
                                                        onClick={handleBulkPayment}
                                                        disabled={isProcessingPayment}
                                                        className={`px-4 py-2 rounded-lg font-medium ${isProcessingPayment
                                                            ? 'bg-gray-400 text-white cursor-not-allowed'
                                                            : 'bg-blue text-white hover:bg-blue/80'
                                                            }`}
                                                    >
                                                        {isProcessingPayment ? (
                                                            <>
                                                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2 inline-block"></div>
                                                                Processing...
                                                            </>
                                                        ) : (
                                                            <>
                                                                <ShoppingCart className="w-4 h-4 mr-2 inline-block" />
                                                                Pay Selected
                                                            </>
                                                        )}
                                                    </button>
                                                </div>
                                            </div>
                                        )}

                                        <div className="space-y-3">
                                            {unpaidTickets.map((ticket) => {
                                                const isExpired = isDeadlinePassed(ticket.deadline);
                                                const isNearDeadline = isDeadlineNear(ticket.deadline);
                                                const isSelected = selectedTickets.has(ticket.id);
                                                const isProcessing = processingTicketId === ticket.id;

                                                return (
                                                    <div
                                                        key={ticket.id}
                                                        className={`border rounded-lg p-4 ${isExpired ? 'bg-gray-50 border-gray-200' :
                                                            isSelected ? 'bg-blue/5 border-blue/30' :
                                                                'bg-white border-gray-200 hover:border-blue/30'
                                                            }`}
                                                    >
                                                        <div className="flex justify-between items-start">
                                                            <div className="flex items-start gap-3">
                                                                {!isExpired && unpaidTickets.filter(t => !isDeadlinePassed(t.deadline)).length > 1 && (
                                                                    <Checkbox
                                                                        checked={isSelected}
                                                                        onCheckedChange={(checked) => handleTicketSelection(ticket.id, checked)}
                                                                        className="mt-1"
                                                                    />
                                                                )}
                                                                <div className="flex items-start gap-3">
                                                                    <div className={`p-2 max-md:hidden rounded-full ${isExpired ? 'bg-gray-400' : 'bg-blue/60'}`}>
                                                                        <FaTicketAlt className="w-4 h-4 max-md:w-3 max-md:h-3 max-md:hidden text-white" />
                                                                    </div>
                                                                    <div>
                                                                        <h4 className={`font-semibold max-md:text-[15px] ${isExpired ? 'text-gray-500' : 'text-gray-900'}`}>
                                                                            {ticket.label}
                                                                        </h4>
                                                                        {/* <p className={`text-sm text-justify max-md:text-[12px] max-w-[600px] ${isExpired ? 'text-gray-400' : 'text-gray-600'}`}>
                                                                            {ticket.description}
                                                                        </p> */}
                                                                        <div className="max-w-[600px]">
                                                                            <p
                                                                                className={`text-sm text-justify max-md:text-[12px] ${isExpired ? "text-gray-400" : "text-gray-600"
                                                                                    } ${expanded ? "" : "line-clamp-3"}`}
                                                                            >
                                                                                {ticket.description}
                                                                            </p>

                                                                            {/* Show toggle button only if text is long */}
                                                                            {ticket.description && ticket.description.split(" ").length > 15 && (
                                                                                <button
                                                                                    onClick={() => setExpanded(!expanded)}
                                                                                    className="mt-1 text-blue-600 text-xs font-medium hover:underline"
                                                                                >
                                                                                    {expanded ? "Read less" : "Read more"}
                                                                                </button>
                                                                            )}
                                                                        </div>
                                                                        <div className="flex items-center gap-4 mt-2">
                                                                            <div className="flex items-center gap-1">
                                                                                <Calendar className="w-4 h-4 max-md:w-3 max-md:h-3 text-gray-400" />
                                                                                <span className={`text-sm max-md:text-[12px] ${isNearDeadline ? 'text-orange-600 font-medium' :
                                                                                    isExpired ? 'text-red-500' : 'text-gray-500'
                                                                                    }`}>
                                                                                    {formatDeadline(ticket.deadline)}
                                                                                </span>
                                                                            </div>
                                                                            {isNearDeadline && !isExpired && (
                                                                                <span className="max-md:hidden text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded-full">
                                                                                    <Clock className="w-3 h-3 mr-1 inline-block" />
                                                                                    Ending Soon
                                                                                </span>
                                                                            )}
                                                                            {isExpired && (
                                                                                <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded-full">
                                                                                    Expired
                                                                                </span>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div className="text-right flex flex-col items-end gap-2">
                                                                <div className="flex items-center gap-1">

                                                                    <span className={`text-lg max-md:text-[15px] font-bold ${isExpired ? 'text-gray-500' : 'text-gray-900'}`}>
                                                                        Rs. {parseFloat(ticket.amount).toFixed(2)}
                                                                    </span>
                                                                </div>
                                                                <button
                                                                    onClick={() => handleSingleTicketPurchase(ticket)}
                                                                    disabled={isExpired || isProcessing}
                                                                    className={`px-4 py-2 max-md:text-[12px] rounded-lg font-medium flex items-center justify-center gap-2 ${isExpired
                                                                        ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                                                                        : isProcessing
                                                                            ? "bg-gray-400 text-white cursor-not-allowed"
                                                                            : "bg-blue text-white hover:bg-blue/80"
                                                                        }`}
                                                                >
                                                                    {isExpired ? (
                                                                        "Expired"
                                                                    ) : isProcessing ? (
                                                                        <>
                                                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                                                            Processing...
                                                                        </>
                                                                    ) : (
                                                                        <>
                                                                            <CreditCard className="w-4 h-4 max-md:w-3 max-md:h-3" />
                                                                            Buy Now
                                                                        </>
                                                                    )}
                                                                </button>

                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}

                                {/* No tickets message */}
                                {paidTickets.length === 0 && unpaidTickets.length === 0 && (
                                    <div className="text-center py-8 bg-gray-50 rounded-lg">
                                        <FaTicketAlt className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                        <h3 className="text-lg font-medium text-gray-900 mb-2">No Tickets Available</h3>
                                        <p className="text-gray-600">This event currently has no tickets available for purchase.</p>
                                    </div>
                                )}
                            </div>
                        )}



                        {/* Navigation */}
                        <div className="flex justify-between pt-8 mt-8 border-t">

                            <button
                                onClick={previousStep}
                                disabled={currentStep === 1}
                                className={`flex max-md:text-[14px] items-center px-4 py-2 border rounded-md min-w-24 ${currentStep === 1
                                    ? 'bg-gray-100 text-gray-400 border-gray-300 cursor-not-allowed'
                                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                                    }`}
                            >
                                <ChevronLeft className="w-4 h-4 mr-2" />
                                Previous
                            </button>

                            {currentStep < totalSteps ? (
                                <button
                                    onClick={nextStep}
                                    disabled={currentStep === 2 && hasUnfilledRequiredFields()}
                                    className={`flex max-md:text-[14px] items-center px-4 py-2 rounded-md min-w-24 ${currentStep === 2 && hasUnfilledRequiredFields()
                                        ? 'bg-gray-400 text-gray-300 border-gray-300 cursor-not-allowed'
                                        : 'bg-blue hover:bg-blue/80 text-white'
                                        }`}
                                >
                                    Next Step
                                    <ChevronRight className="w-4 h-4 ml-2" />
                                </button>
                            ) : (
                                <button
                                    onClick={submitApplication}
                                    disabled={isLoading}
                                    className={`px-6 py-2 max-md:text-[14px] rounded-md min-w-32 ${isLoading
                                        ? 'bg-gray-400 text-white cursor-not-allowed'
                                        : 'bg-green-600 hover:bg-green-700 text-white'
                                        }`}
                                >
                                    {isLoading ? "Submitting..." : "Submit Application"}

                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
            {/* Profile Picture Modal */}
            {showProfileModal && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50  flex items-center justify-center z-50 "
                    onClick={() => setShowProfileModal(false)} // Close when clicking backdrop
                >
                    <div
                        className="bg-white rounded-lg p-2 max-w-lg w-full "
                        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside modal
                    >
                        <div className="flex justify-between items-center mb-4 ">
                            {/* <h3 className="text-lg font-semibold">Profile Picture</h3> */}
                            <button
                                onClick={() => setShowProfileModal(false)}
                                className="text-gray-500 hover:text-gray-700 transition-colors"
                            >
                                <FaTimes className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="flex justify-center">
                            <img
                                src={previewUrl || profileData.profileImage || defaultProfileImage}
                                alt="Profile"
                                className="max-w-full max-h-96 object-contain rounded-md"
                            />
                        </div>

                    </div>
                </div>
            )}
            <ToastContainer />
        </div>
    );
};
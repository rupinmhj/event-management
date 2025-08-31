import { useState, useRef, useEffect, useContext } from "react";
import { toast, ToastContainer } from 'react-toastify';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Upload, User, Camera, Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import useAxiosAuth from "@/hooks/useAxiosAuth";
import { useNavigate } from "react-router-dom";
import DatePicker from "@/utils/DatePicker";
import AuthContext from "@/context/AuthContext";

const ProfileSetup = () => {
    const api = useAxiosAuth();
    const [address, setAddress] = useState("");
    const [dateOfBirth, setDateOfBirth] = useState("");
    const [sex, setSex] = useState("");
    const [organization, setOrganization] = useState("");
    const [designation, setDesignation] = useState("");
    const [employeeId, setEmployeeId] = useState("");
    const [educationLevel, setEducationLevel] = useState("");
    const [bio, setBio] = useState("");
    const { id } = useAxiosAuth();
    const navigate = useNavigate();
    // Profile picture states
    const [profileImage, setProfileImage] = useState(null);
    const [previewUrl, setPreviewUrl] = useState("");

    // Support document states
    const [supportDocument, setSupportDocument] = useState(null);
    const [supportDocumentName, setSupportDocumentName] = useState("");

    // Error states
    const [errors, setErrors] = useState({});

    // Loading state
    const [isLoading, setIsLoading] = useState(false);

    const imageRef = useRef(null);
    const containerRef = useRef(null);
    const [isProfileActive, setIsProfileActive] = useState(true);
    const { setHasProfile } = useContext(AuthContext)

    useEffect(() => {
        
        window.scrollTo(0, 0);
    },[])
    // Default profile image URL
    const defaultProfileImage = "https://via.placeholder.com/96x96/e5e7eb/6b7280?text=Profile";

    const handleProfilePictureChange = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            // Validate file type
            if (!file.type.startsWith('image/')) {
                setErrors(prev => ({ ...prev, profileImage: "Please select a valid image file" }));
                return;
            }

            // Validate file size (5MB limit)
            if (file.size > 5 * 1024 * 1024) {
                setErrors(prev => ({ ...prev, profileImage: "Image size should be less than 5MB" }));
                return;
            }

            setProfileImage(file);
            setPreviewUrl(URL.createObjectURL(file));
            // setIsProfileActive(true);
            // Clear any previous errors
            setErrors(prev => ({ ...prev, profileImage: "" }));
        }
    };

    const handleSupportDocumentChange = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            // Validate file type
            const allowedTypes = ['.pdf', '.doc', '.docx'];
            const fileExtension = '.' + file.name.split('.').pop().toLowerCase();

            if (!allowedTypes.includes(fileExtension)) {
                setErrors(prev => ({ ...prev, supportDocument: "Please select a PDF, DOC, or DOCX file" }));
                return;
            }

            // Validate file size (10MB limit)
            if (file.size > 10 * 1024 * 1024) {
                setErrors(prev => ({ ...prev, supportDocument: "File size should be less than 10MB" }));
                return;
            }

            setSupportDocument(file);
            setSupportDocumentName(file.name);
            // Clear any previous errors
            setErrors(prev => ({ ...prev, supportDocument: "" }));
        }
    };

    const validateForm = () => {
        const newErrors = {};

        if (!address.trim()) newErrors.address = "Address is required";
        if (!dateOfBirth) newErrors.dateOfBirth = "Date of birth is required";
        if (!sex) newErrors.sex = "Gender is required";
        // if (!organization.trim()) newErrors.organization = "Organization is required";
        // if (!designation.trim()) newErrors.designation = "Designation is required";
        // if (!employeeId.trim()) newErrors.employeeId = "Employee ID is required";
        if (!educationLevel) newErrors.educationLevel = "Education level is required";
        // if (!bio.trim()) newErrors.bio = "Bio is required";
        // if (!supportDocument) newErrors.supportDocument = "Support document is required";

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();


        if (!validateForm()) {
            return;
        }

        setIsLoading(true);

        try {

            // Create FormData for file uploads
            // console.log('id', id);
            const formData = new FormData();

            // Append all form fields
            // formData.append('id', id);
            formData.append('address', address);
            formData.append('date_of_birth', dateOfBirth);
            formData.append('sex', sex);
            formData.append('organization', organization);
            formData.append('designation', designation);
            formData.append('employee_id', employeeId);
            formData.append('education_level', educationLevel);
            formData.append('bio', bio);

            // Append files if they exist
            if (profileImage) {
                formData.append('profile_picture', profileImage);
            }
            if (supportDocument) {
                formData.append('support_document', supportDocument);
            }




            const res = await api.post('/api/account/profile/', formData);
            console.log(res);
            localStorage.setItem('has_profile', JSON.stringify(true));
            setHasProfile(true);

            toast.success("Profile Updated: Your profile has been successfully updated.");
            setTimeout(() => {
                navigate('/user');
            }, 1000);



        } catch (error) {
            console.error("Error submitting form:", error);
            toast.error(error.response.data.detail);
            if (error.status = 400) navigate('/user')
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 pt-0 px-4  w-full ">
            <div className="max-w-5xl mx-auto">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-semibold text-blue-700 mb-2">Complete Your Profile</h1>
                    <p className="text-blue-600 opacity-70">Help us get to know you better by completing your profile information.</p>
                </div>

                <Card className="shadow-xl border-0 bg-white">
                    <CardHeader className="text-center pb-2">
                        <div className="flex justify-center mb-4">
                            <div className="relative" ref={containerRef}>
                                <Avatar
                                    className={`w-24 h-24 border-4 transition-all duration-300 cursor-pointer border-green-400 shadow-lg scale-105 relative`}
                                >
                                    <AvatarImage
                                        src={previewUrl || defaultProfileImage}
                                        alt="Profile"
                                        className="object-cover"
                                    />
                                    <AvatarFallback className="bg-gradient-to-r from-blue-500 to-indigo-600 text-gray-600 text-[10px] font-semibold flex items-center justify-center text-center px-2 ">
                                        Add Image
                                    </AvatarFallback>
                                </Avatar>

                                <label
                                    htmlFor="profilePicture"
                                    className="absolute -bottom-2 -right-2 text-white p-2 rounded-full cursor-pointer transition-all duration-300 hover:scale-105 shadow-lg bg-green-600 hover:bg-green-700"
                                >
                                    <Camera className="w-4 h-4" />
                                    <input
                                        id="profilePicture"
                                        type="file"
                                        accept="image/*"
                                        className="hidden cursor-pointer"
                                        onChange={handleProfilePictureChange}
                                        ref={imageRef}
                                    />
                                </label>
                            </div>
                        </div>

                        {errors.profileImage && (
                            <p className="text-sm text-red-600 mb-2">{errors.profileImage}</p>
                        )}
                        <CardTitle className="text-xl">Profile Information</CardTitle>
                        <CardDescription>Please fill in all the required details below</CardDescription>
                    </CardHeader>

                    <CardContent className="space-y-6 pt-8">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Row 1: Gender & Date of Birth */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="sex">Gender *</Label>
                                    <Select onValueChange={setSex} value={sex}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select gender" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="MALE">Male</SelectItem>
                                            <SelectItem value="FEMALE">Female</SelectItem>
                                            <SelectItem value="OTHER">Other</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    {errors.sex && (
                                        <p className="text-sm text-red-600">{errors.sex}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="dateOfBirth">Date of Birth *</Label>
                                    <DatePicker
                                        value={dateOfBirth}
                                        onChange={setDateOfBirth}
                                        minDate={new Date(1950, 0, 1)}
                                        maxDate={new Date()}
                                    />
                                    {errors.dateOfBirth && (
                                        <p className="text-sm text-red-600">{errors.dateOfBirth}</p>
                                    )}
                                </div>
                            </div>

                            {/* Row 2: Address */}
                            <div className="space-y-2">
                                <Label htmlFor="address">Address *</Label>
                                <Textarea
                                    id="address"
                                    placeholder="Enter your full address"
                                    className="resize-none"
                                    rows={3}
                                    value={address}
                                    onChange={(e) => setAddress(e.target.value)}
                                />
                                {errors.address && (
                                    <p className="text-sm text-red-600">{errors.address}</p>
                                )}
                            </div>

                            {/* Row 3 & 4: Education Level + Organization */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Education Level */}
                                <div className="space-y-2">
                                    <Label htmlFor="educationLevel">Education Level *</Label>
                                    <Select onValueChange={setEducationLevel} value={educationLevel}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select education level" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="HIGH_SCHOOL">High School</SelectItem>
                                            <SelectItem value="BACHELORS">Bachelor's Degree</SelectItem>
                                            <SelectItem value="MASTERS">Master's Degree</SelectItem>
                                            <SelectItem value="PHD">PhD</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    {errors.educationLevel && (
                                        <p className="text-sm text-red-600">{errors.educationLevel}</p>
                                    )}
                                </div>

                                {/* Organization */}
                                <div className="space-y-2">
                                    <Label htmlFor="organization">Organization </Label>
                                    <Input
                                        id="organization"
                                        placeholder="Your organization name"
                                        value={organization}
                                        onChange={(e) => setOrganization(e.target.value)}
                                    />
                                    {errors?.organization && (
                                        <p className="text-sm text-red-600">{errors.organization}</p>
                                    )}
                                </div>
                            </div>


                            {/* Conditionally show Employee ID & Designation */}
                            {organization?.trim() && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="employeeId">Employee ID </Label>
                                        <Input
                                            id="employeeId"
                                            placeholder="Your employee ID"
                                            value={employeeId}
                                            onChange={(e) => setEmployeeId(e.target.value)}
                                        />
                                        {errors.employeeId && (
                                            <p className="text-sm text-red-600">{errors.employeeId}</p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="designation">Designation </Label>
                                        <Input
                                            id="designation"
                                            placeholder="Your job title"
                                            value={designation}
                                            onChange={(e) => setDesignation(e.target.value)}
                                        />
                                        {errors.designation && (
                                            <p className="text-sm text-red-600">{errors.designation}</p>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Row 5: Bio */}
                            <div className="space-y-2">
                                <Label htmlFor="bio">Bio</Label>
                                <Textarea
                                    id="bio"
                                    placeholder="Tell us a bit about yourself..."
                                    className="resize-none"
                                    rows={4}
                                    value={bio}
                                    onChange={(e) => setBio(e.target.value)}
                                />
                                {errors.bio && (
                                    <p className="text-sm text-red-600">{errors.bio}</p>
                                )}
                            </div>

                            {/* Row 6 (Last): Support Document */}
                            <div className="space-y-2">
                                <Label htmlFor="supportDocument">Upload Verification Document</Label>
                                <div className="flex items-center justify-center w-full">
                                    <label
                                        htmlFor="supportDocument"
                                        className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors"
                                    >
                                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                            <Upload className="w-8 h-8 mb-3 text-gray-400" />
                                            {supportDocumentName ? (
                                                <p className="text-sm text-gray-700 font-medium">{supportDocumentName}</p>
                                            ) : (
                                                <>
                                                    <p className="mb-2 text-sm text-gray-500">
                                                        <span className="font-semibold">Click to upload</span> your support document
                                                    </p>
                                                    <p className="text-xs text-gray-500">PDF, DOC, DOCX (MAX. 10MB)</p>
                                                </>
                                            )}
                                        </div>
                                        <input
                                            id="supportDocument"
                                            type="file"
                                            className="hidden"
                                            accept=".pdf,.doc,.docx"
                                            onChange={handleSupportDocumentChange}
                                        />
                                    </label>
                                </div>
                                {errors.supportDocument && (
                                    <p className="text-sm text-red-600">{errors.supportDocument}</p>
                                )}
                            </div>

                            {/* Submit */}
                            <Button
                                type="submit"
                                disabled={isLoading}
                                className="w-full bg-blue text-white hover:bg-blue/90 transition-all duration-300 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
                                size="lg"
                            >
                                {isLoading ? "Updating Profile..." : "Complete Profile Setup"}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
            <ToastContainer />
        </div>
    );
};

export default ProfileSetup;
// UserProfile.jsx
import React, { useState, useRef, useEffect, useContext, useCallback } from 'react';
import {
  FaUser, FaMapMarkerAlt, FaPhone, FaEdit, FaBirthdayCake,
  FaVenusMars, FaBuilding, FaIdBadge, FaFileAlt,
  FaGraduationCap, FaInfoCircle, FaUpload, FaCamera,
  FaCalendar, FaChevronLeft, FaChevronRight, FaSave, FaTimes, FaEye
} from "react-icons/fa";
import { toast, ToastContainer } from 'react-toastify';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import useAxiosAuth from '@/hooks/useAxiosAuth';
import AuthContext from '@/context/AuthContext';
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom';
/* DatePicker Component (JSX) */
const DatePicker = ({ value, onChange, minDate, maxDate }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [isYearPickerOpen, setIsYearPickerOpen] = useState(false);
  const selectedDate = value ? new Date(value) : null;

  const formatDate = (date) =>
    date.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    for (let i = 0; i < startingDayOfWeek; i++) days.push(null);
    for (let day = 1; day <= daysInMonth; day++) days.push(new Date(year, month, day));
    return days;
  };

  const navigateMonth = (direction) => {
    setCurrentMonth((prev) => {
      const newMonth = new Date(prev);
      newMonth.setMonth(prev.getMonth() + direction);
      return newMonth;
    });
  };

  const handleDateSelect = (date) => {
    const dateString = date.toISOString().split("T")[0];
    onChange(dateString);
    setIsOpen(false);
  };

  const isDateDisabled = (date) => {
    if (minDate && date < minDate) return true;
    if (maxDate && date > maxDate) return true;
    return false;
  };

  const getYears = () => {
    const years = [];
    const minYear = minDate ? minDate.getFullYear() : 1900;
    const maxYear = maxDate ? maxDate.getFullYear() : new Date().getFullYear();
    for (let y = minYear; y <= maxYear; y++) years.push(y);
    return years;
  };

  const days = getDaysInMonth(currentMonth);
  const monthYear = currentMonth.toLocaleDateString("en-US", { month: "long", year: "numeric" });

  return (
    <div className="relative font-sans">
      <div
        className="flex items-center justify-between w-full px-3 py-2 text-sm border border-input rounded-md cursor-pointer bg-background hover:bg-accent"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className={selectedDate ? "text-foreground" : "text-muted-foreground"}>
          {selectedDate ? formatDate(selectedDate) : "Select date of birth"}
        </span>
        <FaCalendar className="w-4 h-4 text-muted-foreground" />
      </div>

      {isOpen && (
        <div className="absolute top-full left-0 z-50 w-80 mt-1 bg-background border border-border rounded-lg shadow-lg p-4">
          <div className="flex items-center justify-between mb-4">
            <button
              type="button"
              onClick={() => {
                setIsYearPickerOpen(false);
                navigateMonth(-1);
              }}
              className="p-1 hover:bg-accent rounded"
            >
              <FaChevronLeft className="w-4 h-4" />
            </button>

            <h3
              className="text-sm font-medium cursor-pointer select-none"
              onClick={() => setIsYearPickerOpen(!isYearPickerOpen)}
            >
              {monthYear}
            </h3>

            <button
              type="button"
              onClick={() => {
                setIsYearPickerOpen(false);
                navigateMonth(1);
              }}
              className="p-1 hover:bg-accent rounded"
            >
              <FaChevronRight className="w-4 h-4" />
            </button>
          </div>

          {isYearPickerOpen ? (
            <div className="max-h-48 overflow-y-auto grid grid-cols-4 gap-2" style={{ maxHeight: "12rem" }}>
              {getYears().map((year) => (
                <button
                  key={year}
                  type="button"
                  className={`p-2 rounded text-center hover:bg-accent ${currentMonth.getFullYear() === year ? "bg-primary text-primary-foreground font-bold" : ""
                    }`}
                  onClick={() => {
                    const newDate = new Date(currentMonth);
                    newDate.setFullYear(year);

                    if (minDate && newDate < minDate) newDate.setFullYear(minDate.getFullYear());
                    if (maxDate && newDate > maxDate) newDate.setFullYear(maxDate.getFullYear());

                    setCurrentMonth(newDate);
                    setIsYearPickerOpen(false);
                  }}
                >
                  {year}
                </button>
              ))}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-7 gap-1 mb-2">
                {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => (
                  <div key={day} className="p-2 text-xs font-medium text-muted-foreground text-center">
                    {day}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-1">
                {days.map((date, index) => (
                  <div key={index} className="aspect-square">
                    {date && (
                      <button
                        type="button"
                        onClick={() => !isDateDisabled(date) && handleDateSelect(date)}
                        disabled={isDateDisabled(date)}
                        className={`w-full h-full text-xs rounded hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed ${selectedDate && date.toDateString() === selectedDate.toDateString()
                          ? "bg-primary text-primary-foreground"
                          : "hover:bg-accent"
                          }`}
                      >
                        {date.getDate()}
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

/* Reusable Detail Item Component */
const DetailItem = ({ icon, label, value, className = "" }) => (
  <div className={`flex items-start gap-3 group ${className}`}>
    <span className="text-muted-foreground mt-1 group-hover:text-primary transition-colors">{icon}</span>
    <div className="min-w-0 flex-1">
      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{label}</p>
      <p className="text-sm font-medium text-foreground mt-1 break-words">{value}</p>
    </div>
  </div>
);

const DetailItemDocument = ({ icon, label, value, className = "" }) => {
  const hasDocument = Boolean(value);

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
          <button
            onClick={() => window.open(value, "_blank")}
            className="mt-1 text-primary hover:text-blue flex items-center gap-1 text-sm font-medium"
          >
            <FaEye className="inline-block" /> View Document
          </button>
        ) : (
          <p className="text-sm font-medium text-muted-foreground mt-1">
            No document uploaded
          </p>
        )}
      </div>
    </div>
  );
};

/* Helper: safely set nested fields like "user_detail.phone_number" */
const setByPath = (obj, path, value) => {
  const keys = path.split(".");
  const cloned = { ...obj };
  let cur = cloned;
  for (let i = 0; i < keys.length - 1; i++) {
    const k = keys[i];
    cur[k] = { ...(cur[k] || {}) };
    cur = cur[k];
  }
  cur[keys[keys.length - 1]] = value;
  return cloned;
};

const UserProfile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const api = useAxiosAuth?.() || null;
  const { logout } = useContext(AuthContext)
  const navigate=useNavigate();
  const auth = useContext(AuthContext) || {};
  const { authTokens, authReady, phone_number, fullName, email } = auth;

  const [formData, setFormData] = useState({
    user_detail: {
      full_name_en: "",
      phone_number: "",
      email: "",
    },
    address: "",
    date_of_birth: "",
    sex: "",
    organization: "",
    designation: "",
    employee_id: "",
    education_level: "",
    bio: "",
    profile_picture: "",
    support_document: "",
  });

  useEffect(() => {
    if (authReady) {
      setFormData((prev) => ({
        ...prev,
        user_detail: {
          ...prev.user_detail,
          full_name_en: fullName || prev.user_detail.full_name_en,
          email: email || prev.user_detail.email,
          phone_number: phone_number || prev.user_detail.phone_number,
        },
      }));
    }
  }, [authReady, phone_number, fullName, email]);



  const [profileImage, setProfileImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [supportDocument, setSupportDocument] = useState(null);
  const [supportDocumentName, setSupportDocumentName] = useState();

  const [errors, setErrors] = useState({});
  const imageRef = useRef(null);

  const fetchUserData = useCallback(async () => {
    if (!authReady || !authTokens || !api) return;
    try {
      setIsLoading(true);
      const response = await api.get('/api/account/profile/');
      console.log(response.data);
      setFormData((prev) => ({
        ...prev,
        ...response.data,
        user_detail: {
          ...(prev.user_detail || {}),
          ...(response.data?.user_detail || {}),
        },
      }));
      // toast({ title: "Profile data loaded", description: "Your profile information has been loaded successfully." });
    } catch (error) {
      const err = error?.response?.data?.code
      console.log(err)
      if (err === "token_not_valid") {
        toast.error("Token expired, Login again")
        logout();
        
        navigate('/');
      }

    } finally {
      setIsLoading(false);
    }
  }, [api, authReady, authTokens]);

  useEffect(() => {
    fetchUserData();
  }, [fetchUserData]);

  const handleEditClick = () => {
    setIsEditing(true);
    fetchUserData();
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setErrors({});
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => setByPath(prev, field, value));
    if (errors && errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handleProfilePictureChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setErrors((prev) => ({ ...prev, profileImage: "Please select a valid image file" }));
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setErrors((prev) => ({ ...prev, profileImage: "Image size should be less than 5MB" }));
        return;
      }
      setProfileImage(file);
      setPreviewUrl(URL.createObjectURL(file));
      setErrors((prev) => ({ ...prev, profileImage: "" }));
    }
  };

  const handleSupportDocumentChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const allowedTypes = ['.pdf', '.doc', '.docx'];
      const fileExtension = '.' + file.name.split('.').pop().toLowerCase();

      if (!allowedTypes.includes(fileExtension)) {
        setErrors((prev) => ({ ...prev, supportDocument: "Please select a PDF, DOC, or DOCX file" }));
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        setErrors((prev) => ({ ...prev, supportDocument: "File size should be less than 10MB" }));
        return;
      }

      setSupportDocument(file);
      setSupportDocumentName(file.name);
      setErrors((prev) => ({ ...prev, supportDocument: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.user_detail.full_name_en?.trim()) newErrors.full_name_en = "Full name is required";
    if (!formData.user_detail.phone_number?.trim()) newErrors.phone_number = "Phone number is required";
    if (!formData.address?.trim()) newErrors.address = "Address is required";
    if (!formData.date_of_birth) newErrors.date_of_birth = "Date of birth is required";
    if (!formData.sex) newErrors.sex = "Gender is required";
    if (!formData.organization?.trim()) newErrors.organization = "Organization is required";
    if (!formData.designation?.trim()) newErrors.designation = "Designation is required";
    if (!formData.employee_id?.trim()) newErrors.employee_id = "Employee ID is required";
    if (!formData.education_level) newErrors.education_level = "Education level is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {

    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const submitData = new FormData();
      submitData.append('full_name_en', formData.user_detail.full_name_en);
      submitData.append('phone_number', formData.user_detail.phone_number);
      submitData.append('address', formData.address);
      submitData.append('date_of_birth', formData.date_of_birth);
      submitData.append('sex', formData.sex);
      submitData.append('organization', formData.organization);
      submitData.append('designation', formData.designation);
      submitData.append('employee_id', formData.employee_id);
      submitData.append('education_level', formData.education_level);
      submitData.append('bio', formData.bio);

      if (profileImage) {
        submitData.append('profile_picture', profileImage);
      }
      if (supportDocument) {
        submitData.append('support_document', supportDocument);
      }
      console.log("submit form data:")
      for (let [key, value] of submitData.entries()) {
        console.log(key, value);
      }

      const res = await api.put('/api/account/profile/update/', submitData);
      console.log(res);
      console.log(res?.data);
      toast({
        title: "Profile Updated",
        description: "Your profile has been successfully updated.",
      });
      window.scrollTo({ top: 0, behavior: 'smooth' });
      fetchUserData();
      setIsEditing(false);
    } catch (error) {
      console.log('error', error);
      console.log('error', error?.response?.data?.phone_number);
      toast({
        title: "Error",
        description: "Error updating profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isEditing) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted/30 px-4 sm:px-6 lg:px-8 py-12 ">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-semibold text-primary mb-2">Edit Your Profile</h1>
            <p className="text-muted-foreound">Update your profile information below.</p>
          </div>

          <Card className="shadow-xl border bg-card">
            <CardHeader className="text-center pb-2">
              <div className="flex justify-center mb-4">
                <div className="relative">
                  <Avatar className="w-24 h-24 border-4 border-green-600 shadow-lg">
                    <AvatarImage
                      src={previewUrl || formData?.profile_picture}
                      alt="Profile"
                      className="object-cover"
                    />
                    <AvatarFallback className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground text-xs font-semibold">
                      Add Image
                    </AvatarFallback>
                  </Avatar>

                  <label
                    htmlFor="profilePicture"
                    className="absolute -bottom-2 -right-2 bg-green-600 hover:bg-primary/90 text-primary-foreground p-2 rounded-full cursor-pointer transition-all duration-300 hover:scale-105 shadow-lg"
                  >
                    <FaCamera className="w-4 h-4" />
                    <input
                      id="profilePicture"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleProfilePictureChange}
                      ref={imageRef}
                    />
                  </label>
                </div>
              </div>

              {errors?.profileImage && (
                <p className="text-sm text-destructive mb-2">{errors.profileImage}</p>
              )}

              <CardTitle className="text-xl">Profile Information</CardTitle>
              <CardDescription>Update your profile details below</CardDescription>
            </CardHeader>

            <CardContent className="space-y-6 pt-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Full Name</Label>
                    <Input
                      id="fullName"
                      value={formData.user_detail.full_name_en}
                      onChange={(e) => handleInputChange("user_detail.full_name_en", e.target.value)}
                      className="bg-muted"
                    />
                    {errors?.full_name_en && <p className="text-sm text-destructive">{errors.full_name_en}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email (Cannot be changed)</Label>
                    <Input
                      id="email"
                      value={formData.user_detail.email}
                      disabled
                      className="bg-muted"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number *</Label>
                    <Input
                      id="phone"
                      placeholder="Enter your phone number"
                      value={formData.user_detail.phone_number}
                      onChange={(e) => handleInputChange('user_detail.phone_number', e.target.value)}
                    />
                    {errors?.phone_number && <p className="text-sm text-destructive">{errors.phone_number}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="address">Address *</Label>
                    <Textarea
                      id="address"
                      placeholder="Enter your full address"
                      className="resize-none"
                      rows={3}
                      value={formData.address}
                      onChange={(e) => handleInputChange('address', e.target.value)}
                    />
                    {errors?.address && <p className="text-sm text-destructive">{errors.address}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="dateOfBirth">Date of Birth *</Label>
                    <DatePicker
                      value={formData.date_of_birth}
                      onChange={(value) => handleInputChange('date_of_birth', value)}
                      minDate={new Date(1950, 0, 1)}
                      maxDate={new Date()}
                    />
                    {errors?.date_of_birth && <p className="text-sm text-destructive">{errors.date_of_birth}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="sex">Gender *</Label>
                    <Select onValueChange={(value) => handleInputChange('sex', value)} value={formData.sex}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="MALE">Male</SelectItem>
                        <SelectItem value="FEMALE">Female</SelectItem>
                        <SelectItem value="OTHER">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors?.sex && <p className="text-sm text-destructive">{errors.sex}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="organization">Organization *</Label>
                    <Input
                      id="organization"
                      placeholder="Your organization name"
                      value={formData.organization}
                      onChange={(e) => handleInputChange('organization', e.target.value)}
                    />
                    {errors?.organization && <p className="text-sm text-destructive">{errors.organization}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="designation">Designation *</Label>
                    <Input
                      id="designation"
                      placeholder="Your job title"
                      value={formData.designation}
                      onChange={(e) => handleInputChange('designation', e.target.value)}
                    />
                    {errors?.designation && <p className="text-sm text-destructive">{errors.designation}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="employeeId">Employee ID *</Label>
                    <Input
                      id="employeeId"
                      placeholder="Your employee ID"
                      value={formData.employee_id}
                      onChange={(e) => handleInputChange('employee_id', e.target.value)}
                    />
                    {errors?.employee_id && <p className="text-sm text-destructive">{errors.employee_id}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="educationLevel">Education Level *</Label>
                    <Select
                      onValueChange={(value) => handleInputChange('education_level', value)}
                      value={formData.education_level}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select education level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="HIGH_SCHOOL">High School</SelectItem>
                        {/* <SelectItem value="DIPLOMA">Diploma</SelectItem> */}
                        <SelectItem value="BACHELORS">Bachelor's Degree</SelectItem>
                        <SelectItem value="MASTERS">Master's Degree</SelectItem>
                        <SelectItem value="PHD">PhD</SelectItem>
                        {/* <SelectItem value="OTHER">Other</SelectItem> */}
                      </SelectContent>
                    </Select>
                    {errors?.education_level && <p className="text-sm text-destructive">{errors.education_level}</p>}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="supportDocument">Support Document</Label>
                  <div className="flex items-center justify-center w-full">
                    <label
                      htmlFor="supportDocument"
                      className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-border rounded-lg cursor-pointer bg-muted/30 hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <FaUpload className="w-8 h-8 mb-3 text-muted-foreground" />
                        {supportDocumentName ? (
                          <p className="text-sm text-foreground font-medium">{supportDocumentName}</p>
                        ) : (
                          <>
                            <p className="mb-2 text-sm text-muted-foreground">
                              <span className="font-semibold">Click to upload</span> your support document
                            </p>
                            <p className="text-xs text-muted-foreground">PDF, DOC, DOCX (MAX. 10MB)</p>
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
                  {errors?.supportDocument && <p className="text-sm text-destructive">{errors.supportDocument}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    placeholder="Tell us a bit about yourself..."
                    className="resize-none"
                    rows={4}
                    value={formData.bio}
                    onChange={(e) => handleInputChange('bio', e.target.value)}
                  />
                </div>

                <div className="flex gap-4 pt-4">
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="flex-1 bg-blue text-primary-foreground hover:bg-blue/90 transform hover:scale-105 duration-300 transition"
                    size="lg"
                  >
                    <FaSave className="w-4 h-4 mr-2" />
                    {isLoading ? "Updating..." : "Save Changes"}
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCancelEdit}
                    disabled={isLoading}
                    size="lg"
                    className="transform hover:scale-105 hover:bg-destructive hover:text-destructive-foreground transition duration-300"
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
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3, delay: 0.15 }}
    >
      <div className="min-h-screen  px-4 sm:px-6 lg:px-8 py-12 ">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="relative overflow-hidden rounded-xl border text-gray-800 shadow-lg hover:shadow-xl transition-all duration-300">
            <div className="absolute inset-0 " />
            <div className="relative p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <h1 className="text-[18px] font-bold text-gray-800">{formData.user_detail.full_name_en}</h1>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6 text-gray-500">
                    <span className="flex items-center gap-2 text-sm">
                      <FaMapMarkerAlt />
                      {formData.address || "—"}
                    </span>
                    <span className="flex items-center gap-2 text-sm">
                      <FaPhone />
                      {formData.user_detail.phone_number || "—"}
                    </span>
                    <span className="flex items-center gap-2 text-sm">
                      <FaUser />
                      {formData.user_detail.email || "—"}
                    </span>
                  </div>
                </div>
                <button
                  onClick={handleEditClick}
                  className="group flex items-center gap-2 px-4 py-2 rounded-lg bg-blue/90 hover:bg-blue/80 text-primary-foreground transition-all duration-200 border border-primary/20"
                >
                  <FaEdit className="text-sm" />
                  <span className="text-sm font-medium">Edit</span>
                </button>
              </div>
            </div>
          </div>

          <div className="rounded-xl border bg-card shadow-lg overflow-hidden">
            <div className="p-8">
              <div className="flex flex-col lg:flex-row gap-8">
                <div className="flex flex-col items-center lg:items-start space-y-4">
                  <div className="relative group rounded-full border-4 border-green-600">
                    <img
                      src={formData.profile_picture || null}
                      alt={formData.user_detail.full_name_en || "Profile"}
                      className="w-32 h-32 rounded-full border-4 border-primary/20 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </div>
                  <div className="text-center lg:text-left">
                    <h2 className="text-xl font-semibold text-card-foreground">
                      {formData.designation || "—"}
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      {formData.organization || "—"}
                    </p>
                  </div>
                </div>

                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-card-foreground mb-6 flex items-center gap-2">
                    <FaUser className="text-primary" />
                    Personal Information
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <DetailItem icon={<FaBirthdayCake />} label="Date of Birth" value={formData.date_of_birth || "—"} />
                    <DetailItem
                      icon={<FaVenusMars />}
                      label="Gender"
                      value={
                        formData.sex === 'MALE' ? 'Male' :
                          formData.sex === 'FEMALE' ? 'Female' :
                            formData.sex ? 'Other' : '—'
                      }
                    />
                    <DetailItem icon={<FaBuilding />} label="Organization" value={formData.organization || "—"} />
                    <DetailItem icon={<FaIdBadge />} label="Employee ID" value={formData.employee_id || "—"} />
                    <DetailItem
                      icon={<FaGraduationCap />}
                      label="Education"
                      value={
                        formData.education_level === 'BACHELORS' ? "Bachelor's Degree" :
                          formData.education_level === 'MASTERS' ? "Master's Degree" :
                            formData.education_level === 'HIGH_SCHOOL' ? "High School" :
                              formData.education_level === 'DIPLOMA' ? "Diploma" : ""

                      }
                    />
                    <DetailItemDocument
                      icon={<FaFileAlt />}
                      label="Document"
                      value={formData.support_document || "No document uploaded"}
                      className="group cursor-pointer hover:bg-accent/50 -mx-2 px-2 py-2 rounded-lg transition-colors"
                    />
                  </div>

                  <div className="mt-8 p-4 rounded-lg bg-muted/30 border">
                    <DetailItem
                      icon={<FaInfoCircle />}
                      label="Bio"
                      value={formData.bio || "No bio available"}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <ToastContainer />
    </motion.div>

  );
};

export default UserProfile;

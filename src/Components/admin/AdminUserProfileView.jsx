import React, { useState, useEffect, useContext, useCallback } from 'react';
import {
  FaUser, FaMapMarkerAlt, FaPhone, FaBirthdayCake,
  FaVenusMars, FaBuilding, FaIdBadge, FaFileAlt,
  FaGraduationCap, FaInfoCircle, FaEye, FaEnvelope,
  FaArrowLeft, FaUserCircle
} from "react-icons/fa";
import { toast, ToastContainer } from 'react-toastify';
import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card";
import { Button } from "@/Components/ui/button";
import useAxiosAuth from '@/hooks/useAxiosAuth';
import AuthContext from '@/context/AuthContext';
import { motion } from 'framer-motion';
import { useNavigate, useParams } from 'react-router-dom';
import images from '@/assets/images';

/* Reusable Detail Item Component */
const DetailItem = ({ label, value, className = "" }) => (
  <div className={`flex items-start gap-3 group ${className}`}>
    <div className="min-w-0 flex-1">
      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{label}</p>
      <p className="text-sm font-medium text-foreground mt-1 break-words">{value}</p>
    </div>
  </div>
);

const DetailItemDocument = ({ label, value, className = "" }) => {
  const hasDocument = Boolean(value);

  return (
    <div className={`flex items-start gap-3 group ${className}`}>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          {label}
        </p>
        {hasDocument ? (
          <a
            href={value}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-1 text-primary hover:text-blue flex items-center gap-1 text-sm font-medium"
          >
            <FaEye className="inline-block" /> View Document
          </a>
        ) : (
          <p className="text-sm font-medium text-muted-foreground mt-1">
            No document uploaded
          </p>
        )}
      </div>
    </div>
  );
};

const AdminUserProfileView = () => {
  const [isLoading, setIsLoading] = useState(false);
  const api = useAxiosAuth?.() || null;
  const navigate = useNavigate();
  const { userId } = useParams(); // Get user ID from URL params
  const { authTokens, authReady } = useContext(AuthContext) || {};

  const [userData, setUserData] = useState({
    id: null,
    full_name_en: "",
    phone_number: "",
    email: "",
    profile_data: {
      id: null,
      address: "",
      profile_picture: "",
      bio: "",
      designation: "",
      organization: "",
      employee_id: "",
      support_document: "",
      education_level: "",
      sex: "",
      date_of_birth: "",
      user: null,
      user_detail: {
        full_name_en: "",
        email: "",
        phone_number: "",
        role: ""
      }
    }
  });

  const fetchUserData = useCallback(async () => {
    if (!authReady || !authTokens || !api || !userId) return;

    try {
      setIsLoading(true);
      const response = await api.get(`/api/account/user-details/${userId}/`);
      console.log('User data:', response.data);
      setUserData(response.data);
    } catch (error) {
      console.error('Error fetching user data:', error);
      toast.error('Failed to load user profile');
      // If user not found or unauthorized, redirect back
      if (error.response?.status === 404 || error.response?.status === 403) {
        navigate('/admin/users'); // Adjust path as needed
      }
    } finally {
      setIsLoading(false);
    }
  }, [api, authReady, authTokens, userId, navigate]);

  useEffect(() => {
    fetchUserData();
  }, [fetchUserData]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const getEducationLabel = (level) => {
    switch (level) {
      case 'BACHELORS': return "Bachelor's Degree";
      case 'MASTERS': return "Master's Degree";
      case 'HIGH_SCHOOL': return "High School";
      case 'DIPLOMA': return "Diploma";
      default: return level || "—";
    }
  };

  const getGenderLabel = (sex) => {
    switch (sex) {
      case 'MALE': return 'Male';
      case 'FEMALE': return 'Female';
      case 'OTHER': return 'Other';
      default: return '—';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading user profile...</p>
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
      <div className="min-h-screen px-4 sm:px-6 lg:px-8 md:py-12 mt-10">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Single Container for Profile */}
          <div className="rounded-xl border bg-card shadow-lg overflow-hidden">
            <div className="p-8">
              <div className="flex flex-col lg:flex-row gap-8">
                {/* Profile Picture and Basic Info */}
                <div className="flex flex-col items-center lg:items-start space-y-4">
                  <div className="relative group rounded-full border-4 border-green-600">
                    <img
                      src={userData.profile_data?.profile_picture || images.profile}
                      alt={userData.full_name_en || "Profile"}
                      className="w-32 h-32 rounded-full border-4 border-primary/20 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-t from-black/20 to-transparent opacity-0 transition-opacity duration-300" />
                  </div>
                  <div className="flex flex-col">
                    <h1 className="text-[18px] font-bold text-gray-800">
                      {userData.full_name_en}
                    </h1>
                    <div className="text-center lg:text-left">
                      <h2 className="text-[13px] font-medium text-card-foreground">
                        {userData.profile_data?.designation || ""}
                      </h2>
                      <p className="text-[11px] text-muted-foreground">
                        {userData.profile_data?.organization || ""}
                      </p>
                      {/* <p className="text-[10px] text-muted-foreground mt-1">
                        User ID: {userData.id}
                      </p>
                      <span className="inline-block mt-1 px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                        {userData.profile_data?.user_detail?.role || "USER"}
                      </span> */}
                    </div>
                  </div>
                </div>

                {/* Profile Information */}
                <div className="flex-1">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold text-card-foreground mb-6 flex items-center gap-2">
                      Personal Information
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <DetailItem
                      label="Email"
                      value={userData.email || "—"}
                    />
                    <DetailItem
                      label="Phone Number"
                      value={userData.phone_number || "—"}
                    />
                    <DetailItem
                      label="Date of Birth"
                      value={userData.profile_data?.date_of_birth || "—"}
                    />
                    <DetailItem
                      label="Gender"
                      value={getGenderLabel(userData.profile_data?.sex)}
                    />
                    <DetailItem
                      label="Organization"
                      value={userData.profile_data?.organization || "—"}
                    />
                    <DetailItem
                      label="Employee ID"
                      value={userData.profile_data?.employee_id || "—"}
                    />
                    <DetailItem
                      label="Address"
                      value={userData.profile_data?.address || "—"}
                    />
                    <DetailItem
                      label="Education"
                      value={getEducationLabel(userData.profile_data?.education_level)}
                    />
                    <DetailItemDocument
                      label="Document"
                      value={userData.profile_data?.support_document || "No document uploaded"}
                      className="group cursor-pointer hover:bg-accent/50 -mx-2 px-2 py-2 rounded-lg transition-colors"
                    />
                  </div>

                  {/* Bio Section */}
                  <div className="mt-8 p-4 rounded-lg bg-muted/30 border">
                    <DetailItem
                      label="Bio"
                      value={userData.profile_data?.bio || "No bio available"}
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

export default AdminUserProfileView;
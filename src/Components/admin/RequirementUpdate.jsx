import React, { useContext, useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import DatePicker from '@/utils/DatePicker';
import { motion } from 'framer-motion'
import { toast, ToastContainer } from 'react-toastify'
import {
  MdTextFields,
  MdEmail,
  MdAttachFile,
  MdDescription,
  MdNumbers,
  MdPhone,
  MdCalendarToday,
  MdCheckBox,
  MdLink,
  MdEdit,
  MdNotes
} from 'react-icons/md';
import {FaTimes} from 'react-icons/fa'
import AuthContext from '@/context/AuthContext';
import useAxiosAuth from '@/hooks/useAxiosAuth';

const fieldTypeIcons = {
  text: MdTextFields,
  email: MdEmail,
  file: MdAttachFile,
  textarea: MdDescription,
  number: MdNumbers,
  phone: MdPhone,
  date: MdCalendarToday,
  checkbox: MdCheckBox
};

export const RequirementUpdate = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { authTokens, authReady } = useContext(AuthContext);
  const api = useAxiosAuth();

  // Extract requirement ID from URL path
  const { id } = useParams();
  const requirementId = id;

  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [requirement, setRequirement] = useState({
    event: null,
    event_name: "",
    type: 'TEXT',
    label: '',
    description: '',
    file: null,
    is_active: false,
    deadline: null
  });

  // Store existing file info
  const [existingFile, setExistingFile] = useState(null);

  // Validation errors state
  const [errors, setErrors] = useState({
    event: '',
    type: '',
    label: '',
    deadline: '',
    file: ''
  });

  // Keep requirement.event in sync with selectedEvent (store id)
  useEffect(() => {
    setRequirement(prev => ({
      ...prev,
      event: selectedEvent ? selectedEvent.id : null
    }));
  }, [selectedEvent]);

  // Fetch events and requirement data
  useEffect(() => {
    if (!authTokens || !authReady || !requirementId) return;

    const fetchData = async () => {
      try {
        setInitialLoading(true);

        // Fetch active events
        const eventsRes = await api.get('/api/event/active-events/');
        setEvents(eventsRes.data);

        // Fetch requirement details
        const requirementRes = await api.get(`/api/event/requirement-update/${requirementId}/`);
        const reqData = requirementRes.data;

        console.log('Fetched requirement data:', reqData);

        // Find the event for this requirement
        const eventForReq = eventsRes.data.find(e => e.id === reqData.event);
        setSelectedEvent(eventForReq || null);

        // Parse deadline if it exists
        let deadlineValue = null;
        if (reqData.deadline) {
          deadlineValue = new Date(reqData.deadline);
          // Check if date is valid
          if (isNaN(deadlineValue.getTime())) {
            deadlineValue = null;
          }
        }

        // Set requirement data
        setRequirement({
          event_name: reqData.event_name,
          event: reqData.event,
          type: reqData.type || 'TEXT',
          label: reqData.label || '',
          description: reqData.description || '',
          file: null, // We'll handle existing file separately
          is_active: reqData.is_active || false,
          is_verification_required: reqData.is_verification_required || false,
          deadline: deadlineValue
        });

        // Store existing file info if present
        if (reqData.file) {
          setExistingFile({
            url: reqData.file,
            name: reqData.file.split('/').pop() // Extract filename from URL
          });
        }

      } catch (err) {
        console.error('Failed to fetch data:', err);
        // alert('Failed to load requirement data. Please try again.');
        navigate('/requirements'); // Navigate back if fetch fails
      } finally {
        setInitialLoading(false);
      }
    };

    fetchData();
  }, [authReady, authTokens, api, requirementId, navigate]);

  const getFieldTypeIcon = (type) => {
    const IconComponent = fieldTypeIcons[type];
    return IconComponent ? <IconComponent className="h-4 w-4" /> : <MdTextFields className="h-4 w-4" />;
  };

  const formatDateForAPI = (value) => {
    if (!value) return null;
    if (typeof value === 'string') return value;
    if (value instanceof Date && !isNaN(value)) {
      const y = value.getFullYear();
      const m = String(value.getMonth() + 1).padStart(2, '0');
      const d = String(value.getDate()).padStart(2, '0');
      return `${y}-${m}-${d}`;
    }
    return null;
  };

  // Clear specific error when user starts typing/selecting
  const clearError = (field) => {
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  // Validation function
  const validateForm = () => {
    const newErrors = {
      event: '',
      type: '',
      label: '',
      deadline: '',
      file: ''
    };

    // Event validation
    if (!requirement.event) {
      newErrors.event = "Event selection is required";
    }

    // Type validation
    if (!requirement.type) {
      newErrors.type = "Requirement type is required";
    }

    // Label validation
    if (!requirement.label || requirement.label.trim() === '') {
      newErrors.label = "Field label is required";
    }

    // Deadline validation
    if (!requirement.deadline) {
      newErrors.deadline = "Deadline is required";
    }

    // File validation for FILE type (only if no existing file and no new file)
    if (requirement.type === 'FILE' && !requirement.file && !existingFile) {
      newErrors.file = "File is required for file upload type";
    }

    setErrors(newErrors);

    // Return true if no errors
    return Object.values(newErrors).every(error => error === '');
  };

  const updateRequirement = async () => {
    // Validate form
    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append('event_name', requirement.event_name);
      formData.append('event', requirement.event);
      formData.append('type', requirement.type || '');
      formData.append('label', requirement.label || '');
      formData.append('description', requirement.description || '');
      formData.append('is_verification_required', String(!!requirement.is_verification_required));
      formData.append('is_active', String(!!requirement.is_active));

      const deadline = formatDateForAPI(requirement.deadline);
      if (deadline) formData.append('deadline', deadline);

      // Only append file if a new file is selected
      if (requirement.file) {
        formData.append('file', requirement.file);
      }
      console.log('Updated data to be sent')
      formData.forEach((value, key) => {
        console.log(key, value);
      });

      const res = await api.put(`/api/event/requirement-update/${requirementId}/`, formData);
      const data = res.data;
      console.log('requirement update', data);

      console.log('Updating payload (FormData):', {
        event: requirement.event,
        type: requirement.type,
        label: requirement.label,
        description: requirement.description,
        is_active: requirement.is_active,
        deadline,
        file: requirement.file ? requirement.file.name : 'no new file',
      });

      // Success handling
      toast.success('Requirement updated successfully!');
      setTimeout(() => {
        navigate(-1);
      }, 1000);

    } catch (err) {
      console.error('Failed to update requirement:', err);

      // Handle specific error messages from server
      if (err.response && err.response.data) {
        const errorData = err.response.data;
        console.log('Server error:', errorData);

        // If server returns field-specific errors, update the errors state
        if (typeof errorData === 'object') {
          const newErrors = { ...errors };
          Object.keys(errorData).forEach(key => {
            if (newErrors.hasOwnProperty(key)) {
              newErrors[key] = Array.isArray(errorData[key])
                ? errorData[key].join(', ')
                : errorData[key];
            }
          });
          setErrors(newErrors);
        }
      }

    } finally {
      setLoading(false);
    }
  };

  // Show loading spinner while fetching initial data
  if (initialLoading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen bg-gradient-to-br from-background via-primary-soft to-background p-20 flex items-center justify-center"
      >
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading requirement data...</p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6 pt-4 pb-8 px-12"
    >
      <div className="min-h-screen bg-gradient-to-br from-background via-primary-soft to-background pt-14">
        <div className="max-w-6xl mx-auto space-y-8">



          {/* Single Requirement */}
          <Card className="shadow-lg border-0 bg-gradient-to-r from-card to-primary-soft/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                Participant Requirement
              </CardTitle>
              <CardDescription>
                Update the requirement participants must complete
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Field Type + Label */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Field Type */}
                <div className="space-y-2">
                  <Label>Requirement Type</Label>
                  <Select
                    value={requirement.type}
                    onValueChange={(value) => {
                      setRequirement({ ...requirement, type: value });
                      clearError('type');
                    }}
                  >
                    <SelectTrigger className={`border-event-primary/20 ${errors.type ? 'border-red-500' : ''}`}>
                      <div className="flex items-center gap-2">
                        <SelectValue />
                      </div>
                    </SelectTrigger>
                    <SelectContent
                      position="popper"
                      side="bottom"
                      align="start"
                      className="w-full max-w-[var(--radix-select-trigger-width)] z-50"
                      sideOffset={4}
                      portalled={true}
                    >
                      <SelectItem value="TEXT">
                        <div className="flex items-center gap-2">
                          <MdTextFields className="h-4 w-4" /> Text Field
                        </div>
                      </SelectItem>
                      <SelectItem value="TEXTAREA">
                        <div className="flex items-center gap-2">
                          <MdNotes className="h-4 w-4" /> Text Area
                        </div>
                      </SelectItem>
                      <SelectItem value="FILE">
                        <div className="flex items-center gap-2">
                          <MdAttachFile className="h-4 w-4" /> File Upload
                        </div>
                      </SelectItem>
                      <SelectItem value="URL">
                        <div className="flex items-center gap-2">
                          <MdLink className="h-4 w-4" /> URL
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.type && (
                    <p className='text-red-500 text-[12px] mt-1'>{errors.type}</p>
                  )}
                </div>

                {/* Field Label */}
                <div className="space-y-2">
                  <Label>Field Label</Label>
                  <Input
                    placeholder="Enter field label..."
                    value={requirement.label}
                    onChange={(e) => {
                      setRequirement({ ...requirement, label: e.target.value });
                      clearError('label');
                    }}
                    className={`border-event-primary/20 focus:border-event-primary ${errors.label ? 'border-red-500' : ''}`}
                  />
                  {errors.label && (
                    <p className='text-red-500 text-[12px] mt-1'>{errors.label}</p>
                  )}
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label>Field Description (Optional)</Label>
                <Textarea
                  placeholder="Add helpful description for this field..."
                  value={requirement.description}
                  onChange={(e) => setRequirement({ ...requirement, description: e.target.value })}
                  className="border-event-primary/20 focus:border-event-primary resize-none h-[150px]"
                  rows={2}
                />
              </div>

              {/* Deadline */}
              <div className="space-y-2">
                <Label>Deadline</Label>
                <DatePicker
                  value={requirement.deadline}
                  onChange={(value) => {
                    setRequirement({ ...requirement, deadline: value });
                    clearError('deadline');
                  }}
                  minDate={new Date()}
                  maxDate={new Date(2040, 12, 30)}
                />
                {errors.deadline && (
                  <p className='text-red-500 text-[12px] mt-1'>{errors.deadline}</p>
                )}
              </div>

              {/* File Upload (admin chooses a photo) */}
              <div className="space-y-2">
                <Label htmlFor="req-file">
                  Attach Photo {requirement.type === 'FILE' ? '(required)' : '(optional)'}
                </Label>

                {/* Show existing file info */}
                {existingFile && (
                  <div className="p-3 bg-gray-50 rounded-md border">
                    <p className="text-sm text-gray-600 mb-2">Current file:</p>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-800">{existingFile.name}</span>
                      <a
                        href={existingFile.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 text-sm"
                      >
                        View
                      </a>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Upload a new file to replace the current one</p>
                  </div>
                )}

                <Input
                  id="req-file"
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const f = e.target.files && e.target.files[0] ? e.target.files[0] : null;
                    setRequirement({ ...requirement, file: f });
                    clearError('file');
                  }}
                  className={`border-event-primary/20 focus:border-event-primary ${errors.file ? 'border-red-500' : ''}`}
                />
                {errors.file && (
                  <p className='text-red-500 text-[12px] mt-1'>{errors.file}</p>
                )}
              </div>

              <div className="space-y-1">
                <label htmlFor="is_verification_required" className="flex items-center gap-2 leading-[14px]">
                  <input
                    type="checkbox"
                    id="is_verification_required"
                    checked={requirement.is_verification_required || false}
                    onChange={e => setRequirement({
                      ...requirement,
                      is_verification_required: e.target.checked
                    })}
                    className="accent-blue-600 h-[40px]"
                  />
                  <span className="text-sm font-medium leading:[14px]">Admin verification required</span>
                </label>
                <p className="text-xs text-gray-500">
                  If checked, this requirement must be verified by an admin after submission.
                </p>
              </div>

              {/* Active Status */}
              <div className="space-y-2">
                <Label>Active Status</Label>
                <div className="flex items-center space-x-2 pt-2">
                  <Switch
                    checked={requirement.is_active}
                    onCheckedChange={(checked) => setRequirement({ ...requirement, is_active: checked })}
                    className={requirement.is_active ? "data-[state=checked]:bg-green-600" : "data-[state=unchecked]:bg-gray-400"}
                  />
                  <button
                    className={`text-xs rounded font-medium px-2 py-1 ${requirement.is_active
                      ? "bg-green-100 text-green-800"
                      : "bg-gray-100 text-gray-800"
                      }`}
                  >
                    {requirement.is_active ? "Active" : "Inactive"}
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex justify-center gap-4 pt-6">


            <Button
              onClick={updateRequirement}
              disabled={loading}
              className="flex-1 bg-blue transition-all duration-300 hover:scale-[1.02] text-primary-foreground hover:bg-blue/90"
              size="lg"
            >
              {loading ? 'Updating...' : 'Update Requirement'}
            </Button>
            <Button
              onClick={() => navigate(-1)}
              disabled={loading}
              size="lg"
              className="hover:bg-destructive text-white hover:text-destructive-foreground transition-all duration-300 hover:scale-[1.02] bg-red-800"
            >  <FaTimes className="w-4 h-4 mr-2" />
              Cancel
            </Button>
          </div>

        </div>
      </div>
      <ToastContainer />
    </motion.div>
  );
};
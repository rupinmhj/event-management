import React, { useContext, useEffect, useState } from 'react';
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
import {
  MdTextFields,
  MdEmail,
  MdAttachFile,
  MdDescription,
  MdNumbers,
  MdPhone,
  MdCalendarToday,
  MdCheckBox,
  MdLink
} from 'react-icons/md';
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

export const RequirementSetup = () => {
  const { authTokens, authReady } = useContext(AuthContext);
  const api = useAxiosAuth();

  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [loading, setLoading] = useState(false);
  const [requirement, setRequirement] = useState({
    event: null,
    type: 'TEXT',
    label: '',
    description: '',
    file: null,
    is_active: false,
    deadline: null
  });

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

  useEffect(() => {
    if (!authTokens || !authReady) return;

    const fetchData = async () => {
      try {
        const res = await api.get('/api/event/event-list/');
        setEvents(res.data);
        console.log('Event list:', res.data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchData();
  }, [authReady, authTokens, api]);

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

    // File validation for FILE type
    if (requirement.type === 'FILE' && !requirement.file) {
      newErrors.file = "File is required for file upload type";
    }

    setErrors(newErrors);

    // Return true if no errors
    return Object.values(newErrors).every(error => error === '');
  };

  const saveRequirement = async () => {
    // Validate form
    if (!validateForm()) {
      return;
    }
    
    try {
      setLoading(true);
      const formData = new FormData();
      formData.append('event', requirement.event);
      formData.append('type', requirement.type || '');
      formData.append('label', requirement.label || '');
      formData.append('description', requirement.description || '');
      formData.append('is_active', String(!!requirement.is_active));
      const deadline = formatDateForAPI(requirement.deadline);
      if (deadline) formData.append('deadline', deadline);
      if (requirement.file) formData.append('file', requirement.file);

      formData.forEach((value, key) => {
        console.log(key, value);
      });

      const res = await api.post('/api/event/requirements/', formData);
      const data = res.data;
      console.log('requirement post', data);

      console.log('Posting payload (FormData):', {
        event: requirement.event,
        type: requirement.type,
        label: requirement.label,
        description: requirement.description,
        is_active: requirement.is_active,
        deadline,
        file: requirement.file ? requirement.file.name : null,
      });

      // Reset form on success
      setRequirement({
        event: null,
        type: 'TEXT',
        label: '',
        description: '',
        file: null,
        is_active: false,
        deadline: null
      });
      setSelectedEvent(null);
      setErrors({
        event: '',
        type: '',
        label: '',
        deadline: '',
        file: ''
      });

      // Success handling here (toast, navigate, etc.)
      alert('Requirement saved successfully!');

    } catch (err) {
      console.error('Failed to save requirement:', err);
      // Error handling (toast, etc.)
      alert('Failed to save requirement. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6 pt-4 pb-8 px-12"
    >
      <div className="min-h-screen bg-gradient-to-br from-background via-primary-soft to-background p-20">
        <div className="max-w-4xl mx-auto space-y-8">

          {/* Header */}
          <div className="text-center space-y-4">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-400 rounded-xl shadow-lg">
              <MdDescription className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-[30px] font-bold text-gray-800">
                Event Requirement Setup
              </h1>
              <p className="text-muted-foreground text-md mt-2">
                Configure the information participants need to provide for your event
              </p>
            </div>
          </div>

          {/* Event Selection */}
          <Card className="shadow-lg border-0 bg-gradient-to-r from-card to-primary-soft/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MdCalendarToday className="h-5 w-5 text-event-primary" />
                Event Information
              </CardTitle>
              <CardDescription>
                Select the event for which this requirement applies *
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="event-select">Event</Label>
                <Select
                  value={selectedEvent ? selectedEvent.id.toString() : ''}
                  onValueChange={(value) => {
                    const ev = events.find(e => e.id === parseInt(value));
                    setSelectedEvent(ev || null);
                    clearError('event');
                  }}
                >
                  <SelectTrigger 
                    id="event-select" 
                    className={`border-event-primary/20 ${errors.event ? 'border-red-500' : ''}`}
                  >
                    <SelectValue placeholder="Select an event..." />
                  </SelectTrigger>
                  <SelectContent position="popper" className='w-full'>
                    {events.map((ev) => (
                      <SelectItem key={ev.id} value={ev.id.toString()}>
                        {ev.title} ({ev.event_type})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.event && (
                  <p className='text-red-500 text-[12px] mt-1'>{errors.event}</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Single Requirement */}
          <Card className="shadow-lg border-0 bg-gradient-to-r from-card to-primary-soft/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MdTextFields className="h-5 w-5 text-event-secondary" />
                Participant Requirement
              </CardTitle>
              <CardDescription>
                Configure the single requirement participants must complete
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

          {/* Save Button */}
          <div className="flex justify-center">
            <button
              onClick={saveRequirement}
              disabled={loading}
              className={`rounded-lg shadow-lg px-8 py-3 text-md text-white cursor-pointer
                ${loading ? 'bg-opacity-50 cursor-not-allowed' : 'bg-blue hover:bg-blue/80'}`}
            >
              {loading ? 'Saving...' : 'Save Requirement'}
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
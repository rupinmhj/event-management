import React, { useState } from 'react';
import { X, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

const SubmissionModal = ({ isOpen, onClose, event, requirement, onSubmit }) => {
    const [value, setValue] = useState('');
    const [file, setFile] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');

  const handleSubmit = async (e) => {
  e.preventDefault();

  // Validation
  if (requirement.type === 'FILE' && !file) {
    setError('Please select a file to upload.');
    return;
  }
  if (requirement.type !== 'FILE' && (!value || !value.trim())) {
    setError('Please provide a value for this requirement.');
    return;
  }
  if (requirement.type === 'URL' && value) {
    const urlPattern = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w\.-]*)*\/?$/;
    if (!urlPattern.test(value)) {
      setError('Please enter a valid URL');
      return;
    }
  }

  setIsSubmitting(true);
  setError('');

  try {
    // ✅ Use FormData since file upload is possible
    const formData = new FormData();
    formData.append("event_id", event.id);

    // Build the response object
    formData.append("responses[0][requirement_id]", requirement.id);

    if (requirement.type === "FILE") {
      formData.append("responses[0][file]", file);
    } else {
      formData.append("responses[0][value]", value);
    }

    await onSubmit(formData);

    // Reset
    setValue('');
    setFile(null);
    onClose();
  } catch (error) {
    setError('Failed to submit. Please try again.');
  } finally {
    setIsSubmitting(false);
  }
};


    const handleFileChange = (e) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            // File size validation (10MB)
            if (selectedFile.size > 10 * 1024 * 1024) {
                setError('File size must be less than 10MB');
                return;
            }
            setFile(selectedFile);
            setError('');
        }
    };

    const handleClose = () => {
        setValue('');
        setFile(null);
        setError('');
        onClose();
    };

    if (!requirement || !event) return null;

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-md bg-white border border-gray-200">
                <DialogHeader>
                    <DialogTitle className="text-xl font-semibold text-gray-900">
                        Submit {requirement.label}
                    </DialogTitle>
                    <p className="text-sm text-gray-600">
                        Event: {event.title}
                    </p>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <Label htmlFor="requirement-input" className="text-gray-900 font-medium">
                            {requirement.label}
                        </Label>
                        <p className="text-sm text-gray-600 mb-3">
                            {requirement.description}
                        </p>

                        {requirement.type === 'FILE' ? (
                            <div className="space-y-2">
                                <div className="flex items-center justify-center w-full">
                                    <label
                                        htmlFor="file-upload"
                                        className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors"
                                    >
                                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                            <Upload className="w-8 h-8 mb-4 text-gray-400" />
                                            <p className="mb-2 text-sm text-gray-500">
                                                <span className="font-semibold">Click to upload</span> or drag and drop
                                            </p>
                                            <p className="text-xs text-gray-500">
                                                PDF, DOC, DOCX, or images (MAX. 10MB)
                                            </p>
                                        </div>
                                        <input
                                            id="file-upload"
                                            type="file"
                                            className="hidden"
                                            onChange={handleFileChange}
                                            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif"
                                        />
                                    </label>
                                </div>
                                {file && (
                                    <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                                        <p className="text-sm text-green-700">
                                            ✓ Selected: {file.name}
                                        </p>
                                    </div>
                                )}
                            </div>
                        ) : requirement.type === 'URL' ? (
                            <Input
                                id="requirement-input"
                                type="url"
                                placeholder="https://example.com"
                                value={value}
                                onChange={(e) => setValue(e.target.value)}
                                className="bg-white border-gray-300 focus:border-blue-500"
                            />
                        ) : (
                            <Textarea
                                id="requirement-input"
                                placeholder="Enter your text here..."
                                value={value}
                                onChange={(e) => setValue(e.target.value)}
                                rows={4}
                                className="bg-white border-gray-300 focus:border-blue-500 resize-none"
                            />
                        )}
                    </div>

                    {requirement.deadline && (
                        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                            <p className="text-sm text-blue-700">
                                ⏰ Deadline: {new Date(requirement.deadline).toLocaleDateString('en-US', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric',
                                    
                                })}
                            </p>
                        </div>
                    )}

                    {error && (
                        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                            <p className="text-sm text-red-600">
                                ⚠️ {error}
                            </p>
                        </div>
                    )}

                    <div className="flex gap-3 pt-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleClose}
                            className="flex-1 border-gray-300  hover:bg-red-600 text-white hover:text-white bg-red-500"
                            disabled={isSubmitting}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            className="flex-1 bg-blue hover:bg-blue/80 text-white"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                    Submitting...
                                </>
                            ) : (
                                'Submit'
                            )}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default SubmissionModal;
import React, { useState, useEffect } from 'react';
import { X, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Eye } from 'lucide-react';
import JoditEditor from 'jodit-react';
import 'jodit/es2021/jodit.min.css';
const SubmissionModal = ({
    isOpen,
    onClose,
    event,
    requirement,
    response, // Contains existing response/participation data
    participationId, // ID for updating
    isEditMode,
    onSubmit
}) => {
    const [value, setValue] = useState('');
    const [file, setFile] = useState(null);
    const [existingFileName, setExistingFileName] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');

    // Prefill fields when modal opens with existing data
    useEffect(() => {
        if (isOpen && response) {
            console.log('Prefilling with response data:', response);

            // Set text value if exists
            if (response.value) {
                setValue(response.value);
            }

            // Set existing file name if exists
            if (response.file) {
                const fileName = response.file.split('/').pop();
                setExistingFileName(fileName);
            }
        } else if (isOpen && !response) {
            // Reset form for new submissions
            setValue('');
            setFile(null);
            setExistingFileName('');
        }
    }, [isOpen, response]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validation
        if (requirement.type === 'FILE' && !file && !existingFileName) {
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
            const formData = new FormData();
            formData.append("event_id", event.id);

            // Add participation ID if editing
            if (isEditMode && participationId) {
                formData.append("participation_id", participationId);
            }

            formData.append("responses[0][requirement_id]", requirement.id);

            if (requirement.type === "FILE") {
                // Only append file if a new file is selected
                if (file) {
                    formData.append("responses[0][file]", file);
                }
                // If editing and no new file selected, the backend should keep the existing file
            } else {
                formData.append("responses[0][value]", value);
            }

            await onSubmit(formData);

            // Reset form
            setValue('');
            setFile(null);
            setExistingFileName('');
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
        setExistingFileName('');
        setError('');
        onClose();
    };

    if (!requirement || !event) return null;

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="max-w-[80dvw] h-[80dvh] max-sm:w-[100dvw] bg-white border border-gray-200 ">
                <DialogHeader>
                    {/* <DialogTitle className="text-xl font-semibold text-gray-900">
                        {isEditMode ? 'Edit Submission' : 'Submit'} {requirement.label}
                    </DialogTitle> */}
                    <p className="text-[16px] text-blue/90 font-semibold">
                        Event: {event.title}
                    </p>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <Label htmlFor="requirement-input" className="text-gray-900 font-medium">
                            {requirement.label}
                        </Label>
                        <p className="text-[12px] text-gray-700 mb-3">
                            {requirement.description}
                        </p>

                        {requirement.type === 'FILE' ? (
                            <div className="space-y-2">
                                {/* Show existing file if available */}
                                {existingFileName && response?.file && !file && (
                                    <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                        <a
                                            href={response.file}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center text-blue text-sm hover:text-blue/80 "
                                        >
                                            <Eye className="w-4 h-4 mr-2" />
                                            View current file
                                        </a>
                                        <p className="text-xs text-blue-600 mt-1">
                                            Upload a new file to replace this one
                                        </p>
                                    </div>
                                )}

                                <div className="flex items-center justify-center w-full">
                                    <label
                                        htmlFor="file-upload"
                                        className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors"
                                    >
                                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                            <Upload className="w-8 h-8 mb-4 text-gray-400" />
                                            <p className="mb-2 text-sm text-gray-500">
                                                <span className="font-semibold">
                                                    {existingFileName ? 'Click to replace file' : 'Click to upload'}
                                                </span> or drag and drop
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

                                {/* Show newly selected file */}
                                {file && (
                                    <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                                        <p className="text-sm text-green-700">
                                            ✓ New file selected: {file.name}
                                        </p>
                                        {existingFileName && (
                                            <p className="text-xs text-green-600 mt-1">
                                                This will replace: {existingFileName}
                                            </p>
                                        )}
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
                        ) : requirement.type==='TEXTAREA'?(
                            <div className="relative">
 <JoditEditor
                                    value={value || ''}
                                    config={{
                                        readonly: false,
                                        height: 250,
                                        removeButtons: [
                                            'source', 'image', 'file', 'video', 'speechRecognize',
                                            'print', 'about', 'fullsize', 'selectall',
                                            'symbol', 'copyformat', 'preview', 'find', 'emoticons',
                                            'brush', 'fontsize', 'paragraph', 'link', 'table', 'hr', 'classSpan', 'superscript', 'subscript'
                                        ],
                                        style: {
                                            backgroundColor: '#ffffff',
                                            color: '#000000',
                                            paddingLeft: '50px',
                                            fontSize: '14px'
                                        },

                                    }}
                                    onBlur={(newContent) => {
                                        setHtmlMessage(newContent || '');
                                    }}
                                />
                                                                <div className="absolute w-full bottom-0 h-[20px] bg-white dark:bg-[#5f5c5c]"> </div>

                            </div>
                            
                        ):
                            (
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

                    <div className="flex gap-3 pt-4  fixed bottom-0 left-0 right-0 px-4 py-6 bg-white">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleClose}
                            className="flex-1 border-gray-300 hover:bg-red-600 text-white hover:text-white bg-red-500"
                            disabled={isSubmitting}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            className={`flex-1 text-white ${isEditMode
                                    ? 'bg-orange-600 hover:bg-orange-700'
                                    : 'bg-blue hover:bg-blue/80'
                                }`}
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                    {isEditMode ? 'Updating...' : 'Submitting...'}
                                </>
                            ) : (
                                isEditMode ? 'Update' : 'Submit'
                            )}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default SubmissionModal;
import React from 'react';
import { X, Eye, FileText, Link, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';

const ViewSubmissionModal = ({
    isOpen,
    onClose,
    requirement,
    response,
    event
}) => {
    if (!requirement || !response) return null;

    const getStatusBadge = (status) => {
        switch (status) {
            case 'approved':
                return <Badge className="bg-green-100 text-green-800 text-xs">Approved</Badge>;
            case 'rejected':
                return <Badge className="bg-red-100 text-red-800 text-xs">Rejected</Badge>;
            case 'submitted':
                return <Badge className="bg-blue-100 text-blue-800 text-xs">Submitted</Badge>;
            case 'draft':
                return <Badge className="bg-yellow-100 text-yellow-800 text-xs">Draft</Badge>;
            default:
                return <Badge className="bg-gray-100 text-gray-800 text-xs">Unknown</Badge>;
        }
    };

    const getTypeIcon = (type) => {
        switch (type) {
            case 'URL':
                return <Link className="w-4 h-4" />;
            case 'FILE':
                return <Upload className="w-4 h-4" />;
            default:
                return <FileText className="w-4 h-4" />;
        }
    };

    const handleFileView = () => {
        if (response.file) {
            window.open(response.file, '_blank', 'noopener,noreferrer');
        }
    };

    const handleUrlView = () => {
        if (response.value) {
            const url = response.value.startsWith('http') ? response.value : `https://${response.value}`;
            window.open(url, '_blank', 'noopener,noreferrer');
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto bg-white border border-gray-200">
               

                <div className="space-y-6">
                    {/* Requirement Details */}
                    {/* <div className="bg-gray-50 p-4 rounded-lg">
                        <h3 className="font-semibold text-gray-900 mb-2">Requirement Details</h3>
                        <div className="space-y-2 text-sm">
                            <div>
                                <span className="font-medium text-gray-700">Name:</span> {requirement.label}
                            </div>
                            <div>
                                <span className="font-medium text-gray-700">Type:</span> {requirement.type}
                            </div>
                            {requirement.description && (
                                <div>
                                    <span className="font-medium text-gray-700">Description:</span> 
                                    <p className="mt-1 text-gray-600">{requirement.description}</p>
                                </div>
                            )}
                            {requirement.deadline && (
                                <div>
                                    <span className="font-medium text-gray-700">Deadline:</span> 
                                    <span className="ml-2 text-gray-600">
                                        {new Date(requirement.deadline).toLocaleDateString('en-US', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric',
                                        })}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div> */}

                    {/* Submitted Content */}
                    <div className="bg-blue-50 p-4 rounded-lg">
                        {/* <h3 className="font-semibold text-gray-900 mb-3">Your Submission</h3> */}
                        
                        {requirement.type === 'FILE' && response.file ? (
                            <div className="space-y-3">
                                <div className="flex items-center justify-between p-3 bg-white border border-blue-200 rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                            <FileText className="w-5 h-5 text-blue-600" />
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-900">
                                                {response.file.split('/').pop()}
                                            </p>
                                            <p className="text-sm text-gray-500">Submitted file</p>
                                        </div>
                                    </div>
                                    <Button
                                        onClick={handleFileView}
                                        size="sm"
                                        className="bg-blue text-white hover:bg-blue/80 "
                                    >
                                        <Eye className="w-4 h-4 mr-2" />
                                        View File
                                    </Button>
                                </div>
                            </div>
                        ) : requirement.type === 'URL' && response.value ? (
                            <div className="space-y-3">
                                <div className="flex items-center justify-between p-3 bg-white border border-blue-200 rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                            <Link className="w-5 h-5 text-blue-600" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium text-gray-900 truncate">
                                                {response.value}
                                            </p>
                                            <p className="text-sm text-gray-500">Submitted URL</p>
                                        </div>
                                    </div>
                                    <Button
                                        onClick={handleUrlView}
                                        size="sm"
                                        className="bg-blue-600 text-white hover:bg-blue-700"
                                    >
                                        <Eye className="w-4 h-4 mr-2" />
                                        Open URL
                                    </Button>
                                </div>
                            </div>
                        ) : response.value ? (
                            <div className="bg-white p-4 border border-blue-200 rounded-lg">
                                <div className="prose prose-sm max-w-none">
                                    <div 
                                        dangerouslySetInnerHTML={{ __html: response.value }}
                                        className="text-gray-700 leading-relaxed"
                                    />
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-8 text-gray-500">
                                <FileText className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                                <p>No content available</p>
                            </div>
                        )}
                    </div>

                    {/* Submission Metadata */}
                    {(response.submitted_at || response.updated_at) && (
                        <div className="bg-gray-50 p-4 rounded-lg">
                            <h3 className="font-semibold text-gray-900 mb-2">Submission Info</h3>
                            <div className="space-y-1 text-sm text-gray-600">
                                {response.submitted_at && (
                                    <div>
                                        <span className="font-medium">Submitted:</span> {' '}
                                        {new Date(response.submitted_at).toLocaleString()}
                                    </div>
                                )}
                                {response.updated_at && response.updated_at !== response.submitted_at && (
                                    <div>
                                        <span className="font-medium">Last Updated:</span> {' '}
                                        {new Date(response.updated_at).toLocaleString()}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Feedback if rejected */}
                    {response.status === 'rejected' && response.feedback && (
                        <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                            <h3 className="font-semibold text-red-900 mb-2">Feedback</h3>
                            <p className="text-red-800 text-sm">{response.feedback}</p>
                        </div>
                    )}
                </div>

               
            </DialogContent>
        </Dialog>
    );
};

export default ViewSubmissionModal;
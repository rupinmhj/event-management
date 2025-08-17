import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MdEvent, MdLocationOn, MdCalendarToday, MdDescription } from 'react-icons/md';
import useAxiosAuth from '@/hooks/useAxiosAuth';
export const EventFloat = () => {
    const api = useAxiosAuth();
    const [event, setEvent] = useState({});
    useEffect(() => {
        const fetchEvent = async () => {
            const res = await api.get('/api/event/active-events/');
            console.log('float', res.data[0]);
            setEvent(res.data[0]);
        }
        fetchEvent()
    }, [])
    useEffect(() => {
        console.log('float2', event);

    }, [event])
    const formatDate = (dateString) => {
        if (!dateString) return 'Not set';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const getEventTypeColor = (type) => {
        switch (type) {
            case 'PHYSICAL':
                return 'bg-blue-100 text-blue-800';
            case 'VIRTUAL':
                return 'bg-green-100 text-green-800';
            case 'HYBRID':
                return 'bg-purple-100 text-purple-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <>
            <Card className="shadow-lg border-0 bg-gradient-to-r from-blue-50 to-indigo-50 mb-6">
                <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                            <MdEvent className="h-5 w-5 text-blue-600" />
                            <h3 className="text-lg font-semibold text-gray-800 truncate">{event.title}</h3>
                        </div>
                        <Badge className={`text-xs font-medium px-2 py-1 ${getEventTypeColor(event.event_type)}`}>
                            {event.event_type}
                        </Badge>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                            <MdCalendarToday className="h-4 w-4" />
                            <span>Start: {formatDate(event.start_date)}</span>
                        </div>
                        {event.end_date && (
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                <MdCalendarToday className="h-4 w-4" />
                                <span>End: {formatDate(event.end_date)}</span>
                            </div>
                        )}
                    </div>

                    {event.description && (
                        <div className="flex items-start gap-2">
                            <MdDescription className="h-4 w-4 text-gray-500 mt-0.5 flex-shrink-0" />
                            <p className="text-sm text-gray-600 line-clamp-2">{event.description}</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </>



    );
};


import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/Components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card";
import { Badge } from "@/Components/ui/badge";
import { MapPin, Calendar, Users, DollarSign, Eye } from "lucide-react";
import { useNavigate } from "react-router-dom";

export const EventsTable = ({ events }) => {
    const navigate = useNavigate();
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('ne-NP', {
            style: 'currency',
            currency: 'NPR'
        }).format(amount);
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    return (
        <Card className="bg-dashboard-card border-border">
            <CardHeader>
                <CardTitle className="text-foreground">Events Overview</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow className="border-border">
                                <TableHead className="text-muted-foreground">Event</TableHead>
                                <TableHead className="text-muted-foreground">Status</TableHead>
                                <TableHead className="text-muted-foreground">Date</TableHead>
                                <TableHead className="text-muted-foreground">Location</TableHead>
                                <TableHead className="text-muted-foreground">Participants</TableHead>
                                <TableHead className="text-muted-foreground">Revenue</TableHead>
                                <TableHead className="text-muted-foreground">View</TableHead>

                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {events.map((event) => (
                                <TableRow key={event.id} className="border-border hover:bg-dashboard-card-hover">
                                    <TableCell>
                                        <div className="font-medium text-foreground">{event.name}</div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge
                                            variant={event.is_active ? "active" : "secondary"}
                                        // className={
                                        //     event.is_active
                                        //         ? "bg-success text-success-foreground"
                                        //         : "bg-muted text-muted-foreground"
                                        // }
                                        >
                                            {event.is_active ? "Active" : "Inactive"}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <Calendar className="h-4 w-4 text-muted-foreground" />
                                            <span className="text-foreground">{formatDate(event.date)}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <MapPin className="h-4 w-4 text-muted-foreground" />
                                            <span className="text-foreground">{event.location}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center justify-center gap-2">
                                            <Users className="h-4 w-4 text-muted-foreground" />
                                            <span className="text-foreground">{event.total_participants}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <span className="font-medium text-foreground">
                                                {formatCurrency(event.total_revenue)}
                                            </span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div onClick={() => navigate(`/admin/event/${event.id}`)} className="flex items-center justify-center gap-2 cursor-pointer hover:text-blue">
                                            <Eye className="size-4" />
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
    );
};
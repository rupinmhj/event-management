import { useContext, useEffect, useState } from "react"
import {
    Table,
    TableBody,
    TableCell,
    TableFooter,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import AuthContext from "@/context/AuthContext"
import useAxiosAuth from "@/hooks/useAxiosAuth"
import { Plus } from "lucide-react" // <-- icon
import GeneralContext from "../context/GeneralContext"
import { motion } from 'framer-motion'
export default function EventTable() {
    const [events, setEvents] = useState([])
    const api = useAxiosAuth();
    const { authTokens, authReady } = useContext(AuthContext)
    const { submitCreate, create } = useContext(GeneralContext)
    useEffect(() => {
        const fetchEvents = async () => {
            try {
                if (!authTokens && !authReady) return;
                const res = await api.get("/api/event/event-list/")
                const data = res.data;
                console.log('Event list', data);
                setEvents(data)
            } catch (error) {
                console.error("Error fetching events:", error)
            }
        }
        fetchEvents()
    }, [authTokens, authReady])

    return (

        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, delay: 0.15 }}
        >
            <div>
                {/* Header with Create Button */}
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-semibold">Event List</h2>
                    <button
                        onClick={create}
                        className="flex items-center gap-1 bg-blue  hover:bg-blue text-white px-3 py-2 rounded-lg shadow-md transform hover:scale-105 transition-all duration-200"
                    >
                        <Plus size={18} /> Create
                    </button>
                </div>

                <div className="[&>div]:max-h-96">
                    <Table className="[&_td]:border-border [&_th]:border-border border-separate border-spacing-0 [&_tfoot_td]:border-t [&_th]:border-b [&_tr]:border-none [&_tr:not(:last-child)_td]:border-b">
                        <TableHeader className="bg-background/90 sticky top-0 z-10 backdrop-blur-xs">
                            <TableRow className="hover:bg-transparent">
                                <TableHead>S.N</TableHead>
                                <TableHead>Title</TableHead>
                                <TableHead>Event Type</TableHead>
                                <TableHead>Location</TableHead>
                                <TableHead>Start Date + Duration</TableHead>
                                <TableHead>Payment</TableHead>
                            </TableRow>
                        </TableHeader>

                        <TableBody>
                            {events.length > 0 ? (
                                events.map((event, index) => (
                                    <TableRow key={event.id}>
                                        <TableCell className="font-medium">{index + 1}</TableCell>
                                        <TableCell>{event.title}</TableCell>
                                        <TableCell>
                                            {event.event_type === "ONLINE" ? "Online" : "Physical"}
                                        </TableCell>
                                        <TableCell>{event.location}</TableCell>
                                        <TableCell>
                                            {event.start_date} ({event.duration})
                                        </TableCell>
                                        <TableCell>
                                            {event.is_payment_required ? "Paid" : "Free"}
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center text-muted-foreground">
                                        No events found
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>

                        <TableFooter className="bg-transparent">
                            <TableRow className="hover:bg-transparent">
                                <TableCell colSpan={6}>
                                    Total Events: {events.length}
                                </TableCell>
                            </TableRow>
                        </TableFooter>
                    </Table>
                </div>
            </div>
        </motion.div>
    )
}

import { createBrowserRouter } from "react-router-dom";
import AdminLayout from "../layouts/AdminLayout";

// Admin pages
import { DashboardAdmin } from "../pages/admin/DashboardAdmin";
import { Events } from "../pages/admin/Events";
import { RequirementSetup } from "../pages/admin/RequirementSetup";
import { TicketsPricing } from "../pages/admin/TicketsPricing";
import { RegisteredMembers } from "../pages/admin/RegisteredMembers";
import { EventView } from "@/Components/admin/EventView"
// User pages
import UserLayout from "../layouts/UserLayout";
import { Dashboard } from "../pages/user/Dashboard";
import { About } from "@/Pages/user/About";
import { Home } from '@/Pages/user/Home'
import { Registration } from '@/Pages/user/Registration'
import { Tickets } from '@/Pages/user/Tickets'

//Auth page
import { AuthPage } from '@/Pages/public/AuthPage'
import EditEvent from "@/Components/admin/EditEvent";
import Setup from "@/Pages/Setup";

const router = createBrowserRouter([
    // Public routes
    {
        path: "/",
        element: <AuthPage />,
    },


    // Admin routes
    {
        path: "/admin",
        element: <AdminLayout />, // Navbar + Sidebar fixed
        children: [
            { index: true, element: <DashboardAdmin /> },
            { path: "events", element: <Events /> },
            { path: "event/:id", element: <EventView /> },
            { path: "requirement-setup", element: <RequirementSetup /> },
            { path: "tickets-pricing", element: <TicketsPricing /> },
            { path: "registered-members", element: <RegisteredMembers /> },
            { path: "event-edit/:id", element: <EditEvent /> }
        ],
    },

    // User routes
    {
        path: "/user",
        element: <UserLayout />, // Navbar + Footer fixed
        children: [
            { index: true, element: <Dashboard /> }, // /user
            { path: 'setup-profile', element: <Setup /> },
            { path: "home", element: <Home /> },
            { path: "about", element: <About /> },
            { path: "registration", element: <Registration /> },
            { path: "tickets", element: <Tickets /> },
        ],
    },
]);

export default router;

import { createBrowserRouter } from "react-router-dom";
import AdminLayout from "../layouts/AdminLayout";

// Admin pages
import { DashboardAdmin } from "../pages/admin/DashboardAdmin";
import { Events } from "../pages/admin/Events";
import { RequirementSetup } from "../pages/admin/RequirementSetup";
import { TicketsPricing } from "../pages/admin/TicketsPricing";
import { RegisteredMembers } from "../pages/admin/RegisteredMembers";
import { EventView } from "@/Components/admin/EventView"
import SendEmail from "@/Components/admin/SendEmail";
import {ParticipantReview} from "@/Components/admin/ParticipantReview";
// User pages
import UserLayout from "../layouts/UserLayout";
import { Dashboard } from "../pages/user/Dashboard";
import { About } from "@/Pages/user/About";
import { Home } from '@/Pages/user/Home'
import { Registration } from '@/Pages/user/Registration'
import { Tickets } from '@/Pages/user/Tickets'
import { MyProfile } from "@/Components/user/MyProfile";

//Auth page
import { AuthPage } from '@/Pages/public/AuthPage'
import EditEvent from "@/Components/admin/EditEvent";
import Setup from "@/Pages/Setup";
import { RequirementUpdate } from "@/Components/admin/RequirementUpdate";
import DynamicRequirementForm from "@/Components/user/DynamicRequirementForm";
import { EventDetail } from "@/Components/user/EventDetail";
import { ChangePasswordForm } from "@/Components/common/ChangePassword";
import {ForgetPasswordForm} from "@/forms/ForgetPasswordForm";
import {OtpValidation} from "@/forms/OtpValidation";
import Password from "@/layouts/Password";
import {ResetPasswordForm} from "@/forms/ResetPasswordForm";
import EmailHistory from "@/Components/admin/EmailHistory";


const router = createBrowserRouter([
    // Public routes
    {
        path: "/",
        element: <AuthPage />,

    },
    {
        path: "/forgot-password",
        element: <Password />,
        children: [
            { index: true, element: <ForgetPasswordForm /> },
            { path: "validation",element: <OtpValidation/>},
            { path: "reset-password", element: <ResetPasswordForm  /> },
        ],
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
            { path: "requirement-update/:id", element: <RequirementUpdate /> },
            { path: "tickets-pricing", element: <TicketsPricing /> },
            { path: "registered-members", element: <RegisteredMembers /> },
            { path: "event-edit/:id", element: <EditEvent /> },
            { path: "change-password", element: <ChangePasswordForm user={'admin'}/>},
            { path: "send-email",element: <SendEmail/>},
            { path: "email-history", element: <EmailHistory /> } ,
            { path:'participant-review/:id', element: <ParticipantReview />}
        ],
    },

    // User routes
    {
        path: "/user",
        element: <UserLayout />, // Navbar + Footer fixed
        children: [
            { index: true, element: <Dashboard /> }, // /user
            { path: 'setup-profile', element: <Setup /> },
            { path: "events", element: <Home /> },
            { path: "about", element: <About /> },
            { path: "registration", element: <Registration /> },
            { path: "tickets", element: <Tickets /> },
            { path: "event/:id", element: <EventDetail /> },
            { path: "event-form/:id", element: <DynamicRequirementForm /> },
            { path: "change-password", element: <ChangePasswordForm user={'user'}/>},
            { path: "user-profile", element: <MyProfile /> }

        ],
    },
]);

export default router;

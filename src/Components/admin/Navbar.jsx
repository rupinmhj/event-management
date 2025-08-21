import React, { useContext } from "react";
import { Button } from "@/components/ui/button";
import { Link, useNavigate, useLocation } from 'react-router-dom'
import {
    NavigationMenu,
    NavigationMenuItem,
    NavigationMenuLink,
    NavigationMenuList,
} from "@/components/ui/navigation-menu";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Bell, HelpCircle, User } from "lucide-react";
import AuthContext from "@/context/AuthContext";

// Logo Component
const Logo = () => (
    <div className="flex items-center gap-2">
        <div className="size-8 rounded-lg bg-blue flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-sm">E</span>
        </div>
        <span className="font-semibold text-lg">EventManager</span>
    </div>
);

// Info Menu Component
const InfoMenu = () => (
    <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="size-8">
                <HelpCircle className="size-4" />
            </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" portalled={false}>
            <DropdownMenuItem>Help Center</DropdownMenuItem>
            <DropdownMenuItem>Documentation</DropdownMenuItem>
            <DropdownMenuItem>Contact Support</DropdownMenuItem>
        </DropdownMenuContent>
    </DropdownMenu>
);

// Notification Menu Component
const NotificationMenu = () => (
    <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="size-8 relative">
                <Bell className="size-4" />
                <span className="absolute -top-1 -right-1 size-2 bg-red-500 rounded-full" />
            </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-80" portalled={false}>
            <div className="p-2">
                <p className="font-medium mb-2">Notifications</p>
                <div className="space-y-2">
                    <div className="p-2 rounded-md bg-muted/50">
                        <p className="text-sm">New event registration received</p>
                        <p className="text-xs text-muted-foreground">5 minutes ago</p>
                    </div>
                    <div className="p-2 rounded-md bg-muted/50">
                        <p className="text-sm">Event "Tech Conference 2024" is starting soon</p>
                        <p className="text-xs text-muted-foreground">1 hour ago</p>
                    </div>
                </div>
            </div>
        </DropdownMenuContent>
    </DropdownMenu>
);

// User Menu Component
const UserMenu = ({ mode, logout }) => {
    const navigate = useNavigate();

    return (
        <DropdownMenu modal={false} >
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="size-8">
                    <User className="size-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" portalled={false}>
                <DropdownMenuItem>
                    <Link to="/profile" className="w-full block">
                        Profile
                    </Link>
                </DropdownMenuItem>
                <DropdownMenuItem>
                    <Link to="/settings" className="w-full block">
                        Settings
                    </Link>
                </DropdownMenuItem>
                <DropdownMenuItem>
                    <Link to="/admin/change-password" className="w-full block">
                        Change Password
                    </Link>
                </DropdownMenuItem>
                {mode === "login" ? (
                    <DropdownMenuItem className=" cursor-pointer"
                        onClick={() => {
                            logout();
                            navigate("/");
                        }}
                    >
                        Log out
                    </DropdownMenuItem>
                ) : (
                    <DropdownMenuItem>
                        <Link to="/signin" className="w-full block">
                            Sign in
                        </Link>
                    </DropdownMenuItem>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    );
};

// Updated navigation links array
const navigationLinks = [
    { to: "/admin/events", label: "Events" },
    { to: "/admin/requirement-setup", label: "Requirement Setup" },
    { to: "/admin/tickets-pricing", label: "Tickets/Pricing" },
    { to: "/admin/registered-members", label: "Registered Members" },
];

const Navbar = ({ mode }) => {
    const { logout } = useContext(AuthContext);
    const location = useLocation();

    // Helper function to check if a link is active
    const isActiveLink = (linkPath) => {
        return location.pathname === linkPath;
    };

    return (
        <header className="border-b font-sans bg-white">
            <div className="px-12 flex h-16 items-center justify-between gap-4">
                {/* Left side */}
                <div className="flex items-center gap-2">
                    {/* Mobile menu trigger */}
                    <Popover modal={false}>
                        <PopoverTrigger asChild>
                            <Button
                                className="group size-8 md:hidden"
                                variant="ghost"
                                size="icon"
                            >
                                <svg
                                    className="pointer-events-none"
                                    width={16}
                                    height={16}
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <path
                                        d="M4 12L20 12"
                                        className="origin-center -translate-y-[7px] transition-all duration-300 ease-[cubic-bezier(.5,.85,.25,1.1)] group-aria-expanded:translate-x-0 group-aria-expanded:translate-y-0 group-aria-expanded:rotate-[315deg]"
                                    />
                                    <path
                                        d="M4 12H20"
                                        className="origin-center transition-all duration-300 ease-[cubic-bezier(.5,.85,.25,1.8)] group-aria-expanded:rotate-45"
                                    />
                                    <path
                                        d="M4 12H20"
                                        className="origin-center translate-y-[7px] transition-all duration-300 ease-[cubic-bezier(.5,.85,.25,1.1)] group-aria-expanded:translate-y-0 group-aria-expanded:rotate-[135deg]"
                                    />
                                </svg>
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent align="start" className="w-36 p-1 md:hidden" portalled={false}>
                            <NavigationMenu className="max-w-none *:w-full">
                                <NavigationMenuList className="flex-col items-start gap-0 md:gap-2">
                                    {navigationLinks.map((link, index) => (
                                        <NavigationMenuItem key={index} className="w-full">
                                            <NavigationMenuLink asChild>
                                                <Link
                                                    to={link.to}
                                                    className={`block w-full py-1.5 font-medium transition-colors ${isActiveLink(link.to)
                                                            ? "text-blue border-b-2 border-blue"
                                                            : "text-muted-foreground hover:text-blue"
                                                        }`}
                                                >
                                                    {link.label}
                                                </Link>
                                            </NavigationMenuLink>
                                        </NavigationMenuItem>
                                    ))}
                                </NavigationMenuList>
                            </NavigationMenu>
                        </PopoverContent>
                    </Popover>
                    {/* Main nav */}
                    <div className="flex items-center gap-6">
                        <Link to="/admin" className="text-blue hover:text-blue/90">
                            <Logo />
                        </Link>
                        {/* Navigation menu */}
                        <NavigationMenu className="max-md:hidden">
                            <NavigationMenuList className="gap-10 pl-10">
                                {navigationLinks.map((link, index) => (
                                    <NavigationMenuItem key={index}>
                                        <NavigationMenuLink asChild>
                                            <Link
                                                to={link.to}
                                                className={`relative py-1.5 font-medium transition-all duration-200 ease-in-out ${isActiveLink(link.to)
                                                        ? "text-blue after:w-full"
                                                        : "text-muted-foreground hover after:w-0 hover:after:w-full"
                                                    } `}
                                            >
                                                {link.label}
                                            </Link>
                                        </NavigationMenuLink>
                                    </NavigationMenuItem>
                                ))}
                            </NavigationMenuList>
                        </NavigationMenu>
                    </div>
                </div>
                {/* Right side */}
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        {/* Info menu */}
                        <InfoMenu />
                        {/* Notification */}
                        <NotificationMenu />
                    </div>
                    {/* User menu */}
                    <UserMenu mode={mode} logout={logout} />
                </div>
            </div>
        </header>
    );
};

export default Navbar;
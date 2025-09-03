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


const UserMenu = ({ mode, logout }) => {
    const navigate = useNavigate();

    return (
        <DropdownMenu modal={false}>
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
                {mode === "login" ? (
                    <DropdownMenuItem
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
    { to: "/event-setup", label: "Event Setup" },
    { to: "/requirement-setup", label: "Requirement Setup" },
    { to: "/tickets-pricing", label: "Tickets/Pricing" },
    { to: "/registered-members", label: "Registered Members" },
];

const Navbar = ({ mode }) => {
    const { logout } = useContext(AuthContext);
    const location = useLocation();
    return (
        <header className="border-b font-sans bg-white">
            <div className="md:px-12 px-4 flex h-16 items-center justify-between gap-4">
                {/* Left side */}
                <div className="flex items-center gap-2">
                    {/* Mobile menu trigger */}
                   
                    {/* Main nav */}
                    <div className="flex items-center gap-6">
                        <Link to="/" className="text-blue hover:text-blue/90">
                            <Logo />
                        </Link>
                        {/* Navigation menu */}
                        {/* <NavigationMenu className="max-md:hidden">
                            <NavigationMenuList className="gap-10 pl-10">
                                {navigationLinks.map((link, index) => (
                                    <NavigationMenuItem key={index}>
                                        <NavigationMenuLink asChild>
                                            <Link
                                                to={link.to}
                                                className="text-muted-foreground hover:text-blue py-1.5 font-medium"
                                            >
                                                {link.label}
                                            </Link>
                                        </NavigationMenuLink>
                                    </NavigationMenuItem>
                                ))}
                            </NavigationMenuList>
                        </NavigationMenu> */}
                    </div>
                </div>
                {/* Right side */}
                {/* <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <InfoMenu />
                    </div>
                    <UserMenu mode={mode} logout={logout} /> 
                </div> */}
            </div>
        </header>
    );
};

export default Navbar;

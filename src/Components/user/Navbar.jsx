import React, { useContext, useEffect } from "react";
import { Button } from "@/Components/ui/button";
import { useState } from "react";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "@/Components/ui/navigation-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/Components/ui/popover";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/Components/ui/dropdown-menu";
import { Bell, HelpCircle, User } from "lucide-react";
import AuthContext from "@/context/AuthContext";
import { NavLink, Link, useNavigate, useLocation } from "react-router-dom";
import useAxiosAuth from "@/hooks/useAxiosAuth";

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
  const api = useAxiosAuth();
  const navigate = useNavigate();
  // const { profilePicture } = useContext(AuthContext);
  const has_profile = localStorage.getItem('has_profile');
  const [profilePicture, setProfilePicture] = useState();
  const { authTokens, authReady } = useContext(AuthContext);
  useEffect(() => {
    if (!authReady && !authReady) return;
    const fetchData = async () => {
      const response = await api.get('/api/account/profile/');
      console.log('--------Navbar-----', response);
      if (response.data?.profile_picture) {
        setProfilePicture(response.data.profile_picture);
        localStorage.setItem("profilePicture", response.data.profile_picture);
      }
    }
    fetchData();
  }, [authReady, authTokens])
  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="size-8 rounded-full">
          {profilePicture && has_profile == "true" ? (
            <img src={profilePicture} alt="Profile" className="rounded-full size-8 object-cover" />
          ) : (
            <User className="size-4" />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" portalled={false} className='mt-3'>
        <DropdownMenuItem>

          {(has_profile == "undefined" || has_profile === "false") ? (<NavLink to="setup-profile" className="w-full block">
            My Profile
          </NavLink>) : <NavLink to="user-profile" className="w-full block">
            My Profile
          </NavLink>}

        </DropdownMenuItem>
        {/* <DropdownMenuItem>
          <NavLink to="/settings" className="w-full block">
            Settings
          </NavLink>
        </DropdownMenuItem> */}
        <DropdownMenuItem>
          <Link to="/user/change-password" className="w-full block">
            Change Password
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
            <NavLink to="/" onClick={logout} className="w-full block">
              Log out
            </NavLink>
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

// Navigation links array
const navigationLinks = [
  { to: "/user/events", label: "Events" },
  // { to: "/user/about", label: "About" },
  { to: "/user/tickets", label: "Tickets" },
  { to: "/user/my-submission", label: "My submissions" },
  { to: "/user/my-payments", label: "My payments" },

  // { to: "/user/registration", label: "Registration" },
];

const Navbar = ({ mode }) => {
  const { logout } = useContext(AuthContext);
  const location = useLocation();
  const isActiveLink = (linkPath) => location.pathname === linkPath;

  return (
    <header className=" font-sans   mx-auto ">
      <div className="grad">
        <div className="md:px-12 px-2 flex h-16 items-center justify-between gap-4">
          {/* Left side */}
          <div className="flex items-center gap-2 ">


            {/* Logo & Desktop Navigation */}
            <div className="flex items-center gap-6 ">
              <NavLink
                to="/user"
                className="text-blue hover:text-blue/90"
              >
                <Logo />
              </NavLink>

              <NavigationMenu className="max-md:hidden">
                <NavigationMenuList className="gap-10 pl-10">
                  {navigationLinks.map((link, index) => (
                    <NavigationMenuItem key={index}>
                      <NavigationMenuLink asChild>
                        <NavLink
                          to={link.to}
                          className={`relative py-1.5 font-medium transition-all duration-200 ease-in-out ${isActiveLink(link.to)
                            ? "text-blue after:w-full"
                            : "text-muted-foreground hover after:w-0 hover:after:w-full"
                            }`}
                        >
                          {link.label}
                        </NavLink>
                      </NavigationMenuLink>
                    </NavigationMenuItem>
                  ))}
                </NavigationMenuList>
              </NavigationMenu>
            </div>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 ">
              {/* <InfoMenu />
            <NotificationMenu /> */}
            </div>
            <UserMenu mode={mode} logout={logout} />
            {/* Mobile menu trigger */}
            <Popover modal={false}>


              <PopoverContent
                align="start"
                className="w-64 p-0 md:hidden  border border-slate-200/60 shadow-xl backdrop-blur-sm "
                portalled={false}
              >


                {/* Navigation Items */}
                <NavigationMenu className="max-w-none ">
                  <NavigationMenuList className="flex-col items-start gap-0 p-2 ">
                    {navigationLinks.map((link, index) => (
                      <NavigationMenuItem key={index} className="w-full ">
                        <NavigationMenuLink asChild>
                          <Link
                            to={link.to}
                            className={`
                                              group relative w-full flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium text-sm transition-all duration-300
                                              ${location.pathname === link.to
                                ? "bg-gradient-to-r from-blue-500 to-purple-600 text-blue shadow-md transform scale-[1.02]"
                                : "text-slate-600 hover:text-slate-900 hover:bg-gradient-to-r hover:from-slate-100 hover:to-slate-50"
                              }
                                          `}
                            onClick={() => document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))}
                          >


                            <span className="flex-1">{link.label}</span>

                            {/* Active indicator */}
                            {location.pathname === link.to && (
                              <div className="size-1.5 bg-white rounded-full animate-pulse"></div>
                            )}

                            {/* Arrow indicator for non-active items */}
                            {location.pathname !== link.to && (
                              <svg
                                className="size-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-slate-400"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                              </svg>
                            )}
                          </Link>
                        </NavigationMenuLink>
                      </NavigationMenuItem>
                    ))}
                  </NavigationMenuList>
                </NavigationMenu>


              </PopoverContent>
              <PopoverTrigger asChild>
                <Button
                  className="group bg-white/10  relative size-10 md:hidden shadow-sm hover:shadow-md hover:from-white hover:to-slate-50 transition-all duration-300"

                  size="icon"
                >
                  <div className="relative ">
                    <svg
                      className="pointer-events-none"
                      width={18}
                      height={18}
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
                    {/* Notification dot for active state */}
                    <span className="absolute -top-1 -right-1 size-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full opacity-0 group-aria-expanded:opacity-100 transition-opacity duration-300"></span>
                  </div>
                </Button>
              </PopoverTrigger>
            </Popover>
          </div>
        </div>
      </div>

    </header>
  );
};

export default Navbar;
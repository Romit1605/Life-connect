import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Heart, LogOut, User, Menu, X } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/components/contexts/AuthContext";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface HeaderProps {
    showBackButton?: boolean;
}

const Header = ({ showBackButton = false }: HeaderProps) => {
    const navigate = useNavigate();
    const { user, signOut } = useAuth();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const handleLogout = () => {
        signOut();
    };

    const getDashboardPath = () => {
        if (!user?.role) return "/";
        return `/dashboard/${user.role.toLowerCase()}`;
    };

    return (
        <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
            <div className="container mx-auto px-6 py-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        {showBackButton && (
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => navigate(-1)}
                                className="md:hidden"
                            >
                                <Menu className="h-5 w-5" />
                            </Button>
                        )}
                        <Link to="/" className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blood to-primary flex items-center justify-center shadow-lg">
                                <Heart className="h-6 w-6 text-white" />
                            </div>
                            <div>
                                <h1 className="text-xl font-bold text-foreground">LifeLink</h1>
                                <p className="text-xs text-muted-foreground hidden md:block">
                                    Blood & Medicine Network
                                </p>
                            </div>
                        </Link>
                    </div>

                    <div className="flex items-center gap-2">
                        {user ? (
                            <>
                                <Button
                                    variant="outline"
                                    onClick={() => navigate(getDashboardPath())}
                                    className="hidden md:flex"
                                >
                                    <User className="h-4 w-4 mr-2" />
                                    Dashboard
                                </Button>

                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="icon">
                                            <User className="h-5 w-5" />
                                            <span className="sr-only">User menu</span>
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="w-56">
                                        <DropdownMenuLabel>
                                            <div className="flex flex-col space-y-1">
                                                <p className="text-sm font-medium leading-none">
                                                    {user.full_name}
                                                </p>
                                                <p className="text-xs leading-none text-muted-foreground">
                                                    {user.email}
                                                </p>
                                            </div>
                                        </DropdownMenuLabel>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem onClick={() => navigate(getDashboardPath())}>
                                            <User className="mr-2 h-4 w-4" />
                                            <span>Dashboard</span>
                                        </DropdownMenuItem>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem onClick={handleLogout}>
                                            <LogOut className="mr-2 h-4 w-4" />
                                            <span>Logout</span>
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </>
                        ) : (
                            <Button onClick={() => navigate("/login")} variant="outline">
                                Sign In
                            </Button>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;

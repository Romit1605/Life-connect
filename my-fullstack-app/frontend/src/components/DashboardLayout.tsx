import { ReactNode } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  LogOut,
  Home,
  Menu,
  X
} from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/components/contexts/AuthContext";
import NotificationsPopover from "./NotificationsPopover";

interface DashboardLayoutProps {
  children: ReactNode;
  title: string;
  role: string;
  roleColor: string;
}

const DashboardLayout = ({ children, title, role, roleColor }: DashboardLayoutProps) => {
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    signOut();
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                className="md:hidden"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
              <Link to="/" className="flex items-center gap-2">
                <div className="text-2xl font-bold text-blood">LifeLink</div>
              </Link>
              <div className={`hidden md:flex items-center gap-2 px-3 py-1 rounded-full bg-${roleColor}/10 border border-${roleColor}/20`}>
                <span className="text-sm font-medium capitalize">{role}</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <NotificationsPopover />
              <Button variant="ghost" size="icon" asChild>
                <Link to="/">
                  <Home className="h-5 w-5" />
                  <span className="sr-only">Home</span>
                </Link>
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleLogout}
              >
                <LogOut className="h-5 w-5" />
                <span className="sr-only">Logout</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-border bg-card p-4">
          <div className={`flex items-center gap-2 px-3 py-2 rounded-full bg-${roleColor}/10 border border-${roleColor}/20 w-fit`}>
            <span className="text-sm font-medium capitalize">{role}</span>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">{title}</h1>
        </div>
        {children}
      </main>
    </div>
  );
};

export default DashboardLayout;

import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Heart, 
  Building2, 
  Users, 
  Pill, 
  Shield, 
  Droplet,
  Loader2
} from "lucide-react";
import { useUserRole, UserRole } from "@/components/hooks/useUserRole";
import { useAuth } from "@/components/contexts/AuthContext";

const RoleSelection = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { roles, loading } = useUserRole();

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    // If user has only one role, redirect directly to that dashboard
    if (!loading && roles.length === 1) {
      navigateToRole(roles[0]);
    }
  }, [user, roles, loading, navigate]);

  const navigateToRole = (role: UserRole) => {
    const dashboardMap: Record<UserRole, string> = {
      donor: "/dashboard/donor",
      hospital: "/dashboard/hospital",
      ngo: "/dashboard/ngo",
      pharmacy: "/dashboard/pharmacy",
      government: "/dashboard/government",
      volunteer: "/dashboard/volunteer",
      blood_bank: "/dashboard/blood-bank"
    };

    navigate(dashboardMap[role]);
  };

  const roleConfig: Record<UserRole, { icon: any; color: string; title: string }> = {
    donor: { icon: Heart, color: "blood", title: "Donor Dashboard" },
    hospital: { icon: Building2, color: "medicine", title: "Hospital Dashboard" },
    ngo: { icon: Users, color: "ngo", title: "NGO Dashboard" },
    pharmacy: { icon: Pill, color: "medicine", title: "Pharmacy Dashboard" },
    government: { icon: Shield, color: "government", title: "Government Dashboard" },
    volunteer: { icon: Heart, color: "volunteer", title: "Volunteer Dashboard" },
    blood_bank: { icon: Droplet, color: "blood", title: "Blood Bank Dashboard" }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blood/10 via-background to-ngo/10 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blood" />
      </div>
    );
  }

  if (roles.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blood/10 via-background to-ngo/10 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle>No Roles Assigned</CardTitle>
            <CardDescription>
              Please contact an administrator to assign you a role in the system.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={() => navigate("/")} 
              className="w-full"
            >
              Return to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blood/10 via-background to-ngo/10 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        <Card className="border-border/50 shadow-xl">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl">Select Your Dashboard</CardTitle>
            <CardDescription>
              You have access to multiple dashboards. Choose one to continue.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {roles.map((role) => {
                const config = roleConfig[role];
                const Icon = config.icon;

                return (
                  <Button
                    key={role}
                    variant="outline"
                    className="h-auto flex-col gap-4 p-6 hover:shadow-lg transition-all"
                    onClick={() => navigateToRole(role)}
                  >
                    <div className={`p-4 rounded-full bg-${config.color}/10`}>
                      <Icon className={`h-8 w-8 text-${config.color}`} />
                    </div>
                    <span className="text-lg font-medium">{config.title}</span>
                  </Button>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default RoleSelection;
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/components/contexts/AuthContext";
import Index from "@/components/pages/Index";
import Login from "@/components/pages/Login";
import Register from "@/components/pages/Register";
import RoleSelection from "@/components/pages/RoleSelection";
import Upload from "@/components/pages/Upload";
import Request from "@/components/pages/Request";
import Camps from "@/components/pages/Camps";
import Notifications from "@/components/pages/Notifications";
import DonorDashboard from "@/components/pages/dashboards/DonorDashboard";
import HospitalDashboard from "@/components/pages/dashboards/HospitalDashboard";
import NGODashboard from "@/components/pages/dashboards/NGODashboard";
import PharmacyDashboard from "@/components/pages/dashboards/PharmacyDashboard";
import GovernmentDashboard from "@/components/pages/dashboards/GovernmentDashboard";
import VolunteerDashboard from "@/components/pages/dashboards/VolunteerDashboard";
import BloodBankDashboard from "@/components/pages/dashboards/BloodBankDashboard";
import NotFound from "@/components/pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/role-selection" element={<RoleSelection />} />
            <Route path="/upload" element={<Upload />} />
            <Route path="/request" element={<Request />} />
            <Route path="/camps" element={<Camps />} />
            <Route path="/notifications" element={<Notifications />} />
            <Route path="/dashboard/donor" element={<DonorDashboard />} />
            <Route path="/dashboard/hospital" element={<HospitalDashboard />} />
            <Route path="/dashboard/ngo" element={<NGODashboard />} />
            <Route path="/dashboard/pharmacy" element={<PharmacyDashboard />} />
            <Route path="/dashboard/government" element={<GovernmentDashboard />} />
            <Route path="/dashboard/volunteer" element={<VolunteerDashboard />} />
            <Route path="/dashboard/blood-bank" element={<BloodBankDashboard />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

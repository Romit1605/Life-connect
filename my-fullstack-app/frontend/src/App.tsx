import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner.tsx";
import { TooltipProvider } from "@/components/ui/tooltip.tsx";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/components/contexts/AuthContext";
import Index from "@/components/pages/Index.tsx";
import Login from "@/components/pages/Login.tsx";
import Register from "@/components/pages/Register.tsx";
import RoleSelection from "@/components/pages/RoleSelection.tsx";
import Upload from "@/components/pages/Upload.tsx";
import UploadMedicine from "@/components/pages/UploadMedicine";
import Request from "@/components/pages/Request.tsx";
import Camps from "@/components/pages/Camps.tsx";
import Notifications from "@/components/pages/Notifications.tsx";
import DonorDashboard from "@/components/pages/dashboards/DonorDashboard.tsx";
import HospitalDashboard from "@/components/pages/dashboards/HospitalDashboard.tsx";
import NGODashboard from "@/components/pages/dashboards/NGODashboard.tsx";
import PharmacyDashboard from "@/components/pages/dashboards/PharmacyDashboard.tsx";
import GovernmentDashboard from "@/components/pages/dashboards/GovernmentDashboard.tsx";
import VolunteerDashboard from "@/components/pages/dashboards/VolunteerDashboard.tsx";
import BloodBankDashboard from "@/components/pages/dashboards/BloodBankDashboard.tsx";
import Rules from "@/components/pages/Rules.tsx";
import NotFound from "@/components/pages/NotFound.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/role-selection" element={<RoleSelection />} />
            <Route path="/upload" element={<Upload />} />
            <Route path="/pharmacy/upload" element={<UploadMedicine />} />
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
            <Route path="/rules" element={<Rules />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

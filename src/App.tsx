import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { AuthProvider } from "@/hooks/useAuth";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Login from "./pages/auth/Login";
import RegisterChoice from "./pages/auth/RegisterChoice";
import RegisterPatient from "./pages/auth/RegisterPatient";
import RegisterProfessional from "./pages/auth/RegisterProfessional";
import AdminDashboard from "./pages/dashboard/AdminDashboard";
import ProfessionalDashboard from "./pages/dashboard/ProfessionalDashboard";
import PatientDashboard from "./pages/dashboard/PatientDashboard";
import ProfessionalProfile from "./pages/ProfessionalProfile";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfService from "./pages/TermsOfService";

const queryClient = new QueryClient();

const App = () => (
  <HelmetProvider>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/login" element={<Login />} />
              <Route path="/cadastro" element={<RegisterChoice />} />
              <Route path="/cadastro/paciente" element={<RegisterPatient />} />
              <Route path="/cadastro/profissional" element={<RegisterProfessional />} />
              <Route path="/profissional/:slug" element={<ProfessionalProfile />} />
              <Route path="/politica-de-privacidade" element={<PrivacyPolicy />} />
              <Route path="/termos-de-uso" element={<TermsOfService />} />
              <Route path="/admin" element={
                <ProtectedRoute requiredRole="admin">
                  <AdminDashboard />
                </ProtectedRoute>
              } />
              <Route path="/profissional" element={
                <ProtectedRoute requiredRole="professional">
                  <ProfessionalDashboard />
                </ProtectedRoute>
              } />
              <Route path="/paciente" element={
                <ProtectedRoute requiredRole="patient">
                  <PatientDashboard />
                </ProtectedRoute>
              } />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </HelmetProvider>
);

export default App;

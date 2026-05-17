import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider, useAuth } from "./context/AuthContext";
import ProtectedRoute from "./routes/ProtectedRoute";
import Navbar from "./components/common/Navbar";

// Public pages
import HomePage from "./pages/public/HomePage";
import ServicesPage from "./pages/public/ServicesPage";
import ServiceDetailPage from "./pages/public/ServiceDetailPage";
import LoginPage from "./pages/public/LoginPage";
import RegisterPage from "./pages/public/RegisterPage";

// Customer pages
import CustomerDashboard from "./pages/customer/Dashboard";
import CustomerBookings from "./pages/customer/Bookings";
import CustomerProfile from "./pages/customer/Profile";

// Provider pages
import ProviderDashboard from "./pages/provider/Dashboard";
import ProviderServices from "./pages/provider/Services";
import ProviderRequests from "./pages/provider/Requests";

// Admin pages
import AdminDashboard from "./pages/admin/Dashboard";
import AdminUsers from "./pages/admin/Users";
import AdminProviders from "./pages/admin/Providers";
import AdminBookings from "./pages/admin/Bookings";

function AppRoutes() {
  const { user } = useAuth();

  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<HomePage />} />
      <Route path="/services" element={<ServicesPage />} />
      <Route path="/services/:id" element={<ServiceDetailPage />} />
      <Route path="/login" element={user ? <Navigate to="/" replace /> : <LoginPage />} />
      <Route path="/register" element={user ? <Navigate to="/" replace /> : <RegisterPage />} />

      {/* Customer */}
      <Route path="/dashboard" element={<ProtectedRoute roles={["customer"]}><CustomerDashboard /></ProtectedRoute>} />
      <Route path="/bookings" element={<ProtectedRoute roles={["customer"]}><CustomerBookings /></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute roles={["customer"]}><CustomerProfile /></ProtectedRoute>} />

      {/* Provider */}
      <Route path="/provider/dashboard" element={<ProtectedRoute roles={["provider"]}><ProviderDashboard /></ProtectedRoute>} />
      <Route path="/provider/services" element={<ProtectedRoute roles={["provider"]}><ProviderServices /></ProtectedRoute>} />
      <Route path="/provider/requests" element={<ProtectedRoute roles={["provider"]}><ProviderRequests /></ProtectedRoute>} />

      {/* Admin */}
      <Route path="/admin" element={<ProtectedRoute roles={["admin"]}><AdminDashboard /></ProtectedRoute>} />
      <Route path="/admin/users" element={<ProtectedRoute roles={["admin"]}><AdminUsers /></ProtectedRoute>} />
      <Route path="/admin/providers" element={<ProtectedRoute roles={["admin"]}><AdminProviders /></ProtectedRoute>} />
      <Route path="/admin/bookings" element={<ProtectedRoute roles={["admin"]}><AdminBookings /></ProtectedRoute>} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <div className="min-h-screen bg-surface-50 font-sans">
          <Navbar />
          <main className="pt-16">
            <AppRoutes />
          </main>
        </div>
        <Toaster
          position="top-right"
          toastOptions={{
            style: { borderRadius: "12px", fontFamily: "'DM Sans', sans-serif", fontSize: "14px" },
            success: { iconTheme: { primary: "#f97316", secondary: "#fff" } },
          }}
        />
      </AuthProvider>
    </BrowserRouter>
  );
}

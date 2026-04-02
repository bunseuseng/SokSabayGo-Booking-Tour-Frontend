import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { AuthProvider } from "@/contexts/AuthContext";
import Footer from "@/components/Footer";
import PageTransition from "@/components/PageTransition";

// Main site pages
import Index from "./pages/Index";
import TripDetail from "./pages/TripDetail";
import DriverRequest from "./pages/DriverRequest";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import GoogleCallbackPage from "./pages/GoogleCallbackPage";
import NotFound from "./pages/NotFound";

// User pages
import NotificationsPage from "./pages/user/NotificationsPage";
import ProfilePage from "./pages/user/ProfilePage";
import ChatPage from "./pages/user/ChatPage";
import BookingHistory from "./pages/user/BookingHistory";
import BookingPage from "./pages/user/BookingPage";
import SearchPage from "./pages/user/SearchPage";

// Admin pages 
import AdminLayout from "./pages/admin/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminDrivers from "./pages/admin/AdminDrivers";
import AdminUsers from "./pages/admin/AdminUsers";

// Driver pages
import DriverLayout from "./pages/driver/DriverLayout";
import DriverDashboard from "./pages/driver/DriverDashboard";
import DriverTours from "./pages/driver/DriverTours";
import DriverBookings from "./pages/driver/DriverBookings";
import DriverReviews from "./pages/driver/DriverReviews";

const queryClient = new QueryClient();

const AnimatedRoutes = () => {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<PageTransition><Index /></PageTransition>} />
        <Route path="/search" element={<PageTransition><SearchPage /></PageTransition>} />
        <Route path="/trip/:id" element={<PageTransition><TripDetail /></PageTransition>} />
        <Route path="/booking/:id" element={<PageTransition><BookingPage /></PageTransition>} />
        <Route path="/bookings" element={<PageTransition><BookingHistory /></PageTransition>} />
        <Route path="/driver-request" element={<PageTransition><DriverRequest /></PageTransition>} />
        <Route path="/notifications" element={<PageTransition><NotificationsPage /></PageTransition>} />
        <Route path="/chat" element={<PageTransition><ChatPage /></PageTransition>} />
        <Route path="/profile" element={<PageTransition><ProfilePage /></PageTransition>} />
        <Route path="*" element={<PageTransition><NotFound /></PageTransition>} />
      </Routes>
    </AnimatePresence>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Auth pages — no sidebar, no footer */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/oauth/callback" element={<GoogleCallbackPage />} />

            {/* Admin routes — separate layout */}
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminDashboard />} />
              <Route path="drivers" element={<AdminDrivers />} />
              <Route path="users" element={<AdminUsers />} />
            </Route>

            {/* Driver routes — separate layout */}
            <Route path="/driver" element={<DriverLayout />}>
              <Route index element={<DriverDashboard />} />
              <Route path="tours" element={<DriverTours />} />
              <Route path="bookings" element={<DriverBookings />} />
              <Route path="reviews" element={<DriverReviews />} />
            </Route>

            {/* Main site routes — with sidebar + footer */}
            <Route path="*" element={
              <SidebarProvider>
                <div className="min-h-screen flex w-full">
                  <AppSidebar />
                  <div className="flex-1 flex flex-col min-w-0">
                    <header className="h-12 flex items-center border-b border-border bg-card sticky top-0 z-40">
                      <SidebarTrigger className="ml-3" />
                      <span className="ml-3 text-sm font-semibold text-muted-foreground">Soksabay Go</span>
                    </header>
                    <main className="flex-1">
                      <AnimatedRoutes />
                    </main>
                    <Footer />
                  </div>
                </div>
              </SidebarProvider>
            } />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;

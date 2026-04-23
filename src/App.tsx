import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, useLocation, Navigate } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { NotificationProvider } from "@/contexts/NotificationContext";
import { ChatProvider } from "@/contexts/ChatContext";
import Footer from "@/components/Footer";
import PageTransition from "@/components/PageTransition";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Main site pages
import Index from "./pages/Index";
import TripDetail from "./pages/TripDetail";
import DriverRequest from "./pages/DriverRequest";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import GoogleCallbackPage from "./pages/GoogleCallbackPage";
import NotFound from "./pages/NotFound";
import PrivacyPage from "./pages/PrivacyPage";
import TermsPage from "./pages/TermsPage";
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

// Redirects unauthenticated users to home
const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <>{children}</> : <Navigate to="/" replace />;
};

const AnimatedRoutes = () => {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>

        {/* ── Public routes ── */}
        <Route path="/" element={<PageTransition><Index /></PageTransition>} />
        <Route path="/privacy" element={<PageTransition><PrivacyPage /></PageTransition>} />
        <Route path="/terms" element={<PageTransition><TermsPage /></PageTransition>} />
        <Route path="/search" element={<PageTransition><SearchPage /></PageTransition>} />
        <Route path="/trip/:id" element={<PageTransition><TripDetail /></PageTransition>} />
        <Route path="/driver-request" element={<PageTransition><DriverRequest /></PageTransition>} />

        {/* Booking page is public — AuthGuardDialog popup handles auth internally */}
        <Route path="/booking/:id" element={<PageTransition><BookingPage /></PageTransition>} />

        {/* ── Protected routes — redirect to home if not logged in ── */}
        <Route path="/bookings" element={<PrivateRoute><PageTransition><BookingHistory /></PageTransition></PrivateRoute>} />
        <Route path="/notifications" element={<PrivateRoute><PageTransition><NotificationsPage /></PageTransition></PrivateRoute>} />
        <Route path="/chat" element={<PrivateRoute><PageTransition><ChatPage /></PageTransition></PrivateRoute>} />
        <Route path="/profile" element={<PrivateRoute><PageTransition><ProfilePage /></PageTransition></PrivateRoute>} />

        <Route path="*" element={<PageTransition><NotFound /></PageTransition>} />
      </Routes>
    </AnimatePresence>
  );
};

// Routes where the Footer should be hidden
const ROUTES_WITHOUT_FOOTER = ["/chat"];

const MainLayout = () => {
  const location = useLocation();
  const showFooter = !ROUTES_WITHOUT_FOOTER.includes(location.pathname);

  return (
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
          {showFooter && <Footer />}
        </div>
      </div>
    </SidebarProvider>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <NotificationProvider>
        <ChatProvider>
          <TooltipProvider>
            <ToastContainer
              position="top-right"
              autoClose={5000}
              hideProgressBar={false}
              newestOnTop
              closeOnClick
              rtl={false}
              pauseOnFocusLoss
              draggable
              pauseOnHover
              theme="light"
            />
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
                  {/* Chat lives inside driver layout so it keeps the driver sidebar */}
                  <Route path="chat" element={<ChatPage />} />
                </Route>

                {/* Main site routes — with sidebar + conditional footer */}
                <Route path="*" element={<MainLayout />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </ChatProvider>
      </NotificationProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
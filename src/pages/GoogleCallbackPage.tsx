import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const GoogleCallbackPage = () => {
  const navigate = useNavigate();
  const { fetchMe } = useAuth();

  useEffect(() => {
    // After Google OAuth redirect, the cookie is set by the backend.
    // We just need to fetch the current user profile.
    fetchMe()
      .then(() => navigate("/"))
      .catch(() => {
        navigate("/login");
      });
  }, [navigate, fetchMe]);

  return (
    <div className="min-h-screen flex items-center justify-center text-muted-foreground">
      Logging you in...
    </div>
  );
};

export default GoogleCallbackPage;

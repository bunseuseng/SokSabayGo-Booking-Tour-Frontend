import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { AUTH_API } from "@/lib/api";
import { FcGoogle } from "react-icons/fc";
import { Eye, EyeOff } from "lucide-react";

const LoginPage = () => {
  const { login, loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast({ title: "Please fill in all fields", variant: "destructive" });
      return;
    }
    setLoading(true);
    const ok = await login(email, password);
    if (ok) {
      toast({ title: "Welcome back! 👋" });
      navigate("/");
    } else {
      toast({ title: "Invalid credentials", variant: "destructive" });
    }
    setLoading(false);
  };

  const handleGoogleLogin = () => {
    loginWithGoogle();
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center py-10 px-4">
      <div className="w-full max-w-sm">
        <h1 className="text-2xl font-bold text-center mb-2">Welcome Back</h1>
        <p className="text-muted-foreground text-center text-sm mb-8">
          Sign in to your Soksabay Go account
        </p>

        <form onSubmit={handleLogin} className="bg-card rounded-xl border border-border p-6 space-y-4">
          <div>
            <Label className="mb-2 block">Email</Label>
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="h-12" />
          </div>
          <div>
            <Label className="mb-2 block">Password</Label>
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-12 pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>
          <Button type="submit" disabled={loading} className="w-full bg-primary text-primary-foreground hover:bg-primary/90 h-12">
            {loading ? "Signing in..." : "Sign In"}
          </Button>
        </form>

        <div className="flex items-center justify-center my-4">
          <span className="text-sm text-muted-foreground">or</span>
        </div>

        <Button onClick={handleGoogleLogin} variant="outline" className="w-full h-12 flex items-center justify-center gap-2">
          <FcGoogle className="w-5 h-5" />
          Sign in with Google
        </Button>

        <p className="text-center text-sm text-muted-foreground mt-4">
          Don't have an account?{" "}
          <Link to="/register" className="text-primary font-medium hover:underline">Sign up</Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;

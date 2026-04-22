import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { LogIn, UserPlus } from "lucide-react";
import { FcGoogle } from "react-icons/fc";

interface AuthGuardDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  message?: string;
}

const AuthGuardDialog = ({ open, onOpenChange, message }: AuthGuardDialogProps) => {
  const { login, register, loginWithGoogle } = useAuth();
  const [mode, setMode] = useState<"login" | "register">("register");
  const [form, setForm] = useState({ name: "", email: "", contactNumber: "", gender: "", password: "" });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (mode === "login") {
      const ok = await login(form.email, form.password);
      if (ok) {
        toast({ title: "Welcome back! 👋" });
        onOpenChange(false);
      } else {
        toast({ title: "Invalid credentials", variant: "destructive" });
      }
    } else {
      if (!form.name || !form.email || !form.password) {
        toast({ title: "Please fill in all fields", variant: "destructive" });
        setLoading(false);
        return;
      }
      const ok = await register(form.name, form.email, form.contactNumber, form.gender, form.password);
      if (ok) {
        toast({ title: "Account created! 🎉" });
        onOpenChange(false);
      }
    }
    setLoading(false);
  };

  const handleGoogleLogin = () => {
    loginWithGoogle();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {mode === "login" ? <LogIn className="h-5 w-5 text-primary" /> : <UserPlus className="h-5 w-5 text-primary" />}
            {mode === "login" ? "Sign In" : "Create Account"}
          </DialogTitle>
          <DialogDescription>
            {message || "You need an account to continue."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          {mode === "register" && (
            <div>
              <Label className="mb-1.5 block text-sm">Full Name</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="h-11" placeholder="Your name" />
            </div>
          )}
          <div>
            <Label className="mb-1.5 block text-sm">Email</Label>
            <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="h-11" placeholder="you@example.com" />
          </div>
          <div>
            <Label className="mb-1.5 block text-sm">Password</Label>
            <Input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="h-11" placeholder="••••••••" />
          </div>
          <Button type="submit" disabled={loading} className="w-full h-11 bg-primary text-primary-foreground hover:bg-primary/90">
            {loading ? "Please wait..." : mode === "login" ? "Sign In" : "Create Account"}
          </Button>
        </form>

        {/* Divider */}
        <div className="flex items-center gap-3 my-1">
          <div className="flex-1 h-px bg-border" />
          <span className="text-xs text-muted-foreground">or</span>
          <div className="flex-1 h-px bg-border" />
        </div>

        {/* Google OAuth */}
        <Button
          type="button"
          variant="outline"
          onClick={handleGoogleLogin}
          className="w-full h-11 flex items-center justify-center gap-2"
        >
          <FcGoogle className="w-5 h-5" />
          Continue with Google
        </Button>

        <p className="text-center text-sm text-muted-foreground mt-1">
          {mode === "login" ? "Don't have an account? " : "Already have an account? "}
          <button
            type="button"
            onClick={() => setMode(mode === "login" ? "register" : "login")}
            className="text-primary font-medium hover:underline"
          >
            {mode === "login" ? "Sign up" : "Sign in"}
          </button>
        </p>
      </DialogContent>
    </Dialog>
  );
};

export default AuthGuardDialog;
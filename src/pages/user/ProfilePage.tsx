import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { api, AUTH_API, MEDIA_API } from "@/lib/api";
import { Camera, Loader2, Shield, Car, User as UserIcon, Save, ArrowLeft } from "lucide-react";

const roleBadge: Record<string, { label: string; icon: React.ReactNode; className: string }> = {
  ADMIN: { label: "Admin", icon: <Shield size={14} />, className: "bg-primary/10 text-primary" },
  DRIVER: { label: "Driver", icon: <Car size={14} />, className: "bg-success/10 text-success" },
  USER: { label: "User", icon: <UserIcon size={14} />, className: "bg-muted text-muted-foreground" },
};

const ProfilePage = () => {
  const { user, updateUser, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const fileRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    fullName: user?.fullName || "",
    email: user?.email || "",
    contactNumber: user?.contactNumber || "",
    gender: user?.gender || "",
  });
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl || "");
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  if (!isAuthenticated || !user) {
    navigate("/login");
    return null;
  }

  const badge = roleBadge[user.roles[0]] || roleBadge.USER;

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const { data } = await api.post(MEDIA_API.UPLOAD, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setAvatarUrl(data.secure_url);
      toast({ title: "Avatar uploaded ✅" });
    } catch {
      toast({ title: "Upload failed", variant: "destructive" });
    }
    setUploading(false);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // PUT /users/me — adjust if your backend uses a different method/shape
      const { data } = await api.put(AUTH_API.UPDATE_ME, {
        fullName: form.fullName,
        contactNumber: form.contactNumber,
        gender: form.gender,
        avatarUrl,
      });
      updateUser(data);
      toast({ title: "Profile updated! ✅" });
    } catch {
      toast({ title: "Update failed", variant: "destructive" });
    }
    setSaving(false);
  };

  const initials = user.fullName
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="min-h-screen bg-background py-10">
      <div className="container mx-auto px-4 max-w-lg">
        <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft size={16} /> Back
        </button>

        <div className="bg-card rounded-xl border border-border p-6 space-y-6">
          {/* Avatar + Role */}
          <div className="flex flex-col items-center gap-3">
            <div className="relative group">
              {avatarUrl ? (
                <img src={avatarUrl} alt="Avatar" className="w-24 h-24 rounded-full object-cover border-2 border-border" />
              ) : (
                <div className="w-24 h-24 rounded-full bg-primary/10 text-primary flex items-center justify-center text-2xl font-bold border-2 border-border">
                  {initials}
                </div>
              )}
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                disabled={uploading}
                className="absolute bottom-0 right-0 bg-primary text-primary-foreground rounded-full p-1.5 shadow-md hover:bg-primary/90 transition-colors"
              >
                {uploading ? <Loader2 size={14} className="animate-spin" /> : <Camera size={14} />}
              </button>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
            </div>

            <div className="text-center">
              <h1 className="text-xl font-bold">{user.fullName}</h1>
              <p className="text-sm text-muted-foreground">{user.email}</p>
            </div>

            <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${badge.className}`}>
              {badge.icon} {badge.label}
            </span>
          </div>

          <div className="border-t border-border" />

          {/* Edit form */}
          <div className="space-y-4">
            <div>
              <Label className="mb-2 block">Full Name</Label>
              <Input value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} className="h-12" />
            </div>
            <div>
              <Label className="mb-2 block">Email</Label>
              <Input value={form.email} disabled className="h-12 opacity-60 cursor-not-allowed" />
              <p className="text-xs text-muted-foreground mt-1">Email cannot be changed</p>
            </div>
            <div>
              <Label className="mb-2 block">Contact Number</Label>
              <Input value={form.contactNumber} onChange={(e) => setForm({ ...form, contactNumber: e.target.value })} className="h-12" placeholder="+855 ..." />
            </div>
            <div>
              <Label className="mb-2 block">Gender</Label>
              <select
                value={form.gender}
                onChange={(e) => setForm({ ...form, gender: e.target.value })}
                className="h-12 w-full border border-input bg-background rounded-md px-3 text-sm"
              >
                <option value="">Select gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>

            <Button onClick={handleSave} disabled={saving} className="w-full bg-primary text-primary-foreground hover:bg-primary/90 h-12">
              {saving ? <><Loader2 size={16} className="mr-2 animate-spin" /> Saving...</> : <><Save size={16} className="mr-2" /> Save Changes</>}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;

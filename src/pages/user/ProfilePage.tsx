import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { api, AUTH_API, MEDIA_API } from "@/lib/api";
import {
  Camera,
  Loader2,
  Shield,
  Car,
  User as UserIcon,
  Save,
  ArrowLeft,
  Star,
  Mail,
  Phone,
  UserCircle,
  Pencil
} from "lucide-react";
import { motion } from "framer-motion";

const roleBadge: Record<string, { label: string; icon: React.ReactNode; className: string }> = {
  ADMIN: { label: "Admin", icon: <Shield size={14} />, className: "bg-primary/10 text-primary border-primary/20" },
  DRIVER: { label: "Driver", icon: <Car size={14} />, className: "bg-success/10 text-success border-success/20" },
  USER: { label: "User", icon: <UserIcon size={14} />, className: "bg-muted text-muted-foreground border-border" },
};

const ProfilePage = () => {
  const { user, updateUser, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const avatarFileRef = useRef<HTMLInputElement>(null);
  const bannerFileRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    fullName: user?.fullName || "",
    email: user?.email || "",
    contactNumber: user?.contactNumber || "",
    gender: user?.gender || "",
    bio: user?.bio || "",
  });

  const [profileImage, setProfileImage] = useState(user?.profileImage || "");
  const [bannerUrl, setBannerUrl] = useState(user?.bannerUrl || "");
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingBanner, setUploadingBanner] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) navigate("/login");
  }, [isAuthenticated, navigate]);

  if (!user) return null;

  const badge = roleBadge[user.roles[0]] || roleBadge.USER;

  const handleFileUpload = async (file: File, type: 'avatar' | 'banner') => {
    const isAvatar = type === 'avatar';
    isAvatar ? setUploadingAvatar(true) : setUploadingBanner(true);

    try {
      const formData = new FormData();
      formData.append("file", file);
      const { data } = await api.post(MEDIA_API.UPLOAD, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const uploadedUrl = data.secure_url || data.url;
      if (isAvatar) {
        setProfileImage(uploadedUrl);
      } else {
        setBannerUrl(uploadedUrl);
      }
      toast({ title: `${isAvatar ? "Avatar" : "Cover photo"} uploaded ✅` });
    } catch {
      toast({ title: "Upload failed", variant: "destructive" });
    } finally {
      isAvatar ? setUploadingAvatar(false) : setUploadingBanner(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const { data } = await api.put(AUTH_API.UPDATE_ME, {
        ...form,
        profileImage,
        bannerUrl,
      });
      updateUser(data.data || data);
      toast({ title: "Profile updated successfully! ✨" });
    } catch (err: any) {
      toast({
        title: "Update failed",
        description: err.response?.data?.message || "Please try again later",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const initials = user.fullName
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="min-h-screen bg-background/50 pb-20">
      {/* Header Container */}
      <div className="relative">
        {/* Cover Photo */}
        <div className="h-48 md:h-80 bg-muted relative overflow-hidden">
          {bannerUrl ? (
            <img src={bannerUrl} alt="Cover" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-gradient-to-r from-primary/10 via-accent/5 to-primary/10" />
          )}

          <button
            onClick={() => bannerFileRef.current?.click()}
            className="absolute bottom-4 right-4 z-10 flex items-center gap-2 bg-black/60 hover:bg-black/80 backdrop-blur-md text-white px-4 py-2 rounded-full text-xs font-semibold transition-all border border-white/20 shadow-xl"
          >
            {uploadingBanner ? <Loader2 size={14} className="animate-spin" /> : <Camera size={14} />}
            <span>Edit Cover Photo</span>
          </button>
          <input ref={bannerFileRef} type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], 'banner')} />
        </div>

        {/* Profile Identity Bar */}
        <div className="container mx-auto px-4">
          <div className="relative flex flex-col md:flex-row items-center md:items-end -mt-16 md:-mt-24 mb-6 gap-4 md:gap-6">
            {/* Avatar */}
            <div className="relative group">
              <div className="w-32 h-32 md:w-44 md:h-44 rounded-full border-4 border-background bg-card shadow-xl overflow-hidden">
                {profileImage ? (
                  <img src={profileImage} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-primary/10 text-primary flex items-center justify-center text-4xl font-black">
                    {initials}
                  </div>
                )}
              </div>
              <button
                onClick={() => avatarFileRef.current?.click()}
                className="absolute bottom-2 right-2 md:bottom-4 md:right-4 bg-primary text-primary-foreground border-2 border-background rounded-full p-2.5 shadow-xl transition-transform hover:scale-110 z-10"
              >
                {uploadingAvatar ? <Loader2 size={16} className="animate-spin" /> : <Camera size={16} />}
              </button>
              <input ref={avatarFileRef} type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], 'avatar')} />
            </div>

            {/* Name and Basic Info */}
            <div className="flex-1 text-center md:text-left pb-2 md:pb-6">
              <h1 className="text-2xl md:text-4xl font-bold mb-1">{user.fullName}</h1>
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 text-muted-foreground text-sm">
                <span className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border text-[10px] font-bold uppercase tracking-wider ${badge.className}`}>
                  {badge.icon} {badge.label}
                </span>
                {user.bio && <span>•</span>}
                {user.bio && <p className="max-w-md truncate">{user.bio}</p>}
                {(user.ratingCount && user.ratingCount > 0) ? (
                  <>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Star size={14} className="fill-yellow-400 text-yellow-400" />
                      {user.ratingCount} Reviews
                    </span>
                  </>
                ) : null}
              </div>
            </div>

            {/* Header Actions */}
            <div className="hidden md:flex gap-3 pb-6">
              <Button variant="ghost" onClick={() => navigate(-1)}>
                <ArrowLeft size={16} className="mr-2" /> Back
              </Button>
              <Button onClick={handleSave} disabled={saving} className="bg-primary text-primary-foreground">
                {saving ? <Loader2 size={16} className="animate-spin mr-2" /> : <Save size={16} className="mr-2" />}
                Save Profile
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Profile Sections */}
      <div className="container mx-auto px-4 max-w-5xl">
        <div className="grid lg:grid-cols-3 gap-6">

          {/* Left Column - Intro Information */}
          <div className="lg:col-span-1 space-y-6">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-card rounded-xl border border-border p-6 shadow-sm space-y-4"
            >
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold">Intro</h2>
                <Pencil size={14} className="text-muted-foreground/50" />
              </div>
              <p className="text-sm text-center md:text-left text-muted-foreground leading-relaxed">
                {form.bio || "Add a bio to let travelers know more about you!"}
              </p>

              <div className="space-y-3 pt-2">
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <Mail size={16} />
                  <span>{user.email}</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <Phone size={16} />
                  <span>{user.contactNumber || "No phone added"}</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-muted-foreground border-t border-border/50 pt-3 capitalize">
                  <UserCircle size={16} />
                  <span>{user.gender || "Gender not specified"}</span>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Main Column - Edit Form */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-card rounded-2xl border border-border p-6 md:p-8 shadow-sm space-y-8"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold">Personal Information</h2>
                  <Pencil size={14} className="text-muted-foreground/50" />
                </div>
                <div className="md:hidden">
                  <Button onClick={handleSave} disabled={saving} size="sm">
                    {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                  </Button>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Full Name</Label>
                  <Input
                    value={form.fullName}
                    onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                    placeholder="Enter your full name"
                    className="h-11 bg-muted/30 focus-visible:ring-primary"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Email Address</Label>
                  <Input
                    value={user.email}
                    disabled
                    className="h-11 opacity-60 cursor-not-allowed italic"
                  />
                  <p className="text-[10px] text-muted-foreground">Email is used for your account security</p>
                </div>
                <div className="space-y-2">
                  <Label>Contact Number</Label>
                  <Input
                    value={form.contactNumber}
                    onChange={(e) => setForm({ ...form, contactNumber: e.target.value })}
                    placeholder="+855 12 345 678"
                    className="h-11 bg-muted/30"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Gender</Label>
                  <select
                    value={form.gender}
                    onChange={(e) => setForm({ ...form, gender: e.target.value })}
                    className="h-11 w-full border border-input bg-muted/30 rounded-md px-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                  >
                    <option value="">Select gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div className="md:col-span-2 space-y-2">
                  <Label>Bio / Tagline</Label>
                  <Input
                    value={form.bio}
                    onChange={(e) => setForm({ ...form, bio: e.target.value })}
                    placeholder="Short bio about yourself"
                    className="h-11 bg-muted/30"
                  />
                </div>
              </div>

              <div className="pt-4 flex items-center justify-center md:justify-end border-t border-border/50">
                <Button onClick={handleSave} disabled={saving} className="w-full md:w-auto min-w-[160px] h-12 text-base shadow-lg shadow-primary/20">
                  {saving ? <>Saving Changes...</> : <>Save Changes</>}
                </Button>
              </div>
            </motion.div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ProfilePage;

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import AuthGuardDialog from "@/components/AuthGuardDialog";
import { api, DRIVER_API, MEDIA_API } from "@/lib/api";
import { Upload, Loader2 } from "lucide-react";

const DriverRequest = () => {
  const { isAuthenticated } = useAuth();
  const [showAuth, setShowAuth] = useState(false);
  const [form, setForm] = useState({
    nationalId: "",
    licenseNumber: "",
    vehicleType: "",
  });
  const [idCardImageUrl, setIdCardImageUrl] = useState("");
  const [idCardPublicId, setIdCardPublicId] = useState("");
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const { data } = await api.post(MEDIA_API.UPLOAD, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setIdCardImageUrl(data.secure_url);
      setIdCardPublicId(data.public_id);
      toast({ title: "ID card uploaded ✅" });
    } catch {
      toast({ title: "Upload failed", variant: "destructive" });
    }
    setUploading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) { setShowAuth(true); return; }
    if (!form.nationalId || !form.licenseNumber || !form.vehicleType || !idCardImageUrl) {
      toast({ title: "Please fill in all fields and upload your ID card", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      await api.post(DRIVER_API.APPLY, {
        ...form,
        idCardImageUrl,
        idCardPublicId,
      });
      toast({ title: "Application Submitted! 🚗", description: "We'll review your request and get back to you soon." });
      setForm({ nationalId: "", licenseNumber: "", vehicleType: "" });
      setIdCardImageUrl("");
      setIdCardPublicId("");
    } catch {
      toast({ title: "Submission failed", variant: "destructive" });
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-background py-10">
      <AuthGuardDialog open={showAuth} onOpenChange={setShowAuth} message="Please create an account before requesting to become a driver." />
      <div className="container mx-auto px-4 max-w-lg">
        <div className="text-center mb-8">
          <h1 className="text-2xl md:text-3xl font-bold">Become a Driver</h1>
          <p className="text-muted-foreground mt-2">Join our network and earn money giving rides</p>
        </div>
        <form onSubmit={handleSubmit} className="bg-card rounded-xl border border-border p-6 space-y-5">
          <div>
            <Label className="mb-2 block">National ID *</Label>
            <Input value={form.nationalId} onChange={(e) => setForm({ ...form, nationalId: e.target.value })} className="h-12" placeholder="NID-123456" />
          </div>
          <div>
            <Label className="mb-2 block">License Number *</Label>
            <Input value={form.licenseNumber} onChange={(e) => setForm({ ...form, licenseNumber: e.target.value })} className="h-12" placeholder="LIC-998877" />
          </div>
          <div>
            <Label className="mb-2 block">Vehicle Type *</Label>
            <Input value={form.vehicleType} onChange={(e) => setForm({ ...form, vehicleType: e.target.value })} className="h-12" placeholder="SUV / 7-Seater" />
          </div>
          <div>
            <Label className="mb-2 block">ID Card Photo *</Label>
            <div className="border-2 border-dashed border-border rounded-lg p-4 text-center">
              {idCardImageUrl ? (
                <div className="space-y-2">
                  <img src={idCardImageUrl} alt="ID Card" className="mx-auto max-h-40 rounded-lg object-cover" />
                  <p className="text-xs text-muted-foreground">Uploaded successfully</p>
                </div>
              ) : (
                <label className="cursor-pointer flex flex-col items-center gap-2">
                  {uploading ? <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /> : <Upload className="h-8 w-8 text-muted-foreground" />}
                  <span className="text-sm text-muted-foreground">{uploading ? "Uploading..." : "Click to upload ID card"}</span>
                  <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={uploading} />
                </label>
              )}
            </div>
          </div>
          <Button type="submit" disabled={loading || uploading} className="w-full bg-primary text-primary-foreground hover:bg-primary/90 h-12 text-base">
            {loading ? "Submitting..." : "Submit Driver Application"}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default DriverRequest;

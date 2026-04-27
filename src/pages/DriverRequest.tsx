import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import AuthGuardDialog from "@/components/AuthGuardDialog";
import { api, DRIVER_API, MEDIA_API } from "@/lib/api";
import { Upload, Loader2, Clock, CheckCircle, XCircle, RefreshCw } from "lucide-react";

interface DriverApplication {
  id: number;
  nationalId: string;
  licenseNumber: string;
  vehicleType: string;
  idCardImageUrl: string;
  idCardPublicId: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  rejectionReason: string | null;
  reviewedAt: string | null;
  createdAt: string;
}

const DriverRequest = () => {
  const { isAuthenticated } = useAuth();
  const [showAuth, setShowAuth] = useState(false);
  const [existing, setExisting] = useState<DriverApplication | null>(null);
  const [checkingStatus, setCheckingStatus] = useState(true);
  const [form, setForm] = useState({ nationalId: "", licenseNumber: "", vehicleType: "" });
  const [idCardImageUrl, setIdCardImageUrl] = useState("");
  const [idCardPublicId, setIdCardPublicId] = useState("");
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) { setCheckingStatus(false); return; }
    api.get(DRIVER_API.MY)
      .then(({ data }) => {
        const app = data.data || data;
        if (app && app.id) setExisting(app);
      })
      .catch(() => {})
      .finally(() => setCheckingStatus(false));
  }, [isAuthenticated]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const { data } = await api.post(MEDIA_API.UPLOAD, formData, { headers: { "Content-Type": "multipart/form-data" } });
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
      const payload = { ...form, idCardImageUrl, idCardPublicId };
      if (existing && existing.status === "REJECTED") {
        const { data } = await api.put(DRIVER_API.REAPPLY(existing.id), payload);
        setExisting(data.data || data);
        toast({ title: "Application re-submitted! 🚗" });
      } else {
        const { data } = await api.post(DRIVER_API.APPLY, payload);
        setExisting(data.data || data);
        toast({ title: "Application Submitted! 🚗", description: "We'll review your request and get back to you soon." });
      }
      setForm({ nationalId: "", licenseNumber: "", vehicleType: "" });
      setIdCardImageUrl("");
      setIdCardPublicId("");
    } catch (err: any) {
      toast({ title: err?.response?.data?.message || "Submission failed", variant: "destructive" });
    }
    setLoading(false);
  };

  if (checkingStatus) {
    return <div className="min-h-screen flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>;
  }

  // Show status page for PENDING or APPROVED
  if (existing && existing.status === "PENDING") {
    return (
      <div className="min-h-screen bg-background py-10">
        <div className="container mx-auto px-4 max-w-lg text-center">
          <div className="bg-card rounded-xl border border-border p-8">
            <Clock className="h-16 w-16 text-accent mx-auto mb-4" />
            <h1 className="text-2xl font-bold mb-2">Application Under Review</h1>
            <p className="text-muted-foreground mb-4">Your driver application is being reviewed by our team. We'll notify you once it's processed.</p>
            {/* <p className="text-xs text-muted-foreground">Submitted: {new Date(existing.createdAt).toLocaleString()}</p> */}
          </div>
        </div>
      </div>
    );
  }

  if (existing && existing.status === "APPROVED") {
    return (
      <div className="min-h-screen bg-background py-10">
        <div className="container mx-auto px-4 max-w-lg text-center">
          <div className="bg-card rounded-xl border border-border p-8">
            <CheckCircle className="h-16 w-16 text-success mx-auto mb-4" />
            <h1 className="text-2xl font-bold mb-2">You're a Verified Driver! 🎉</h1>
            <p className="text-muted-foreground">Your application has been approved. You can now create trips from the Driver Panel.</p>
          </div>
        </div>
      </div>
    );
  }

  // Show form for new application or REJECTED reapply
  const isReapply = existing?.status === "REJECTED";

  return (
    <div className="min-h-screen bg-background py-10">
      <AuthGuardDialog open={showAuth} onOpenChange={setShowAuth} message="Please create an account before requesting to become a driver." />
      <div className="container mx-auto px-4 max-w-lg">
        <div className="text-center mb-8">
          <h1 className="text-2xl md:text-3xl font-bold">{isReapply ? "Reapply as Driver" : "Become a Driver"}</h1>
          <p className="text-muted-foreground mt-2">
            {isReapply ? "Your previous application was rejected. Please update your details and try again." : "Join our network and earn money giving rides"}
          </p>
        </div>

        {isReapply && existing?.rejectionReason && (
          <div className="bg-destructive/10 border border-destructive/20 rounded-xl p-4 mb-6 flex items-start gap-3">
            <XCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-destructive">Rejection Reason</p>
              <p className="text-sm text-muted-foreground">{existing.rejectionReason}</p>
            </div>
          </div>
        )}

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
              <Label className="mb-2 block"> ID Card Public ID</Label>
              <Input value={idCardPublicId} readOnly className="h-12 bg-muted/50 cursor-not-allowed" placeholder="Public ID from media service" />
          <div>

          </div>
          <Button type="submit" disabled={loading || uploading} className="w-full bg-primary text-primary-foreground hover:bg-primary/90 h-12 text-base">
            {loading ? "Submitting..." : isReapply ? (
              <><RefreshCw className="h-4 w-4 mr-2" /> Reapply</>
            ) : "Submit Driver Application"}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default DriverRequest;

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import { CheckCircle, XCircle, Loader2, Eye } from "lucide-react";
import { api, ADMIN_DRIVER_API } from "@/lib/api";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface DriverApp {
  id: number;
  nationalId: string;
  licenseNumber: string;
  vehicleType: string;
  idCardImageUrl: string;
  status: string;
  rejectionReason?: string;
  userFullName?: string;
  userEmail?: string;
  createdAt?: string;
  [key: string]: any;
}

const AdminDrivers = () => {
  const [apps, setApps] = useState<DriverApp[]>([]);
  const [loading, setLoading] = useState(true);
  const [rejectId, setRejectId] = useState<number | null>(null);
  const [reason, setReason] = useState("");
  const [viewApp, setViewApp] = useState<DriverApp | null>(null);

  const fetchApps = () => {
    api.get(ADMIN_DRIVER_API.LIST)
      .then(({ data }) => setApps(data.data || []))
      .catch(() => toast({ title: "Failed to load applications", variant: "destructive" }))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchApps(); }, []);

  const handleApprove = async (id: number) => {
    try {
      await api.patch(ADMIN_DRIVER_API.APPROVE(id));
      toast({ title: "Application approved ✅" });
      fetchApps();
    } catch {
      toast({ title: "Failed to approve", variant: "destructive" });
    }
  };

  const handleReject = async () => {
    if (rejectId === null) return;
    try {
      await api.patch(ADMIN_DRIVER_API.REJECT(rejectId), { reason });
      toast({ title: "Application rejected" });
      setRejectId(null);
      setReason("");
      fetchApps();
    } catch {
      toast({ title: "Failed to reject", variant: "destructive" });
    }
  };

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Manage Driver Applications</h1>

      {/* Reject reason dialog */}
      <Dialog open={rejectId !== null} onOpenChange={(open) => { if (!open) { setRejectId(null); setReason(""); } }}>
        <DialogContent>
          <DialogHeader><DialogTitle>Reject Application</DialogTitle></DialogHeader>
          <div className="space-y-3 mt-2">
            <Input placeholder="Reason for rejection..." value={reason} onChange={(e) => setReason(e.target.value)} />
            <Button onClick={handleReject} className="w-full bg-destructive text-destructive-foreground hover:bg-destructive/90">Confirm Rejection</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* View detail dialog */}
      <Dialog open={viewApp !== null} onOpenChange={(open) => { if (!open) setViewApp(null); }}>
        <DialogContent>
          <DialogHeader><DialogTitle>Application Details</DialogTitle></DialogHeader>
          {viewApp && (
            <div className="space-y-3 mt-2 text-sm">
              <div><span className="text-muted-foreground">Name:</span> <span className="font-medium">{viewApp.userFullName}</span></div>
              <div><span className="text-muted-foreground">Email:</span> <span className="font-medium">{viewApp.userEmail}</span></div>
              <div><span className="text-muted-foreground">National ID:</span> <span className="font-medium">{viewApp.nationalId}</span></div>
              <div><span className="text-muted-foreground">License:</span> <span className="font-medium">{viewApp.licenseNumber}</span></div>
              <div><span className="text-muted-foreground">Vehicle:</span> <span className="font-medium">{viewApp.vehicleType}</span></div>
              <div><span className="text-muted-foreground">Status:</span> <span className="font-medium">{viewApp.status}</span></div>
              {viewApp.idCardImageUrl && <img src={viewApp.idCardImageUrl} alt="ID Card" className="w-full rounded-lg border border-border" />}
            </div>
          )}
        </DialogContent>
      </Dialog>

      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted">
            <tr>
              <th className="text-left p-3 font-medium text-muted-foreground">Applicant</th>
              <th className="text-left p-3 font-medium text-muted-foreground hidden sm:table-cell">Vehicle</th>
              <th className="text-left p-3 font-medium text-muted-foreground">Status</th>
              <th className="text-right p-3 font-medium text-muted-foreground">Actions</th>
            </tr>
          </thead>
          <tbody>
            {apps.map((d) => (
              <tr key={d.id} className="border-t border-border">
                <td className="p-3">
                  <p className="font-medium">{d.userFullName || d.nationalId}</p>
                  <p className="text-xs text-muted-foreground">{d.userEmail}</p>
                </td>
                <td className="p-3 text-muted-foreground hidden sm:table-cell">{d.vehicleType}</td>
                <td className="p-3">
                  <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
                    d.status === "APPROVED" ? "bg-success/10 text-success" : d.status === "REJECTED" ? "bg-destructive/10 text-destructive" : "bg-accent/20 text-accent-foreground"
                  }`}>{d.status}</span>
                </td>
                <td className="p-3 text-right space-x-1">
                  <Button size="sm" variant="ghost" onClick={() => setViewApp(d)}>
                    <Eye className="h-4 w-4" />
                  </Button>
                  {d.status === "PENDING" && (
                    <>
                      <Button size="sm" variant="ghost" className="text-success" onClick={() => handleApprove(d.id)}>
                        <CheckCircle className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="ghost" className="text-destructive" onClick={() => setRejectId(d.id)}>
                        <XCircle className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                </td>
              </tr>
            ))}
            {apps.length === 0 && (
              <tr><td colSpan={4} className="p-6 text-center text-muted-foreground">No applications yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminDrivers;

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";
import { api, ADMIN_DRIVER_API } from "@/lib/api";

interface DriverApp {
  id: number;
  nationalId: string;
  licenseNumber: string;
  vehicleType: string;
  idCardImageUrl: string;
  status: string;
  // user info may vary
  [key: string]: any;
}

const AdminDrivers = () => {
  const [apps, setApps] = useState<DriverApp[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchApps = () => {
    api.get(ADMIN_DRIVER_API.LIST)
      .then(({ data }) => setApps(data.data || []))
      .catch(() => toast({ title: "Failed to load applications", variant: "destructive" }))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchApps(); }, []);

  const handleAction = async (id: number, action: "approve" | "reject") => {
    try {
      const url = action === "approve" ? ADMIN_DRIVER_API.APPROVE(id) : ADMIN_DRIVER_API.REJECT(id);
      await api.patch(url);
      toast({ title: `Application ${action}d ✅` });
      fetchApps();
    } catch {
      toast({ title: `Failed to ${action}`, variant: "destructive" });
    }
  };

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Manage Driver Applications</h1>
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted">
            <tr>
              <th className="text-left p-3 font-medium text-muted-foreground">National ID</th>
              <th className="text-left p-3 font-medium text-muted-foreground hidden sm:table-cell">License</th>
              <th className="text-left p-3 font-medium text-muted-foreground">Vehicle</th>
              <th className="text-left p-3 font-medium text-muted-foreground">Status</th>
              <th className="text-right p-3 font-medium text-muted-foreground">Actions</th>
            </tr>
          </thead>
          <tbody>
            {apps.map((d) => (
              <tr key={d.id} className="border-t border-border">
                <td className="p-3 font-medium">{d.nationalId}</td>
                <td className="p-3 text-muted-foreground hidden sm:table-cell">{d.licenseNumber}</td>
                <td className="p-3 text-muted-foreground">{d.vehicleType}</td>
                <td className="p-3">
                  <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
                    d.status === "APPROVED" ? "bg-success/10 text-success" : d.status === "REJECTED" ? "bg-destructive/10 text-destructive" : "bg-accent/20 text-accent-foreground"
                  }`}>{d.status}</span>
                </td>
                <td className="p-3 text-right space-x-1">
                  {d.status === "PENDING" && (
                    <>
                      <Button size="sm" variant="ghost" className="text-success" onClick={() => handleAction(d.id, "approve")}>
                        <CheckCircle className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="ghost" className="text-destructive" onClick={() => handleAction(d.id, "reject")}>
                        <XCircle className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                </td>
              </tr>
            ))}
            {apps.length === 0 && (
              <tr><td colSpan={5} className="p-6 text-center text-muted-foreground">No applications yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminDrivers;

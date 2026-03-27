import { sampleReviews } from "@/lib/data";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";

// TODO: apiFetch(`${BASE_URL}/admin/reviews`) to load real reviews

const AdminReviews = () => (
  <div>
    <h1 className="text-2xl font-bold mb-6">Manage Reviews</h1>
    <div className="space-y-3">
      {sampleReviews.map((r) => (
        <div key={r.id} className="bg-card rounded-xl border border-border p-4 flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-medium text-sm">{r.userName}</span>
              <span className="text-accent text-sm">{"★".repeat(r.rating)}{"☆".repeat(5 - r.rating)}</span>
              <span className="text-xs text-muted-foreground">{r.date}</span>
            </div>
            <p className="text-sm text-muted-foreground">{r.comment}</p>
          </div>
          <Button size="sm" variant="ghost" className="text-destructive shrink-0" onClick={() => toast({ title: "Review deleted" })}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ))}
    </div>
  </div>
);

export default AdminReviews;

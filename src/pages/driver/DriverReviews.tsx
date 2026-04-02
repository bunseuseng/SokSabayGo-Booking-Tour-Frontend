import { useEffect, useState } from "react";
import { api, REVIEWS_API } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface Review {
  id: number;
  userName: string;
  rating: number;
  comment: string;
  title?: string;
  visitDate?: string;
  travelerType?: string;
  imageUrls?: string[];
}

const DriverReviews = () => {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) return;
    const fetchReviews = async () => {
      try {
        const res = await api.get(REVIEWS_API.FOR_DRIVER(user.id));
        console.log("Reviews response:", res.data); // remove after confirming shape
        setReviews(res.data ?? []);
      } catch (err) {
        console.error("Failed to fetch reviews", err);
        toast({ title: "Failed to load reviews", variant: "destructive" });
      } finally {
        setLoading(false);
      }
    };
    fetchReviews();
  }, [user?.id]);

  if (loading) return <p className="text-muted-foreground text-sm">Loading reviews...</p>;
  if (reviews.length === 0) return <p className="text-muted-foreground text-sm">No reviews yet.</p>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Manage Reviews</h1>
      <div className="space-y-3">
        {reviews.map((r) => (
          <div key={r.id} className="bg-card rounded-xl border border-border p-4 flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="font-medium text-sm">{r.userName}</span>
                <span className="text-accent text-sm">
                  {"★".repeat(r.rating)}{"☆".repeat(5 - r.rating)}
                </span>
                {r.visitDate && (
                  <span className="text-xs text-muted-foreground">{r.visitDate}</span>
                )}
              </div>
              {r.title && <p className="text-sm font-medium">{r.title}</p>}
              <p className="text-sm text-muted-foreground">{r.comment}</p>
            </div>
            <Button
              size="sm"
              variant="ghost"
              className="text-destructive shrink-0"
              onClick={() => toast({ title: "Review deleted" })}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DriverReviews;
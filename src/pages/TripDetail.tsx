import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Star, MapPin, Clock, User, CheckCircle, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import StarRating from "@/components/StarRating";
import { trips, sampleReviews, type Review } from "@/lib/data";
import { toast } from "@/hooks/use-toast";

const TripDetail = () => {
  const { id } = useParams();
  const trip = trips.find((t) => t.id === id);
  const [reviews, setReviews] = useState<Review[]>(sampleReviews);
  const [newRating, setNewRating] = useState(0);
  const [newComment, setNewComment] = useState("");

  if (!trip) {
    return (
      <div className="min-h-screen flex items-center justify-center text-muted-foreground">
        Trip not found
      </div>
    );
  }

  // TODO: Fetch trip details from API:
  // const trip = await apiFetch(TRIPS_API.DETAIL(id));
  // TODO: Fetch reviews from API:
  // const reviews = await apiFetch(TRIPS_API.REVIEWS(id));

  const handleSubmitReview = async () => {
    if (newRating === 0) {
      toast({ title: "Please select a rating", variant: "destructive" });
      return;
    }
    if (!newComment.trim()) {
      toast({ title: "Please write a comment", variant: "destructive" });
      return;
    }

    // TODO: Replace with real API call:
    // await apiFetch(TRIPS_API.SUBMIT_REVIEW(id!), {
    //   method: "POST",
    //   body: JSON.stringify({ rating: newRating, comment: newComment.trim() }),
    // });

    const review: Review = {
      id: `r${Date.now()}`,
      userName: "You",
      rating: newRating,
      comment: newComment.trim(),
      date: new Date().toISOString().split("T")[0],
    };
    setReviews((prev) => [review, ...prev]);
    setNewRating(0);
    setNewComment("");
    toast({ title: "Review submitted!", description: "Thank you for your feedback." });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero image */}
      <div className="relative h-[35vh] md:h-[45vh]">
        <img src={trip.image} alt={trip.title} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-foreground/50 to-transparent" />
        <div className="absolute bottom-6 left-0 right-0 container mx-auto px-4">
          <div className="flex items-center gap-2 text-card/80 text-sm mb-2">
            <MapPin size={14} /> {trip.location}
            <span className="mx-1">·</span>
            <Clock size={14} /> {trip.duration}
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-card">{trip.title}</h1>
        </div>
      </div>

      <div className="container mx-auto px-4 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-8">
            <div>
              <h2 className="text-xl font-bold mb-3">About This Tour</h2>
              <p className="text-muted-foreground leading-relaxed">{trip.description}</p>
            </div>

            <div>
              <h2 className="text-xl font-bold mb-3">Highlights</h2>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {trip.highlights.map((h) => (
                  <li key={h} className="flex items-center gap-2 text-muted-foreground">
                    <CheckCircle size={16} className="text-success shrink-0" /> {h}
                  </li>
                ))}
              </ul>
            </div>

            {/* Write a Review */}
            <div>
              <h2 className="text-xl font-bold mb-4">Write a Review</h2>
              <div className="bg-card p-5 rounded-xl border border-border space-y-4">
                <div>
                  <label className="text-sm font-medium text-card-foreground mb-2 block">Your Rating</label>
                  <StarRating rating={newRating} onChange={setNewRating} size={28} />
                </div>
                <div>
                  <label className="text-sm font-medium text-card-foreground mb-2 block">Your Comment</label>
                  <Textarea
                    placeholder="Share your experience..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    className="min-h-[100px]"
                    maxLength={500}
                  />
                  <p className="text-xs text-muted-foreground mt-1">{newComment.length}/500</p>
                </div>
                <Button onClick={handleSubmitReview} className="bg-primary text-primary-foreground hover:bg-primary/90">
                  <Send size={16} className="mr-2" />
                  Submit Review
                </Button>
              </div>
            </div>

            {/* Reviews */}
            <div>
              <h2 className="text-xl font-bold mb-4">Reviews ({reviews.length})</h2>
              <div className="space-y-4">
                {reviews.map((r) => (
                  <div key={r.id} className="bg-card p-5 rounded-xl border border-border">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold text-sm">{r.userName}</span>
                      <StarRating rating={r.rating} size={14} />
                    </div>
                    <p className="text-muted-foreground text-sm">{r.comment}</p>
                    <p className="text-xs text-muted-foreground/60 mt-2">{r.date}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar booking card */}
          <div>
            <div className="bg-card rounded-xl border border-border p-6 sticky top-20 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <span className="text-3xl font-bold text-primary">${trip.price}</span>
                  <span className="text-muted-foreground text-sm"> / person</span>
                </div>
                <div className="flex items-center gap-1">
                  <Star size={16} className="fill-accent text-accent" />
                  <span className="font-semibold">{trip.rating}</span>
                </div>
              </div>

              {/* Driver info */}
              <div className="flex items-center gap-3 mb-6 p-3 bg-muted rounded-lg">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                  <User size={20} className="text-primary" />
                </div>
                <div>
                  <p className="font-medium text-sm">{trip.driver.name}</p>
                  <p className="text-xs text-muted-foreground">{trip.driver.trips} trips · {trip.driver.rating}★</p>
                </div>
              </div>

              <Link to={`/booking/${trip.id}`}>
                <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90 h-12 text-base">
                  Book This Trip
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TripDetail;

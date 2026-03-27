import { Star } from "lucide-react";

interface StarRatingProps {
  rating: number;
  onChange?: (r: number) => void;
  size?: number;
}

const StarRating = ({ rating, onChange, size = 20 }: StarRatingProps) => (
  <div className="flex gap-0.5">
    {[1, 2, 3, 4, 5].map((i) => (
      <button
        key={i}
        type="button"
        onClick={() => onChange?.(i)}
        className={onChange ? "cursor-pointer" : "cursor-default"}
        disabled={!onChange}
      >
        <Star
          size={size}
          className={`transition-colors ${
            i <= rating ? "fill-accent text-accent" : "text-border"
          }`}
        />
      </button>
    ))}
  </div>
);

export default StarRating;

import type { Booking } from "@/lib/data";

const statusStyles: Record<Booking["status"], string> = {
  pending: "bg-accent/20 text-accent-foreground",
  confirmed: "bg-primary/10 text-primary",
  completed: "bg-success/10 text-success",
  cancelled: "bg-destructive/10 text-destructive",
};

const StatusBadge = ({ status }: { status: Booking["status"] }) => (
  <span className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${statusStyles[status]}`}>
    {status}
  </span>
);

export default StatusBadge;

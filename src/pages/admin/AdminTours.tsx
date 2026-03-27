import { trips } from "@/lib/data";
import { Button } from "@/components/ui/button";
import { Plus, Edit, Trash2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const AdminTours = () => (
  <div>
    <div className="flex items-center justify-between mb-6">
      <h1 className="text-2xl font-bold">Manage Tours</h1>
      {/* TODO: apiFetch(TRIPS_API.LIST) to load real data */}
      <Button className="bg-primary text-primary-foreground hover:bg-primary/90" onClick={() => toast({ title: "Create tour form coming soon!" })}>
        <Plus className="h-4 w-4 mr-2" /> Add Tour
      </Button>
    </div>
    <div className="bg-card rounded-xl border border-border overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-muted">
          <tr>
            <th className="text-left p-3 font-medium text-muted-foreground">Tour</th>
            <th className="text-left p-3 font-medium text-muted-foreground hidden md:table-cell">Location</th>
            <th className="text-left p-3 font-medium text-muted-foreground">Price</th>
            <th className="text-left p-3 font-medium text-muted-foreground hidden sm:table-cell">Rating</th>
            <th className="text-right p-3 font-medium text-muted-foreground">Actions</th>
          </tr>
        </thead>
        <tbody>
          {trips.map((t) => (
            <tr key={t.id} className="border-t border-border">
              <td className="p-3 font-medium">{t.title}</td>
              <td className="p-3 text-muted-foreground hidden md:table-cell">{t.location}</td>
              <td className="p-3">${t.price}</td>
              <td className="p-3 hidden sm:table-cell">⭐ {t.rating}</td>
              <td className="p-3 text-right space-x-1">
                <Button size="sm" variant="ghost" onClick={() => toast({ title: "Edit tour coming soon!" })}><Edit className="h-3.5 w-3.5" /></Button>
                <Button size="sm" variant="ghost" className="text-destructive" onClick={() => toast({ title: "Delete tour coming soon!" })}><Trash2 className="h-3.5 w-3.5" /></Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

export default AdminTours;

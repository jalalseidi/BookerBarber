import { Button } from "./ui/button";
import { Clock } from "lucide-react";

interface TimeSlotGridProps {
  availableSlots: string[];
  selectedSlot: string | null;
  onSelectSlot: (slot: string) => void;
  isLoading?: boolean;
}

export function TimeSlotGrid({ availableSlots, selectedSlot, onSelectSlot, isLoading }: TimeSlotGridProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-3 gap-3">
        {Array.from({ length: 9 }).map((_, i) => (
          <div key={i} className="h-12 bg-muted/50 rounded animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-3 gap-3">
      {availableSlots.map((slot) => (
        <Button
          key={slot}
          variant={selectedSlot === slot ? "default" : "outline"}
          onClick={() => onSelectSlot(slot)}
          className="h-12 flex items-center justify-center gap-2 transition-all duration-200 hover:scale-105"
        >
          <Clock className="h-4 w-4" />
          {slot}
        </Button>
      ))}
    </div>
  );
}
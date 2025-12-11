import { X, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ParticipantCardProps {
  name: string;
  index: number;
  onRemove: () => void;
}

export const ParticipantCard = ({ name, index, onRemove }: ParticipantCardProps) => {
  return (
    <div
      className={cn(
        "group relative flex items-center gap-3 rounded-xl bg-card p-4 shadow-md border border-border/50",
        "transition-all duration-300 hover:shadow-lg hover:scale-[1.02]",
        "animate-fade-in"
      )}
      style={{ animationDelay: `${index * 50}ms` }}
    >
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-secondary/20">
        <User className="h-5 w-5 text-primary" />
      </div>
      <span className="flex-1 font-medium text-foreground">{name}</span>
      <Button
        variant="ghost"
        size="icon"
        onClick={onRemove}
        className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive/10 hover:text-destructive"
      >
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
};

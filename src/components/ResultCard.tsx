import { useState } from "react";
import { Gift, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ResultCardProps {
  giver: string;
  receiver: string;
  index: number;
}

export const ResultCard = ({ giver, receiver, index }: ResultCardProps) => {
  const [revealed, setRevealed] = useState(false);

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl bg-card border border-border/50 p-6",
        "shadow-festive transition-all duration-500",
        revealed && "bg-gradient-to-br from-card via-card to-primary/5",
        "animate-scale-in"
      )}
      style={{ animationDelay: `${index * 100}ms` }}
    >
      <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-accent/20 to-transparent rounded-bl-full" />
      
      <div className="relative">
        <div className="flex items-center gap-4 mb-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-primary to-secondary shadow-md">
            <Gift className="h-6 w-6 text-primary-foreground" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Gift from</p>
            <p className="text-xl font-display font-semibold text-foreground">{giver}</p>
          </div>
        </div>

        <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent my-4" />

        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground mb-1">Giving to</p>
            {revealed ? (
              <p className="text-2xl font-display font-bold text-primary animate-fade-in">
                {receiver}
              </p>
            ) : (
              <div className="flex items-center gap-2 text-muted-foreground">
                <span className="text-lg">• • • • • •</span>
              </div>
            )}
          </div>

          <Button
            variant={revealed ? "ghost" : "gold"}
            size="sm"
            onClick={() => setRevealed(!revealed)}
            className="gap-2"
          >
            {revealed ? (
              <>
                <EyeOff className="h-4 w-4" />
                Hide
              </>
            ) : (
              <>
                <Eye className="h-4 w-4" />
                Reveal
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

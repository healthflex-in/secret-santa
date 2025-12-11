import { useState } from "react";
import { X, UserX } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Exclusion {
  giver: string;
  receiver: string;
}

interface ExclusionSelectorProps {
  participants: string[];
  exclusions: Exclusion[];
  onAddExclusion: (exclusion: Exclusion) => void;
  onRemoveExclusion: (index: number) => void;
}

export const ExclusionSelector = ({
  participants,
  exclusions,
  onAddExclusion,
  onRemoveExclusion,
}: ExclusionSelectorProps) => {
  const [giver, setGiver] = useState<string>("");
  const [receiver, setReceiver] = useState<string>("");

  const handleAdd = () => {
    if (giver && receiver && giver !== receiver) {
      const exists = exclusions.some(
        (e) => e.giver === giver && e.receiver === receiver
      );
      if (!exists) {
        onAddExclusion({ giver, receiver });
        setGiver("");
        setReceiver("");
      }
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <Select value={giver} onValueChange={setGiver}>
          <SelectTrigger className="flex-1 bg-card">
            <SelectValue placeholder="Person who gives..." />
          </SelectTrigger>
          <SelectContent className="bg-card border-border">
            {participants.map((p) => (
              <SelectItem key={p} value={p}>
                {p}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <span className="text-muted-foreground self-center hidden sm:block">
          can't give to
        </span>

        <Select value={receiver} onValueChange={setReceiver}>
          <SelectTrigger className="flex-1 bg-card">
            <SelectValue placeholder="Person who receives..." />
          </SelectTrigger>
          <SelectContent className="bg-card border-border">
            {participants
              .filter((p) => p !== giver)
              .map((p) => (
                <SelectItem key={p} value={p}>
                  {p}
                </SelectItem>
              ))}
          </SelectContent>
        </Select>

        <Button
          variant="christmas"
          onClick={handleAdd}
          disabled={!giver || !receiver || giver === receiver}
        >
          Add Rule
        </Button>
      </div>

      {exclusions.length > 0 && (
        <div className="space-y-2">
          {exclusions.map((exclusion, index) => (
            <div
              key={index}
              className="flex items-center gap-3 rounded-lg bg-muted/50 p-3 animate-fade-in"
            >
              <UserX className="h-4 w-4 text-muted-foreground" />
              <span className="flex-1 text-sm">
                <span className="font-medium text-foreground">{exclusion.giver}</span>
                <span className="text-muted-foreground"> can't give to </span>
                <span className="font-medium text-foreground">{exclusion.receiver}</span>
              </span>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 hover:bg-destructive/10 hover:text-destructive"
                onClick={() => onRemoveExclusion(index)}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

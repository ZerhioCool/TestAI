"use client";

import { Button } from "@/components/ui/button";
import { Volume2, VolumeX } from "lucide-react";

interface AudioToggleProps {
  isPlaying: boolean;
  onToggle: () => void;
}

export function AudioToggle({ isPlaying, onToggle }: AudioToggleProps) {
  return (
    <Button
      variant="outline"
      size="icon"
      className={`rounded-full shadow-sm transition-all ${isPlaying ? 'bg-primary/10 border-primary text-primary' : 'bg-muted'}`}
      onClick={onToggle}
      title={isPlaying ? "Silenciar música" : "Activar música"}
    >
      {isPlaying ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
    </Button>
  );
}

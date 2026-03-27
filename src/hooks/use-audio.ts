"use client";

import { useState, useEffect, useRef, useCallback } from "react";

const sounds = {
  bg: "https://cdn.pixabay.com/audio/2022/01/18/audio_d0a13d6935.mp3",
  success: "https://cdn.pixabay.com/audio/2021/08/04/audio_0625c1109a.mp3",
  error: "https://cdn.pixabay.com/audio/2021/08/04/audio_bb667950c0.mp3",
  finish: "https://cdn.pixabay.com/audio/2021/08/04/audio_959392e273.mp3",
};

export function useAudio() {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    audioRef.current = new Audio(sounds.bg);
    audioRef.current.loop = true;
    audioRef.current.volume = 0.3;

    return () => {
      audioRef.current?.pause();
    };
  }, []);

  const toggleMusic = useCallback(() => {
    if (isPlaying) {
      audioRef.current?.pause();
    } else {
      audioRef.current?.play().catch(e => console.log("User interaction required"));
    }
    setIsPlaying(!isPlaying);
  }, [isPlaying]);

  const playOneShot = useCallback((type: keyof typeof sounds) => {
    if (type === "bg") return;
    const sfx = new Audio(sounds[type]);
    sfx.volume = 0.5;
    sfx.play().catch(e => {});
  }, []);

  return { isPlaying, toggleMusic, playOneShot };
}

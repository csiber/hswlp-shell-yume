"use client";

import { useEffect, useRef } from "react";
import type WaveSurferType from "wavesurfer.js";

export default function AudioWaveform({ src }: { src: string }) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const waveRef = useRef<WaveSurferType | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    if (waveRef.current) {
      waveRef.current.destroy();
      waveRef.current = null;
    }

    let ws: WaveSurferType | null = null;
    import("wavesurfer.js").then(({ default: WaveSurferLib }) => {
      ws = WaveSurferLib.create({
        container: containerRef.current!,
        waveColor: "#888",
        progressColor: "#0ea5e9",
        cursorColor: "#0ea5e9",
        height: 80,
        barWidth: 2,
      });

      ws.load(src);
      waveRef.current = ws;
    });

    return () => {
      ws?.destroy();
    };
  }, [src]);

  const togglePlay = () => {
    waveRef.current?.playPause();
  };

  return (
    <div
      ref={containerRef}
      onClick={togglePlay}
      className="w-full cursor-pointer"
    />
  );
}

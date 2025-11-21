"use client";

import { animate } from "framer-motion";
import { useEffect, useState } from "react";

export function useAnimatedText(text: string, delimiter: string = "") {
  const [cursor, setCursor] = useState(0);
  const [startingCursor, setStartingCursor] = useState(0);
  const [prevText, setPrevText] = useState(text);

  if (prevText !== text) {
    setPrevText(text);
    setStartingCursor(text.startsWith(prevText) ? cursor : 0);
  }

  useEffect(() => {
    // If text is empty, return immediately without animation
    if (!text) {
      setCursor(0);
      return;
    }

    const parts = text.split(delimiter);
    // Faster typing speeds - reduced duration for all modes
    const duration = delimiter === "" ? 2 : // Character animation (was 8, now 2 - 4x faster)
                    delimiter === " " ? 1 : // Word animation (was 4, now 1 - 4x faster)
                    0.5; // Chunk animation (was 2, now 0.5 - 4x faster)
    
    const controls = animate(startingCursor, parts.length, {
      duration,
      ease: "easeOut",
      onUpdate(latest) {
        setCursor(Math.floor(latest));
      },
    });

    return () => controls.stop();
  }, [startingCursor, text, delimiter]);

  // If text is empty, return empty string immediately
  if (!text) {
    return '';
  }

  return text.split(delimiter).slice(0, cursor).join(delimiter);
}
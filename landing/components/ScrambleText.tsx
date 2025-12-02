"use client";

import { useEffect, useRef, useState } from "react";

const SCRAMBLE_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890";

export function ScrambleText({
  text,
  className,
}: {
  text: string;
  className?: string;
}) {
  const [display, setDisplay] = useState(text);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const running = useRef(false);

  useEffect(() => {
    setDisplay(text);
  }, [text]);

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const scramble = () => {
    if (running.current) return;
    if (intervalRef.current) clearInterval(intervalRef.current);
    running.current = true;
    let frame = 0;
    intervalRef.current = setInterval(() => {
      frame += 1;
      setDisplay(() =>
        text
          .split("")
          .map((_, idx) =>
            idx < frame
              ? text[idx]
              : SCRAMBLE_CHARS[Math.floor(Math.random() * SCRAMBLE_CHARS.length)]
          )
          .join("")
      );
      if (frame >= text.length) {
        clearInterval(intervalRef.current as ReturnType<typeof setInterval>);
        setDisplay(text);
        running.current = false;
      }
    }, 30);
  };

  return (
    <span onMouseEnter={scramble} className={className}>
      {display}
    </span>
  );
}

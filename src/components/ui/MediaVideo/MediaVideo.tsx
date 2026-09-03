"use client";

import { useRef } from "react";
import styles from "./MediaVideo.module.css";

type MediaVideoProps = {
  src: string;
  poster?: string;
  aspectRatio?: string;
  className?: string;
  autoPlay?: boolean;
  muted?: boolean;
  loop?: boolean;
  controls?: boolean;
  rounded?: boolean;
};

export function MediaVideo({
  src,
  poster,
  aspectRatio = "16 / 9",
  className = "",
  autoPlay = true,
  muted = true,
  loop = true,
  controls = false,
  rounded = true,
}: MediaVideoProps) {
  const ref = useRef<HTMLVideoElement>(null);

  return (
    <div
      className={[styles.frame, rounded ? styles.rounded : "", className]
        .filter(Boolean)
        .join(" ")}
      style={{ aspectRatio }}
    >
      <video
        ref={ref}
        className={styles.video}
        src={src}
        poster={poster}
        autoPlay={autoPlay}
        muted={muted}
        loop={loop}
        controls={controls}
        playsInline
        preload="metadata"
      />
    </div>
  );
}

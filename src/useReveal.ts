import { useEffect } from "react";

export function useReveal() {
  useEffect(() => {
    const nodes = document.querySelectorAll<HTMLElement>(".reveal");
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.14, rootMargin: "0px 0px -10% 0px" },
    );

    nodes.forEach((node) => observer.observe(node));
    return () => observer.disconnect();
  }, []);
}

export function useScrollVideos() {
  useEffect(() => {
    const videos = document.querySelectorAll<HTMLVideoElement>(
      "video[data-autoplay-on-scroll]",
    );
    if (videos.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const video = entry.target as HTMLVideoElement;
          if (entry.isIntersecting) {
            void video.play().catch(() => undefined);
          } else {
            video.pause();
          }
        }
      },
      { threshold: 0.45 },
    );

    videos.forEach((video) => observer.observe(video));
    return () => observer.disconnect();
  }, []);
}

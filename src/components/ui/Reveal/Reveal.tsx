"use client";

import {
  useEffect,
  useRef,
  useState,
  type ReactNode,
  type CSSProperties,
} from "react";
import styles from "./Reveal.module.css";

type RevealProps = {
  children: ReactNode;
  className?: string;
  /** Delay in ms after entering viewport */
  delay?: number;
  /** fade | fade-up | reveal-media */
  variant?: "fade" | "fade-up" | "reveal-media";
  as?: "div" | "span" | "li" | "article" | "section";
  once?: boolean;
};

export function Reveal({
  children,
  className = "",
  delay = 0,
  variant = "fade-up",
  as: Tag = "div",
  once = true,
}: RevealProps) {
  const ref = useRef<HTMLElement | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (reduceMotion) {
      setVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          if (once) observer.unobserve(entry.target);
        } else if (!once) {
          setVisible(false);
        }
      },
      { threshold: 0.16, rootMargin: "0px 0px -8% 0px" },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [once]);

  const style = {
    "--reveal-delay": `${delay}ms`,
  } as CSSProperties;

  return (
    <Tag
      ref={ref as never}
      className={[
        styles.reveal,
        styles[variant === "fade-up" ? "fadeUp" : variant === "reveal-media" ? "revealMedia" : "fade"],
        visible ? styles.visible : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      style={style}
    >
      {children}
    </Tag>
  );
}

import { useEffect, useState, type ReactNode } from "react";
import { LINE_URL } from "../constants";

export function Em({ children }: { children: ReactNode }) {
  return <span className="em">{children}</span>;
}

export function SectionHead({
  en,
  children,
  light = false,
}: {
  en: string;
  children: ReactNode;
  light?: boolean;
}) {
  return (
    <div className={`section-head reveal ${light ? "is-light" : ""}`}>
      <p className="section-en">{en}</p>
      <h2 className="section-title">{children}</h2>
    </div>
  );
}

export function MediaFrame({
  label,
  ratio = "16 / 9",
  className = "",
}: {
  label: string;
  ratio?: string;
  className?: string;
}) {
  return (
    <figure className={`media-frame ${className}`} style={{ aspectRatio: ratio }}>
      <span className="media-play" aria-hidden>
        ▶
      </span>
      <figcaption>{label}</figcaption>
    </figure>
  );
}

export function LineButton({
  className = "",
  children = "公式LINEで相談する",
}: {
  className?: string;
  children?: string;
}) {
  return (
    <a className={`btn btn-primary ${className}`} href={LINE_URL} target="_blank" rel="noreferrer">
      {children}
      <span className="btn-ico" aria-hidden>
        ▶
      </span>
    </a>
  );
}

export function OutlineButton({
  href,
  children,
  className = "",
}: {
  href: string;
  children: string;
  className?: string;
}) {
  const external = href.startsWith("http");
  return (
    <a
      className={`btn btn-outline ${className}`}
      href={href}
      {...(external ? { target: "_blank", rel: "noreferrer" } : {})}
    >
      {children}
      <span className="btn-ico" aria-hidden>
        ▶
      </span>
    </a>
  );
}

export function useHeaderShrink() {
  const [shrunk, setShrunk] = useState(false);

  useEffect(() => {
    const onScroll = () => setShrunk(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return shrunk;
}

export function useReveal() {
  useEffect(() => {
    const nodes = Array.from(document.querySelectorAll<HTMLElement>(".reveal"));
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" },
    );

    nodes.forEach((node) => observer.observe(node));
    return () => observer.disconnect();
  }, []);
}

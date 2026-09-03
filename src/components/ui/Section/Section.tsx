import type { ReactNode } from "react";
import { Container } from "@/components/ui/Container/Container";
import styles from "./Section.module.css";

type SectionProps = {
  id?: string;
  children: ReactNode;
  className?: string;
  containerClassName?: string;
  width?: "default" | "wide" | "narrow";
  tone?: "default" | "surface" | "elevated";
  spacing?: "default" | "compact" | "none";
  fullBleed?: boolean;
};

export function Section({
  id,
  children,
  className = "",
  containerClassName = "",
  width = "default",
  tone = "default",
  spacing = "default",
  fullBleed = false,
}: SectionProps) {
  return (
    <section
      id={id}
      className={[
        styles.section,
        styles[tone],
        styles[`space-${spacing}`],
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {fullBleed ? (
        children
      ) : (
        <Container width={width} className={containerClassName}>
          {children}
        </Container>
      )}
    </section>
  );
}

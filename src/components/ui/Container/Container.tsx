import type { ReactNode } from "react";
import styles from "./Container.module.css";

type ContainerProps = {
  children: ReactNode;
  className?: string;
  width?: "default" | "wide" | "narrow";
};

export function Container({
  children,
  className = "",
  width = "default",
}: ContainerProps) {
  return (
    <div
      className={[styles.container, styles[width], className]
        .filter(Boolean)
        .join(" ")}
    >
      {children}
    </div>
  );
}

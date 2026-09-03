import type { ReactNode } from "react";
import styles from "./Card.module.css";

type CardProps = {
  children: ReactNode;
  className?: string;
  href?: string;
  as?: "article" | "div" | "li";
  hoverable?: boolean;
};

export function Card({
  children,
  className = "",
  href,
  as: Tag = "article",
  hoverable = true,
}: CardProps) {
  const classes = [
    styles.card,
    hoverable ? styles.hoverable : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const inner = <div className={styles.inner}>{children}</div>;

  if (href) {
    return (
      <Tag className={classes}>
        <a className={styles.link} href={href}>
          {inner}
        </a>
      </Tag>
    );
  }

  return <Tag className={classes}>{inner}</Tag>;
}

type CardMediaProps = {
  children: ReactNode;
  className?: string;
};

export function CardMedia({ children, className = "" }: CardMediaProps) {
  return (
    <div className={[styles.media, className].filter(Boolean).join(" ")}>
      {children}
    </div>
  );
}

type CardBodyProps = {
  children: ReactNode;
  className?: string;
};

export function CardBody({ children, className = "" }: CardBodyProps) {
  return (
    <div className={[styles.body, className].filter(Boolean).join(" ")}>
      {children}
    </div>
  );
}

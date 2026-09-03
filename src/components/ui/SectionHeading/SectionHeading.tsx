import { Reveal } from "@/components/ui/Reveal/Reveal";
import styles from "./SectionHeading.module.css";

type SectionHeadingProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
  className?: string;
  titleAs?: "h1" | "h2" | "h3";
  size?: "default" | "large";
};

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
  className = "",
  titleAs: TitleTag = "h2",
  size = "default",
}: SectionHeadingProps) {
  return (
    <div
      className={[styles.heading, styles[align], styles[size], className]
        .filter(Boolean)
        .join(" ")}
    >
      {eyebrow ? (
        <Reveal>
          <p className={styles.eyebrow}>
            <span className={styles.eyebrowEn}>{eyebrow}</span>
          </p>
        </Reveal>
      ) : null}
      <Reveal delay={80}>
        <TitleTag className={styles.title}>{title}</TitleTag>
      </Reveal>
      {description ? (
        <Reveal delay={140}>
          <p className={styles.description}>{description}</p>
        </Reveal>
      ) : null}
    </div>
  );
}

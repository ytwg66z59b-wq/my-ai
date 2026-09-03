"use client";

import Image from "next/image";
import { Section } from "@/components/ui/Section/Section";
import { Button } from "@/components/ui/Button/Button";
import { Reveal } from "@/components/ui/Reveal/Reveal";
import { content } from "@/content/site";
import { media } from "@/content/media";
import styles from "./Cta.module.css";

export function CtaSection() {
  const data = content.cta;

  return (
    <Section id={data.id} spacing="none" fullBleed className={styles.section}>
      <div className={styles.backdrop} aria-hidden="true">
        <Image
          src={media.cta.image}
          alt=""
          fill
          sizes="100vw"
          className={styles.backdropImage}
          priority={false}
        />
      </div>
      <div className={styles.overlay} />
      <div className={styles.content}>
        <Reveal>
          <p className={styles.eyebrow}>{data.eyebrow}</p>
        </Reveal>
        <Reveal delay={80}>
          <h2 className={styles.title}>{data.title}</h2>
        </Reveal>
        <Reveal delay={140}>
          <p className={styles.description}>{data.description}</p>
        </Reveal>
        <Reveal delay={200}>
          <div className={styles.actions}>
            <Button href={data.button.href}>{data.button.label}</Button>
            <p className={styles.note}>{data.note}</p>
          </div>
        </Reveal>
      </div>
    </Section>
  );
}

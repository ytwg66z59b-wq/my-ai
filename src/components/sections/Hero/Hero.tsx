import { Section } from "@/components/ui/Section/Section";
import { Button } from "@/components/ui/Button/Button";
import { MediaImage } from "@/components/ui/MediaImage/MediaImage";
import { Reveal } from "@/components/ui/Reveal/Reveal";
import { content } from "@/content/site";
import { media } from "@/content/media";
import styles from "./Hero.module.css";

export function HeroSection() {
  const data = content.hero;

  return (
    <Section
      id={data.id}
      className={styles.section}
      spacing="none"
      width="wide"
    >
      <div className={styles.layout}>
        <div className={styles.copy}>
          <Reveal>
            <p className={styles.eyebrow}>{data.eyebrow}</p>
          </Reveal>
          <Reveal delay={80}>
            <h1 className={styles.title}>{data.title}</h1>
          </Reveal>
          <Reveal delay={140}>
            <p className={styles.description}>{data.description}</p>
          </Reveal>
          <Reveal delay={200}>
            <div className={styles.actions}>
              <Button href={data.primaryCta.href}>{data.primaryCta.label}</Button>
              <Button href={data.secondaryCta.href} variant="secondary">
                {data.secondaryCta.label}
              </Button>
            </div>
          </Reveal>
        </div>

        <Reveal className={styles.media} variant="reveal-media" delay={120}>
          <MediaImage
            src={media.hero.image}
            alt={media.hero.alt}
            aspectRatio="4 / 5"
            priority
            sizes="(max-width: 900px) 100vw, 48vw"
            className={styles.image}
          />
        </Reveal>
      </div>
    </Section>
  );
}

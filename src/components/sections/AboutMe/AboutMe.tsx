import { Section } from "@/components/ui/Section/Section";
import { SectionHeading } from "@/components/ui/SectionHeading/SectionHeading";
import { MediaImage } from "@/components/ui/MediaImage/MediaImage";
import { Reveal } from "@/components/ui/Reveal/Reveal";
import { content } from "@/content/site";
import { media } from "@/content/media";
import styles from "./AboutMe.module.css";

export function AboutMeSection() {
  const data = content.aboutMe;

  return (
    <Section id={data.id} tone="elevated">
      <div className={styles.layout}>
        <Reveal variant="reveal-media" className={styles.media}>
          <MediaImage
            src={media.aboutMe.image}
            alt={media.aboutMe.alt}
            aspectRatio="3 / 4"
            sizes="(max-width: 900px) 80vw, 320px"
          />
        </Reveal>
        <div className={styles.copy}>
          <SectionHeading eyebrow={data.eyebrow} title={data.title} />
          <Reveal delay={80}>
            <p className={styles.name}>{data.name}</p>
            <p className={styles.role}>{data.role}</p>
          </Reveal>
          <Reveal delay={120}>
            <p className={styles.description}>{data.description}</p>
          </Reveal>
          <dl className={styles.facts}>
            {data.facts.map((fact, index) => (
              <Reveal key={fact.label} delay={140 + index * 60}>
                <div className={styles.fact}>
                  <dt>{fact.label}</dt>
                  <dd>{fact.value}</dd>
                </div>
              </Reveal>
            ))}
          </dl>
        </div>
      </div>
    </Section>
  );
}

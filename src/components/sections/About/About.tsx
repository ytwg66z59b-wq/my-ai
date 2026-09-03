import { Section } from "@/components/ui/Section/Section";
import { SectionHeading } from "@/components/ui/SectionHeading/SectionHeading";
import { MediaImage } from "@/components/ui/MediaImage/MediaImage";
import { Reveal } from "@/components/ui/Reveal/Reveal";
import { content } from "@/content/site";
import { media } from "@/content/media";
import styles from "./About.module.css";

export function AboutSection() {
  const data = content.about;

  return (
    <Section id={data.id} tone="surface">
      <div className={styles.layout}>
        <div className={styles.copy}>
          <SectionHeading
            eyebrow={data.eyebrow}
            title={data.title}
            description={data.description}
          />
          <ul className={styles.points}>
            {data.points.map((point, index) => (
              <Reveal as="li" key={point.title} delay={index * 80}>
                <div className={styles.point}>
                  <h3 className={styles.pointTitle}>{point.title}</h3>
                  <p className={styles.pointBody}>{point.body}</p>
                </div>
              </Reveal>
            ))}
          </ul>
        </div>
        <Reveal variant="reveal-media" className={styles.media}>
          <MediaImage
            src={media.about.image}
            alt={media.about.alt}
            aspectRatio="4 / 5"
            sizes="(max-width: 900px) 100vw, 42vw"
          />
        </Reveal>
      </div>
    </Section>
  );
}

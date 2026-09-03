import { Section } from "@/components/ui/Section/Section";
import { SectionHeading } from "@/components/ui/SectionHeading/SectionHeading";
import { MediaImage } from "@/components/ui/MediaImage/MediaImage";
import { Reveal } from "@/components/ui/Reveal/Reveal";
import { content } from "@/content/site";
import { media } from "@/content/media";
import styles from "./Philosophy.module.css";

export function PhilosophySection() {
  const data = content.philosophy;

  return (
    <Section id={data.id}>
      <div className={styles.layout}>
        <SectionHeading
          eyebrow={data.eyebrow}
          title={data.title}
          description={data.description}
          align="center"
        />
        <div className={styles.body}>
          <Reveal variant="reveal-media" className={styles.media}>
            <MediaImage
              src={media.philosophy.image}
              alt={media.philosophy.alt}
              aspectRatio="1 / 1"
              sizes="(max-width: 900px) 100vw, 36vw"
            />
          </Reveal>
          <ol className={styles.list}>
            {data.statements.map((item, index) => (
              <Reveal as="li" key={item.label} delay={index * 90}>
                <div className={styles.item}>
                  <span className={styles.label}>{item.label}</span>
                  <div>
                    <h3 className={styles.itemTitle}>{item.title}</h3>
                    <p className={styles.itemBody}>{item.body}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </ol>
        </div>
      </div>
    </Section>
  );
}

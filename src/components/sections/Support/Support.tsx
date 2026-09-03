import { Section } from "@/components/ui/Section/Section";
import { SectionHeading } from "@/components/ui/SectionHeading/SectionHeading";
import { MediaImage } from "@/components/ui/MediaImage/MediaImage";
import { Reveal } from "@/components/ui/Reveal/Reveal";
import { content } from "@/content/site";
import { media } from "@/content/media";
import styles from "./Support.module.css";

export function SupportSection() {
  const data = content.support;

  return (
    <Section id={data.id}>
      <div className={styles.layout}>
        <Reveal variant="reveal-media" className={styles.media}>
          <MediaImage
            src={media.support.image}
            alt={media.support.alt}
            aspectRatio="3 / 2"
            sizes="(max-width: 900px) 100vw, 46vw"
          />
        </Reveal>
        <div className={styles.copy}>
          <SectionHeading
            eyebrow={data.eyebrow}
            title={data.title}
            description={data.description}
          />
          <ul className={styles.list}>
            {data.items.map((item, index) => (
              <Reveal as="li" key={item.title} delay={index * 80}>
                <div className={styles.item}>
                  <h3 className={styles.itemTitle}>{item.title}</h3>
                  <p className={styles.itemBody}>{item.body}</p>
                </div>
              </Reveal>
            ))}
          </ul>
        </div>
      </div>
    </Section>
  );
}

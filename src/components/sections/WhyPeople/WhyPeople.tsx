import { Section } from "@/components/ui/Section/Section";
import { SectionHeading } from "@/components/ui/SectionHeading/SectionHeading";
import { MediaImage } from "@/components/ui/MediaImage/MediaImage";
import { Reveal } from "@/components/ui/Reveal/Reveal";
import { content } from "@/content/site";
import { media } from "@/content/media";
import styles from "./WhyPeople.module.css";

export function WhyPeopleSection() {
  const data = content.whyPeople;

  return (
    <Section id={data.id} tone="surface" width="wide">
      <div className={styles.layout}>
        <SectionHeading
          eyebrow={data.eyebrow}
          title={data.title}
          description={data.description}
          size="large"
        />
        <Reveal variant="reveal-media">
          <MediaImage
            src={media.whyPeople.image}
            alt={media.whyPeople.alt}
            aspectRatio="16 / 9"
            sizes="100vw"
            className={styles.image}
          />
        </Reveal>
        <ul className={styles.grid}>
          {data.highlights.map((item, index) => (
            <Reveal as="li" key={item.title} delay={index * 80}>
              <div className={styles.item}>
                <h3 className={styles.itemTitle}>{item.title}</h3>
                <p className={styles.itemBody}>{item.body}</p>
              </div>
            </Reveal>
          ))}
        </ul>
      </div>
    </Section>
  );
}

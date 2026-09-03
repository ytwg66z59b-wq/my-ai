import { Section } from "@/components/ui/Section/Section";
import { SectionHeading } from "@/components/ui/SectionHeading/SectionHeading";
import { MediaImage } from "@/components/ui/MediaImage/MediaImage";
import { Reveal } from "@/components/ui/Reveal/Reveal";
import { content } from "@/content/site";
import { media } from "@/content/media";
import styles from "./Story.module.css";

export function StorySection() {
  const data = content.story;

  return (
    <Section id={data.id} width="wide">
      <div className={styles.layout}>
        <SectionHeading
          eyebrow={data.eyebrow}
          title={data.title}
          description={data.description}
          size="large"
        />
        <Reveal delay={100}>
          <blockquote className={styles.quote}>{data.quote}</blockquote>
        </Reveal>
        <Reveal variant="reveal-media" delay={60}>
          <MediaImage
            src={media.story.image}
            alt={media.story.alt}
            aspectRatio="16 / 9"
            sizes="100vw"
            className={styles.image}
          />
        </Reveal>
      </div>
    </Section>
  );
}

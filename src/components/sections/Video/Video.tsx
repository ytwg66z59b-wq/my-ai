import { Section } from "@/components/ui/Section/Section";
import { SectionHeading } from "@/components/ui/SectionHeading/SectionHeading";
import { MediaVideo } from "@/components/ui/MediaVideo/MediaVideo";
import { Reveal } from "@/components/ui/Reveal/Reveal";
import { content } from "@/content/site";
import { media } from "@/content/media";
import styles from "./Video.module.css";

export function VideoSection() {
  const data = content.video;

  return (
    <Section id={data.id} width="wide">
      <div className={styles.layout}>
        <SectionHeading
          eyebrow={data.eyebrow}
          title={data.title}
          description={data.description}
          align="center"
        />
        <Reveal variant="reveal-media">
          <MediaVideo
            src={media.video.src}
            poster={media.video.poster}
            aspectRatio="16 / 9"
            className={styles.video}
            controls
            autoPlay={false}
            muted
            loop
          />
        </Reveal>
      </div>
    </Section>
  );
}

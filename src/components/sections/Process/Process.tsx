import { Section } from "@/components/ui/Section/Section";
import { SectionHeading } from "@/components/ui/SectionHeading/SectionHeading";
import { MediaImage } from "@/components/ui/MediaImage/MediaImage";
import { Reveal } from "@/components/ui/Reveal/Reveal";
import { content } from "@/content/site";
import { media } from "@/content/media";
import styles from "./Process.module.css";

export function ProcessSection() {
  const data = content.process;

  return (
    <Section id={data.id}>
      <div className={styles.layout}>
        <div className={styles.intro}>
          <SectionHeading
            eyebrow={data.eyebrow}
            title={data.title}
            description={data.description}
          />
          <Reveal variant="reveal-media">
            <MediaImage
              src={media.process.image}
              alt={media.process.alt}
              aspectRatio="16 / 10"
              sizes="(max-width: 900px) 100vw, 46vw"
            />
          </Reveal>
        </div>
        <ol className={styles.steps}>
          {data.steps.map((step, index) => (
            <Reveal as="li" key={step.number} delay={index * 80}>
              <div className={styles.step}>
                <span className={styles.number}>{step.number}</span>
                <div>
                  <h3 className={styles.stepTitle}>{step.title}</h3>
                  <p className={styles.stepBody}>{step.body}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </ol>
      </div>
    </Section>
  );
}

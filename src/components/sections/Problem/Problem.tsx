import { Section } from "@/components/ui/Section/Section";
import { SectionHeading } from "@/components/ui/SectionHeading/SectionHeading";
import { MediaImage } from "@/components/ui/MediaImage/MediaImage";
import { Card, CardBody } from "@/components/ui/Card/Card";
import { Reveal } from "@/components/ui/Reveal/Reveal";
import { content } from "@/content/site";
import { media } from "@/content/media";
import styles from "./Problem.module.css";

export function ProblemSection() {
  const data = content.problem;

  return (
    <Section id={data.id} tone="elevated">
      <div className={styles.layout}>
        <div className={styles.intro}>
          <SectionHeading
            eyebrow={data.eyebrow}
            title={data.title}
            description={data.description}
          />
          <Reveal variant="reveal-media" className={styles.media}>
            <MediaImage
              src={media.problem.image}
              alt={media.problem.alt}
              aspectRatio="3 / 2"
              sizes="(max-width: 900px) 100vw, 48vw"
            />
          </Reveal>
        </div>
        <ul className={styles.grid}>
          {data.items.map((item, index) => (
            <Reveal as="li" key={item.title} delay={index * 90}>
              <Card hoverable={false}>
                <CardBody>
                  <p className={styles.index}>
                    {String(index + 1).padStart(2, "0")}
                  </p>
                  <h3 className={styles.itemTitle}>{item.title}</h3>
                  <p className={styles.itemBody}>{item.body}</p>
                </CardBody>
              </Card>
            </Reveal>
          ))}
        </ul>
      </div>
    </Section>
  );
}

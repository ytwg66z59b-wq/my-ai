import { Section } from "@/components/ui/Section/Section";
import { SectionHeading } from "@/components/ui/SectionHeading/SectionHeading";
import { MediaImage } from "@/components/ui/MediaImage/MediaImage";
import { Card, CardBody, CardMedia } from "@/components/ui/Card/Card";
import { Reveal } from "@/components/ui/Reveal/Reveal";
import { content } from "@/content/site";
import { media } from "@/content/media";
import styles from "./CaseStudy.module.css";

export function CaseStudySection() {
  const data = content.caseStudy;

  return (
    <Section id={data.id} tone="surface" width="wide">
      <div className={styles.layout}>
        <SectionHeading
          eyebrow={data.eyebrow}
          title={data.title}
          description={data.description}
        />
        <ul className={styles.grid}>
          {data.items.map((item, index) => {
            const image = media.cases[index];
            return (
              <Reveal as="li" key={item.title} delay={index * 90}>
                <Card>
                  <CardMedia>
                    <MediaImage
                      src={image.image}
                      alt={image.alt}
                      aspectRatio="16 / 10"
                      rounded={false}
                      sizes="(max-width: 768px) 100vw, 33vw"
                    />
                  </CardMedia>
                  <CardBody>
                    <p className={styles.tag}>{item.tag}</p>
                    <h3 className={styles.itemTitle}>{item.title}</h3>
                    <p className={styles.itemBody}>{item.body}</p>
                  </CardBody>
                </Card>
              </Reveal>
            );
          })}
        </ul>
      </div>
    </Section>
  );
}

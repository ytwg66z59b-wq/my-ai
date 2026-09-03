import { Section } from "@/components/ui/Section/Section";
import { SectionHeading } from "@/components/ui/SectionHeading/SectionHeading";
import { MediaImage } from "@/components/ui/MediaImage/MediaImage";
import { Card, CardBody, CardMedia } from "@/components/ui/Card/Card";
import { Reveal } from "@/components/ui/Reveal/Reveal";
import { content } from "@/content/site";
import { media } from "@/content/media";
import styles from "./Service.module.css";

export function ServiceSection() {
  const data = content.service;

  return (
    <Section id={data.id} tone="elevated">
      <div className={styles.layout}>
        <SectionHeading
          eyebrow={data.eyebrow}
          title={data.title}
          description={data.description}
        />
        <ul className={styles.grid}>
          {data.items.map((item, index) => {
            const image = media.service[index];
            return (
              <Reveal as="li" key={item.number} delay={index * 90}>
                <Card href={item.href}>
                  <CardMedia>
                    <MediaImage
                      src={image.image}
                      alt={image.alt}
                      aspectRatio="4 / 3"
                      rounded={false}
                      sizes="(max-width: 768px) 100vw, 33vw"
                    />
                  </CardMedia>
                  <CardBody>
                    <p className={styles.number}>{item.number}</p>
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

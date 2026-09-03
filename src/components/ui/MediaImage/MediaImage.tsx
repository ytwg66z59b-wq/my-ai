import Image from "next/image";
import styles from "./MediaImage.module.css";

type MediaImageProps = {
  src: string;
  alt: string;
  /** CSS aspect-ratio value, e.g. "16 / 9" */
  aspectRatio?: string;
  priority?: boolean;
  className?: string;
  sizes?: string;
  rounded?: boolean;
  objectFit?: "cover" | "contain";
};

export function MediaImage({
  src,
  alt,
  aspectRatio = "16 / 9",
  priority = false,
  className = "",
  sizes = "(max-width: 768px) 100vw, 80vw",
  rounded = true,
  objectFit = "cover",
}: MediaImageProps) {
  return (
    <div
      className={[styles.frame, rounded ? styles.rounded : "", className]
        .filter(Boolean)
        .join(" ")}
      style={{ aspectRatio }}
    >
      <Image
        className={[
          styles.image,
          objectFit === "contain" ? styles.contain : styles.cover,
        ].join(" ")}
        src={src}
        alt={alt}
        fill
        sizes={sizes}
        priority={priority}
      />
    </div>
  );
}

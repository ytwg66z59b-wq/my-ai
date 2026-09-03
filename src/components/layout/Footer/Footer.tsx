import { Container } from "@/components/ui/Container/Container";
import { brand, content } from "@/content/site";
import styles from "./Footer.module.css";

export function Footer() {
  const { footer } = content;

  return (
    <footer className={styles.footer}>
      <Container width="wide">
        <div className={styles.inner}>
          <p className={styles.brand}>{brand.name}</p>
          <ul className={styles.links}>
            {footer.links.map((link) => (
              <li key={link.label}>
                <a href={link.href}>{link.label}</a>
              </li>
            ))}
          </ul>
          <p className={styles.copy}>{footer.copyright}</p>
        </div>
      </Container>
    </footer>
  );
}

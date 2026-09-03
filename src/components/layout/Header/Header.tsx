"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/Button/Button";
import { brand, navigation } from "@/content/site";
import { media } from "@/content/media";
import styles from "./Header.module.css";

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const close = () => setOpen(false);

  return (
    <header
      className={[styles.header, scrolled ? styles.scrolled : "", open ? styles.open : ""]
        .filter(Boolean)
        .join(" ")}
    >
      <div className={styles.inner}>
        <a className={styles.logo} href="#hero" onClick={close}>
          <span className={styles.logoMark}>
            <Image
              src={media.logo.src}
              alt={media.logo.alt}
              width={96}
              height={32}
              className={styles.logoImage}
              priority
            />
          </span>
          <span className={styles.logoText}>{brand.logoText}</span>
        </a>

        <nav className={styles.nav} aria-label="Primary">
          <ul className={styles.navList}>
            {navigation.items.map((item) => (
              <li key={item.href}>
                <a className={styles.navLink} href={item.href}>
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
          <Button href={navigation.cta.href} className={styles.cta}>
            {navigation.cta.label}
          </Button>
        </nav>

        <button
          type="button"
          className={styles.menuButton}
          aria-expanded={open}
          aria-controls="mobile-nav"
          aria-label={open ? "メニューを閉じる" : "メニューを開く"}
          onClick={() => setOpen((v) => !v)}
        >
          <span className={styles.menuIcon} data-open={open} />
        </button>
      </div>

      <div
        id="mobile-nav"
        className={[styles.mobilePanel, open ? styles.mobilePanelOpen : ""].join(
          " ",
        )}
        hidden={!open}
      >
        <nav aria-label="Mobile">
          <ul className={styles.mobileList}>
            {navigation.items.map((item) => (
              <li key={item.href}>
                <a className={styles.mobileLink} href={item.href} onClick={close}>
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
          <div className={styles.mobileCta}>
            <Button href={navigation.cta.href} onClick={close}>
              {navigation.cta.label}
            </Button>
          </div>
        </nav>
      </div>
    </header>
  );
}

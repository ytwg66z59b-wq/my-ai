/**
 * Media asset paths.
 * Replace files under /public/image and /public/video — keep the same filenames
 * (or update the paths here) to swap production assets without touching UI code.
 */

export const media = {
  logo: {
    src: "/image/logo.jpg",
    alt: "Logo",
  },
  hero: {
    image: "/image/hero.jpg",
    video: "/video/hero.mp4",
    alt: "Hero visual",
  },
  about: {
    image: "/image/about.jpg",
    video: "/video/about.mp4",
    alt: "About visual",
  },
  story: {
    image: "/image/story.jpg",
    alt: "Story visual",
  },
  problem: {
    image: "/image/problem.jpg",
    alt: "Problem visual",
  },
  philosophy: {
    image: "/image/philosophy.jpg",
    alt: "Philosophy visual",
  },
  whyPeople: {
    image: "/image/why-people.jpg",
    alt: "Why people visual",
  },
  video: {
    poster: "/image/video-poster.jpg",
    src: "/video/main.mp4",
    alt: "Featured video",
  },
  service: [
    { image: "/image/service-01.jpg", alt: "Service 01" },
    { image: "/image/service-02.jpg", alt: "Service 02" },
    { image: "/image/service-03.jpg", alt: "Service 03" },
  ],
  process: {
    image: "/image/process.jpg",
    alt: "Process visual",
  },
  cases: [
    { image: "/image/case-01.jpg", alt: "Case study 01" },
    { image: "/image/case-02.jpg", alt: "Case study 02" },
    { image: "/image/case-03.jpg", alt: "Case study 03" },
  ],
  support: {
    image: "/image/support.jpg",
    alt: "Support visual",
  },
  aboutMe: {
    image: "/image/about-me.jpg",
    alt: "Profile photo",
  },
  cta: {
    image: "/image/cta.jpg",
    alt: "CTA visual",
  },
} as const;

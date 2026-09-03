import { HeroSection } from "@/components/sections/Hero/Hero";
import { AboutSection } from "@/components/sections/About/About";
import { StorySection } from "@/components/sections/Story/Story";
import { ProblemSection } from "@/components/sections/Problem/Problem";
import { PhilosophySection } from "@/components/sections/Philosophy/Philosophy";
import { WhyPeopleSection } from "@/components/sections/WhyPeople/WhyPeople";
import { VideoSection } from "@/components/sections/Video/Video";
import { ServiceSection } from "@/components/sections/Service/Service";
import { ProcessSection } from "@/components/sections/Process/Process";
import { CaseStudySection } from "@/components/sections/CaseStudy/CaseStudy";
import { SupportSection } from "@/components/sections/Support/Support";
import { AboutMeSection } from "@/components/sections/AboutMe/AboutMe";
import { CtaSection } from "@/components/sections/Cta/Cta";

/**
 * LP section order — reorder, add, or remove entries here.
 */
const sections = [
  { id: "hero", Component: HeroSection },
  { id: "about", Component: AboutSection },
  { id: "story", Component: StorySection },
  { id: "problem", Component: ProblemSection },
  { id: "philosophy", Component: PhilosophySection },
  { id: "why-people", Component: WhyPeopleSection },
  { id: "video", Component: VideoSection },
  { id: "service", Component: ServiceSection },
  { id: "process", Component: ProcessSection },
  { id: "case-study", Component: CaseStudySection },
  { id: "support", Component: SupportSection },
  { id: "about-me", Component: AboutMeSection },
  { id: "cta", Component: CtaSection },
] as const;

export default function HomePage() {
  return (
    <main>
      {sections.map(({ id, Component }) => (
        <Component key={id} />
      ))}
    </main>
  );
}

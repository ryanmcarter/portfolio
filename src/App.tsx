import { useEffect, useRef, useState } from "react";
import { ArrowUpRight, Mail } from "lucide-react";
import { motion, useMotionValue, useReducedMotion, useSpring } from "framer-motion";

import { CaseStudyCard } from "@/components/CaseStudyCard";
import { CaseStudyDrawer } from "@/components/CaseStudyDrawer";
import { SiteHeader } from "@/components/SiteHeader";
import { Button } from "@/components/ui/button";
import {
  asset,
  caseStudies,
  contactPage,
  experience,
  getCaseStudy,
  resumeUrl,
} from "@/data/portfolio";

const experienceLogos: Record<string, { alt: string; src: string }> = {
  "Gradle Technologies": {
    alt: "Gradle Technologies logo",
    src: "/assets/gradle-technologies-logo.svg",
  },
  "New York Shipping Exchange": {
    alt: "NYSHEX logo",
    src: "/assets/659983bc280a758d5c24a5f4_nyshex_logo.png",
  },
  "Ribbon Homes": {
    alt: "Ribbon Homes logo",
    src: "/assets/63766153eccee8b49363dfc1_ribbon-logo.svg",
  },
  "Shoflo (acquired)": {
    alt: "Shoflo logo",
    src: "/assets/5d58403ddc65b87a77fd9f23_shoflo_logo_dark.png",
  },
  "Western Pixel": {
    alt: "Western Pixel logo",
    src: "/assets/western-pixel-logo.svg",
  },
};

type HomePageProps = {
  onCloseStudy: () => void;
  onSelectStudy: (slug: string) => void;
  selectedSlug?: string;
};

function SkipLink() {
  return (
    <a
      className="skip-link"
      href="#main-content"
      onClick={() => {
        window.requestAnimationFrame(() => {
          document.getElementById("main-content")?.focus({ preventScroll: true });
        });
      }}
    >
      Skip to main content
    </a>
  );
}

function HomePage({ onCloseStudy, onSelectStudy, selectedSlug }: HomePageProps) {
  const shouldReduceMotion = useReducedMotion();
  const [hoveredCompany, setHoveredCompany] = useState<string | null>(null);
  const [drawerSlug, setDrawerSlug] = useState(selectedSlug);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const isClosingDrawerRef = useRef(false);
  const lastTriggerRef = useRef<HTMLAnchorElement | null>(null);
  const navigateAfterCloseRef = useRef(false);
  const cursorX = useMotionValue(0);
  const cursorY = useMotionValue(0);
  const previewX = useSpring(cursorX, { stiffness: 520, damping: 36, mass: 0.28 });
  const previewY = useSpring(cursorY, { stiffness: 520, damping: 36, mass: 0.28 });
  const hoveredLogo = hoveredCompany ? experienceLogos[hoveredCompany] : null;

  const restoreStudyFocus = (slug?: string) => {
    window.requestAnimationFrame(() => {
      const fallbackTrigger = slug
        ? document.querySelector<HTMLAnchorElement>(
            `.case-study-card a[href="/case-studies/${slug}"]`,
          )
        : null;

      (lastTriggerRef.current ?? fallbackTrigger)?.focus({ preventScroll: true });
    });
  };

  useEffect(() => {
    if (selectedSlug) {
      if (!isClosingDrawerRef.current) {
        setDrawerSlug(selectedSlug);
        const openFrame = window.requestAnimationFrame(() => {
          setIsDrawerOpen(true);
        });

        return () => window.cancelAnimationFrame(openFrame);
      }
      return;
    }

    navigateAfterCloseRef.current = false;
    if (drawerSlug) {
      isClosingDrawerRef.current = true;
      setIsDrawerOpen(false);
    } else {
      isClosingDrawerRef.current = false;
    }
  }, [drawerSlug, selectedSlug]);

  const handleSelectStudy = (slug: string, trigger: HTMLAnchorElement) => {
    lastTriggerRef.current = trigger;
    isClosingDrawerRef.current = false;
    navigateAfterCloseRef.current = false;
    setDrawerSlug(slug);
    onSelectStudy(slug);
  };

  const handleDrawerOpenChange = (open: boolean) => {
    if (open) return;

    isClosingDrawerRef.current = true;
    navigateAfterCloseRef.current = Boolean(selectedSlug);
    setIsDrawerOpen(false);
  };

  const handleDrawerOpenChangeComplete = (open: boolean) => {
    if (open) return;

    const closingSlug = drawerSlug;
    const shouldNavigate = navigateAfterCloseRef.current;
    navigateAfterCloseRef.current = false;

    if (shouldNavigate) onCloseStudy();

    setDrawerSlug(undefined);
    restoreStudyFocus(closingSlug);

    if (!selectedSlug) isClosingDrawerRef.current = false;
  };

  return (
    <>
      <SkipLink />
      <main
        className="flex min-h-svh flex-col overflow-hidden bg-stone-50 text-stone-900 focus:outline-none"
        id="main-content"
        tabIndex={-1}
      >
        <section className="home-intro mx-auto grid w-full max-w-[1440px] gap-y-10 px-4 pt-8 sm:px-8 sm:pt-12 xl:grid-cols-[600px_492px] xl:grid-rows-[auto_1fr] xl:justify-between xl:gap-y-0 xl:px-16 xl:pt-16">
          <motion.div
            animate={{ opacity: 1, y: 0 }}
            className="xl:col-start-1 xl:row-start-1"
            initial={shouldReduceMotion ? false : { opacity: 0, y: 16 }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          >
            <h1 className="text-[32px] font-semibold leading-[1.2]">Ryan Carter</h1>
            <p className="mt-1 text-lg leading-6 text-stone-500">Product Designer</p>
          </motion.div>

          <motion.nav
            aria-label="Ryan Carter links"
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-wrap gap-3 sm:gap-4 xl:col-start-2 xl:row-start-1 xl:justify-self-end xl:pt-5"
            initial={shouldReduceMotion ? false : { opacity: 0, y: 16 }}
            transition={{ delay: 0.08, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          >
            <Button asChild size="lg" variant="floating">
              <a
                className="group"
                href="https://www.linkedin.com/in/ryan-carter-b8902144/?skipRedirect=true"
                rel="noreferrer"
                target="_blank"
              >
                LinkedIn
                <span className="sr-only"> (opens in a new tab)</span>
                <ArrowUpRight
                  aria-hidden="true"
                  className="size-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                />
              </a>
            </Button>
            <Button asChild size="lg" variant="floating">
              <a className="group" href={resumeUrl} rel="noreferrer" target="_blank">
                Résumé
                <span className="sr-only"> (opens in a new tab)</span>
                <ArrowUpRight
                  aria-hidden="true"
                  className="size-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                />
              </a>
            </Button>
            <Button asChild size="lg" variant="floating">
              <a className="group" href="mailto:ryanmichael.carter@gmail.com">
                Email
                <ArrowUpRight
                  aria-hidden="true"
                  className="size-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                />
              </a>
            </Button>
          </motion.nav>

          <motion.div
            animate={{ opacity: 1, y: 0 }}
            className="home-intro-copy space-y-8 text-lg leading-8 sm:text-xl xl:col-start-1 xl:row-start-2 xl:mt-12"
            initial={shouldReduceMotion ? false : { opacity: 0, y: 16 }}
            transition={{ delay: 0.12, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            <p>
              Hi. I’m a Product Designer with 12+ YOE in Product Design &amp; Design Systems.
              Currently I’m leveraging Claude Code &amp; Codex to ship what I’m designing in
              Figma.
            </p>
            <p>
              In the past, I’ve led or contributed to Product Design &amp; Design Systems at
              Gradle, NYSHEX, Ribbon Homes, &amp; Shoflo. I’ve also been freelancing as a
              Founding Designer &amp; Design Engineer on a web &amp; mobile eLearning platform
              for entrepreneurs.
            </p>
            <p>
              I’m currently open to new roles as a Staff or Founding Designer and would love to
              chat.
            </p>
          </motion.div>

          <motion.section
            aria-labelledby="experience-heading"
            animate={{ opacity: 1, y: 0 }}
            className="xl:col-start-2 xl:row-start-2 xl:mt-6"
            initial={shouldReduceMotion ? false : { opacity: 0, y: 16 }}
            transition={{ delay: 0.18, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            <h2
              className="mb-4 text-base font-semibold leading-6 text-neutral-800"
              id="experience-heading"
            >
              Experience
            </h2>
            <div>
              {experience.map(([dates, company, role]) => (
                <div
                  className="relative grid grid-cols-[minmax(0,1fr)_minmax(9rem,auto)] items-center gap-4 border-b border-neutral-200 py-2 text-sm leading-4"
                  key={company}
                  onPointerEnter={(event) => {
                    if (event.pointerType !== "mouse") return;
                    const x = event.clientX + 14;
                    const y = event.clientY + 14;

                    cursorX.jump(x);
                    cursorY.jump(y);
                    previewX.jump(x);
                    previewY.jump(y);
                    setHoveredCompany(company);
                  }}
                  onPointerLeave={() => setHoveredCompany(null)}
                  onPointerMove={(event) => {
                    if (event.pointerType !== "mouse") return;
                    cursorX.set(event.clientX + 14);
                    cursorY.set(event.clientY + 14);
                  }}
                >
                  <div className="min-w-0">
                    <p className="truncate font-medium text-neutral-800">{company}</p>
                    <p className="mt-2 font-mono text-neutral-500">{dates}</p>
                  </div>
                  <p className="font-mono text-neutral-500 sm:whitespace-nowrap sm:text-right">
                    {role}
                  </p>
                </div>
              ))}
            </div>
          </motion.section>
        </section>

        <section
          aria-labelledby="selected-work-heading"
          className="mx-auto mt-12 w-full max-w-[1440px] px-4 pb-12 sm:px-8 xl:px-16"
        >
          <h2 className="sr-only" id="selected-work-heading">
            Selected work
          </h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {caseStudies.map((study, index) => (
              <CaseStudyCard
                {...study}
                index={index}
                key={study.slug}
                onSelect={handleSelectStudy}
              />
            ))}
          </div>
        </section>
      </main>

      {hoveredLogo ? (
        <motion.div
          aria-hidden="true"
          className="pointer-events-none fixed left-0 top-0 z-40 hidden h-12 w-26 items-center justify-center rounded-md border border-neutral-200 bg-white px-3 shadow-xl shadow-neutral-950/10 will-change-transform sm:flex"
          style={{
            x: shouldReduceMotion ? cursorX : previewX,
            y: shouldReduceMotion ? cursorY : previewY,
          }}
        >
          <img
            alt=""
            className="max-h-7 max-w-20 object-contain"
            src={hoveredLogo.src}
          />
        </motion.div>
      ) : null}

      {drawerSlug ? (
        <CaseStudyDrawer
          onOpenChange={handleDrawerOpenChange}
          onOpenChangeComplete={handleDrawerOpenChangeComplete}
          open={isDrawerOpen}
          slug={drawerSlug}
        />
      ) : null}
    </>
  );
}

function ContactPage() {
  return (
    <>
      <SkipLink />
      <SiteHeader active="contact" />
      <main
        className="mx-auto grid min-h-[calc(100svh-88px)] max-w-[1440px] content-center px-4 py-20 focus:outline-none sm:px-8"
        id="main-content"
        tabIndex={-1}
      >
        <motion.section
          animate={{ opacity: 1, y: 0 }}
          initial={{ opacity: 0, y: 28 }}
          transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
        >
          <p className="font-mono text-sm uppercase leading-4 text-accent">Contact</p>
          <h1 className="mt-4 max-w-3xl text-5xl font-medium leading-[1.08] text-ink sm:text-7xl">
            {contactPage.blocks[0]?.text ?? "Let’s get in touch"}
          </h1>
          <p className="mt-6 max-w-2xl text-xl leading-9 text-muted">
            {contactPage.blocks[1]?.text ??
              "Send an email and I will get back to you as soon as I can."}
          </p>
          <div className="mt-10 flex flex-wrap gap-3">
            <Button asChild size="lg">
              <a className="group" href="mailto:ryanmichael.carter@gmail.com">
                <Mail
                  aria-hidden="true"
                  className="size-4 group-hover:translate-x-0.5"
                />
                Send me an email
              </a>
            </Button>
            <Button asChild size="lg" variant="outline">
              <a
                className="group"
                href="https://www.linkedin.com/in/ryan-carter-b8902144/?skipRedirect=true"
                rel="noreferrer"
                target="_blank"
              >
                LinkedIn
                <span className="sr-only"> (opens in a new tab)</span>
                <ArrowUpRight
                  aria-hidden="true"
                  className="size-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                />
              </a>
            </Button>
            <Button asChild size="lg" variant="outline">
              <a className="group" href={resumeUrl} rel="noreferrer" target="_blank">
                Resume
                <span className="sr-only"> (opens in a new tab)</span>
                <ArrowUpRight
                  aria-hidden="true"
                  className="size-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                />
              </a>
            </Button>
          </div>
        </motion.section>
      </main>
    </>
  );
}

function NotFound() {
  return (
    <>
      <SkipLink />
      <SiteHeader />
      <main
        className="mx-auto flex min-h-[calc(100svh-88px)] max-w-[1440px] flex-col justify-center px-4 py-20 focus:outline-none sm:px-8"
        id="main-content"
        tabIndex={-1}
      >
        <p className="font-mono text-sm uppercase leading-4 text-accent">404</p>
        <h1 className="mt-4 text-5xl font-medium text-ink">Page not found</h1>
        <Button asChild className="mt-8 w-fit" variant="outline">
          <a href="/">Back home</a>
        </Button>
      </main>
    </>
  );
}

function App() {
  const [path, setPath] = useState(window.location.pathname);

  useEffect(() => {
    const handlePopState = () => setPath(window.location.pathname);
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  const openStudy = (slug: string) => {
    const nextPath = `/case-studies/${slug}`;
    if (path === nextPath) return;

    window.history.pushState({ portfolioDrawer: true }, "", nextPath);
    setPath(nextPath);
  };

  const closeStudy = () => {
    if (window.history.state?.portfolioDrawer) {
      window.history.back();
      return;
    }

    window.history.replaceState(window.history.state, "", "/");
    setPath("/");
  };

  const selectedSlug = path.startsWith("/case-studies/")
    ? path.split("/").filter(Boolean).at(-1)
    : undefined;

  if (path === "/" || path === "/portfolio/") {
    return <HomePage onCloseStudy={closeStudy} onSelectStudy={openStudy} />;
  }

  if (selectedSlug && getCaseStudy(selectedSlug)) {
    return (
      <HomePage
        onCloseStudy={closeStudy}
        onSelectStudy={openStudy}
        selectedSlug={selectedSlug}
      />
    );
  }

  if (path === "/contact") return <ContactPage />;

  if (path.endsWith(".pdf")) {
    window.location.href = asset(path);
    return null;
  }

  return <NotFound />;
}

export default App;

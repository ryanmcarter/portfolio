import { useEffect, useRef, useState } from "react";
import type { FocusEvent, KeyboardEvent } from "react";
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

function useDelayedValue<T>(value: T, delay: number) {
  const [displayedValue, setDisplayedValue] = useState(value);

  useEffect(() => {
    if (delay === 0) {
      setDisplayedValue(value);
      return;
    }

    const timeout = window.setTimeout(() => setDisplayedValue(value), delay);
    return () => window.clearTimeout(timeout);
  }, [delay, value]);

  return displayedValue;
}

function AnimatedHeroLines({
  lines,
  reduceMotion,
}: {
  lines: { strong?: boolean; text: string }[];
  reduceMotion: boolean;
}) {
  const characterCount = lines.reduce(
    (total, line) => total + line.text.replaceAll(" ", "").length,
    0,
  );
  const characterStep = Math.max(0.003, Math.min(0.012, 0.5 / characterCount));
  let characterIndex = 0;

  return lines.map((line) => (
    <span
      className={line.strong ? "block font-bold" : "block font-medium"}
      key={`${line.text}-${line.strong ? "strong" : "regular"}`}
    >
      {line.text.split(" ").map((word, wordIndex, words) => (
        <span
          className={`inline-block whitespace-nowrap ${wordIndex < words.length - 1 ? "mr-[0.25em]" : ""}`}
          key={`${word}-${wordIndex}`}
        >
          {[...word].map((character, index) => {
            const delay = characterIndex * characterStep;
            characterIndex += 1;

            return (
              <motion.span
                animate={{ filter: "blur(0px)", opacity: 1, scale: 1, y: 0 }}
                className="inline-block will-change-[filter,opacity,transform]"
                initial={
                  reduceMotion
                    ? false
                    : { filter: "blur(7px)", opacity: 0, scale: 0.98, y: 5 }
                }
                key={`${character}-${index}`}
                transition={
                  reduceMotion
                    ? { duration: 0 }
                    : {
                        delay,
                        duration: 0.35,
                        ease: [0.22, 1, 0.36, 1],
                      }
                }
              >
                {character}
              </motion.span>
            );
          })}
        </span>
      ))}
    </span>
  ));
}

type CardMorph = {
  phase: "closing" | "concealing" | "opening" | "revealing";
  rect: {
    height: number;
    left: number;
    top: number;
    width: number;
  };
  slug: string;
  snapshotActive: boolean;
};

type CardMorphOrigin = Omit<CardMorph, "phase">;

function CardSurfaceMorph({
  morph,
  onPhaseComplete,
}: {
  morph: CardMorph;
  onPhaseComplete: (phase: CardMorph["phase"]) => void;
}) {
  const study = getCaseStudy(morph.slug);
  const targetTop = window.matchMedia("(min-width: 640px)").matches ? 24 : 8;
  const isReturningToCard = morph.phase === "closing";
  const isCrossfading = morph.phase === "concealing" || morph.phase === "revealing";
  const targetRect = isReturningToCard
    ? morph.rect
    : {
        height: window.innerHeight - targetTop,
        left: 0,
        top: targetTop,
        width: window.innerWidth,
      };

  return (
    <motion.div
      animate={{
        borderRadius: isReturningToCard ? 16 : 24,
        height: targetRect.height,
        left: targetRect.left,
        opacity: morph.phase === "revealing" ? 0 : 1,
        top: targetRect.top,
        width: targetRect.width,
      }}
      aria-hidden="true"
      className="pointer-events-none fixed z-[60] overflow-hidden border border-stone-200 bg-white shadow-[0_-8px_16px_rgba(231,229,228,0.8)]"
      initial={
        morph.phase === "opening"
          ? {
              borderRadius: 16,
              height: morph.rect.height,
              left: morph.rect.left,
              opacity: 1,
              top: morph.rect.top,
              width: morph.rect.width,
            }
          : {
              borderRadius: 24,
              height: window.innerHeight - targetTop,
              left: 0,
              opacity: 0,
              top: targetTop,
              width: window.innerWidth,
            }
      }
      onAnimationComplete={() => onPhaseComplete(morph.phase)}
      transition={
        isCrossfading
          ? { duration: 0.18, ease: [0.22, 1, 0.36, 1] }
          : {
              borderRadius: { damping: 38, mass: 0.7, stiffness: 460, type: "spring" },
              default: { damping: 38, mass: 0.7, stiffness: 460, type: "spring" },
              opacity: { duration: 0 },
            }
      }
    >
      <div className="relative flex size-full flex-col items-center justify-center gap-4 bg-white p-4 text-center">
        {study && !morph.snapshotActive ? (
          <>
            <span className="relative min-h-0 w-full flex-1 overflow-hidden rounded-sm bg-white">
              <img alt="" className="size-full object-cover" src={study.image} />
            </span>
            <span className="flex w-full shrink-0 flex-col items-center gap-1 whitespace-nowrap">
              <span className="text-xs leading-3 text-stone-500">Product Design</span>
              <span className="w-full truncate text-sm font-medium leading-4 text-stone-900">
                {study.title}
              </span>
            </span>
          </>
        ) : study ? (
          <span className="flex flex-col items-center justify-center gap-4">
            <span className="flex max-w-full flex-col items-center gap-1">
              <span className="text-xs leading-3 text-stone-500">Product Design</span>
              <span className="max-w-full text-balance text-sm font-medium leading-4 text-stone-900">
                {study.title}
              </span>
            </span>
            <span className="flex items-center gap-2 rounded-xl bg-gradient-to-b from-sky-800 to-sky-900 px-4 py-3 text-sm leading-4 text-stone-50 shadow-sm">
              Read case study
              <ArrowUpRight aria-hidden="true" className="size-4" />
            </span>
          </span>
        ) : null}
      </div>
    </motion.div>
  );
}

function HomePage({ onCloseStudy, onSelectStudy, selectedSlug }: HomePageProps) {
  const shouldReduceMotion = useReducedMotion();
  const [hoveredCompany, setHoveredCompany] = useState<string | null>(null);
  const [pointerSlug, setPointerSlug] = useState<string | null>(null);
  const [focusedSlug, setFocusedSlug] = useState<string | null>(null);
  const [drawerSlug, setDrawerSlug] = useState(selectedSlug);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [cardMorph, setCardMorph] = useState<CardMorph | null>(null);
  const cardMorphOriginRef = useRef<CardMorphOrigin | null>(null);
  const isClosingDrawerRef = useRef(false);
  const emailLinkRef = useRef<HTMLAnchorElement | null>(null);
  const lastTriggerRef = useRef<HTMLAnchorElement | null>(null);
  const navigateAfterCloseRef = useRef(false);
  const cursorX = useMotionValue(0);
  const cursorY = useMotionValue(0);
  const previewX = useSpring(cursorX, { stiffness: 520, damping: 36, mass: 0.28 });
  const previewY = useSpring(cursorY, { stiffness: 520, damping: 36, mass: 0.28 });
  const hoveredLogo = hoveredCompany ? experienceLogos[hoveredCompany] : null;
  const activeSlug = pointerSlug ?? focusedSlug;
  const displayedSlug = useDelayedValue(activeSlug, shouldReduceMotion ? 0 : 180);
  const displayedStudy = displayedSlug ? getCaseStudy(displayedSlug) : undefined;
  const isHeroTextExiting = activeSlug !== displayedSlug;
  const heroLines = displayedStudy
    ? [
        { text: displayedStudy.hoverHeadline.lead },
        { strong: true, text: displayedStudy.hoverHeadline.emphasis },
      ]
    : [
        { text: "with 12+ YOE in" },
        { strong: true, text: "Product Design & Design Systems" },
      ];

  const restoreStudyFocus = (slug?: string) => {
    window.requestAnimationFrame(() => {
      const studyHref = slug ? getCaseStudy(slug)?.href : undefined;
      const fallbackTrigger = studyHref
        ? document.querySelector<HTMLAnchorElement>(
            `.case-study-card a[href="${studyHref}"]`,
          )
        : null;

      (lastTriggerRef.current ?? fallbackTrigger)?.focus({ preventScroll: true });
    });
  };

  useEffect(() => {
    if (selectedSlug) {
      if (!isClosingDrawerRef.current) {
        setDrawerSlug(selectedSlug);
        setIsDrawerOpen(true);
      }
      return;
    }

    navigateAfterCloseRef.current = false;
    if (drawerSlug) {
      isClosingDrawerRef.current = true;
      const origin = cardMorphOriginRef.current;

      if (!shouldReduceMotion && origin?.slug === drawerSlug) {
        const morphOrigin = origin as CardMorphOrigin;
        setCardMorph((current) =>
          current?.slug === morphOrigin.slug
            ? { ...current, phase: "closing" }
            : { ...morphOrigin, phase: "concealing" },
        );
      } else {
        setIsDrawerOpen(false);
      }
    } else {
      isClosingDrawerRef.current = false;
    }
  }, [drawerSlug, selectedSlug, shouldReduceMotion]);

  const handleSelectStudy = (slug: string, trigger: HTMLAnchorElement) => {
    lastTriggerRef.current = trigger;
    isClosingDrawerRef.current = false;
    navigateAfterCloseRef.current = false;

    const rect = trigger.getBoundingClientRect();
    const origin: CardMorphOrigin = {
      rect: {
        height: rect.height,
        left: rect.left,
        top: rect.top,
        width: rect.width,
      },
      slug,
      snapshotActive: activeSlug === slug,
    };
    cardMorphOriginRef.current = origin;

    if (!shouldReduceMotion) {
      setCardMorph({ ...origin, phase: "opening" });
    }

    setDrawerSlug(slug);
    onSelectStudy(slug);
  };

  const handleGridBlur = (event: FocusEvent<HTMLDivElement>) => {
    if (event.relatedTarget && event.currentTarget.contains(event.relatedTarget as Node)) {
      return;
    }

    setFocusedSlug(null);
  };

  const handleGridKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== "Tab" || !event.shiftKey) return;

    const firstCard = event.currentTarget.querySelector<HTMLAnchorElement>("a");
    if (event.target !== firstCard) return;

    event.preventDefault();
    setFocusedSlug(null);
    setPointerSlug(null);

    window.requestAnimationFrame(() => {
      emailLinkRef.current?.focus({ preventScroll: true });
    });
  };

  const handleDrawerOpenChange = (open: boolean) => {
    if (open) return;
    if (isClosingDrawerRef.current) return;

    isClosingDrawerRef.current = true;
    navigateAfterCloseRef.current = Boolean(selectedSlug);
    const origin = cardMorphOriginRef.current;

    if (!shouldReduceMotion && origin?.slug === drawerSlug) {
      const morphOrigin = origin as CardMorphOrigin;
      setCardMorph((current) =>
        current?.slug === morphOrigin.slug
          ? { ...current, phase: "closing" }
          : { ...morphOrigin, phase: "concealing" },
      );
    } else {
      setIsDrawerOpen(false);
    }
  };

  const handleMorphPhaseComplete = (phase: CardMorph["phase"]) => {
    if (phase === "opening") {
      setCardMorph((current) => (current ? { ...current, phase: "revealing" } : null));
      return;
    }

    if (phase === "revealing") {
      setCardMorph(null);
      return;
    }

    if (phase === "concealing") {
      setCardMorph((current) => (current ? { ...current, phase: "closing" } : null));
      return;
    }

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
    cardMorphOriginRef.current = null;
    setCardMorph(null);

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
        <section className="mx-auto grid min-h-svh w-full max-w-[1440px] items-center gap-12 px-4 py-12 sm:px-8 xl:grid-cols-[640px_608px] xl:gap-16 xl:px-16 xl:py-16">
          <div className="min-w-0">
            <h1
              aria-label={`I’m a Product Designer ${heroLines.map((line) => line.text).join(" ")}`}
              className="min-h-[7.2rem] text-[32px] leading-[1.2] tracking-[-0.01em] sm:min-h-[9.6rem] xl:min-h-[12rem]"
            >
              <span className="block font-medium">I’m a Product Designer</span>
              <motion.span
                animate={
                  isHeroTextExiting && !shouldReduceMotion
                    ? { filter: "blur(4px)", opacity: 0, y: -6 }
                    : { filter: "blur(0px)", opacity: 1, y: 0 }
                }
                aria-hidden="true"
                className="block"
                key={displayedSlug ?? "default"}
                transition={
                  shouldReduceMotion
                    ? { duration: 0 }
                    : isHeroTextExiting
                      ? { duration: 0.16, ease: "easeOut" }
                      : { duration: 0 }
                }
              >
                <AnimatedHeroLines
                  lines={heroLines}
                  reduceMotion={shouldReduceMotion === true}
                />
              </motion.span>
            </h1>

            <div className="mt-6 grid min-h-[29rem]">
              <motion.div
                animate={{
                  filter: activeSlug && !shouldReduceMotion ? "blur(6px)" : "blur(0px)",
                  opacity: activeSlug ? 0 : 1,
                }}
                aria-hidden={Boolean(activeSlug)}
                className={`col-start-1 row-start-1 flex flex-col gap-6 ${activeSlug ? "pointer-events-none" : ""}`}
                inert={activeSlug ? true : undefined}
                transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.35 }}
              >
                <p className="text-lg leading-8 text-stone-900 sm:text-xl">
                  Currently I’m leveraging Claude Code &amp; Codex to bring my designs to life
                  as real production code. Open to new opportunities as a Founding or Senior+
                  Product Designer.
                </p>

                <nav aria-label="Ryan Carter links" className="flex flex-wrap gap-3 sm:gap-4">
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
                    <a
                      className="group"
                      href="mailto:ryanmichael.carter@gmail.com"
                      ref={emailLinkRef}
                    >
                      Email
                      <ArrowUpRight
                        aria-hidden="true"
                        className="size-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                      />
                    </a>
                  </Button>
                </nav>

                <section aria-labelledby="experience-heading" className="mt-1">
                  <h2
                    className="mb-4 text-base font-semibold leading-6 text-neutral-800"
                    id="experience-heading"
                  >
                    Experience
                  </h2>
                  <div>
                    {experience.map(([dates, company, role]) => (
                      <div
                        className="relative grid grid-cols-[minmax(0,1fr)_minmax(9rem,auto)] items-center gap-4 border-b border-neutral-200 py-2 text-sm leading-4 last:border-b-0 sm:grid-cols-[120px_minmax(0,1fr)_auto] sm:py-4"
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
                        <p className="font-mono text-neutral-500 max-sm:col-start-1 max-sm:row-start-2 max-sm:mt-2">
                          {dates}
                        </p>
                        <p className="truncate font-medium text-neutral-800 max-sm:col-start-1 max-sm:row-start-1">
                          {company}
                        </p>
                        <p className="font-mono text-neutral-500 sm:whitespace-nowrap sm:text-right max-sm:col-start-2 max-sm:row-span-2 max-sm:row-start-1">
                          {role}
                        </p>
                      </div>
                    ))}
                  </div>
                </section>
              </motion.div>

              <motion.p
                animate={{
                  filter:
                    activeSlug && !isHeroTextExiting && !shouldReduceMotion
                      ? "blur(0px)"
                      : shouldReduceMotion
                        ? "blur(0px)"
                        : "blur(4px)",
                  opacity: activeSlug && !isHeroTextExiting ? 1 : 0,
                  y: activeSlug && !isHeroTextExiting ? 0 : 6,
                }}
                aria-hidden={!activeSlug}
                className="col-start-1 row-start-1 text-lg leading-8 text-stone-900 sm:text-xl"
                transition={
                  shouldReduceMotion
                    ? { duration: 0 }
                    : {
                        delay: activeSlug && !isHeroTextExiting ? 0.15 : 0,
                        duration: activeSlug && !isHeroTextExiting ? 0.35 : 0.14,
                      }
                }
              >
                {displayedStudy?.summary}
              </motion.p>
            </div>
          </div>

          <section aria-labelledby="selected-work-heading" className="min-w-0">
            <h2 className="sr-only" id="selected-work-heading">
              Selected work
            </h2>
            <div
              className="grid grid-cols-1 gap-1 sm:grid-cols-2"
              onBlurCapture={handleGridBlur}
              onKeyDownCapture={handleGridKeyDown}
              onPointerLeave={(event) => {
                if (event.pointerType === "mouse") setPointerSlug(null);
              }}
            >
              {caseStudies.map((study, index) => (
                <CaseStudyCard
                  active={activeSlug === study.slug}
                  dimmed={Boolean(activeSlug && activeSlug !== study.slug)}
                  href={study.href}
                  image={study.image}
                  index={index}
                  key={study.slug}
                  onFocus={setFocusedSlug}
                  onPointerEnter={(slug, event) => {
                    if (event.pointerType === "mouse") setPointerSlug(slug);
                  }}
                  onSelect={handleSelectStudy}
                  morphing={cardMorph?.slug === study.slug}
                  slug={study.slug}
                  summary={study.summary}
                  title={study.title}
                />
              ))}
            </div>
          </section>
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
          sharedMorphPhase={cardMorph?.phase}
          slug={drawerSlug}
        />
      ) : null}

      {cardMorph ? (
        <CardSurfaceMorph morph={cardMorph} onPhaseComplete={handleMorphPhaseComplete} />
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
    const study = getCaseStudy(slug);
    if (!study || path === study.href) return;

    window.history.pushState({ portfolioDrawer: true }, "", study.href);
    setPath(study.href);
  };

  const closeStudy = () => {
    if (window.history.state?.portfolioDrawer) {
      window.history.back();
      return;
    }

    window.history.replaceState(window.history.state, "", "/");
    setPath("/");
  };

  const selectedSlug = caseStudies.find((study) => study.href === path)?.slug;

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

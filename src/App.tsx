import { useCallback, useEffect, useRef, useState } from "react";
import type { FocusEvent, MouseEvent, PointerEvent as ReactPointerEvent } from "react";
import { ArrowRight, ArrowUpRight, Mail } from "lucide-react";
import {
  AnimatePresence,
  animate,
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
} from "framer-motion";

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

type PortfolioTheme = "dark" | "light";
type PaintControl = "email" | "fill" | "linkedin" | "resume" | "stop";

const paintBrushRadius = 64;
const flatFloatingButtonClass = "shadow-none hover:shadow-none";
const expandedVerticalHitAreaClass =
  "relative before:absolute before:inset-x-0 before:-inset-y-0.5 before:content-['']";
// Rounded up from the path's 37.695-unit length. The explicit even dash pair
// avoids pathLength and odd-dash normalization differences between SVG engines.
const paintScribbleLength = 38;
const paintScribbleDashArray = `${paintScribbleLength} ${paintScribbleLength}`;
const paintScribblePath =
  "M3 7.07323C4.87917 5.22929 9.29333 1.46132 10.5167 2.77073C12.0625 4.42533 3.93958 8.60976 5.19236 10.4534C6.5156 12.4007 11.1431 5.53623 12.709 6.76549C14.275 7.99483 8.95067 10.7607 10.2035 12.2974C10.7046 12.912 12.0826 11.99 12.709 11.3754";
const paintStopPath = "M16 1L15 2M15 2L14 3M15 2L16 3M15 2L14 1";
const topControlIconColorClass =
  "text-neutral-500 group-hover:text-neutral-900 group-focus-visible:text-neutral-900";
// Retain the card-driven hero implementation for a possible future restore while
// keeping the homepage introduction stable in the current Figma direction.
const enableCardDrivenHero = false;

function oppositeTheme(theme: PortfolioTheme): PortfolioTheme {
  return theme === "light" ? "dark" : "light";
}

function PaintScribbleIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      className={`paint-glyph ${className}`}
      fill="none"
      focusable="false"
      viewBox="0 0 16 16"
    >
      <path className="paint-glyph-base" d={paintScribblePath} />
      <path
        className="paint-glyph-draw"
        d={paintScribblePath}
        strokeDasharray={paintScribbleDashArray}
        strokeDashoffset={paintScribbleLength}
      />
    </svg>
  );
}

function PaintStopIcon() {
  return (
    <svg
      aria-hidden="true"
      className="paint-glyph paint-stop-glyph"
      fill="none"
      focusable="false"
      viewBox="0 0 16.75 16"
    >
      <path className="paint-glyph-base" d={paintScribblePath} />
      <path className="paint-glyph-base" d={paintStopPath} />
      <path
        className="paint-glyph-draw"
        d={paintScribblePath}
        strokeDasharray={paintScribbleDashArray}
        strokeDashoffset={paintScribbleLength}
      />
      <path className="paint-stop-x-pop" d={paintStopPath} />
    </svg>
  );
}

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
  inline = false,
  lines,
  reduceMotion,
}: {
  inline?: boolean;
  lines: { strong?: boolean; text: string }[];
  reduceMotion: boolean;
}) {
  const characterCount = lines.reduce(
    (total, line) => total + line.text.replaceAll(" ", "").length,
    0,
  );
  const characterStep = Math.max(0.003, Math.min(0.012, 0.5 / characterCount));
  let characterIndex = 0;

  return lines.map((line, lineIndex) => (
    <span
      className={
        line.strong
          ? inline
            ? "font-bold"
            : "block font-bold"
          : inline
            ? "font-medium"
            : "block font-medium"
      }
      key={`${line.text}-${line.strong ? "strong" : "regular"}`}
    >
      {inline && lineIndex > 0 ? " " : null}
      {line.text.split(" ").map((word, wordIndex, words) => (
        <span
          className={`inline-block align-top whitespace-nowrap ${wordIndex < words.length - 1 ? "mr-[0.25em]" : ""}`}
          key={`${word}-${wordIndex}`}
        >
          {[...word].map((character, index) => {
            const delay = characterIndex * characterStep;
            characterIndex += 1;

            return (
              <motion.span
                animate={{ filter: "blur(0px)", opacity: 1, scale: 1, y: 0 }}
                className="inline-block align-top will-change-[filter,opacity,transform]"
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

function HomePage({ onCloseStudy, onSelectStudy, selectedSlug }: HomePageProps) {
  const shouldReduceMotion = useReducedMotion();
  const [theme, setTheme] = useState<PortfolioTheme>("light");
  const [paintStartTheme, setPaintStartTheme] = useState<PortfolioTheme>("light");
  const [isPaintMode, setIsPaintMode] = useState(false);
  const [isPaintFlooding, setIsPaintFlooding] = useState(false);
  const [paintMaskSize, setPaintMaskSize] = useState({ height: 1, width: 1 });
  const [paintStatus, setPaintStatus] = useState("");
  const [focusedPaintControl, setFocusedPaintControl] = useState<PaintControl | null>(
    null,
  );
  const [hoveredPaintControl, setHoveredPaintControl] = useState<PaintControl | null>(
    null,
  );
  const [pressedPaintControl, setPressedPaintControl] = useState<PaintControl | null>(
    null,
  );
  const [hoveredCompany, setHoveredCompany] = useState<string | null>(null);
  const [pointerSlug, setPointerSlug] = useState<string | null>(null);
  const [focusedSlug, setFocusedSlug] = useState<string | null>(null);
  const [drawerSlug, setDrawerSlug] = useState(selectedSlug);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const isClosingDrawerRef = useRef(false);
  const lastTriggerRef = useRef<HTMLElement | null>(null);
  const navigateAfterCloseRef = useRef(false);
  const paintAllRef = useRef<HTMLButtonElement | null>(null);
  const paintToggleRef = useRef<HTMLButtonElement | null>(null);
  const paintTogglePointerTypeRef = useRef<string | null>(null);
  const paintFloodAnimationRef = useRef<{ stop: () => void } | null>(null);
  const paintFloodCircleRef = useRef<SVGCircleElement | null>(null);
  const paintFloodSequenceRef = useRef(0);
  const paintPathRef = useRef<SVGPathElement | null>(null);
  const paintPathDataRef = useRef("");
  const previousPaintPointRef = useRef<{ x: number; y: number } | null>(null);
  const pendingPaintPointRef = useRef<{ x: number; y: number } | null>(null);
  const paintFrameRef = useRef<number | null>(null);
  const cursorX = useMotionValue(0);
  const cursorY = useMotionValue(0);
  const previewX = useSpring(cursorX, { stiffness: 520, damping: 36, mass: 0.28 });
  const previewY = useSpring(cursorY, { stiffness: 520, damping: 36, mass: 0.28 });
  const hoveredLogo =
    !isPaintMode && hoveredCompany ? experienceLogos[hoveredCompany] : null;
  const activeSlug =
    enableCardDrivenHero && !isPaintMode ? pointerSlug ?? focusedSlug : null;
  const displayedSlug = useDelayedValue(activeSlug, shouldReduceMotion ? 0 : 180);
  const displayedStudy = displayedSlug ? getCaseStudy(displayedSlug) : undefined;
  const isHeroTextExiting = activeSlug !== displayedSlug;
  const paintTargetTheme = oppositeTheme(paintStartTheme);
  const heroLines = displayedStudy
    ? [
        { text: displayedStudy.hoverHeadline.lead },
        { strong: true, text: displayedStudy.hoverHeadline.emphasis },
      ]
    : [
        { text: "with 12+ YOE in" },
        { strong: true, text: "Product Design & Design Systems" },
      ];

  const clearPaintPath = useCallback(() => {
    if (paintFrameRef.current !== null) {
      window.cancelAnimationFrame(paintFrameRef.current);
      paintFrameRef.current = null;
    }

    paintPathDataRef.current = "";
    pendingPaintPointRef.current = null;
    previousPaintPointRef.current = null;
    paintPathRef.current?.setAttribute("d", "");
  }, []);

  const measurePaintMask = useCallback(() => {
    const root = document.documentElement;
    const body = document.body;

    setPaintMaskSize({
      height: Math.max(window.innerHeight, root.scrollHeight, body.scrollHeight),
      width: Math.max(window.innerWidth, root.scrollWidth, body.scrollWidth),
    });
  }, []);

  const focusPaintToggle = useCallback(() => {
    window.requestAnimationFrame(() => {
      paintToggleRef.current?.focus({ preventScroll: true });
    });
  }, []);

  const resetPaintFlood = useCallback(() => {
    paintFloodSequenceRef.current += 1;
    paintFloodAnimationRef.current?.stop();
    paintFloodAnimationRef.current = null;
    paintFloodCircleRef.current?.setAttribute("r", "0");
  }, []);

  const resetPaintControlInteraction = useCallback(() => {
    setFocusedPaintControl(null);
    setHoveredPaintControl(null);
    setPressedPaintControl(null);
  }, []);

  const cancelPaintMode = useCallback((restoreFocus = true) => {
    resetPaintFlood();
    resetPaintControlInteraction();
    setTheme(paintStartTheme);
    setIsPaintFlooding(false);
    setIsPaintMode(false);
    setPaintStatus(`Painting stopped. ${paintStartTheme} theme restored.`);
    clearPaintPath();
    if (restoreFocus) focusPaintToggle();
  }, [
    clearPaintPath,
    focusPaintToggle,
    paintStartTheme,
    resetPaintControlInteraction,
    resetPaintFlood,
  ]);

  const completePaintTarget = useCallback(() => {
    const completedTheme = oppositeTheme(paintStartTheme);
    resetPaintControlInteraction();
    setTheme(completedTheme);
    setIsPaintFlooding(false);
    setIsPaintMode(false);
    setPaintStatus(`${completedTheme} theme applied.`);
    clearPaintPath();
    focusPaintToggle();
  }, [
    clearPaintPath,
    focusPaintToggle,
    paintStartTheme,
    resetPaintControlInteraction,
  ]);

  const fillPaintTarget = useCallback(() => {
    if (isPaintFlooding || paintFloodAnimationRef.current) return;

    if (shouldReduceMotion) {
      completePaintTarget();
      return;
    }

    const trigger = paintAllRef.current;
    const floodCircle = paintFloodCircleRef.current;

    if (!trigger || !floodCircle) {
      completePaintTarget();
      return;
    }

    const rect = trigger.getBoundingClientRect();
    const centerViewportX = rect.left + rect.width / 2;
    const centerViewportY = rect.top + rect.height / 2;
    const targetRadius = Math.max(
      Math.hypot(centerViewportX, centerViewportY),
      Math.hypot(window.innerWidth - centerViewportX, centerViewportY),
      Math.hypot(centerViewportX, window.innerHeight - centerViewportY),
      Math.hypot(
        window.innerWidth - centerViewportX,
        window.innerHeight - centerViewportY,
      ),
    );

    resetPaintFlood();
    const sequence = paintFloodSequenceRef.current;

    if (paintFrameRef.current !== null) {
      window.cancelAnimationFrame(paintFrameRef.current);
      paintFrameRef.current = null;
    }
    pendingPaintPointRef.current = null;
    previousPaintPointRef.current = null;

    floodCircle.setAttribute("cx", String(centerViewportX + window.scrollX));
    floodCircle.setAttribute("cy", String(centerViewportY + window.scrollY));
    floodCircle.setAttribute("r", "0");
    setIsPaintFlooding(true);
    setPaintStatus(`Applying the ${paintTargetTheme} theme.`);

    paintFloodAnimationRef.current = animate(0, targetRadius, {
      duration: 0.55,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (radius) => {
        if (paintFloodSequenceRef.current !== sequence) return;
        paintFloodCircleRef.current?.setAttribute("r", radius.toFixed(1));
      },
      onComplete: () => {
        if (paintFloodSequenceRef.current !== sequence) return;
        paintFloodAnimationRef.current = null;
        completePaintTarget();
      },
    });
  }, [
    completePaintTarget,
    isPaintFlooding,
    paintTargetTheme,
    resetPaintFlood,
    shouldReduceMotion,
  ]);

  const beginPaintMode = useCallback(() => {
    resetPaintFlood();
    resetPaintControlInteraction();
    clearPaintPath();
    setHoveredCompany(null);
    setIsPaintFlooding(false);
    setPointerSlug(null);
    setPaintStartTheme(theme);
    measurePaintMask();
    setIsPaintMode(true);
    setPaintStatus(
      `Paint mode active. Pointer movement reveals the ${oppositeTheme(theme)} theme. Choose Paint it all to apply it, Stop to restore ${theme}, or press Escape to cancel.`,
    );
    window.requestAnimationFrame(() => {
      paintAllRef.current?.focus({ preventScroll: true });
    });
  }, [
    clearPaintPath,
    measurePaintMask,
    resetPaintControlInteraction,
    resetPaintFlood,
    theme,
  ]);

  const handlePaintToggle = () => {
    if (isPaintMode) {
      cancelPaintMode();
      return;
    }

    const pointerType = paintTogglePointerTypeRef.current;
    paintTogglePointerTypeRef.current = null;
    const isCoarseActivation =
      pointerType === "touch" ||
      (pointerType === null && window.matchMedia("(pointer: coarse)").matches);

    if (isCoarseActivation) {
      const nextTheme = oppositeTheme(theme);
      setTheme(nextTheme);
      setPaintStatus(`${nextTheme} theme applied directly for touch input.`);
      return;
    }

    beginPaintMode();
  };

  const flushPaintFrame = useCallback(() => {
    paintFrameRef.current = null;
    const point = pendingPaintPointRef.current;
    pendingPaintPointRef.current = null;

    if (!point) return;

    const previousPoint = previousPaintPointRef.current;
    const pointCommand = `${point.x.toFixed(1)} ${point.y.toFixed(1)}`;

    if (!previousPoint) {
      paintPathDataRef.current += `M ${pointCommand} L ${pointCommand}`;
    } else {
      const deltaX = point.x - previousPoint.x;
      const deltaY = point.y - previousPoint.y;
      const distance = Math.hypot(deltaX, deltaY);
      const steps = Math.max(1, Math.ceil(distance / (paintBrushRadius / 2)));

      for (let step = 1; step <= steps; step += 1) {
        const progress = step / steps;
        const x = previousPoint.x + deltaX * progress;
        const y = previousPoint.y + deltaY * progress;
        paintPathDataRef.current += ` L ${x.toFixed(1)} ${y.toFixed(1)}`;
      }
    }

    previousPaintPointRef.current = point;
    paintPathRef.current?.setAttribute("d", paintPathDataRef.current);
  }, []);

  const handlePaintPointerMove = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      if (!isPaintMode || isPaintFlooding || event.pointerType === "touch") return;

      pendingPaintPointRef.current = {
        x: event.clientX + window.scrollX,
        y: event.clientY + window.scrollY,
      };

      if (paintFrameRef.current === null) {
        paintFrameRef.current = window.requestAnimationFrame(flushPaintFrame);
      }
    },
    [flushPaintFrame, isPaintFlooding, isPaintMode],
  );

  useEffect(() => {
    document.documentElement.dataset.portfolioTheme = theme;

    return () => {
      delete document.documentElement.dataset.portfolioTheme;
    };
  }, [theme]);

  useEffect(() => {
    if (!isPaintMode) return;

    const resizeObserver = new ResizeObserver(measurePaintMask);
    const handleScroll = () => {
      pendingPaintPointRef.current = null;
      previousPaintPointRef.current = null;
    };

    resizeObserver.observe(document.documentElement);
    window.addEventListener("resize", measurePaintMask);
    window.addEventListener("scroll", handleScroll);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("resize", measurePaintMask);
      window.removeEventListener("scroll", handleScroll);
    };
  }, [isPaintMode, measurePaintMask]);

  useEffect(() => {
    if (!isPaintMode) return;

    const handleEscape = (event: globalThis.KeyboardEvent) => {
      if (event.key !== "Escape") return;
      event.preventDefault();
      cancelPaintMode();
    };

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [cancelPaintMode, isPaintMode]);

  useEffect(() => clearPaintPath, [clearPaintPath]);
  useEffect(() => resetPaintFlood, [resetPaintFlood]);

  useEffect(() => {
    if (selectedSlug && isPaintMode) cancelPaintMode(false);
  }, [cancelPaintMode, isPaintMode, selectedSlug]);

  const restoreStudyFocus = (slug?: string) => {
    window.requestAnimationFrame(() => {
      const studyHref = slug ? getCaseStudy(slug)?.href : undefined;
      const fallbackTrigger = studyHref
        ? document.querySelector<HTMLAnchorElement>(
            `.case-study-card a[href="${studyHref}"]`,
          )
        : null;

      const trigger = lastTriggerRef.current?.isConnected
        ? lastTriggerRef.current
        : fallbackTrigger;

      trigger?.focus({ preventScroll: true });
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
      setIsDrawerOpen(false);
    } else {
      isClosingDrawerRef.current = false;
    }
  }, [drawerSlug, selectedSlug]);

  const handleSelectStudy = (slug: string, trigger: HTMLElement) => {
    if (isPaintMode) cancelPaintMode(false);

    lastTriggerRef.current = trigger;
    isClosingDrawerRef.current = false;
    navigateAfterCloseRef.current = false;

    setDrawerSlug(slug);
    onSelectStudy(slug);
  };

  const handleStudyRegionBlur = (event: FocusEvent<HTMLDivElement>) => {
    if (event.relatedTarget && event.currentTarget.contains(event.relatedTarget as Node)) {
      return;
    }

    setFocusedSlug(null);
  };

  const handleActiveStudyClick = (event: MouseEvent<HTMLAnchorElement>) => {
    if (!displayedStudy) return;
    if (
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    ) {
      return;
    }

    event.preventDefault();
    handleSelectStudy(displayedStudy.slug, event.currentTarget);
  };

  const handleDrawerOpenChange = (open: boolean) => {
    if (open) return;
    if (isClosingDrawerRef.current) return;

    isClosingDrawerRef.current = true;
    navigateAfterCloseRef.current = Boolean(selectedSlug);
    setIsDrawerOpen(false);
  };

  const handleDrawerOpenChangeComplete = (open: boolean) => {
    if (open) return;

    const closingSlug = drawerSlug;
    const shouldNavigate = navigateAfterCloseRef.current;
    const interruptedSlug = shouldNavigate ? undefined : selectedSlug;
    navigateAfterCloseRef.current = false;

    if (shouldNavigate) onCloseStudy();

    if (interruptedSlug) {
      isClosingDrawerRef.current = false;
      setDrawerSlug(interruptedSlug);
      setIsDrawerOpen(true);
      return;
    }

    setDrawerSlug(undefined);
    restoreStudyFocus(closingSlug);
    // Keep the closing guard set until the route update has cleared selectedSlug.
    // history.back() completes asynchronously, so releasing it here can reopen
    // the drawer for one render from the still-selected route.
  };

  const renderTopControls = (visualOnly: boolean) => {
    const paintControlInteractionProps = (control: PaintControl) =>
      visualOnly || !isPaintMode
        ? {}
        : {
            onBlur: () => {
              setFocusedPaintControl((current) =>
                current === control ? null : current,
              );
            },
            onFocus: () => setFocusedPaintControl(control),
            onPointerCancel: () => setPressedPaintControl(null),
            onPointerDown: () => setPressedPaintControl(control),
            onPointerEnter: () => setHoveredPaintControl(control),
            onPointerLeave: () => {
              setHoveredPaintControl((current) =>
                current === control ? null : current,
              );
              setPressedPaintControl((current) =>
                current === control ? null : current,
              );
            },
            onPointerUp: () => setPressedPaintControl(null),
          };
    const isPaintControlEngaged = (control: PaintControl) =>
      focusedPaintControl === control || hoveredPaintControl === control;
    const paintControlMirrorClass = (control: PaintControl) => {
      if (!visualOnly) return "";

      return [
        control === "fill" && hoveredPaintControl === control
          ? "bg-neutral-700"
          : "",
        (control === "fill" || control === "stop") &&
        isPaintControlEngaged(control)
          ? "paint-draw-trigger-active"
          : "",
        focusedPaintControl === control ? "paint-control-mirror-focus" : "",
        pressedPaintControl === control ? "-translate-y-px scale-[0.99]" : "",
      ]
        .filter(Boolean)
        .join(" ");
    };

    return (
      <nav
        aria-label="Ryan Carter links"
        className={`${isPaintMode ? "paint-control-row-fixed" : ""} flex max-w-full flex-wrap items-center justify-end gap-4 min-[400px]:gap-2 sm:gap-4`}
        data-paint-surface={visualOnly ? "visual" : "interactive"}
      >
        <Button
          asChild
          className={`${flatFloatingButtonClass} ${expandedVerticalHitAreaClass} min-[400px]:px-2.5 sm:px-4 ${paintControlMirrorClass("linkedin")}`}
          size="lg"
          variant="floating"
        >
          <a
            className="group"
            href="https://www.linkedin.com/in/ryan-carter-b8902144/?skipRedirect=true"
            rel="noreferrer"
            target="_blank"
            {...paintControlInteractionProps("linkedin")}
          >
            LinkedIn
            <span className="sr-only"> (opens in a new tab)</span>
            <ArrowUpRight
              aria-hidden="true"
              className={`size-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-focus-visible:translate-x-0.5 group-focus-visible:-translate-y-0.5 ${topControlIconColorClass} ${visualOnly && isPaintControlEngaged("linkedin") ? "paint-control-mirror-icon" : ""}`}
            />
          </a>
        </Button>
        <Button
          asChild
          className={`${flatFloatingButtonClass} ${expandedVerticalHitAreaClass} min-[400px]:px-2.5 sm:px-4 ${paintControlMirrorClass("resume")}`}
          size="lg"
          variant="floating"
        >
          <a
            className="group"
            href={resumeUrl}
            rel="noreferrer"
            target="_blank"
            {...paintControlInteractionProps("resume")}
          >
            Résumé
            <span className="sr-only"> (opens in a new tab)</span>
            <ArrowUpRight
              aria-hidden="true"
              className={`size-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-focus-visible:translate-x-0.5 group-focus-visible:-translate-y-0.5 ${topControlIconColorClass} ${visualOnly && isPaintControlEngaged("resume") ? "paint-control-mirror-icon" : ""}`}
            />
          </a>
        </Button>
        <Button
          asChild
          className={`${flatFloatingButtonClass} ${expandedVerticalHitAreaClass} min-[400px]:px-2.5 sm:px-4 ${paintControlMirrorClass("email")}`}
          size="lg"
          variant="floating"
        >
          <a
            className="group"
            href="mailto:ryanmichael.carter@gmail.com"
            {...paintControlInteractionProps("email")}
          >
            Email
            <ArrowUpRight
              aria-hidden="true"
              className={`size-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-focus-visible:translate-x-0.5 group-focus-visible:-translate-y-0.5 ${topControlIconColorClass} ${visualOnly && isPaintControlEngaged("email") ? "paint-control-mirror-icon" : ""}`}
            />
          </a>
        </Button>
        <span
          aria-hidden="true"
          className="hidden h-4 w-0.5 rounded-sm bg-neutral-300 sm:block"
        />

        <div
          className="paint-control-reveal relative z-40 flex shrink-0 justify-end"
          data-paint-expanded={isPaintMode ? "" : undefined}
        >
          {isPaintMode ? (
            <div
              aria-busy={isPaintFlooding}
              aria-label={`Paint ${paintTargetTheme} theme controls`}
              className="paint-controls paint-controls-fixed fixed z-[80] flex items-center gap-4"
              role="group"
            >
              <Button
                className={`${expandedVerticalHitAreaClass} paint-draw-trigger cursor-pointer rounded-xl border-transparent px-4 font-sans ${paintControlMirrorClass("fill")}`}
                data-paint-action="fill"
                disabled={isPaintFlooding}
                onClick={fillPaintTarget}
                ref={visualOnly ? undefined : paintAllRef}
                size="lg"
                type="button"
                {...paintControlInteractionProps("fill")}
              >
                Paint it all
                <PaintScribbleIcon />
              </Button>
              <Button
                className={`${flatFloatingButtonClass} ${expandedVerticalHitAreaClass} paint-draw-trigger cursor-pointer ${paintControlMirrorClass("stop")}`}
                data-paint-action="stop"
                onClick={() => cancelPaintMode()}
                size="lg"
                type="button"
                variant="floating"
                {...paintControlInteractionProps("stop")}
              >
                Stop
                <PaintStopIcon />
              </Button>
            </div>
          ) : (
            <div>
              <Button
                aria-label={`Paint the page in ${oppositeTheme(theme)} mode`}
                aria-pressed={false}
                className={`${flatFloatingButtonClass} ${expandedVerticalHitAreaClass} paint-draw-trigger paint-toggle group h-10 w-12 shrink-0 cursor-pointer px-4 py-3`}
                onClick={handlePaintToggle}
                onKeyDown={() => {
                  paintTogglePointerTypeRef.current = null;
                }}
                onPointerCancel={() => {
                  paintTogglePointerTypeRef.current = null;
                }}
                onPointerDown={(event) => {
                  paintTogglePointerTypeRef.current = event.pointerType;
                }}
                ref={visualOnly ? undefined : paintToggleRef}
                type="button"
                variant="floating"
              >
                <PaintScribbleIcon className={topControlIconColorClass} />
              </Button>
            </div>
          )}
        </div>
      </nav>
    );
  };

  const renderHomeSurface = (visualOnly: boolean) => {
    const idPrefix = visualOnly ? "paint-layer-" : "";

    return (
      <>
      <main
        className="flex min-h-svh flex-col overflow-x-clip bg-neutral-50 text-neutral-900 focus:outline-none"
        id={visualOnly ? undefined : "main-content"}
        tabIndex={visualOnly ? undefined : -1}
      >
        <div
          className={`relative mx-auto flex w-full max-w-[1440px] justify-end px-4 sm:px-8 min-[1440px]:!px-12 ${isPaintMode ? "pt-20 sm:pt-24 md:pb-10 md:pt-8 min-[1440px]:!pt-12" : "pt-4 sm:pt-8 min-[1440px]:!pt-12"}`}
        >
          {renderTopControls(visualOnly)}
        </div>

        <section className="mx-auto flex w-full max-w-[1440px] items-start px-4 pb-12 pt-10 sm:px-8 sm:pt-12 min-[1440px]:px-12">
          <div
            className="grid w-full min-w-0 items-start gap-12 min-[1440px]:grid-cols-[560px_720px] min-[1440px]:gap-16"
            onBlurCapture={handleStudyRegionBlur}
            onPointerLeave={(event) => {
              if (!isPaintMode && event.pointerType === "mouse") {
                setPointerSlug(null);
              }
            }}
          >
          <div className="grid w-full max-w-[560px] min-w-0 justify-self-center min-[1440px]:sticky min-[1440px]:top-12 min-[1440px]:justify-self-auto min-[1440px]:self-start">
            <h1 className="sr-only">
              I’m Ryan, a Product Designer with 12+ years of experience in Product Design
              and Design Systems.
            </h1>

            <div
              aria-hidden="true"
              className="flex flex-wrap items-center gap-x-2 text-[32px] font-medium leading-[1.2] tracking-[-0.01em]"
            >
              <span className="inline-flex items-center gap-2 whitespace-nowrap">
                <span>I’m Ryan</span>
                <span className="relative inline-flex h-8 w-16 shrink-0 overflow-hidden rounded-full border-[1.5px] border-orange-500 align-middle">
                  <img
                    alt=""
                    className="size-full object-cover object-[center_27%]"
                    decoding="async"
                    src="/assets/ryan-avatar.jpeg"
                  />
                  <span className="pointer-events-none absolute inset-0 bg-gradient-to-b from-orange-400/0 to-orange-400/40" />
                </span>
              </span>
              <span>, a Product Designer</span>
            </div>

            <motion.div
              animate={{
                filter: activeSlug && !shouldReduceMotion ? "blur(6px)" : "blur(0px)",
                opacity: activeSlug ? 0 : 1,
              }}
              aria-hidden={Boolean(activeSlug)}
              className={`col-start-1 row-start-2 flex flex-col justify-start ${activeSlug ? "pointer-events-none" : ""}`}
              inert={activeSlug ? true : undefined}
              transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.35 }}
            >
              <div
                aria-hidden="true"
                className="text-[32px] leading-[1.2] tracking-[-0.01em]"
              >
                <span className="font-medium">with 12+ YOE in</span>{" "}
                <span className="font-bold">Product Design &amp; Design Systems</span>
              </div>

              <div className="mt-4 flex flex-col">
                <p className="text-lg leading-8 text-neutral-900 sm:text-xl">
                  Currently I’m leveraging Claude Code &amp; Codex to bring my designs to life
                  as real production code. Open to new opportunities as a Founding or Senior+
                  Product Designer.
                </p>

                <section
                  aria-labelledby={`${idPrefix}experience-heading`}
                  className="mt-12"
                >
                  <h2
                    className="mb-4 text-base font-semibold leading-6 text-neutral-900"
                    id={`${idPrefix}experience-heading`}
                  >
                    Experience
                  </h2>
                  <div>
                    {experience.map(([dates, company, role]) => (
                      <div
                        className="relative grid grid-cols-[minmax(0,1fr)_minmax(9rem,auto)] items-center gap-4 border-b border-neutral-200 py-2 text-sm leading-4 first:pt-0 last:border-b-0 last:pb-0 sm:grid-cols-[120px_minmax(0,1fr)_auto] sm:py-4"
                        key={company}
                        onPointerEnter={(event) => {
                          if (isPaintMode || event.pointerType !== "mouse") return;
                          const x = event.clientX + 14;
                          const y = event.clientY + 14;

                          cursorX.jump(x);
                          cursorY.jump(y);
                          previewX.jump(x);
                          previewY.jump(y);
                          setHoveredCompany(company);
                        }}
                        onPointerLeave={() => {
                          if (!isPaintMode) setHoveredCompany(null);
                        }}
                        onPointerMove={(event) => {
                          if (isPaintMode || event.pointerType !== "mouse") return;
                          cursorX.set(event.clientX + 14);
                          cursorY.set(event.clientY + 14);
                        }}
                      >
                        <p className="font-mono text-neutral-500 max-sm:col-start-1 max-sm:row-start-2 max-sm:mt-2">
                          {dates}
                        </p>
                        <p className="truncate font-medium text-neutral-900 max-sm:col-start-1 max-sm:row-start-1">
                          {company}
                        </p>
                        <p className="font-mono text-neutral-500 sm:whitespace-nowrap sm:text-right max-sm:col-start-2 max-sm:row-span-2 max-sm:row-start-1">
                          {role}
                        </p>
                      </div>
                    ))}
                  </div>
                </section>
              </div>
            </motion.div>

            {enableCardDrivenHero ? (
              <motion.div
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
                className={`col-start-1 row-start-2 flex flex-col justify-start ${activeSlug && !isHeroTextExiting ? "" : "pointer-events-none"}`}
                transition={
                  shouldReduceMotion
                    ? { duration: 0 }
                    : {
                        delay: activeSlug && !isHeroTextExiting ? 0.15 : 0,
                        duration: activeSlug && !isHeroTextExiting ? 0.35 : 0.14,
                      }
                }
              >
                <div
                  aria-hidden="true"
                  className="text-[32px] leading-[1.2] tracking-[-0.01em]"
                >
                  <motion.span
                    className={displayedStudy ? "block text-balance" : "block"}
                    key={displayedSlug ?? "active"}
                  >
                    <AnimatedHeroLines
                      inline
                      lines={heroLines}
                      reduceMotion={visualOnly || shouldReduceMotion === true}
                    />
                  </motion.span>
                </div>

                <p className="mt-6 text-lg leading-8 text-neutral-900 sm:text-xl">
                  {displayedStudy?.summary}
                </p>

                {activeSlug && displayedStudy && !isHeroTextExiting ? (
                  <Button asChild className="mt-6 w-fit" size="lg">
                    <a
                      aria-label={`Read ${displayedStudy.title} case study`}
                      href={displayedStudy.href}
                      onClick={handleActiveStudyClick}
                      onFocus={() => {
                        setPointerSlug(null);
                        setFocusedSlug(displayedStudy.slug);
                      }}
                    >
                      Read case study
                      <ArrowRight aria-hidden="true" className="size-4" />
                    </a>
                  </Button>
                ) : null}
              </motion.div>
            ) : null}
          </div>

          <section
            aria-labelledby={`${idPrefix}selected-work-heading`}
            className="w-full min-w-0 max-w-[720px] justify-self-center min-[1440px]:justify-self-auto"
          >
            <h2 className="sr-only" id={`${idPrefix}selected-work-heading`}>
              Selected work
            </h2>
            <div
              className="grid grid-cols-1 gap-6"
            >
              {caseStudies.map((study, index) => (
                <CaseStudyCard
                  active={activeSlug === study.slug}
                  category={study.cardCategory}
                  dimmed={Boolean(activeSlug && activeSlug !== study.slug)}
                  href={study.href}
                  image={study.image}
                  idPrefix={idPrefix}
                  index={index}
                  key={study.slug}
                  onFocus={(slug) => {
                    setPointerSlug(null);
                    setFocusedSlug(slug);
                  }}
                  onPointerEnter={(slug, event) => {
                    if (!isPaintMode && event.pointerType === "mouse") {
                      setPointerSlug(slug);
                    }
                  }}
                  onSelect={handleSelectStudy}
                  slug={study.slug}
                  summary={study.cardSummary}
                  title={study.cardTitle}
                  visualOnly={visualOnly}
                />
              ))}
            </div>
          </section>
          </div>
        </section>
      </main>

      <AnimatePresence initial={false}>
        {hoveredLogo ? (
          <motion.div
            animate={{ opacity: 1, scale: 1 }}
            aria-hidden="true"
            className="pointer-events-none fixed left-0 top-0 z-40 hidden h-12 w-26 origin-top-left items-center justify-center rounded-md border border-neutral-200 bg-white px-3 shadow-xl shadow-neutral-950/10 sm:flex"
            exit={shouldReduceMotion ? undefined : { opacity: 0, scale: 0.97 }}
            initial={shouldReduceMotion ? false : { opacity: 0, scale: 0.97 }}
            key={hoveredCompany ?? hoveredLogo.src}
            style={{
              x: shouldReduceMotion ? cursorX : previewX,
              y: shouldReduceMotion ? cursorY : previewY,
            }}
            transition={
              shouldReduceMotion
                ? { duration: 0 }
                : { duration: 0.16, ease: [0.22, 1, 0.36, 1] }
            }
          >
            <img
              alt=""
              className="max-h-7 max-w-20 object-contain"
              src={hoveredLogo.src}
            />
          </motion.div>
        ) : null}
      </AnimatePresence>
      </>
    );
  };

  return (
    <div
      className="portfolio-theme relative min-h-svh"
      data-paint-active={isPaintMode ? "" : undefined}
      data-portfolio-theme={theme}
      onPointerLeave={() => {
        pendingPaintPointRef.current = null;
        previousPaintPointRef.current = null;
      }}
      onPointerMove={handlePaintPointerMove}
    >
      <SkipLink />
      {renderHomeSurface(false)}

      {isPaintMode ? (
        <>
          <svg
            aria-hidden="true"
            className="pointer-events-none absolute size-0"
            focusable="false"
          >
            <defs>
              <mask
                height={paintMaskSize.height}
                id="portfolio-paint-mask"
                maskContentUnits="userSpaceOnUse"
                maskUnits="userSpaceOnUse"
                width={paintMaskSize.width}
                x="0"
                y="0"
              >
                <rect
                  fill="black"
                  height={paintMaskSize.height}
                  width={paintMaskSize.width}
                  x="0"
                  y="0"
                />
                <path
                  fill="none"
                  ref={paintPathRef}
                  stroke="white"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={paintBrushRadius * 2}
                />
                <circle cx="0" cy="0" fill="white" r="0" ref={paintFloodCircleRef} />
              </mask>
            </defs>
          </svg>

          <div
            aria-hidden="true"
            className="portfolio-theme paint-theme-layer pointer-events-none absolute inset-0 z-50 overflow-clip"
            data-portfolio-theme={paintTargetTheme}
            inert
            style={{
              mask: "url(#portfolio-paint-mask)",
              WebkitMask: "url(#portfolio-paint-mask)",
            }}
          >
            {renderHomeSurface(true)}
          </div>

        </>
      ) : null}

      <p aria-atomic="true" aria-live="polite" className="sr-only" role="status">
        {paintStatus}
      </p>

      {drawerSlug ? (
        <CaseStudyDrawer
          onOpenChange={handleDrawerOpenChange}
          onOpenChangeComplete={handleDrawerOpenChangeComplete}
          open={isDrawerOpen}
          slug={drawerSlug}
        />
      ) : null}
    </div>
  );
}

function ContactPage() {
  const shouldReduceMotion = useReducedMotion();

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
          initial={shouldReduceMotion ? false : { opacity: 0, y: 28 }}
          transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
        >
          <p className="font-mono text-sm uppercase leading-4 text-rose-700">Contact</p>
          <h1 className="mt-4 max-w-3xl text-5xl font-medium leading-[1.08] text-neutral-900 sm:text-7xl">
            {contactPage.blocks[0]?.text ?? "Let’s get in touch"}
          </h1>
          <p className="mt-6 max-w-2xl text-xl leading-9 text-neutral-500">
            {contactPage.blocks[1]?.text ??
              "Send an email and I will get back to you as soon as I can."}
          </p>
          <div className="mt-10 flex flex-wrap gap-3">
            <Button asChild size="lg">
              <a className="group" href="mailto:ryanmichael.carter@gmail.com">
                <Mail
                  aria-hidden="true"
                  className="size-4 group-hover:translate-x-0.5 group-focus-visible:translate-x-0.5"
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
                  className="size-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-focus-visible:translate-x-0.5 group-focus-visible:-translate-y-0.5"
                />
              </a>
            </Button>
            <Button asChild size="lg" variant="outline">
              <a className="group" href={resumeUrl} rel="noreferrer" target="_blank">
                Resume
                <span className="sr-only"> (opens in a new tab)</span>
                <ArrowUpRight
                  aria-hidden="true"
                  className="size-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-focus-visible:translate-x-0.5 group-focus-visible:-translate-y-0.5"
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
        <p className="font-mono text-sm uppercase leading-4 text-rose-700">404</p>
        <h1 className="mt-4 text-5xl font-medium text-neutral-900">Page not found</h1>
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

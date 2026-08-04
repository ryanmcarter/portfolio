import { useEffect, useRef, useState, type RefObject } from "react";
import {
  cubicBezier,
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
  type MotionValue,
} from "framer-motion";

type GuidingPrinciplesStackProps = {
  scrollContainerRef?: RefObject<HTMLElement | null>;
};

const stagePoints = [0, 0.25, 0.5, 0.75, 1];
const stageHold = 0.055;
const motionPoints = stagePoints.flatMap((point, index) =>
  index < stagePoints.length - 1 ? [point, point + stageHold] : [point],
);
const depthScales = [1, 0.9, 0.81, 0.729, 0.6561];
const depthOpacities = [1, 0.8, 0.6, 0.4, 0.2];
const stageEase = cubicBezier(0.22, 1, 0.36, 1);

function holdAtEachStage<T>(output: T[]) {
  return output.flatMap((value, index) =>
    index < output.length - 1 ? [value, value] : [value],
  );
}

function useStageTransform<T extends number | string>(
  progress: MotionValue<number>,
  output: T[],
) {
  return useTransform(progress, motionPoints, holdAtEachStage(output), { ease: stageEase });
}

function transitionThreshold(cardIndex: number, position: number) {
  if (cardIndex === 0) return 0;

  const transitionStart = stagePoints[cardIndex - 1] + stageHold;
  const transitionEnd = stagePoints[cardIndex];
  return transitionStart + (transitionEnd - transitionStart) * position;
}

function surfaceRevealThreshold(cardIndex: number) {
  return transitionThreshold(cardIndex, 0.24);
}

function copyRevealThreshold(cardIndex: number) {
  return transitionThreshold(cardIndex, 0.36);
}

const principles = [
  {
    background: "#fef2f2",
    body:
      "No hardcoded values anywhere — color, spacing, radius, shadow, typography, motion. Every visual decision is a token.",
    icon: null,
    shadow: "69, 10, 10",
    text: "#450a0a",
    title: "Token all the things",
  },
  {
    background: "#fff7ed",
    body:
      "Every layer (tokens, lint, CI, Storybook) works without Claude Code. AI just compresses the loop and helps everyone ship faster.",
    icon: "/assets/kraidle-principle-ai.svg",
    shadow: "67, 20, 7",
    text: "#431407",
    title: "AI-augmented, not AI-dependent",
  },
  {
    background: "#f0fdfa",
    body:
      "The lint layer makes the right path the easy path and fails wrong paths before review. A Figma plugin allows for a full page audit on system usage, and a live Figma widget tracks any design value not mapped to a token.",
    icon: "/assets/kraidle-principle-enforcement.svg",
    shadow: "4, 47, 46",
    text: "#042f2e",
    title: "Enforcement by default",
  },
  {
    background: "#fefce8",
    body:
      "Tokens flow from Figma to code via Tokens Studio (two-way git sync). Components flow back to Figma via Code Connect. Generated pages can be serialized into the Figma file as library-bound frames.",
    icon: "/assets/kraidle-principle-sync.svg",
    shadow: "66, 32, 6",
    text: "#422006",
    title: "Bidirectional sync",
  },
  {
    background: "#eef2ff",
    body:
      "A passive linter runs in the Figma canvas; ESLint runs at author time; axe runs in CI; token impact previews land on the PR before merge. Issues surface where they're cheapest.",
    icon: "/assets/kraidle-principle-quality.svg",
    shadow: "30, 27, 75",
    text: "#1e1b4b",
    title: "Quality shifts left",
  },
] as const;

function useStickyCardLayout() {
  const [matches, setMatches] = useState(() =>
    typeof window === "undefined"
      ? false
      : window.matchMedia("(min-height: 640px)").matches,
  );

  useEffect(() => {
    const query = window.matchMedia("(min-height: 640px)");
    const update = () => setMatches(query.matches);

    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  return matches;
}

function PrincipleIcon({ icon }: { icon: string | null }) {
  if (!icon) {
    return (
      <div
        aria-hidden="true"
        className="flex size-12 shrink-0 flex-col items-center justify-center font-mono text-xl font-extrabold leading-6 tracking-[0.1em] sm:size-16 sm:text-2xl sm:leading-8"
      >
        <span>{`“”: {`}</span>
        <span>{`}`}</span>
      </div>
    );
  }

  return <img alt="" aria-hidden="true" className="size-12 shrink-0 sm:size-16" src={icon} />;
}

function StackedPrincipleCard({
  cardIndex,
  principle,
  progress,
  shouldStack,
}: {
  cardIndex: number;
  principle: (typeof principles)[number];
  progress: MotionValue<number>;
  shouldStack: boolean;
}) {
  const scale = useStageTransform(
    progress,
    stagePoints.map((_, stageIndex) => {
      if (stageIndex < cardIndex) return 1;
      return depthScales[stageIndex - cardIndex];
    }),
  );
  const stagedOpacity = useStageTransform(
    progress,
    stagePoints.map((_, stageIndex) => {
      if (stageIndex < cardIndex) return 0;
      return depthOpacities[stageIndex - cardIndex];
    }),
  );
  const opacity = useTransform(
    [progress, stagedOpacity],
    ([latestProgress, latestOpacity]: number[]) => {
      if (cardIndex > 0 && latestProgress < surfaceRevealThreshold(cardIndex)) return 0;

      const nextCardIndex = cardIndex + 1;
      if (nextCardIndex >= principles.length) return 1;
      if (latestProgress < copyRevealThreshold(nextCardIndex)) return 1;

      return latestOpacity;
    },
  );
  const filter = useStageTransform(
    progress,
    stagePoints.map((_, stageIndex) => {
      const depth = stageIndex - cardIndex;
      return `blur(${depth > 0 ? depth : 0}px)`;
    }),
  );
  const y = useStageTransform(
    progress,
    stagePoints.map((_, stageIndex) => {
      if (stageIndex < cardIndex) return cardIndex * 24 + 120;
      if (cardIndex === 0 && stageIndex === 1) return 7.4;
      if (cardIndex === 1 && stageIndex === 1) return 32;
      return cardIndex * 24;
    }),
  );
  const iconFilter = useTransform(
    progress,
    cardIndex === 0
      ? [stagePoints[0], stagePoints[stagePoints.length - 1]]
      : [copyRevealThreshold(cardIndex), stagePoints[cardIndex]],
    cardIndex === 0 ? ["blur(0px)", "blur(0px)"] : ["blur(3px)", "blur(0px)"],
    { ease: stageEase },
  );
  const contentFilter = useTransform(
    progress,
    cardIndex === 0
      ? [stagePoints[0], stagePoints[stagePoints.length - 1]]
      : [copyRevealThreshold(cardIndex), stagePoints[cardIndex]],
    cardIndex === 0 ? ["blur(0px)", "blur(0px)"] : ["blur(3px)", "blur(0px)"],
    { ease: stageEase },
  );
  const contentY = useTransform(
    progress,
    cardIndex === 0
      ? [stagePoints[0], stagePoints[stagePoints.length - 1]]
      : [copyRevealThreshold(cardIndex), stagePoints[cardIndex]],
    cardIndex === 0 ? [0, 0] : [4, 0],
    { ease: stageEase },
  );
  const contentOpacity = useTransform(progress, (latestProgress) => {
    const nextCardIndex = cardIndex + 1;
    const contentStart = surfaceRevealThreshold(cardIndex);
    const contentEnd =
      nextCardIndex < principles.length ? surfaceRevealThreshold(nextCardIndex) : Infinity;

    return latestProgress >= contentStart && latestProgress < contentEnd ? 1 : 0;
  });
  const boxShadow = useStageTransform(
    progress,
    stagePoints.map((_, stageIndex) => {
      const alpha = cardIndex === 1 && stageIndex === 1 ? 0.2 : 0.1;
      return `0 0 16px rgba(${principle.shadow}, ${alpha})`;
    }),
  );

  return (
    <motion.li
      className={
        shouldStack
          ? "col-start-1 row-start-1 flex min-h-37 items-start gap-4 overflow-hidden rounded-3xl p-5 sm:items-center sm:gap-6 sm:p-6"
          : "flex items-start gap-4 overflow-hidden rounded-3xl p-5 sm:min-h-37 sm:items-center sm:gap-6 sm:p-6"
      }
      style={
        shouldStack
          ? {
              backgroundColor: principle.background,
              boxShadow,
              color: principle.text,
              filter,
              opacity,
              scale,
              transformOrigin: "top center",
              willChange: "transform, opacity, filter",
              y,
              zIndex: cardIndex + 1,
            }
          : {
              backgroundColor: principle.background,
              boxShadow: `0 0 16px rgba(${principle.shadow}, 0.1)`,
              color: principle.text,
            }
      }
    >
      <motion.div
        style={
          shouldStack ? { filter: iconFilter, opacity: contentOpacity, y: contentY } : undefined
        }
      >
        <PrincipleIcon icon={principle.icon} />
      </motion.div>
      <motion.div
        className="min-w-0 flex-1 text-base leading-6 sm:text-xl sm:leading-8"
        style={
          shouldStack
            ? { filter: contentFilter, opacity: contentOpacity, y: contentY }
            : undefined
        }
      >
        <h3 className="font-medium">{principle.title}</h3>
        <p className="!mt-1">{principle.body}</p>
      </motion.div>
    </motion.li>
  );
}

export function GuidingPrinciplesStack({ scrollContainerRef }: GuidingPrinciplesStackProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const shouldReduceMotion = useReducedMotion();
  const supportsStickyLayout = useStickyCardLayout();
  const { scrollYProgress } = useScroll({
    container: scrollContainerRef,
    offset: ["start start", "end end"],
    target: sectionRef,
  });
  const shouldStack = supportsStickyLayout && !shouldReduceMotion;

  return (
    <section
      aria-labelledby="2-goals--guiding-principles"
      className={shouldStack ? "relative h-[380svh]" : "mt-10"}
      ref={sectionRef}
    >
      <div className={shouldStack ? "sticky top-6" : undefined}>
        <div className="text-lg leading-8 text-stone-900 sm:text-xl">
          <h2
            className="font-semibold"
            id="2-goals--guiding-principles"
          >
            Goals &amp; Guiding Principles
          </h2>
          <p className="mt-2">
            Before even the first prompt was sent to Claude, I laid out a few hard principles by which
            Kraidle, and the company as a whole, should be guided. In no particular order, they are:
          </p>
        </div>

        <ol className={shouldStack ? "mt-8 grid pb-12 sm:pb-24" : "mt-8 space-y-6"}>
          {principles.map((principle, cardIndex) => (
            <StackedPrincipleCard
              cardIndex={cardIndex}
              key={principle.title}
              principle={principle}
              progress={scrollYProgress}
              shouldStack={shouldStack}
            />
          ))}
        </ol>
      </div>
    </section>
  );
}

import { Fragment, useEffect, useRef, type RefObject } from "react";
import { useReducedMotion } from "framer-motion";

export const codeScrollStart = 0.88;
export const codeScrollEnd = 0.28;
export const lineProgressOverlap = 0.5;
const lineSelector = "[data-animated-code-line]";

function codeLineElements(pre: HTMLPreElement | null) {
  return pre ? Array.from(pre.querySelectorAll<HTMLElement>(lineSelector)) : [];
}

function clearLineStyles(lines: HTMLElement[]) {
  lines.forEach((line) => {
    line.style.removeProperty("opacity");
    line.style.removeProperty("transform");
  });
}

export function lineMotionAtProgress(progress: number, lineIndex: number, lineCount: number) {
  const lineStep = 1 / (lineCount + 1);
  const lineWindow = lineStep / (1 - lineProgressOverlap);
  const lineStart = lineIndex * lineStep;
  const lineProgress = Math.min(1, Math.max(0, (progress - lineStart) / lineWindow));

  return {
    opacity: lineProgress,
    y: 8 * (1 - lineProgress),
  };
}

export function codeBlockProgress(
  blockTop: number,
  blockHeight: number,
  scrollportHeight: number,
) {
  const startPosition = scrollportHeight * codeScrollStart;
  const scrollDistance = blockHeight + scrollportHeight * (codeScrollStart - codeScrollEnd);

  if (scrollDistance <= 0) return 1;
  return Math.min(1, Math.max(0, (startPosition - blockTop) / scrollDistance));
}

function applyLineProgress(lines: HTMLElement[], progress: number) {
  lines.forEach((line, lineIndex) => {
    const motion = lineMotionAtProgress(progress, lineIndex, lines.length);
    line.style.opacity = motion.opacity.toString();
    line.style.transform = `translateY(${motion.y}px)`;
  });
}

export function AnimatedCodeLines({
  code,
  scrollContainerRef,
}: {
  code: string;
  scrollContainerRef?: RefObject<HTMLElement | null>;
}) {
  const preRef = useRef<HTMLPreElement>(null);
  const shouldReduceMotion = useReducedMotion();
  const lines = code.split("\n");

  useEffect(() => {
    const lineElements = codeLineElements(preRef.current);
    const pre = preRef.current;
    const scrollContainer = scrollContainerRef?.current;

    if (
      shouldReduceMotion !== false ||
      !pre ||
      !scrollContainer ||
      typeof window.requestAnimationFrame !== "function"
    ) {
      clearLineStyles(lineElements);
      return;
    }

    let frameId = 0;
    const updateLines = () => {
      frameId = 0;
      const scrollportRect = scrollContainer.getBoundingClientRect();
      const blockRect = pre.getBoundingClientRect();
      const progress = codeBlockProgress(
        blockRect.top - scrollportRect.top,
        blockRect.height,
        scrollportRect.height,
      );

      applyLineProgress(lineElements, progress);
    };
    const scheduleUpdate = () => {
      if (frameId) return;
      frameId = window.requestAnimationFrame(updateLines);
    };

    scrollContainer.addEventListener("scroll", scheduleUpdate, { passive: true });
    window.addEventListener("resize", scheduleUpdate);
    scheduleUpdate();

    return () => {
      scrollContainer.removeEventListener("scroll", scheduleUpdate);
      window.removeEventListener("resize", scheduleUpdate);
      window.cancelAnimationFrame(frameId);
      clearLineStyles(lineElements);
    };
  }, [scrollContainerRef, shouldReduceMotion]);

  return (
    <pre
      className="overflow-x-auto p-4 text-sm leading-6 text-neutral-100"
      ref={preRef}
    >
      <code>
        {lines.map((line, lineIndex) => (
          <Fragment key={lineIndex}>
            <span className="inline-block" data-animated-code-line="">
              {line}
            </span>
            {lineIndex < lines.length - 1 ? "\n" : null}
          </Fragment>
        ))}
      </code>
    </pre>
  );
}

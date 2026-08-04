import { Fragment, useEffect, useRef, type RefObject } from "react";
import { useAnimate, useInView, useReducedMotion } from "framer-motion";

const lineDuration = 0.36;
const staggerWindow = 0.28;
const lineEase = [0.22, 1, 0.36, 1] as const;
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

export function scheduleAfterPaint(
  callback: FrameRequestCallback,
  requestFrame = window.requestAnimationFrame,
  cancelFrame = window.cancelAnimationFrame,
) {
  let secondFrame = 0;
  const firstFrame = requestFrame(() => {
    secondFrame = requestFrame(callback);
  });

  return () => {
    cancelFrame(firstFrame);
    cancelFrame(secondFrame);
  };
}

export function AnimatedCodeLines({
  code,
  scrollContainerRef,
}: {
  code: string;
  scrollContainerRef?: RefObject<HTMLElement | null>;
}) {
  const [preRef, animate] = useAnimate<HTMLPreElement>();
  const hasAnimated = useRef(false);
  const shouldReduceMotion = useReducedMotion();
  const isInView = useInView(preRef, {
    amount: "some",
    margin: "0px 0px -12% 0px",
    once: true,
    root: scrollContainerRef,
  });
  const lines = code.split("\n");
  const lineDelay = lines.length > 1 ? staggerWindow / (lines.length - 1) : 0;

  useEffect(() => {
    const lineElements = codeLineElements(preRef.current);

    if (shouldReduceMotion) {
      hasAnimated.current = true;
      clearLineStyles(lineElements);
      return;
    }

    if (
      shouldReduceMotion !== false ||
      !isInView ||
      hasAnimated.current ||
      lineElements.length === 0
    ) {
      return;
    }

    hasAnimated.current = true;
    lineElements.forEach((line) => {
      line.style.opacity = "0";
      line.style.transform = "translateY(8px)";
    });

    const cancelAnimationStart = scheduleAfterPaint(() => {
      void animate(
        lineSelector,
        { opacity: 1, transform: "translateY(0px)" },
        {
          delay: (lineIndex) => lineIndex * lineDelay,
          duration: lineDuration,
          ease: lineEase,
        },
      );
    });
    const fallbackTimer = window.setTimeout(
      () => clearLineStyles(lineElements),
      (lineDuration + staggerWindow) * 1000 + 160,
    );

    return () => {
      cancelAnimationStart();
      window.clearTimeout(fallbackTimer);
    };
  }, [animate, isInView, lineDelay, shouldReduceMotion]);

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

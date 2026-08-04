import { Fragment, useEffect, useRef, type RefObject } from "react";
import { useAnimate, useInView, useReducedMotion } from "framer-motion";

const lineDuration = 0.3;
const staggerWindow = 0.25;
const lineEase = [0.22, 1, 0.36, 1] as const;

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
    if (shouldReduceMotion) {
      hasAnimated.current = true;
      void animate(
        "[data-animated-code-line]",
        { opacity: 1, y: 0 },
        { duration: 0 },
      );
      return;
    }

    if (shouldReduceMotion !== false || !isInView || hasAnimated.current) return;

    hasAnimated.current = true;
    void animate(
      "[data-animated-code-line]",
      { opacity: [0, 1], y: [4, 0] },
      {
        delay: (lineIndex) => lineIndex * lineDelay,
        duration: lineDuration,
        ease: lineEase,
      },
    );
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

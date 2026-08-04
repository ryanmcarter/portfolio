import { Fragment, useRef, type RefObject } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";

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
  const preRef = useRef<HTMLPreElement>(null);
  const shouldReduceMotion = useReducedMotion();
  const isInView = useInView(preRef, {
    amount: "some",
    margin: "0px 0px -12% 0px",
    once: true,
    root: scrollContainerRef,
  });
  const lines = code.split("\n");
  const lineDelay = lines.length > 1 ? staggerWindow / (lines.length - 1) : 0;
  const shouldShowLines = shouldReduceMotion || isInView;

  return (
    <pre
      className="overflow-x-auto p-4 text-sm leading-6 text-neutral-100"
      ref={preRef}
    >
      <code>
        {lines.map((line, lineIndex) => (
          <Fragment key={lineIndex}>
            <motion.span
              animate={shouldShowLines ? { opacity: 1, y: 0 } : { opacity: 0, y: 4 }}
              className="inline-block"
              initial={shouldReduceMotion ? false : { opacity: 0, y: 4 }}
              transition={
                shouldReduceMotion
                  ? { duration: 0 }
                  : {
                      delay: lineIndex * lineDelay,
                      duration: lineDuration,
                      ease: lineEase,
                    }
              }
            >
              {line}
            </motion.span>
            {lineIndex < lines.length - 1 ? "\n" : null}
          </Fragment>
        ))}
      </code>
    </pre>
  );
}

import { motion, useReducedMotion } from "framer-motion";
import { useLayoutEffect, useRef, useState } from "react";
import type { MouseEvent } from "react";

const genieClipPath = [
  "polygon(49.9% 100%, 50.1% 100%, 50.1% 100%, 49.9% 100%)",
  "polygon(44% 16%, 56% 16%, 51.5% 100%, 48.5% 100%)",
  "polygon(10% 0%, 90% 0%, 72% 100%, 28% 100%)",
  "polygon(0% 0%, 100% 0%, 96% 100%, 4% 100%)",
  "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
];

const genieDuration = 1.2;

type GenieOffset = {
  x: number;
  y: number;
};

type CaseStudyCardProps = {
  client: string;
  href: string;
  image: string;
  index: number;
  onSelect: (slug: string, trigger: HTMLAnchorElement) => void;
  slug: string;
  title: string;
};

export function CaseStudyCard({
  client,
  href,
  image,
  index,
  onSelect,
  slug,
  title,
}: CaseStudyCardProps) {
  const shouldReduceMotion = useReducedMotion();
  const cardSlotRef = useRef<HTMLDivElement>(null);
  const [genieOffset, setGenieOffset] = useState<GenieOffset | null>(null);
  const motionDisabled = shouldReduceMotion === true;
  const entranceDelay = 0.24 + index * 0.14;
  const rotationDirection = index % 2 === 0 ? -1 : 1;
  const initialRotateX = 7 + (index % 3);
  const initialRotateY = rotationDirection * (2 + (index % 2) * 0.5);
  const initialRotateZ = rotationDirection * (3 + (index % 3) * 0.75);

  useLayoutEffect(() => {
    if (motionDisabled || !cardSlotRef.current) return;

    const rect = cardSlotRef.current.getBoundingClientRect();

    setGenieOffset({
      x: window.innerWidth / 2 - (rect.left + rect.width / 2),
      y: window.innerHeight - rect.bottom,
    });
  }, [motionDisabled]);

  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
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
    onSelect(slug, event.currentTarget);
  };

  return (
    <div className="case-study-card aspect-[540/289] w-full" ref={cardSlotRef}>
      {motionDisabled || genieOffset ? (
        <motion.article
          animate={{
            opacity: 1,
            rotateX: motionDisabled
              ? 0
              : [initialRotateX, initialRotateX * 0.6, 0],
            rotateY: motionDisabled
              ? 0
              : [initialRotateY, initialRotateY * 0.6, 0],
            rotateZ: motionDisabled
              ? 0
              : [initialRotateZ, initialRotateZ * 0.6, 0],
            scaleX: 1,
            scaleY: 1,
            x: 0,
            y: 0,
          }}
          className="group size-full origin-bottom rounded-3xl transition-shadow duration-200 hover:shadow-[0_0_0_8px] hover:shadow-stone-100 focus-within:shadow-[0_0_0_8px] focus-within:shadow-stone-100 will-change-[transform,opacity]"
          initial={
            motionDisabled
              ? false
              : {
                  opacity: 0,
                  rotateX: initialRotateX,
                  rotateY: initialRotateY,
                  rotateZ: initialRotateZ,
                  scaleX: 0,
                  scaleY: 0,
                  x: genieOffset?.x ?? 0,
                  y: genieOffset?.y ?? 0,
                }
          }
          style={{ transformPerspective: 900 }}
          transition={{
            opacity: {
              delay: entranceDelay,
              duration: 0.18,
              ease: "easeOut",
            },
            rotateX: {
              delay: entranceDelay,
              duration: genieDuration,
              ease: [0.16, 1, 0.3, 1],
              times: [0, 0.4, 1],
              type: "tween",
            },
            rotateY: {
              delay: entranceDelay,
              duration: genieDuration,
              ease: [0.16, 1, 0.3, 1],
              times: [0, 0.4, 1],
              type: "tween",
            },
            rotateZ: {
              delay: entranceDelay,
              duration: genieDuration,
              ease: [0.16, 1, 0.3, 1],
              times: [0, 0.4, 1],
              type: "tween",
            },
            scaleX: {
              delay: entranceDelay,
              duration: genieDuration,
              ease: [0.22, 1, 0.36, 1],
              type: "tween",
            },
            scaleY: {
              delay: entranceDelay,
              duration: genieDuration,
              ease: [0.22, 1, 0.36, 1],
              type: "tween",
            },
            x: {
              delay: entranceDelay,
              duration: genieDuration,
              ease: [0.22, 1, 0.36, 1],
              type: "tween",
            },
            y: {
              delay: entranceDelay,
              duration: genieDuration,
              ease: [0.22, 1, 0.36, 1],
              type: "tween",
            },
          }}
        >
          <motion.div
            animate={{ clipPath: genieClipPath }}
            className="size-full overflow-hidden rounded-3xl will-change-[clip-path]"
            initial={motionDisabled ? false : { clipPath: genieClipPath[0] }}
            transition={{
              delay: entranceDelay,
              duration: genieDuration,
              ease: [0.16, 1, 0.3, 1],
              times: [0, 0.16, 0.5, 0.78, 1],
            }}
          >
            <motion.div
              animate={{
                filter: "blur(0px)",
                opacity: 1,
              }}
              className="size-full will-change-[filter,opacity]"
              initial={
                motionDisabled
                  ? false
                  : {
                      filter: "blur(20px)",
                      opacity: 0,
                    }
              }
              transition={{
                filter: {
                  delay: entranceDelay,
                  duration: genieDuration,
                  ease: [0.16, 1, 0.3, 1],
                },
                opacity: {
                  delay: entranceDelay + genieDuration * 0.18,
                  duration: genieDuration * 0.52,
                  ease: [0.16, 1, 0.3, 1],
                },
              }}
            >
              <a
                aria-haspopup="dialog"
                className="flex size-full flex-col overflow-hidden rounded-3xl bg-white p-1 outline-none focus-visible:ring-2 focus-visible:ring-neutral-900 focus-visible:ring-inset"
                href={href}
                onClick={handleClick}
              >
                <span className="flex shrink-0 flex-col gap-1 px-5 pb-6 pt-5 leading-4 text-stone-900">
                  <span className="truncate text-sm font-semibold">{title}</span>
                  <span className="truncate text-xs">{client}</span>
                </span>
                <span
                  className={`relative min-h-0 flex-1 overflow-hidden rounded-[20px] ${
                    slug === "kraidle" ? "bg-neutral-950" : "bg-white"
                  }`}
                >
                  <img
                    alt=""
                    className={`size-full transition-transform duration-500 ease-out ${
                      slug === "kraidle"
                        ? "object-contain"
                        : "object-cover group-hover:scale-[1.015]"
                    }`}
                    loading={index < 2 ? "eager" : "lazy"}
                    src={image}
                  />
                </span>
              </a>
            </motion.div>
          </motion.div>
        </motion.article>
      ) : null}
    </div>
  );
}

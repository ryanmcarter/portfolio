import { ArrowUpRight } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import type { FocusEvent, KeyboardEvent, MouseEvent, PointerEvent } from "react";

type CaseStudyCardProps = {
  active: boolean;
  dimmed: boolean;
  href: string;
  image: string;
  index: number;
  onFocus: (slug: string) => void;
  onPointerEnter: (slug: string, event: PointerEvent<HTMLAnchorElement>) => void;
  onSelect: (slug: string, trigger: HTMLAnchorElement) => void;
  slug: string;
  summary: string;
  title: string;
};

export function CaseStudyCard({
  active,
  dimmed,
  href,
  image,
  index,
  onFocus,
  onPointerEnter,
  onSelect,
  slug,
  summary,
  title,
}: CaseStudyCardProps) {
  const shouldReduceMotion = useReducedMotion();

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

  const handleFocus = (_event: FocusEvent<HTMLAnchorElement>) => {
    onFocus(slug);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLAnchorElement>) => {
    if (event.key !== " ") return;

    event.preventDefault();
    onSelect(slug, event.currentTarget);
  };

  return (
    <motion.article
      animate={{
        boxShadow: active
          ? "0 0 16px rgba(28, 25, 23, 0.12)"
          : "0 0 0 rgba(28, 25, 23, 0)",
        opacity: dimmed ? 0.3 : 1,
        y: 0,
        zIndex: active ? 20 : 1,
      }}
      className="case-study-card relative aspect-[319/177] min-h-0 w-full rounded-2xl xl:aspect-auto xl:h-[169px]"
      initial={shouldReduceMotion ? false : { opacity: 0, y: 16 }}
      transition={
        shouldReduceMotion
          ? { duration: 0 }
          : {
              opacity: { duration: 0.3, ease: [0.22, 1, 0.36, 1] },
              boxShadow: { duration: 0.3, ease: [0.22, 1, 0.36, 1] },
              y: {
                delay: 0.24 + index * 0.08,
                duration: 0.3,
                ease: [0.22, 1, 0.36, 1],
              },
            }
      }
    >
      <a
        aria-haspopup="dialog"
        aria-describedby={`case-study-summary-${slug}`}
        aria-label={`Read ${title} case study`}
        className={`group relative flex size-full flex-col items-center justify-center gap-4 overflow-hidden rounded-2xl border-[0.5px] bg-white p-4 text-center outline-none focus-visible:ring-2 focus-visible:ring-neutral-900 focus-visible:ring-inset ${active ? "border-transparent" : "border-stone-200"}`}
        href={href}
        onClick={handleClick}
        onFocus={handleFocus}
        onKeyDown={handleKeyDown}
        onPointerEnter={(event) => onPointerEnter(slug, event)}
      >
        <span className="sr-only" id={`case-study-summary-${slug}`}>
          {summary}
        </span>

        <motion.span
          animate={{
            opacity: active ? 0.08 : 1,
            scale: active ? 1.02 : 1,
          }}
          aria-hidden="true"
          className="relative min-h-0 w-full flex-1 overflow-hidden rounded-sm bg-white"
          transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.3 }}
        >
          <img
            alt=""
            className="size-full object-cover"
            decoding="async"
            loading={index < 2 ? "eager" : "lazy"}
            src={image}
          />
        </motion.span>

        <motion.span
          animate={{ opacity: active ? 0 : 1, y: active ? 4 : 0 }}
          aria-hidden={active}
          className="flex w-full shrink-0 flex-col items-center gap-1 whitespace-nowrap"
          transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.2 }}
        >
          <span className="text-xs leading-3 text-stone-500">Product Design</span>
          <span className="w-full truncate text-sm font-medium leading-4 text-stone-900">
            {title}
          </span>
        </motion.span>

        <motion.span
          animate={{ opacity: active ? 1 : 0, y: active ? 0 : 6 }}
          aria-hidden={!active}
          className="pointer-events-none absolute inset-4 flex flex-col items-center justify-center gap-4"
          initial={false}
          transition={
            shouldReduceMotion
              ? { duration: 0 }
              : { delay: active ? 0.08 : 0, duration: active ? 0.3 : 0.14 }
          }
        >
          <span className="flex max-w-full flex-col items-center gap-1">
            <span className="text-xs leading-3 text-stone-500">Product Design</span>
            <span className="max-w-full text-balance text-sm font-medium leading-4 text-stone-900">
              {title}
            </span>
          </span>
          <span className="flex items-center gap-2 rounded-xl bg-gradient-to-b from-sky-800 to-sky-900 px-4 py-3 text-sm leading-4 text-stone-50 shadow-sm">
            Read case study
            <ArrowUpRight aria-hidden="true" className="size-4" />
          </span>
        </motion.span>
      </a>
    </motion.article>
  );
}

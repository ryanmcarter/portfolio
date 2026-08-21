import { motion, useReducedMotion } from "framer-motion";
import type { FocusEvent, KeyboardEvent, MouseEvent, PointerEvent } from "react";

type CaseStudyCategory = "Design systems" | "Product design";

type CaseStudyCardProps = {
  active: boolean;
  category: CaseStudyCategory;
  dimmed: boolean;
  href: string;
  idPrefix?: string;
  image: string;
  index: number;
  onFocus: (slug: string) => void;
  onPointerEnter: (slug: string, event: PointerEvent<HTMLAnchorElement>) => void;
  onSelect: (slug: string, trigger: HTMLAnchorElement) => void;
  slug: string;
  summary: string;
  title: string;
  visualOnly?: boolean;
};

const cardVisuals: Record<
  string,
  {
    background: string;
    backgroundColor?: string;
    frameBackground?: string;
    frameBackgroundColor?: string;
    frameClassName: string;
    imageClassName: string;
    stageClassName: string;
  }
> = {
  kraidle: {
    background: "linear-gradient(98.4deg, #0a0a0a 0%, #0d9488 100%)",
    frameClassName: "aspect-[82/43]",
    imageClassName: "size-full object-cover",
    stageClassName: "p-4",
  },
  "dynamic-plan": {
    background: "linear-gradient(98.4deg, #193d9b 0%, #fd9160 100%)",
    frameClassName: "aspect-[82/43]",
    imageClassName: "absolute inset-y-0 left-0 h-full w-auto max-w-none",
    stageClassName: "p-4",
  },
  quilt: {
    background: "linear-gradient(98.4deg, #7569cf 0%, #ade9ba 100%)",
    frameBackground: "none",
    frameBackgroundColor: "#fff",
    frameClassName: "aspect-[82/43]",
    imageClassName: "size-full object-cover",
    stageClassName: "p-4",
  },
  keel: {
    background: "linear-gradient(98.4deg, #d0f1f9 0%, #8be4c6 100%)",
    frameClassName: "aspect-[82/43]",
    imageClassName: "absolute left-0 top-[-2.55%] h-[107.13%] w-full max-w-none",
    stageClassName: "p-4",
  },
  studio: {
    background:
      "linear-gradient(180deg, rgba(110, 94, 255, 0.50) 0%, rgba(222, 124, 233, 0.40) 100%)",
    backgroundColor: "#fff",
    frameClassName: "aspect-[82/43]",
    imageClassName: "size-full object-contain",
    stageClassName: "p-4",
  },
};

export function CaseStudyCard({
  active,
  category,
  dimmed,
  href,
  idPrefix = "",
  image,
  index,
  onFocus,
  onPointerEnter,
  onSelect,
  slug,
  summary,
  title,
  visualOnly = false,
}: CaseStudyCardProps) {
  const shouldReduceMotion = useReducedMotion();
  const visual = cardVisuals[slug] ?? cardVisuals.kraidle;
  const summaryId = `${idPrefix}case-study-summary-${slug}`;
  const titleId = `${idPrefix}case-study-title-${slug}`;

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
      animate={{ opacity: 1, y: 0 }}
      aria-labelledby={titleId}
      className="case-study-card min-w-0 w-full rounded-2xl"
      initial={visualOnly || shouldReduceMotion ? false : { opacity: 0, y: 16 }}
      transition={
        shouldReduceMotion
          ? { duration: 0 }
          : {
              delay: 0.16 + index * 0.06,
              duration: 0.32,
              ease: [0.22, 1, 0.36, 1],
            }
      }
    >
      <a
        aria-describedby={summaryId}
        aria-haspopup="dialog"
        aria-label={`${category}: ${title}. Read case study`}
        className="group flex w-full min-w-0 flex-col gap-4 overflow-hidden rounded-2xl border border-neutral-200 bg-white p-4 text-center shadow-[0_0_16px_rgba(23,23,23,0.1)] outline-none transition-[box-shadow,transform] duration-300 ease-out hover:-translate-y-0.5 hover:shadow-[0_8px_28px_rgba(23,23,23,0.14)] focus-visible:-translate-y-0.5 focus-visible:shadow-[0_8px_28px_rgba(23,23,23,0.14)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-900"
        data-active={active}
        data-dimmed={dimmed}
        href={href}
        onClick={handleClick}
        onFocus={handleFocus}
        onKeyDown={handleKeyDown}
        onPointerEnter={(event) => onPointerEnter(slug, event)}
      >
        <span
          aria-hidden="true"
          className={`relative isolate w-full ${visual.stageClassName}`}
          data-card-media-stage
        >
          <span
            className="case-study-media-backdrop pointer-events-none absolute inset-0 z-0 rounded-lg"
            style={{
              backgroundColor: visual.backgroundColor,
              backgroundImage: visual.background,
            }}
          />
          <span
            className={`relative z-10 block w-full overflow-hidden rounded-lg ${visual.frameClassName}`}
            style={{
              backgroundColor: visual.frameBackgroundColor ?? visual.backgroundColor,
              backgroundImage: visual.frameBackground ?? visual.background,
            }}
          >
            <img
              alt=""
              className={visual.imageClassName}
              decoding="async"
              loading={index < 2 ? "eager" : "lazy"}
              src={image}
            />
          </span>
        </span>

        <span className="mx-auto flex w-full max-w-[456px] flex-col items-center gap-2 pb-1">
          <span
            className={
              category === "Design systems"
                ? "rounded-full border border-blue-200 bg-blue-50 px-1.5 py-0.5 text-[10px] font-medium leading-3 text-blue-700"
                : "rounded-full border border-orange-200 bg-orange-50 px-1.5 py-0.5 text-[10px] font-medium leading-3 text-orange-700"
            }
          >
            {category}
          </span>
          <span className="flex flex-col gap-1">
            <h3 className="text-base font-medium leading-6 text-neutral-900" id={titleId}>
              {title}
            </h3>
            <span className="text-sm leading-[21px] text-neutral-600" id={summaryId}>
              {summary}
            </span>
          </span>
        </span>
      </a>
    </motion.article>
  );
}

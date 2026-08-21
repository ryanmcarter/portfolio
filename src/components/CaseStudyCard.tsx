import { motion, useReducedMotion } from "framer-motion";
import type { FocusEvent, KeyboardEvent, MouseEvent, PointerEvent } from "react";

import { CaseStudyMedia } from "@/components/CaseStudyMedia";

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
        <CaseStudyMedia
          alt=""
          image={image}
          loading={index < 2 ? "eager" : "lazy"}
          slug={slug}
        />

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

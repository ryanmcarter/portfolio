import { useEffect, useRef } from "react";
import { X } from "lucide-react";

import { ArticleItems } from "@/components/ArticleItems";
import { MarkdownArticle } from "@/components/MarkdownArticle";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerTitle,
} from "@/components/ui/drawer";
import { getCaseStudy, itemsForPage } from "@/data/portfolio";

const clientLogos: Record<string, { alt: string; crop?: boolean; src: string }> = {
  "Gradle Technologies": {
    alt: "Gradle Technologies",
    src: "/assets/gradle-technologies-logo.svg",
  },
  "New York Shipping Exchange": {
    alt: "NYSHEX",
    crop: true,
    src: "/assets/659983bc280a758d5c24a5f4_nyshex_logo.png",
  },
  "Ribbon Homes": {
    alt: "Ribbon Homes",
    src: "/assets/63766153eccee8b49363dfc1_ribbon-logo.svg",
  },
  Shoflo: {
    alt: "Shoflo",
    src: "/assets/5d58403ddc65b87a77fd9f23_shoflo_logo_dark.png",
  },
};

type CaseStudyDrawerProps = {
  onOpenChangeComplete: (open: boolean) => void;
  onOpenChange: (open: boolean) => void;
  open: boolean;
  sharedMorphPhase?: "closing" | "concealing" | "opening" | "revealing";
  slug: string;
};

export function CaseStudyDrawer({
  onOpenChangeComplete,
  onOpenChange,
  open,
  sharedMorphPhase,
  slug,
}: CaseStudyDrawerProps) {
  const study = getCaseStudy(slug);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!study || !open) return;

    const previousTitle = document.title;
    document.title = `${study.title} — Ryan Carter`;

    return () => {
      document.title = previousTitle;
    };
  }, [open, study]);

  if (!study) return null;

  const orderedItems = study.page ? itemsForPage(study.page) : [];
  const scrapedLogo = orderedItems.find((item) => item.type === "image" && /logo/i.test(item.alt));
  const contentItems = orderedItems.filter((item) => item.type !== "h1" && item !== scrapedLogo);
  const clientLogo = clientLogos[study.client];

  return (
    <Drawer
      modal
      onOpenChange={onOpenChange}
      onOpenChangeComplete={onOpenChangeComplete}
      open={open}
      showSwipeHandle
      swipeDirection="down"
    >
      <DrawerContent
        className="h-[calc(100svh-0.5rem)] max-h-[calc(100svh-0.5rem)] min-h-[calc(100svh-0.5rem)] overflow-hidden rounded-t-3xl bg-white shadow-[0_-8px_16px] shadow-stone-200 [--drawer-bleed-background:var(--color-white)] sm:h-[calc(100svh-1.5rem)] sm:max-h-[calc(100svh-1.5rem)] sm:min-h-[calc(100svh-1.5rem)]"
        data-shared-morph={sharedMorphPhase}
        id="case-study-drawer"
      >
        <div className="relative h-[max(4rem,calc(env(safe-area-inset-top)+2.5rem))] shrink-0 bg-white sm:h-16">
          <DrawerClose
            aria-label={`Close ${study.title}`}
            render={
              <Button
                className="absolute right-4 top-[max(1rem,calc(env(safe-area-inset-top)-0.5rem))] z-20 sm:top-4"
                size="icon"
                type="button"
                variant="floating"
              />
            }
          >
            <X aria-hidden="true" className="size-4" />
          </DrawerClose>
        </div>

        <div
          className="case-study-sheet-scroll min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 pb-20 sm:px-8"
          ref={scrollContainerRef}
        >
          <article className="mx-auto w-full max-w-[1120px] pt-6">
            <figure className="h-[clamp(200px,25vw,312px)] overflow-hidden rounded-3xl bg-stone-200">
              <img
                alt={`${study.title} project overview`}
                className="size-full object-cover"
                decoding="async"
                src={study.detailHeroImage ?? study.image}
              />
            </figure>

            <header className="mt-8 grid gap-10 lg:grid-cols-[minmax(0,584px)_minmax(260px,327px)] lg:items-end lg:justify-between">
              <div>
                {clientLogo?.crop ? (
                  <div className="relative mb-6 h-4 w-25 overflow-hidden">
                    <img
                      alt={clientLogo.alt}
                      className="absolute left-0 top-[-106%] h-[312%] w-full max-w-none"
                      src={clientLogo.src}
                    />
                  </div>
                ) : clientLogo ? (
                  <img
                    alt={clientLogo.alt}
                    className="mb-6 max-h-5 w-auto max-w-32 object-contain object-left"
                    src={clientLogo.src}
                  />
                ) : scrapedLogo?.type === "image" ? (
                  <img
                    alt={scrapedLogo.alt}
                    className="mb-6 max-h-5 w-auto max-w-32 object-contain object-left"
                    src={scrapedLogo.src}
                  />
                ) : (
                  <p className="mb-6 text-sm font-semibold leading-4 text-neutral-800">{study.client}</p>
                )}

                <DrawerTitle
                  className="text-[28px] font-semibold leading-[1.2] text-stone-900 sm:text-[32px]"
                  render={<h1 />}
                >
                  {study.title}
                </DrawerTitle>
                <DrawerDescription className="mt-4 text-lg leading-8 text-stone-900 sm:text-xl">
                  {study.summary}
                </DrawerDescription>
              </div>

              <dl className="text-stone-900">
                <div className="border-b border-neutral-200 py-2 first:pt-0">
                  <dt className="text-base font-semibold leading-6 text-neutral-800">Toolset</dt>
                  <dd className="mt-1 text-lg leading-7 sm:text-xl sm:leading-8">{study.toolset}</dd>
                </div>
                <div className="border-b border-neutral-200 py-2">
                  <dt className="text-base font-semibold leading-6 text-neutral-800">Role</dt>
                  <dd className="mt-1 text-lg leading-7 sm:text-xl sm:leading-8">{study.role}</dd>
                </div>
                <div className="pt-2">
                  <dt className="text-base font-semibold leading-6 text-neutral-800">Date</dt>
                  <dd className="mt-1 text-lg leading-7 sm:text-xl sm:leading-8">{study.date}</dd>
                </div>
              </dl>
            </header>

            <section className="mx-auto mt-16 w-full max-w-[770px]">
              {study.markdown ? (
                <MarkdownArticle
                  hideLead
                  markdown={study.markdown}
                  scrollContainerRef={scrollContainerRef}
                />
              ) : (
                <ArticleItems items={contentItems} />
              )}
            </section>
          </article>
        </div>
      </DrawerContent>
    </Drawer>
  );
}

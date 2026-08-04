import { useEffect, useLayoutEffect, useRef, useState } from "react";

import { cn } from "@/lib/utils";

const tabs = ["Failure Grouping", "Observability", "Analytics", "Agent Context"] as const;

const GROW_FACTOR = 0.036;
const GROW_MAX = 9.6;

type TabRect = { left: number; top: number; width: number; height: number };

// Ported from Kraidle's production TabGroup at source commit 5f2b7e7. The
// portfolio version uses buttons because these labels select a visual state
// without navigating to case-study sections or controlling content panels.
export function KraidleTabsShowcase() {
  const listRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(1);
  const [hoveredTab, setHoveredTab] = useState<number | null>(null);
  const [rects, setRects] = useState<TabRect[]>([]);
  const [ready, setReady] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  useLayoutEffect(() => {
    const list = listRef.current;
    if (!list) return;

    const measure = () => {
      const triggers = Array.from(list.querySelectorAll<HTMLElement>("[data-kraidle-tab]"));
      setRects(
        triggers.map((trigger) => ({
          height: trigger.offsetHeight,
          left: trigger.offsetLeft,
          top: trigger.offsetTop,
          width: trigger.offsetWidth,
        })),
      );
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(list);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!rects.length || ready) return;
    const frame = requestAnimationFrame(() => setReady(true));
    return () => cancelAnimationFrame(frame);
  }, [ready, rects.length]);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReducedMotion(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  const activeRect = rects[activeIndex];
  let growLeft = 0;
  let growWidth = 0;

  if (
    activeRect &&
    !reducedMotion &&
    hoveredTab !== null &&
    hoveredTab !== activeIndex &&
    rects[hoveredTab]
  ) {
    const activeCenter = activeRect.left + activeRect.width / 2;
    const hoveredCenter = rects[hoveredTab].left + rects[hoveredTab].width / 2;
    const delta = hoveredCenter - activeCenter;
    growWidth = Math.min(GROW_MAX, Math.abs(delta) * GROW_FACTOR);
    if (delta < 0) growLeft = growWidth;
  }

  return (
    <div
      aria-label="Kraidle tab animation demo"
      className="my-8 overflow-hidden rounded-2xl border border-neutral-800 bg-[#090909] p-4 sm:p-8"
      role="group"
    >
      <div className="relative after:pointer-events-none after:absolute after:inset-y-0 after:right-0 after:w-8 after:bg-gradient-to-l after:from-[#090909] after:to-transparent after:content-[''] sm:after:hidden">
        <div className="overflow-x-auto pr-8 [scrollbar-width:none] sm:flex sm:pr-0 [&::-webkit-scrollbar]:hidden">
          <div
            className="relative inline-flex min-w-max items-center gap-1 rounded-lg border border-neutral-800 bg-neutral-950 p-1 sm:mx-auto sm:shrink-0"
            onMouseLeave={() => setHoveredTab(null)}
            ref={listRef}
          >
            {activeRect ? (
              <span
                className={cn(
                  "pointer-events-none absolute left-0 top-0 z-0 rounded bg-neutral-900",
                  ready &&
                    "transition-[transform,width] duration-[450ms] ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:transition-none",
                )}
                style={{
                  height: activeRect.height,
                  transform: `translate(${activeRect.left - growLeft}px, ${activeRect.top}px)`,
                  width: activeRect.width + growWidth,
                }}
              />
            ) : null}

            {tabs.map((tab, index) => (
              <button
                aria-pressed={index === activeIndex}
                className={cn(
                  "kraidle-tab-demo-button relative z-10 inline-flex cursor-pointer items-center justify-center whitespace-nowrap rounded border border-transparent bg-transparent px-4 py-3 text-sm font-medium leading-5 text-neutral-400 transition-colors sm:px-5 sm:text-base",
                  index === activeIndex && "text-neutral-50",
                )}
                data-kraidle-tab=""
                key={tab}
                onClick={() => setActiveIndex(index)}
                onMouseEnter={() => setHoveredTab(index)}
                type="button"
              >
                {tab}
                <span
                  className={cn(
                    "absolute bottom-0 left-1/2 h-0.5 w-0 -translate-x-1/2 rounded-t-[2px] bg-[#2ca7be] opacity-0 shadow-[0_-2px_6px_1px_rgba(44,167,190,0.25)] transition-[width,opacity] duration-200 motion-reduce:transition-none",
                    index === activeIndex &&
                      "w-6 opacity-100 delay-[450ms] duration-300 motion-reduce:delay-0",
                  )}
                />
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

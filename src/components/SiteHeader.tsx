import { ArrowUpRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { resumeUrl } from "@/data/portfolio";

type SiteHeaderProps = {
  active?: "home" | "resume" | "contact";
};

export function SiteHeader({ active }: SiteHeaderProps) {
  return (
    <header className="sticky top-0 z-40 border border-neutral-200 bg-white/90 backdrop-blur-md">
      <nav className="mx-auto flex h-[88px] max-w-[1440px] items-center justify-between px-4 sm:px-8">
        <a className="group flex min-w-0 items-center gap-3 sm:gap-6" href="/">
          <span className="font-mono text-sm font-semibold leading-4 text-neutral-900">RYAN CARTER</span>
          <span className="hidden font-mono text-sm leading-4 text-neutral-500 sm:inline">PRODUCT DESIGNER</span>
        </a>
        <div className="flex items-center gap-3 sm:gap-8">
          <div className="hidden items-center gap-6 font-mono text-sm uppercase leading-4 sm:flex">
            <a
              aria-current={active === "home" ? "page" : undefined}
              className={active === "home" ? "font-semibold text-rose-700" : "text-neutral-500 hover:text-neutral-900"}
              href="/"
            >
              Home
            </a>
            <a
              className={active === "resume" ? "font-semibold text-rose-700" : "text-neutral-500 hover:text-neutral-900"}
              href={resumeUrl}
              rel="noreferrer"
              target="_blank"
            >
              Resume
              <span className="sr-only"> (opens in a new tab)</span>
            </a>
          </div>
          <Button asChild variant="accent">
            <a
              aria-current={active === "contact" ? "page" : undefined}
              className="group"
              href="/contact"
            >
              Get in touch
              <ArrowUpRight
                aria-hidden="true"
                className="h-3.5 w-3.5 transition-transform duration-200 ease-out group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-focus-visible:translate-x-0.5 group-focus-visible:-translate-y-0.5"
              />
            </a>
          </Button>
        </div>
      </nav>
    </header>
  );
}

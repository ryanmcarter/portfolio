import { ArrowUpRight } from "lucide-react";
import { motion, useMotionValue, useReducedMotion, useSpring, useTransform } from "framer-motion";
import type { PointerEvent } from "react";

import { Button } from "@/components/ui/button";

type CaseStudyCardProps = {
  title: string;
  client: string;
  summary: string;
  href: string;
  image: string;
};

export function CaseStudyCard({ title, client, href, image }: CaseStudyCardProps) {
  const shouldReduceMotion = useReducedMotion();
  const pointerX = useMotionValue(0);
  const pointerY = useMotionValue(0);
  const springX = useSpring(pointerX, { stiffness: 180, damping: 22, mass: 0.4 });
  const springY = useSpring(pointerY, { stiffness: 180, damping: 22, mass: 0.4 });
  const rotateX = useTransform(springY, [-0.5, 0.5], [3.5, -3.5]);
  const rotateY = useTransform(springX, [-0.5, 0.5], [-3.5, 3.5]);

  const handlePointerMove = (event: PointerEvent<HTMLElement>) => {
    if (shouldReduceMotion || event.pointerType !== "mouse") return;

    const rect = event.currentTarget.getBoundingClientRect();
    pointerX.set((event.clientX - rect.left) / rect.width - 0.5);
    pointerY.set((event.clientY - rect.top) / rect.height - 0.5);
  };

  const handlePointerLeave = () => {
    pointerX.set(0);
    pointerY.set(0);
  };

  return (
    <motion.article
      className="group flex flex-col gap-4 rounded-[24px]"
      onPointerLeave={handlePointerLeave}
      onPointerMove={handlePointerMove}
      style={shouldReduceMotion ? undefined : { rotateX, rotateY, transformPerspective: 900 }}
      whileHover={shouldReduceMotion ? undefined : { y: -4 }}
      transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
    >
      <a
        aria-label={`Read ${title}`}
        className="relative block h-[200px] overflow-hidden rounded-[24px] border border-soft bg-soft"
        href={href}
      >
        <img
          alt=""
          className="h-full w-full object-cover transition duration-500 ease-out group-hover:scale-[1.035]"
          loading="lazy"
          src={image}
        />
        <span className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.32),transparent_42%)] opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      </a>
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-base font-medium leading-6 text-ink">{title}</h3>
          <p className="mt-1 font-mono text-sm leading-4 text-muted">{client}</p>
        </div>
        <Button asChild className="shrink-0" size="sm" variant="outline">
          <a href={href}>
            <span className="hidden sm:inline">Read case study</span>
            <ArrowUpRight aria-hidden="true" className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </a>
        </Button>
      </div>
    </motion.article>
  );
}

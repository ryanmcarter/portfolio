import { ArrowUpRight } from "lucide-react";
import { motion } from "framer-motion";

import { Button } from "@/components/ui/button";

type CaseStudyCardProps = {
  title: string;
  client: string;
  summary: string;
  href: string;
  image: string;
};

export function CaseStudyCard({ title, client, href, image }: CaseStudyCardProps) {
  return (
    <motion.article
      className="group flex flex-col gap-4"
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
    >
      <a
        aria-label={`Read ${title}`}
        className="block h-[200px] overflow-hidden rounded-[24px] border border-soft bg-soft"
        href={href}
      >
        <img
          alt=""
          className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.035]"
          loading="lazy"
          src={image}
        />
      </a>
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-base font-medium leading-6 text-ink">{title}</h3>
          <p className="mt-1 font-mono text-sm leading-4 text-muted">{client}</p>
        </div>
        <Button asChild className="shrink-0" size="sm" variant="outline">
          <a href={href}>
            <span className="hidden sm:inline">Read case study</span>
            <ArrowUpRight aria-hidden="true" className="h-3.5 w-3.5" />
          </a>
        </Button>
      </div>
    </motion.article>
  );
}

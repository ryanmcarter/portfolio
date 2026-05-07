import type { ReactNode } from "react";

import type { ContentItem } from "@/data/portfolio";

function flushList(items: string[], key: string, output: ReactNode[]) {
  if (items.length === 0) return;
  output.push(
    <ul className="mt-4 list-disc pl-5 text-base leading-7 text-muted" key={key}>
      {items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>,
  );
  items.length = 0;
}

export function ArticleItems({ items }: { items: ContentItem[] }) {
  const output: ReactNode[] = [];
  const listItems: string[] = [];

  items.forEach((item, index) => {
    if (item.type === "h1") return;

    if (item.type === "li") {
      listItems.push(item.text);
      return;
    }

    flushList(listItems, `list-${index}`, output);

    if (item.type === "h2") {
      output.push(
        <h2 className="mt-14 font-mono text-sm font-semibold uppercase leading-4 text-accent first:mt-0" key={index}>
          {item.text}
        </h2>,
      );
      return;
    }

    if (item.type === "h3" || item.type === "h4" || item.type === "h5") {
      output.push(
        <h3 className="mt-8 text-2xl font-medium leading-8 text-ink" key={index}>
          {item.text}
        </h3>,
      );
      return;
    }

    if (item.type === "p") {
      output.push(
        <p className="mt-4 text-base leading-8 text-muted" key={index}>
          {item.text}
        </p>,
      );
      return;
    }

    if (item.type === "image") {
      output.push(
        <figure className="my-8 overflow-hidden rounded-2xl border border-line bg-soft" key={`${item.src}-${index}`}>
          <img alt={item.alt || ""} className="w-full object-contain" loading="lazy" src={item.src} />
        </figure>,
      );
      return;
    }

    if (item.type === "video") {
      output.push(
        <video
          className="my-8 w-full rounded-2xl border border-line bg-soft"
          controls
          key={`${item.src}-${index}`}
          muted
          playsInline
          poster={item.poster}
          preload="metadata"
          src={item.src}
        />,
      );
    }
  });

  flushList(listItems, "list-end", output);

  return <div className="content-text">{output}</div>;
}

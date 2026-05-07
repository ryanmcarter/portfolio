import type { TextBlock } from "@/data/portfolio";
import type { ReactNode } from "react";

export function TextBlocks({ blocks }: { blocks: TextBlock[] }) {
  const elements: ReactNode[] = [];
  let listItems: string[] = [];

  const flushList = (key: string) => {
    if (listItems.length === 0) return;
    elements.push(
      <ul className="list-disc font-sans text-base leading-7 text-muted" key={key}>
        {listItems.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>,
    );
    listItems = [];
  };

  blocks.forEach((block, index) => {
    if (block.type === "li") {
      listItems.push(block.text);
      return;
    }

    flushList(`list-${index}`);

    if (block.type === "h1") return;
    if (block.type === "h2") {
      elements.push(
        <h2 className="mt-12 font-mono text-sm font-semibold uppercase leading-4 text-accent" key={index}>
          {block.text}
        </h2>,
      );
    } else if (block.type === "h3" || block.type === "h4" || block.type === "h5") {
      elements.push(
        <h3 className="mt-8 text-2xl font-medium leading-8 text-ink" key={index}>
          {block.text}
        </h3>,
      );
    } else {
      elements.push(
        <p className="mt-4 text-base leading-8 text-muted" key={index}>
          {block.text}
        </p>,
      );
    }
  });

  flushList("list-end");

  return <div className="content-text">{elements}</div>;
}

import type { ReactNode } from "react";

import type { ContentItem, TextBlock } from "@/data/portfolio";

function isTextItem(item: ContentItem | undefined, type: TextBlock["type"], text?: string): item is TextBlock {
  return Boolean(item && item.type === type && "text" in item && (text === undefined || item.text === text));
}

function isImageItem(item: ContentItem | undefined): item is Extract<ContentItem, { type: "image" }> {
  return Boolean(item && item.type === "image");
}

function EmphasizedNumbers({ text }: { text: string }) {
  const parts = text.split(/(500|4\.5:1|000)/g);

  return (
    <>
      {parts.map((part, index) =>
        /^(500|4\.5:1|000)$/.test(part) ? (
          <span className="rounded-[3px] bg-neutral-200 px-1 font-mono text-[0.95em]" key={`${part}-${index}`}>
            {part}
          </span>
        ) : (
          part
        ),
      )}
    </>
  );
}

function QuiltAccessibilityPanel({
  intro,
  image,
  copy,
}: {
  intro: TextBlock;
  image: Extract<ContentItem, { type: "image" }>;
  copy: TextBlock;
}) {
  const introParts = intro.text.split("\n\n").filter(Boolean);
  const copyParts = copy.text.split("\n\n").filter(Boolean);

  return (
    <section
      className="my-10 rounded-[24px] border border-line bg-white p-6 shadow-[0_12px_40px_rgba(15,23,42,0.08)] sm:p-10"
      data-testid="quilt-accessibility-panel"
    >
      <h3 className="text-2xl font-semibold leading-8 text-ink">Accessibility</h3>
      <div className="mt-4 space-y-8 text-xl leading-9 text-neutral-700">
        <p>{introParts[0]}</p>
        {introParts[1] && (
          <p>
            P.S. I'm currently working on an accessibility side project,{" "}
            <a className="font-semibold text-ink underline underline-offset-2" href="/case-studies/a11y-initiative">
              check it out!
            </a>
          </p>
        )}
      </div>

      <h4 className="mt-8 text-2xl font-semibold leading-8 text-ink">Sample accessibility guidelines</h4>
      <h5 className="mt-6 text-xl font-semibold leading-7 text-neutral-800">Colors</h5>

      <div className="mt-4 grid gap-8 lg:grid-cols-[minmax(220px,320px)_1fr] lg:gap-16">
        <img alt={image.alt || ""} className="w-full max-w-[320px] object-contain" loading="lazy" src={image.src} />
        <div className="space-y-10 text-xl leading-9 text-neutral-700 lg:pt-2">
          {copyParts.map((paragraph: string) => (
            <p key={paragraph}>
              <EmphasizedNumbers text={paragraph} />
            </p>
          ))}
        </div>
      </div>
    </section>
  );
}

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

    if (
      item.type === "h4" &&
      item.text === "Accessibility" &&
      isTextItem(items[index + 1], "p") &&
      isTextItem(items[index + 2], "h4", "Sample accessibility guidelines") &&
      isTextItem(items[index + 3], "h5") &&
      isImageItem(items[index + 4]) &&
      isTextItem(items[index + 5], "p")
    ) {
      flushList(listItems, `list-${index}`, output);
      output.push(
        <QuiltAccessibilityPanel
          copy={items[index + 5] as TextBlock}
          image={items[index + 4] as Extract<ContentItem, { type: "image" }>}
          intro={items[index + 1] as TextBlock}
          key="quilt-accessibility"
        />,
      );
      return;
    }

    if (
      index > 0 &&
      isTextItem(items[index - 1], "h4", "Accessibility")
    ) {
      return;
    }

    if (
      index > 1 &&
      isTextItem(items[index - 2], "h4", "Accessibility")
    ) {
      return;
    }

    if (
      index > 2 &&
      isTextItem(items[index - 3], "h4", "Accessibility")
    ) {
      return;
    }

    if (
      index > 3 &&
      isTextItem(items[index - 4], "h4", "Accessibility")
    ) {
      return;
    }

    if (
      index > 4 &&
      isTextItem(items[index - 5], "h4", "Accessibility")
    ) {
      return;
    }

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

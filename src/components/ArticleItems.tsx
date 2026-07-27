import type { ReactNode } from "react";
import { Check, X } from "lucide-react";

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
      className="my-10 rounded-3xl border border-neutral-200 bg-white p-6 shadow-[0_12px_40px] shadow-neutral-950/10 sm:p-10"
      data-testid="quilt-accessibility-panel"
    >
      <h3 className="text-xl font-semibold leading-8 text-stone-900">Accessibility</h3>
      <div className="mt-4 space-y-8 text-lg leading-8 text-stone-900 sm:text-xl">
        <p>{introParts[0]}</p>
      </div>

      <h4 className="mt-8 text-xl font-semibold leading-8 text-stone-900">Sample accessibility guidelines</h4>
      <h5 className="mt-6 text-xl font-semibold leading-8 text-stone-900">Colors</h5>

      <div className="mt-4 grid gap-8 lg:grid-cols-[minmax(220px,320px)_1fr] lg:gap-16">
        <img alt={image.alt || ""} className="w-full max-w-[320px] object-contain" loading="lazy" src={image.src} />
        <div className="space-y-10 text-lg leading-8 text-stone-900 sm:text-xl lg:pt-2">
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

const shofloPros = [
  "Widgets offer a lot of future options for growth with new widgets",
  "High excitement internally",
  "Left/right split offers greater information density",
];

const shofloCons = [
  "No pre-existing infrastructure in place for widgets",
  "Longer development time",
  "Lukewarm reception during user testing",
  "More difficulty in adapting for mobile user",
  "Left/right split would be a tougher learn for existing customers",
  "Higher cognitive load due to higher information density",
];

function ProConItem({ children, tone }: { children: string; tone: "pro" | "con" }) {
  const isPro = tone === "pro";
  const Icon = isPro ? Check : X;

  return (
    <li className="grid grid-cols-[32px_1fr] items-start gap-4 text-lg leading-8 text-stone-900 sm:text-xl">
      <span
        className={`mt-1 flex h-8 w-8 items-center justify-center rounded-full ${
          isPro ? "bg-green-700" : "bg-red-700"
        }`}
      >
        <Icon aria-hidden="true" className="h-5 w-5 stroke-[4] text-white" />
      </span>
      <span>{children}</span>
    </li>
  );
}

function ShofloProsConsPanel({ image }: { image: Extract<ContentItem, { type: "image" }> }) {
  return (
    <section
      className="my-12 grid max-w-full gap-10"
      data-testid="shoflo-pros-cons"
    >
      <figure className="overflow-hidden rounded-2xl bg-white shadow-[0_24px_56px] shadow-neutral-950/15">
        <img alt={image.alt || ""} className="w-full object-contain" loading="lazy" src={image.src} />
      </figure>

      <div className="lg:pt-0">
        <h3 className="text-xl font-semibold leading-8 text-stone-900">Pros and cons</h3>

        <h4 className="mt-8 text-xl font-semibold leading-8 text-stone-900">Pros</h4>
        <ul className="mt-5 grid gap-4">
          {shofloPros.map((item) => (
            <ProConItem key={item} tone="pro">
              {item}
            </ProConItem>
          ))}
        </ul>

        <h4 className="mt-8 text-xl font-semibold leading-8 text-stone-900">Cons</h4>
        <ul className="mt-5 grid gap-4">
          {shofloCons.map((item) => (
            <ProConItem key={item} tone="con">
              {item}
            </ProConItem>
          ))}
        </ul>
      </div>
    </section>
  );
}

function flushList(items: string[], key: string, output: ReactNode[]) {
  if (items.length === 0) return;
  output.push(
    <ul className="mt-3 list-disc space-y-2 pl-5 text-lg leading-8 text-stone-900 sm:text-xl" key={key}>
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

    if (isImageItem(item) && isTextItem(items[index + 1], "h4", "Pros and cons")) {
      return;
    }

    if (item.type === "h4" && item.text === "Pros and cons" && isImageItem(items[index - 1])) {
      flushList(listItems, `list-${index}`, output);
      output.push(
        <ShofloProsConsPanel image={items[index - 1] as Extract<ContentItem, { type: "image" }>} key="shoflo-pros-cons" />,
      );
      return;
    }

    if (
      index > 0 &&
      items.slice(Math.max(0, index - 12), index).some((previous) => isTextItem(previous, "h4", "Pros and cons")) &&
      !isTextItem(item, "h2")
    ) {
      return;
    }

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
        <h2 className="mt-10 text-xl font-semibold leading-8 text-stone-900 first:mt-0" key={index}>
          {item.text}
        </h2>,
      );
      return;
    }

    if (item.type === "h3" || item.type === "h4" || item.type === "h5") {
      output.push(
        <h3 className="mt-8 text-xl font-semibold leading-8 text-stone-900" key={index}>
          {item.text}
        </h3>,
      );
      return;
    }

    if (item.type === "p") {
      output.push(
        <p className="mt-3 text-lg leading-8 text-stone-900 sm:text-xl" key={index}>
          {item.text}
        </p>,
      );
      return;
    }

    if (item.type === "image") {
      output.push(
        <figure className="my-6 overflow-hidden rounded-2xl border border-neutral-200 bg-stone-50" key={`${item.src}-${index}`}>
          <img alt={item.alt || ""} className="w-full object-contain" loading="lazy" src={item.src} />
        </figure>,
      );
      return;
    }

    if (item.type === "video") {
      output.push(
        <video
          className="my-6 w-full rounded-2xl border border-neutral-200 bg-stone-50"
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

  return <div className="content-text min-w-0">{output}</div>;
}

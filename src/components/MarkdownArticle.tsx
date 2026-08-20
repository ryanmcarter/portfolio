import type { ReactNode, RefObject } from "react";
import { Check, X } from "lucide-react";

import { GuidingPrinciplesStack } from "@/components/GuidingPrinciplesStack";
import { KraidleTabsShowcase } from "@/components/KraidleTabsShowcase";
import { parseMarkdownList } from "@/lib/markdown-list";

type MarkdownBlock =
  | { type: "blockquote"; text: string }
  | { type: "code"; code: string; language?: string }
  | { type: "heading"; depth: number; text: string }
  | { type: "guiding-principles" }
  | { type: "hr" }
  | { type: "image"; alt: string; src: string }
  | { type: "kraidle-tabs" }
  | { type: "list"; ordered: boolean; items: string[] }
  | { type: "paragraph"; text: string }
  | {
      type: "quilt-accessibility";
      copy: string[];
      image: { alt: string; src: string };
      intro: string[];
    }
  | {
      type: "shoflo-pros-cons";
      cons: string[];
      image: { alt: string; src: string };
      pros: string[];
    }
  | { type: "table"; headers: string[]; rows: string[][] }
  | { type: "video"; autoPlay: boolean; poster?: string; src: string; title: string };

function cleanInline(text: string) {
  return text
    .replace(/<br\s*\/?>/gi, " ")
    .replace(/\\([|`*_{}\[\]()#+\-.!])/g, "$1")
    .trim();
}

function splitTableRow(row: string) {
  return row
    .trim()
    .replace(/^\|/, "")
    .replace(/\|$/, "")
    .split("|")
    .map((cell) => cleanInline(cell));
}

function isTableDivider(line: string) {
  return /^\s*\|?\s*:?-{3,}:?\s*(\|\s*:?-{3,}:?\s*)+\|?\s*$/.test(line);
}

function slugifyHeading(text: string) {
  return text
    .toLowerCase()
    .replace(/`([^`]+)`/g, "$1")
    .replace(/&/g, "")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/\s/g, "-");
}

function parseVideo(line: string): Extract<MarkdownBlock, { type: "video" }> | null {
  const tag = line.match(/^<Video\s+(.+?)\s*\/>\s*$/);
  if (!tag) return null;

  const attributes = Object.fromEntries(
    [...tag[1].matchAll(/([a-zA-Z][\w-]*)="([^"]*)"/g)].map((match) => [match[1], match[2]]),
  );
  if (!attributes.src || !attributes.title) return null;

  return {
    type: "video",
    autoPlay: attributes.autoplay !== "false",
    poster: attributes.poster,
    src: attributes.src,
    title: cleanInline(attributes.title),
  };
}

function parseMarkdown(markdown: string): MarkdownBlock[] {
  const lines = markdown.replace(/\r\n/g, "\n").split("\n");
  const blocks: MarkdownBlock[] = [];
  let index = 0;

  while (index < lines.length) {
    const line = lines[index];

    if (!line.trim()) {
      index += 1;
      continue;
    }

    const fence = line.match(/^```(\w+)?\s*$/);
    if (fence) {
      const language = fence[1];
      const code: string[] = [];
      index += 1;

      while (index < lines.length && !lines[index].startsWith("```")) {
        code.push(lines[index]);
        index += 1;
      }

      blocks.push({ type: "code", language, code: code.join("\n") });
      index += 1;
      continue;
    }

    if (/^---+\s*$/.test(line)) {
      blocks.push({ type: "hr" });
      index += 1;
      continue;
    }

    if (/^<KraidleTabsShowcase\s*\/>\s*$/.test(line)) {
      blocks.push({ type: "kraidle-tabs" });
      index += 1;
      continue;
    }

    const heading = line.match(/^(#{1,6})\s+(.+)$/);
    if (heading) {
      blocks.push({ type: "heading", depth: heading[1].length, text: cleanInline(heading[2]) });
      index += 1;
      continue;
    }

    const image = line.match(/^!\[([^\]]*)\]\(([^)]+)\)\s*$/);
    if (image) {
      blocks.push({ type: "image", alt: cleanInline(image[1]), src: image[2].trim() });
      index += 1;
      continue;
    }

    const video = parseVideo(line);
    if (video) {
      blocks.push(video);
      index += 1;
      continue;
    }

    if (line.trim().startsWith(">")) {
      const quote: string[] = [];
      while (index < lines.length && lines[index].trim().startsWith(">")) {
        quote.push(lines[index].replace(/^\s*>\s?/, ""));
        index += 1;
      }
      blocks.push({ type: "blockquote", text: quote.join(" ") });
      continue;
    }

    if (line.includes("|") && lines[index + 1] && isTableDivider(lines[index + 1])) {
      const headers = splitTableRow(line);
      const rows: string[][] = [];
      index += 2;

      while (index < lines.length && lines[index].includes("|") && lines[index].trim()) {
        rows.push(splitTableRow(lines[index]));
        index += 1;
      }

      blocks.push({ type: "table", headers, rows });
      continue;
    }

    const unordered = line.match(/^\s*[-*]\s+(.+)$/);
    const ordered = line.match(/^\s*\d+\.\s+(.+)$/);
    if (unordered || ordered) {
      const isOrdered = Boolean(ordered);
      const list = parseMarkdownList(lines, index, isOrdered);
      index = list.nextIndex;

      blocks.push({
        type: "list",
        ordered: isOrdered,
        items: list.items.map(cleanInline),
      });
      continue;
    }

    const paragraph: string[] = [];
    while (
      index < lines.length &&
      lines[index].trim() &&
      !lines[index].match(/^```/) &&
      !lines[index].match(/^(#{1,6})\s+/) &&
      !lines[index].match(/^!\[[^\]]*\]\([^)]+\)\s*$/) &&
      !parseVideo(lines[index]) &&
      !lines[index].match(/^<KraidleTabsShowcase\s*\/>\s*$/) &&
      !lines[index].trim().startsWith(">") &&
      !/^---+\s*$/.test(lines[index]) &&
      !(lines[index].includes("|") && lines[index + 1] && isTableDivider(lines[index + 1])) &&
      !lines[index].match(/^\s*[-*]\s+/) &&
      !lines[index].match(/^\s*\d+\.\s+/)
    ) {
      paragraph.push(lines[index]);
      index += 1;
    }
    blocks.push({ type: "paragraph", text: paragraph.join(" ") });
  }

  return blocks;
}

function renderInline(text: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  const pattern = /(\[([^\]]+)\]\(([^)]+)\)|`([^`]+)`|\*\*([^*]+)\*\*|\*([^*]+)\*)/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(text))) {
    if (match.index > lastIndex) nodes.push(cleanInline(text.slice(lastIndex, match.index)));

    if (match[2] && match[3]) {
      nodes.push(
        <a
          className="font-medium text-neutral-900 underline decoration-neutral-400 underline-offset-4 hover:decoration-neutral-900"
          href={match[3]}
          key={`${match.index}-link`}
        >
          {match[2]}
        </a>,
      );
    } else if (match[4]) {
      nodes.push(
        <code
          className="break-words rounded-sm bg-neutral-100 px-1.5 py-0.5 font-mono text-[0.92em] text-neutral-900"
          key={`${match.index}-code`}
        >
          {match[4]}
        </code>,
      );
    } else if (match[5]) {
      nodes.push(
        <strong className="font-semibold text-neutral-900" key={`${match.index}-strong`}>
          {match[5]}
        </strong>,
      );
    } else if (match[6]) {
      nodes.push(
        <em className="italic" key={`${match.index}-em`}>
          {match[6]}
        </em>,
      );
    }

    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < text.length) nodes.push(cleanInline(text.slice(lastIndex)));
  return nodes;
}

function MarkdownTable({ block }: { block: Extract<MarkdownBlock, { type: "table" }> }) {
  return (
    <div className="my-8 max-w-full overflow-x-auto rounded-lg border border-neutral-200">
      <table className="w-full min-w-[620px] border-collapse bg-white text-left text-sm leading-6">
        <thead className="bg-neutral-50 font-mono text-xs uppercase tracking-normal text-neutral-500">
          <tr>
            {block.headers.map((header) => (
              <th className="border-b border-neutral-200 px-4 py-3 font-semibold" key={header}>
                {renderInline(header)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-neutral-200">
          {block.rows.map((row, rowIndex) => (
            <tr key={`${row.join("-")}-${rowIndex}`}>
              {block.headers.map((header, columnIndex) => (
                <td className="px-4 py-3 align-top text-neutral-500" key={`${header}-${columnIndex}`}>
                  {renderInline(row[columnIndex] ?? "")}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
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
  block,
}: {
  block: Extract<MarkdownBlock, { type: "quilt-accessibility" }>;
}) {
  return (
    <section
      className="my-10 rounded-3xl border border-neutral-200 bg-white p-6 shadow-[0_12px_40px] shadow-neutral-950/10 sm:p-10"
      data-testid="quilt-accessibility-panel"
    >
      <h3 className="text-xl font-semibold leading-8 text-neutral-900">Accessibility</h3>
      <div className="mt-4 space-y-8 text-lg leading-8 text-neutral-900 sm:text-xl">
        {block.intro.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
      </div>

      <h4 className="mt-8 text-xl font-semibold leading-8 text-neutral-900">Sample accessibility guidelines</h4>
      <h5 className="mt-6 text-xl font-semibold leading-8 text-neutral-900">Colors</h5>

      <div className="mt-4 grid gap-8 lg:grid-cols-[minmax(220px,320px)_1fr] lg:gap-16">
        <img alt={block.image.alt} className="w-full max-w-[320px] object-contain" loading="lazy" src={block.image.src} />
        <div className="space-y-10 text-lg leading-8 text-neutral-900 sm:text-xl lg:pt-2">
          {block.copy.map((paragraph) => (
            <p key={paragraph}>
              <EmphasizedNumbers text={paragraph} />
            </p>
          ))}
        </div>
      </div>
    </section>
  );
}

function ProConItem({ children, tone }: { children: string; tone: "pro" | "con" }) {
  const isPro = tone === "pro";
  const Icon = isPro ? Check : X;

  return (
    <li className="grid grid-cols-[32px_1fr] items-start gap-4 text-lg leading-8 text-neutral-900 sm:text-xl">
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

function ShofloProsConsPanel({
  block,
}: {
  block: Extract<MarkdownBlock, { type: "shoflo-pros-cons" }>;
}) {
  return (
    <section className="my-12 grid max-w-full gap-10" data-testid="shoflo-pros-cons">
      <figure className="overflow-hidden rounded-2xl bg-white shadow-[0_24px_56px] shadow-neutral-950/15">
        <img alt={block.image.alt} className="w-full object-contain" loading="lazy" src={block.image.src} />
      </figure>

      <div className="lg:pt-0">
        <h3 className="text-xl font-semibold leading-8 text-neutral-900">Pros and cons</h3>

        <h4 className="mt-8 text-xl font-semibold leading-8 text-neutral-900">Pros</h4>
        <ul className="mt-5 grid gap-4">
          {block.pros.map((item) => (
            <ProConItem key={item} tone="pro">{item}</ProConItem>
          ))}
        </ul>

        <h4 className="mt-8 text-xl font-semibold leading-8 text-neutral-900">Cons</h4>
        <ul className="mt-5 grid gap-4">
          {block.cons.map((item) => (
            <ProConItem key={item} tone="con">{item}</ProConItem>
          ))}
        </ul>
      </div>
    </section>
  );
}

function transformLegacyPanels(blocks: MarkdownBlock[]) {
  const transformed: MarkdownBlock[] = [];

  for (let index = 0; index < blocks.length; index += 1) {
    const block = blocks[index];
    const prosConsHeading = blocks[index + 1];
    const prosHeading = blocks[index + 2];
    const prosList = blocks[index + 3];
    const consHeading = blocks[index + 4];
    const consList = blocks[index + 5];

    if (
      block.type === "image" &&
      prosConsHeading?.type === "heading" &&
      prosConsHeading.depth === 4 &&
      /^pros and cons$/i.test(prosConsHeading.text) &&
      prosHeading?.type === "heading" &&
      /^pros$/i.test(prosHeading.text) &&
      prosList?.type === "list" &&
      consHeading?.type === "heading" &&
      /^cons$/i.test(consHeading.text) &&
      consList?.type === "list"
    ) {
      transformed.push({
        type: "shoflo-pros-cons",
        cons: consList.items,
        image: { alt: block.alt, src: block.src },
        pros: prosList.items,
      });
      index += 5;
      continue;
    }

    if (
      block.type === "heading" &&
      block.depth === 4 &&
      /^accessibility$/i.test(block.text)
    ) {
      let cursor = index + 1;
      const intro: string[] = [];
      let paragraph = blocks[cursor];
      while (paragraph?.type === "paragraph") {
        intro.push(paragraph.text);
        cursor += 1;
        paragraph = blocks[cursor];
      }

      const sampleHeading = blocks[cursor];
      const colorsHeading = blocks[cursor + 1];
      const image = blocks[cursor + 2];
      if (
        intro.length > 0 &&
        sampleHeading?.type === "heading" &&
        /^sample accessibility guidelines$/i.test(sampleHeading.text) &&
        colorsHeading?.type === "heading" &&
        /^colors$/i.test(colorsHeading.text) &&
        image?.type === "image"
      ) {
        cursor += 3;
        const copy: string[] = [];
        paragraph = blocks[cursor];
        while (paragraph?.type === "paragraph") {
          copy.push(paragraph.text);
          cursor += 1;
          paragraph = blocks[cursor];
        }

        if (copy.length > 0) {
          transformed.push({
            type: "quilt-accessibility",
            copy,
            image: { alt: image.alt, src: image.src },
            intro,
          });
          index = cursor - 1;
          continue;
        }
      }
    }

    transformed.push(block);
  }

  return transformed;
}

export function MarkdownArticle({
  hideLead = false,
  markdown,
  scrollContainerRef,
}: {
  hideLead?: boolean;
  markdown: string;
  scrollContainerRef?: RefObject<HTMLElement | null>;
}) {
  let blocks = transformLegacyPanels(parseMarkdown(markdown));

  if (hideLead && blocks[0]?.type === "heading" && blocks[0].depth === 1) {
    const firstSectionIndex = blocks.findIndex(
      (block) => block.type === "heading" && block.depth === 2,
    );
    blocks = firstSectionIndex >= 0 ? blocks.slice(firstSectionIndex) : blocks;

    if (
      blocks[0]?.type === "heading" &&
      blocks[0].depth === 2 &&
      /^table of contents$/i.test(blocks[0].text)
    ) {
      const nextSectionIndex = blocks.findIndex(
        (block, index) => index > 0 && block.type === "heading" && block.depth === 2,
      );
      blocks = nextSectionIndex >= 0 ? blocks.slice(nextSectionIndex) : [];
    }
  }

  const principlesStartIndex = blocks.findIndex(
    (block) =>
      block.type === "heading" &&
      block.depth === 2 &&
      /goals\s*&\s*guiding principles$/i.test(block.text),
  );

  if (principlesStartIndex >= 0) {
    const nextDividerIndex = blocks.findIndex(
      (block, index) => index > principlesStartIndex && block.type === "hr",
    );
    const principlesEndIndex = nextDividerIndex >= 0 ? nextDividerIndex + 1 : principlesStartIndex + 1;

    blocks = [
      ...blocks.slice(0, principlesStartIndex),
      { type: "guiding-principles" },
      ...blocks.slice(principlesEndIndex),
    ];
  }

  return (
    <div className="content-text min-w-0">
      {blocks.map((block, index) => {
        if (block.type === "guiding-principles") {
          return <GuidingPrinciplesStack key={index} scrollContainerRef={scrollContainerRef} />;
        }

        if (block.type === "quilt-accessibility") {
          return <QuiltAccessibilityPanel block={block} key={index} />;
        }

        if (block.type === "shoflo-pros-cons") {
          return <ShofloProsConsPanel block={block} key={index} />;
        }

        if (block.type === "heading") {
          if (block.depth === 1) return null;
          if (block.depth === 2) {
            return (
              <h2
                className="mt-10 scroll-mt-24 text-xl font-semibold leading-8 text-neutral-900 first:mt-0"
                id={slugifyHeading(block.text)}
                key={index}
              >
                {block.text}
              </h2>
            );
          }

          return (
            <h3
              className="mt-8 scroll-mt-24 text-xl font-semibold leading-8 text-neutral-900"
              id={slugifyHeading(block.text)}
              key={index}
            >
              {block.text}
            </h3>
          );
        }

        if (block.type === "paragraph") {
          if (/^Table of contents$/i.test(block.text)) return null;
          return (
            <p className="mt-3 text-lg leading-8 text-neutral-900 sm:text-xl" key={index}>
              {renderInline(block.text)}
            </p>
          );
        }

        if (block.type === "blockquote") {
          return (
            <blockquote
              className="my-8 rounded-2xl border border-neutral-200 bg-neutral-50 p-5 text-lg leading-8 text-neutral-900 sm:text-xl"
              key={index}
            >
              {renderInline(block.text)}
            </blockquote>
          );
        }

        if (block.type === "image") {
          return (
            <figure
              className="my-6 max-w-full overflow-hidden rounded-2xl border border-neutral-200 bg-neutral-50"
              key={index}
            >
              <img alt={block.alt} className="h-auto w-full" decoding="async" loading="lazy" src={block.src} />
            </figure>
          );
        }

        if (block.type === "video") {
          if (!block.autoPlay) {
            return (
              <video
                aria-label={block.title}
                className="my-6 w-full rounded-2xl border border-neutral-200 bg-neutral-50"
                controls
                key={index}
                muted
                playsInline
                poster={block.poster}
                preload="metadata"
                src={block.src}
              >
                Your browser does not support embedded video. You can{" "}
                <a href={block.src}>open the screen recording directly</a>.
              </video>
            );
          }

          return (
            <figure
              className="my-6 max-w-full overflow-hidden rounded-2xl border border-neutral-200 bg-neutral-900"
              key={index}
            >
              <video
                aria-label={block.title}
                autoPlay
                className="h-auto w-full"
                controls
                muted
                playsInline
                poster={block.poster}
                preload="metadata"
                src={block.src}
              >
                Your browser does not support embedded video. You can{" "}
                <a href={block.src}>open the screen recording directly</a>.
              </video>
            </figure>
          );
        }

        if (block.type === "kraidle-tabs") return <KraidleTabsShowcase key={index} />;

        if (block.type === "list") {
          const ListTag = block.ordered ? "ol" : "ul";
          return (
            <ListTag
              className={`mt-3 space-y-2 pl-5 text-lg leading-8 text-neutral-900 sm:text-xl ${
                block.ordered ? "list-decimal" : "list-disc"
              }`}
              key={index}
            >
              {block.items.map((item, itemIndex) => (
                <li key={`${itemIndex}-${item}`}>{renderInline(item)}</li>
              ))}
            </ListTag>
          );
        }

        if (block.type === "table") return <MarkdownTable block={block} key={index} />;

        if (block.type === "code") {
          return (
            <figure
              className="my-8 max-w-full overflow-hidden rounded-lg border border-neutral-800 bg-neutral-900"
              key={index}
            >
              {block.language && (
                <figcaption className="border-b border-white/10 px-4 py-2 font-mono text-xs uppercase text-neutral-400">
                  {block.language}
                </figcaption>
              )}
              <pre className="overflow-x-auto p-4 text-sm leading-6 text-neutral-100">
                <code>{block.code}</code>
              </pre>
            </figure>
          );
        }

        return <hr className="my-10 border-neutral-200" key={index} />;
      })}
    </div>
  );
}

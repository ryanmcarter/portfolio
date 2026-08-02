import type { ReactNode } from "react";

import { parseMarkdownList } from "@/lib/markdown-list";

type MarkdownBlock =
  | { type: "blockquote"; text: string }
  | { type: "code"; code: string; language?: string }
  | { type: "heading"; depth: number; text: string }
  | { type: "hr" }
  | { type: "image"; alt: string; src: string }
  | { type: "list"; ordered: boolean; items: string[] }
  | { type: "paragraph"; text: string }
  | { type: "table"; headers: string[]; rows: string[][] };

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
          className="font-medium text-stone-900 underline decoration-neutral-400 underline-offset-4 hover:decoration-stone-900"
          href={match[3]}
          key={`${match.index}-link`}
        >
          {match[2]}
        </a>,
      );
    } else if (match[4]) {
      nodes.push(
        <code
          className="break-words rounded-sm bg-neutral-100 px-1.5 py-0.5 font-mono text-[0.92em] text-stone-900"
          key={`${match.index}-code`}
        >
          {match[4]}
        </code>,
      );
    } else if (match[5]) {
      nodes.push(
        <strong className="font-semibold text-stone-900" key={`${match.index}-strong`}>
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
        <thead className="bg-stone-50 font-mono text-xs uppercase tracking-normal text-neutral-500">
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
                <td className="px-4 py-3 align-top text-neutral-600" key={`${header}-${columnIndex}`}>
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

export function MarkdownArticle({
  hideLead = false,
  markdown,
}: {
  hideLead?: boolean;
  markdown: string;
}) {
  let blocks = parseMarkdown(markdown);

  if (hideLead) {
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

  return (
    <div className="content-text min-w-0">
      {blocks.map((block, index) => {
        if (block.type === "heading") {
          if (block.depth === 1) return null;
          if (block.depth === 2) {
            return (
              <h2
                className="mt-10 scroll-mt-24 text-xl font-semibold leading-8 text-stone-900 first:mt-0"
                id={slugifyHeading(block.text)}
                key={index}
              >
                {block.text}
              </h2>
            );
          }

          return (
            <h3
              className="mt-8 scroll-mt-24 text-xl font-semibold leading-8 text-stone-900"
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
            <p className="mt-3 text-lg leading-8 text-stone-900 sm:text-xl" key={index}>
              {renderInline(block.text)}
            </p>
          );
        }

        if (block.type === "blockquote") {
          return (
            <blockquote
              className="my-8 rounded-2xl border border-neutral-200 bg-stone-50 p-5 text-lg leading-8 text-stone-900 sm:text-xl"
              key={index}
            >
              {renderInline(block.text)}
            </blockquote>
          );
        }

        if (block.type === "image") {
          return (
            <figure
              className="my-6 max-w-full overflow-hidden rounded-2xl border border-neutral-200 bg-stone-50"
              key={index}
            >
              <img alt={block.alt} className="h-auto w-full" decoding="async" loading="lazy" src={block.src} />
            </figure>
          );
        }

        if (block.type === "list") {
          const ListTag = block.ordered ? "ol" : "ul";
          return (
            <ListTag
              className={`mt-3 space-y-2 pl-5 text-lg leading-8 text-stone-900 sm:text-xl ${
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
              className="my-8 max-w-full overflow-hidden rounded-lg border border-neutral-800 bg-neutral-950"
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

import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

import { parseMarkdownList } from "../src/lib/markdown-list.ts";

const orderedLines = [
  "1. **First item.** The first line",
  "   continues on the next line.",
  "2. **Second item.** Another item",
  "   with another continuation.",
  "3. **Third item.** Final item.",
  "",
];
const unorderedLines = [
  "- **First bullet.** The first line",
  "  continues on the next line.",
  "- **Second bullet.** Final bullet.",
  "",
];

assert.deepEqual(parseMarkdownList(orderedLines, 0, true), {
  items: [
    "**First item.** The first line continues on the next line.",
    "**Second item.** Another item with another continuation.",
    "**Third item.** Final item.",
  ],
  nextIndex: 5,
});
assert.deepEqual(parseMarkdownList(unorderedLines, 0, false), {
  items: [
    "**First bullet.** The first line continues on the next line.",
    "**Second bullet.** Final bullet.",
  ],
  nextIndex: 3,
});

const caseStudy = await readFile("src/data/kraidle-case-study.md", "utf8");
const caseStudyLines = caseStudy.replace(/\r\n/g, "\n").split("\n");
const principlesStart = caseStudyLines.findIndex((line) =>
  line.startsWith("1. **Token-first.**"),
);
assert.notEqual(principlesStart, -1);

const principles = parseMarkdownList(caseStudyLines, principlesStart, true);
assert.equal(principles.items.length, 7);
assert.match(principles.items[6], /^\*\*The system grows itself\.\*\*/);

console.log("Markdown wrapped-list checks passed.");

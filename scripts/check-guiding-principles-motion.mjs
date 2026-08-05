import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const source = await readFile("src/components/GuidingPrinciplesStack.tsx", "utf8");

assert.doesNotMatch(
  source,
  /\bfilter\b|blur\(/,
  "Guiding-principle cards and readable content must not depend on a scroll-scrubbed filter.",
);
assert.doesNotMatch(
  source,
  /willChange:\s*["'][^"']*filter/,
  "Guiding-principle cards must not persistently promote a filter layer.",
);
assert.equal(
  source.match(/shouldStack \? \{ opacity: contentOpacity, y: contentY \} : undefined/g)
    ?.length,
  2,
  "The stacked icon and copy must retain their opacity and position progression.",
);

console.log("Guiding principles readable-content motion checks passed.");

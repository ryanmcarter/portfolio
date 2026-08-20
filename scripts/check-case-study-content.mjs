import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import { join } from "node:path";

const activeSlugs = ["kraidle", "dynamic-plan", "quilt", "keel", "studio"];
const legacyStructure = {
  "a11y-initiative": { headings: 4, images: 3, lists: 0, videos: 0 },
  keel: { headings: 25, images: 16, lists: 15, videos: 1 },
  polymer: { headings: 21, images: 13, lists: 48, videos: 0 },
  quilt: { headings: 15, images: 9, lists: 47, videos: 1 },
  shoflo: { headings: 18, images: 9, lists: 9, videos: 5 },
  studio: { headings: 16, images: 10, lists: 21, videos: 0 },
  thyme: { headings: 4, images: 3, lists: 0, videos: 0 },
};

const portfolioSource = await readFile("src/data/portfolio.ts", "utf8");
const drawerSource = await readFile("src/components/CaseStudyDrawer.tsx", "utf8");
const rendererSource = await readFile("src/components/MarkdownArticle.tsx", "utf8");
const scraped = JSON.parse(await readFile("src/data/scraped-content.json", "utf8"));

assert.deepEqual(Object.keys(scraped).sort(), ["contact", "home"]);
assert.doesNotMatch(portfolioSource, /itemsForPage|mediaForPage|\.page\b|ContentItem/);
assert.doesNotMatch(drawerSource, /ArticleItems|scrapedLogo|contentItems/);

const orderMatch = portfolioSource.match(/const caseStudyOrder = \[([\s\S]*?)\];/);
assert.ok(orderMatch, "caseStudyOrder must remain statically inspectable");
const order = [...orderMatch[1].matchAll(/"([^"]+)"/g)].map((match) => match[1]);
assert.deepEqual(order, activeSlugs);

for (const slug of activeSlugs) {
  const importPattern = new RegExp(`from "\\./${slug}-case-study\\.md\\?raw"`);
  assert.match(portfolioSource, importPattern, `${slug} must have a raw Markdown import`);
  assert.match(portfolioSource, new RegExp(`(?:"${slug}"|${slug}): \\w+CaseStudyMarkdown`));

  const metadataEntry = portfolioSource.match(
    new RegExp(`\\n  (?:"${slug}"|${slug}): \\{([\\s\\S]*?)\\n  \\},`),
  );
  assert.ok(metadataEntry, `${slug} metadata must remain statically inspectable`);
  const client = metadataEntry[1].match(/client: "([^"]+)"/)?.[1];
  assert.ok(client, `${slug} needs a client`);
  assert.match(drawerSource, new RegExp(`(?:"${client}"|${client}):`), `${client} needs a static logo`);
}

for (const [slug, expected] of Object.entries(legacyStructure)) {
  const markdown = await readFile(`src/data/${slug}-case-study.md`, "utf8");
  assert.ok(markdown.length > 1_000, `${slug} Markdown looks truncated`);
  assert.equal((markdown.match(/^#{2,5} /gm) ?? []).length, expected.headings, `${slug} heading count`);
  assert.equal((markdown.match(/^- /gm) ?? []).length, expected.lists, `${slug} list-item count`);
  assert.equal((markdown.match(/^!\[/gm) ?? []).length, expected.images, `${slug} image count`);
  assert.equal((markdown.match(/^<Video /gm) ?? []).length, expected.videos, `${slug} video count`);

  const mediaPaths = [...markdown.matchAll(/(?:!\[[^\]]*\]\(|\bsrc="|\bposter=")((?:\/assets\/)[^)\"]+)/g)]
    .map((match) => match[1]);
  for (const mediaPath of mediaPaths) {
    await access(join("public", mediaPath.replace(/^\/assets\//, "assets/")));
  }
}

const quilt = await readFile("src/data/quilt-case-study.md", "utf8");
assert.match(quilt, /^#### Accessibility$/m);
assert.match(quilt, /^#### Sample accessibility guidelines$/m);
assert.match(quilt, /P\.S\. I'm currently working on an accessibility side project/);
assert.match(rendererSource, /data-testid="quilt-accessibility-panel"/);
assert.match(rendererSource, /block\.intro\.map/);

const shoflo = await readFile("src/data/shoflo-case-study.md", "utf8");
assert.match(shoflo, /^#### Pros and cons$/m);
assert.match(shoflo, /^##### Pros$/m);
assert.match(shoflo, /^##### Cons$/m);
assert.match(shoflo, /src="\/assets\/oldIOSTracking\.mov"/);
assert.match(rendererSource, /data-testid="shoflo-pros-cons"/);
assert.doesNotMatch(rendererSource, /video\/mp4/);
assert.match(rendererSource, /src=\{block\.src\}/);

console.log("Case-study Markdown architecture checks passed.");

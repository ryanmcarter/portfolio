import { readFile, writeFile } from "node:fs/promises";
import { basename, join } from "node:path";

const pages = [
  "home",
  "contact",
  "keel",
  "quilt",
  "studio",
  "polymer",
  "shoflo",
  "thyme",
  "a11y-initiative",
];

const decode = (value) =>
  value
    .replace(/&nbsp;|&#xA0;| /g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&#x27;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&mdash;|—/g, "-")
    .replace(/&rsquo;/g, "'")
    .replace(/&ldquo;|&rdquo;/g, '"')
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/\u200d/g, "")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/[ \t]{2,}/g, " ")
    .trim();

const attr = (tag, name) => {
  const match = tag.match(new RegExp(`${name}="([^"]*)"`, "i"));
  return match ? decode(match[1]) : "";
};

const extractBlocks = (html) => {
  const matches = [
    ...html.matchAll(/<(h1|h2|h3|h4|h5|p|li)(?:\s[^>]*)?>([\s\S]*?)<\/\1>/gi),
  ];
  return matches
    .map((match) => ({
      type: match[1].toLowerCase(),
      text: decode(match[2]),
    }))
    .filter((block) => block.text && !["Home", "Résumé", "Contact"].includes(block.text));
};

const extractMedia = (html) => {
  const images = [...html.matchAll(/<img\b[^>]*>/gi)].map((match) => ({
    src: attr(match[0], "src"),
    alt: attr(match[0], "alt"),
  }));
  const videos = [...html.matchAll(/https?:\/\/[^"' ),]+?\.(?:mp4|webm|mov)/gi)].map((match) => match[0]);
  return {
    images: images.filter((image) => image.src),
    videos: [...new Set(videos)],
  };
};

const extractOrderedItems = (html) => {
  const mainMatch = html.match(/<main[^>]*>([\s\S]*?)<\/main>/i);
  const heroMatch = html.match(/<div role="contentinfo"[\s\S]*?<\/div><\/div><\/div><\/div>/i);
  const source = `${heroMatch?.[0] ?? ""}${mainMatch?.[0] ?? html}`;
  const tokens = [
    ...source.matchAll(
      /<(h1|h2|h3|h4|h5|p|li)(?:\s[^>]*)?>([\s\S]*?)<\/\1>|<img\b[^>]*>|<video\b[\s\S]*?<\/video>/gi,
    ),
  ];

  return tokens
    .map((match) => {
      const raw = match[0];
      if (/^<img/i.test(raw)) {
        const src = attr(raw, "src");
        const alt = attr(raw, "alt");
        if (!src) return null;
        if (/ryan-carter-logo|Pause\.svg|Play-24\.svg/i.test(src)) return null;
        return { type: "image", src, alt };
      }

      if (/^<video/i.test(raw)) {
        const sourceMatch = raw.match(/<source\b[^>]*src="([^"]+)"/i);
        const posterMatch = raw.match(/background-image:url\(&quot;([^&]+)&quot;\)/i);
        const src = sourceMatch ? decode(sourceMatch[1]) : "";
        if (!src) return null;
        return { type: "video", src, poster: posterMatch ? decode(posterMatch[1]) : "" };
      }

      const type = match[1].toLowerCase();
      const text = decode(match[2]);
      if (!text || ["Home", "Résumé", "Contact"].includes(text)) return null;
      return { type, text };
    })
    .filter(Boolean);
};

const pageTitle = (html, fallback) => {
  const h1 = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
  if (h1) return decode(h1[1]);
  const title = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  return title ? decode(title[1]).replace(" - Ryan Carter", "") : fallback;
};

const content = {};
for (const page of pages) {
  const html = await readFile(join("scrape", "pages", `${page}.html`), "utf8");
  content[page] = {
    slug: page,
    title: pageTitle(html, page),
    blocks: extractBlocks(html),
    items: extractOrderedItems(html),
    media: extractMedia(html),
  };
}

const urls = new Set();
for (const page of Object.values(content)) {
  for (const image of page.media.images) urls.add(image.src);
  for (const video of page.media.videos) urls.add(video);
}

const assetList = [...urls]
  .filter((url) => /\.(png|jpe?g|svg|gif|webp|mp4|webm|mov|pdf)(\?|$)/i.test(url))
  .map((url) => url.replace(/&quot;.*$/g, ""));

await writeFile(
  join("src", "data", "scraped-content.json"),
  `${JSON.stringify(content, null, 2)}\n`,
);
await writeFile(join("scrape", "assets.txt"), `${assetList.join("\n")}\n`);

console.log(`Extracted ${pages.length} pages and ${assetList.length} asset references.`);
console.log(`Largest source page: ${basename("scrape/pages/keel.html")}`);

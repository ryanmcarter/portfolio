import assetManifest from "./asset-manifest.json";
import dynamicPlanCaseStudyMarkdown from "./dynamic-plan-case-study.md?raw";
import kraidleCaseStudyMarkdown from "./kraidle-case-study.md?raw";
import scraped from "./scraped-content.json";

export type TextBlock = {
  type: "h1" | "h2" | "h3" | "h4" | "h5" | "p" | "li";
  text: string;
};

export type ContentItem =
  | TextBlock
  | { type: "image"; src: string; alt: string }
  | { type: "video"; src: string; poster?: string };

type ScrapedPage = {
  slug: string;
  title: string;
  blocks: TextBlock[];
  items?: ContentItem[];
  media: {
    images: { src: string; alt: string }[];
    videos: string[];
  };
};

const manifest = assetManifest as Record<string, string>;
const pages = scraped as Record<string, ScrapedPage>;

export const asset = (url: string) => manifest[url] ?? url;

export const resumeUrl = "/assets/65a5ade06a24bc4336e17d01_RyanCarterResume.pdf";

export const profileImage = asset(
  "https://cdn.prod.website-files.com/5d4c831b7ec366c966c2a304/5fd971c6be9a48657893fd6a_ryanCarter-homeBackgroundImage.jpg",
);

export const aboutText = `I’m a Senior Product Designer with 12+ years of experience designing scalable design systems, accessible interfaces, complex product experiences, and high-performing web experiences.

My strongest work sits at the intersection of product design, design systems, accessibility, and AI-assisted prototyping. I’ve spent 8+ years focused on design systems, including component libraries, design tokens, Figma variables, governance, documentation, accessibility, and close engineering collaboration.

At Gradle, I’ve used Claude Code and AI-assisted workflows to ship a token-powered design system with Code Connect to Figma, automated UI and accessibility testing, custom Figma tooling, and scalable component workflows. I also created a self-service Markdown-to-Next.js page generation workflow that enables sales and product teams to author page specs in Markdown and convert them into design-system-powered Next.js pages.

I’ve also designed developer-facing product experiences including the Develocity IntelliJ plugin and an AI-powered Failures Summary UI for Gradle Build Scan. On the web side, I’ve shipped the Gradle homepage, Develocity product page, release notes UI, documentation center, about a dozen marketing pages, and roughly 70 custom web assets including illustrations, SVGs, animations, and visual storytelling elements.

Previously, I built design systems at NYSHEX and Ribbon, led design for a data analytics platform and iOS product, and joined Shoflo as the first and only product designer before the company was acquired by Cvent.

Design systems are my specialty, but I’m also highly hands-on across UX, UI, prototyping, accessibility, research, design QA, and AI-assisted implementation workflows.`;

export const experience = [
  ["2024—present", "Gradle Technologies", "Senior Product Designer"],
  ["2023—2024", "New York Shipping Exchange", "Senior Product Designer"],
  ["2022", "Ribbon Homes", "Senior Systems Designer"],
  ["2015—2022", "Shoflo (acquired)", "Founding Product Designer"],
  ["2014—present", "Western Pixel", "Freelance Product Designer"],
] as const;

const heroImages: Record<string, string> = {
  "dynamic-plan": "/assets/dynamic-plan-v3-overview.png",
  kraidle: "/assets/kraidle-card-art-figma.png",
  keel: "/assets/keel-card-art.png",
  quilt: "https://cdn.prod.website-files.com/5d4c831b7ec366c966c2a304/6377013615fcfec66303e1f1_ryancarter-quilt-heroImage-thumb.png",
  studio: "https://cdn.prod.website-files.com/5d4c831b7ec366c966c2a304/63896c5c7d2c2b34b0e43421_ryancarter-studio-heroImage-thumb.png",
};

const detailHeroImages: Partial<Record<string, string>> = {
  kraidle: "/assets/kraidle-case-study-hero.png",
};

const markdownPages: Record<string, string> = {
  "dynamic-plan": dynamicPlanCaseStudyMarkdown,
  kraidle: kraidleCaseStudyMarkdown,
};

const metadata: Record<
  string,
  {
    client: string;
    date: string;
    role: string;
    summary: string;
    title: string;
    toolset: string;
  }
> = {
  "dynamic-plan": {
    client: "New York Shipping Exchange",
    date: "Late 2023",
    role: "Lead Product Designer",
    title: "NYSHEX Dynamic Plan data management platform",
    summary:
      "Dynamic Plan turned complex ocean-shipping plan data into a workspace where carriers and shippers could understand performance, narrow the data to what mattered, and make updates without leaving the product.",
    toolset: "Figma, Miro, Tokens Studio, VSCode",
  },
  kraidle: {
    client: "Gradle Technologies",
    date: "2025—2026",
    role: "Product Designer & Design Engineer",
    title: "Kraidle Design System",
    summary:
      "A connected, AI-augmented design system that treats Figma, code, and AI-assisted workflows as coordinated views of one source of truth.",
    toolset: "Figma, design tokens, React, Storybook, ESLint, GitHub Actions, Claude Code",
  },
  keel: {
    client: "New York Shipping Exchange",
    date: "2023—2024",
    role: "Design Systems Lead",
    title: "Keel Design System",
    summary:
      "Keel is a bespoke design system built in Figma on top of a comprehensive atomic design token architecture for the NYSHEX product team.",
    toolset: "Figma, design tokens, component documentation, accessibility",
  },
  quilt: {
    client: "Ribbon Homes",
    date: "2022",
    role: "Senior Systems Designer",
    title: "Quilt Design System",
    summary:
      "Quilt is a Figma-based design system for Ribbon's design and engineering team, built rapidly with documentation and accessibility.",
    toolset: "Figma, Figma Tokens, documentation, prototyping",
  },
  studio: {
    client: "Shoflo",
    date: "2020",
    role: "Founding Product Designer",
    title: "Shoflo Studio",
    summary:
      "A browser-based live streaming studio designed and launched during COVID with the Shoflo team.",
    toolset: "Figma, prototyping, product design, QA",
  },
};

const caseStudyOrder = [
  "dynamic-plan",
  "kraidle",
  "keel",
  "quilt",
  "studio",
];

export const caseStudies = caseStudyOrder.map((slug) => ({
  slug,
  ...metadata[slug],
  href: `/case-studies/${slug}`,
  image: asset(heroImages[slug]),
  detailHeroImage: detailHeroImages[slug]
    ? asset(detailHeroImages[slug])
    : undefined,
  markdown: markdownPages[slug],
  page: pages[slug],
}));

export const homePage = pages.home;
export const contactPage = pages.contact;

export function getCaseStudy(slug: string) {
  return caseStudies.find((study) => study.slug === slug);
}

export function mediaForPage(page: ScrapedPage) {
  const images = page.media.images
    .map((image) => ({ ...image, src: asset(image.src) }))
    .filter((image) => !image.src.includes("ryan-carter-logo"));
  const videos = page.media.videos.map((video) => asset(video));
  return { images, videos };
}

export function itemsForPage(page: ScrapedPage) {
  return (page.items ?? page.blocks).map((item) => {
    if (item.type === "image") return { ...item, src: asset(item.src) };
    if (item.type === "video") return { ...item, src: asset(item.src), poster: item.poster ? asset(item.poster) : undefined };
    return item;
  });
}

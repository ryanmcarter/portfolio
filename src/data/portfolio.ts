import assetManifest from "./asset-manifest.json";
import dynamicPlanCaseStudyMarkdown from "./dynamic-plan-case-study.md?raw";
import keelCaseStudyMarkdown from "./keel-case-study.md?raw";
import kraidleCaseStudyMarkdown from "./kraidle-case-study.md?raw";
import quiltCaseStudyMarkdown from "./quilt-case-study.md?raw";
import scraped from "./scraped-content.json";
import studioCaseStudyMarkdown from "./studio-case-study.md?raw";

export type TextBlock = {
  type: "h1" | "h2" | "h3" | "h4" | "h5" | "p" | "li";
  text: string;
};

type ScrapedPage = {
  slug: string;
  title: string;
  blocks: TextBlock[];
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
  ["2024—2026", "Gradle Technologies", "Senior Product Designer"],
  ["2023—2024", "New York Shipping Exchange", "Senior Product Designer"],
  ["2022—2022", "Ribbon Homes", "Senior Systems Designer"],
  ["2015—2022", "Shoflo (acquired)", "Founding Product Designer"],
  ["2014—present", "Western Pixel", "Freelance Product Designer"],
] as const;

const heroImages: Record<string, string> = {
  "dynamic-plan": "/assets/home-card-dynamic-plan.png",
  kraidle: "/assets/kraidle-card-art-figma.png",
  keel: "/assets/keel-card-art.png",
  quilt: "/assets/home-card-quilt.png",
  studio: "/assets/home-card-studio.png",
};

const detailHeroImages: Partial<Record<string, string>> = {
  kraidle: "/assets/kraidle-case-study-hero.png",
};

const markdownPages: Record<string, string> = {
  "dynamic-plan": dynamicPlanCaseStudyMarkdown,
  keel: keelCaseStudyMarkdown,
  kraidle: kraidleCaseStudyMarkdown,
  quilt: quiltCaseStudyMarkdown,
  studio: studioCaseStudyMarkdown,
};

const metadata: Record<
  string,
  {
    cardCategory: "Design systems" | "Product design";
    cardSummary: string;
    cardTitle: string;
    client: string;
    date: string;
    hoverHeadline: {
      emphasis: string;
      lead: string;
    };
    published: boolean;
    role: string;
    summary: string;
    title: string;
    toolset: string;
  }
> = {
  "dynamic-plan": {
    cardCategory: "Product design",
    cardSummary:
      "Dynamic Plan turned ocean-shipping data into a simple workspace purpose built for data filtering and real time allocation adjustments.",
    cardTitle: "Designing a complex data management platform for NYSHEX",
    client: "New York Shipping Exchange",
    date: "Late 2023",
    hoverHeadline: {
      lead: "who designed a complex data management and charting product for the",
      emphasis: "New York Shipping Exchange",
    },
    published: true,
    role: "Lead Product Designer",
    title: "NYSHEX Dynamic Plan data management platform",
    summary:
      "Dynamic Plan turned complex ocean-shipping plan data into a workspace where carriers and shippers could understand performance, narrow the data to what mattered, and make updates without leaving the product.",
    toolset: "Figma, Miro, Tokens Studio, VSCode",
  },
  kraidle: {
    cardCategory: "Design systems",
    cardSummary:
      "Kraidle was a new design system that enabled anyone to write a page in markdown, 10x faster than before.",
    cardTitle: "Building an AI-first design system with Claude Code",
    client: "Gradle Technologies",
    date: "Summer 2026",
    hoverHeadline: {
      lead: "who designed and engineered an AI-augmented design system for",
      emphasis: "Gradle Technologies",
    },
    published: true,
    role: "Product Designer & Design Engineer",
    title: "Creating a token-powered design system with Claude Code",
    summary:
      "A connected, AI-augmented design system that treats Figma, code, and AI-assisted workflows as coordinated views of one source of truth.",
    toolset: "Claude Code, Figma, Tokens Studio, Storybook",
  },
  keel: {
    cardCategory: "Design systems",
    cardSummary:
      "Keel was a new design system built for NYSHEX to power their complex data visualization & management platform.",
    cardTitle: "Shipping a bespoke design system for ocean carriers",
    client: "New York Shipping Exchange",
    date: "2023—2024",
    hoverHeadline: {
      lead: "who built a token-based product design system for",
      emphasis: "New York Shipping Exchange",
    },
    published: true,
    role: "Design Systems Lead",
    title: "Keel Design System",
    summary:
      "Keel is a bespoke design system built in Figma on top of a comprehensive atomic design token architecture for the NYSHEX product team.",
    toolset: "Figma, design tokens, component documentation, accessibility",
  },
  quilt: {
    cardCategory: "Design systems",
    cardSummary:
      "Quilt was a token-powered web & iOS design system enabling the 12 person product team to ship faster and more consistently.",
    cardTitle: "Building a multi-platform design system for Ribbon Homes",
    client: "Ribbon Homes",
    date: "2022",
    hoverHeadline: {
      lead: "who rapidly built an accessible design system for",
      emphasis: "Ribbon Homes",
    },
    published: true,
    role: "Senior Systems Designer",
    title: "Quilt Design System",
    summary:
      "Quilt is a Figma-based design system for Ribbon's design and engineering team, built rapidly with documentation and accessibility.",
    toolset: "Figma, Figma Tokens, documentation, prototyping",
  },
  studio: {
    cardCategory: "Product design",
    cardSummary:
      "Shoflo Studio was a web based studio that let directors orchestrate live events with video-based presenters anywhere in the world.",
    cardTitle: "Designing a browser-based live streaming studio",
    client: "Shoflo",
    date: "2020",
    hoverHeadline: {
      lead: "who designed and launched a browser-based live streaming studio with",
      emphasis: "Shoflo",
    },
    published: true,
    role: "Founding Product Designer",
    title: "Shoflo Studio",
    summary:
      "A browser-based live streaming studio designed and launched during COVID with the Shoflo team.",
    toolset: "Figma, prototyping, product design, QA",
  },
};

const caseStudyOrder = [
  "kraidle",
  "dynamic-plan",
  "quilt",
  "keel",
  "studio",
];

const allCaseStudies = caseStudyOrder.map((slug) => ({
  slug,
  ...metadata[slug],
  href: `/case-studies/${slug}`,
  image: asset(heroImages[slug]),
  detailHeroImage: detailHeroImages[slug]
    ? asset(detailHeroImages[slug])
    : undefined,
  markdown: markdownPages[slug],
}));

export const caseStudies = allCaseStudies.filter((study) => study.published);

export const homePage = pages.home;
export const contactPage = pages.contact;

export function getCaseStudy(slug: string) {
  return caseStudies.find((study) => study.slug === slug);
}

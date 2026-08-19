import htssCaseStudyMarkdown from "./htss-case-study.md?raw";

// This draft remains authorable in the repository but is intentionally not
// imported by the production portfolio entry point.
export const htssDraft = {
  cardCategory: "Product design",
  cardSummary:
    "I led design and did front-end development for How To Start Something, helping aspiring entrepreneurs build & validate their ideas.",
  cardTitle: "Leading design on an eLearning SaaS for entrepreneurs",
  client: "How to Start Something",
  date: "2024",
  hoverHeadline: {
    lead: "who designed an eLearning SaaS experience for aspiring entrepreneurs with",
    emphasis: "How to Start Something",
  },
  href: "/htss",
  image: "/assets/home-card-htss.png",
  markdown: htssCaseStudyMarkdown,
  published: false,
  role: "Product Designer",
  slug: "htss",
  summary:
    "An eLearning SaaS experience that helps aspiring founders learn, connect with mentors, and turn progress into concrete next steps.",
  title: "How to Start Something: eLearning SaaS",
  toolset: "Figma, prototyping, product design",
} as const;

import { copyFile, mkdir, readFile, rm, writeFile } from "node:fs/promises";

const caseStudySlugs = [
  "kraidle",
  "dynamic-plan",
  "quilt",
  "keel",
  "studio",
];

const draftAssets = [
  "elearning-saas-action-item-drawer.png",
  "elearning-saas-course-workflow.png",
  "elearning-saas-mentor-messages.png",
  "elearning-saas-success-markers.png",
  "home-card-htss.png",
];

const indexHtml = await readFile("dist/index.html", "utf8");

await Promise.all([
  copyFile("dist/index.html", "dist/404.html"),
  ...caseStudySlugs.map(async (slug) => {
    const routeDirectory = `dist/case-studies/${slug}`;
    await mkdir(routeDirectory, { recursive: true });
    // Share the site's preview while keeping each case study's Open Graph URL.
    const routeHtml = indexHtml.replace(
      '<meta property="og:url" content="https://ryancarter.io/"',
      `<meta property="og:url" content="https://ryancarter.io/case-studies/${slug}"`,
    );
    await writeFile(`${routeDirectory}/index.html`, routeHtml);
  }),
]);
await Promise.all(
  draftAssets.map((filename) => rm(`dist/assets/${filename}`, { force: true })),
);

import { copyFile, mkdir, rm } from "node:fs/promises";

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

await Promise.all([
  copyFile("dist/index.html", "dist/404.html"),
  ...caseStudySlugs.map(async (slug) => {
    const routeDirectory = `dist/case-studies/${slug}`;
    await mkdir(routeDirectory, { recursive: true });
    await copyFile("dist/index.html", `${routeDirectory}/index.html`);
  }),
]);
await Promise.all(
  draftAssets.map((filename) => rm(`dist/assets/${filename}`, { force: true })),
);

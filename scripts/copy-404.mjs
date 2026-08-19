import { copyFile, rm } from "node:fs/promises";

const draftAssets = [
  "elearning-saas-action-item-drawer.png",
  "elearning-saas-course-workflow.png",
  "elearning-saas-mentor-messages.png",
  "elearning-saas-success-markers.png",
  "home-card-htss.png",
];

await copyFile("dist/index.html", "dist/404.html");
await Promise.all(
  draftAssets.map((filename) => rm(`dist/assets/${filename}`, { force: true })),
);

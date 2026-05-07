import { createWriteStream } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { basename, extname, join } from "node:path";
import { get } from "node:https";

const assetDir = join("public", "assets");
await mkdir(assetDir, { recursive: true });

const urls = [
  ...new Set(
    (await readFile(join("scrape", "assets.txt"), "utf8"))
      .split(/\n+/)
      .map((line) => line.trim())
      .filter(Boolean),
  ),
];

const manifest = {};

const download = (url, destination) =>
  new Promise((resolve, reject) => {
    get(url, (response) => {
      if (response.statusCode && response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
        download(response.headers.location, destination).then(resolve, reject);
        return;
      }
      if (response.statusCode !== 200) {
        reject(new Error(`${response.statusCode} ${url}`));
        response.resume();
        return;
      }
      const file = createWriteStream(destination);
      response.pipe(file);
      file.on("finish", () => file.close(resolve));
      file.on("error", reject);
    }).on("error", reject);
  });

for (const url of urls) {
  const clean = url.split("?")[0];
  const extension = extname(clean) || ".asset";
  const name = basename(clean).replace(/[^a-zA-Z0-9._-]/g, "-");
  const destination = join(assetDir, name);
  try {
    await download(url, destination);
    manifest[url] = `/assets/${name}`;
    console.log(`downloaded ${name}`);
  } catch (error) {
    manifest[url] = url;
    console.warn(`kept remote ${url}: ${error.message}`);
  }
}

await writeFile(join("src", "data", "asset-manifest.json"), `${JSON.stringify(manifest, null, 2)}\n`);

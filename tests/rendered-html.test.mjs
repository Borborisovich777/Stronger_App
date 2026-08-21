import assert from "node:assert/strict";
import { access, readFile, readdir } from "node:fs/promises";
import test from "node:test";

const projectRoot = new URL("../", import.meta.url);

test("builds a static Stronger shell for the GitHub Pages project path", async () => {
  const html = await readFile(new URL("dist/index.html", projectRoot), "utf8");

  assert.match(html, /<title>Stronger (?:—|&#x2014;) Gym Tracker<\/title>/i);
  assert.match(html, /id=["']root["']/i);
  assert.match(html, /Loading your training log/);
  assert.match(html, /Your data stays on this device/);
  assert.match(html, /viewport-fit=cover/);
  assert.match(html, /\/stronger-gym-tracker\/manifest\.webmanifest/);
  assert.match(html, /\/stronger-gym-tracker\/apple-touch-icon\.png/);
  assert.match(html, /\/stronger-gym-tracker\/assets\/[^"']+\.js/);
  assert.doesNotMatch(html, /Your site is taking shape|vinext|codex-preview/i);

  const assets = await readdir(new URL("dist/assets/", projectRoot));
  assert.ok(assets.some((file) => file.endsWith(".js")));
  assert.ok(assets.some((file) => file.endsWith(".css")));
});

test("ships scoped install metadata and an offline shell", async () => {
  const [manifestText, serviceWorker, app, packageText, workflow] = await Promise.all([
    readFile(new URL("dist/manifest.webmanifest", projectRoot), "utf8"),
    readFile(new URL("dist/sw.js", projectRoot), "utf8"),
    readFile(new URL("app/StrongerApp.tsx", projectRoot), "utf8"),
    readFile(new URL("package.json", projectRoot), "utf8"),
    readFile(new URL(".github/workflows/deploy-pages.yml", projectRoot), "utf8"),
  ]);

  const manifest = JSON.parse(manifestText);
  assert.equal(manifest.id, "./");
  assert.equal(manifest.name, "Stronger — Gym Tracker");
  assert.equal(manifest.short_name, "Stronger");
  assert.equal(manifest.start_url, "./");
  assert.equal(manifest.scope, "./");
  assert.equal(manifest.display, "standalone");
  assert.equal(manifest.orientation, "portrait-primary");
  assert.equal(manifest.background_color, "#f3f2ed");
  assert.equal(manifest.theme_color, "#f3f2ed");

  for (const [src, sizes] of [["icon-192.png", "192x192"], ["icon-512.png", "512x512"]]) {
    const icon = manifest.icons.find((candidate) => candidate.src === src && candidate.purpose.includes("any"));
    assert.ok(icon, `manifest is missing ${src}`);
    assert.equal(icon.sizes, sizes);
    assert.equal(icon.type, "image/png");
    await access(new URL(`dist/${src}`, projectRoot));
  }
  assert.ok(manifest.icons.some((icon) => icon.src === "icon-512.png" && icon.purpose === "maskable"));
  await access(new URL("dist/apple-touch-icon.png", projectRoot));
  await access(new URL("dist/og.png", projectRoot));

  assert.match(app, /import\.meta\.env\.PROD/);
  assert.match(app, /import\.meta\.env\.BASE_URL/);
  assert.match(app, /register\(`\$\{appBase\}sw\.js`/);

  assert.match(serviceWorker, /self\.registration\.scope/);
  assert.match(serviceWorker, /APP_PATH/);
  assert.match(serviceWorker, /addEventListener\(["']install["']/);
  assert.match(serviceWorker, /addEventListener\(["']activate["']/);
  assert.match(serviceWorker, /addEventListener\(["']fetch["']/);
  assert.match(serviceWorker, /CACHE_URLS/);
  assert.match(serviceWorker, /request\.method\s*!==\s*["']GET["']/);
  assert.doesNotMatch(serviceWorker, /skipWaiting|clients\.claim|\/_next\/static/);

  assert.match(workflow, /actions\/deploy-pages@v4/);
  assert.match(workflow, /pages:\s*write/);
  assert.match(workflow, /path:\s*dist/);

  const packageJson = JSON.parse(packageText);
  assert.equal(packageJson.name, "stronger-gym-tracker");
  assert.equal(packageJson.scripts.dev, "vite");
  assert.equal(packageJson.devDependencies.vinext, undefined);
  assert.equal(packageJson.devDependencies.wrangler, undefined);
});

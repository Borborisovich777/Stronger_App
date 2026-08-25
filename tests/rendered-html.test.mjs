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
  assert.match(html, /\/Stronger_App\/manifest\.webmanifest/);
  assert.match(html, /\/Stronger_App\/apple-touch-icon\.png/);
  assert.match(html, /\/Stronger_App\/assets\/[^"']+\.js/);
  assert.match(html, /stronger-theme/);
  assert.doesNotMatch(html, /Your site is taking shape|vinext|codex-preview/i);

  const assets = await readdir(new URL("dist/assets/", projectRoot));
  assert.ok(assets.some((file) => file.endsWith(".js")));
  assert.ok(assets.some((file) => file.endsWith(".css")));
});

test("ships scoped install metadata and an offline shell", async () => {
  const [manifestText, serviceWorker, app, storage, styles, packageText, workflow] = await Promise.all([
    readFile(new URL("dist/manifest.webmanifest", projectRoot), "utf8"),
    readFile(new URL("dist/sw.js", projectRoot), "utf8"),
    readFile(new URL("app/StrongerApp.tsx", projectRoot), "utf8"),
    readFile(new URL("app/storage.ts", projectRoot), "utf8"),
    readFile(new URL("app/globals.css", projectRoot), "utf8"),
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
  assert.equal(manifest.background_color, "#f3f1e9");
  assert.equal(manifest.theme_color, "#f3f1e9");

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
  assert.match(app, /role="switch"/);
  assert.match(app, /aria-checked=\{theme === "dark"\}/);
  assert.match(app, /THEME_STORAGE_KEY = "stronger-theme"/);
  assert.match(app, /REST_DURATION_OPTIONS = \[0, 30, 45, 60, 90, 120, 150, 180, 240, 300\]/);
  assert.match(app, /function NumericInput/);
  assert.match(app, /type="text"[\s\S]*inputMode=\{decimal \? "decimal" : "numeric"\}/);
  assert.match(app, /exercise\.restSeconds > 0/);
  assert.match(app, /exercise\.restSeconds === 0 \? "Rest timer off"/);
  assert.match(app, /window\.scrollTo\(\{ top: 0, left: 0, behavior: "auto" \}\)/);

  assert.match(storage, /Math\.round\(value \* 100\) \/ 100/);
  assert.match(storage, /if \(!Number\.isFinite\(value\)\) return 0/);

  assert.match(styles, /--font-sans:/);
  assert.doesNotMatch(styles, /--font-geist-sans/);
  assert.match(styles, /:root\[data-theme="dark"\]/);
  assert.match(styles, /\.topbar\s*\{[^}]*position:\s*fixed;/s);
  assert.match(styles, /\.bottom-nav\s*\{[^}]*position:\s*fixed;/s);
  assert.match(styles, /\.bottom-nav\s*\{[^}]*padding:\s*7px 8px max\(7px, env\(safe-area-inset-bottom\)\);/s);
  assert.match(styles, /\.toast\s*\{[^}]*bottom:\s*calc\(84px \+ env\(safe-area-inset-bottom\)\);/s);
  assert.doesNotMatch(styles, /\.toast\s*\{[^}]*top:/s);
  assert.match(styles, /scroll-padding-top:\s*calc\(82px \+ env\(safe-area-inset-top\)\)/);

  assert.match(serviceWorker, /self\.registration\.scope/);
  assert.match(serviceWorker, /v4-inputs-rest/);
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

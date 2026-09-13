import assert from "node:assert/strict";
import { access, readFile, readdir } from "node:fs/promises";
import test from "node:test";
import { runInNewContext } from "node:vm";
import { createHash } from "node:crypto";
import ts from "typescript";

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
  assert.match(app, /Rest after each set/);
  assert.match(app, /window\.scrollTo\(\{ top: 0, left: 0, behavior: "auto" \}\)/);
  assert.match(app, /function ExercisePicker/);
  assert.match(app, /\+ Create custom exercise/);
  assert.match(app, /exerciseKey: draft\.exerciseKey/);
  assert.match(app, /normalizeStrongerData\(wrapped\)/);

  assert.match(storage, /Math\.round\(value \* 100\) \/ 100/);
  assert.match(storage, /if \(!Number\.isFinite\(value\)\) return 0/);
  assert.match(storage, /customExercises: CustomExercise\[\]/);
  assert.match(storage, /export function normalizeStrongerData/);

  const { BUILT_IN_EXERCISES: catalogEntries } = await loadCatalogModule("app/exercises.ts");
  assert.equal(catalogEntries.length, 257);
  assert.equal(new Set(catalogEntries.map((entry) => entry.exerciseKey)).size, catalogEntries.length);
  for (const starterKey of ["bench-press", "deadlift", "back-squat", "leg-curl", "standing-calf-raise"]) {
    assert.ok(catalogEntries.some((entry) => entry.exerciseKey === starterKey), `catalog is missing ${starterKey}`);
  }

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
  assert.match(serviceWorker, /v8-strong-catalog/);
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

async function loadCatalogModule(path) {
  const source = await readFile(new URL(path, projectRoot), "utf8");
  const { outputText } = ts.transpileModule(source, {
    compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext },
  });
  return import(`data:text/javascript;base64,${Buffer.from(outputText).toString("base64")}`);
}

test("covers every published Strong exercise and preserves all original workout keys", async () => {
  const { BUILT_IN_EXERCISES } = await loadCatalogModule("app/exercises.ts");
  const coverage = JSON.parse(await readFile(new URL("dist/exercises/strong-catalog.json", projectRoot), "utf8"));
  const catalog = new Map(BUILT_IN_EXERCISES.map((exercise) => [exercise.exerciseKey, exercise]));
  assert.equal(coverage.sourceCount, 253);
  assert.equal(coverage.localCount, BUILT_IN_EXERCISES.length);
  assert.equal(coverage.coverage.length, coverage.sourceCount);
  assert.equal(new Set(coverage.coverage.map((entry) => entry.strongId)).size, 253);
  assert.equal(new Set(coverage.coverage.map((entry) => entry.exerciseKey)).size, 253);
  for (const entry of coverage.coverage) {
    const exercise = catalog.get(entry.exerciseKey);
    assert.ok(exercise, `missing Strong exercise: ${entry.strongName}`);
    assert.equal(exercise.strongId, entry.strongId);
    assert.ok(exercise.name === entry.strongName || exercise.aliases.includes(entry.strongName));
  }
  assert.equal(coverage.preservedOriginalKeys.length, 50);
  for (const key of coverage.preservedOriginalKeys) assert.ok(catalog.has(key), `lost original key: ${key}`);
  for (const key of ["good-morning-barbell", "barbell-row", "t-bar-row", "pendlay-row-barbell", "upright-row-barbell"]) {
    assert.ok(catalog.has(key), `missing requested row or hinge variation: ${key}`);
  }
});

test("packages two illustrated positions and complete guidance for every built-in exercise", async () => {
  const [{ BUILT_IN_EXERCISES }, { EXERCISE_MEDIA }] = await Promise.all([
    loadCatalogModule("app/exercises.ts"),
    loadCatalogModule("app/exercise-media.ts"),
  ]);

  assert.equal(BUILT_IN_EXERCISES.length, 257);
  assert.deepEqual(
    Object.keys(EXERCISE_MEDIA).sort(),
    BUILT_IN_EXERCISES.map((exercise) => exercise.exerciseKey).sort(),
    "every built-in exercise must have its own media entry",
  );

  const imagePaths = new Set();
  for (const { exerciseKey } of BUILT_IN_EXERCISES) {
    const media = EXERCISE_MEDIA[exerciseKey];
    assert.equal(media.images.length, media.layout === "paired" ? 1 : 2, `${exerciseKey} needs both demonstration positions`);
    for (const [index, imagePath] of media.images.entries()) {
      assert.equal(imagePath, `exercises/${exerciseKey}-${media.layout === "paired" ? "pair" : index}.jpg`);
      assert.ok(!imagePaths.has(imagePath), `${imagePath} must be assigned to one exercise`);
      imagePaths.add(imagePath);
      const image = await readFile(new URL(`dist/${imagePath}`, projectRoot));
      assert.ok(image.length > 1000, `${imagePath} must contain an image, not an empty placeholder`);
      assert.equal(image.readUInt16BE(0), 0xffd8, `${imagePath} must be a JPEG`);
      assert.equal(image.readUInt16BE(image.length - 2), 0xffd9, `${imagePath} must be a complete JPEG`);
    }
    assert.ok(typeof media.equipment === "string" && media.equipment.trim(), `${exerciseKey} needs equipment`);
    for (const field of ["muscles", "instructions"]) {
      assert.ok(Array.isArray(media[field]) && media[field].length > 0, `${exerciseKey} needs ${field}`);
      assert.ok(media[field].every((text) => typeof text === "string" && text.trim()), `${exerciseKey} has empty ${field}`);
    }
    assert.ok(media.sourceName.trim(), `${exerciseKey} needs attribution`);
    if (media.sourceUrl) assert.equal(new URL(media.sourceUrl).protocol, "https:");
    else assert.equal(media.sourceName, "Original movement guide");
  }
  assert.equal(imagePaths.size, 307);

  const [license, attribution] = await Promise.all([
    readFile(new URL("dist/exercises/LICENSE.md", projectRoot), "utf8"),
    readFile(new URL("dist/exercises/README.md", projectRoot), "utf8"),
  ]);
  assert.match(license, /public domain/i);
  assert.match(license, /unlicense\.org/i);
  assert.match(attribution, /github\.com\/yuhonas\/free-exercise-db/);
  assert.match(attribution, /OpenAI-generated/);
});

test("ships the complete generated illustration set without stale photograph bytes", async () => {
  const manifest = JSON.parse(await readFile(new URL("dist/exercises/illustrations.json", projectRoot), "utf8"));
  const { EXERCISE_MEDIA, EXERCISE_IMAGE_VERSION } = await loadCatalogModule("app/exercise-media.ts");
  const expectedPaths = Object.values(EXERCISE_MEDIA).flatMap((media) => media.images).sort();
  assert.equal(manifest.generator, "OpenAI image generation");
  assert.equal(manifest.version, EXERCISE_IMAGE_VERSION);
  assert.deepEqual(manifest.images.map((image) => image.path).sort(), expectedPaths);
  for (const image of manifest.images) {
    const bytes = await readFile(new URL(`dist/${image.path}`, projectRoot));
    assert.equal(createHash("sha256").update(bytes).digest("hex"), image.sha256, `${image.path} must match its generated export`);
    if (image.referenceSha256) assert.notEqual(image.sha256, image.referenceSha256, `${image.path} must replace its original photograph`);
    assert.equal(image.width / image.height, image.path.endsWith("-pair.jpg") ? 2 : 1);
  }
});

test("preloads scoped exercise media, retries failures, and serves versioned illustrations offline", async () => {
  const serviceWorker = await readFile(new URL("dist/sw.js", projectRoot), "utf8");
  const scope = "https://example.test/Stronger_App/";
  const handlers = new Map();
  const stores = new Map();
  const fetched = [];
  let offline = false;
  const keyFor = (request) => typeof request === "string" ? request : request.url;
  const caches = {
    async open(name) {
      if (!stores.has(name)) stores.set(name, new Map());
      const store = stores.get(name);
      return {
        async match(request) { return store.get(keyFor(request)); },
        async put(request, response) { store.set(keyFor(request), response); },
      };
    },
    async match(request, options = {}) {
      for (const [name, store] of stores) {
        if (options.cacheName && name !== options.cacheName) continue;
        const response = store.get(keyFor(request));
        if (response) return response;
      }
    },
  };

  runInNewContext(serviceWorker, {
    URL, Request, Response, caches,
    self: {
      registration: { scope },
      location: new URL(scope),
      addEventListener(type, handler) { handlers.set(type, handler); },
    },
    async fetch(request) {
      const url = keyFor(request);
      fetched.push(url);
      if (offline || url.endsWith("missing.jpg")) throw new Error("Network unavailable");
      const response = new Response("bundled photo");
      Object.defineProperty(response, "type", { value: "basic" });
      return response;
    },
  });

  async function preload(urls) {
    let work;
    let result;
    handlers.get("message")({
      data: { type: "CACHE_URLS", urls },
      ports: [{ postMessage(value) { result = value; } }],
      waitUntil(value) { work = value; },
    });
    await work;
    return result;
  }

  const firstPhoto = `${scope}exercises/bench-press-0.jpg`;
  const urls = [
    "exercises/bench-press-0.jpg",
    "exercises/bench-press-0.jpg",
    firstPhoto,
    "exercises/bench-press-1.jpg",
    "exercises/missing.jpg",
    "https://other.test/exercises/photo.jpg",
    "/unrelated/photo.jpg",
    null,
  ];
  const oldCache = await caches.open("stronger-assets-old-version");
  await oldCache.put(firstPhoto, new Response("outdated photo"));

  const initial = await preload(urls);
  assert.equal(initial.type, "CACHE_URLS_RESULT");
  assert.equal(initial.cached, 2);
  assert.equal(initial.failed, 1);
  assert.equal(fetched.length, 3, "only unique same-scope URLs should be fetched");
  assert.ok(fetched.includes(firstPhoto), "an old worker's photo must not suppress the current download");

  offline = true;
  const retry = await preload(urls);
  assert.equal(retry.cached, 2);
  assert.equal(retry.failed, 1);
  assert.equal(fetched.length, 4, "already cached photos should not be downloaded again");

  let offlineResponse;
  handlers.get("fetch")({
    request: new Request(firstPhoto),
    respondWith(value) { offlineResponse = value; },
  });
  const photo = await offlineResponse;
  assert.equal(await photo.text(), "bundled photo");
  assert.equal(fetched.length, 4, "viewing a cached bundled photo should not require a network request");

  // Updating artwork must bypass an older photograph even when the basename is unchanged.
  offline = false;
  const { EXERCISE_IMAGE_VERSION } = await loadCatalogModule("app/exercise-media.ts");
  const illustratedUrl = `${firstPhoto}?v=${EXERCISE_IMAGE_VERSION}`;
  const updated = await preload([illustratedUrl]);
  assert.equal(updated.cached, 1);
  assert.ok(fetched.includes(illustratedUrl));
  offline = true;
  handlers.get("fetch")({
    request: new Request(illustratedUrl),
    respondWith(value) { offlineResponse = value; },
  });
  assert.equal(await (await offlineResponse).text(), "bundled photo");
  assert.equal(fetched.length, 5, "versioned illustrations should also work offline after their first download");
});

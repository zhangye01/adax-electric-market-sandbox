import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, resolve } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../..");

function writeFixtureFile(root, path, content = "") {
  const absolutePath = resolve(root, path);
  mkdirSync(dirname(absolutePath), { recursive: true });
  writeFileSync(absolutePath, content);
}

function initGitRepo(path) {
  mkdirSync(path, { recursive: true });
  const result = spawnSync("git", ["init"], {
    cwd: path,
    encoding: "utf8"
  });

  assert.equal(result.status, 0, result.stderr);
}

function writeMinimalSourceFiles(fixtureRoot) {
  writeFixtureFile(fixtureRoot, "package.json", JSON.stringify({ scripts: { quality: "echo quality" } }));
  writeFixtureFile(fixtureRoot, "dist/index.html", "<!doctype html><div id=\"root\"></div>\n");
  writeFixtureFile(fixtureRoot, "dist/assets/index-current.js", "console.log('current');\n");
  writeFixtureFile(fixtureRoot, "dist/assets/index-current.css", "body{color:#111;}\n");
}

function writeReleaseFiles(releaseDir, files) {
  for (const [path, content] of Object.entries(files)) {
    writeFixtureFile(releaseDir, path, content);
  }
}

function runPublishFixture(args = [], setup) {
  const fixtureRoot = mkdtempSync(resolve(tmpdir(), "adax-publish-pages-"));

  try {
    setup?.({
      fixtureRoot,
      releaseDir: resolve(fixtureRoot, "release")
    });

    return spawnSync(process.execPath, [resolve(repoRoot, "scripts/publish-pages.mjs"), ...args], {
      cwd: fixtureRoot,
      encoding: "utf8",
      env: {
        ...process.env,
        ADAX_STATIC_RELEASE_DIR: resolve(fixtureRoot, "release")
      }
    });
  } finally {
    rmSync(fixtureRoot, { recursive: true, force: true });
  }
}

test("publish pages rejects real publishing when quality is skipped", () => {
  const result = runPublishFixture(["--yes", "--skip-quality"]);

  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /skip quality is only allowed during dry-run checks/);
  assert.doesNotMatch(result.stdout, /npm run quality/);
});

test("publish pages dry-run reports when release directory matches current dist", () => {
  const result = runPublishFixture(["--dry-run", "--allow-dirty", "--skip-quality"], ({ fixtureRoot, releaseDir }) => {
    initGitRepo(fixtureRoot);
    initGitRepo(releaseDir);
    writeMinimalSourceFiles(fixtureRoot);
    writeReleaseFiles(releaseDir, {
      "index.html": "<!doctype html><div id=\"root\"></div>\n",
      "404.html": "<!doctype html><div id=\"root\"></div>\n",
      ".nojekyll": "",
      "assets/index-current.js": "console.log('current');\n",
      "assets/index-current.css": "body{color:#111;}\n"
    });
  });

  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /release directory already matches current dist/);
  assert.doesNotMatch(result.stdout, /release directory has no changes/);
});

test("publish pages dry-run reports when release directory differs from current dist", () => {
  const result = runPublishFixture(["--dry-run", "--allow-dirty", "--skip-quality"], ({ fixtureRoot, releaseDir }) => {
    initGitRepo(fixtureRoot);
    initGitRepo(releaseDir);
    writeMinimalSourceFiles(fixtureRoot);
    writeReleaseFiles(releaseDir, {
      "index.html": "<!doctype html><div id=\"old\"></div>\n",
      "404.html": "<!doctype html><div id=\"old\"></div>\n",
      ".nojekyll": "",
      "assets/index-old.js": "console.log('old');\n",
      "assets/index-old.css": "body{color:#999;}\n"
    });
  });

  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /release directory differs from current dist/);
  assert.match(result.stdout, /real publish would update gh-pages/);
  assert.match(result.stdout, /release diff: changed index\.html/);
  assert.match(result.stdout, /release diff: unexpected assets\/index-old\.css/);
  assert.doesNotMatch(result.stdout, /release directory has no changes/);
});

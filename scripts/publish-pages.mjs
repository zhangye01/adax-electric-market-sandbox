import { cpSync, existsSync, mkdirSync, readdirSync, rmSync, statSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { spawnSync } from "node:child_process";

const args = new Set(process.argv.slice(2));
const dryRun = args.has("--dry-run");
const confirmed = args.has("--yes");
const allowDirty = args.has("--allow-dirty");
const skipQuality = args.has("--skip-quality");

const sourceDir = process.cwd();
const releaseDir = resolve(process.env.ADAX_STATIC_RELEASE_DIR || "/Users/zhangye/Codex/adax-static-release");
const distDir = resolve(sourceDir, "dist");
const previewUrl = "https://zhangye01.github.io/adax-electric-market-sandbox/";

const forbiddenReleaseEntries = new Set([
  "src",
  "docs",
  "tests",
  "node_modules",
  "package.json",
  "package-lock.json",
  "tsconfig.json",
  "vite.config.ts",
]);

function log(message = "") {
  console.log(`[publish-pages] ${message}`);
}

function fail(message) {
  console.error(`[publish-pages] ${message}`);
  process.exit(1);
}

function run(command, commandArgs, options = {}) {
  const cwd = options.cwd || sourceDir;
  const label = `${command} ${commandArgs.join(" ")}`;
  const writes = options.writes === true;

  if (dryRun && writes) {
    log(`dry-run: ${label}`);
    return "";
  }

  log(label);
  const result = spawnSync(command, commandArgs, {
    cwd,
    encoding: "utf8",
    stdio: options.capture ? "pipe" : "inherit",
  });

  if (result.status !== 0) {
    const stderr = result.stderr ? `\n${result.stderr.trim()}` : "";
    fail(`command failed: ${label}${stderr}`);
  }

  return result.stdout || "";
}

function runOptional(command, commandArgs, cwd = sourceDir) {
  if (dryRun) {
    log(`dry-run: ${command} ${commandArgs.join(" ")}`);
    return;
  }

  const result = spawnSync(command, commandArgs, {
    cwd,
    encoding: "utf8",
    stdio: "inherit",
  });

  if (result.status !== 0) {
    log(`warning: optional verification failed: ${command} ${commandArgs.join(" ")}`);
  }
}

function ensurePathExists(path, label) {
  if (!existsSync(path)) {
    fail(`${label} does not exist: ${path}`);
  }
}

function ensureGitRepo(path, label) {
  ensurePathExists(resolve(path, ".git"), `${label} .git directory`);
}

function ensureSafeReleaseDirectory() {
  if (releaseDir === sourceDir) {
    fail("release directory must not be the source repository.");
  }
  if (sourceDir.startsWith(`${releaseDir}/`)) {
    fail("release directory must not contain the source repository.");
  }
  if (releaseDir === resolve("/")) {
    fail("release directory must not be the filesystem root.");
  }
}

function gitStatus(path) {
  return run("git", ["status", "--porcelain"], { cwd: path, capture: true }).trim();
}

function ensureCleanSource() {
  const status = gitStatus(sourceDir);
  if (status && !allowDirty) {
    fail("source repository has uncommitted changes. Commit or stash them before publishing, or use --allow-dirty for dry-run checks.");
  }
  if (status) {
    log("source repository is dirty, but --allow-dirty is set.");
  }
}

function cleanReleaseDirectory() {
  for (const entry of readdirSync(releaseDir)) {
    if (entry === ".git") {
      continue;
    }
    rmSync(resolve(releaseDir, entry), { recursive: true, force: true });
  }
}

function copyDistToRelease() {
  cleanReleaseDirectory();
  mkdirSync(releaseDir, { recursive: true });
  cpSync(distDir, releaseDir, { recursive: true });
  writeFileSync(resolve(releaseDir, ".nojekyll"), "");
  cpSync(resolve(releaseDir, "index.html"), resolve(releaseDir, "404.html"));
}

function validateReleaseDirectory() {
  for (const entry of forbiddenReleaseEntries) {
    if (existsSync(resolve(releaseDir, entry))) {
      fail(`release directory contains forbidden source entry: ${entry}`);
    }
  }

  ensurePathExists(resolve(releaseDir, "index.html"), "release index.html");
  ensurePathExists(resolve(releaseDir, "404.html"), "release 404.html");
  ensurePathExists(resolve(releaseDir, ".nojekyll"), "release .nojekyll");

  const assetsPath = resolve(releaseDir, "assets");
  ensurePathExists(assetsPath, "release assets directory");
  if (!statSync(assetsPath).isDirectory()) {
    fail(`release assets path is not a directory: ${assetsPath}`);
  }
}

function commitAndPushRelease() {
  const status = gitStatus(releaseDir);
  if (!status) {
    log("release directory has no changes; skip commit and push.");
    return;
  }

  run("git", ["status", "-sb"], { cwd: releaseDir });
  run("git", ["add", "-A"], { cwd: releaseDir, writes: true });
  run("git", ["commit", "-m", "Publish ADAX static preview"], { cwd: releaseDir, writes: true });
  run("git", ["push", "origin", "HEAD:gh-pages"], { cwd: releaseDir, writes: true });
}

function main() {
  log(`source: ${sourceDir}`);
  log(`release: ${releaseDir}`);

  ensurePathExists(resolve(sourceDir, "package.json"), "source package.json");
  ensureGitRepo(sourceDir, "source repository");
  ensureSafeReleaseDirectory();
  ensureGitRepo(releaseDir, "static release repository");

  if (!dryRun && !confirmed) {
    fail("real publishing requires --yes. Use `npm run publish:pages:dry` first, then `npm run publish:pages -- --yes`.");
  }

  ensureCleanSource();

  if (!skipQuality) {
    run("npm", ["run", "quality"]);
  } else {
    log("skip quality gate because --skip-quality is set.");
  }

  ensurePathExists(distDir, "dist directory");

  if (dryRun) {
    log("dry-run: would clean release directory, copy dist, create .nojekyll, create 404.html, commit, and push gh-pages.");
  } else {
    copyDistToRelease();
  }

  validateReleaseDirectory();
  commitAndPushRelease();
  runOptional("curl", ["-I", previewUrl]);

  log(`preview: ${previewUrl}`);
}

main();

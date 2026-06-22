import { cpSync, existsSync, mkdirSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from "node:fs";
import { relative, resolve, sep } from "node:path";
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

function listRelativeFiles(rootPath) {
  if (!existsSync(rootPath)) return [];

  function collect(directory) {
    return readdirSync(directory).flatMap((entry) => {
      if (entry === ".git") return [];

      const path = resolve(directory, entry);
      const stats = statSync(path);
      if (stats.isDirectory()) return collect(path);
      if (!stats.isFile()) return [];

      return [relative(rootPath, path).split(sep).join("/")];
    });
  }

  return collect(rootPath).sort();
}

function expectedReleaseContent(projectPath) {
  if (projectPath === ".nojekyll") return Buffer.from("");
  if (projectPath === "404.html") return readFileSync(resolve(distDir, "index.html"));
  return readFileSync(resolve(distDir, projectPath));
}

function listDryRunReleaseMismatches() {
  const expectedFiles = new Set([...listRelativeFiles(distDir), ".nojekyll", "404.html"]);
  const releaseFiles = new Set(listRelativeFiles(releaseDir));
  const mismatches = [];

  for (const file of expectedFiles) {
    const releasePath = resolve(releaseDir, file);
    if (!existsSync(releasePath)) {
      mismatches.push(`missing ${file}`);
      continue;
    }

    const releaseContent = readFileSync(releasePath);
    if (!releaseContent.equals(expectedReleaseContent(file))) {
      mismatches.push(`changed ${file}`);
    }
  }

  for (const file of releaseFiles) {
    if (!expectedFiles.has(file)) {
      mismatches.push(`unexpected ${file}`);
    }
  }

  return mismatches.sort();
}

function reportDryRunReleaseDelta() {
  const mismatches = listDryRunReleaseMismatches();
  if (mismatches.length === 0) {
    log("dry-run: release directory already matches current dist; real publish would skip commit and push.");
    return;
  }

  log("dry-run: release directory differs from current dist; real publish would update gh-pages.");
  for (const mismatch of mismatches.slice(0, 5)) {
    log(`dry-run: release diff: ${mismatch}`);
  }
  if (mismatches.length > 5) {
    log(`dry-run: release diff: ${mismatches.length - 5} additional differences omitted.`);
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

  if (skipQuality && !dryRun) {
    fail("skip quality is only allowed during dry-run checks. Real publishing always runs `npm run quality`.");
  }

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
  if (dryRun) {
    reportDryRunReleaseDelta();
  } else {
    commitAndPushRelease();
  }
  runOptional("curl", ["-I", previewUrl]);

  log(`preview: ${previewUrl}`);
}

main();

import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, resolve } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../..");

function runPublishFixture(args = []) {
  const fixtureRoot = mkdtempSync(resolve(tmpdir(), "adax-publish-pages-"));

  try {
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

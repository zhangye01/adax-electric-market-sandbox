import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, resolve } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const boundaryScript = resolve(repoRoot, "scripts/check-boundaries.mjs");

function runBoundaryFixture(files) {
  const fixtureRoot = mkdtempSync(resolve(tmpdir(), "adax-boundary-"));

  try {
    for (const [filePath, content] of Object.entries(files)) {
      const absolutePath = resolve(fixtureRoot, filePath);
      mkdirSync(dirname(absolutePath), { recursive: true });
      writeFileSync(absolutePath, content);
    }

    return spawnSync(process.execPath, [boundaryScript], {
      cwd: fixtureRoot,
      encoding: "utf8"
    });
  } finally {
    rmSync(fixtureRoot, { recursive: true, force: true });
  }
}

test("boundary checker accepts a minimal clean active source tree", () => {
  const result = runBoundaryFixture({
    "src/domain/pure.ts": "export function value() { return 1; }\n",
    "src/components/Clean.tsx": "export function Clean() { return null; }\n"
  });

  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /all boundary checks passed/);
});

test("boundary checker rejects component imports of validation rule modules", () => {
  const result = runBoundaryFixture({
    "src/domain/retailValidation.ts": "export function validateRetailPackage() { return { ok: true, errors: [] }; }\n",
    "src/components/retail/RetailExecutionWorkspace.tsx": "import { validateRetailPackage } from '../../domain/retailValidation';\nexport const value = validateRetailPackage;\n"
  });

  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /new-component-domain-rule-imports-need-review/);
  assert.match(result.stderr, /RetailExecutionWorkspace\.tsx/);
});

test("boundary checker rejects browser APIs inside domain modules", () => {
  const result = runBoundaryFixture({
    "src/domain/badBrowser.ts": "export function read() { return window.localStorage.getItem('x'); }\n"
  });

  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /domain-must-stay-browser-free/);
  assert.match(result.stderr, /local-storage-must-stay-in-storage-util/);
});

test("boundary checker rejects real province names in runtime data", () => {
  const result = runBoundaryFixture({
    "src/data/realProvince.ts": "export const province = '广东';\n"
  });

  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /runtime-data-must-stay-virtual-not-real-province/);
});

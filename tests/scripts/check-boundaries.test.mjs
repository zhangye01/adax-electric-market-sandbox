import assert from "node:assert/strict";
import test from "node:test";
import { runScriptFixture } from "./script-fixtures.mjs";

function runBoundaryFixture(files) {
  return runScriptFixture("scripts/check-boundaries.mjs", files);
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

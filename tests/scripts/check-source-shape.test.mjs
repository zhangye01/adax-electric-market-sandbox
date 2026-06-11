import assert from "node:assert/strict";
import test from "node:test";
import { makeLines, runScriptFixture } from "./script-fixtures.mjs";

function runSourceShapeFixture(files) {
  return runScriptFixture("scripts/check-source-shape.mjs", files);
}

test("source-shape checker accepts small active source files", () => {
  const result = runSourceShapeFixture({
    "src/domain/small.ts": makeLines(20),
    "src/styles/small.css": makeLines(20, ".class { color: black; }")
  });

  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /all source-shape budgets passed/);
});

test("source-shape checker rejects an unbudgeted code file at the watch threshold", () => {
  const result = runSourceShapeFixture({
    "src/components/LargePanel.tsx": makeLines(220)
  });

  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /Source shape check failed/);
  assert.match(result.stderr, /src\/components\/LargePanel\.tsx/);
  assert.match(result.stderr, /crosses watch threshold/);
});

test("source-shape checker rejects budgeted file growth above its reviewed budget", () => {
  const result = runSourceShapeFixture({
    "src/domain/retailTypes.ts": makeLines(258)
  });

  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /src\/domain\/retailTypes\.ts/);
  assert.match(result.stderr, /exceeds source-shape budget 257/);
});

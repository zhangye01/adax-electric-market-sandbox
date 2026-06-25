import assert from "node:assert/strict";
import test from "node:test";

import {
  pathForPage,
  routeFromLocation,
  shouldReplaceMergedProductPath,
  shouldReplaceMissingRetailParticipant
} from "../../.test-build/src/routes/adaxRoutes.js";

test("route helpers preserve active retail flow URLs", () => {
  assert.deepEqual(routeFromLocation({ pathname: "/workspace", search: "?mode=review&participant=retailer" }), {
    page: "strategy",
    mode: "review",
    role: "retailer"
  });
  assert.equal(pathForPage("scenario", "execution"), "/scenarios?mode=execution");
  assert.equal(pathForPage("about", null), "/about");
  assert.equal(pathForPage("review", "execution", "retailer"), "/report?mode=execution&scenario=SCN-A-STD-001&participant=retailer");
  assert.equal(pathForPage("strategy", "review", "thermal"), "/workspace?mode=review&scenario=SCN-A-STD-001&participant=retailer");
  assert.equal(pathForPage("settlement", "execution", "storage"), "/result?mode=execution&scenario=SCN-A-STD-001&participant=retailer");
  assert.deepEqual(routeFromLocation({ pathname: "/about", search: "" }), {
    page: "about",
    mode: null
  });
  assert.deepEqual(routeFromLocation({ pathname: "/guide", search: "" }), {
    page: "about",
    mode: null
  });
  assert.deepEqual(routeFromLocation({ pathname: "/result", search: "?mode=review&participant=retailer" }), {
    page: "settlement",
    mode: "execution",
    role: "retailer"
  });
});

test("route sync decisions normalize merged pages and active participant URLs", () => {
  assert.equal(shouldReplaceMergedProductPath("/about"), false);
  assert.equal(shouldReplaceMergedProductPath("/guide"), true);
  assert.equal(shouldReplaceMergedProductPath("/records"), false);

  assert.equal(shouldReplaceMissingRetailParticipant("scenario", "execution", null), false);
  assert.equal(shouldReplaceMissingRetailParticipant("role", null, null), false);
  assert.equal(shouldReplaceMissingRetailParticipant("role", "execution", null), true);
  assert.equal(shouldReplaceMissingRetailParticipant("strategy", "review", "thermal"), true);
  assert.equal(shouldReplaceMissingRetailParticipant("strategy", "review", "retailer"), false);
});

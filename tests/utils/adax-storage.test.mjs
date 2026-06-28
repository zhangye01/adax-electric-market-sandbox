import assert from "node:assert/strict";
import test from "node:test";

import {
  getAdaxUserMaterials,
  getAdaxTrainingRecords,
  saveAdaxTrainingRecord,
  saveAdaxUserMaterials
} from "../../.test-build/src/utils/adaxStorage.js";
import { getAdaxRecordRevisitTarget } from "../../.test-build/src/domain/adaxRecords.js";
import { upsertUserMaterial } from "../../.test-build/src/services/adaxUserMaterials.js";
import { withFakeWindow } from "../support/browser-fixtures.mjs";
import { basicReviewMaterial, basicTrainingRecord } from "../support/retail-fixtures.mjs";

test("training record storage filters invalid data and keeps latest twenty records", () => {
  withFakeWindow(({ store }) => {
    assert.deepEqual(getAdaxTrainingRecords(), []);

    store.set("adax-training-records-v0-1", "{bad json");
    assert.deepEqual(getAdaxTrainingRecords(), []);

    store.set("adax-training-records-v0-1", JSON.stringify({ id: "not-array" }));
    assert.deepEqual(getAdaxTrainingRecords(), []);

    const valid = basicTrainingRecord("valid");
    const closedParticipantRecord = { ...valid, id: "closed-role", roleId: "thermal", roleName: "火电机组" };
    store.set(
      "adax-training-records-v0-1",
      JSON.stringify([valid, closedParticipantRecord, { id: "invalid" }, { ...valid, id: "nan", grossMargin: Number.NaN }])
    );
    assert.deepEqual(getAdaxTrainingRecords(), [valid]);

    const ignoredClosedParticipant = saveAdaxTrainingRecord(closedParticipantRecord);
    assert.deepEqual(ignoredClosedParticipant, [valid]);

    for (let index = 0; index < 21; index += 1) {
      saveAdaxTrainingRecord(basicTrainingRecord(`record-${index}`));
    }

    const records = getAdaxTrainingRecords();
    assert.equal(records.length, 20);
    assert.equal(records[0].id, "record-20");
    assert.equal(records[19].id, "record-1");
    assert.equal(records.some((record) => record.id === "record-0"), false);
    assert.equal(getAdaxRecordRevisitTarget(records[0]), null);
  });
});

test("review material storage filters invalid data and blank upserts remove stale slots", () => {
  withFakeWindow(({ store }) => {
    const valid = basicReviewMaterial();
    const closedParticipantMaterial = basicReviewMaterial({ id: "closed-role", participantType: "thermal" });

    store.set("adax-user-materials-v0-1", "{bad json");
    assert.deepEqual(getAdaxUserMaterials(), []);

    store.set("adax-user-materials-v0-1", JSON.stringify({ id: "not-array" }));
    assert.deepEqual(getAdaxUserMaterials(), []);

    store.set(
      "adax-user-materials-v0-1",
      JSON.stringify([
        valid,
        closedParticipantMaterial,
        { id: "invalid" },
        basicReviewMaterial({ id: "bad-role", participantType: "unknown" }),
        basicReviewMaterial({ id: "bad-type", materialType: "链接" })
      ])
    );
    assert.deepEqual(getAdaxUserMaterials(), [valid]);

    const saved = saveAdaxUserMaterials([valid, { id: "invalid" }]);
    assert.deepEqual(saved, [valid]);

    const savedWithClosedParticipant = saveAdaxUserMaterials([valid, closedParticipantMaterial]);
    assert.deepEqual(savedWithClosedParticipant, [valid]);

    const ignoredClosedParticipant = upsertUserMaterial({
      materials: [valid],
      scenarioId: valid.scenarioId,
      participantType: "thermal",
      node: { id: valid.nodeId, title: valid.title },
      materialType: valid.materialType,
      content: "火电材料不应在 Phase 5 关闭时进入 active 材料池。"
    });
    assert.deepEqual(ignoredClosedParticipant, [valid]);

    const removed = upsertUserMaterial({
      materials: [valid],
      scenarioId: valid.scenarioId,
      participantType: valid.participantType,
      node: { id: valid.nodeId, title: valid.title },
      materialType: valid.materialType,
      content: ""
    });
    assert.deepEqual(removed, []);
  });
});

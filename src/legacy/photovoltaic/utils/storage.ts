import type { TrainingRecord } from "../types";

const STORAGE_KEY = "electric-market-training-records";

export function getTrainingRecords(): TrainingRecord[] {
  if (typeof window === "undefined") return [];

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as TrainingRecord[]) : [];
  } catch {
    return [];
  }
}

export function saveTrainingRecord(record: TrainingRecord) {
  const records = getTrainingRecords();
  const nextRecords = [record, ...records.filter((item) => item.id !== record.id)].slice(0, 12);
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextRecords));
  return nextRecords;
}

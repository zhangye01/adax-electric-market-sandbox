import { useEffect, useState } from "react";
import { Badge } from "../components/Badge";
import { CockpitStat } from "../components/adax/CockpitStat";
import { RecordArchiveList } from "../components/records/RecordArchiveList";
import { RecordDetailPanel } from "../components/records/RecordDetailPanel";
import { RecordsEmptyState } from "../components/records/RecordsEmptyState";
import { buildRecordExportJson, buildRecordsExportJson } from "../services/adaxTrainingRecordExports";
import type { AdaxTrainingRecord } from "../types";
import { downloadTextFile } from "../utils/download";

interface RecordsPageProps {
  records: AdaxTrainingRecord[];
  onStart: () => void;
  onClearRecords: () => void;
  onRevisitRecord: (record: AdaxTrainingRecord) => void;
}

export function RecordsPage({ records, onStart, onClearRecords, onRevisitRecord }: RecordsPageProps) {
  const [selectedRecordId, setSelectedRecordId] = useState<string | null>(records[0]?.id ?? null);
  const executionRecords = records.filter((record) => record.mode === "execution");
  const reviewRecords = records.filter((record) => record.mode === "review");
  const materialCount = reviewRecords.reduce((total, record) => total + (record.materialCount ?? 0), 0);
  const latestRecord = records[0];
  const selectedRecord = records.find((record) => record.id === selectedRecordId) ?? null;

  function exportRecord(record: AdaxTrainingRecord) {
    downloadTextFile(`adax_training_record_${record.id}.json`, buildRecordExportJson(record), "application/json;charset=utf-8");
  }

  function exportAllRecords() {
    downloadTextFile("adax_training_records.json", buildRecordsExportJson(records), "application/json;charset=utf-8");
  }

  useEffect(() => {
    if (records.length === 0) {
      setSelectedRecordId(null);
      return;
    }
    if (selectedRecordId !== null && !records.some((record) => record.id === selectedRecordId)) {
      setSelectedRecordId(records[0].id);
    }
  }, [records, selectedRecordId]);

  return (
    <div className="page-shell cockpit-page">
      <section className="cockpit-topbar mb-5">
        <div className="min-w-0">
          <p className="cockpit-kicker">TRAINING RECORDS</p>
          <h1 className="mt-2 text-2xl font-bold tracking-normal text-slate-100">训练记录</h1>
          <div className="execution-workbench-steps" aria-label="训练记录操作路径">
            <span>本地档案</span>
            <span>选择记录</span>
            <span>查看详情</span>
            <span>导出 JSON</span>
          </div>
        </div>
        <div className="cockpit-summary-grid">
          <CockpitStat label="总记录" value={`${records.length} 条`} detail="当前浏览器" />
          <CockpitStat label="执行记录" value={`${executionRecords.length} 条`} detail="策略与结算" tone="good" />
          <CockpitStat label="复盘记录" value={`${reviewRecords.length} 条`} detail={`${materialCount} 条材料`} tone="warn" />
          <CockpitStat label="最近保存" value={latestRecord?.savedAt ?? "暂无"} detail={latestRecord?.roleName ?? "等待训练"} />
        </div>
      </section>

      <section className="records-page-grid">
        <main className="cockpit-panel records-main-panel">
          <div className="cockpit-panel-heading">
            <span>训练档案</span>
            <Badge tone="blue">{records.length} 条</Badge>
          </div>
          <div className="cockpit-section">
            {records.length === 0 ? (
              <RecordsEmptyState onStart={onStart} />
            ) : (
              <RecordArchiveList records={records} selectedRecordId={selectedRecordId} onSelectRecord={setSelectedRecordId} />
            )}
          </div>
        </main>

        <aside className="cockpit-panel records-side-panel">
          <div className="cockpit-panel-heading">
            <span>{selectedRecord ? "记录详情" : "档案操作"}</span>
            <Badge tone={selectedRecord?.mode === "review" ? "orange" : "green"}>
              {selectedRecord ? (selectedRecord.mode === "review" ? "复盘材料" : "执行训练") : "本地"}
            </Badge>
          </div>
          {selectedRecord ? (
            <RecordDetailPanel
              record={selectedRecord}
              onClose={() => setSelectedRecordId(null)}
              onRevisit={() => onRevisitRecord(selectedRecord)}
            />
          ) : null}
          <div className="cockpit-section">
            <p className="cockpit-section-title">新训练</p>
            <button className="cockpit-primary-action" onClick={onStart}>
              开始新训练
            </button>
          </div>
          <div className="cockpit-section">
            <p className="cockpit-section-title">记录管理</p>
            <button className="cockpit-secondary-action" disabled={!selectedRecord} onClick={() => (selectedRecord ? exportRecord(selectedRecord) : undefined)}>
              导出当前记录
            </button>
            <button className="cockpit-secondary-action mt-2" disabled={records.length === 0} onClick={exportAllRecords}>
              导出全部记录
            </button>
            <button className="cockpit-danger-action mt-2" disabled={records.length === 0} onClick={onClearRecords}>
              清空本地训练记录
            </button>
          </div>
          <div className="cockpit-section records-local-boundary">
            当前档案保存在浏览器本地存储，可导出 JSON 留存或迁移。
          </div>
        </aside>
      </section>
    </div>
  );
}

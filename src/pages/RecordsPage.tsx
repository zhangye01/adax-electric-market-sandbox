import { Save } from "lucide-react";
import { useEffect, useState } from "react";
import { Badge } from "../components/Badge";
import { CockpitStat } from "../components/adax/CockpitStat";
import { getAdaxRecordModeLabel, getAdaxRecordRevisitLabel, getAdaxRecordTypeLabel } from "../domain/adaxRecords";
import type { AdaxTrainingRecord } from "../types";
import { formatCurrency, formatNumber } from "../utils/formatters";
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
    downloadTextFile(`adax_training_record_${record.id}.json`, recordExportJson(record), "application/json;charset=utf-8");
  }

  function exportAllRecords() {
    downloadTextFile("adax_training_records.json", recordsExportJson(records), "application/json;charset=utf-8");
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
              <div className="records-empty-state">
                <div className="records-empty-content">
                  <div className="records-empty-icon">
                    <Save size={20} />
                  </div>
                  <strong>暂无训练记录</strong>
                  <p>完成一次执行训练或复盘材料保存后，会在这里形成本地档案。</p>
                  <button className="cockpit-primary-action mt-5 max-w-44" onClick={onStart}>
                    开始第一轮训练
                  </button>
                </div>
              </div>
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

function compactCurrency(value: number) {
  const abs = Math.abs(value);
  if (abs >= 100000000) return `${formatNumber(value / 100000000, 2)}亿`;
  if (abs >= 10000) return `${formatNumber(value / 10000, 1)}万`;
  return formatCurrency(value);
}

function recordExportJson(record: AdaxTrainingRecord) {
  return JSON.stringify(
    {
      exportType: "ADAX_TRAINING_RECORD",
      exportedAt: new Date().toISOString(),
      boundary: "This file is generated by a local training sandbox and does not represent real market settlement.",
      record
    },
    null,
    2
  );
}

function recordsExportJson(records: AdaxTrainingRecord[]) {
  return JSON.stringify(
    {
      exportType: "ADAX_TRAINING_RECORDS",
      exportedAt: new Date().toISOString(),
      count: records.length,
      boundary: "These records are generated by a local training sandbox and do not represent real market settlement.",
      records
    },
    null,
    2
  );
}

function RecordArchiveList({
  records,
  selectedRecordId,
  onSelectRecord
}: {
  records: AdaxTrainingRecord[];
  selectedRecordId: string | null;
  onSelectRecord: (recordId: string) => void;
}) {
  return (
    <div className="records-list">
      {records.map((record) => {
        const reviewMode = record.mode === "review";
        return (
          <article key={record.id} className={`records-card ${record.id === selectedRecordId ? "selected" : ""}`}>
            <header>
              <div>
                <Badge tone={reviewMode ? "orange" : "green"}>{reviewMode ? "复盘模式" : "执行模式"}</Badge>
                <h2>{record.roleName}</h2>
                <p>{record.scenarioName}</p>
              </div>
              <time>{record.savedAt}</time>
            </header>

            <div className="records-card-summary compact" title={record.summary}>
              <span>{reviewMode ? "材料数" : "训练毛利"}</span>
              <strong>{reviewMode ? `${record.materialCount ?? 0} 条材料` : compactCurrency(record.grossMargin)}</strong>
            </div>

            <div className="records-card-grid">
              <div>
                <span>训练主体</span>
                <strong>{record.roleName}</strong>
              </div>
              <div>
                <span>记录类型</span>
                <strong>{getAdaxRecordTypeLabel(record)}</strong>
              </div>
              <div>
                <span>{reviewMode ? "材料数量" : "毛利结果"}</span>
                <strong>{reviewMode ? `${record.materialCount ?? 0} 条` : compactCurrency(record.grossMargin)}</strong>
              </div>
            </div>

            <button className="records-detail-button" onClick={() => onSelectRecord(record.id)}>
              打开记录
            </button>
          </article>
        );
      })}
    </div>
  );
}

function RecordDetailPanel({
  record,
  onClose,
  onRevisit
}: {
  record: AdaxTrainingRecord;
  onClose: () => void;
  onRevisit: () => void;
}) {
  const reviewMode = record.mode === "review";
  const revisitLabel = getAdaxRecordRevisitLabel(record);
  const detailRows = [
    ["训练模式", getAdaxRecordModeLabel(record)],
    ["训练主体", record.roleName],
    ["市场场景", record.scenarioName],
    ["保存时间", record.savedAt],
    ["记录类型", getAdaxRecordTypeLabel(record)]
  ];

  return (
    <>
      <div className="records-detail-hero">
        <Badge tone={reviewMode ? "orange" : "green"}>{reviewMode ? "复盘模式" : "执行模式"}</Badge>
        <strong>{record.roleName}</strong>
        <p>{record.summary}</p>
        <em>{reviewMode ? `${record.materialCount ?? 0} 条复盘材料` : compactCurrency(record.grossMargin)}</em>
      </div>

      <div className="cockpit-section">
        <p className="cockpit-section-title">记录字段</p>
        <div className="records-detail-grid">
          {detailRows.map(([label, value]) => (
            <div key={label} className="records-side-row">
              <span>{label}</span>
              <strong>{value}</strong>
            </div>
          ))}
        </div>
      </div>

      <div className="cockpit-section">
        <p className="cockpit-section-title">{reviewMode ? "材料摘要" : "结果诊断"}</p>
        <div className="space-y-3">
          {(record.diagnostics.length > 0 ? record.diagnostics : [record.summary]).map((item, index) => (
            <div key={`${record.id}-${item}`} className="cockpit-diagnosis">
              <span>{index + 1}</span>
              <p>{item}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="cockpit-section">
        {revisitLabel ? (
          <button className="cockpit-primary-action" onClick={onRevisit}>
            {revisitLabel}
          </button>
        ) : null}
        <button className={`cockpit-secondary-action${revisitLabel ? " mt-2" : ""}`} onClick={onClose}>
          返回档案概览
        </button>
      </div>
    </>
  );
}

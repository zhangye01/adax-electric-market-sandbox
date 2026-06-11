import { Badge } from "../Badge";
import { getAdaxRecordModeLabel, getAdaxRecordRevisitLabel, getAdaxRecordTypeLabel } from "../../domain/adaxRecords";
import type { AdaxTrainingRecord } from "../../types";
import { compactRecordCurrency } from "./recordDisplay";

interface RecordDetailPanelProps {
  record: AdaxTrainingRecord;
  onClose: () => void;
  onRevisit: () => void;
}

export function RecordDetailPanel({ record, onClose, onRevisit }: RecordDetailPanelProps) {
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
        <em>{reviewMode ? `${record.materialCount ?? 0} 条复盘材料` : compactRecordCurrency(record.grossMargin)}</em>
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
            <div key={`${record.id}-${index}`} className="cockpit-diagnosis">
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

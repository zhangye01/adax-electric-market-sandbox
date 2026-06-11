import { Badge } from "../Badge";
import { getAdaxRecordTypeLabel } from "../../domain/adaxRecords";
import type { AdaxTrainingRecord } from "../../types";
import { compactRecordCurrency } from "./recordDisplay";

interface RecordArchiveListProps {
  records: AdaxTrainingRecord[];
  selectedRecordId: string | null;
  onSelectRecord: (recordId: string) => void;
}

export function RecordArchiveList({ records, selectedRecordId, onSelectRecord }: RecordArchiveListProps) {
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
              <strong>{reviewMode ? `${record.materialCount ?? 0} 条材料` : compactRecordCurrency(record.grossMargin)}</strong>
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
                <strong>{reviewMode ? `${record.materialCount ?? 0} 条` : compactRecordCurrency(record.grossMargin)}</strong>
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

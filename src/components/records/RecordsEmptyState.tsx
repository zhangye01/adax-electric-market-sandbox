import { Save } from "lucide-react";

interface RecordsEmptyStateProps {
  onStart: () => void;
}

export function RecordsEmptyState({ onStart }: RecordsEmptyStateProps) {
  return (
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
  );
}

import { StatusNotice } from "./StatusNotice";

export function TemplateMessageNotice({ message }: { message: string }) {
  if (!message) return null;
  const failed = message.startsWith("导入失败");

  return (
    <div className="mt-3">
      <StatusNotice tone={failed ? "danger" : "success"} title={failed ? "模板导入失败" : "模板导入成功"}>
        {message}
      </StatusNotice>
    </div>
  );
}

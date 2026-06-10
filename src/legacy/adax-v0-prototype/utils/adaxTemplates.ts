import type { RetailerStrategy, ThermalOfferSegment, ThermalStrategy } from "../types";

export type TemplateKind = "retailer-contract" | "thermal-offer";

export interface TemplateParseResult<T> {
  ok: boolean;
  data?: T;
  errors: string[];
}

export function retailerTemplateJson(strategy: RetailerStrategy) {
  return JSON.stringify(
    {
      template: "ADAX_RETAILER_CONTRACT_V0_1",
      customerMix: strategy.customerMix,
      packageId: strategy.packageId,
      contractEnergyMwh: strategy.contractEnergyMwh,
      contractPrice: strategy.contractPrice
    },
    null,
    2
  );
}

export function thermalTemplateJson(strategy: ThermalStrategy) {
  return JSON.stringify(
    {
      template: "ADAX_THERMAL_OFFER_V0_1",
      contractEnergyMwh: strategy.contractEnergyMwh,
      contractPrice: strategy.contractPrice,
      strategyTag: strategy.strategyTag,
      offerSegments: strategy.offerSegments
    },
    null,
    2
  );
}

export function retailerTemplateCsv(strategy: RetailerStrategy) {
  const rows = [
    ["field", "value"],
    ["industrialStable", String(strategy.customerMix.industrialStable)],
    ["commercialPeak", String(strategy.customerMix.commercialPeak)],
    ["volatileLoad", String(strategy.customerMix.volatileLoad)],
    ["packageId", strategy.packageId],
    ["contractEnergyMwh", String(strategy.contractEnergyMwh)],
    ["contractPrice", String(strategy.contractPrice)]
  ];
  return rows.map((row) => row.join(",")).join("\n");
}

export function thermalTemplateCsv(strategy: ThermalStrategy) {
  const rows = [
    ["segment_id", "load_rate_lower", "load_rate_upper", "offer_price"],
    ...strategy.offerSegments.map((segment) => [
      String(segment.segmentId),
      String(segment.loadRateLower),
      String(segment.loadRateUpper),
      String(segment.offerPrice)
    ])
  ];
  return [
    `contract_energy_mwh,${strategy.contractEnergyMwh}`,
    `contract_price,${strategy.contractPrice}`,
    `strategy_tag,${strategy.strategyTag}`,
    "",
    ...rows.map((row) => row.join(","))
  ].join("\n");
}

export function parseRetailerTemplate(text: string): TemplateParseResult<RetailerStrategy> {
  const trimmed = text.trim();
  if (!trimmed) return { ok: false, errors: ["模板文件为空。"] };

  if (trimmed.startsWith("{")) {
    try {
      const parsed = JSON.parse(trimmed) as RetailerStrategy & { customerMix?: RetailerStrategy["customerMix"] };
      return normalizeRetailerStrategy(parsed);
    } catch {
      return { ok: false, errors: ["JSON 模板解析失败。"] };
    }
  }

  const rows = trimmed
    .split(/\r?\n/)
    .map((line) => line.split(",").map((cell) => cell.trim()))
    .filter((row) => row.length >= 2 && row[0] !== "field");
  const record = Object.fromEntries(rows.map((row) => [row[0], row[1]]));
  return normalizeRetailerStrategy({
    customerMix: {
      industrialStable: Number(record.industrialStable),
      commercialPeak: Number(record.commercialPeak),
      volatileLoad: Number(record.volatileLoad)
    },
    packageId: record.packageId as RetailerStrategy["packageId"],
    contractEnergyMwh: Number(record.contractEnergyMwh),
    contractPrice: Number(record.contractPrice)
  });
}

export function parseThermalTemplate(text: string): TemplateParseResult<ThermalStrategy> {
  const trimmed = text.trim();
  if (!trimmed) return { ok: false, errors: ["模板文件为空。"] };

  if (trimmed.startsWith("{")) {
    try {
      const parsed = JSON.parse(trimmed) as ThermalStrategy;
      return normalizeThermalStrategy(parsed);
    } catch {
      return { ok: false, errors: ["JSON 模板解析失败。"] };
    }
  }

  const lines = trimmed.split(/\r?\n/).map((line) => line.trim());
  const contractEnergyLine = lines.find((line) => line.startsWith("contract_energy_mwh"));
  const contractPriceLine = lines.find((line) => line.startsWith("contract_price"));
  const strategyTagLine = lines.find((line) => line.startsWith("strategy_tag"));
  const headerIndex = lines.findIndex((line) => line.startsWith("segment_id"));

  if (headerIndex < 0) {
    return { ok: false, errors: ["CSV 模板缺少 segment_id 表头。"] };
  }

  const offerSegments: ThermalOfferSegment[] = lines
    .slice(headerIndex + 1)
    .filter(Boolean)
    .map((line) => {
      const [segmentId, loadRateLower, loadRateUpper, offerPrice] = line.split(",").map((cell) => cell.trim());
      return {
        segmentId: Number(segmentId),
        loadRateLower: Number(loadRateLower),
        loadRateUpper: Number(loadRateUpper),
        offerPrice: Number(offerPrice)
      };
    });

  return normalizeThermalStrategy({
    contractEnergyMwh: Number(contractEnergyLine?.split(",")[1]),
    contractPrice: Number(contractPriceLine?.split(",")[1]),
    strategyTag: (strategyTagLine?.split(",")[1] as ThermalStrategy["strategyTag"]) || "custom",
    offerSegments
  });
}

export function downloadTemplate(filename: string, content: string, type = "text/plain;charset=utf-8") {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

function normalizeRetailerStrategy(input: Partial<RetailerStrategy>): TemplateParseResult<RetailerStrategy> {
  const errors: string[] = [];
  const mix = input.customerMix;

  if (!mix) errors.push("缺少 customerMix。");
  const strategy: RetailerStrategy = {
    customerMix: {
      industrialStable: Number(mix?.industrialStable),
      commercialPeak: Number(mix?.commercialPeak),
      volatileLoad: Number(mix?.volatileLoad)
    },
    packageId: input.packageId as RetailerStrategy["packageId"],
    contractEnergyMwh: Number(input.contractEnergyMwh),
    contractPrice: Number(input.contractPrice)
  };

  if (!["fixed", "tou", "spotLinked"].includes(strategy.packageId)) errors.push("packageId 必须是 fixed、tou 或 spotLinked。");
  Object.entries(strategy.customerMix).forEach(([key, value]) => {
    if (!Number.isFinite(value)) errors.push(`${key} 占比不是有效数字。`);
  });
  if (!Number.isFinite(strategy.contractEnergyMwh)) errors.push("contractEnergyMwh 不是有效数字。");
  if (!Number.isFinite(strategy.contractPrice)) errors.push("contractPrice 不是有效数字。");

  return { ok: errors.length === 0, data: errors.length ? undefined : strategy, errors };
}

function normalizeThermalStrategy(input: Partial<ThermalStrategy>): TemplateParseResult<ThermalStrategy> {
  const errors: string[] = [];
  const offerSegments = input.offerSegments ?? [];
  const strategy: ThermalStrategy = {
    contractEnergyMwh: Number(input.contractEnergyMwh),
    contractPrice: Number(input.contractPrice),
    strategyTag: input.strategyTag ?? "custom",
    offerSegments: offerSegments.map((segment) => ({
      segmentId: Number(segment.segmentId),
      loadRateLower: Number(segment.loadRateLower),
      loadRateUpper: Number(segment.loadRateUpper),
      offerPrice: Number(segment.offerPrice)
    }))
  };

  if (!Number.isFinite(strategy.contractEnergyMwh)) errors.push("contractEnergyMwh 不是有效数字。");
  if (!Number.isFinite(strategy.contractPrice)) errors.push("contractPrice 不是有效数字。");
  if (!Array.isArray(offerSegments)) errors.push("offerSegments 必须是数组。");
  strategy.offerSegments.forEach((segment, index) => {
    if (!Number.isFinite(segment.segmentId)) errors.push(`第 ${index + 1} 行 segmentId 无效。`);
    if (!Number.isFinite(segment.loadRateLower)) errors.push(`第 ${index + 1} 行 loadRateLower 无效。`);
    if (!Number.isFinite(segment.loadRateUpper)) errors.push(`第 ${index + 1} 行 loadRateUpper 无效。`);
    if (!Number.isFinite(segment.offerPrice)) errors.push(`第 ${index + 1} 行 offerPrice 无效。`);
  });

  return { ok: errors.length === 0, data: errors.length ? undefined : strategy, errors };
}

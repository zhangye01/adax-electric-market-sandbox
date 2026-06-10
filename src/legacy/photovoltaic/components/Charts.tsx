import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ComposedChart,
  Legend,
  Line,
  LineChart,
  ReferenceArea,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import type { BenchmarkResult, HourlyMarketData, HourlyResult } from "../types";
import type { MonthlyPoint, SpotInterval, ThermalOfferSegment } from "../../../types";
import { formatCurrency, formatHour, round } from "../utils/calculations";

const blue = "#1957b8";
const teal = "#0d9488";
const orange = "#ea580c";
const red = "#e11d48";
const green = "#059669";
const slate = "#64748b";

const tooltipStyle = {
  border: "1px solid #dfe7f1",
  borderRadius: 8,
  boxShadow: "0 12px 28px rgba(15, 47, 96, 0.1)",
  color: "#172033"
};

const cockpitTooltipStyle = {
  background: "#111b2b",
  border: "1px solid #2d405d",
  borderRadius: 8,
  boxShadow: "0 18px 44px rgba(0, 0, 0, 0.28)",
  color: "#d9e8ff"
};

export function PowerForecastChart({ data }: { data: HourlyMarketData[] }) {
  const chartData = data.map((item) => ({
    hour: item.hour,
    label: formatHour(item.hour),
    forecastPower: item.forecastPower,
    recommendedMin: item.recommendedMin,
    recommendedMax: item.recommendedMax
  }));

  return (
    <ResponsiveContainer width="100%" height={320}>
      <AreaChart data={chartData} margin={{ top: 10, right: 18, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e9eef5" />
        <XAxis dataKey="hour" ticks={[0, 3, 6, 9, 12, 15, 18, 21, 23]} tickFormatter={(v) => `${v}`} />
        <YAxis unit=" MW" width={64} />
        <Tooltip
          contentStyle={tooltipStyle}
          formatter={(value: number, name: string) => [`${value} MW`, chartName(name)]}
          labelFormatter={(label) => `${label}:00`}
        />
        <Legend formatter={(value) => chartName(String(value))} />
        <Area
          type="monotone"
          dataKey="recommendedMax"
          stroke="#99f6e4"
          fill="#ccfbf1"
          fillOpacity={0.5}
          name="recommendedMax"
        />
        <Area
          type="monotone"
          dataKey="recommendedMin"
          stroke="#ffffff"
          fill="#ffffff"
          fillOpacity={1}
          name="recommendedMin"
        />
        <Line type="monotone" dataKey="forecastPower" stroke={blue} strokeWidth={3} strokeLinecap="round" dot={false} />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export function PriceChart({ data }: { data: HourlyMarketData[] }) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data} margin={{ top: 10, right: 18, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e9eef5" />
        <XAxis dataKey="hour" ticks={[0, 3, 6, 9, 12, 15, 18, 21, 23]} tickFormatter={(v) => `${v}`} />
        <YAxis unit=" 元" width={64} />
        <Tooltip
          contentStyle={tooltipStyle}
          formatter={(value: number) => [`${value} 元/MWh`, "日前价格"]}
          labelFormatter={(label) => `${label}:00`}
        />
        <ReferenceArea x1={10} x2={14} fill="#fef3c7" fillOpacity={0.35} />
        <ReferenceArea x1={18} x2={20} fill="#fee2e2" fillOpacity={0.35} />
        <Line type="monotone" dataKey="dayAheadPrice" stroke={orange} strokeWidth={3} strokeLinecap="round" dot={{ r: 2 }} />
      </LineChart>
    </ResponsiveContainer>
  );
}

export function DeclarationChart({
  data,
  declarations
}: {
  data: HourlyMarketData[];
  declarations: number[];
}) {
  const chartData = data.map((item, index) => ({
    hour: item.hour,
    forecastPower: item.forecastPower,
    declaredPower: declarations[index] ?? 0,
    dayAheadPrice: item.dayAheadPrice
  }));

  return (
    <ResponsiveContainer width="100%" height={360}>
      <ComposedChart data={chartData} margin={{ top: 10, right: 18, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e9eef5" />
        <XAxis dataKey="hour" ticks={[0, 3, 6, 9, 12, 15, 18, 21, 23]} tickFormatter={(v) => `${v}`} />
        <YAxis yAxisId="power" unit=" MW" width={64} />
        <YAxis yAxisId="price" orientation="right" unit=" 元" width={64} />
        <Tooltip
          contentStyle={tooltipStyle}
          formatter={(value: number, name: string) => [
            name === "dayAheadPrice" ? `${value} 元/MWh` : `${value} MW`,
            chartName(name)
          ]}
          labelFormatter={(label) => `${label}:00`}
        />
        <Legend formatter={(value) => chartName(String(value))} />
        <Bar yAxisId="price" dataKey="dayAheadPrice" fill="#dbeafe" barSize={16} radius={[3, 3, 0, 0]} />
        <Line yAxisId="power" type="monotone" dataKey="forecastPower" stroke={blue} strokeWidth={3} strokeLinecap="round" dot={false} />
        <Line yAxisId="power" type="monotone" dataKey="declaredPower" stroke={teal} strokeWidth={3} strokeLinecap="round" dot={{ r: 2 }} />
      </ComposedChart>
    </ResponsiveContainer>
  );
}

export function ResultComparisonChart({ data }: { data: HourlyResult[] }) {
  return (
    <ResponsiveContainer width="100%" height={340}>
      <LineChart data={data} margin={{ top: 10, right: 18, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e9eef5" />
        <XAxis dataKey="hour" ticks={[0, 3, 6, 9, 12, 15, 18, 21, 23]} tickFormatter={(v) => `${v}`} />
        <YAxis unit=" MW" width={64} />
        <Tooltip
          contentStyle={tooltipStyle}
          formatter={(value: number, name: string) => [`${value} MW`, chartName(name)]}
          labelFormatter={(label) => `${label}:00`}
        />
        <Legend formatter={(value) => chartName(String(value))} />
        <Line type="monotone" dataKey="forecastPower" stroke={blue} strokeWidth={3} strokeLinecap="round" dot={false} />
        <Line type="monotone" dataKey="declaredPower" stroke={teal} strokeWidth={3} strokeLinecap="round" dot={false} />
        <Line type="monotone" dataKey="actualPower" stroke={green} strokeWidth={3} strokeLinecap="round" dot={false} />
      </LineChart>
    </ResponsiveContainer>
  );
}

export function DeviationChart({ data }: { data: HourlyResult[] }) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data} margin={{ top: 10, right: 18, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e9eef5" />
        <XAxis dataKey="hour" ticks={[0, 3, 6, 9, 12, 15, 18, 21, 23]} tickFormatter={(v) => `${v}`} />
        <YAxis unit=" MW" width={64} />
        <Tooltip
          contentStyle={tooltipStyle}
          formatter={(value: number) => [`${value} MW`, "偏差电量"]}
          labelFormatter={(label) => `${label}:00`}
        />
        <Bar dataKey="deviationPower" radius={[3, 3, 0, 0]}>
          {data.map((entry) => (
            <Cell key={entry.hour} fill={entry.deviationPower >= 0 ? green : red} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

export function RevenueBreakdownChart({ data }: { data: HourlyResult[] }) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <ComposedChart data={data} margin={{ top: 10, right: 18, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e9eef5" />
        <XAxis dataKey="hour" ticks={[0, 3, 6, 9, 12, 15, 18, 21, 23]} tickFormatter={(v) => `${v}`} />
        <YAxis width={72} />
        <Tooltip
          contentStyle={tooltipStyle}
          formatter={(value: number, name: string) => [
            formatCurrency(Number(value)),
            name === "revenue" ? "发电收入" : name === "penalty" ? "偏差费用" : "综合收益"
          ]}
          labelFormatter={(label) => `${label}:00`}
        />
        <Legend
          formatter={(value) =>
            value === "revenue" ? "发电收入" : value === "penalty" ? "偏差费用" : "综合收益"
          }
        />
        <Bar dataKey="revenue" fill="#bfdbfe" radius={[3, 3, 0, 0]} />
        <Bar dataKey="penalty" fill="#fecdd3" radius={[3, 3, 0, 0]} />
        <Line type="monotone" dataKey="profit" stroke={teal} strokeWidth={3} strokeLinecap="round" dot={false} />
      </ComposedChart>
    </ResponsiveContainer>
  );
}

export function ScoreBarChart({ scores }: { scores: Array<{ label: string; value: number }> }) {
  return (
    <div className="space-y-3">
      {scores.map((item) => (
        <div key={item.label}>
          <div className="mb-1 flex items-center justify-between text-sm">
            <span className="font-medium text-slate-700">{item.label}</span>
            <span className="font-semibold text-slate-950">{round(item.value, 0)} 分</span>
          </div>
          <div className="h-2 rounded-full bg-slate-100">
            <div className="h-2 rounded-full bg-brand-700" style={{ width: `${round(item.value, 0)}%` }} />
          </div>
        </div>
      ))}
    </div>
  );
}

export function BenchmarkChart({ data }: { data: BenchmarkResult[] }) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={data} margin={{ top: 10, right: 18, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e9eef5" />
        <XAxis dataKey="name" />
        <YAxis width={80} />
        <Tooltip
          contentStyle={tooltipStyle}
          formatter={(value: number, name: string) => [
            name === "deviationRate" ? `${round(value * 100, 1)}%` : formatCurrency(Number(value)),
            name === "totalProfit" ? "综合收益" : name === "totalPenalty" ? "偏差费用" : "偏差率"
          ]}
        />
        <Legend
          formatter={(value) =>
            value === "totalProfit" ? "综合收益" : value === "totalPenalty" ? "偏差费用" : "偏差率"
          }
        />
        <Bar dataKey="totalProfit" fill={teal} radius={[3, 3, 0, 0]} />
        <Bar dataKey="totalPenalty" fill="#fb7185" radius={[3, 3, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

function chartName(name: string) {
  const names: Record<string, string> = {
    forecastPower: "预测出力",
    actualPower: "实际出力",
    declaredPower: "用户申报",
    recommendedMin: "建议下限",
    recommendedMax: "建议上限",
    dayAheadPrice: "日前价格"
  };
  return names[name] ?? name;
}

export function AdaxPriceLoadChart({ data }: { data: SpotInterval[] }) {
  const chartData = data
    .filter((item) => item.quarter === 0)
    .filter((_, index) => index % 24 === 0)
    .map((item) => ({
      date: item.date.slice(5),
      loadMw: Math.round(item.loadMw),
      renewableMw: Math.round(item.renewableMw),
      price: Math.round(item.defaultSpotPrice)
    }));

  return (
    <ResponsiveContainer width="100%" height={320}>
      <ComposedChart data={chartData} margin={{ top: 10, right: 18, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e9eef5" />
        <XAxis dataKey="date" tick={{ fontSize: 11 }} minTickGap={20} />
        <YAxis yAxisId="mw" unit=" MW" width={72} />
        <YAxis yAxisId="price" orientation="right" unit=" 元" width={66} />
        <Tooltip
          contentStyle={tooltipStyle}
          formatter={(value: number, name: string) => [
            name === "price" ? `${value} 元/MWh` : `${value} MW`,
            name === "loadMw" ? "系统负荷" : name === "renewableMw" ? "新能源出力" : "现货价格"
          ]}
        />
        <Legend
          formatter={(value) =>
            value === "loadMw" ? "系统负荷" : value === "renewableMw" ? "新能源出力" : "现货价格"
          }
        />
        <Bar yAxisId="mw" dataKey="loadMw" fill="#dbeafe" radius={[2, 2, 0, 0]} />
        <Bar yAxisId="mw" dataKey="renewableMw" fill="#ccfbf1" radius={[2, 2, 0, 0]} />
        <Line yAxisId="price" type="monotone" dataKey="price" stroke={orange} strokeWidth={2.5} dot={false} />
      </ComposedChart>
    </ResponsiveContainer>
  );
}

export function MonthlySettlementChart({ data }: { data: MonthlyPoint[] }) {
  const chartData = data.map((item) => ({
    month: item.month,
    revenue: Math.round(item.revenue / 10000),
    cost: Math.round(item.cost / 10000),
    margin: Math.round(item.margin / 10000)
  }));

  return (
    <ResponsiveContainer width="100%" height={320}>
      <ComposedChart data={chartData} margin={{ top: 10, right: 18, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e9eef5" />
        <XAxis dataKey="month" />
        <YAxis unit=" 万元" width={72} />
        <Tooltip
          contentStyle={tooltipStyle}
          formatter={(value: number, name: string) => [
            `${value.toLocaleString("zh-CN")} 万元`,
            name === "revenue" ? "收入" : name === "cost" ? "成本" : "毛利"
          ]}
        />
        <Legend formatter={(value) => (value === "revenue" ? "收入" : value === "cost" ? "成本" : "毛利")} />
        <Bar dataKey="revenue" fill="#bfdbfe" radius={[3, 3, 0, 0]} />
        <Bar dataKey="cost" fill="#fecdd3" radius={[3, 3, 0, 0]} />
        <Line type="monotone" dataKey="margin" stroke={teal} strokeWidth={3} dot={{ r: 2 }} />
      </ComposedChart>
    </ResponsiveContainer>
  );
}

export function ThermalOfferChart({
  data,
  availableCapacityMw
}: {
  data: ThermalOfferSegment[];
  availableCapacityMw: number;
}) {
  const chartData = data.map((item) => ({
    segment: `${item.segmentId}`,
    capacity: Math.round((item.loadRateUpper - item.loadRateLower) * availableCapacityMw),
    price: item.offerPrice
  }));

  return (
    <ResponsiveContainer width="100%" height={280}>
      <ComposedChart data={chartData} margin={{ top: 10, right: 18, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e9eef5" />
        <XAxis dataKey="segment" />
        <YAxis yAxisId="capacity" unit=" MW" width={64} />
        <YAxis yAxisId="price" orientation="right" unit=" 元" width={66} />
        <Tooltip
          contentStyle={tooltipStyle}
          formatter={(value: number, name: string) => [
            name === "price" ? `${value} 元/MWh` : `${value} MW`,
            name === "capacity" ? "段容量" : "报价"
          ]}
          labelFormatter={(label) => `第 ${label} 段`}
        />
        <Legend formatter={(value) => (value === "capacity" ? "按可用容量折算的段容量" : "报价")} />
        <Bar yAxisId="capacity" dataKey="capacity" fill="#dbeafe" radius={[3, 3, 0, 0]} />
        <Line yAxisId="price" type="monotone" dataKey="price" stroke={blue} strokeWidth={3} dot={{ r: 3 }} />
      </ComposedChart>
    </ResponsiveContainer>
  );
}

export function CockpitMarketChart({
  data,
  focusDay = 190,
  benchmarkPrice = 420
}: {
  data: SpotInterval[];
  focusDay?: number;
  benchmarkPrice?: number;
}) {
  const chartData = data
    .filter((item) => item.dayOfYear === focusDay)
    .map((item) => ({
      time: `${String(item.hour).padStart(2, "0")}:${String(item.quarter * 15).padStart(2, "0")}`,
      hour: item.hour + item.quarter / 4,
      loadMw: Math.round(item.loadMw),
      renewableMw: Math.round(item.renewableMw),
      price: Math.round(item.defaultSpotPrice),
      benchmarkPrice
    }));

  return (
    <ResponsiveContainer width="100%" height={430}>
      <ComposedChart data={chartData} margin={{ top: 14, right: 18, left: 2, bottom: 6 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#22334c" vertical={false} />
        <XAxis
          dataKey="hour"
          ticks={[0, 3, 6, 9, 12, 15, 18, 21, 23]}
          tickFormatter={(value) => `${value}:00`}
          stroke="#6f839f"
          tick={{ fill: "#8fa4c2", fontSize: 11 }}
        />
        <YAxis
          yAxisId="mw"
          unit=" MW"
          width={72}
          stroke="#6f839f"
          tick={{ fill: "#8fa4c2", fontSize: 11 }}
        />
        <YAxis
          yAxisId="price"
          orientation="right"
          unit=" 元"
          width={68}
          stroke="#6f839f"
          tick={{ fill: "#8fa4c2", fontSize: 11 }}
        />
        <Tooltip
          contentStyle={cockpitTooltipStyle}
          formatter={(value: number, name: string) => [
            name === "price" || name === "benchmarkPrice" ? `${value} 元/MWh` : `${value} MW`,
            name === "loadMw"
              ? "系统负荷"
              : name === "renewableMw"
                ? "新能源出力"
                : name === "benchmarkPrice"
                  ? "策略基准价"
                  : "现货价格"
          ]}
          labelFormatter={(_, payload) => payload?.[0]?.payload?.time ?? ""}
        />
        <Legend
          wrapperStyle={{ color: "#a8bad4", fontSize: 12 }}
          formatter={(value) =>
            value === "loadMw"
              ? "系统负荷"
              : value === "renewableMw"
                ? "新能源出力"
                : value === "benchmarkPrice"
                  ? "策略基准价"
                  : "现货价格"
          }
        />
        <ReferenceArea x1={18} x2={21} fill="#f59e0b" fillOpacity={0.08} yAxisId="mw" />
        <Area
          yAxisId="mw"
          type="monotone"
          dataKey="loadMw"
          stroke="#38bdf8"
          fill="#0ea5e9"
          fillOpacity={0.16}
          strokeWidth={2}
          dot={false}
        />
        <Area
          yAxisId="mw"
          type="monotone"
          dataKey="renewableMw"
          stroke="#2dd4bf"
          fill="#14b8a6"
          fillOpacity={0.12}
          strokeWidth={2}
          dot={false}
        />
        <Line
          yAxisId="price"
          type="monotone"
          dataKey="benchmarkPrice"
          stroke="#94a3b8"
          strokeDasharray="6 5"
          strokeWidth={1.8}
          dot={false}
        />
        <Line
          yAxisId="price"
          type="monotone"
          dataKey="price"
          stroke="#f59e0b"
          strokeWidth={3}
          dot={false}
          activeDot={{ r: 5, fill: "#f59e0b", stroke: "#0b1220", strokeWidth: 2 }}
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
}

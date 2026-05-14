import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type Point = { name: string; runA: number; runB: number };

type Props = {
  legendA: string;
  legendB: string;
  successA: number | null;
  successB: number | null;
  failedA: number | null;
  failedB: number | null;
  durationSecA: number | null;
  durationSecB: number | null;
};

export default function CompareDashboardChart({
  legendA,
  legendB,
  successA,
  successB,
  failedA,
  failedB,
  durationSecA,
  durationSecB,
}: Props) {
  const data: Point[] = [
    {
      name: "Успех",
      runA: successA ?? 0,
      runB: successB ?? 0,
    },
    {
      name: "Ошибки",
      runA: failedA ?? 0,
      runB: failedB ?? 0,
    },
    {
      name: "Время, с",
      runA: durationSecA ?? 0,
      runB: durationSecB ?? 0,
    },
  ];

  return (
    <div className="compare-chart-wrap">
      <ResponsiveContainer width="100%" height={300}>
        <BarChart
          data={data}
          margin={{ top: 12, right: 20, left: 4, bottom: 8 }}
          barCategoryGap="18%"
        >
          <CartesianGrid strokeDasharray="3 3" stroke="var(--admin-border)" vertical={false} />
          <XAxis dataKey="name" tick={{ fill: "var(--admin-muted)", fontSize: 12 }} axisLine={{ stroke: "var(--admin-border)" }} />
          <YAxis tick={{ fill: "var(--admin-muted)", fontSize: 12 }} axisLine={{ stroke: "var(--admin-border)" }} />
          <Tooltip
            contentStyle={{
              borderRadius: 10,
              border: "1px solid var(--admin-border)",
              fontSize: 13,
            }}
          />
          <Legend wrapperStyle={{ fontSize: 13 }} />
          <Bar dataKey="runA" name={legendA} fill="#2d1b4e" radius={[6, 6, 0, 0]} maxBarSize={48} />
          <Bar dataKey="runB" name={legendB} fill="#7c3aed" radius={[6, 6, 0, 0]} maxBarSize={48} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

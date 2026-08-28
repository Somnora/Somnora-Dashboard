import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { MetricPoint } from '../../domain/types'

export function ReadinessChart({ data }: { data: MetricPoint[] }) {
  return (
    <div className="chart-frame" role="img" aria-label="Seeded HRV over seven days, measured in milliseconds">
      <ResponsiveContainer height="100%" width="100%">
        <LineChart data={data} margin={{ top: 14, right: 12, bottom: 0, left: -18 }}>
          <CartesianGrid stroke="rgba(255,255,255,0.09)" vertical={false} />
          <XAxis
            axisLine={false}
            dataKey="date"
            tick={{ fill: 'rgba(255,255,255,0.58)', fontSize: 10 }}
            tickFormatter={(value: string) => value.slice(5).replace('-', '/')}
            tickLine={false}
          />
          <YAxis
            axisLine={false}
            domain={[30, 60]}
            tick={{ fill: 'rgba(255,255,255,0.58)', fontSize: 10 }}
            tickLine={false}
            unit="ms"
          />
          <Tooltip
            contentStyle={{
              background: 'rgba(13,21,32,0.94)',
              border: '1px solid rgba(255,255,255,0.18)',
              borderRadius: 12,
            }}
            formatter={(value) => [`${value} ms`, 'HRV']}
            labelFormatter={(value) => `Date ${value}`}
          />
          <Line
            activeDot={{ r: 5, fill: '#b8d9e5' }}
            dataKey="hrvMilliseconds"
            dot={{ r: 3, fill: '#b8d9e5' }}
            isAnimationActive={false}
            stroke="#b8d9e5"
            strokeWidth={2.5}
            type="monotone"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

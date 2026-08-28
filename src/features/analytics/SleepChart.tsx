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

export function SleepChart({ data }: { data: MetricPoint[] }) {
  return (
    <div className="chart-frame" role="img" aria-label="Seeded sleep duration over seven days, measured in hours">
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
            domain={[5, 9]}
            tick={{ fill: 'rgba(255,255,255,0.58)', fontSize: 10 }}
            tickLine={false}
            unit="h"
          />
          <Tooltip
            contentStyle={{
              background: 'rgba(13,21,32,0.94)',
              border: '1px solid rgba(255,255,255,0.18)',
              borderRadius: 12,
            }}
            formatter={(value) => [`${value} hours`, 'Sleep']}
            labelFormatter={(value) => `Date ${value}`}
          />
          <Line
            activeDot={{ r: 5, fill: '#efb39f' }}
            dataKey="sleepHours"
            dot={{ r: 3, fill: '#efb39f' }}
            isAnimationActive={false}
            stroke="#efb39f"
            strokeWidth={2.5}
            type="monotone"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

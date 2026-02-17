import { Mic } from 'lucide-react';
import { AreaChart, Area, ResponsiveContainer, Tooltip, YAxis } from 'recharts';
import { WidgetShell } from './WidgetShell';

interface VoiceToneDataPoint {
  t: number;
  val: number;
}

interface VoiceToneWidgetProps {
  data: VoiceToneDataPoint[];
  label: string;
}

export function VoiceToneWidget({ data, label }: VoiceToneWidgetProps) {
  return (
    <WidgetShell title="Voice Tone" icon={Mic} className="col-span-2 min-h-[160px]" index={2}>
      <div className="h-full w-full -ml-2">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="colorToneDark" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
              </linearGradient>
            </defs>
            <YAxis
              domain={[0, 120]}
              ticks={[30, 60, 90, 120]}
              tick={{ fontSize: 9, fill: '#64748b' }}
              axisLine={false}
              tickLine={false}
              width={28}
            />
            <Tooltip
              contentStyle={{
                borderRadius: '10px',
                fontSize: '11px',
                background: '#1e293b',
                border: '1px solid #334155',
                color: '#e2e8f0',
              }}
            />
            <Area
              type="monotone"
              dataKey="val"
              stroke="#f43f5e"
              strokeWidth={2}
              fill="url(#colorToneDark)"
            />
          </AreaChart>
        </ResponsiveContainer>
        <div className="text-center mt-[-4px] pl-6">
          <span className="text-[10px] font-bold text-rose-400 uppercase tracking-wider bg-rose-500/10 px-2.5 py-0.5 rounded-full">
            {label}
          </span>
        </div>
      </div>
    </WidgetShell>
  );
}

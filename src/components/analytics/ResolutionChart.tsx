import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { CheckCircle, Clock, CalendarDays } from 'lucide-react';
import { useState } from 'react';

interface ResolutionChartProps {
  data?: Array<{
    time: string;
    resolved: number;
    pending: number;
  }>;
}

// Mock data for resolution tracking
const mockResolutionData = {
  'last-24h': [
    { time: '00:00', resolved: 5, pending: 12 },
    { time: '04:00', resolved: 8, pending: 15 },
    { time: '08:00', resolved: 15, pending: 20 },
    { time: '12:00', resolved: 25, pending: 18 },
    { time: '16:00', resolved: 30, pending: 22 },
    { time: '20:00', resolved: 28, pending: 25 },
    { time: '24:00', resolved: 35, pending: 20 }
  ],
  'last-week': [
    { time: 'Mon', resolved: 45, pending: 25 },
    { time: 'Tue', resolved: 52, pending: 30 },
    { time: 'Wed', resolved: 48, pending: 35 },
    { time: 'Thu', resolved: 55, pending: 28 },
    { time: 'Fri', resolved: 62, pending: 32 },
    { time: 'Sat', resolved: 38, pending: 20 },
    { time: 'Sun', resolved: 35, pending: 18 }
  ],
  'last-month': [
    { time: 'Week 1', resolved: 280, pending: 150 },
    { time: 'Week 2', resolved: 320, pending: 180 },
    { time: 'Week 3', resolved: 295, pending: 165 },
    { time: 'Week 4', resolved: 340, pending: 190 }
  ]
};

export function ResolutionChart({ data }: ResolutionChartProps) {
  const [selectedPeriod, setSelectedPeriod] = useState<keyof typeof mockResolutionData>('last-24h');
  
  const chartData = data || mockResolutionData[selectedPeriod];
  const totalResolved = chartData.reduce((sum, item) => sum + item.resolved, 0);
  const totalPending = chartData.reduce((sum, item) => sum + item.pending, 0);
  const resolutionRate = totalResolved + totalPending > 0 ? 
    ((totalResolved / (totalResolved + totalPending)) * 100).toFixed(1) : '0';

  return (
    <Card className="bg-card shadow-card hover:shadow-hover transition-smooth">
      <CardHeader className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <CardTitle className="text-lg font-semibold text-foreground flex items-center gap-2">
            <CheckCircle className="h-5 w-5" />
            Resolution Tracking
          </CardTitle>
          <Select value={selectedPeriod} onValueChange={(value) => setSelectedPeriod(value as keyof typeof mockResolutionData)}>
            <SelectTrigger className="w-40">
              <CalendarDays className="h-4 w-4" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="last-24h">Last 24 Hours</SelectItem>
              <SelectItem value="last-week">Last Week</SelectItem>
              <SelectItem value="last-month">Last Month</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={350}>
          <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
            <CartesianGrid 
              strokeDasharray="3 3" 
              stroke="hsl(var(--border))" 
              strokeOpacity={0.3}
            />
            <XAxis 
              dataKey="time" 
              stroke="hsl(var(--muted-foreground))"
              fontSize={11}
              tickLine={{ stroke: 'hsl(var(--border))' }}
              axisLine={{ stroke: 'hsl(var(--border))' }}
              tick={{ fill: 'hsl(var(--muted-foreground))' }}
              label={{ 
                value: selectedPeriod === 'last-24h' ? 'Time (Hours)' : 
                       selectedPeriod === 'last-week' ? 'Days' : 'Weeks', 
                position: 'insideBottom', 
                offset: -10, 
                style: { textAnchor: 'middle', fill: 'hsl(var(--muted-foreground))' } 
              }}
            />
            <YAxis 
              stroke="hsl(var(--muted-foreground))"
              fontSize={11}
              tickLine={{ stroke: 'hsl(var(--border))' }}
              axisLine={{ stroke: 'hsl(var(--border))' }}
              tick={{ fill: 'hsl(var(--muted-foreground))' }}
              label={{ value: 'Number of Emails', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle', fill: 'hsl(var(--muted-foreground))' } }}
            />
            <Tooltip 
              formatter={(value: number, name: string) => [value, name]}
              labelFormatter={(label) => `${selectedPeriod === 'last-24h' ? 'Time' : 'Period'}: ${label}`}
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: 'var(--radius)',
                color: 'hsl(var(--foreground))',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
              }}
            />
            <Legend 
              verticalAlign="top" 
              height={36}
              formatter={(value) => (
                <span style={{ color: 'hsl(var(--foreground))', fontSize: '12px', fontWeight: 500 }}>
                  {value}
                </span>
              )}
            />
            <Line 
              type="monotone" 
              dataKey="resolved" 
              stroke="hsl(var(--chart-1))" 
              strokeWidth={3}
              dot={{ fill: 'hsl(var(--chart-1))', strokeWidth: 2, r: 5 }}
              activeDot={{ r: 7, stroke: 'hsl(var(--chart-1))', strokeWidth: 3, fill: 'hsl(var(--background))' }}
              name="Resolved"
            />
            <Line 
              type="monotone" 
              dataKey="pending" 
              stroke="hsl(var(--chart-2))" 
              strokeWidth={3}
              dot={{ fill: 'hsl(var(--chart-2))', strokeWidth: 2, r: 5 }}
              activeDot={{ r: 7, stroke: 'hsl(var(--chart-2))', strokeWidth: 3, fill: 'hsl(var(--background))' }}
              name="Pending"
            />
          </LineChart>
        </ResponsiveContainer>
        <div className="mt-4 text-center text-sm text-muted-foreground">
          Resolution Rate: {resolutionRate}% | Resolved: {totalResolved} | Pending: {totalPending}
        </div>
      </CardContent>
    </Card>
  );
}
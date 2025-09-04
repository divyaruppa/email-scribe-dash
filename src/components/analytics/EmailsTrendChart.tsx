import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { CalendarDays, TrendingUp } from 'lucide-react';
import { useState } from 'react';

interface EmailsTrendChartProps {
  data: Array<{
    hour: string;
    count: number;
  }>;
}

const sampleEmailsByDate: Record<string, Array<{sender: string, subject: string, time: string}>> = {
  'today': [
    { sender: 'john.doe@example.com', subject: 'Cannot access my account', time: '10:15 AM' },
    { sender: 'sarah.wilson@company.com', subject: 'Great service experience!', time: '09:30 AM' },
    { sender: 'mike.johnson@email.com', subject: 'Order status inquiry', time: '08:45 AM' }
  ],
  'yesterday': [
    { sender: 'customer@feedback.com', subject: 'Product feedback', time: '04:30 PM' },
    { sender: 'support@business.com', subject: 'Follow-up on ticket', time: '02:15 PM' }
  ],
  'last-week': [
    { sender: 'lisa.chen@business.com', subject: 'Partnership opportunity', time: '07:15 AM' },
    { sender: 'team@updates.com', subject: 'Weekly newsletter', time: '06:00 AM' }
  ]
};

export function EmailsTrendChart({ data }: EmailsTrendChartProps) {
  const [selectedPeriod, setSelectedPeriod] = useState('today');
  const [chartType, setChartType] = useState<'line' | 'pie'>('line');

  const pieData = data.map((item, index) => ({
    name: item.hour,
    value: item.count,
    color: `hsl(${(index * 45) % 360}, 70%, 60%)`
  }));

  const totalEmails = data.reduce((sum, item) => sum + item.count, 0);

  return (
    <div className="space-y-6">
      <Card className="bg-card shadow-card hover:shadow-hover transition-smooth">
        <CardHeader className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <CardTitle className="text-lg font-semibold text-foreground flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Email Analytics Dashboard
            </CardTitle>
            <div className="flex flex-wrap gap-2">
              <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                <SelectTrigger className="w-40">
                  <CalendarDays className="h-4 w-4" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="yesterday">Yesterday</SelectItem>
                  <SelectItem value="last-week">Last Week</SelectItem>
                </SelectContent>
              </Select>
              <div className="flex rounded-lg border border-border overflow-hidden">
                <Button
                  variant={chartType === 'line' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setChartType('line')}
                  className="rounded-none border-0"
                >
                  Line Chart
                </Button>
                <Button
                  variant={chartType === 'pie' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setChartType('pie')}
                  className="rounded-none border-0"
                >
                  Pie Chart
                </Button>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={350}>
            {chartType === 'line' ? (
              <LineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                <CartesianGrid 
                  strokeDasharray="3 3" 
                  stroke="hsl(var(--border))" 
                  strokeOpacity={0.3}
                />
                <XAxis 
                  dataKey="hour" 
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={11}
                  tickLine={{ stroke: 'hsl(var(--border))' }}
                  axisLine={{ stroke: 'hsl(var(--border))' }}
                  tick={{ fill: 'hsl(var(--muted-foreground))' }}
                  label={{ value: 'Time (24 Hour Format)', position: 'insideBottom', offset: -10, style: { textAnchor: 'middle', fill: 'hsl(var(--muted-foreground))' } }}
                />
                <YAxis 
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={11}
                  tickLine={{ stroke: 'hsl(var(--border))' }}
                  axisLine={{ stroke: 'hsl(var(--border))' }}
                  tick={{ fill: 'hsl(var(--muted-foreground))' }}
                  label={{ value: 'Email Count', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle', fill: 'hsl(var(--muted-foreground))' } }}
                />
                <Tooltip 
                  formatter={(value: number) => [value, 'Emails']}
                  labelFormatter={(label) => `Time: ${label}`}
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: 'var(--radius)',
                    color: 'hsl(var(--foreground))',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="count" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={3}
                  dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2, r: 5 }}
                  activeDot={{ r: 7, stroke: 'hsl(var(--primary))', strokeWidth: 3, fill: 'hsl(var(--primary-foreground))' }}
                />
              </LineChart>
            ) : (
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                  stroke="hsl(var(--background))"
                  strokeWidth={2}
                  label={({ name, value, percent }) => 
                    percent > 0.05 ? `${name}: ${(percent * 100).toFixed(0)}%` : ''
                  }
                  labelLine={false}
                >
                  {pieData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.color}
                    />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: number) => [`${value} emails`, 'Count']}
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: 'var(--radius)',
                    color: 'hsl(var(--foreground))'
                  }}
                />
                <Legend 
                  verticalAlign="bottom" 
                  height={36}
                  formatter={(value) => (
                    <span style={{ color: 'hsl(var(--foreground))', fontSize: '12px' }}>
                      {value}
                    </span>
                  )}
                />
              </PieChart>
            )}
          </ResponsiveContainer>
          <div className="mt-4 text-center text-sm text-muted-foreground">
            Total emails: {totalEmails} | Selected period: {selectedPeriod.charAt(0).toUpperCase() + selectedPeriod.slice(1)}
          </div>
        </CardContent>
      </Card>

      {/* Sample Email Data Section */}
      <Card className="bg-card shadow-card hover:shadow-hover transition-smooth">
        <CardHeader>
          <CardTitle className="text-md font-medium text-foreground">
            Sample Emails ({selectedPeriod.charAt(0).toUpperCase() + selectedPeriod.slice(1)})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {sampleEmailsByDate[selectedPeriod]?.map((email, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg border border-border hover:bg-muted/50 transition-smooth">
                <div className="flex-1">
                  <div className="font-medium text-sm text-foreground">{email.sender}</div>
                  <div className="text-sm text-muted-foreground truncate">{email.subject}</div>
                </div>
                <div className="text-xs text-muted-foreground">{email.time}</div>
              </div>
            )) ?? (
              <div className="text-center text-muted-foreground py-4">
                No sample emails available for this period
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
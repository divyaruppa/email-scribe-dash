import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { AlertTriangle } from 'lucide-react';

interface PriorityPieChartProps {
  urgentEmails: number;
  totalEmails: number;
}

export function PriorityPieChart({ urgentEmails, totalEmails }: PriorityPieChartProps) {
  const notUrgentEmails = totalEmails - urgentEmails;
  
  const chartData = [
    { 
      name: 'Urgent', 
      value: urgentEmails, 
      percentage: totalEmails > 0 ? ((urgentEmails / totalEmails) * 100).toFixed(1) : '0',
      color: 'hsl(var(--destructive))'
    },
    { 
      name: 'Not Urgent', 
      value: notUrgentEmails, 
      percentage: totalEmails > 0 ? ((notUrgentEmails / totalEmails) * 100).toFixed(1) : '0',
      color: 'hsl(var(--primary))'
    },
  ];

  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percentage }: any) => {
    if (parseFloat(percentage) < 5) return null; // Don't show label if less than 5%
    
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text 
        x={x} 
        y={y} 
        fill="white" 
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central"
        fontSize={12}
        fontWeight="bold"
      >
        {`${percentage}%`}
      </text>
    );
  };

  return (
    <Card className="bg-card shadow-card hover:shadow-hover transition-smooth">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-foreground flex items-center gap-2">
          <AlertTriangle className="h-5 w-5" />
          Priority Distribution
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={renderCustomizedLabel}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
              stroke="hsl(var(--background))"
              strokeWidth={2}
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip 
              formatter={(value: number, name: string, props: any) => [
                `${value} emails (${props.payload.percentage}%)`, 
                name
              ]}
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
              formatter={(value, entry) => (
                <span style={{ color: entry.color, fontWeight: 500 }}>
                  {value}
                </span>
              )}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="mt-4 text-center text-sm text-muted-foreground">
          Total emails: {totalEmails} | Urgent: {urgentEmails} | Not Urgent: {notUrgentEmails}
        </div>
      </CardContent>
    </Card>
  );
}
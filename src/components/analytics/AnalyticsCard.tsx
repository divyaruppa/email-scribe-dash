import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';

interface AnalyticsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  variant?: 'default' | 'positive' | 'negative' | 'neutral' | 'urgent';
}

export function AnalyticsCard({ title, value, icon: Icon, variant = 'default' }: AnalyticsCardProps) {
  const getVariantStyles = () => {
    switch (variant) {
      case 'positive':
        return 'bg-gradient-to-br from-green-50 to-green-100 border-green-200 dark:from-green-900/30 dark:to-green-800/30 dark:border-green-700';
      case 'negative':
        return 'bg-gradient-to-br from-red-50 to-red-100 border-red-200 dark:from-red-900/30 dark:to-red-800/30 dark:border-red-700';
      case 'neutral':
        return 'bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 dark:from-blue-900/30 dark:to-blue-800/30 dark:border-blue-700';
      case 'urgent':
        return 'bg-gradient-urgent border-urgent/30 shadow-lg';
      default:
        return 'bg-gradient-primary border-primary/30 shadow-lg';
    }
  };

  const getIconStyles = () => {
    switch (variant) {
      case 'positive':
        return 'text-green-600 dark:text-green-400';
      case 'negative':
        return 'text-red-600 dark:text-red-400';
      case 'neutral':
        return 'text-blue-600 dark:text-blue-400';
      case 'urgent':
        return 'text-urgent-foreground';
      default:
        return 'text-primary-foreground';
    }
  };

  return (
    <Card className={`hover:shadow-hover hover:scale-105 transition-smooth transform ${getVariantStyles()}`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-card-foreground contrast-more:text-foreground">
          {title}
        </CardTitle>
        <Icon className={`h-5 w-5 ${getIconStyles()}`} />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-card-foreground contrast-more:text-foreground">
          {value}
        </div>
      </CardContent>
    </Card>
  );
}
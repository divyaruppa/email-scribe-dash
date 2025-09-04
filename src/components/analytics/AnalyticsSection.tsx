import { Mail, ThumbsUp, ThumbsDown, Minus, AlertTriangle, Clock } from 'lucide-react';
import { AnalyticsCard } from './AnalyticsCard';
import { SentimentChart } from './SentimentChart';
import { EmailsTrendChart } from './EmailsTrendChart';
import { AnalyticsData } from '@/types/email';

interface AnalyticsSectionProps {
  data: AnalyticsData;
}

export function AnalyticsSection({ data }: AnalyticsSectionProps) {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-foreground">
        Analytics Overview
      </h2>
      
      {/* Analytics Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <AnalyticsCard
          title="Total Emails"
          value={data.totalEmails}
          icon={Mail}
          variant="default"
        />
        <AnalyticsCard
          title="Positive Emails"
          value={data.positiveEmails}
          icon={ThumbsUp}
          variant="positive"
        />
        <AnalyticsCard
          title="Negative Emails"
          value={data.negativeEmails}
          icon={ThumbsDown}
          variant="negative"
        />
        <AnalyticsCard
          title="Neutral Emails"
          value={data.neutralEmails}
          icon={Minus}
          variant="neutral"
        />
        <AnalyticsCard
          title="Urgent Emails"
          value={data.urgentEmails}
          icon={AlertTriangle}
          variant="urgent"
        />
        <AnalyticsCard
          title="Avg Response Time"
          value={data.averageResponseTime}
          icon={Clock}
          variant="default"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SentimentChart data={data.sentimentDistribution} />
        <EmailsTrendChart data={data.last24Hours} />
      </div>
    </div>
  );
}
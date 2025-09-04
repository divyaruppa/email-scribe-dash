export type Priority = 'urgent' | 'not urgent';
export type Sentiment = 'positive' | 'negative' | 'neutral';

export interface Email {
  id: string;
  sender: string;
  subject: string;
  body: string;
  dateTime: string;
  priority: Priority;
  sentiment: Sentiment;
  extractedInfo: {
    phone?: string;
    alternateEmail?: string;
    productOrderId?: string;
  };
  aiReply: string;
  isRead: boolean;
}

export interface AnalyticsData {
  totalEmails: number;
  positiveEmails: number;
  negativeEmails: number;
  neutralEmails: number;
  urgentEmails: number;
  averageResponseTime: string;
  sentimentDistribution: {
    positive: number;
    negative: number;
    neutral: number;
  };
  last24Hours: Array<{
    hour: string;
    count: number;
  }>;
}

export type FilterType = 'all' | Priority | Sentiment;
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Email } from '@/types/email';

interface EmailCardProps {
  email: Email;
  onClick: () => void;
}

export function EmailCard({ email, onClick }: EmailCardProps) {
  const getSentimentBadgeVariant = (sentiment: string) => {
    switch (sentiment) {
      case 'positive':
        return 'default';
      case 'negative':
        return 'destructive';
      case 'neutral':
        return 'secondary';
      default:
        return 'default';
    }
  };

  const getSentimentBadgeClass = (sentiment: string) => {
    switch (sentiment) {
      case 'positive':
        return 'bg-green-500 text-white hover:bg-green-600';
      case 'negative':
        return 'bg-red-500 text-white hover:bg-red-600';
      case 'neutral':
        return 'bg-blue-500 text-white hover:bg-blue-600';
      default:
        return '';
    }
  };

  const getPriorityBadgeClass = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-urgent text-urgent-foreground hover:bg-urgent/90';
      case 'normal':
        return 'bg-secondary text-secondary-foreground hover:bg-secondary/90';
      default:
        return '';
    }
  };

  return (
    <Card 
      className={`cursor-pointer hover:shadow-hover transition-smooth border-border ${
        !email.isRead ? 'bg-primary/5 border-primary/20' : 'bg-card'
      }`}
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground truncate">
              {email.sender}
            </p>
            <h3 className={`text-lg font-semibold mt-1 truncate ${
              !email.isRead ? 'text-foreground' : 'text-muted-foreground'
            }`}>
              {email.subject}
            </h3>
          </div>
          {!email.isRead && (
            <div className="w-2 h-2 bg-primary rounded-full ml-2 mt-1 flex-shrink-0" />
          )}
        </div>
        
        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
          {email.body}
        </p>
        
        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            <Badge className={getPriorityBadgeClass(email.priority)}>
              {email.priority}
            </Badge>
            <Badge className={getSentimentBadgeClass(email.sentiment)}>
              {email.sentiment}
            </Badge>
          </div>
          <span className="text-xs text-muted-foreground">
            {email.dateTime}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
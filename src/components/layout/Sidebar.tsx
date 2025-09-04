import { FilterType, Priority, Sentiment } from '@/types/email';
import { Button } from '@/components/ui/button';

interface SidebarProps {
  sentimentFilter: FilterType;
  priorityFilter: FilterType;
  onSentimentFilterChange: (filter: FilterType) => void;
  onPriorityFilterChange: (filter: FilterType) => void;
}

export function Sidebar({
  sentimentFilter,
  priorityFilter,
  onSentimentFilterChange,
  onPriorityFilterChange,
}: SidebarProps) {
  const sentimentOptions: { value: FilterType; label: string }[] = [
    { value: 'all', label: 'All' },
    { value: 'positive', label: 'Positive' },
    { value: 'neutral', label: 'Neutral' },
    { value: 'negative', label: 'Negative' },
  ];

  const priorityOptions: { value: FilterType; label: string }[] = [
    { value: 'all', label: 'All' },
    { value: 'urgent', label: 'Urgent' },
    { value: 'not urgent', label: 'Not Urgent' },
  ];

  return (
    <aside className="fixed left-0 top-20 h-[calc(100vh-5rem)] w-72 bg-muted border-r border-border p-6 overflow-y-auto">
      <h2 className="text-xl font-semibold text-foreground mb-6">
        Mail Management
      </h2>
      
      <div className="space-y-6">
        {/* Sentiment Filter */}
        <div>
          <h3 className="text-sm font-medium text-foreground mb-3">
            Filter by Sentiment
          </h3>
          <div className="space-y-2">
            {sentimentOptions.map((option) => (
              <Button
                key={option.value}
                variant={sentimentFilter === option.value ? "default" : "ghost"}
                size="sm"
                className={`w-full justify-start transition-smooth ${
                  sentimentFilter === option.value
                    ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                    : 'hover:bg-accent hover:text-accent-foreground'
                }`}
                onClick={() => onSentimentFilterChange(option.value)}
              >
                {option.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Priority Filter */}
        <div>
          <h3 className="text-sm font-medium text-foreground mb-3">
            Filter by Priority
          </h3>
          <div className="space-y-2">
            {priorityOptions.map((option) => (
              <Button
                key={option.value}
                variant={priorityFilter === option.value ? "default" : "ghost"}
                size="sm"
                className={`w-full justify-start transition-smooth ${
                  priorityFilter === option.value
                    ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                    : 'hover:bg-accent hover:text-accent-foreground'
                }`}
                onClick={() => onPriorityFilterChange(option.value)}
              >
                {option.label}
              </Button>
            ))}
          </div>
        </div>
      </div>
    </aside>
  );
}
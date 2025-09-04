import { Email } from '@/types/email';
import { EmailCard } from './EmailCard';

interface EmailListProps {
  emails: Email[];
  onEmailClick: (email: Email) => void;
}

export function EmailList({ emails, onEmailClick }: EmailListProps) {
  if (emails.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground text-lg">
          No emails found matching your filters.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-foreground">
        Recent Emails ({emails.length})
      </h3>
      <div className="space-y-3">
        {emails.map((email) => (
          <EmailCard
            key={email.id}
            email={email}
            onClick={() => onEmailClick(email)}
          />
        ))}
      </div>
    </div>
  );
}
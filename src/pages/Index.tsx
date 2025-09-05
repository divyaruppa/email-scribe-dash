import { useState, useMemo } from 'react';
import { Header } from '@/components/layout/Header';
import { Sidebar } from '@/components/layout/Sidebar';
import { AnalyticsSection } from '@/components/analytics/AnalyticsSection';
import { SearchAndSort } from '@/components/emails/SearchAndSort';
import { EmailList } from '@/components/emails/EmailList';
import { EmailDetailsPanel } from '@/components/emails/EmailDetailsPanel';
import { CsvUpload } from '@/components/csv/CsvUpload';
import { mockEmails, mockAnalytics } from '@/data/mockData';
import { Email, FilterType, AnalyticsData } from '@/types/email';

const Index = () => {
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);
  const [sentimentFilter, setSentimentFilter] = useState<FilterType>('all');
  const [priorityFilter, setPriorityFilter] = useState<FilterType>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [emails, setEmails] = useState<Email[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    totalEmails: 0,
    positiveEmails: 0,
    negativeEmails: 0,
    neutralEmails: 0,
    urgentEmails: 0,
    averageResponseTime: '0 hours',
    sentimentDistribution: { positive: 0, negative: 0, neutral: 0 },
    last24Hours: [],
  });

  // Filter emails based on current filters and search query
  const filteredEmails = useMemo(() => {
    return emails.filter((email) => {
      // Sentiment filter
      if (sentimentFilter !== 'all' && email.sentiment !== sentimentFilter) {
        return false;
      }

      // Priority filter
      if (priorityFilter !== 'all' && email.priority !== priorityFilter) {
        return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        return (
          email.sender.toLowerCase().includes(query) ||
          email.subject.toLowerCase().includes(query) ||
          email.body.toLowerCase().includes(query)
        );
      }

      return true;
    });
  }, [emails, sentimentFilter, priorityFilter, searchQuery]);

  const handleDataLoaded = (data: { emails: Email[]; analytics: AnalyticsData }) => {
    setEmails(data.emails);
    setAnalytics(data.analytics);
  };

  const handleEmailClick = (email: Email) => {
    setSelectedEmail(email);
  };

  const handleCloseEmailDetails = () => {
    setSelectedEmail(null);
  };

  const handleSortClick = () => {
    // TODO: Implement sort functionality
    console.log('Sort clicked');
  };

  const handleFilterClick = () => {
    // TODO: Implement additional filter functionality
    console.log('Filter clicked');
  };

  return (
    <div className="min-h-screen bg-gradient-warm">
      <Header />
      
      <div className="flex">
        <Sidebar
          sentimentFilter={sentimentFilter}
          priorityFilter={priorityFilter}
          onSentimentFilterChange={setSentimentFilter}
          onPriorityFilterChange={setPriorityFilter}
        />
        
        <main className="flex-1 ml-72 mt-20 p-6 min-h-screen">
          <div className="max-w-7xl mx-auto space-y-8">
            {/* CSV Upload Section */}
            <CsvUpload onDataLoaded={handleDataLoaded} />
            
            {/* Analytics Section */}
            <AnalyticsSection data={analytics} />
            
            {/* Search and Sort Section */}
            <SearchAndSort
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              onSortClick={handleSortClick}
              onFilterClick={handleFilterClick}
            />
            
            {/* Email List */}
            <EmailList
              emails={filteredEmails}
              onEmailClick={handleEmailClick}
            />
          </div>
        </main>
      </div>

      {/* Email Details Panel */}
      {selectedEmail && (
        <EmailDetailsPanel
          email={selectedEmail}
          isOpen={!!selectedEmail}
          onClose={handleCloseEmailDetails}
        />
      )}
    </div>
  );
};

export default Index;
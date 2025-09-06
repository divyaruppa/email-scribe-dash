import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { RefreshCw, Database, Mail, Zap } from 'lucide-react';

export function EmailProcessor() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [isPopulating, setIsPopulating] = useState(false);
  const [provider, setProvider] = useState('mock');
  const [credentials, setCredentials] = useState({
    email: '',
    password: '',
    server: ''
  });
  const { toast } = useToast();

  const handlePopulateSampleData = async () => {
    setIsPopulating(true);
    try {
      const { data, error } = await supabase.functions.invoke('populate-sample-data');
      
      if (error) {
        throw new Error(`Error: ${error.message}`);
      }
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to populate sample data');
      }
      
      toast({
        title: "Sample data populated successfully",
        description: `Created ${data.emailsCreated} sample emails with AI responses`,
      });
    } catch (error) {
      toast({
        title: "Error populating sample data",
        description: error instanceof Error ? error.message : "Failed to populate data",
        variant: "destructive",
      });
    } finally {
      setIsPopulating(false);
    }
  };

  const handleFetchAndProcess = async () => {
    setIsProcessing(true);
    try {
      // Step 1: Fetch emails
      toast({
        title: "Fetching emails...",
        description: "Retrieving emails from the provider",
      });

      const { data: fetchData, error: fetchError } = await supabase.functions.invoke('fetch-emails', {
        body: { provider, credentials }
      });
      
      if (fetchError) {
        throw new Error(`Fetch error: ${fetchError.message}`);
      }
      
      if (!fetchData.success) {
        throw new Error(fetchData.error || 'Failed to fetch emails');
      }

      // Step 2: Process emails
      toast({
        title: "Processing emails...",
        description: "Analyzing sentiment, priority, and generating AI responses",
      });

      const { data: processData, error: processError } = await supabase.functions.invoke('process-emails', {
        body: { emails: fetchData.emails }
      });
      
      if (processError) {
        throw new Error(`Process error: ${processError.message}`);
      }
      
      if (!processData.success) {
        throw new Error(processData.error || 'Failed to process emails');
      }

      toast({
        title: "Email processing completed",
        description: `Successfully processed ${processData.processedCount} support emails`,
      });
      
    } catch (error) {
      toast({
        title: "Error in email processing",
        description: error instanceof Error ? error.message : "Failed to process emails",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Quick Setup
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Populate the database with sample support emails to test the system.
            </p>
            <Button 
              onClick={handlePopulateSampleData}
              disabled={isPopulating}
              className="w-full"
            >
              <Database className="h-4 w-4 mr-2" />
              {isPopulating ? 'Populating...' : 'Populate Sample Data'}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Email Retrieval Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="provider">Email Provider</Label>
            <Select value={provider} onValueChange={setProvider}>
              <SelectTrigger>
                <SelectValue placeholder="Select email provider" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="mock">Mock Data (for testing)</SelectItem>
                <SelectItem value="gmail">Gmail</SelectItem>
                <SelectItem value="outlook">Outlook</SelectItem>
                <SelectItem value="imap">IMAP</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {provider !== 'mock' && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={credentials.email}
                  onChange={(e) => setCredentials(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="your-email@example.com"
                />
              </div>

              <div>
                <Label htmlFor="password">Password / App Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={credentials.password}
                  onChange={(e) => setCredentials(prev => ({ ...prev, password: e.target.value }))}
                  placeholder="Your password or app-specific password"
                />
              </div>

              {provider === 'imap' && (
                <div>
                  <Label htmlFor="server">IMAP Server</Label>
                  <Input
                    id="server"
                    value={credentials.server}
                    onChange={(e) => setCredentials(prev => ({ ...prev, server: e.target.value }))}
                    placeholder="imap.example.com"
                  />
                </div>
              )}
            </div>
          )}

          <Button 
            onClick={handleFetchAndProcess} 
            disabled={isProcessing}
            className="w-full"
          >
            <Zap className="h-4 w-4 mr-2" />
            {isProcessing ? 'Processing...' : 'Fetch & Process Emails'}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Processing Pipeline</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
              <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium">1</div>
              <div>
                <h4 className="font-medium">Email Retrieval</h4>
                <p className="text-sm text-muted-foreground">Fetch emails from selected provider using IMAP/API</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
              <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium">2</div>
              <div>
                <h4 className="font-medium">Filtering & Classification</h4>
                <p className="text-sm text-muted-foreground">Filter support emails and analyze sentiment/priority</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
              <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium">3</div>
              <div>
                <h4 className="font-medium">Information Extraction</h4>
                <p className="text-sm text-muted-foreground">Extract contact details, order IDs, and requirements</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
              <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium">4</div>
              <div>
                <h4 className="font-medium">AI Response Generation</h4>
                <p className="text-sm text-muted-foreground">Generate context-aware responses using GPT-4</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
              <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium">5</div>
              <div>
                <h4 className="font-medium">Database Storage</h4>
                <p className="text-sm text-muted-foreground">Store processed emails with analytics in Supabase</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
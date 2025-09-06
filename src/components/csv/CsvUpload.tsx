import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload, FileText, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface CsvUploadProps {
  onDataLoaded: (data: any) => void;
}

export function CsvUpload({ onDataLoaded }: CsvUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isLoadingApi, setIsLoadingApi] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const processCsvData = (csvText: string) => {
    const lines = csvText.trim().split('\n');
    const headers = lines[0].toLowerCase().split(',').map(h => h.trim());
    
    // Expected headers: sender, subject, body, datetime, priority, sentiment
    const emails = lines.slice(1).map((line, index) => {
      const values = line.split(',').map(v => v.trim().replace(/"/g, ''));
      
      return {
        id: `csv-${index + 1}`,
        sender: values[headers.indexOf('sender')] || `sender${index + 1}@example.com`,
        subject: values[headers.indexOf('subject')] || 'No subject',
        body: values[headers.indexOf('body')] || 'No content',
        dateTime: values[headers.indexOf('datetime')] || new Date().toLocaleString(),
        priority: values[headers.indexOf('priority')]?.toLowerCase() === 'urgent' ? 'urgent' : 'not urgent',
        sentiment: ['positive', 'negative', 'neutral'].includes(values[headers.indexOf('sentiment')]?.toLowerCase()) 
          ? values[headers.indexOf('sentiment')].toLowerCase() 
          : 'neutral',
        extractedInfo: {},
        aiReply: '',
        isRead: false,
      };
    });

    // Generate analytics from the CSV data
    const totalEmails = emails.length;
    const positiveEmails = emails.filter(e => e.sentiment === 'positive').length;
    const negativeEmails = emails.filter(e => e.sentiment === 'negative').length;
    const neutralEmails = emails.filter(e => e.sentiment === 'neutral').length;
    const urgentEmails = emails.filter(e => e.priority === 'urgent').length;

    const analytics = {
      totalEmails,
      positiveEmails,
      negativeEmails,
      neutralEmails,
      urgentEmails,
      averageResponseTime: '2.1 hours',
      sentimentDistribution: {
        positive: positiveEmails,
        negative: negativeEmails,
        neutral: neutralEmails,
      },
      last24Hours: [
        { hour: '00:00', count: Math.floor(totalEmails * 0.05) },
        { hour: '03:00', count: Math.floor(totalEmails * 0.03) },
        { hour: '06:00', count: Math.floor(totalEmails * 0.08) },
        { hour: '09:00', count: Math.floor(totalEmails * 0.15) },
        { hour: '12:00', count: Math.floor(totalEmails * 0.20) },
        { hour: '15:00', count: Math.floor(totalEmails * 0.18) },
        { hour: '18:00', count: Math.floor(totalEmails * 0.12) },
        { hour: '21:00', count: Math.floor(totalEmails * 0.08) },
      ],
    };

    return { emails, analytics };
  };

  const handleFileSelect = async (file: File) => {
    if (!file.name.endsWith('.csv')) {
      toast({
        title: "Invalid file type",
        description: "Please upload a CSV file.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    setFileName(file.name);

    try {
      const text = await file.text();
      const data = processCsvData(text);
      
      onDataLoaded(data);
      
      toast({
        title: "File uploaded successfully",
        description: `Processed ${data.emails.length} emails from ${file.name}`,
      });
    } catch (error) {
      toast({
        title: "Error processing file",
        description: "Please check your CSV format and try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleApiLoad = async () => {
    setIsLoadingApi(true);
    
    try {
      const response = await fetch("http://localhost:8000/emails");
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Transform API data to match expected format
      const emails = data.map((email: any, index: number) => ({
        id: email.id || `api-${index + 1}`,
        sender: email.sender || email.from || 'Unknown sender',
        subject: email.subject || 'No subject',
        body: email.body || email.content || 'No content',
        dateTime: email.sent_date || email.dateTime || new Date().toLocaleString(),
        priority: email.priority === 'urgent' ? 'urgent' : 'not urgent',
        sentiment: ['positive', 'negative', 'neutral'].includes(email.sentiment?.toLowerCase()) 
          ? email.sentiment.toLowerCase() 
          : 'neutral',
        extractedInfo: {},
        aiReply: '',
        isRead: false,
      }));

      // Generate analytics from API data
      const totalEmails = emails.length;
      const positiveEmails = emails.filter((e: any) => e.sentiment === 'positive').length;
      const negativeEmails = emails.filter((e: any) => e.sentiment === 'negative').length;
      const neutralEmails = emails.filter((e: any) => e.sentiment === 'neutral').length;
      const urgentEmails = emails.filter((e: any) => e.priority === 'urgent').length;

      const analytics = {
        totalEmails,
        positiveEmails,
        negativeEmails,
        neutralEmails,
        urgentEmails,
        averageResponseTime: '2.1 hours',
        sentimentDistribution: {
          positive: positiveEmails,
          negative: negativeEmails,
          neutral: neutralEmails,
        },
        last24Hours: [
          { hour: '00:00', count: Math.floor(totalEmails * 0.05) },
          { hour: '03:00', count: Math.floor(totalEmails * 0.03) },
          { hour: '06:00', count: Math.floor(totalEmails * 0.08) },
          { hour: '09:00', count: Math.floor(totalEmails * 0.15) },
          { hour: '12:00', count: Math.floor(totalEmails * 0.20) },
          { hour: '15:00', count: Math.floor(totalEmails * 0.18) },
          { hour: '18:00', count: Math.floor(totalEmails * 0.12) },
          { hour: '21:00', count: Math.floor(totalEmails * 0.08) },
        ],
      };

      onDataLoaded({ emails, analytics });
      
      toast({
        title: "API data loaded successfully",
        description: `Loaded ${emails.length} emails from localhost:8000`,
      });
    } catch (error) {
      toast({
        title: "Error loading from API",
        description: "Could not connect to localhost:8000. Make sure your server is running.",
        variant: "destructive",
      });
      console.error('API Error:', error);
    } finally {
      setIsLoadingApi(false);
    }
  };

  return (
    <Card className="bg-card shadow-card hover:shadow-hover transition-smooth border-2 border-dashed border-border">
      <CardHeader>
        <CardTitle className="text-xl font-semibold text-foreground text-center">
          Upload Your File Here
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div
          className={`relative p-8 rounded-lg border-2 border-dashed transition-smooth cursor-pointer ${
            isDragging
              ? 'border-primary bg-primary/5'
              : 'border-border hover:border-primary hover:bg-primary/5'
          }`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={handleButtonClick}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            onChange={handleFileChange}
            className="hidden"
          />
          
          <div className="text-center space-y-4">
            {isProcessing ? (
              <div className="animate-spin mx-auto">
                <Upload className="h-12 w-12 text-primary" />
              </div>
            ) : (
              <FileText className="h-12 w-12 text-primary mx-auto" />
            )}
            
            <div>
              <h3 className="text-lg font-medium text-foreground mb-2">
                {isProcessing ? 'Processing...' : 'Drop your CSV file here'}
              </h3>
              
              {fileName ? (
                <p className="text-sm text-primary font-medium">{fileName}</p>
              ) : (
                <p className="text-sm text-muted-foreground">
                  or click to browse files
                </p>
              )}
            </div>
            
            <div className="flex gap-3 justify-center">
              <Button
                disabled={isProcessing || isLoadingApi}
                className="bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                <Upload className="h-4 w-4 mr-2" />
                {isProcessing ? 'Processing...' : 'Select CSV File'}
              </Button>
              
              <Button
                onClick={(e) => {
                  e.stopPropagation();
                  handleApiLoad();
                }}
                disabled={isProcessing || isLoadingApi}
                variant="outline"
                className="border-primary text-primary hover:bg-primary hover:text-primary-foreground"
              >
                <FileText className="h-4 w-4 mr-2" />
                {isLoadingApi ? 'Loading...' : 'Load from API'}
              </Button>
            </div>
          </div>
        </div>
        
        <div className="mt-4 p-3 bg-muted rounded-md">
          <div className="flex items-start gap-2">
            <AlertCircle className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
            <div className="text-xs text-muted-foreground">
              <p className="font-medium mb-1">CSV Format Requirements:</p>
              <p>Headers: sender, subject, body, datetime, priority, sentiment</p>
              <p>Priority: urgent or normal | Sentiment: positive, negative, or neutral</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
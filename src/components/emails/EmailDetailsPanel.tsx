import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Email } from '@/types/email';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

interface EmailDetailsPanelProps {
  email: Email;
  isOpen: boolean;
  onClose: () => void;
}

export function EmailDetailsPanel({ email, isOpen, onClose }: EmailDetailsPanelProps) {
  const [generatedReply, setGeneratedReply] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const getSentimentBadgeClass = (sentiment: string) => {
    switch (sentiment) {
      case 'positive':
        return 'bg-green-500 text-white';
      case 'negative':
        return 'bg-red-500 text-white';
      case 'neutral':
        return 'bg-blue-500 text-white';
      default:
        return '';
    }
  };

  const getPriorityBadgeClass = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-urgent text-urgent-foreground';
      case 'normal':
        return 'bg-secondary text-secondary-foreground';
      default:
        return '';
    }
  };

  const handleGenerateReply = async () => {
    setIsGenerating(true);
    // Simulate AI reply generation
    setTimeout(() => {
      const reply = `Thank you for your email regarding ${email.subject}. We appreciate your inquiry and will respond within 24 hours.`;
      setGeneratedReply(reply);
      setIsGenerating(false);
      toast({
        description: "AI reply generated successfully",
      });
    }, 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-card rounded-lg shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-2xl font-bold text-foreground">Email Details</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="hover:bg-accent hover:text-accent-foreground"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-8rem)]">
          {/* Email Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Email Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Sender</label>
                <p className="text-foreground font-medium">{email.sender}</p>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground">Subject</label>
                <p className="text-foreground font-medium">{email.subject}</p>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground">Date & Time</label>
                <p className="text-foreground">{email.dateTime}</p>
              </div>

              <div className="flex gap-2">
                <Badge className={getPriorityBadgeClass(email.priority)}>
                  {email.priority}
                </Badge>
                <Badge className={getSentimentBadgeClass(email.sentiment)}>
                  {email.sentiment}
                </Badge>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground">Body</label>
                <div className="mt-1 p-3 bg-muted rounded-md text-foreground">
                  {email.body}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* AI Generated Reply */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="text-lg">AI-Generated Reply</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {!generatedReply ? (
                <Button 
                  onClick={handleGenerateReply}
                  disabled={isGenerating}
                  className="bg-green-600 hover:bg-green-700 text-white dark:bg-green-600 dark:hover:bg-green-700"
                >
                  {isGenerating ? 'Generating...' : 'Generate Reply'}
                </Button>
              ) : (
                <div className="space-y-4">
                  <div className="p-3 bg-muted rounded-md text-foreground border">
                    {generatedReply}
                  </div>
                  <div className="flex gap-2 justify-end">
                    <Button
                      variant="outline"
                      onClick={() => setGeneratedReply('')}
                    >
                      Cancel
                    </Button>
                    <Button
                      className="bg-green-600 hover:bg-green-700 text-white dark:bg-green-600 dark:hover:bg-green-700"
                      onClick={() => {
                        toast({
                          description: "Reply sent successfully",
                        });
                        onClose();
                      }}
                    >
                      Send Reply
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
import { X, Phone, Mail, Package, Copy, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
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
  const [extractedInfo, setExtractedInfo] = useState(email.extractedInfo);
  const [aiReply, setAiReply] = useState(email.aiReply);
  const [replyHint, setReplyHint] = useState('');
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

  const handleDeleteExtractedInfo = () => {
    setExtractedInfo({
      phone: undefined,
      alternateEmail: undefined,
      productOrderId: undefined,
    });
    toast({
      description: "Extracted information cleared successfully",
    });
  };

  const handleGenerateReply = async () => {
    setIsGenerating(true);
    // Simulate AI reply generation
    setTimeout(() => {
      const reply = `Thank you for your email regarding ${email.subject}. ${replyHint ? `Based on your hint: ${replyHint}. ` : ''}We appreciate your inquiry and will respond within 24 hours.`;
      setGeneratedReply(reply);
      setIsGenerating(false);
      toast({
        description: "AI reply generated successfully",
      });
    }, 2000);
  };

  const handleCopyReply = () => {
    navigator.clipboard.writeText(generatedReply);
    toast({
      description: "Reply copied to clipboard",
    });
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
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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

            {/* Extracted Information */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-lg">Extracted Information</CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDeleteExtractedInfo}
                  className="text-destructive hover:text-destructive hover:bg-destructive/10"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                {extractedInfo.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Phone:</span>
                    <span className="text-foreground font-medium">{extractedInfo.phone}</span>
                  </div>
                )}

                {extractedInfo.alternateEmail && (
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Alt Email:</span>
                    <span className="text-foreground font-medium">{extractedInfo.alternateEmail}</span>
                  </div>
                )}

                {extractedInfo.productOrderId && (
                  <div className="flex items-center gap-2">
                    <Package className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Order ID:</span>
                    <span className="text-foreground font-medium">{extractedInfo.productOrderId}</span>
                  </div>
                )}

                {!extractedInfo.phone && !extractedInfo.alternateEmail && !extractedInfo.productOrderId && (
                  <p className="text-muted-foreground italic">No additional information extracted</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* AI Generated Reply */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="text-lg">AI-Generated Reply</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Hint (Optional)</label>
                <Textarea
                  value={replyHint}
                  onChange={(e) => setReplyHint(e.target.value)}
                  className="min-h-20 resize-none mt-1"
                  placeholder="Add a hint to guide the AI reply generation..."
                />
              </div>
              
              <Button 
                onClick={handleGenerateReply}
                disabled={isGenerating}
                className="bg-green-600 hover:bg-green-700 text-white dark:bg-green-600 dark:hover:bg-green-700"
              >
                {isGenerating ? 'Generating...' : 'Generate Reply'}
              </Button>

              {generatedReply && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Generated Reply</label>
                  <div className="p-3 bg-muted rounded-md text-foreground border">
                    {generatedReply}
                  </div>
                  <div className="flex justify-end">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleCopyReply}
                      className="gap-2"
                    >
                      <Copy className="h-4 w-4" />
                      Copy
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
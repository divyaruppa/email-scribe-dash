-- Create emails table with comprehensive structure
CREATE TABLE public.emails (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  message_id TEXT UNIQUE NOT NULL,
  sender_email TEXT NOT NULL,
  sender_name TEXT,
  subject TEXT NOT NULL,
  body TEXT NOT NULL,
  received_at TIMESTAMP WITH TIME ZONE NOT NULL,
  priority TEXT NOT NULL CHECK (priority IN ('urgent', 'not urgent')) DEFAULT 'not urgent',
  sentiment TEXT NOT NULL CHECK (sentiment IN ('positive', 'negative', 'neutral')) DEFAULT 'neutral',
  is_processed BOOLEAN DEFAULT FALSE,
  is_replied BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create email_extractions table for extracted information
CREATE TABLE public.email_extractions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email_id UUID NOT NULL REFERENCES public.emails(id) ON DELETE CASCADE,
  phone_number TEXT,
  alternate_email TEXT,
  product_order_id TEXT,
  customer_requirements TEXT,
  sentiment_indicators JSONB,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create ai_responses table for generated responses
CREATE TABLE public.ai_responses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email_id UUID NOT NULL REFERENCES public.emails(id) ON DELETE CASCADE,
  response_text TEXT NOT NULL,
  is_sent BOOLEAN DEFAULT FALSE,
  confidence_score DECIMAL(3,2),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create email_analytics table for dashboard metrics
CREATE TABLE public.email_analytics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  total_emails INTEGER DEFAULT 0,
  positive_emails INTEGER DEFAULT 0,
  negative_emails INTEGER DEFAULT 0,
  neutral_emails INTEGER DEFAULT 0,
  urgent_emails INTEGER DEFAULT 0,
  resolved_emails INTEGER DEFAULT 0,
  pending_emails INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(date)
);

-- Enable Row Level Security
ALTER TABLE public.emails ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_extractions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_analytics ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (since no auth is implemented yet)
CREATE POLICY "Public access to emails" ON public.emails FOR ALL USING (true);
CREATE POLICY "Public access to extractions" ON public.email_extractions FOR ALL USING (true);
CREATE POLICY "Public access to responses" ON public.ai_responses FOR ALL USING (true);
CREATE POLICY "Public access to analytics" ON public.email_analytics FOR ALL USING (true);

-- Create indexes for better performance
CREATE INDEX idx_emails_received_at ON public.emails(received_at DESC);
CREATE INDEX idx_emails_priority ON public.emails(priority);
CREATE INDEX idx_emails_sentiment ON public.emails(sentiment);
CREATE INDEX idx_emails_processed ON public.emails(is_processed);
CREATE INDEX idx_email_analytics_date ON public.email_analytics(date);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_emails_updated_at
  BEFORE UPDATE ON public.emails
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_ai_responses_updated_at
  BEFORE UPDATE ON public.ai_responses
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to update analytics
CREATE OR REPLACE FUNCTION public.update_email_analytics()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.email_analytics (
    date,
    total_emails,
    positive_emails,
    negative_emails,
    neutral_emails,
    urgent_emails,
    resolved_emails,
    pending_emails
  )
  SELECT 
    CURRENT_DATE,
    COUNT(*),
    COUNT(*) FILTER (WHERE sentiment = 'positive'),
    COUNT(*) FILTER (WHERE sentiment = 'negative'),
    COUNT(*) FILTER (WHERE sentiment = 'neutral'),
    COUNT(*) FILTER (WHERE priority = 'urgent'),
    COUNT(*) FILTER (WHERE is_replied = true),
    COUNT(*) FILTER (WHERE is_replied = false)
  FROM public.emails
  WHERE DATE(received_at) = CURRENT_DATE
  ON CONFLICT (date) 
  DO UPDATE SET
    total_emails = EXCLUDED.total_emails,
    positive_emails = EXCLUDED.positive_emails,
    negative_emails = EXCLUDED.negative_emails,
    neutral_emails = EXCLUDED.neutral_emails,
    urgent_emails = EXCLUDED.urgent_emails,
    resolved_emails = EXCLUDED.resolved_emails,
    pending_emails = EXCLUDED.pending_emails;
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger to update analytics on email changes
CREATE TRIGGER update_analytics_on_email_change
  AFTER INSERT OR UPDATE OR DELETE ON public.emails
  FOR EACH ROW
  EXECUTE FUNCTION public.update_email_analytics();
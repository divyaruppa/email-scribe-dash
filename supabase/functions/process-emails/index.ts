import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Email filtering keywords
const SUPPORT_KEYWORDS = ['support', 'query', 'request', 'help', 'issue', 'problem', 'assistance'];
const URGENT_KEYWORDS = ['immediately', 'critical', 'urgent', 'asap', 'emergency', 'cannot access', 'down', 'broken'];

interface EmailData {
  messageId: string;
  senderEmail: string;
  senderName?: string;
  subject: string;
  body: string;
  receivedAt: string;
}

// Initialize Supabase client
const supabaseUrl = 'https://chbfedqbvhgdqrnhjily.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNoYmZlZHFidmhnZHFybmhqaWx5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzEzMDk2NywiZXhwIjoyMDcyNzA2OTY3fQ.yvXqrm2DJswXP8xLyMJK_rptXrB2vUO8qHVMu6FP8ww';
const supabase = createClient(supabaseUrl, supabaseKey);

function analyzesentiment(text: string): 'positive' | 'negative' | 'neutral' {
  const positiveWords = ['thank', 'great', 'excellent', 'amazing', 'love', 'perfect', 'wonderful', 'fantastic', 'happy', 'satisfied'];
  const negativeWords = ['hate', 'terrible', 'awful', 'horrible', 'worst', 'disappointed', 'frustrated', 'angry', 'upset', 'broken'];
  
  const lowercaseText = text.toLowerCase();
  const positiveCount = positiveWords.filter(word => lowercaseText.includes(word)).length;
  const negativeCount = negativeWords.filter(word => lowercaseText.includes(word)).length;
  
  if (positiveCount > negativeCount) return 'positive';
  if (negativeCount > positiveCount) return 'negative';
  return 'neutral';
}

function analyzePriority(text: string): 'urgent' | 'not urgent' {
  const lowercaseText = text.toLowerCase();
  return URGENT_KEYWORDS.some(keyword => lowercaseText.includes(keyword)) ? 'urgent' : 'not urgent';
}

function extractInformation(email: EmailData) {
  const text = `${email.subject} ${email.body}`;
  
  // Extract phone number
  const phoneRegex = /(\+?\d{1,4}[-.\s]?)?\(?\d{1,4}\)?[-.\s]?\d{1,4}[-.\s]?\d{1,9}/g;
  const phoneMatch = text.match(phoneRegex);
  
  // Extract alternate email
  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
  const emailMatches = text.match(emailRegex);
  const alternateEmail = emailMatches?.find(email => email !== email.senderEmail);
  
  // Extract order ID
  const orderRegex = /(order|invoice|ticket|reference)[\s#:]*([a-zA-Z0-9]+)/gi;
  const orderMatch = text.match(orderRegex);
  
  return {
    phoneNumber: phoneMatch?.[0] || null,
    alternateEmail: alternateEmail || null,
    productOrderId: orderMatch?.[1] || null,
    customerRequirements: extractRequirements(text),
    sentimentIndicators: extractSentimentIndicators(text)
  };
}

function extractRequirements(text: string): string {
  const requirementKeywords = ['need', 'want', 'require', 'looking for', 'help with', 'issue with'];
  const sentences = text.split(/[.!?]+/);
  
  const requirements = sentences.filter(sentence => 
    requirementKeywords.some(keyword => 
      sentence.toLowerCase().includes(keyword)
    )
  );
  
  return requirements.join('. ').trim();
}

function extractSentimentIndicators(text: string) {
  const positiveWords = ['thank', 'great', 'excellent', 'amazing', 'love', 'perfect'];
  const negativeWords = ['hate', 'terrible', 'awful', 'horrible', 'worst', 'disappointed'];
  
  const lowercaseText = text.toLowerCase();
  const foundPositive = positiveWords.filter(word => lowercaseText.includes(word));
  const foundNegative = negativeWords.filter(word => lowercaseText.includes(word));
  
  return {
    positive: foundPositive,
    negative: foundNegative
  };
}

async function generateAIResponse(email: EmailData, priority: string, sentiment: string): Promise<string> {
  const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
  if (!openAIApiKey) {
    console.error('OpenAI API key not found');
    return "Thank you for contacting us. We have received your message and will respond shortly.";
  }

  const systemPrompt = `You are a professional customer support assistant. Generate a helpful, empathetic response to customer emails.

Context:
- Email priority: ${priority}
- Customer sentiment: ${sentiment}
- Always maintain a professional and friendly tone
- If the customer seems frustrated, acknowledge their concerns empathetically
- Provide helpful information and next steps
- Keep responses concise but thorough
- Use the customer's name if provided`;

  const userPrompt = `Customer Email:
From: ${email.senderName || email.senderEmail}
Subject: ${email.subject}
Message: ${email.body}

Generate an appropriate response.`;

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        max_tokens: 500,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      console.error('OpenAI API error:', await response.text());
      throw new Error('OpenAI API request failed');
    }

    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.error('Error generating AI response:', error);
    return "Thank you for contacting us. We have received your message and will respond shortly.";
  }
}

function issuportEmail(subject: string, body: string): boolean {
  const text = `${subject} ${body}`.toLowerCase();
  return SUPPORT_KEYWORDS.some(keyword => text.includes(keyword));
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { emails } = await req.json();
    console.log('Processing emails:', emails?.length || 0);
    
    if (!emails || !Array.isArray(emails)) {
      throw new Error('Invalid emails array provided');
    }

    const processedEmails = [];

    for (const emailData of emails) {
      // Filter only support-related emails
      if (!issuportEmail(emailData.subject, emailData.body)) {
        console.log('Skipping non-support email:', emailData.subject);
        continue;
      }

      console.log('Processing email:', emailData.subject);

      // Analyze sentiment and priority
      const sentiment = analyzesentiment(`${emailData.subject} ${emailData.body}`);
      const priority = analyzePriority(`${emailData.subject} ${emailData.body}`);
      
      // Extract information
      const extractedInfo = extractInformation(emailData);
      
      // Generate AI response
      const aiResponse = await generateAIResponse(emailData, priority, sentiment);

      // Insert email into database
      const { data: insertedEmail, error: emailError } = await supabase
        .from('emails')
        .insert({
          message_id: emailData.messageId,
          sender_email: emailData.senderEmail,
          sender_name: emailData.senderName,
          subject: emailData.subject,
          body: emailData.body,
          received_at: emailData.receivedAt,
          priority,
          sentiment,
          is_processed: true
        })
        .select()
        .single();

      if (emailError) {
        console.error('Error inserting email:', emailError);
        continue;
      }

      // Insert extracted information
      const { error: extractionError } = await supabase
        .from('email_extractions')
        .insert({
          email_id: insertedEmail.id,
          phone_number: extractedInfo.phoneNumber,
          alternate_email: extractedInfo.alternateEmail,
          product_order_id: extractedInfo.productOrderId,
          customer_requirements: extractedInfo.customerRequirements,
          sentiment_indicators: extractedInfo.sentimentIndicators
        });

      if (extractionError) {
        console.error('Error inserting extraction:', extractionError);
      }

      // Insert AI response
      const { error: responseError } = await supabase
        .from('ai_responses')
        .insert({
          email_id: insertedEmail.id,
          response_text: aiResponse,
          confidence_score: 0.85
        });

      if (responseError) {
        console.error('Error inserting AI response:', responseError);
      }

      processedEmails.push({
        ...insertedEmail,
        extractedInfo,
        aiResponse
      });
    }

    // Sort by priority (urgent first) and then by received date
    processedEmails.sort((a, b) => {
      if (a.priority === 'urgent' && b.priority !== 'urgent') return -1;
      if (a.priority !== 'urgent' && b.priority === 'urgent') return 1;
      return new Date(b.received_at).getTime() - new Date(a.received_at).getTime();
    });

    return new Response(JSON.stringify({
      success: true,
      processedCount: processedEmails.length,
      emails: processedEmails
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
    
  } catch (error) {
    console.error('Error in process-emails function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      success: false 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
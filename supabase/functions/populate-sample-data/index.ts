import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Initialize Supabase client
const supabaseUrl = 'https://chbfedqbvhgdqrnhjily.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNoYmZlZHFidmhnZHFybmhqaWx5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzEzMDk2NywiZXhwIjoyMDcyNzA2OTY3fQ.yvXqrm2DJswXP8xLyMJK_rptXrB2vUO8qHVMu6FP8ww';
const supabase = createClient(supabaseUrl, supabaseKey);

const sampleEmails = [
  {
    messageId: 'msg-sample-001',
    senderEmail: 'frustrated.customer@email.com',
    senderName: 'John Frustrated',
    subject: 'URGENT: Support Request - Cannot access my account!',
    body: 'I am extremely frustrated! I have been trying to access my account for the past 3 hours and keep getting error messages. This is critical for my business operations and I need immediate assistance. I have tried resetting my password multiple times but nothing works. Please help me immediately!',
    receivedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    priority: 'urgent',
    sentiment: 'negative'
  },
  {
    messageId: 'msg-sample-002',
    senderEmail: 'happy.user@company.com',
    senderName: 'Sarah Happy',
    subject: 'Help with new feature',
    body: 'Hi! I just wanted to say that I love the new update to your software. However, I need some help understanding how to use the new collaboration feature. Could someone please guide me through the setup process? Thank you for the amazing product!',
    receivedAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    priority: 'not urgent',
    sentiment: 'positive'
  },
  {
    messageId: 'msg-sample-003',
    senderEmail: 'business.inquiry@corp.com',
    senderName: 'Mike Business',
    subject: 'Query about enterprise pricing',
    body: 'Hello, we are considering your enterprise solution for our company of 500 employees. Could you please provide information about pricing plans and implementation timeline? We are looking to migrate by the end of this quarter. Our contact number is +1-555-0123.',
    receivedAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    priority: 'not urgent',
    sentiment: 'neutral'
  },
  {
    messageId: 'msg-sample-004',
    senderEmail: 'technical.support@client.com',
    senderName: 'Lisa Technical',
    subject: 'Critical API integration issue - Need immediate support',
    body: 'We are experiencing a critical issue with our API integration. Our production system is down and affecting our customers. The authentication endpoint is returning 500 errors consistently. This is an emergency situation and we need immediate technical support. Our order ID is #ORD-98765.',
    receivedAt: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
    priority: 'urgent',
    sentiment: 'negative'
  },
  {
    messageId: 'msg-sample-005',
    senderEmail: 'general.question@user.com',
    senderName: 'Tom Question',
    subject: 'Request for documentation',
    body: 'Hi, I am new to your platform and would like to request access to the developer documentation. I am particularly interested in the REST API endpoints and webhook configurations. Could you please send me the links or provide access to the documentation portal?',
    receivedAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    priority: 'not urgent',
    sentiment: 'neutral'
  }
];

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Populating sample data...');

    // Clear existing data
    await supabase.from('ai_responses').delete().gte('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('email_extractions').delete().gte('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('emails').delete().gte('id', '00000000-0000-0000-0000-000000000000');

    const results = [];

    for (const emailData of sampleEmails) {
      // Insert email
      const { data: insertedEmail, error: emailError } = await supabase
        .from('emails')
        .insert({
          message_id: emailData.messageId,
          sender_email: emailData.senderEmail,
          sender_name: emailData.senderName,
          subject: emailData.subject,
          body: emailData.body,
          received_at: emailData.receivedAt,
          priority: emailData.priority,
          sentiment: emailData.sentiment,
          is_processed: true,
          is_replied: false
        })
        .select()
        .single();

      if (emailError) {
        console.error('Error inserting email:', emailError);
        continue;
      }

      // Extract information
      const phoneRegex = /(\+?\d{1,4}[-.\s]?)?\(?\d{1,4}\)?[-.\s]?\d{1,4}[-.\s]?\d{1,9}/g;
      const orderRegex = /#([A-Z]+-\d+)/g;
      
      const phoneMatch = emailData.body.match(phoneRegex);
      const orderMatch = emailData.body.match(orderRegex);

      // Insert extracted information
      await supabase.from('email_extractions').insert({
        email_id: insertedEmail.id,
        phone_number: phoneMatch?.[0] || null,
        product_order_id: orderMatch?.[0] || null,
        customer_requirements: extractRequirements(emailData.body),
        sentiment_indicators: {
          positive: extractPositiveWords(emailData.body),
          negative: extractNegativeWords(emailData.body)
        }
      });

      // Generate AI response based on sentiment and priority
      const aiResponse = generateResponseForEmail(emailData);

      // Insert AI response
      await supabase.from('ai_responses').insert({
        email_id: insertedEmail.id,
        response_text: aiResponse,
        confidence_score: 0.85,
        is_sent: false
      });

      results.push(insertedEmail);
    }

    return new Response(JSON.stringify({
      success: true,
      message: 'Sample data populated successfully',
      emailsCreated: results.length
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
    
  } catch (error) {
    console.error('Error in populate-sample-data function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      success: false 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

function extractRequirements(text: string): string {
  const requirementKeywords = ['need', 'want', 'require', 'looking for', 'help with', 'issue with', 'request'];
  const sentences = text.split(/[.!?]+/);
  
  const requirements = sentences.filter(sentence => 
    requirementKeywords.some(keyword => 
      sentence.toLowerCase().includes(keyword)
    )
  );
  
  return requirements.join('. ').trim();
}

function extractPositiveWords(text: string): string[] {
  const positiveWords = ['love', 'amazing', 'great', 'excellent', 'wonderful', 'fantastic', 'happy', 'pleased'];
  const lowercaseText = text.toLowerCase();
  return positiveWords.filter(word => lowercaseText.includes(word));
}

function extractNegativeWords(text: string): string[] {
  const negativeWords = ['frustrated', 'angry', 'disappointed', 'terrible', 'awful', 'critical', 'emergency', 'down'];
  const lowercaseText = text.toLowerCase();
  return negativeWords.filter(word => lowercaseText.includes(word));
}

function generateResponseForEmail(emailData: any): string {
  const responses = {
    urgent_negative: `Dear ${emailData.senderName},

I sincerely apologize for the inconvenience you're experiencing. I understand how frustrating this situation must be, especially when it affects your business operations.

I'm escalating your case to our priority support team who will contact you within the next 30 minutes to resolve this issue immediately. 

In the meantime, please try clearing your browser cache and cookies, or contact our emergency support line at 1-800-SUPPORT.

We truly value your business and are committed to resolving this quickly.

Best regards,
Customer Support Team`,

    not_urgent_positive: `Dear ${emailData.senderName},

Thank you so much for your kind words about our recent update! We're thrilled to hear that you're enjoying the new features.

I'd be happy to help you with the collaboration feature setup. I'll send you a detailed step-by-step guide along with some video tutorials that will walk you through the process.

If you need any additional assistance, please don't hesitate to reach out. We're here to help!

Best regards,
Customer Support Team`,

    not_urgent_neutral: `Dear ${emailData.senderName},

Thank you for your inquiry about our enterprise solution. We're excited about the opportunity to work with your organization.

I'll connect you with our enterprise sales team who will provide you with detailed pricing information and implementation timelines. They'll reach out to you within 24 hours to schedule a consultation.

Thank you for considering our platform for your business needs.

Best regards,
Customer Support Team`,

    urgent_negative_technical: `Dear ${emailData.senderName},

I understand the critical nature of this API integration issue and apologize for the disruption to your production system.

I'm immediately escalating this to our technical team and assigning a senior engineer to your case. They will contact you within 15 minutes to begin troubleshooting.

Your case reference number is ${emailData.messageId.toUpperCase()} for tracking purposes.

We're committed to resolving this emergency situation as quickly as possible.

Best regards,
Technical Support Team`
  };

  if (emailData.priority === 'urgent' && emailData.sentiment === 'negative') {
    if (emailData.body.toLowerCase().includes('api') || emailData.body.toLowerCase().includes('technical')) {
      return responses.urgent_negative_technical;
    }
    return responses.urgent_negative;
  } else if (emailData.priority === 'not urgent' && emailData.sentiment === 'positive') {
    return responses.not_urgent_positive;
  } else {
    return responses.not_urgent_neutral;
  }
}
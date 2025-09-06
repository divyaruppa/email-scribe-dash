import "https://deno.land/x/xhr@0.1.0/mod.ts";
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

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { provider, credentials } = await req.json();
    console.log('Fetching emails from provider:', provider);
    
    let emails = [];

    switch (provider) {
      case 'gmail':
        emails = await fetchGmailEmails(credentials);
        break;
      case 'outlook':
        emails = await fetchOutlookEmails(credentials);
        break;
      case 'imap':
        emails = await fetchIMAPEmails(credentials);
        break;
      case 'mock':
      default:
        emails = await fetchMockEmails();
        break;
    }

    return new Response(JSON.stringify({
      success: true,
      emails,
      count: emails.length
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
    
  } catch (error) {
    console.error('Error in fetch-emails function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      success: false 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function fetchGmailEmails(credentials: any) {
  // Gmail API implementation would go here
  // For now, return mock data with Gmail-like structure
  console.log('Fetching Gmail emails with credentials:', credentials);
  return getMockEmails('gmail');
}

async function fetchOutlookEmails(credentials: any) {
  // Outlook/Graph API implementation would go here
  // For now, return mock data with Outlook-like structure
  console.log('Fetching Outlook emails with credentials:', credentials);
  return getMockEmails('outlook');
}

async function fetchIMAPEmails(credentials: any) {
  // IMAP implementation would go here
  // This would use a library like 'node-imap' equivalent for Deno
  console.log('Fetching IMAP emails with credentials:', credentials);
  return getMockEmails('imap');
}

async function fetchMockEmails() {
  return getMockEmails('mock');
}

function getMockEmails(provider: string) {
  const baseEmails = [
    {
      messageId: `msg-001-${provider}`,
      senderEmail: 'customer1@email.com',
      senderName: 'John Smith',
      subject: 'Support Request - Cannot access my account',
      body: 'Hi, I am having trouble accessing my account. I keep getting an error message saying my password is incorrect, but I am sure I am using the right password. This is urgent as I need to access my account immediately for work. Please help!',
      receivedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
    },
    {
      messageId: `msg-002-${provider}`,
      senderEmail: 'support@company.com',
      senderName: 'Sarah Johnson',
      subject: 'Help with product setup',
      body: 'Hello, I recently purchased your product and I am having difficulty setting it up. The manual is not very clear about the installation process. Could you please provide more detailed instructions? My order number is #ORD-12345.',
      receivedAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString()
    },
    {
      messageId: `msg-003-${provider}`,
      senderEmail: 'happy@customer.com',
      senderName: 'Mike Wilson',
      subject: 'Query about billing',
      body: 'Hi there! I have a question about my recent bill. I noticed there is an extra charge that I do not understand. Could you please explain what this charge is for? Overall, I am very happy with your service, I just need clarification on this one item. Thank you!',
      receivedAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString()
    },
    {
      messageId: `msg-004-${provider}`,
      senderEmail: 'frustrated@user.com',
      senderName: 'Lisa Brown',
      subject: 'Terrible experience - Request immediate help',
      body: 'I am extremely disappointed with the service I have received. The product is not working as advertised and customer support has been awful. This is the third time I am contacting you and I still have not received a proper response. I need this fixed immediately or I want a full refund. This is critical for my business operations.',
      receivedAt: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString()
    },
    {
      messageId: `msg-005-${provider}`,
      senderEmail: 'info@business.com',
      senderName: 'Tom Davis',
      subject: 'Support needed for integration',
      body: 'Good morning, we are trying to integrate your API with our system but we are running into some technical issues. The authentication seems to be failing despite following the documentation exactly. Could someone from your technical support team help us with this? Our phone number is +1-555-0123.',
      receivedAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString()
    },
    {
      messageId: `msg-006-${provider}`,
      senderEmail: 'general@inquiry.com',
      senderName: 'Emma Martinez',
      subject: 'General question about features',
      body: 'Hello, I am considering purchasing your product and I have a few questions about the features. Specifically, I want to know if it supports multi-user access and if there are any limitations on the number of projects. Thanks for your help!',
      receivedAt: new Date(Date.now() - 16 * 60 * 60 * 1000).toISOString()
    }
  ];

  return baseEmails;
}
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
    const url = new URL(req.url);
    const filter = url.searchParams.get('filter') || 'all';
    const sort = url.searchParams.get('sort') || 'received_at';
    const search = url.searchParams.get('search') || '';

    console.log('Fetching dashboard data with filters:', { filter, sort, search });

    // Build the query
    let query = supabase
      .from('emails')
      .select(`
        *,
        email_extractions (*),
        ai_responses (*)
      `);

    // Apply filters
    if (filter !== 'all') {
      if (['positive', 'negative', 'neutral'].includes(filter)) {
        query = query.eq('sentiment', filter);
      } else if (['urgent', 'not urgent'].includes(filter)) {
        query = query.eq('priority', filter);
      }
    }

    // Apply search
    if (search) {
      query = query.or(`subject.ilike.%${search}%,sender_email.ilike.%${search}%,body.ilike.%${search}%`);
    }

    // Apply sorting
    if (sort === 'priority') {
      query = query.order('priority', { ascending: false })
                  .order('received_at', { ascending: false });
    } else {
      query = query.order('received_at', { ascending: false });
    }

    const { data: emails, error: emailsError } = await query;

    if (emailsError) {
      throw new Error(`Error fetching emails: ${emailsError.message}`);
    }

    // Transform data to match frontend expectations
    const transformedEmails = emails?.map(email => ({
      id: email.id,
      sender: email.sender_email,
      subject: email.subject,
      body: email.body,
      dateTime: email.received_at,
      priority: email.priority,
      sentiment: email.sentiment,
      extractedInfo: {
        phone: email.email_extractions?.[0]?.phone_number || '',
        alternateEmail: email.email_extractions?.[0]?.alternate_email || '',
        productOrderId: email.email_extractions?.[0]?.product_order_id || '',
      },
      aiReply: email.ai_responses?.[0]?.response_text || '',
      isRead: email.is_processed || false
    })) || [];

    // Get analytics data
    const { data: analyticsResponse } = await supabase.functions.invoke('get-analytics');
    
    return new Response(JSON.stringify({
      success: true,
      emails: transformedEmails,
      analytics: analyticsResponse?.analytics || null,
      count: transformedEmails.length
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
    
  } catch (error) {
    console.error('Error in get-dashboard-data function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      success: false 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
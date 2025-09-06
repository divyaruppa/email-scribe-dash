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
    console.log('Fetching analytics data...');

    // Get overall statistics
    const { data: emails, error: emailsError } = await supabase
      .from('emails')
      .select('*');

    if (emailsError) {
      throw new Error(`Error fetching emails: ${emailsError.message}`);
    }

    // Get hourly statistics for last 24 hours
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    
    const { data: recentEmails, error: recentError } = await supabase
      .from('emails')
      .select('received_at, sentiment, priority')
      .gte('received_at', twentyFourHoursAgo.toISOString());

    if (recentError) {
      throw new Error(`Error fetching recent emails: ${recentError.message}`);
    }

    // Calculate analytics
    const totalEmails = emails?.length || 0;
    const positiveEmails = emails?.filter(e => e.sentiment === 'positive').length || 0;
    const negativeEmails = emails?.filter(e => e.sentiment === 'negative').length || 0;
    const neutralEmails = emails?.filter(e => e.sentiment === 'neutral').length || 0;
    const urgentEmails = emails?.filter(e => e.priority === 'urgent').length || 0;
    const resolvedEmails = emails?.filter(e => e.is_replied).length || 0;
    const pendingEmails = emails?.filter(e => !e.is_replied).length || 0;

    // Calculate hourly distribution for last 24 hours
    const hourlyData = [];
    for (let i = 23; i >= 0; i--) {
      const hourStart = new Date(Date.now() - i * 60 * 60 * 1000);
      const hourEnd = new Date(Date.now() - (i - 1) * 60 * 60 * 1000);
      
      const hourEmails = recentEmails?.filter(email => {
        const emailTime = new Date(email.received_at);
        return emailTime >= hourStart && emailTime < hourEnd;
      }).length || 0;

      hourlyData.push({
        hour: hourStart.getHours().toString().padStart(2, '0') + ':00',
        count: hourEmails
      });
    }

    // Calculate average response time (mock for now)
    const averageResponseTime = calculateAverageResponseTime(emails || []);

    const analytics = {
      totalEmails,
      positiveEmails,
      negativeEmails,
      neutralEmails,
      urgentEmails,
      resolvedEmails,
      pendingEmails,
      averageResponseTime,
      sentimentDistribution: {
        positive: totalEmails > 0 ? Math.round((positiveEmails / totalEmails) * 100) : 0,
        negative: totalEmails > 0 ? Math.round((negativeEmails / totalEmails) * 100) : 0,
        neutral: totalEmails > 0 ? Math.round((neutralEmails / totalEmails) * 100) : 0,
      },
      last24Hours: hourlyData
    };

    console.log('Analytics calculated:', analytics);

    return new Response(JSON.stringify({
      success: true,
      analytics
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
    
  } catch (error) {
    console.error('Error in get-analytics function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      success: false 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

function calculateAverageResponseTime(emails: any[]): string {
  // For now, return a mock average response time
  // In a real implementation, this would calculate based on received_at and response timestamps
  const resolvedEmails = emails.filter(e => e.is_replied);
  
  if (resolvedEmails.length === 0) {
    return "No data";
  }

  // Mock calculation - in reality, you'd track actual response times
  const avgMinutes = Math.round(Math.random() * 120 + 30); // 30-150 minutes
  
  if (avgMinutes < 60) {
    return `${avgMinutes} minutes`;
  } else {
    const hours = Math.floor(avgMinutes / 60);
    const minutes = avgMinutes % 60;
    return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
  }
}
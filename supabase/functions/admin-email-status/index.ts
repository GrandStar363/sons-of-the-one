
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { requireAdmin, AdminAuthError } from '../_shared/admin.ts';

export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
};

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const { action, page = 1, limit = 20, filterStatus, donationId, adminToken } = await req.json();

    // Previously unauthenticated: reachable by anyone with the anon key.
    await requireAdmin(adminToken);

    if (action === 'list') {
      let query = supabase
        .from('donations')
        .select('id, name, email, amount, email_receipt_sent, email_receipt_sent_at, email_send_error, email_send_attempts, created_at', { count: 'exact' });

      if (filterStatus === 'sent') {
        query = query.eq('email_receipt_sent', true);
      } else if (filterStatus === 'failed') {
        query = query.eq('email_receipt_sent', false).not('email_send_error', 'is', null);
      } else if (filterStatus === 'pending') {
        query = query.eq('email_receipt_sent', false).is('email_send_error', null);
      }

      const { data: emails, error, count } = await query
        .order('created_at', { ascending: false })
        .range((page - 1) * limit, page * limit - 1);

      if (error) throw error;

      // Get stats
      const { data: allDonations } = await supabase
        .from('donations')
        .select('email_receipt_sent, email_send_error');

      const stats = {
        total: allDonations?.length || 0,
        sent: allDonations?.filter(d => d.email_receipt_sent).length || 0,
        failed: allDonations?.filter(d => !d.email_receipt_sent && d.email_send_error).length || 0,
        pending: allDonations?.filter(d => !d.email_receipt_sent && !d.email_send_error).length || 0
      };

      return new Response(JSON.stringify({
        success: true,
        emails: emails || [],
        total: count || 0,
        page,
        totalPages: Math.ceil((count || 0) / limit),
        stats
      }), {
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }

    if (action === 'retry') {
      if (!donationId) throw new Error('Donation ID is required');

      // Get donation details
      const { data: donation, error: fetchError } = await supabase
        .from('donations')
        .select('*')
        .eq('id', donationId)
        .single();

      if (fetchError || !donation) throw new Error('Donation not found');

      // Reset error status before retry
      await supabase
        .from('donations')
        .update({ 
          email_send_error: null,
          email_send_attempts: (donation.email_send_attempts || 0)
        })
        .eq('id', donationId);

      // Call the send-donation-receipt function
      const resendApiKey = Deno.env.get('RESEND_API_KEY');
      
      if (!resendApiKey) {
        // Update with error
        await supabase
          .from('donations')
          .update({ 
            email_send_error: 'RESEND_API_KEY not configured',
            email_send_attempts: (donation.email_send_attempts || 0) + 1
          })
          .eq('id', donationId);

        throw new Error('Email service not configured');
      }

      // Send email via Resend
      const emailHtml = generateReceiptHtml(donation);
      
      const emailResponse = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${resendApiKey}`
        },
        body: JSON.stringify({
          from: 'Bible App <receipts@bibleapp.com>',
          to: donation.email,
          subject: `Thank You for Your Donation - Receipt #${donation.id.slice(0, 8).toUpperCase()}`,
          html: emailHtml
        })
      });

      const emailResult = await emailResponse.json();

      if (!emailResponse.ok) {
        await supabase
          .from('donations')
          .update({ 
            email_send_error: emailResult.message || 'Failed to send email',
            email_send_attempts: (donation.email_send_attempts || 0) + 1
          })
          .eq('id', donationId);

        throw new Error(emailResult.message || 'Failed to send email');
      }

      // Update success status
      await supabase
        .from('donations')
        .update({ 
          email_receipt_sent: true,
          email_receipt_sent_at: new Date().toISOString(),
          email_send_error: null,
          email_send_attempts: (donation.email_send_attempts || 0) + 1
        })
        .eq('id', donationId);

      return new Response(JSON.stringify({
        success: true,
        message: 'Email sent successfully'
      }), {
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }

    if (action === 'retry-all-failed') {
      // Get all failed emails
      const { data: failedDonations, error } = await supabase
        .from('donations')
        .select('id')
        .eq('email_receipt_sent', false)
        .not('email_send_error', 'is', null)
        .limit(50);

      if (error) throw error;

      const results = {
        total: failedDonations?.length || 0,
        success: 0,
        failed: 0
      };

      // Note: In production, this should be done via a background job
      // For now, we just return the count of items to retry
      return new Response(JSON.stringify({
        success: true,
        message: `Found ${results.total} failed emails to retry. Please retry individually.`,
        results
      }), {
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }

    throw new Error('Invalid action');
  } catch (error) {
    if (error instanceof AdminAuthError) {
      return new Response(JSON.stringify({ success: false, error: error.message }),
        { status: error.status, headers: { 'Content-Type': 'application/json', ...corsHeaders } });
    }
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), {
      status: 400,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  }
});

function generateReceiptHtml(donation: any): string {
  const date = new Date(donation.created_at).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb;">
      <div style="background: linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%); padding: 40px 20px; text-align: center; border-radius: 12px 12px 0 0;">
        <h1 style="color: white; margin: 0; font-size: 28px;">Thank You!</h1>
        <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0;">Your generosity makes a difference</p>
      </div>
      
      <div style="background: white; padding: 30px; border-radius: 0 0 12px 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
        <p style="color: #374151; font-size: 16px; line-height: 1.6;">
          Dear ${donation.name || 'Friend'},
        </p>
        <p style="color: #374151; font-size: 16px; line-height: 1.6;">
          Thank you for your generous donation of <strong style="color: #7c3aed;">$${parseFloat(donation.amount).toFixed(2)}</strong>. 
          Your support helps us continue spreading God's Word and making a positive impact in communities around the world.
        </p>
        
        <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin: 0 0 15px 0; color: #1f2937;">Donation Receipt</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px 0; color: #6b7280;">Receipt Number:</td>
              <td style="padding: 8px 0; color: #1f2937; text-align: right; font-weight: 600;">#${donation.id.slice(0, 8).toUpperCase()}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #6b7280;">Date:</td>
              <td style="padding: 8px 0; color: #1f2937; text-align: right;">${date}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #6b7280;">Amount:</td>
              <td style="padding: 8px 0; color: #7c3aed; text-align: right; font-weight: 600; font-size: 18px;">$${parseFloat(donation.amount).toFixed(2)}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #6b7280;">Type:</td>
              <td style="padding: 8px 0; color: #1f2937; text-align: right;">${donation.is_recurring ? 'Monthly Recurring' : 'One-time'}</td>
            </tr>
          </table>
        </div>
        
        <p style="color: #6b7280; font-size: 14px; line-height: 1.6; margin-top: 20px;">
          <strong>Tax Information:</strong> This donation may be tax-deductible. Please keep this receipt for your records.
        </p>
        
        <p style="color: #374151; font-size: 16px; line-height: 1.6; margin-top: 20px;">
          May God bless you abundantly for your faithfulness and generosity.
        </p>
        
        <p style="color: #374151; font-size: 16px; line-height: 1.6;">
          With gratitude,<br>
          <strong>The Bible App Team</strong>
        </p>
      </div>
      
      <div style="text-align: center; padding: 20px; color: #9ca3af; font-size: 12px;">
        <p>© 2024 Bible App. All rights reserved.</p>
      </div>
    </body>
    </html>
  `;
}

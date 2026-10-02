
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
};

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

// Retry configuration
const MAX_RETRIES = 3;
const INITIAL_RETRY_DELAY = 1000; // 1 second

// Sleep utility for retry delays
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Send email with retry logic
async function sendEmailWithRetry(
  apiKey: string,
  emailData: {
    from: string;
    to: string[];
    subject: string;
    html: string;
    text: string;
    replyTo?: string;
  },
  retryCount = 0
): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    console.log(`Attempting to send email (attempt ${retryCount + 1}/${MAX_RETRIES + 1})`);
    
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify(emailData)
    });

    const responseData = await response.json();

    if (response.ok) {
      console.log('Email sent successfully:', responseData.id);
      return { success: true, data: responseData };
    }

    // Check if error is retryable
    const isRetryable = response.status >= 500 || response.status === 429;
    
    if (isRetryable && retryCount < MAX_RETRIES) {
      const delay = INITIAL_RETRY_DELAY * Math.pow(2, retryCount); // Exponential backoff
      console.log(`Retryable error (${response.status}), waiting ${delay}ms before retry...`);
      await sleep(delay);
      return sendEmailWithRetry(apiKey, emailData, retryCount + 1);
    }

    // Non-retryable error or max retries exceeded
    const errorMessage = responseData.message || responseData.error || `HTTP ${response.status}`;
    console.error('Email send failed:', errorMessage);
    return { success: false, error: errorMessage };

  } catch (error) {
    console.error('Network error sending email:', error);
    
    // Retry on network errors
    if (retryCount < MAX_RETRIES) {
      const delay = INITIAL_RETRY_DELAY * Math.pow(2, retryCount);
      console.log(`Network error, waiting ${delay}ms before retry...`);
      await sleep(delay);
      return sendEmailWithRetry(apiKey, emailData, retryCount + 1);
    }

    return { success: false, error: error.message || 'Network error' };
  }
}

// Generate a beautiful HTML email receipt
function generateEmailHTML(data: {
  donorName: string;
  donorEmail: string;
  amount: number;
  currency: string;
  date: string;
  receiptNumber: string;
  message?: string;
  donationType: string;
}) {
  const formattedAmount = (data.amount / 100).toFixed(2);
  const formattedDate = new Date(data.date).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  
  const shareText = encodeURIComponent(`I just supported Divine Word Bible App in spreading God's word! Join me in making a difference.`);
  const shareUrl = encodeURIComponent('https://divinewordbible.app');
  
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Donation Receipt - Divine Word Bible</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8f9fa;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" style="width: 100%; max-width: 600px; border-collapse: collapse; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0, 0, 0, 0.1);">
          
          <!-- Header with gradient -->
          <tr>
            <td style="background: linear-gradient(135deg, #f43f5e 0%, #ec4899 50%, #a855f7 100%); padding: 40px 30px; text-align: center;">
              <div style="width: 80px; height: 80px; background-color: rgba(255, 255, 255, 0.2); border-radius: 50%; margin: 0 auto 20px; line-height: 80px;">
                <span style="font-size: 40px;">&#128214;</span>
              </div>
              <h1 style="color: #ffffff; font-size: 28px; margin: 0 0 8px 0; font-weight: 700;">Thank You for Your Gift!</h1>
              <p style="color: rgba(255, 255, 255, 0.9); font-size: 16px; margin: 0;">Your generosity helps spread God's word</p>
            </td>
          </tr>
          
          <!-- Personalized greeting -->
          <tr>
            <td style="padding: 30px 30px 20px;">
              <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0;">
                Dear <strong>${data.donorName}</strong>,
              </p>
              <p style="color: #6b7280; font-size: 16px; line-height: 1.6; margin: 16px 0 0 0;">
                We are deeply grateful for your generous ${data.donationType === 'recurring' ? 'monthly ' : ''}donation to Divine Word Bible. Your support is a blessing that helps us continue our mission of spreading God's word to people around the world.
              </p>
            </td>
          </tr>
          
          <!-- Donation amount highlight -->
          <tr>
            <td style="padding: 0 30px;">
              <table role="presentation" style="width: 100%; border-collapse: collapse; background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); border-radius: 12px; overflow: hidden;">
                <tr>
                  <td style="padding: 24px; text-align: center;">
                    <p style="color: #92400e; font-size: 14px; margin: 0 0 8px 0; text-transform: uppercase; letter-spacing: 1px; font-weight: 600;">Donation Amount</p>
                    <p style="color: #78350f; font-size: 42px; margin: 0; font-weight: 700;">$${formattedAmount}</p>
                    <p style="color: #92400e; font-size: 14px; margin: 8px 0 0 0;">${data.currency.toUpperCase()}</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Receipt details -->
          <tr>
            <td style="padding: 30px;">
              <h2 style="color: #1f2937; font-size: 18px; margin: 0 0 16px 0; font-weight: 600;">Receipt Details</h2>
              <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #f9fafb; border-radius: 8px; overflow: hidden;">
                <tr>
                  <td style="padding: 12px 16px; border-bottom: 1px solid #e5e7eb;">
                    <span style="color: #6b7280; font-size: 14px;">Receipt Number</span>
                  </td>
                  <td style="padding: 12px 16px; border-bottom: 1px solid #e5e7eb; text-align: right;">
                    <span style="color: #1f2937; font-size: 14px; font-weight: 600;">${data.receiptNumber}</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 12px 16px; border-bottom: 1px solid #e5e7eb;">
                    <span style="color: #6b7280; font-size: 14px;">Date</span>
                  </td>
                  <td style="padding: 12px 16px; border-bottom: 1px solid #e5e7eb; text-align: right;">
                    <span style="color: #1f2937; font-size: 14px; font-weight: 600;">${formattedDate}</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 12px 16px; border-bottom: 1px solid #e5e7eb;">
                    <span style="color: #6b7280; font-size: 14px;">Donation Type</span>
                  </td>
                  <td style="padding: 12px 16px; border-bottom: 1px solid #e5e7eb; text-align: right;">
                    <span style="color: #1f2937; font-size: 14px; font-weight: 600;">${data.donationType === 'recurring' ? 'Monthly Recurring' : 'One-Time Gift'}</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 12px 16px;">
                    <span style="color: #6b7280; font-size: 14px;">Payment Method</span>
                  </td>
                  <td style="padding: 12px 16px; text-align: right;">
                    <span style="color: #1f2937; font-size: 14px; font-weight: 600;">Credit/Debit Card</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Tax deductible notice -->
          <tr>
            <td style="padding: 0 30px 30px;">
              <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 8px;">
                <tr>
                  <td style="padding: 16px;">
                    <p style="color: #065f46; font-size: 14px; font-weight: 600; margin: 0 0 8px 0;">&#9989; Tax-Deductible Donation</p>
                    <p style="color: #047857; font-size: 13px; margin: 0; line-height: 1.5;">
                      Divine Word Bible is a registered 501(c)(3) nonprofit organization. This donation may be tax-deductible to the extent allowed by law. No goods or services were provided in exchange for this contribution. Please retain this receipt for your tax records.
                    </p>
                    <p style="color: #047857; font-size: 12px; margin: 8px 0 0 0;">
                      <strong>EIN:</strong> XX-XXXXXXX
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Impact section -->
          <tr>
            <td style="padding: 0 30px 30px;">
              <h2 style="color: #1f2937; font-size: 18px; margin: 0 0 16px 0; font-weight: 600;">Your Impact</h2>
              <p style="color: #6b7280; font-size: 14px; line-height: 1.6; margin: 0 0 16px 0;">
                Your generous gift helps us accomplish incredible things for God's Kingdom:
              </p>
              <table role="presentation" style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 12px; background-color: #fef3f2; border-radius: 8px; text-align: center; width: 33%;">
                    <p style="font-size: 24px; margin: 0 0 8px 0;">&#127758;</p>
                    <p style="color: #991b1b; font-size: 12px; margin: 0; font-weight: 600;">Reach 150+ Countries</p>
                  </td>
                  <td style="width: 8px;"></td>
                  <td style="padding: 12px; background-color: #eff6ff; border-radius: 8px; text-align: center; width: 33%;">
                    <p style="font-size: 24px; margin: 0 0 8px 0;">&#128218;</p>
                    <p style="color: #1e40af; font-size: 12px; margin: 0; font-weight: 600;">50+ Bible Versions</p>
                  </td>
                  <td style="width: 8px;"></td>
                  <td style="padding: 12px; background-color: #f0fdf4; border-radius: 8px; text-align: center; width: 33%;">
                    <p style="font-size: 24px; margin: 0 0 8px 0;">&#128101;</p>
                    <p style="color: #166534; font-size: 12px; margin: 0; font-weight: 600;">1M+ Lives Touched</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Scripture quote -->
          <tr>
            <td style="padding: 0 30px 30px;">
              <table role="presentation" style="width: 100%; border-collapse: collapse; background: linear-gradient(135deg, #fdf4ff 0%, #fae8ff 100%); border-radius: 12px; border-left: 4px solid #a855f7;">
                <tr>
                  <td style="padding: 20px;">
                    <p style="color: #7c3aed; font-size: 16px; font-style: italic; line-height: 1.6; margin: 0 0 8px 0;">
                      "Each of you should give what you have decided in your heart to give, not reluctantly or under compulsion, for God loves a cheerful giver."
                    </p>
                    <p style="color: #9333ea; font-size: 14px; margin: 0; font-weight: 600;">— 2 Corinthians 9:7</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Share section -->
          <tr>
            <td style="padding: 0 30px 30px;">
              <h2 style="color: #1f2937; font-size: 18px; margin: 0 0 16px 0; font-weight: 600; text-align: center;">Share Your Support</h2>
              <p style="color: #6b7280; font-size: 14px; text-align: center; margin: 0 0 16px 0;">
                Inspire others to support our mission by sharing on social media
              </p>
              <table role="presentation" style="margin: 0 auto; border-collapse: collapse;">
                <tr>
                  <td style="padding: 0 8px;">
                    <a href="https://www.facebook.com/sharer/sharer.php?u=${shareUrl}&quote=${shareText}" style="display: inline-block; padding: 12px 20px; background-color: #1877f2; color: #ffffff; text-decoration: none; border-radius: 8px; font-size: 14px; font-weight: 600;">
                      Facebook
                    </a>
                  </td>
                  <td style="padding: 0 8px;">
                    <a href="https://twitter.com/intent/tweet?text=${shareText}&url=${shareUrl}" style="display: inline-block; padding: 12px 20px; background-color: #1da1f2; color: #ffffff; text-decoration: none; border-radius: 8px; font-size: 14px; font-weight: 600;">
                      Twitter
                    </a>
                  </td>
                  <td style="padding: 0 8px;">
                    <a href="https://www.linkedin.com/shareArticle?mini=true&url=${shareUrl}&title=${shareText}" style="display: inline-block; padding: 12px 20px; background-color: #0a66c2; color: #ffffff; text-decoration: none; border-radius: 8px; font-size: 14px; font-weight: 600;">
                      LinkedIn
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #f9fafb; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="color: #6b7280; font-size: 14px; margin: 0 0 8px 0;">
                <strong>Divine Word Bible</strong>
              </p>
              <p style="color: #9ca3af; font-size: 12px; margin: 0 0 16px 0;">
                Spreading God's Word to the World
              </p>
              <p style="color: #9ca3af; font-size: 12px; margin: 0;">
                Questions about your donation? Contact us at<br />
                <a href="mailto:support@sonoftheonegroup.com" style="color: #f43f5e; text-decoration: none;">support@sonoftheonegroup.com</a>
              </p>
              <p style="color: #d1d5db; font-size: 11px; margin: 16px 0 0 0;">
                &copy; ${new Date().getFullYear()} Divine Word Bible. All rights reserved.
              </p>
            </td>
          </tr>
          
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;
}

// Generate plain text version
function generateEmailText(data: {
  donorName: string;
  amount: number;
  currency: string;
  date: string;
  receiptNumber: string;
  donationType: string;
}) {
  const formattedAmount = (data.amount / 100).toFixed(2);
  const formattedDate = new Date(data.date).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  
  return `
DIVINE WORD BIBLE - DONATION RECEIPT
=====================================

Thank You for Your Gift!

Dear ${data.donorName},

We are deeply grateful for your generous ${data.donationType === 'recurring' ? 'monthly ' : ''}donation to Divine Word Bible. Your support is a blessing that helps us continue our mission of spreading God's word to people around the world.

DONATION DETAILS
----------------
Amount: $${formattedAmount} ${data.currency.toUpperCase()}
Receipt Number: ${data.receiptNumber}
Date: ${formattedDate}
Type: ${data.donationType === 'recurring' ? 'Monthly Recurring' : 'One-Time Gift'}
Payment Method: Credit/Debit Card

TAX-DEDUCTIBLE DONATION
-----------------------
Divine Word Bible is a registered 501(c)(3) nonprofit organization. This donation may be tax-deductible to the extent allowed by law. No goods or services were provided in exchange for this contribution. Please retain this receipt for your tax records.

EIN: XX-XXXXXXX

YOUR IMPACT
-----------
Your generous gift helps us:
- Reach 150+ countries with God's word
- Provide 50+ Bible versions in multiple languages
- Touch over 1 million lives worldwide

"Each of you should give what you have decided in your heart to give, not reluctantly or under compulsion, for God loves a cheerful giver."
- 2 Corinthians 9:7

---

Questions about your donation?
Contact us at support@sonoftheonegroup.com

(c) ${new Date().getFullYear()} Divine Word Bible. All rights reserved.
`;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { donationId, email, name, amount, currency, donationType, message } = await req.json();
    
    // Get Resend API key from environment
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    if (!resendApiKey) {
      console.error("RESEND_API_KEY environment variable not set");
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Email service not configured. Please add RESEND_API_KEY to your environment variables.',
        emailSent: false
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // If donationId is provided, fetch donation details from database
    let donationData;
    if (donationId) {
      const { data: donation, error: fetchError } = await supabase
        .from('donations')
        .select('*')
        .eq('id', donationId)
        .single();
      
      if (fetchError || !donation) {
        console.error('Donation not found:', fetchError);
        throw new Error('Donation not found');
      }
      
      donationData = {
        email: donation.email,
        name: donation.name || 'Generous Donor',
        amount: donation.amount,
        currency: donation.currency || 'usd',
        donationType: donation.donation_type || 'one_time',
        message: donation.message,
        date: donation.completed_at || donation.created_at,
        donationId: donation.id
      };
    } else {
      // Use provided data
      if (!email) {
        return new Response(JSON.stringify({ 
          success: false, 
          message: 'No email provided - receipt not sent',
          emailSent: false
        }), {
          headers: { 'Content-Type': 'application/json', ...corsHeaders }
        });
      }
      
      donationData = {
        email,
        name: name || 'Generous Donor',
        amount: amount || 0,
        currency: currency || 'usd',
        donationType: donationType || 'one_time',
        message,
        date: new Date().toISOString(),
        donationId: null
      };
    }

    // Check if email exists
    if (!donationData.email) {
      return new Response(JSON.stringify({ 
        success: false, 
        message: 'No email address - receipt not sent',
        emailSent: false
      }), {
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }

    // Generate receipt number
    const receiptNumber = 'DWB-' + new Date().toISOString().slice(0, 10).replace(/-/g, '') + '-' + Math.random().toString(36).substring(2, 7).toUpperCase();

    // Generate email content
    const emailHTML = generateEmailHTML({
      donorName: donationData.name,
      donorEmail: donationData.email,
      amount: donationData.amount,
      currency: donationData.currency,
      date: donationData.date,
      receiptNumber,
      message: donationData.message,
      donationType: donationData.donationType
    });

    const emailText = generateEmailText({
      donorName: donationData.name,
      amount: donationData.amount,
      currency: donationData.currency,
      date: donationData.date,
      receiptNumber,
      donationType: donationData.donationType
    });

    console.log(`Sending donation receipt to ${donationData.email} for $${(donationData.amount / 100).toFixed(2)}`);

    // Send email via Resend API with retry logic
    const emailResult = await sendEmailWithRetry(resendApiKey, {
      from: 'Sons of the One <receipts@sonoftheonegroup.com>',
      to: [donationData.email],
      subject: `Thank You for Your Donation - Receipt #${receiptNumber}`,
      html: emailHTML,
      text: emailText,
      replyTo: 'support@sonoftheonegroup.com'
    });

    // Update donation record with receipt info
    if (donationData.donationId) {
      const updateResult = await supabase
        .from('donations')
        .update({
          email_receipt_sent: emailResult.success,
          email_receipt_sent_at: emailResult.success ? new Date().toISOString() : null,
          receipt_number: receiptNumber,
          email_send_error: emailResult.error || null,
          email_send_attempts: 1
        })
        .eq('id', donationData.donationId);
      
      if (updateResult.error) {
        console.error('Error updating donation record:', updateResult.error);
      }
    }

    if (emailResult.success) {
      return new Response(JSON.stringify({
        success: true,
        emailSent: true,
        receiptNumber,
        emailId: emailResult.data?.id,
        message: `Receipt sent successfully to ${donationData.email}`
      }), {
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    } else {
      // Email failed after all retries
      console.error('Failed to send email after all retries:', emailResult.error);
      return new Response(JSON.stringify({
        success: false,
        emailSent: false,
        receiptNumber,
        error: emailResult.error,
        message: `Failed to send receipt email: ${emailResult.error}`,
        // Include HTML so frontend can offer alternative (download/print)
        emailHTML,
        emailText
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }

  } catch (error) {
    console.error('Error in send-donation-receipt:', error);
    return new Response(JSON.stringify({ 
      success: false,
      emailSent: false,
      error: error.message 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  }
});

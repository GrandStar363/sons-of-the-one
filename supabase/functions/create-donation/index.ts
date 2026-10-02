
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

import { stripeFetch } from '../_shared/stripe.ts';

export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
};

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

// Function to trigger email receipt
async function sendDonationReceipt(donationId: string, supabaseUrl: string) {
  try {
    const response = await fetch(`${supabaseUrl}/functions/v1/send-donation-receipt`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`
      },
      body: JSON.stringify({ donationId })
    });
    const result = await response.json();
    console.log('Email receipt result:', result);
    return result;
  } catch (err) {
    console.error('Error sending receipt:', err);
    return { error: err.message };
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { amount, email, name, message, showOnWall, action, paymentIntentId, donationId, sendReceipt } = await req.json();

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Mark donation as completed
    if (action === 'complete') {
      if (!donationId && !paymentIntentId) {
        throw new Error("Donation ID or Payment Intent ID is required");
      }

      // Get the donation first to have the ID
      let donation;
      if (donationId) {
        const { data } = await supabase
          .from('donations')
          .select('*')
          .eq('id', donationId)
          .single();
        donation = data;
      } else {
        const { data } = await supabase
          .from('donations')
          .select('*')
          .eq('stripe_payment_intent_id', paymentIntentId)
          .single();
        donation = data;
      }

      const updateQuery = donationId 
        ? supabase.from('donations').update({ status: 'completed', completed_at: new Date().toISOString() }).eq('id', donationId)
        : supabase.from('donations').update({ status: 'completed', completed_at: new Date().toISOString() }).eq('stripe_payment_intent_id', paymentIntentId);

      const { error: updateError } = await updateQuery;
      if (updateError) throw updateError;

      // Send email receipt automatically if email exists
      let receiptResult = null;
      if (donation?.email && (sendReceipt !== false)) {
        receiptResult = await sendDonationReceipt(donation.id, supabaseUrl);
      }

      return new Response(JSON.stringify({ 
        success: true,
        receiptSent: receiptResult?.emailSent || false,
        receiptNumber: receiptResult?.receiptNumber || null
      }), {
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }

    // Create new donation
    if (!amount || amount < 100) {
      throw new Error("Minimum donation is $1.00");
    }

    // Create a PaymentIntent for the donation
    const response = await stripeFetch('https://stripe.gateway.fastrouter.io/payments/payment-intents', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'},
      body: JSON.stringify({
        amount,
        currency: 'usd',
        metadata: {
          type: 'donation',
          product: 'donation_of_growth',
          donor_email: email || 'anonymous',
          donor_name: name || 'Anonymous Donor',
          message: message || '',
          show_on_wall: showOnWall ? 'true' : 'false',
          app: 'divine_word_bible'
        },
        description: `Donation of Growth - Divine Word Bible App`
      })
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Failed to create payment intent');
    }

    // Save donation to database
    const { data: donation, error: dbError } = await supabase
      .from('donations')
      .insert({
        email: email || null,
        name: name || 'Anonymous Donor',
        amount,
        currency: 'usd',
        stripe_payment_intent_id: data.id,
        status: 'pending',
        donation_type: 'one_time',
        message: message || null,
        show_on_wall: showOnWall || false
      })
      .select()
      .single();

    if (dbError) {
      console.error('Error saving donation to database:', dbError);
    }
    
    return new Response(JSON.stringify({
      clientSecret: data.clientSecret,
      paymentIntentId: data.id,
      amount: data.amount,
      donationId: donation?.id
    }), {
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  }
});

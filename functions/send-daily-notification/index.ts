
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
};

// Daily verses collection
const dailyVerses = [
  { reference: "Romans 8:14", text: "For those who are led by the Spirit of God are the children of God." },
  { reference: "Galatians 4:6", text: "Because you are his sons, God sent the Spirit of his Son into our hearts, the Spirit who calls out, 'Abba, Father.'" },
  { reference: "1 John 3:1", text: "See what great love the Father has lavished on us, that we should be called children of God! And that is what we are!" },
  { reference: "Romans 8:17", text: "Now if we are children, then we are heirs—heirs of God and co-heirs with Christ." },
  { reference: "John 1:12", text: "Yet to all who did receive him, to those who believed in his name, he gave the right to become children of God." },
  { reference: "Ephesians 1:5", text: "He predestined us for adoption to sonship through Jesus Christ, in accordance with his pleasure and will." },
  { reference: "2 Corinthians 6:18", text: "'I will be a Father to you, and you will be my sons and daughters,' says the Lord Almighty." },
  { reference: "Hebrews 2:10", text: "In bringing many sons and daughters to glory, it was fitting that God should make the pioneer of their salvation perfect through what he suffered." },
  { reference: "Romans 8:29", text: "For those God foreknew he also predestined to be conformed to the image of his Son, that he might be the firstborn among many brothers and sisters." },
  { reference: "Galatians 3:26", text: "So in Christ Jesus you are all children of God through faith." }
];

// WWJD scenarios
const wwjdScenarios = [
  {
    title: "When Someone Wrongs You",
    scenario: "A coworker takes credit for your work in front of your boss.",
    guidance: "Jesus taught us to forgive and not seek revenge. Consider speaking privately with your coworker about the situation with grace.",
    verse: "Matthew 5:44"
  },
  {
    title: "When Facing Financial Pressure",
    scenario: "You're tempted to cut corners on your taxes to save money.",
    guidance: "Jesus calls us to be honest in all our dealings. Trust God to provide while maintaining integrity.",
    verse: "Matthew 22:21"
  },
  {
    title: "When Gossip Arises",
    scenario: "Friends are sharing juicy gossip about someone you know.",
    guidance: "Jesus would speak words of life, not death. Choose to redirect the conversation or speak well of the person.",
    verse: "Ephesians 4:29"
  },
  {
    title: "When Helping the Needy",
    scenario: "You see a homeless person asking for help on your way to work.",
    guidance: "Jesus saw every person as valuable. Consider how you can show compassion, whether through giving, conversation, or prayer.",
    verse: "Matthew 25:40"
  },
  {
    title: "When Facing Conflict",
    scenario: "A family member has said something hurtful and you want to respond in anger.",
    guidance: "Jesus was slow to anger and quick to love. Take time to cool down before responding with grace and truth.",
    verse: "James 1:19-20"
  }
];

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { action, email, preferences } = await req.json();

    // Get today's verse and WWJD
    const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24));
    const todayVerse = dailyVerses[dayOfYear % dailyVerses.length];
    const todayWWJD = wwjdScenarios[dayOfYear % wwjdScenarios.length];

    if (action === 'get-daily-content') {
      return new Response(JSON.stringify({
        success: true,
        verse: todayVerse,
        wwjd: todayWWJD
      }), {
        headers: { "Content-Type": "application/json", ...corsHeaders }
      });
    }

    if (action === 'test-notification') {
      // For testing, return what would be sent
      const content = {
        subject: "🙏 Your Daily Verse & WWJD - Sons of God",
        verse: preferences?.include_daily_verse !== false ? todayVerse : null,
        wwjd: preferences?.include_wwjd !== false ? todayWWJD : null,
        email: email
      };

      return new Response(JSON.stringify({
        success: true,
        message: "Test notification content generated",
        content
      }), {
        headers: { "Content-Type": "application/json", ...corsHeaders }
      });
    }

    if (action === 'send-notification') {
      // Build email content
      let emailBody = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Georgia, serif; background-color: #f5f0e6; color: #3d4a4a; padding: 20px; }
    .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 16px; padding: 32px; }
    .header { text-align: center; margin-bottom: 24px; }
    .header h1 { color: #7c9a7a; font-size: 24px; margin: 0; }
    .tagline { color: #c9a227; font-style: italic; font-weight: bold; }
    .section { margin: 24px 0; padding: 20px; background: #f5f0e6; border-radius: 12px; }
    .section h2 { color: #7c9a7a; font-size: 18px; margin-top: 0; }
    .verse-text { font-size: 18px; font-style: italic; color: #3d4a4a; line-height: 1.6; }
    .reference { color: #7c9a7a; font-weight: bold; margin-top: 12px; }
    .wwjd-scenario { background: #6b9a9a; color: white; padding: 16px; border-radius: 8px; margin: 12px 0; }
    .guidance { background: #9cb59c; color: #3d4a4a; padding: 16px; border-radius: 8px; }
    .footer { text-align: center; margin-top: 24px; color: #5c4f42; font-size: 14px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Sons of God</h1>
      <p class="tagline">"One 'Son' of many..." WE ARE "Sons' of The One" "God Almighty!!!"</p>
    </div>
`;

      if (preferences?.include_daily_verse !== false && todayVerse) {
        emailBody += `
    <div class="section">
      <h2>📖 Today's Verse</h2>
      <p class="verse-text">"${todayVerse.text}"</p>
      <p class="reference">— ${todayVerse.reference}</p>
    </div>
`;
      }

      if (preferences?.include_wwjd !== false && todayWWJD) {
        emailBody += `
    <div class="section">
      <h2>🤔 What Would Jesus Do?</h2>
      <h3>${todayWWJD.title}</h3>
      <div class="wwjd-scenario">
        <strong>Scenario:</strong> ${todayWWJD.scenario}
      </div>
      <div class="guidance">
        <strong>Guidance:</strong> ${todayWWJD.guidance}
        <p class="reference">— ${todayWWJD.verse}</p>
      </div>
    </div>
`;
      }

      emailBody += `
    <div class="footer">
      <p>May God bless your day with His presence and peace.</p>
      <p><a href="https://sonsofgod.app">Visit Sons of God</a></p>
    </div>
  </div>
</body>
</html>
`;

      // In production, this would integrate with an email service
      // For now, return success with the generated content
      return new Response(JSON.stringify({
        success: true,
        message: "Notification prepared",
        emailContent: emailBody,
        recipientEmail: email
      }), {
        headers: { "Content-Type": "application/json", ...corsHeaders }
      });
    }

    return new Response(JSON.stringify({
      success: false,
      error: "Invalid action"
    }), {
      status: 400,
      headers: { "Content-Type": "application/json", ...corsHeaders }
    });

  } catch (error) {
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders }
    });
  }
});

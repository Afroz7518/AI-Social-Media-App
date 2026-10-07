import OpenAI from 'openai';

const getOpenAIClient = () => {
  if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'sk-your-openai-api-key-here') {
    return null;
  }
  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
};

// Fallback demo content generator
const generateDemoContent = (platform, topic, tone, contentType) => {
  const toneEmojis = {
    professional: '💼',
    casual: '😊',
    humorous: '😂',
    inspirational: '✨',
    educational: '📚',
    promotional: '🚀'
  };

  const platformLimits = {
    instagram: 2200,
    facebook: 63206,
    linkedin: 3000,
    x: 280
  };

  const emoji = toneEmojis[tone] || '📝';
  const limit = platformLimits[platform] || 2200;

  const captions = {
    professional: `${emoji} Elevating the conversation around ${topic}.\n\nIn today's rapidly evolving landscape, understanding ${topic} isn't just an advantage—it's a necessity. Here's what industry leaders are saying and why you should pay attention.\n\nKey takeaways:\n→ Stay ahead of trends\n→ Leverage data-driven insights\n→ Build meaningful connections\n\nWhat's your perspective on ${topic}? Share your thoughts below. 👇`,
    casual: `${emoji} Let's talk about ${topic}!\n\nHonestly? This has been on my mind lately and I think we all need to have this conversation. Whether you're just getting started or you've been in the game for a while, there's always something new to learn.\n\nDrop a 🔥 if you agree!`,
    humorous: `${emoji} POV: You just discovered ${topic} and now you can't stop talking about it at dinner parties.\n\nBut seriously though... ${topic} is kind of a big deal right now and here's why you should care (even if your cat doesn't). 🐱\n\nTag someone who needs to see this! 😄`,
    inspirational: `${emoji} Every great journey begins with a single step.\n\nWhen I first explored ${topic}, I had no idea it would transform my perspective entirely. The truth is, growth happens outside your comfort zone.\n\n"The only limit to our realization of tomorrow is our doubts of today." — FDR\n\nWhat's one thing about ${topic} that inspires you? ✨`,
    educational: `${emoji} Let's break down ${topic} — everything you need to know.\n\n📌 What it is: A comprehensive overview\n📌 Why it matters: The real-world impact\n📌 How to get started: Actionable steps\n📌 Common mistakes: What to avoid\n📌 Resources: Where to learn more\n\nSave this post for later! 🔖`,
    promotional: `${emoji} Exciting news! We're revolutionizing ${topic}.\n\nOur latest solution helps you:\n✅ Save 10+ hours per week\n✅ Increase engagement by 3x\n✅ Streamline your entire workflow\n\n🎉 Limited time offer: Get 30% off when you join today!\n\nLink in bio → Don't miss out! 🔗`
  };

  const hashtagSets = {
    instagram: [`#${topic.replace(/\s+/g, '')}`, '#socialmedia', '#digitalmarketing', '#contentcreator', '#growthmindset', '#trending', '#instagood', '#business', '#entrepreneur', '#motivation', `#${tone}vibes`],
    facebook: [`#${topic.replace(/\s+/g, '')}`, '#socialmedia', '#business', '#marketing', '#community'],
    linkedin: [`#${topic.replace(/\s+/g, '')}`, '#leadership', '#innovation', '#business', '#professional', '#networking', '#industry'],
    x: [`#${topic.replace(/\s+/g, '')}`, '#trending', '#tech', '#business']
  };

  const suggestions = [
    `Create a carousel post breaking down 5 key aspects of ${topic}`,
    `Share a behind-the-scenes story related to ${topic}`,
    `Post a poll asking your audience about their experience with ${topic}`,
    `Create a short video tutorial about ${topic}`,
    `Share user-generated content or testimonials about ${topic}`,
    `Write a thread (${platform === 'x' ? 'tweet' : 'post'} series) deep-diving into ${topic}`
  ];

  const caption = captions[tone] || captions.professional;

  return {
    caption: caption.substring(0, limit),
    hashtags: hashtagSets[platform] || hashtagSets.instagram,
    suggestions: suggestions.slice(0, 4),
    platform,
    tone,
    topic,
    contentType,
    characterCount: caption.length,
    characterLimit: limit
  };
};

export const generateContent = async ({ platform, topic, tone, contentType }) => {
  const openai = getOpenAIClient();

  // If no valid API key, use demo content
  if (!openai) {
    return generateDemoContent(platform, topic, tone, contentType);
  }

  try {
    const prompt = `You are an expert social media content strategist. Generate optimized content for ${platform}.

Topic: ${topic}
Tone: ${tone}
Content Type: ${contentType}
Platform: ${platform}

Generate a JSON response with:
1. "caption": An engaging ${tone} caption optimized for ${platform} (respect character limits: Instagram 2200, Facebook 63206, LinkedIn 3000, X 280)
2. "hashtags": An array of 5-10 relevant hashtags (include #)
3. "suggestions": An array of 4 content ideas/suggestions related to this topic for ${platform}

Respond ONLY with valid JSON.`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.8,
      max_tokens: 1000,
      response_format: { type: 'json_object' }
    });

    const result = JSON.parse(completion.choices[0].message.content);

    return {
      ...result,
      platform,
      tone,
      topic,
      contentType,
      characterCount: result.caption?.length || 0,
      characterLimit: { instagram: 2200, facebook: 63206, linkedin: 3000, x: 280 }[platform] || 2200
    };
  } catch (error) {
    console.error('OpenAI API error, falling back to demo:', error.message);
    return generateDemoContent(platform, topic, tone, contentType);
  }
};

import dotenv from "dotenv";
import fetch from "node-fetch";
import { fetchAllApiData } from "./fetchApis.js";
import apiCache from "./utils/cache.js";

dotenv.config();
const currentDate = new Date().toLocaleDateString();
async function sendNewsletter(content) {
  const maxRetries = 3;
  const retryDelay = 2000; // 2 seconds

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`📧 Sending newsletter attempt ${attempt}/${maxRetries}...`);
      
      const response = await fetch("https://nine1mail.onrender.com/api/send-newsletter-all", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          subject: `What's Trending in AI: ${currentDate}`,
          content: content
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(`Mail server responded with status ${response.status}: ${data.error || 'Unknown error'}`);
      }

      console.log(`✅ Newsletter sent successfully on attempt ${attempt}`);
      return {
        attempt,
        status: 'success',
        ...data
      };

    } catch (error) {
      console.error(`❌ Attempt ${attempt} failed:`, error.message);
      
      if (attempt === maxRetries) {
        console.error('❌ All retry attempts failed');
        throw new Error(`Failed to send newsletter after ${maxRetries} attempts: ${error.message}`);
      }

      console.log(`⏳ Waiting ${retryDelay/1000} seconds before retry...`);
      await new Promise(resolve => setTimeout(resolve, retryDelay));
    }
  }
}

async function summarizeText(inputText) {
  // Create a cache key based on the input text
  const cacheKey = `summary_${Buffer.from(inputText).toString('base64').substring(0, 40)}`;
  
  // Get current date formatted
  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  // Check if we have a cached response
  const cachedSummary = apiCache.get(cacheKey);
  if (cachedSummary) {
    console.log("📦 Using cached summary (valid for 10 minutes)");
    
    // If we have a cached HTML email, return it directly
    if (cachedSummary.htmlEmail) {
      return cachedSummary.htmlEmail;
    }
    
    // If we only have the summary text, regenerate the HTML email
    if (cachedSummary.summary) {
      const htmlEmail = generateEmailTemplate(cachedSummary.summary, currentDate);
      return htmlEmail;
    }
  }

  console.log("🔄 No valid cache found, calling API...");
  const response = await fetch(
    "https://openrouter.ai/api/v1/chat/completions",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.DEEPSEEK_API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://yourdomain.com",
        "X-Title": "AI Discovery Agent",
      },
      body: JSON.stringify({
        model: "meta-llama/llama-4-scout:free",
        messages: [
          {
            role: "system",
            content:
              "You are an AI newsletter expert. Create a professional, visually appealing HTML email newsletter about AI trends and discoveries. Format your response as COMPLETE, VALID HTML. Include all necessary HTML structure (<html>, <head>, <body>) and style with inline CSS. Use appropriate semantic HTML elements like <header>, <section>, <article>, <h1> through <h6>, <p>, <ul>, <li>, <a>, <strong>, <em>, etc. NO MARKDOWN allowed - pure HTML only. The newsletter should have a clean, modern layout with proper spacing and visual hierarchy.",
          },
          {
            role: "user",
            content: `Create an AI newsletter for ${currentDate} "AI Discovery Digest". 

Your response must be FULLY FORMATTED HTML, not markdown. Follow this structure:
1. A styled header with the newsletter title and date
2. An introduction paragraph
3. Structured sections for different types of AI news (using appropriate HTML sectioning elements)
4. Proper links with <a href="..."> tags
5. A styled footer with copyright and unsubscribe link

Use the following data to create the content:
What's Trending in the Lateest AI Space, Oprganisee in Sections use like(top 3/5/10)
${inputText}`,
          },
        ],
      }),
    }
  );

  const data = await response.json();

  if (data?.choices?.[0]?.message?.content) {
    let summary = data.choices[0].message.content;
    
    if (!summary.includes('<') || !summary.includes('>')) {
      console.log("⚠️ The AI generated non-HTML content. Converting to basic HTML...");
      summary = summary
        .replace(/^#{1,6}\s+(.+)$/gm, '<h3>$1</h3>')
        .replace(/^\*\s+(.+)$/gm, '<li>$1</li>')
        .replace(/^\d+\.\s+(.+)$/gm, '<li>$1</li>')
        .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>')
        .split('\n\n').map(p => `<p>${p}</p>`).join('');
    }
    
    const htmlEmail = generateEmailTemplate(summary, currentDate);

    // Cache both the summary and the complete HTML email
    apiCache.set(cacheKey, { summary, htmlEmail });
    
    console.log("📧 Newsletter generated successfully!");
    return htmlEmail;
    
  } else {
    console.error("❌ DeepSeek Error:", data);
    throw new Error("Failed to generate newsletter content");
  }
}

// Helper function to generate the email HTML template
function generateEmailTemplate(summary, currentDate) {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>AI Discovery Digest</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    .header {
      background-color: #4F46E5;
      color: white;
      padding: 20px;
      text-align: center;
      border-radius: 5px 5px 0 0;
    }
    .content {
      padding: 20px;
      background-color: #f9f9f9;
      border-left: 1px solid #ddd;
      border-right: 1px solid #ddd;
    }
    .footer {
      text-align: center;
      padding: 15px;
      font-size: 12px;
      color: #666;
      background-color: #eee;
      border-radius: 0 0 5px 5px;
    }
    h1 {
      color: #fff;
      margin: 0;
      font-size: 24px;
    }
    h2 {
      color: #4F46E5;
      margin-top: 25px;
      font-size: 20px;
      border-bottom: 1px solid #eee;
      padding-bottom: 10px;
    }
    .date {
      font-style: italic;
      color: #fff;
      margin-top: 5px;
    }
    .intro {
      font-size: 16px;
      margin-bottom: 20px;
    }
    .divider {
      border-top: 1px solid #ddd;
      margin: 20px 0;
    }
    .summary {
      background-color: white;
      padding: 15px;
      border-radius: 5px;
      border-left: 4px solid #4F46E5;
      margin-top: 15px;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>AI Discovery Digest</h1>
    <p class="date">${currentDate}</p>
  </div>
  
  <div class="content">
    <p class="intro">Dear Reader,</p>
    <p>In a world of constant AI evolution, it's easy to miss the tools and breakthroughs that matter. Here's your curated digest of what's most important right now.</p>
    
    <div class="summary">
      ${summary}
    </div>
  </div>
  
  <div class="footer">
    <p>© ${new Date().getFullYear()} AI Discovery Digest • <a href="#">Unsubscribe</a></p>
  </div>
</body>
</html>
`;
}

async function main() {
  console.log("📥 Fetching data from APIs...");
  const apiData = await fetchAllApiData();

  const combinedText = apiData
    .map(
      (item, index) =>
        `(${index + 1}) [${item.source}] ${item.title}: ${item.description}`
    )
    .join("\n");

  console.log("🧠 Generating summary...");
  const newsletterContent = await summarizeText(combinedText);
  return newsletterContent;
}

export { main, sendNewsletter };

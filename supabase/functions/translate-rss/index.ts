import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Sample health news data with images
const healthNews = [
  {
    title: "New Study Reveals Benefits of Mediterranean Diet for Heart Health",
    description: "Research confirms that following a Mediterranean diet can significantly reduce the risk of cardiovascular disease and improve overall heart health.",
    link: "https://www.healthnews.today/mediterranean-diet",
    pubDate: new Date().toISOString(),
    image: "https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=800&q=80",
  },
  {
    title: "Exercise and Mental Health: The Connection Scientists Are Exploring",
    description: "Regular physical activity has been shown to reduce symptoms of anxiety and depression, with researchers now understanding the biological mechanisms behind this connection.",
    link: "https://www.healthnews.today/exercise-mental-health",
    pubDate: new Date().toISOString(),
    image: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=800&q=80",
  },
  {
    title: "Sleep Quality More Important Than Duration, New Research Suggests",
    description: "A comprehensive study indicates that the quality of sleep may be more crucial for health outcomes than the total hours spent sleeping.",
    link: "https://www.healthnews.today/sleep-quality",
    pubDate: new Date().toISOString(),
    image: "https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?w=800&q=80",
  },
  {
    title: "Vitamin D Deficiency Linked to Increased Health Risks",
    description: "Healthcare professionals are emphasizing the importance of adequate vitamin D levels, as deficiency has been associated with various health conditions.",
    link: "https://www.healthnews.today/vitamin-d",
    pubDate: new Date().toISOString(),
    image: "https://images.unsplash.com/photo-1559757175-5700dde675bc?w=800&q=80",
  },
  {
    title: "Mindfulness Meditation Shows Promise for Chronic Pain Management",
    description: "Clinical trials demonstrate that mindfulness-based interventions can help patients manage chronic pain and reduce reliance on medication.",
    link: "https://www.healthnews.today/mindfulness-pain",
    pubDate: new Date().toISOString(),
    image: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800&q=80",
  },
];

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // RSS feed is public content - no authentication required
    console.log('RSS translation requested');

    const { targetLanguage } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // If target language is English, return news as-is
    if (targetLanguage === "en") {
      return new Response(JSON.stringify({ news: healthNews }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Translate news to target language
    const translationPrompt = `Translate the following health news items to ${targetLanguage}. Return ONLY a valid JSON array with the translated items, keeping the same structure (title, description, link, pubDate). Do not include any markdown formatting or code blocks, just the raw JSON array.

News items:
${JSON.stringify(healthNews, null, 2)}`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: "You are a professional translator. Translate content accurately while maintaining the original meaning and tone. Always respond with valid JSON only, no markdown formatting.",
          },
          { role: "user", content: translationPrompt },
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded", news: healthNews }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Payment required", news: healthNews }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      console.error("AI gateway error:", response.status);
      return new Response(JSON.stringify({ news: healthNews }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const aiResponse = await response.json();
    const translatedContent = aiResponse.choices?.[0]?.message?.content;

    if (translatedContent) {
      try {
        // Clean up the response - remove markdown code blocks if present
        let cleanedContent = translatedContent.trim();
        if (cleanedContent.startsWith("```json")) {
          cleanedContent = cleanedContent.slice(7);
        }
        if (cleanedContent.startsWith("```")) {
          cleanedContent = cleanedContent.slice(3);
        }
        if (cleanedContent.endsWith("```")) {
          cleanedContent = cleanedContent.slice(0, -3);
        }
        cleanedContent = cleanedContent.trim();

        const translatedNews = JSON.parse(cleanedContent);
        return new Response(JSON.stringify({ news: translatedNews }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      } catch (parseError) {
        console.error("Failed to parse translated content:", parseError);
        return new Response(JSON.stringify({ news: healthNews }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    return new Response(JSON.stringify({ news: healthNews }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("translate-rss error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: errorMessage, news: healthNews }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

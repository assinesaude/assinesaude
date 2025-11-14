import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY")!;
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

interface ChatRequest {
  message: string;
  conversationHistory?: Array<{ role: string; content: string }>;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("No authorization header");
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !user) {
      throw new Error("Unauthorized");
    }

    const { message, conversationHistory = [] }: ChatRequest = await req.json();

    if (!message || message.trim().length === 0) {
      throw new Error("Message is required");
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("user_type, full_name")
      .eq("id", user.id)
      .maybeSingle();

    const systemPrompt = getSystemPrompt(profile?.user_type || "patient");

    const contents = [
      {
        role: "user",
        parts: [{ text: systemPrompt }],
      },
      ...conversationHistory.slice(-10).map((msg) => ({
        role: msg.role === "user" ? "user" : "model",
        parts: [{ text: msg.content }],
      })),
      {
        role: "user",
        parts: [{ text: message }],
      },
    ];

    const geminiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: contents,
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 1024,
          },
          safetySettings: [
            {
              category: "HARM_CATEGORY_HARASSMENT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE",
            },
            {
              category: "HARM_CATEGORY_HATE_SPEECH",
              threshold: "BLOCK_MEDIUM_AND_ABOVE",
            },
            {
              category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE",
            },
            {
              category: "HARM_CATEGORY_DANGEROUS_CONTENT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE",
            },
          ],
        }),
      }
    );

    if (!geminiResponse.ok) {
      const errorText = await geminiResponse.text();
      console.error("Gemini API error:", errorText);
      throw new Error(`Gemini API error: ${geminiResponse.status}`);
    }

    const geminiData = await geminiResponse.json();
    
    if (!geminiData.candidates || geminiData.candidates.length === 0) {
      throw new Error("No response from Gemini");
    }

    const aiResponse = geminiData.candidates[0].content.parts[0].text;
    const tokensUsed = geminiData.usageMetadata?.totalTokenCount || 0;

    await supabase.from("ai_conversations").insert({
      user_id: user.id,
      message: message,
      response: aiResponse,
      context: {
        user_type: profile?.user_type,
        user_name: profile?.full_name,
      },
      tokens_used: tokensUsed,
    });

    return new Response(
      JSON.stringify({
        success: true,
        response: aiResponse,
        tokensUsed: tokensUsed,
      }),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("Error in gemini-chat:", error);
    return new Response(
      JSON.stringify({
        error: error.message || "Internal server error",
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  }
});

function getSystemPrompt(userType: string): string {
  const basePrompt = `Você é Tervis.ai, um assistente de saúde inteligente e amigável desenvolvido para ajudar brasileiros com informações sobre saúde e bem-estar. 

IMPORTANTE: Você NÃO substitui consultas médicas profissionais. Sempre recomende que usuários busquem profissionais de saúde para diagnósticos e tratamentos.

Suas diretrizes:
- Seja empático, claro e use linguagem acessível em português brasileiro
- Forneça informações baseadas em evidências científicas
- Nunca faça diagnósticos ou prescreva tratamentos
- Incentive hábitos saudáveis e prevenção
- Se a pergunta for sobre algo grave ou urgente, oriente a buscar atendimento médico imediato
- Seja honesto sobre suas limitações`;

  if (userType === "professional") {
    return `${basePrompt}\n\nVocê está conversando com um PROFISSIONAL DE SAÚDE. Pode usar terminologia mais técnica e fornecer informações mais aprofundadas, mas sempre mantendo o tom profissional e baseado em evidências.`;
  }

  return `${basePrompt}\n\nVocê está conversando com um PACIENTE. Use linguagem simples e acessível, evite jargões médicos complexos e seja especialmente cuidadoso ao fornecer informações.`;
}

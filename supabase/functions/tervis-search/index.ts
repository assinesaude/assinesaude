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
const DAILY_SEARCH_LIMIT = 10;

interface SearchRequest {
  query: string;
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

    const { query }: SearchRequest = await req.json();

    if (!query || query.trim().length === 0) {
      throw new Error("Query is required");
    }

    const today = new Date().toISOString().split('T')[0];

    const { data: usageData, error: usageError } = await supabase
      .from("search_usage_limits")
      .select("*")
      .eq("user_id", user.id)
      .eq("date", today)
      .maybeSingle();

    if (usageError) {
      console.error("Error fetching usage:", usageError);
      throw new Error("Error checking search limits");
    }

    if (usageData && usageData.search_count >= DAILY_SEARCH_LIMIT) {
      return new Response(
        JSON.stringify({
          error: "Limite diário atingido",
          message: `Você atingiu o limite de ${DAILY_SEARCH_LIMIT} buscas por dia. Tente novamente amanhã!`,
          remainingSearches: 0,
          resetTime: new Date(new Date(today).getTime() + 24 * 60 * 60 * 1000).toISOString(),
        }),
        {
          status: 429,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    const { data: professionals, error: profError } = await supabase
      .from("professionals_directory")
      .select("*")
      .limit(100);

    if (profError) {
      console.error("Error fetching professionals:", profError);
      throw new Error("Error fetching professionals data");
    }

    const professionalsContext = professionals?.length
      ? `\n\nPROFISSIONAIS DISPONÍVEIS NO TERVIS.AI:\n${professionals
          .map(
            (p) =>
              `- ${p.full_name} | ${p.specialty} | ${p.city}/${p.state} | ${p.phone || 'Telefone não informado'} | ${p.is_registered ? 'Cadastrado na plataforma' : 'Não cadastrado'}`
          )
          .join('\n')}`
      : '\n\nAinda não temos profissionais cadastrados no banco de dados.';

    const systemPrompt = `Você é o TERVIS.AI, um assistente inteligente de busca de profissionais de saúde.

Sua função principal:
1. PRIORIZAR os profissionais que estão cadastrados no banco de dados do TERVIS.AI
2. Apresentar APENAS profissionais que correspondam à busca do usuário (especialidade e localização)
3. Se encontrar profissionais cadastrados, liste-os com todas as informações disponíveis
4. Se NÃO encontrar profissionais cadastrados na localização solicitada:
   - Você pode sugerir profissionais genéricos da área
   - MAS SEMPRE mencione: "Este profissional ainda não está cadastrado no TERVIS.AI. Se você é este profissional ou o conhece, convide-o a se cadastrar em nossa plataforma para aparecer nas buscas!"
5. Seja claro, objetivo e sempre destaque os profissionais JÁ CADASTRADOS
6. Use emojis para deixar a resposta mais amigável
7. Sempre termine sugerindo que o usuário explore outros profissionais na plataforma

Formate sua resposta de forma clara e organizada, destacando:
- Nome do profissional
- Especialidade
- Localização
- Contato (se disponível)
- Status de cadastro
${professionalsContext}`;

    const geminiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [{ text: systemPrompt }],
            },
            {
              role: "user",
              parts: [{ text: `Pergunta do usuário: ${query}` }],
            },
          ],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 2048,
          },
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

    if (usageData) {
      await supabase
        .from("search_usage_limits")
        .update({
          search_count: usageData.search_count + 1,
          last_search_at: new Date().toISOString(),
        })
        .eq("id", usageData.id);
    } else {
      await supabase.from("search_usage_limits").insert({
        user_id: user.id,
        date: today,
        search_count: 1,
        last_search_at: new Date().toISOString(),
      });
    }

    const currentCount = (usageData?.search_count || 0) + 1;
    const remainingSearches = Math.max(0, DAILY_SEARCH_LIMIT - currentCount);

    return new Response(
      JSON.stringify({
        success: true,
        response: aiResponse,
        remainingSearches: remainingSearches,
        totalSearches: currentCount,
        dailyLimit: DAILY_SEARCH_LIMIT,
      }),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("Error in tervis-search:", error);
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

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { specialty, clinicName, targetAudience } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = `Você é um consultor especializado em saúde e negócios para profissionais da área de saúde no Brasil.
Você ajuda profissionais a criar PROGRAMAS DE ATENDIMENTO atrativos para seus pacientes.

IMPORTANTE - REGRAS DE COMPLIANCE:
- NUNCA use a palavra "plano" ou "planos" - isso é terminologia regulada
- Use SEMPRE: "Programa de Atendimento", "Programa de Benefícios", "Programa de [especialidade]" ou "Programa Personalizado"
- Os títulos devem começar com "Programa de..." ou similar

Gere sugestões de programas de atendimento com:
- Título atrativo começando com "Programa de..." (ex: "Programa de Acompanhamento Nutricional")
- Descrição clara dos benefícios para o paciente
- Preço sugerido realista para o mercado brasileiro (em Reais - R$)
- Duração estimada em minutos

As sugestões devem ser realistas e éticas para profissionais de saúde no Brasil.`;

    const userPrompt = `Sou um(a) profissional de ${specialty}${clinicName ? ` trabalhando na clínica "${clinicName}"` : ''}.
${targetAudience ? `Meu público-alvo é: ${targetAudience}` : ''}

Por favor, sugira 3 PROGRAMAS DE ATENDIMENTO (não use a palavra "plano") que eu poderia oferecer aos meus pacientes.
Lembre-se: use "Programa de...", "Programa Personalizado de...", "Programa de Benefícios..." nos títulos.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "suggest_offerings",
              description: "Retorna sugestões de ofertas de serviços para profissionais de saúde",
              parameters: {
                type: "object",
                properties: {
                  offerings: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        title: { type: "string", description: "Título do serviço" },
                        description: { type: "string", description: "Descrição do serviço e seus benefícios" },
                        price: { type: "number", description: "Preço sugerido em Reais" },
                        duration_minutes: { type: "number", description: "Duração estimada em minutos" },
                      },
                      required: ["title", "description", "price", "duration_minutes"],
                    },
                  },
                },
                required: ["offerings"],
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "suggest_offerings" } },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Limite de requisições excedido. Tente novamente em alguns minutos." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Créditos de IA esgotados. Adicione créditos em Settings > Workspace > Usage." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error("AI gateway error");
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    
    if (toolCall?.function?.arguments) {
      const offerings = JSON.parse(toolCall.function.arguments);
      return new Response(JSON.stringify(offerings), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fallback: parse from content if tool call fails
    const content = data.choices?.[0]?.message?.content || "";
    return new Response(JSON.stringify({ offerings: [], rawContent: content }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

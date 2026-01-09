import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SYSTEM_PROMPT = `Você é a assistente virtual da AssineSaúde, uma plataforma B2B2C que conecta profissionais de saúde a pacientes através de programas de benefícios empresariais.

Sobre a plataforma:
- A AssineSaúde permite que profissionais de saúde (dentistas, nutricionistas, psicólogos, fisioterapeutas, médicos, etc.) se cadastrem e ofereçam seus serviços
- Pacientes podem buscar e agendar consultas com profissionais aprovados
- Empresas podem contratar planos B2B para oferecer benefícios de saúde aos seus colaboradores
- Profissionais passam por um processo de verificação de documentos antes de serem aprovados

Funcionalidades:
- Cadastro de profissionais com verificação de documentos
- Cadastro de pacientes
- Dashboard administrativo para aprovação de profissionais
- Sistema de ofertas de serviços pelos profissionais
- Sistema de planos e assinaturas B2B
- Cupons de desconto
- Sistema de mensagens da plataforma

Seu papel:
- Responder dúvidas sobre a plataforma
- Ajudar com problemas técnicos
- Explicar como funciona o processo de cadastro e aprovação
- Apresentar os benefícios da plataforma para potenciais clientes (profissionais e empresas)
- Ser sempre cordial, profissional e objetivo

Se alguém perguntar sobre preços de planos empresariais, diga que eles podem entrar em contato pelo email comercial@assinesaude.com.br para uma proposta personalizada.

Responda sempre em português brasileiro.`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Limite de requisições excedido. Tente novamente em alguns minutos." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Serviço temporariamente indisponível." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(JSON.stringify({ error: "Erro ao processar sua mensagem." }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (error) {
    console.error("Chat error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Erro desconhecido" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
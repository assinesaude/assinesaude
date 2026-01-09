import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface ApprovalEmailRequest {
  professionalName: string;
  professionalEmail: string;
  isApproved: boolean;
  rejectionReason?: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { professionalName, professionalEmail, isApproved, rejectionReason }: ApprovalEmailRequest = await req.json();

    let subject: string;
    let htmlContent: string;

    if (isApproved) {
      subject = "🎉 Parabéns! Seu cadastro foi aprovado - AssineSaúde";
      htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #059669 0%, #10b981 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .header h1 { color: white; margin: 0; font-size: 24px; }
            .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
            .highlight-box { background: white; border-left: 4px solid #059669; padding: 20px; margin: 20px 0; border-radius: 5px; }
            .cta-button { display: inline-block; background: #059669; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 20px 0; }
            .features { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
            .feature-item { display: flex; align-items: center; padding: 10px 0; border-bottom: 1px solid #e5e7eb; }
            .feature-item:last-child { border-bottom: none; }
            .check { color: #059669; margin-right: 10px; font-size: 18px; }
            .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎉 Bem-vindo(a) à AssineSaúde!</h1>
            </div>
            <div class="content">
              <p>Olá, <strong>${professionalName}</strong>!</p>
              
              <p>Temos uma excelente notícia: <strong>seu cadastro foi aprovado</strong> e você já pode começar a utilizar nossa plataforma!</p>
              
              <div class="highlight-box">
                <h3 style="margin-top: 0; color: #059669;">🚀 Comece Agora com o Plano Gratuito!</h3>
                <p>Publicamos um plano gratuito para você conhecer todas as ferramentas disponíveis e começar a atrair mais pacientes imediatamente.</p>
              </div>
              
              <div class="features">
                <h3 style="margin-top: 0;">✨ Recursos disponíveis nos nossos planos:</h3>
                <div class="feature-item"><span class="check">✓</span> Perfil profissional verificado com selo de confiança</div>
                <div class="feature-item"><span class="check">✓</span> Página de serviços personalizada</div>
                <div class="feature-item"><span class="check">✓</span> Assistente de IA para criar ofertas atrativas</div>
                <div class="feature-item"><span class="check">✓</span> Cupons de desconto para fidelizar pacientes</div>
                <div class="feature-item"><span class="check">✓</span> Visibilidade na busca de pacientes</div>
                <div class="feature-item"><span class="check">✓</span> Dashboard com métricas e relatórios</div>
              </div>
              
              <p style="text-align: center;">
                <a href="https://assinesaude.com/login" class="cta-button">Acessar Minha Conta →</a>
              </p>
              
              <p>Explore os diferentes planos disponíveis e escolha o que melhor se adapta às suas necessidades. Quanto mais recursos você utilizar, mais pacientes poderá alcançar!</p>
              
              <p>Estamos aqui para ajudá-lo(a) a crescer. Se tiver qualquer dúvida, não hesite em nos contatar.</p>
              
              <p>Sucesso na sua jornada!</p>
              <p><strong>Equipe AssineSaúde</strong></p>
            </div>
            <div class="footer">
              <p>© 2024 AssineSaúde. Todos os direitos reservados.</p>
              <p>Este email foi enviado porque você se cadastrou em nossa plataforma.</p>
            </div>
          </div>
        </body>
        </html>
      `;
    } else {
      subject = "Atualização sobre seu cadastro - AssineSaúde";
      htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #6b7280 0%, #9ca3af 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .header h1 { color: white; margin: 0; font-size: 24px; }
            .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
            .reason-box { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 20px; margin: 20px 0; border-radius: 5px; }
            .cta-button { display: inline-block; background: #059669; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 20px 0; }
            .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Atualização do Cadastro</h1>
            </div>
            <div class="content">
              <p>Olá, <strong>${professionalName}</strong>!</p>
              
              <p>Agradecemos seu interesse em fazer parte da AssineSaúde. Após análise do seu cadastro, identificamos alguns pontos que precisam ser ajustados.</p>
              
              <div class="reason-box">
                <h3 style="margin-top: 0; color: #b45309;">📋 Motivo:</h3>
                <p>${rejectionReason || 'Documentação incompleta ou ilegível.'}</p>
              </div>
              
              <p><strong>O que fazer agora?</strong></p>
              <p>Você pode atualizar suas informações e reenviar seu cadastro. Nossa equipe analisará novamente assim que possível.</p>
              
              <p style="text-align: center;">
                <a href="https://assinesaude.com/cadastro/profissional" class="cta-button">Atualizar Cadastro →</a>
              </p>
              
              <p>Se tiver dúvidas sobre os requisitos ou precisar de ajuda, entre em contato conosco.</p>
              
              <p>Atenciosamente,</p>
              <p><strong>Equipe AssineSaúde</strong></p>
            </div>
            <div class="footer">
              <p>© 2024 AssineSaúde. Todos os direitos reservados.</p>
            </div>
          </div>
        </body>
        </html>
      `;
    }

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "AssineSaúde <onboarding@resend.dev>",
        to: [professionalEmail],
        subject: subject,
        html: htmlContent,
      }),
    });

    const emailResponse = await res.json();

    if (!res.ok) {
      throw new Error(emailResponse.message || "Failed to send email");
    }

    console.log("Email sent successfully:", emailResponse);

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error in send-approval-email function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);

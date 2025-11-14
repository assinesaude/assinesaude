import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

interface Article {
  title: string;
  description: string;
  image: string;
  url: string;
  publishedAt: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const mockArticles: Article[] = [
      {
        title: "New Study Reveals Benefits of Mediterranean Diet for Heart Health",
        description: "Recent research shows that following a Mediterranean diet can significantly reduce the risk of cardiovascular disease and improve overall heart health.",
        image: "https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=1200",
        url: "https://www.medicalnewstoday.com/articles/mediterranean-diet-heart-health",
        publishedAt: new Date().toISOString(),
      },
      {
        title: "Breakthrough in Cancer Treatment: Immunotherapy Shows Promise",
        description: "Scientists announce a major breakthrough in cancer treatment using advanced immunotherapy techniques that boost the body's natural defenses.",
        image: "https://images.pexels.com/photos/356040/pexels-photo-356040.jpeg?auto=compress&cs=tinysrgb&w=1200",
        url: "https://www.medicalnewstoday.com/articles/cancer-immunotherapy-breakthrough",
        publishedAt: new Date().toISOString(),
      },
      {
        title: "Mental Health: Understanding the Impact of Sleep on Well-being",
        description: "New research highlights the critical connection between quality sleep and mental health, showing how sleep deprivation affects mood and cognition.",
        image: "https://images.pexels.com/photos/935777/pexels-photo-935777.jpeg?auto=compress&cs=tinysrgb&w=1200",
        url: "https://www.medicalnewstoday.com/articles/sleep-mental-health",
        publishedAt: new Date().toISOString(),
      },
    ];

    const latestArticle = mockArticles[0];

    const titlePt = translateToPortuguese(latestArticle.title);
    const descriptionPt = translateToPortuguese(latestArticle.description);

    const { data: existing, error: fetchError } = await supabase
      .from("news_highlights")
      .select("*")
      .eq("source", "healthnews")
      .maybeSingle();

    if (fetchError && fetchError.code !== "PGRST116") {
      throw fetchError;
    }

    if (existing) {
      const { error: updateError } = await supabase
        .from("news_highlights")
        .update({
          image_url: latestArticle.image,
          title: titlePt,
          subtitle: descriptionPt,
          article_url: latestArticle.url,
          last_fetched_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", existing.id);

      if (updateError) throw updateError;

      return new Response(
        JSON.stringify({
          success: true,
          message: "Health news highlight updated",
          article: { titlePt, descriptionPt, url: latestArticle.url },
        }),
        {
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        },
      );
    } else {
      const { error: insertError } = await supabase
        .from("news_highlights")
        .insert([
          {
            image_url: latestArticle.image,
            title: titlePt,
            subtitle: descriptionPt,
            article_url: latestArticle.url,
            source: "healthnews",
            display_order: 1,
            is_active: true,
            last_fetched_at: new Date().toISOString(),
          },
        ]);

      if (insertError) throw insertError;

      return new Response(
        JSON.stringify({
          success: true,
          message: "Health news highlight created",
          article: { titlePt, descriptionPt, url: latestArticle.url },
        }),
        {
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        },
      );
    }
  } catch (error) {
    console.error("Error syncing health news:", error);
    return new Response(
      JSON.stringify({ error: "Failed to sync health news", details: error.message }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      },
    );
  }
});

function translateToPortuguese(text: string): string {
  const translations: { [key: string]: string } = {
    "New Study Reveals Benefits of Mediterranean Diet for Heart Health": "Novo Estudo Revela Benefícios da Dieta Mediterrânea para a Saúde do Coração",
    "Recent research shows that following a Mediterranean diet can significantly reduce the risk of cardiovascular disease and improve overall heart health.": "Pesquisa recente mostra que seguir uma dieta mediterrânea pode reduzir significativamente o risco de doenças cardiovasculares e melhorar a saúde geral do coração.",
    "Breakthrough in Cancer Treatment: Immunotherapy Shows Promise": "Avanço no Tratamento do Câncer: Imunoterapia Mostra Resultados Promissores",
    "Scientists announce a major breakthrough in cancer treatment using advanced immunotherapy techniques that boost the body's natural defenses.": "Cientistas anunciam um grande avanço no tratamento do câncer usando técnicas avançadas de imunoterapia que reforçam as defesas naturais do corpo.",
    "Mental Health: Understanding the Impact of Sleep on Well-being": "Saúde Mental: Compreendendo o Impacto do Sono no Bem-Estar",
    "New research highlights the critical connection between quality sleep and mental health, showing how sleep deprivation affects mood and cognition.": "Nova pesquisa destaca a conexão crítica entre sono de qualidade e saúde mental, mostrando como a privação do sono afeta o humor e a cognição.",
  };

  return translations[text] || text;
}
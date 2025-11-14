import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

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
    const articles: Article[] = [];

    const mockArticles = [
      {
        title: "New Study Reveals Benefits of Mediterranean Diet for Heart Health",
        description: "Recent research shows that following a Mediterranean diet can significantly reduce the risk of cardiovascular disease and improve overall heart health.",
        image: "https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=800",
        url: "https://healthnewstoday.com/mediterranean-diet-heart-health",
        publishedAt: new Date().toISOString(),
      },
      {
        title: "Breakthrough in Cancer Treatment: Immunotherapy Shows Promise",
        description: "Scientists announce a major breakthrough in cancer treatment using advanced immunotherapy techniques that boost the body's natural defenses.",
        image: "https://images.pexels.com/photos/356040/pexels-photo-356040.jpeg?auto=compress&cs=tinysrgb&w=800",
        url: "https://healthnewstoday.com/cancer-immunotherapy-breakthrough",
        publishedAt: new Date().toISOString(),
      },
      {
        title: "Mental Health: Understanding the Impact of Sleep on Well-being",
        description: "New research highlights the critical connection between quality sleep and mental health, showing how sleep deprivation affects mood and cognition.",
        image: "https://images.pexels.com/photos/935777/pexels-photo-935777.jpeg?auto=compress&cs=tinysrgb&w=800",
        url: "https://healthnewstoday.com/sleep-mental-health",
        publishedAt: new Date().toISOString(),
      },
      {
        title: "Exercise and Longevity: How Physical Activity Extends Lifespan",
        description: "Comprehensive study demonstrates that regular physical activity can add years to your life and improve quality of life in older adults.",
        image: "https://images.pexels.com/photos/4056723/pexels-photo-4056723.jpeg?auto=compress&cs=tinysrgb&w=800",
        url: "https://healthnewstoday.com/exercise-longevity",
        publishedAt: new Date().toISOString(),
      },
      {
        title: "Diabetes Prevention: Lifestyle Changes That Make a Difference",
        description: "Health experts share evidence-based strategies for preventing type 2 diabetes through diet, exercise, and lifestyle modifications.",
        image: "https://images.pexels.com/photos/4386467/pexels-photo-4386467.jpeg?auto=compress&cs=tinysrgb&w=800",
        url: "https://healthnewstoday.com/diabetes-prevention",
        publishedAt: new Date().toISOString(),
      },
      {
        title: "The Role of Gut Health in Overall Wellness",
        description: "Scientists discover how the gut microbiome influences everything from immunity to mental health, revolutionizing our understanding of wellness.",
        image: "https://images.pexels.com/photos/1640774/pexels-photo-1640774.jpeg?auto=compress&cs=tinysrgb&w=800",
        url: "https://healthnewstoday.com/gut-health-wellness",
        publishedAt: new Date().toISOString(),
      },
      {
        title: "Vitamin D Deficiency: Silent Epidemic in Modern Society",
        description: "Medical experts warn about widespread vitamin D deficiency and its impact on bone health, immunity, and chronic disease prevention.",
        image: "https://images.pexels.com/photos/1001897/pexels-photo-1001897.jpeg?auto=compress&cs=tinysrgb&w=800",
        url: "https://healthnewstoday.com/vitamin-d-deficiency",
        publishedAt: new Date().toISOString(),
      },
      {
        title: "Stress Management Techniques for Modern Life",
        description: "Psychologists share proven strategies for managing stress in today's fast-paced world, including mindfulness and relaxation techniques.",
        image: "https://images.pexels.com/photos/4498362/pexels-photo-4498362.jpeg?auto=compress&cs=tinysrgb&w=800",
        url: "https://healthnewstoday.com/stress-management",
        publishedAt: new Date().toISOString(),
      },
      {
        title: "Alzheimer's Research: Early Detection Methods Show Promise",
        description: "New diagnostic tools allow doctors to detect Alzheimer's disease years before symptoms appear, opening doors for early intervention.",
        image: "https://images.pexels.com/photos/3952048/pexels-photo-3952048.jpeg?auto=compress&cs=tinysrgb&w=800",
        url: "https://healthnewstoday.com/alzheimers-early-detection",
        publishedAt: new Date().toISOString(),
      },
      {
        title: "Plant-Based Nutrition: Health Benefits Beyond Weight Loss",
        description: "Research reveals that plant-based diets offer numerous health benefits including reduced inflammation and improved cardiovascular health.",
        image: "https://images.pexels.com/photos/1640770/pexels-photo-1640770.jpeg?auto=compress&cs=tinysrgb&w=800",
        url: "https://healthnewstoday.com/plant-based-nutrition",
        publishedAt: new Date().toISOString(),
      },
    ];

    const translatedArticles = mockArticles.map(article => ({
      ...article,
      titlePt: translateToPortuguese(article.title),
      descriptionPt: translateToPortuguese(article.description),
      source: 'healthnews',
    }));

    return new Response(
      JSON.stringify({ articles: translatedArticles }),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      },
    );
  } catch (error) {
    console.error("Error fetching news:", error);
    return new Response(
      JSON.stringify({ error: "Failed to fetch news" }),
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
    "Exercise and Longevity: How Physical Activity Extends Lifespan": "Exercício e Longevidade: Como a Atividade Física Prolonga a Vida",
    "Comprehensive study demonstrates that regular physical activity can add years to your life and improve quality of life in older adults.": "Estudo abrangente demonstra que a atividade física regular pode adicionar anos à sua vida e melhorar a qualidade de vida em adultos mais velhos.",
    "Diabetes Prevention: Lifestyle Changes That Make a Difference": "Prevenção do Diabetes: Mudanças no Estilo de Vida que Fazem a Diferença",
    "Health experts share evidence-based strategies for preventing type 2 diabetes through diet, exercise, and lifestyle modifications.": "Especialistas em saúde compartilham estratégias baseadas em evidências para prevenir diabetes tipo 2 através de dieta, exercício e modificações no estilo de vida.",
    "The Role of Gut Health in Overall Wellness": "O Papel da Saúde Intestinal no Bem-Estar Geral",
    "Scientists discover how the gut microbiome influences everything from immunity to mental health, revolutionizing our understanding of wellness.": "Cientistas descobrem como o microbioma intestinal influencia tudo, desde a imunidade até a saúde mental, revolucionando nossa compreensão do bem-estar.",
    "Vitamin D Deficiency: Silent Epidemic in Modern Society": "Deficiência de Vitamina D: Epidemia Silenciosa na Sociedade Moderna",
    "Medical experts warn about widespread vitamin D deficiency and its impact on bone health, immunity, and chronic disease prevention.": "Especialistas médicos alertam sobre a deficiência generalizada de vitamina D e seu impacto na saúde óssea, imunidade e prevenção de doenças crônicas.",
    "Stress Management Techniques for Modern Life": "Técnicas de Gerenciamento de Estresse para a Vida Moderna",
    "Psychologists share proven strategies for managing stress in today's fast-paced world, including mindfulness and relaxation techniques.": "Psicólogos compartilham estratégias comprovadas para gerenciar o estresse no mundo acelerado de hoje, incluindo técnicas de atenção plena e relaxamento.",
    "Alzheimer's Research: Early Detection Methods Show Promise": "Pesquisa sobre Alzheimer: Métodos de Detecção Precoce Mostram Promessa",
    "New diagnostic tools allow doctors to detect Alzheimer's disease years before symptoms appear, opening doors for early intervention.": "Novas ferramentas de diagnóstico permitem que médicos detectem a doença de Alzheimer anos antes dos sintomas aparecerem, abrindo portas para intervenção precoce.",
    "Plant-Based Nutrition: Health Benefits Beyond Weight Loss": "Nutrição à Base de Plantas: Benefícios à Saúde Além da Perda de Peso",
    "Research reveals that plant-based diets offer numerous health benefits including reduced inflammation and improved cardiovascular health.": "Pesquisa revela que dietas à base de plantas oferecem numerosos benefícios à saúde, incluindo redução da inflamação e melhoria da saúde cardiovascular.",
  };

  return translations[text] || text;
}

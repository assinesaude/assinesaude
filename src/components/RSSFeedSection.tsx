import { useEffect } from 'react';

const RSSFeedSection = () => {
  useEffect(() => {
    // Load Elfsight script dynamically
    const existingScript = document.querySelector('script[src="https://static.elfsight.com/platform/platform.js"]');
    
    if (!existingScript) {
      const script = document.createElement('script');
      script.src = 'https://static.elfsight.com/platform/platform.js';
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

  return (
    <section className="py-16 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-4">Últimas Notícias em Saúde</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Fique por dentro das novidades e tendências do mundo da saúde
          </p>
        </div>
        
        <div 
          className="elfsight-app-d321f283-d03e-4e3e-97ec-8fd4d31dafc6" 
          data-elfsight-app-lazy
        />
      </div>
    </section>
  );
};

export default RSSFeedSection;

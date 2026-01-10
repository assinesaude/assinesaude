import { Link } from "react-router-dom";
import footerImage from "@/assets/footer-assinesaude.png";

const Footer = () => {
  return (
    <footer id="contato" className="bg-muted/30">
      <img 
        src={footerImage} 
        alt="AssineSaúde - Serviço de Concierge de Saúde Humana e Animal em todo o Mundo" 
        className="w-full h-auto"
      />
      <div className="container mx-auto px-4 py-6 border-t">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} AssineSaúde. Todos os direitos reservados.</p>
          <div className="flex items-center gap-6">
            <Link to="/politica-de-privacidade" className="hover:text-primary transition-colors">
              Política de Privacidade
            </Link>
            <Link to="/termos-de-uso" className="hover:text-primary transition-colors">
              Termos de Uso
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
import footerImage from "@/assets/footer-assinesaude.png";

const Footer = () => {
  return (
    <footer id="contato">
      <img 
        src={footerImage} 
        alt="AssineSaúde - Serviço de Concierge de Saúde Humana e Animal em todo o Mundo" 
        className="w-full h-auto"
      />
    </footer>
  );
};

export default Footer;
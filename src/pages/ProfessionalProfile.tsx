import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Separator } from '@/components/ui/separator';
import { 
  MapPin, 
  Phone, 
  Clock, 
  Star, 
  Instagram, 
  Facebook, 
  Youtube,
  MessageCircle,
  Send,
  Building2,
  GraduationCap,
  Briefcase,
  Heart,
  ChevronLeft,
  ExternalLink,
  Video,
  Share2
} from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

interface ProfessionalData {
  id: string;
  full_name: string;
  specialty: string;
  clinic_name: string | null;
  clinic_address: string | null;
  city: string | null;
  state: string | null;
  phone: string | null;
  avatar_url: string | null;
  bio: string | null;
  instagram_url: string | null;
  facebook_url: string | null;
  tiktok_url: string | null;
  youtube_url: string | null;
  kwai_url: string | null;
  whatsapp_number: string | null;
  telegram_url: string | null;
  google_street_view_url: string | null;
  google_my_business_url: string | null;
  slug: string | null;
  profession?: {
    name: string;
  };
}

interface ServiceOffering {
  id: string;
  title: string;
  description: string | null;
  price: number;
  duration_minutes: number | null;
  is_active: boolean;
}

const ProfessionalProfile = () => {
  const { slug } = useParams<{ slug: string }>();
  const [professional, setProfessional] = useState<ProfessionalData | null>(null);
  const [offerings, setOfferings] = useState<ServiceOffering[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (slug) {
      fetchProfessionalData();
    }
  }, [slug]);

  const fetchProfessionalData = async () => {
    setLoading(true);
    
    // Try to find by slug first, then by ID
    let query = supabase
      .from('professional_profiles')
      .select(`
        id, full_name, specialty, clinic_name, clinic_address, city, state, phone,
        avatar_url, bio, instagram_url, facebook_url, tiktok_url, youtube_url,
        kwai_url, whatsapp_number, telegram_url, google_street_view_url,
        google_my_business_url, slug, profession_id,
        professions(name)
      `)
      .eq('approval_status', 'approved');

    // Check if slug looks like a UUID
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(slug || '');
    
    if (isUUID) {
      query = query.eq('id', slug);
    } else {
      query = query.eq('slug', slug);
    }

    const { data, error } = await query.maybeSingle();

    if (error || !data) {
      console.error('Error fetching professional:', error);
      setNotFound(true);
      setLoading(false);
      return;
    }

    // Transform professions to profession
    const transformedData: ProfessionalData = {
      ...data,
      profession: data.professions ? { name: (data.professions as { name: string }).name } : undefined
    };

    setProfessional(transformedData);

    // Fetch service offerings
    const { data: offeringsData } = await supabase
      .from('service_offerings')
      .select('*')
      .eq('professional_id', data.id)
      .eq('is_active', true)
      .order('price', { ascending: true });

    if (offeringsData) {
      setOfferings(offeringsData);
    }

    setLoading(false);
  };

  const handleShare = async () => {
    const url = window.location.href;
    const text = `Conheça ${professional?.full_name} - ${professional?.specialty} no AssineSaúde`;
    
    if (navigator.share) {
      try {
        await navigator.share({ title: text, url });
      } catch (err) {
        // User cancelled share
      }
    } else {
      navigator.clipboard.writeText(url);
    }
  };

  const getWhatsAppLink = (number: string) => {
    const cleanNumber = number.replace(/\D/g, '');
    return `https://wa.me/55${cleanNumber}`;
  };

  const socialLinks = professional ? [
    { icon: Instagram, url: professional.instagram_url, label: 'Instagram', color: 'hover:text-pink-500' },
    { icon: Facebook, url: professional.facebook_url, label: 'Facebook', color: 'hover:text-blue-600' },
    { icon: Video, url: professional.tiktok_url, label: 'TikTok', color: 'hover:text-black dark:hover:text-white' },
    { icon: Youtube, url: professional.youtube_url, label: 'YouTube', color: 'hover:text-red-500' },
    { icon: Video, url: professional.kwai_url, label: 'Kwai', color: 'hover:text-orange-500' },
    { icon: MessageCircle, url: professional.whatsapp_number ? getWhatsAppLink(professional.whatsapp_number) : null, label: 'WhatsApp', color: 'hover:text-green-500' },
    { icon: Send, url: professional.telegram_url, label: 'Telegram', color: 'hover:text-blue-400' },
  ].filter(link => link.url) : [];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (notFound || !professional) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-20 text-center">
          <h1 className="text-3xl font-bold mb-4">Profissional não encontrado</h1>
          <p className="text-muted-foreground mb-8">O perfil que você está procurando não existe ou não está mais disponível.</p>
          <Button asChild>
            <Link to="/">
              <ChevronLeft className="w-4 h-4 mr-2" />
              Voltar ao início
            </Link>
          </Button>
        </main>
        <Footer />
      </div>
    );
  }

  const initials = professional.full_name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
  const fullLocation = [professional.city, professional.state].filter(Boolean).join(', ');

  // Schema.org structured data for SEO
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "MedicalBusiness",
    "name": professional.clinic_name || professional.full_name,
    "description": professional.bio || `${professional.specialty} - Profissional de saúde cadastrado no AssineSaúde`,
    "image": professional.avatar_url,
    "address": professional.clinic_address ? {
      "@type": "PostalAddress",
      "streetAddress": professional.clinic_address,
      "addressLocality": professional.city,
      "addressRegion": professional.state,
      "addressCountry": "BR"
    } : undefined,
    "telephone": professional.phone,
    "medicalSpecialty": professional.specialty,
    "hasOfferCatalog": offerings.length > 0 ? {
      "@type": "OfferCatalog",
      "name": "Programas de Atendimento",
      "itemListElement": offerings.map(offer => ({
        "@type": "Offer",
        "name": offer.title,
        "description": offer.description,
        "price": offer.price,
        "priceCurrency": "BRL"
      }))
    } : undefined,
    "sameAs": socialLinks.map(l => l.url).filter(Boolean)
  };

  return (
    <>
      <Helmet>
        <title>{`${professional.full_name} - ${professional.specialty} | AssineSaúde`}</title>
        <meta name="description" content={professional.bio || `${professional.full_name} é ${professional.specialty}. Conheça os programas de atendimento e agende sua consulta pelo AssineSaúde.`} />
        <meta name="keywords" content={`${professional.full_name}, ${professional.specialty}, saúde, consulta, ${professional.city || ''}, ${professional.state || ''}`} />
        
        {/* Open Graph */}
        <meta property="og:title" content={`${professional.full_name} - ${professional.specialty}`} />
        <meta property="og:description" content={professional.bio || `Conheça os programas de atendimento de ${professional.full_name}`} />
        <meta property="og:type" content="profile" />
        <meta property="og:image" content={professional.avatar_url || ''} />
        <meta property="og:url" content={window.location.href} />
        
        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={`${professional.full_name} - ${professional.specialty}`} />
        <meta name="twitter:description" content={professional.bio || `Conheça os programas de atendimento`} />
        <meta name="twitter:image" content={professional.avatar_url || ''} />
        
        {/* Canonical URL */}
        <link rel="canonical" href={window.location.href} />
        
        {/* Schema.org */}
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      </Helmet>

      <div className="min-h-screen bg-background">
        <Header />
        
        <main className="container mx-auto px-4 py-8">
          {/* Breadcrumb */}
          <nav className="mb-6" aria-label="Breadcrumb">
            <ol className="flex items-center gap-2 text-sm text-muted-foreground">
              <li><Link to="/" className="hover:text-primary transition-colors">Início</Link></li>
              <li>/</li>
              <li><Link to="/#buscar" className="hover:text-primary transition-colors">Profissionais</Link></li>
              <li>/</li>
              <li className="text-foreground font-medium">{professional.full_name}</li>
            </ol>
          </nav>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Profile Card */}
            <div className="lg:col-span-2 space-y-6">
              {/* Hero Section */}
              <Card className="overflow-hidden">
                <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-8">
                  <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
                    <Avatar className="w-32 h-32 border-4 border-background shadow-xl">
                      <AvatarImage src={professional.avatar_url || undefined} alt={professional.full_name} />
                      <AvatarFallback className="text-3xl bg-primary text-primary-foreground">{initials}</AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
                            {professional.full_name}
                          </h1>
                          <Badge variant="secondary" className="mb-3">
                            <GraduationCap className="w-3 h-3 mr-1" />
                            {professional.specialty}
                          </Badge>
                          {professional.profession?.name && (
                            <p className="text-muted-foreground">{professional.profession.name}</p>
                          )}
                        </div>
                        <Button variant="outline" size="icon" onClick={handleShare}>
                          <Share2 className="w-4 h-4" />
                        </Button>
                      </div>
                      
                      {fullLocation && (
                        <div className="flex items-center gap-2 text-muted-foreground mt-3">
                          <MapPin className="w-4 h-4" />
                          <span>{fullLocation}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Social Links */}
                {socialLinks.length > 0 && (
                  <div className="px-8 py-4 border-t bg-muted/30">
                    <div className="flex flex-wrap gap-3">
                      {socialLinks.map((social, index) => (
                        <a
                          key={index}
                          href={social.url!}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`flex items-center gap-2 px-3 py-2 rounded-full bg-background border text-muted-foreground transition-colors ${social.color}`}
                          aria-label={social.label}
                        >
                          <social.icon className="w-4 h-4" />
                          <span className="text-sm">{social.label}</span>
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </Card>

              {/* Collapsible Sections */}
              <Accordion type="multiple" defaultValue={['bio', 'offerings']} className="space-y-4">
                {/* Bio Section */}
                {professional.bio && (
                  <AccordionItem value="bio" className="border rounded-lg px-6">
                    <AccordionTrigger className="text-lg font-semibold">
                      <span className="flex items-center gap-2">
                        <Heart className="w-5 h-5 text-primary" />
                        Sobre o Profissional
                      </span>
                    </AccordionTrigger>
                    <AccordionContent>
                      <p className="text-muted-foreground whitespace-pre-line leading-relaxed">
                        {professional.bio}
                      </p>
                    </AccordionContent>
                  </AccordionItem>
                )}

                {/* Service Offerings */}
                {offerings.length > 0 && (
                  <AccordionItem value="offerings" className="border rounded-lg px-6">
                    <AccordionTrigger className="text-lg font-semibold">
                      <span className="flex items-center gap-2">
                        <Briefcase className="w-5 h-5 text-primary" />
                        Programas de Atendimento ({offerings.length})
                      </span>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="grid gap-4">
                        {offerings.map((offering) => (
                          <Card key={offering.id} className="overflow-hidden hover:shadow-md transition-shadow">
                            <CardContent className="p-4">
                              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div className="flex-1">
                                  <h3 className="font-semibold text-foreground mb-1">{offering.title}</h3>
                                  {offering.description && (
                                    <p className="text-sm text-muted-foreground line-clamp-2">{offering.description}</p>
                                  )}
                                  {offering.duration_minutes && (
                                    <div className="flex items-center gap-1 text-xs text-muted-foreground mt-2">
                                      <Clock className="w-3 h-3" />
                                      <span>{offering.duration_minutes} minutos</span>
                                    </div>
                                  )}
                                </div>
                                <div className="flex items-center gap-4">
                                  <div className="text-right">
                                    <p className="text-xs text-muted-foreground">A partir de</p>
                                    <p className="text-2xl font-bold text-primary">
                                      R$ {offering.price.toFixed(2).replace('.', ',')}
                                    </p>
                                    <p className="text-xs text-muted-foreground">/mês</p>
                                  </div>
                                  {professional.whatsapp_number && (
                                    <Button asChild className="shrink-0">
                                      <a href={getWhatsAppLink(professional.whatsapp_number)} target="_blank" rel="noopener noreferrer">
                                        <MessageCircle className="w-4 h-4 mr-2" />
                                        Agendar
                                      </a>
                                    </Button>
                                  )}
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                )}

                {/* Clinic/Location Info */}
                {(professional.clinic_name || professional.clinic_address) && (
                  <AccordionItem value="location" className="border rounded-lg px-6">
                    <AccordionTrigger className="text-lg font-semibold">
                      <span className="flex items-center gap-2">
                        <Building2 className="w-5 h-5 text-primary" />
                        Local de Atendimento
                      </span>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-4">
                        {professional.clinic_name && (
                          <div>
                            <h4 className="font-medium text-foreground">{professional.clinic_name}</h4>
                          </div>
                        )}
                        {professional.clinic_address && (
                          <div className="flex items-start gap-2 text-muted-foreground">
                            <MapPin className="w-4 h-4 mt-0.5 shrink-0" />
                            <span>{professional.clinic_address}</span>
                          </div>
                        )}
                        
                        <div className="flex flex-wrap gap-3 pt-2">
                          {professional.google_street_view_url && (
                            <Button variant="outline" size="sm" asChild>
                              <a href={professional.google_street_view_url} target="_blank" rel="noopener noreferrer">
                                <ExternalLink className="w-4 h-4 mr-2" />
                                Ver no Street View
                              </a>
                            </Button>
                          )}
                          {professional.google_my_business_url && (
                            <Button variant="outline" size="sm" asChild>
                              <a href={professional.google_my_business_url} target="_blank" rel="noopener noreferrer">
                                <Star className="w-4 h-4 mr-2" />
                                Ver no Google
                              </a>
                            </Button>
                          )}
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                )}
              </Accordion>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1 space-y-6">
              {/* Contact Card */}
              <Card className="sticky top-24">
                <CardHeader>
                  <CardTitle className="text-lg">Entre em Contato</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {professional.phone && (
                    <a 
                      href={`tel:${professional.phone}`}
                      className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                    >
                      <Phone className="w-5 h-5 text-primary" />
                      <span className="text-foreground">{professional.phone}</span>
                    </a>
                  )}
                  
                  {professional.whatsapp_number && (
                    <Button asChild className="w-full bg-green-600 hover:bg-green-700">
                      <a href={getWhatsAppLink(professional.whatsapp_number)} target="_blank" rel="noopener noreferrer">
                        <MessageCircle className="w-5 h-5 mr-2" />
                        Conversar no WhatsApp
                      </a>
                    </Button>
                  )}
                  
                  <Separator />
                  
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground mb-3">
                      Encontre mais profissionais de saúde
                    </p>
                    <Button variant="outline" asChild className="w-full">
                      <Link to="/#buscar">
                        Buscar Profissionais
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Trust Badges */}
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Star className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">Profissional Verificado</p>
                      <p className="text-xs">Cadastro aprovado pelo AssineSaúde</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default ProfessionalProfile;

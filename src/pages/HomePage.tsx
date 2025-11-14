import React, { useState, useEffect } from 'react';
import { Search, MapPin, Stethoscope, Star } from 'lucide-react';
import { Carousel } from '../components/Carousel';
import { NewsCarousel } from '../components/NewsCarousel';
import { BannerCarousel } from '../components/BannerCarousel';
import TervisSearch from '../components/TervisSearch';
import { supabase, Testimonial, FeatureVector } from '../lib/supabase';
import { searchLocations, LocationSuggestion } from '../services/locationService';

const professionalMockTestimonials = [
  {
    name: "Dr. Carlos Mendes",
    profession: "Cardiologista",
    city: "São Paulo",
    state: "SP",
    photo: "https://images.pexels.com/photos/5215024/pexels-photo-5215024.jpeg?auto=compress&cs=tinysrgb&w=200",
    testimonial: "Finalmente uma plataforma que pensa no profissional! Cansei dos convênios que pagam migalhas. Aqui eu defino meu preço e tenho renda fixa garantida."
  },
  {
    name: "Dra. Ana Paula Silva",
    profession: "Nutricionista",
    city: "Rio de Janeiro",
    state: "RJ",
    photo: "https://images.pexels.com/photos/5452293/pexels-photo-5452293.jpeg?auto=compress&cs=tinysrgb&w=200",
    testimonial: "Criei minha oferta há 3 meses e já tenho 12 assinantes fixos! Isso mudou completamente minha vida financeira. Obrigada AssineSaúde!"
  },
  {
    name: "Dr. Roberto Oliveira",
    profession: "Psicólogo",
    city: "Belo Horizonte",
    state: "MG",
    photo: "https://images.pexels.com/photos/5327585/pexels-photo-5327585.jpeg?auto=compress&cs=tinysrgb&w=200",
    testimonial: "Os convênios tradicionais são uma piada! Pagam R$40 por consulta e querem que a gente faça milagre. Aqui eu tenho dignidade e respeito pelo meu trabalho."
  },
  {
    name: "Dra. Fernanda Costa",
    profession: "Veterinária",
    city: "Curitiba",
    state: "PR",
    photo: "https://images.pexels.com/photos/6235114/pexels-photo-6235114.jpeg?auto=compress&cs=tinysrgb&w=200",
    testimonial: "Obrigada por lembrar dos veterinários! Nós também somos profissionais de saúde e merecemos reconhecimento. Estou amando a plataforma!"
  },
  {
    name: "Dr. João Ferreira",
    profession: "Dentista",
    city: "Porto Alegre",
    state: "RS",
    photo: "https://images.pexels.com/photos/6627381/pexels-photo-6627381.jpeg?auto=compress&cs=tinysrgb&w=200",
    testimonial: "A busca por IA TERVIS é simplesmente genial! Meus pacientes me encontram muito mais fácil agora. Parabéns pela ideia inovadora!"
  },
  {
    name: "Dra. Mariana Santos",
    profession: "Dermatologista",
    city: "Salvador",
    state: "BA",
    photo: "https://images.pexels.com/photos/5327921/pexels-photo-5327921.jpeg?auto=compress&cs=tinysrgb&w=200",
    testimonial: "Minha agenda está sempre cheia desde que entrei aqui. Os assinantes são fiéis e eu tenho previsibilidade de renda. Isso é revolucionário!"
  },
  {
    name: "Dr. Pedro Alves",
    profession: "Fisioterapeuta",
    city: "Fortaleza",
    state: "CE",
    photo: "https://images.pexels.com/photos/4506109/pexels-photo-4506109.jpeg?auto=compress&cs=tinysrgb&w=200",
    testimonial: "Já trabalhei com vários convênios e todos exploravam o profissional. AssineSaúde veio para mudar o jogo!"
  },
  {
    name: "Dra. Juliana Lima",
    profession: "Endocrinologista",
    city: "Brasília",
    state: "DF",
    photo: "https://images.pexels.com/photos/5327580/pexels-photo-5327580.jpeg?auto=compress&cs=tinysrgb&w=200",
    testimonial: "Ideia de gênio! Finalmente podemos exercer a medicina com dignidade e sem intermediários sugando nosso trabalho."
  },
  {
    name: "Dr. Lucas Rocha",
    profession: "Ortopedista",
    city: "Recife",
    state: "PE",
    photo: "https://images.pexels.com/photos/5452201/pexels-photo-5452201.jpeg?auto=compress&cs=tinysrgb&w=200",
    testimonial: "Os convênios tradicionais estão com os dias contados. AssineSaúde é o futuro da saúde no Brasil!"
  },
  {
    name: "Dra. Camila Martins",
    profession: "Ginecologista",
    city: "Manaus",
    state: "AM",
    photo: "https://images.pexels.com/photos/5327653/pexels-photo-5327653.jpeg?auto=compress&cs=tinysrgb&w=200",
    testimonial: "Tenho 20 anos de profissão e essa é a melhor plataforma que já usei. Controle total sobre minha agenda e valores!"
  },
  {
    name: "Dr. Rafael Souza",
    profession: "Oftalmologista",
    city: "Goiânia",
    state: "GO",
    photo: "https://images.pexels.com/photos/5327547/pexels-photo-5327547.jpeg?auto=compress&cs=tinysrgb&w=200",
    testimonial: "Saí de todos os convênios e não me arrependo nem um pouco. Aqui eu sou valorizado de verdade!"
  },
  {
    name: "Dra. Beatriz Campos",
    profession: "Pediatra",
    city: "Florianópolis",
    state: "SC",
    photo: "https://images.pexels.com/photos/8460332/pexels-photo-8460332.jpeg?auto=compress&cs=tinysrgb&w=200",
    testimonial: "Meus pacientes adoram o modelo de assinatura. Eles têm acesso quando precisam e eu tenho renda garantida todo mês!"
  },
  {
    name: "Dr. André Ribeiro",
    profession: "Urologista",
    city: "Vitória",
    state: "ES",
    photo: "https://images.pexels.com/photos/5327656/pexels-photo-5327656.jpeg?auto=compress&cs=tinysrgb&w=200",
    testimonial: "A TERVIS.AI facilita demais para os pacientes me encontrarem. Tecnologia de primeiro mundo aqui no Brasil!"
  },
  {
    name: "Dra. Patricia Gomes",
    profession: "Neuropsicóloga",
    city: "Belém",
    state: "PA",
    photo: "https://images.pexels.com/photos/5327804/pexels-photo-5327804.jpeg?auto=compress&cs=tinysrgb&w=200",
    testimonial: "Sempre quis ter meus pacientes particulares sem depender de convênios. AssineSaúde tornou isso possível!"
  },
  {
    name: "Dr. Thiago Barbosa",
    profession: "Acupunturista",
    city: "Campo Grande",
    state: "MS",
    photo: "https://images.pexels.com/photos/5327509/pexels-photo-5327509.jpeg?auto=compress&cs=tinysrgb&w=200",
    testimonial: "Medicina integrativa finalmente tem seu espaço! Aqui consegui construir uma base sólida de pacientes."
  }
];

const patientMockTestimonials = [
  {
    name: "Maria Silva",
    city: "São Paulo",
    state: "SP",
    photo: "https://images.pexels.com/photos/3763188/pexels-photo-3763188.jpeg?auto=compress&cs=tinysrgb&w=200",
    testimonial: "Cancelei meu convênio que eu pagava R$800 e nunca usava. Agora tenho minha nutricionista particular por R$150/mês. Melhor decisão!"
  },
  {
    name: "João Pedro",
    city: "Rio de Janeiro",
    state: "RJ",
    photo: "https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=200",
    testimonial: "Nos Estados Unidos isso é febre! Lá é o Medlyou, o Medical Concierge. Amei ter isso no Brasil também!"
  },
  {
    name: "Carla Mendes",
    city: "Belo Horizonte",
    state: "MG",
    photo: "https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=200",
    testimonial: "Isso é ideia de gênio! Muito mais barato que convênio antigo e agora tenho minha nutri particular. Já vou fazer um de psicologia também!"
  },
  {
    name: "Ricardo Santos",
    city: "Curitiba",
    state: "PR",
    photo: "https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=200",
    testimonial: "Fiz para mim e para meu cachorrinho Tedy! A veterinária é maravilhosa e o preço é justo. Recomendo demais!"
  },
  {
    name: "Amanda Costa",
    city: "Porto Alegre",
    state: "RS",
    photo: "https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?auto=compress&cs=tinysrgb&w=200",
    testimonial: "Nunca mais vou voltar para convênio tradicional. Aqui eu tenho acesso direto ao médico, sem burocracia!"
  },
  {
    name: "Fernando Lima",
    city: "Salvador",
    state: "BA",
    photo: "https://images.pexels.com/photos/1516680/pexels-photo-1516680.jpeg?auto=compress&cs=tinysrgb&w=200",
    testimonial: "Pago menos de R$200 e tenho fisioterapeuta particular! Isso era impensável antes. AssineSaúde é sensacional!"
  },
  {
    name: "Juliana Alves",
    city: "Fortaleza",
    state: "CE",
    photo: "https://images.pexels.com/photos/1559486/pexels-photo-1559486.jpeg?auto=compress&cs=tinysrgb&w=200",
    testimonial: "O modelo de Medical Concierge chegou no Brasil! Eu que estudei fora sempre sonhei com isso aqui."
  },
  {
    name: "Bruno Oliveira",
    city: "Brasília",
    state: "DF",
    photo: "https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=200",
    testimonial: "Convênio tradicional é coisa do passado. AssineSaúde é muito mais prático e econômico!"
  },
  {
    name: "Patricia Souza",
    city: "Recife",
    state: "PE",
    photo: "https://images.pexels.com/photos/1130626/pexels-photo-1130626.jpeg?auto=compress&cs=tinysrgb&w=200",
    testimonial: "Tenho assinatura de dermatologista e psicólogo. Gasto menos que antes e sou muito mais bem atendida!"
  },
  {
    name: "Lucas Ferreira",
    city: "Manaus",
    state: "AM",
    photo: "https://images.pexels.com/photos/1300402/pexels-photo-1300402.jpeg?auto=compress&cs=tinysrgb&w=200",
    testimonial: "A TERVIS.AI me ajudou a encontrar o profissional perfeito! Tecnologia que realmente funciona."
  },
  {
    name: "Isabela Rocha",
    city: "Goiânia",
    state: "GO",
    photo: "https://images.pexels.com/photos/1229414/pexels-photo-1229414.jpeg?auto=compress&cs=tinysrgb&w=200",
    testimonial: "Minha família inteira usa! Cada um tem seu profissional de saúde particular. Revolucionário!"
  },
  {
    name: "Gabriel Martins",
    city: "Florianópolis",
    state: "SC",
    photo: "https://images.pexels.com/photos/1065084/pexels-photo-1065084.jpeg?auto=compress&cs=tinysrgb&w=200",
    testimonial: "Cancelei meu plano de saúde que custava uma fortuna. AssineSaúde vale cada centavo!"
  },
  {
    name: "Renata Campos",
    city: "Vitória",
    state: "ES",
    photo: "https://images.pexels.com/photos/1181424/pexels-photo-1181424.jpeg?auto=compress&cs=tinysrgb&w=200",
    testimonial: "Agora entendo porque nos EUA o Medical Concierge é tão popular. É muito melhor que convênio tradicional!"
  },
  {
    name: "Marcelo Gomes",
    city: "Belém",
    state: "PA",
    photo: "https://images.pexels.com/photos/1212984/pexels-photo-1212984.jpeg?auto=compress&cs=tinysrgb&w=200",
    testimonial: "Tinha medo de cancelar o convênio, mas não me arrependo. Aqui o atendimento é personalizado e muito mais humano!"
  },
  {
    name: "Larissa Barbosa",
    city: "Campo Grande",
    state: "MS",
    photo: "https://images.pexels.com/photos/1267335/pexels-photo-1267335.jpeg?auto=compress&cs=tinysrgb&w=200",
    testimonial: "Assino nutrição, psicologia e veterinária para minha gata. Pago menos de R$400 no total. É incrível!"
  }
];

export function HomePage() {
  const [professionalTestimonials, setProfessionalTestimonials] = useState<Testimonial[]>([]);
  const [patientTestimonials, setPatientTestimonials] = useState<Testimonial[]>([]);
  const [searchLocation, setSearchLocation] = useState('');
  const [searchProfession, setSearchProfession] = useState('');
  const [searchSpecialty, setSearchSpecialty] = useState('');
  const [locationSuggestions, setLocationSuggestions] = useState<LocationSuggestion[]>([]);
  const [showLocationSuggestions, setShowLocationSuggestions] = useState(false);
  const [isLoadingLocations, setIsLoadingLocations] = useState(false);

  useEffect(() => {
    fetchTestimonials();
  }, []);

  const syncHealthNews = async () => {
    try {
      await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/sync-health-news`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
            'Content-Type': 'application/json',
          },
        }
      );
    } catch (error) {
      console.error('Error syncing health news:', error);
    }
  };

  const fetchTestimonials = async () => {
    try {
      const { data, error } = await supabase
        .from('testimonials')
        .select('*')
        .eq('is_published', true);

      if (error) throw error;

      const professionals = data?.filter((t) => t.user_type === 'professional').slice(0, 6) || [];
      const patients = data?.filter((t) => t.user_type === 'patient').slice(0, 6) || [];

      setProfessionalTestimonials(professionals);
      setPatientTestimonials(patients);
    } catch (error) {
      console.error('Error fetching testimonials:', error);
    }
  };


  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Search:', { searchLocation, searchProfession, searchSpecialty });
  };

  const handleLocationInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchLocation(value);

    if (value.length >= 3) {
      setIsLoadingLocations(true);
      setShowLocationSuggestions(true);

      try {
        const suggestions = await searchLocations(value);
        setLocationSuggestions(suggestions);
      } catch (error) {
        console.error('Error fetching location suggestions:', error);
        setLocationSuggestions([]);
      } finally {
        setIsLoadingLocations(false);
      }
    } else {
      setLocationSuggestions([]);
      setShowLocationSuggestions(false);
    }
  };

  const handleLocationSelect = (suggestion: LocationSuggestion) => {
    setSearchLocation(suggestion.name);
    setShowLocationSuggestions(false);
    setLocationSuggestions([]);
  };

  return (
    <div className="min-h-screen bg-white">
      <NewsCarousel />

      <section className="py-16 bg-white">
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-center gap-6 mb-8">
            <img
              src="/TERVISAIBONITO.png"
              alt="TERVIS.AI"
              className="h-40 w-40 object-contain flex-shrink-0 -ml-40"
            />
            <div className="max-w-4xl w-full">
              <TervisSearch />
            </div>
          </div>

          <form onSubmit={handleSearch} className="max-w-3xl mx-auto">
            <div className="grid md:grid-cols-3 gap-3 mb-4">
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 z-10" />
                <input
                  type="text"
                  placeholder="Cidade, bairro ou estado"
                  value={searchLocation}
                  onChange={handleLocationInputChange}
                  onFocus={() => setShowLocationSuggestions(locationSuggestions.length > 0)}
                  onBlur={() => setTimeout(() => setShowLocationSuggestions(false), 200)}
                  className="w-full pl-10 pr-3 py-2.5 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
                />
                {showLocationSuggestions && locationSuggestions.length > 0 && (
                  <div className="absolute z-20 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    {isLoadingLocations ? (
                      <div className="px-4 py-3 text-sm text-slate-500">Carregando...</div>
                    ) : (
                      locationSuggestions.map((suggestion, index) => (
                        <button
                          key={`${suggestion.type}-${suggestion.name}-${index}`}
                          type="button"
                          onClick={() => handleLocationSelect(suggestion)}
                          className="w-full px-4 py-2.5 text-left text-sm hover:bg-slate-50 transition-colors border-b border-slate-100 last:border-b-0 flex items-start gap-2"
                        >
                          <MapPin className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
                          <div className="flex-1">
                            <div className="font-medium text-slate-900">{suggestion.name}</div>
                            <div className="text-xs text-slate-500 capitalize">
                              {suggestion.type === 'state' && 'Estado'}
                              {suggestion.type === 'city' && 'Cidade'}
                              {suggestion.type === 'neighborhood' && 'Bairro'}
                            </div>
                          </div>
                        </button>
                      ))
                    )}
                  </div>
                )}
              </div>

              <div className="relative">
                <Stethoscope className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Profissão"
                  value={searchProfession}
                  onChange={(e) => setSearchProfession(e.target.value)}
                  className="w-full pl-10 pr-3 py-2.5 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
                />
              </div>

              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Especialidade"
                  value={searchSpecialty}
                  onChange={(e) => setSearchSpecialty(e.target.value)}
                  className="w-full pl-10 pr-3 py-2.5 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
                />
              </div>
            </div>

            <div className="text-center">
              <button
                type="submit"
                className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-lg transition-colors shadow-lg hover:shadow-xl"
              >
                Buscar Ofertas
              </button>
            </div>
          </form>
        </div>
      </section>

      <section className="py-16 bg-gradient-to-b from-white to-slate-50">
        <div className="container mx-auto px-6">
          <h2 className="text-4xl font-serif text-center text-slate-800 mb-4">
            Profissionais da Saúde
          </h2>
          <p className="text-center text-slate-600 mb-12">
            Veja o que nossos profissionais têm a dizer
          </p>

          <div className="relative overflow-hidden">
            <div className="flex animate-scroll-left gap-6 mb-6">
              {[...professionalMockTestimonials, ...professionalMockTestimonials].map((testimonial, idx) => (
                <div
                  key={`prof-left-${idx}`}
                  className="flex-shrink-0 w-80 bg-white p-6 rounded-2xl shadow-lg border border-slate-200 hover:shadow-xl transition-all transform hover:-translate-y-1"
                >
                  <div className="flex items-center gap-4 mb-4">
                    <img
                      src={testimonial.photo}
                      alt={testimonial.name}
                      className="w-16 h-16 rounded-full object-cover border-4 border-emerald-500"
                    />
                    <div>
                      <h3 className="font-semibold text-slate-800">{testimonial.name}</h3>
                      <p className="text-sm text-slate-500">{testimonial.profession}</p>
                      <p className="text-xs text-emerald-600">{testimonial.city}, {testimonial.state}</p>
                    </div>
                  </div>
                  <p className="text-slate-700 italic">"{testimonial.testimonial}"</p>
                </div>
              ))}
            </div>

            <div className="flex animate-scroll-right gap-6">
              {[...professionalMockTestimonials.slice().reverse(), ...professionalMockTestimonials.slice().reverse()].map((testimonial, idx) => (
                <div
                  key={`prof-right-${idx}`}
                  className="flex-shrink-0 w-80 bg-white p-6 rounded-2xl shadow-lg border border-slate-200 hover:shadow-xl transition-all transform hover:-translate-y-1"
                >
                  <div className="flex items-center gap-4 mb-4">
                    <img
                      src={testimonial.photo}
                      alt={testimonial.name}
                      className="w-16 h-16 rounded-full object-cover border-4 border-emerald-500"
                    />
                    <div>
                      <h3 className="font-semibold text-slate-800">{testimonial.name}</h3>
                      <p className="text-sm text-slate-500">{testimonial.profession}</p>
                      <p className="text-xs text-emerald-600">{testimonial.city}, {testimonial.state}</p>
                    </div>
                  </div>
                  <p className="text-slate-700 italic">"{testimonial.testimonial}"</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <BannerCarousel />

      <section className="py-16 bg-gradient-to-b from-slate-50 to-white">
        <div className="container mx-auto px-6">
          <h2 className="text-4xl font-serif text-center text-slate-800 mb-4">
            Pacientes e Clientes
          </h2>
          <p className="text-center text-slate-600 mb-12">
            Transformando vidas com cuidado acessível
          </p>

          <div className="relative overflow-hidden">
            <div className="flex animate-scroll-left gap-6 mb-6">
              {[...patientMockTestimonials, ...patientMockTestimonials].map((testimonial, idx) => (
                <div
                  key={`patient-left-${idx}`}
                  className="flex-shrink-0 w-80 bg-white p-6 rounded-2xl shadow-lg border border-slate-200 hover:shadow-xl transition-all transform hover:-translate-y-1"
                >
                  <div className="flex items-center gap-4 mb-4">
                    <img
                      src={testimonial.photo}
                      alt={testimonial.name}
                      className="w-16 h-16 rounded-full object-cover border-4 border-blue-500"
                    />
                    <div>
                      <h3 className="font-semibold text-slate-800">{testimonial.name}</h3>
                      <p className="text-xs text-blue-600">{testimonial.city}, {testimonial.state}</p>
                    </div>
                  </div>
                  <p className="text-slate-700 italic">"{testimonial.testimonial}"</p>
                </div>
              ))}
            </div>

            <div className="flex animate-scroll-right gap-6">
              {[...patientMockTestimonials.slice().reverse(), ...patientMockTestimonials.slice().reverse()].map((testimonial, idx) => (
                <div
                  key={`patient-right-${idx}`}
                  className="flex-shrink-0 w-80 bg-white p-6 rounded-2xl shadow-lg border border-slate-200 hover:shadow-xl transition-all transform hover:-translate-y-1"
                >
                  <div className="flex items-center gap-4 mb-4">
                    <img
                      src={testimonial.photo}
                      alt={testimonial.name}
                      className="w-16 h-16 rounded-full object-cover border-4 border-blue-500"
                    />
                    <div>
                      <h3 className="font-semibold text-slate-800">{testimonial.name}</h3>
                      <p className="text-xs text-blue-600">{testimonial.city}, {testimonial.state}</p>
                    </div>
                  </div>
                  <p className="text-slate-700 italic">"{testimonial.testimonial}"</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <Carousel />

      {professionalTestimonials.length > 0 && (
        <section className="py-20 bg-slate-50">
          <div className="container mx-auto px-6">
            <h2 className="text-4xl font-serif text-center text-slate-800 mb-4">
              Profissionais Satisfeitos
            </h2>
            <p className="text-center text-slate-600 mb-16">
              Veja o que nossos profissionais têm a dizer
            </p>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
              {professionalTestimonials.map((testimonial) => (
                <div
                  key={testimonial.id}
                  className="bg-white p-8 rounded-xl shadow-sm hover:shadow-md transition-shadow border border-slate-200"
                >
                  <div className="flex items-center gap-4 mb-6">
                    <img
                      src={testimonial.photo_url}
                      alt={testimonial.name}
                      className="w-16 h-16 rounded-full object-cover border-2 border-emerald-500"
                    />
                    <div>
                      <h3 className="font-semibold text-slate-800">{testimonial.name}</h3>
                      <p className="text-sm text-slate-500">{testimonial.city}</p>
                    </div>
                  </div>
                  <div className="flex gap-1 mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-emerald-500 text-emerald-500" />
                    ))}
                  </div>
                  <p className="text-slate-600 leading-relaxed">{testimonial.testimonial}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {patientTestimonials.length > 0 && (
        <section className="py-20 bg-white">
          <div className="container mx-auto px-6">
            <h2 className="text-4xl font-serif text-center text-slate-800 mb-4">
              Pacientes Felizes
            </h2>
            <p className="text-center text-slate-600 mb-16">
              Depoimentos de quem já usa AssineSaúde
            </p>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
              {patientTestimonials.map((testimonial) => (
                <div
                  key={testimonial.id}
                  className="bg-slate-50 p-8 rounded-xl shadow-sm hover:shadow-md transition-shadow border border-slate-200"
                >
                  <div className="flex items-center gap-4 mb-6">
                    <img
                      src={testimonial.photo_url}
                      alt={testimonial.name}
                      className="w-16 h-16 rounded-full object-cover border-2 border-emerald-500"
                    />
                    <div>
                      <h3 className="font-semibold text-slate-800">{testimonial.name}</h3>
                      <p className="text-sm text-slate-500">{testimonial.city}</p>
                    </div>
                  </div>
                  <div className="flex gap-1 mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-emerald-500 text-emerald-500" />
                    ))}
                  </div>
                  <p className="text-slate-600 leading-relaxed">{testimonial.testimonial}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="py-12 bg-white">
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-center gap-12 max-w-6xl mx-auto">
            <img
              src="/Medlyou.png"
              alt="Medlyou - Choose your doctor, hire him, without intermediaries"
              className="h-20 object-contain"
            />
            <img
              src="/Sumate.png"
              alt="Sumate Salud - Tu bienestar, tu elección. Sin intermediários"
              className="h-20 object-contain"
            />
            <img
              src="/Benetuo.png"
              alt="Benetuo - Il tuo benessere, la tua scelta. Senza intermediari"
              className="h-20 object-contain"
            />
          </div>
        </div>
      </section>

      <footer className="w-full">
        <img
          src="/FOOOOTEEERR.png"
          alt="AssineSaúde Footer - Brazil Headquarter - World Wide Representation"
          className="w-full h-auto object-contain"
        />
      </footer>
    </div>
  );
}

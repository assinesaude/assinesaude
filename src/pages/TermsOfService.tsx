import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, FileText, Scale, Users, Shield, AlertTriangle, Gavel } from 'lucide-react';

const TermsOfService = () => {
  return (
    <>
      <Helmet>
        <title>Termos de Uso | AssineSaúde</title>
        <meta name="description" content="Termos de Uso da plataforma AssineSaúde. Conheça as regras, responsabilidades e condições de uso." />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href={`${window.location.origin}/termos-de-uso`} />
      </Helmet>

      <div className="min-h-screen bg-background">
        <Header />
        
        <main className="container mx-auto px-4 py-12">
          {/* Breadcrumb */}
          <nav className="mb-8" aria-label="Breadcrumb">
            <ol className="flex items-center gap-2 text-sm text-muted-foreground">
              <li><Link to="/" className="hover:text-primary transition-colors">Início</Link></li>
              <li>/</li>
              <li className="text-foreground font-medium">Termos de Uso</li>
            </ol>
          </nav>

          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="text-center mb-12">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
                <FileText className="w-8 h-8 text-primary" />
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                Termos de Uso
              </h1>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Ao utilizar a plataforma AssineSaúde, você concorda com os termos e condições 
                descritos neste documento.
              </p>
              <p className="text-sm text-muted-foreground mt-4">
                Última atualização: Janeiro de 2026
              </p>
            </div>

            {/* Quick Links */}
            <Card className="mb-8">
              <CardContent className="p-6">
                <h2 className="font-semibold mb-4">Navegação Rápida</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <a href="#apresentacao" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors">
                    <FileText className="w-4 h-4" />
                    Apresentação
                  </a>
                  <a href="#responsabilidades" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors">
                    <Scale className="w-4 h-4" />
                    Responsabilidades
                  </a>
                  <a href="#obrigacoes" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors">
                    <Users className="w-4 h-4" />
                    Obrigações
                  </a>
                </div>
              </CardContent>
            </Card>

            {/* Content */}
            <div className="prose prose-gray dark:prose-invert max-w-none space-y-8">
              
              {/* Section 1 */}
              <section id="apresentacao">
                <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
                  <FileText className="w-5 h-5 text-primary" />
                  1. Apresentação
                </h2>
                <p className="text-muted-foreground">
                  A plataforma AssineSaúde é um ambiente digital que conecta profissionais de saúde 
                  a pacientes, facilitando a divulgação de programas de atendimento e serviços 
                  de saúde. Ao utilizar nossa plataforma, você concorda com os termos aqui descritos.
                </p>
                <p className="text-muted-foreground">
                  A AssineSaúde atua como uma plataforma tecnológica que facilita o encontro entre 
                  profissionais de saúde e pacientes, não atuando como prestadora de serviços de saúde.
                </p>
              </section>

              {/* Section 2 */}
              <section id="responsabilidades">
                <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
                  <Scale className="w-5 h-5 text-primary" />
                  2. Responsabilidade pela Prestação de Serviços
                </h2>
                
                <Card className="border-amber-500/50 bg-amber-50 dark:bg-amber-900/20 mt-4">
                  <CardContent className="p-6">
                    <div className="flex gap-4">
                      <AlertTriangle className="w-6 h-6 text-amber-600 shrink-0 mt-0.5" />
                      <div>
                        <h3 className="font-semibold text-foreground mb-2">Importante</h3>
                        <p className="text-muted-foreground">
                          <strong className="text-foreground">A responsabilidade pela prestação de serviços de saúde é 
                          exclusivamente do profissional que os publica na plataforma.</strong>
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <p className="text-muted-foreground mt-4">
                  A AssineSaúde atua apenas como intermediadora tecnológica, fornecendo a infraestrutura 
                  para que profissionais divulguem seus serviços e pacientes os encontrem. A plataforma 
                  <strong className="text-foreground"> não se responsabiliza por assuntos que envolvam a relação 
                  direta entre profissional e paciente (B2C)</strong>, incluindo, mas não se limitando a:
                </p>
                <ul className="text-muted-foreground space-y-1 mt-2">
                  <li>• Qualidade do atendimento prestado</li>
                  <li>• Resultados de tratamentos ou procedimentos</li>
                  <li>• Acordos comerciais entre as partes</li>
                  <li>• Agendamentos e cancelamentos</li>
                  <li>• Disputas contratuais entre profissional e paciente</li>
                  <li>• Valores cobrados pelos profissionais</li>
                  <li>• Cumprimento de horários e compromissos</li>
                </ul>
              </section>

              {/* Section 3 */}
              <section>
                <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
                  <Gavel className="w-5 h-5 text-primary" />
                  3. Exceções à Limitação de Responsabilidade
                </h2>
                <p className="text-muted-foreground">
                  A AssineSaúde poderá intervir e tomar as medidas cabíveis nos seguintes casos:
                </p>
                
                <div className="grid md:grid-cols-3 gap-4 mt-4">
                  <Card className="border-destructive/30">
                    <CardContent className="p-4">
                      <h4 className="font-medium text-foreground mb-2">Práticas Criminosas</h4>
                      <p className="text-sm text-muted-foreground">
                        Condutas que configurem crimes previstos na legislação brasileira.
                      </p>
                    </CardContent>
                  </Card>
                  
                  <Card className="border-destructive/30">
                    <CardContent className="p-4">
                      <h4 className="font-medium text-foreground mb-2">Código de Defesa do Consumidor</h4>
                      <p className="text-sm text-muted-foreground">
                        Práticas abusivas, publicidade enganosa, ou outras violações ao CDC.
                      </p>
                    </CardContent>
                  </Card>
                  
                  <Card className="border-destructive/30">
                    <CardContent className="p-4">
                      <h4 className="font-medium text-foreground mb-2">Violações Éticas Graves</h4>
                      <p className="text-sm text-muted-foreground">
                        Condutas que violem normas dos conselhos profissionais de saúde.
                      </p>
                    </CardContent>
                  </Card>
                </div>
                
                <p className="text-muted-foreground mt-4">
                  Nesses casos, a plataforma colaborará com as autoridades competentes e poderá 
                  suspender ou cancelar o cadastro do profissional, além de fornecer informações 
                  necessárias às investigações.
                </p>
              </section>

              {/* Section 4 */}
              <section id="obrigacoes">
                <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
                  <Users className="w-5 h-5 text-primary" />
                  4. Obrigações do Profissional
                </h2>
                <p className="text-muted-foreground">Ao se cadastrar na plataforma, o profissional de saúde se compromete a:</p>
                
                <ul className="text-muted-foreground space-y-2 mt-4">
                  <li>
                    <strong className="text-foreground">Veracidade das informações:</strong> Fornecer 
                    informações verdadeiras sobre sua formação, registro profissional e especialidades.
                  </li>
                  <li>
                    <strong className="text-foreground">Documentação atualizada:</strong> Manter 
                    documentação válida e atualizada junto aos conselhos profissionais.
                  </li>
                  <li>
                    <strong className="text-foreground">Ética profissional:</strong> Prestar serviços 
                    de acordo com as normas do seu conselho profissional e código de ética.
                  </li>
                  <li>
                    <strong className="text-foreground">Terminologia adequada:</strong> Não utilizar 
                    termos regulados como "plano de saúde" para descrever seus serviços, utilizando 
                    "Programa de Atendimento" ou termos similares permitidos.
                  </li>
                  <li>
                    <strong className="text-foreground">Respeito aos pacientes:</strong> Tratar todos 
                    os pacientes com respeito e dignidade.
                  </li>
                  <li>
                    <strong className="text-foreground">Responsabilidade pelos serviços:</strong> Assumir 
                    total responsabilidade pelos serviços prestados e seus resultados.
                  </li>
                </ul>
              </section>

              {/* Section 5 */}
              <section>
                <h2 className="text-xl font-semibold text-foreground">5. Obrigações do Paciente</h2>
                <p className="text-muted-foreground">Ao utilizar a plataforma, o paciente se compromete a:</p>
                
                <ul className="text-muted-foreground space-y-2 mt-4">
                  <li>
                    <strong className="text-foreground">Informações verdadeiras:</strong> Fornecer 
                    informações corretas em seu cadastro.
                  </li>
                  <li>
                    <strong className="text-foreground">Uso ético:</strong> Utilizar a plataforma 
                    de forma ética e respeitosa.
                  </li>
                  <li>
                    <strong className="text-foreground">Avaliações honestas:</strong> Não realizar 
                    avaliações falsas ou difamatórias sobre profissionais.
                  </li>
                  <li>
                    <strong className="text-foreground">Compromissos:</strong> Respeitar os acordos 
                    e compromissos estabelecidos com os profissionais.
                  </li>
                </ul>
              </section>

              {/* Section 6 */}
              <section>
                <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
                  <Shield className="w-5 h-5 text-primary" />
                  6. Proteção de Dados (LGPD)
                </h2>
                
                <p className="text-muted-foreground">
                  A AssineSaúde está comprometida com a proteção dos dados pessoais de seus usuários, 
                  em conformidade com a Lei Geral de Proteção de Dados (Lei nº 13.709/2018 - LGPD).
                </p>
                
                <Card className="mt-4 border-primary/20 bg-primary/5">
                  <CardContent className="p-6">
                    <h4 className="font-semibold text-foreground mb-4">Nossos Compromissos</h4>
                    <div className="grid md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <strong className="text-foreground">Transparência</strong>
                        <p className="text-muted-foreground">Informamos claramente quais dados coletamos e como são utilizados</p>
                      </div>
                      <div>
                        <strong className="text-foreground">Segurança</strong>
                        <p className="text-muted-foreground">Implementamos medidas técnicas e administrativas para proteger seus dados</p>
                      </div>
                      <div>
                        <strong className="text-foreground">Direitos do Titular</strong>
                        <p className="text-muted-foreground">Garantimos seus direitos de acesso, correção, exclusão e portabilidade</p>
                      </div>
                      <div>
                        <strong className="text-foreground">Não Compartilhamento</strong>
                        <p className="text-muted-foreground">Não vendemos ou compartilhamos seus dados sem autorização</p>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mt-4">
                      Para mais detalhes, consulte nossa{' '}
                      <Link to="/politica-de-privacidade" className="text-primary hover:underline font-medium">
                        Política de Privacidade completa
                      </Link>.
                    </p>
                  </CardContent>
                </Card>
              </section>

              {/* Section 7 */}
              <section>
                <h2 className="text-xl font-semibold text-foreground">7. Propriedade Intelectual</h2>
                <p className="text-muted-foreground">
                  Todo o conteúdo da plataforma AssineSaúde, incluindo mas não se limitando a textos, 
                  gráficos, logotipos, ícones, imagens e software, é de propriedade da AssineSaúde ou 
                  de seus licenciadores e está protegido pelas leis de propriedade intelectual.
                </p>
                <p className="text-muted-foreground mt-2">
                  O conteúdo publicado pelos profissionais (descrições de serviços, fotos de perfil) 
                  permanece de propriedade dos respectivos autores, que concedem à plataforma licença 
                  para exibição durante a vigência do cadastro.
                </p>
              </section>

              {/* Section 8 */}
              <section>
                <h2 className="text-xl font-semibold text-foreground">8. Suspensão e Cancelamento</h2>
                <p className="text-muted-foreground">
                  A AssineSaúde reserva-se o direito de suspender ou cancelar contas que:
                </p>
                <ul className="text-muted-foreground space-y-1 mt-2">
                  <li>• Violem estes Termos de Uso</li>
                  <li>• Forneçam informações falsas</li>
                  <li>• Pratiquem atividades ilegais ou antiéticas</li>
                  <li>• Prejudiquem outros usuários ou a reputação da plataforma</li>
                  <li>• Não mantenham documentação profissional válida (profissionais)</li>
                </ul>
              </section>

              {/* Section 9 */}
              <section>
                <h2 className="text-xl font-semibold text-foreground">9. Modificações nos Termos</h2>
                <p className="text-muted-foreground">
                  A AssineSaúde reserva-se o direito de modificar estes termos a qualquer momento. 
                  As alterações serão comunicadas aos usuários através da plataforma e/ou por e-mail. 
                  O uso continuado da plataforma após as modificações implica na aceitação dos novos termos.
                </p>
              </section>

              {/* Section 10 */}
              <section>
                <h2 className="text-xl font-semibold text-foreground">10. Disposições Gerais</h2>
                <p className="text-muted-foreground">
                  Estes Termos de Uso são regidos pelas leis da República Federativa do Brasil. 
                  Fica eleito o foro da Comarca de São Paulo/SP para dirimir quaisquer controvérsias 
                  decorrentes destes Termos de Uso, renunciando as partes a qualquer outro, por mais 
                  privilegiado que seja.
                </p>
                <p className="text-muted-foreground mt-2">
                  Caso qualquer disposição destes Termos seja considerada inválida ou inexequível, 
                  as demais disposições permanecerão em pleno vigor e efeito.
                </p>
              </section>

              {/* Contact */}
              <section>
                <h2 className="text-xl font-semibold text-foreground">11. Contato</h2>
                <Card className="mt-4">
                  <CardContent className="p-6">
                    <p className="text-muted-foreground">
                      Para dúvidas ou esclarecimentos sobre estes Termos de Uso, entre em contato:
                    </p>
                    <div className="mt-4 space-y-2 text-sm">
                      <p className="text-foreground">
                        <strong>E-mail:</strong> contato@assinesaude.com.br
                      </p>
                      <p className="text-foreground">
                        <strong>Privacidade e LGPD:</strong> privacidade@assinesaude.com.br
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </section>

            </div>

            {/* Back Button */}
            <div className="mt-12 text-center">
              <Button variant="outline" asChild>
                <Link to="/">
                  <ChevronLeft className="w-4 h-4 mr-2" />
                  Voltar ao Início
                </Link>
              </Button>
            </div>
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default TermsOfService;

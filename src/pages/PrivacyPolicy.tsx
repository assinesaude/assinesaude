import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, Shield, Lock, Eye, FileText, Users, Database, Mail } from 'lucide-react';

const PrivacyPolicy = () => {
  return (
    <>
      <Helmet>
        <title>Política de Privacidade | AssineSaúde</title>
        <meta name="description" content="Política de Privacidade da AssineSaúde. Saiba como coletamos, usamos e protegemos seus dados pessoais em conformidade com a LGPD." />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href={`${window.location.origin}/politica-de-privacidade`} />
      </Helmet>

      <div className="min-h-screen bg-background">
        <Header />
        
        <main className="container mx-auto px-4 py-12">
          {/* Breadcrumb */}
          <nav className="mb-8" aria-label="Breadcrumb">
            <ol className="flex items-center gap-2 text-sm text-muted-foreground">
              <li><Link to="/" className="hover:text-primary transition-colors">Início</Link></li>
              <li>/</li>
              <li className="text-foreground font-medium">Política de Privacidade</li>
            </ol>
          </nav>

          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="text-center mb-12">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
                <Shield className="w-8 h-8 text-primary" />
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                Política de Privacidade
              </h1>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                A AssineSaúde está comprometida com a proteção dos seus dados pessoais. 
                Esta política explica como coletamos, usamos e protegemos suas informações.
              </p>
              <p className="text-sm text-muted-foreground mt-4">
                Última atualização: Janeiro de 2026
              </p>
            </div>

            {/* Quick Links */}
            <Card className="mb-8">
              <CardContent className="p-6">
                <h2 className="font-semibold mb-4">Navegação Rápida</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <a href="#coleta" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors">
                    <Database className="w-4 h-4" />
                    Dados Coletados
                  </a>
                  <a href="#uso" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors">
                    <Eye className="w-4 h-4" />
                    Uso dos Dados
                  </a>
                  <a href="#direitos" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors">
                    <Users className="w-4 h-4" />
                    Seus Direitos
                  </a>
                  <a href="#contato" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors">
                    <Mail className="w-4 h-4" />
                    Contato DPO
                  </a>
                </div>
              </CardContent>
            </Card>

            {/* Content */}
            <div className="prose prose-gray dark:prose-invert max-w-none space-y-8">
              
              {/* Section 1 */}
              <section>
                <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
                  <FileText className="w-5 h-5 text-primary" />
                  1. Introdução
                </h2>
                <p className="text-muted-foreground">
                  A AssineSaúde ("nós", "nosso" ou "Plataforma") respeita a privacidade de seus usuários 
                  e está comprometida em proteger os dados pessoais que você nos fornece. Esta Política 
                  de Privacidade foi elaborada em conformidade com a Lei Geral de Proteção de Dados 
                  Pessoais (Lei nº 13.709/2018 - LGPD) e demais legislações aplicáveis.
                </p>
                <p className="text-muted-foreground">
                  Ao utilizar nossa plataforma, você concorda com as práticas descritas nesta política. 
                  Recomendamos a leitura atenta deste documento.
                </p>
              </section>

              {/* Section 2 */}
              <section id="coleta">
                <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
                  <Database className="w-5 h-5 text-primary" />
                  2. Dados Pessoais Coletados
                </h2>
                
                <h3 className="text-lg font-medium text-foreground mt-4">2.1 Dados de Cadastro</h3>
                <p className="text-muted-foreground">Coletamos os seguintes dados quando você se cadastra:</p>
                
                <div className="grid md:grid-cols-2 gap-4 mt-4">
                  <Card>
                    <CardContent className="p-4">
                      <h4 className="font-medium text-foreground mb-2">Pacientes</h4>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        <li>• Nome completo</li>
                        <li>• CPF</li>
                        <li>• E-mail</li>
                        <li>• Telefone</li>
                        <li>• Foto de perfil (opcional)</li>
                        <li>• Data de nascimento (opcional)</li>
                        <li>• Endereço (opcional)</li>
                      </ul>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-4">
                      <h4 className="font-medium text-foreground mb-2">Profissionais de Saúde</h4>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        <li>• Nome completo</li>
                        <li>• CPF</li>
                        <li>• Registro profissional</li>
                        <li>• E-mail e telefone</li>
                        <li>• Documentos de identidade profissional</li>
                        <li>• Endereço da clínica/consultório</li>
                        <li>• Foto de perfil</li>
                        <li>• Especialidades e formação</li>
                      </ul>
                    </CardContent>
                  </Card>
                </div>

                <h3 className="text-lg font-medium text-foreground mt-6">2.2 Dados de Uso</h3>
                <p className="text-muted-foreground">
                  Coletamos automaticamente informações sobre como você utiliza nossa plataforma:
                </p>
                <ul className="text-muted-foreground space-y-1 mt-2">
                  <li>• Endereço IP e localização aproximada</li>
                  <li>• Tipo de dispositivo e navegador</li>
                  <li>• Páginas visitadas e tempo de permanência</li>
                  <li>• Cliques e interações na plataforma</li>
                  <li>• Cookies e tecnologias similares</li>
                </ul>

                <h3 className="text-lg font-medium text-foreground mt-6">2.3 Dados Sensíveis</h3>
                <p className="text-muted-foreground">
                  <strong className="text-foreground">Importante:</strong> A AssineSaúde não coleta dados 
                  de saúde dos pacientes. Qualquer informação de saúde compartilhada entre profissional 
                  e paciente é de responsabilidade exclusiva das partes e não é armazenada em nossa plataforma.
                </p>
              </section>

              {/* Section 3 */}
              <section id="uso">
                <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
                  <Eye className="w-5 h-5 text-primary" />
                  3. Como Utilizamos Seus Dados
                </h2>
                
                <p className="text-muted-foreground">Utilizamos seus dados pessoais para as seguintes finalidades:</p>
                
                <div className="space-y-4 mt-4">
                  <Card>
                    <CardContent className="p-4">
                      <h4 className="font-medium text-foreground">Prestação de Serviços</h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        Criar e gerenciar sua conta, conectar pacientes a profissionais de saúde, 
                        exibir perfis públicos de profissionais e processar transações.
                      </p>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-4">
                      <h4 className="font-medium text-foreground">Verificação e Segurança</h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        Verificar a identidade e as credenciais dos profissionais de saúde, 
                        prevenir fraudes e garantir a segurança da plataforma.
                      </p>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-4">
                      <h4 className="font-medium text-foreground">Comunicação</h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        Enviar notificações sobre sua conta, atualizações de serviço, 
                        e comunicações promocionais (com seu consentimento).
                      </p>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-4">
                      <h4 className="font-medium text-foreground">Melhoria da Plataforma</h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        Analisar o uso da plataforma para melhorar nossos serviços, 
                        desenvolver novos recursos e personalizar sua experiência.
                      </p>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-4">
                      <h4 className="font-medium text-foreground">Cumprimento Legal</h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        Cumprir obrigações legais, responder a solicitações de autoridades 
                        e proteger nossos direitos legais.
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </section>

              {/* Section 4 */}
              <section>
                <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
                  <Lock className="w-5 h-5 text-primary" />
                  4. Base Legal para o Tratamento
                </h2>
                
                <p className="text-muted-foreground">
                  O tratamento de seus dados pessoais é realizado com base nas seguintes hipóteses 
                  legais previstas na LGPD:
                </p>
                
                <ul className="text-muted-foreground space-y-2 mt-4">
                  <li>
                    <strong className="text-foreground">Execução de Contrato (Art. 7º, V):</strong> Para 
                    prestação dos serviços contratados através da plataforma.
                  </li>
                  <li>
                    <strong className="text-foreground">Consentimento (Art. 7º, I):</strong> Para 
                    finalidades específicas, como envio de comunicações promocionais.
                  </li>
                  <li>
                    <strong className="text-foreground">Legítimo Interesse (Art. 7º, IX):</strong> Para 
                    melhoria de nossos serviços e prevenção de fraudes.
                  </li>
                  <li>
                    <strong className="text-foreground">Cumprimento de Obrigação Legal (Art. 7º, II):</strong> Quando 
                    exigido por lei ou regulamentação aplicável.
                  </li>
                </ul>
              </section>

              {/* Section 5 */}
              <section>
                <h2 className="text-xl font-semibold text-foreground">5. Compartilhamento de Dados</h2>
                
                <p className="text-muted-foreground">
                  <strong className="text-foreground">Não vendemos seus dados pessoais.</strong> Seus dados 
                  podem ser compartilhados apenas nas seguintes situações:
                </p>
                
                <ul className="text-muted-foreground space-y-2 mt-4">
                  <li>
                    <strong className="text-foreground">Entre Usuários:</strong> Informações públicas de 
                    profissionais (nome, especialidade, foto) são visíveis para pacientes na plataforma.
                  </li>
                  <li>
                    <strong className="text-foreground">Prestadores de Serviço:</strong> Compartilhamos dados 
                    com prestadores que nos auxiliam (hospedagem, processamento de pagamentos), sempre sob 
                    acordos de confidencialidade.
                  </li>
                  <li>
                    <strong className="text-foreground">Obrigações Legais:</strong> Quando exigido por lei, 
                    ordem judicial ou autoridade competente.
                  </li>
                  <li>
                    <strong className="text-foreground">Proteção de Direitos:</strong> Para proteger nossos 
                    direitos, propriedade ou segurança, ou de nossos usuários.
                  </li>
                </ul>
              </section>

              {/* Section 6 */}
              <section>
                <h2 className="text-xl font-semibold text-foreground">6. Segurança dos Dados</h2>
                
                <p className="text-muted-foreground">
                  Implementamos medidas técnicas e organizacionais apropriadas para proteger seus dados:
                </p>
                
                <div className="grid md:grid-cols-2 gap-4 mt-4">
                  <div className="flex items-start gap-3">
                    <Lock className="w-5 h-5 text-primary mt-0.5" />
                    <div>
                      <h4 className="font-medium text-foreground">Criptografia</h4>
                      <p className="text-sm text-muted-foreground">
                        Dados transmitidos são protegidos por criptografia SSL/TLS
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Shield className="w-5 h-5 text-primary mt-0.5" />
                    <div>
                      <h4 className="font-medium text-foreground">Controle de Acesso</h4>
                      <p className="text-sm text-muted-foreground">
                        Acesso restrito a funcionários autorizados
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Database className="w-5 h-5 text-primary mt-0.5" />
                    <div>
                      <h4 className="font-medium text-foreground">Backup Seguro</h4>
                      <p className="text-sm text-muted-foreground">
                        Backups regulares em servidores seguros
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Eye className="w-5 h-5 text-primary mt-0.5" />
                    <div>
                      <h4 className="font-medium text-foreground">Monitoramento</h4>
                      <p className="text-sm text-muted-foreground">
                        Monitoramento contínuo para detectar ameaças
                      </p>
                    </div>
                  </div>
                </div>
              </section>

              {/* Section 7 */}
              <section>
                <h2 className="text-xl font-semibold text-foreground">7. Retenção de Dados</h2>
                
                <p className="text-muted-foreground">
                  Mantemos seus dados pessoais pelo tempo necessário para cumprir as finalidades descritas 
                  nesta política, ou conforme exigido por lei:
                </p>
                
                <ul className="text-muted-foreground space-y-2 mt-4">
                  <li>
                    <strong className="text-foreground">Dados de conta ativa:</strong> Enquanto você 
                    mantiver uma conta em nossa plataforma.
                  </li>
                  <li>
                    <strong className="text-foreground">Após encerramento de conta:</strong> Por até 5 anos, 
                    conforme legislação tributária e comercial aplicável.
                  </li>
                  <li>
                    <strong className="text-foreground">Documentos de profissionais:</strong> Pelo período 
                    exigido pelos conselhos profissionais e legislação aplicável.
                  </li>
                </ul>
              </section>

              {/* Section 8 */}
              <section id="direitos">
                <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
                  <Users className="w-5 h-5 text-primary" />
                  8. Seus Direitos (LGPD)
                </h2>
                
                <p className="text-muted-foreground">
                  A LGPD garante a você os seguintes direitos sobre seus dados pessoais:
                </p>
                
                <div className="grid md:grid-cols-2 gap-4 mt-4">
                  <Card className="border-primary/20">
                    <CardContent className="p-4">
                      <h4 className="font-medium text-foreground">Confirmação e Acesso</h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        Confirmar se tratamos seus dados e acessar as informações que possuímos sobre você.
                      </p>
                    </CardContent>
                  </Card>
                  
                  <Card className="border-primary/20">
                    <CardContent className="p-4">
                      <h4 className="font-medium text-foreground">Correção</h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        Solicitar a correção de dados incompletos, inexatos ou desatualizados.
                      </p>
                    </CardContent>
                  </Card>
                  
                  <Card className="border-primary/20">
                    <CardContent className="p-4">
                      <h4 className="font-medium text-foreground">Anonimização ou Eliminação</h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        Solicitar a anonimização, bloqueio ou eliminação de dados desnecessários ou excessivos.
                      </p>
                    </CardContent>
                  </Card>
                  
                  <Card className="border-primary/20">
                    <CardContent className="p-4">
                      <h4 className="font-medium text-foreground">Portabilidade</h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        Solicitar a portabilidade de seus dados para outro fornecedor de serviço.
                      </p>
                    </CardContent>
                  </Card>
                  
                  <Card className="border-primary/20">
                    <CardContent className="p-4">
                      <h4 className="font-medium text-foreground">Revogação de Consentimento</h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        Revogar o consentimento a qualquer momento, quando o tratamento for baseado nele.
                      </p>
                    </CardContent>
                  </Card>
                  
                  <Card className="border-primary/20">
                    <CardContent className="p-4">
                      <h4 className="font-medium text-foreground">Oposição</h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        Opor-se ao tratamento quando realizado em desconformidade com a LGPD.
                      </p>
                    </CardContent>
                  </Card>
                </div>
                
                <p className="text-muted-foreground mt-4">
                  Para exercer qualquer desses direitos, entre em contato através do e-mail 
                  <strong className="text-foreground"> privacidade@assinesaude.com.br</strong> ou 
                  através do nosso formulário de contato. Responderemos sua solicitação em até 15 dias.
                </p>
              </section>

              {/* Section 9 */}
              <section>
                <h2 className="text-xl font-semibold text-foreground">9. Cookies</h2>
                
                <p className="text-muted-foreground">
                  Utilizamos cookies e tecnologias similares para melhorar sua experiência:
                </p>
                
                <ul className="text-muted-foreground space-y-2 mt-4">
                  <li>
                    <strong className="text-foreground">Cookies Essenciais:</strong> Necessários para o 
                    funcionamento básico da plataforma (autenticação, segurança).
                  </li>
                  <li>
                    <strong className="text-foreground">Cookies de Desempenho:</strong> Coletam informações 
                    sobre como você usa a plataforma para melhorar nossos serviços.
                  </li>
                  <li>
                    <strong className="text-foreground">Cookies de Funcionalidade:</strong> Lembram suas 
                    preferências para personalizar sua experiência.
                  </li>
                </ul>
                
                <p className="text-muted-foreground mt-4">
                  Você pode gerenciar os cookies através das configurações do seu navegador. Note que 
                  desabilitar alguns cookies pode afetar a funcionalidade da plataforma.
                </p>
              </section>

              {/* Section 10 */}
              <section id="contato">
                <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
                  <Mail className="w-5 h-5 text-primary" />
                  10. Contato e Encarregado (DPO)
                </h2>
                
                <Card className="mt-4 border-primary/20 bg-primary/5">
                  <CardContent className="p-6">
                    <h4 className="font-semibold text-foreground mb-4">Encarregado de Proteção de Dados (DPO)</h4>
                    <p className="text-muted-foreground mb-4">
                      Para dúvidas, solicitações ou reclamações relacionadas ao tratamento de seus dados 
                      pessoais, entre em contato com nosso Encarregado de Proteção de Dados:
                    </p>
                    <div className="space-y-2 text-sm">
                      <p className="text-foreground">
                        <strong>E-mail:</strong> privacidade@assinesaude.com.br
                      </p>
                      <p className="text-foreground">
                        <strong>Assunto:</strong> LGPD - [Sua solicitação]
                      </p>
                    </div>
                    <p className="text-sm text-muted-foreground mt-4">
                      Você também pode registrar reclamação junto à Autoridade Nacional de Proteção 
                      de Dados (ANPD) através do site: www.gov.br/anpd
                    </p>
                  </CardContent>
                </Card>
              </section>

              {/* Section 11 */}
              <section>
                <h2 className="text-xl font-semibold text-foreground">11. Alterações nesta Política</h2>
                
                <p className="text-muted-foreground">
                  Podemos atualizar esta Política de Privacidade periodicamente. Quando fizermos alterações 
                  significativas, notificaremos você através da plataforma ou por e-mail. Recomendamos que 
                  você revise esta política regularmente.
                </p>
                
                <p className="text-muted-foreground mt-4">
                  A data da última atualização está indicada no início deste documento.
                </p>
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

export default PrivacyPolicy;

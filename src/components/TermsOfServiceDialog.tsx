import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';

interface TermsOfServiceDialogProps {
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

const TermsOfServiceDialog = ({ trigger, open, onOpenChange }: TermsOfServiceDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="text-xl">Termos de Uso da Plataforma AssineSaúde</DialogTitle>
          <DialogDescription>
            Última atualização: Janeiro de 2026
          </DialogDescription>
        </DialogHeader>
        
        <ScrollArea className="h-[60vh] pr-4">
          <div className="space-y-6 text-sm text-muted-foreground">
            <section>
              <h3 className="text-base font-semibold text-foreground mb-2">1. Apresentação</h3>
              <p>
                A plataforma AssineSaúde é um ambiente digital que conecta profissionais de saúde 
                a pacientes, facilitando a divulgação de programas de atendimento e serviços 
                de saúde. Ao utilizar nossa plataforma, você concorda com os termos aqui descritos.
              </p>
            </section>

            <section>
              <h3 className="text-base font-semibold text-foreground mb-2">2. Responsabilidade pela Prestação de Serviços</h3>
              <p className="mb-2">
                <strong className="text-foreground">A responsabilidade pela prestação de serviços de saúde é 
                exclusivamente do profissional que os publica na plataforma.</strong>
              </p>
              <p>
                A AssineSaúde atua apenas como intermediadora tecnológica, fornecendo a infraestrutura 
                para que profissionais divulguem seus serviços e pacientes os encontrem. A plataforma 
                <strong className="text-foreground"> não se responsabiliza por assuntos que envolvam a relação 
                direta entre profissional e paciente (B2C)</strong>, incluindo, mas não se limitando a:
              </p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Qualidade do atendimento prestado</li>
                <li>Resultados de tratamentos ou procedimentos</li>
                <li>Acordos comerciais entre as partes</li>
                <li>Agendamentos e cancelamentos</li>
                <li>Disputas contratuais entre profissional e paciente</li>
              </ul>
            </section>

            <section>
              <h3 className="text-base font-semibold text-foreground mb-2">3. Exceções à Limitação de Responsabilidade</h3>
              <p>
                A AssineSaúde poderá intervir e tomar as medidas cabíveis nos seguintes casos:
              </p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li><strong className="text-foreground">Práticas criminosas:</strong> Condutas que configurem crimes previstos na legislação brasileira</li>
                <li><strong className="text-foreground">Infrações ao Código de Defesa do Consumidor:</strong> Práticas abusivas, publicidade enganosa, ou outras violações aos direitos do consumidor</li>
                <li><strong className="text-foreground">Violações éticas graves:</strong> Condutas que violem normas dos conselhos profissionais de saúde</li>
              </ul>
              <p className="mt-2">
                Nesses casos, a plataforma colaborará com as autoridades competentes e poderá 
                suspender ou cancelar o cadastro do profissional.
              </p>
            </section>

            <section>
              <h3 className="text-base font-semibold text-foreground mb-2">4. Obrigações do Profissional</h3>
              <p>Ao se cadastrar na plataforma, o profissional de saúde se compromete a:</p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Fornecer informações verdadeiras sobre sua formação e registro profissional</li>
                <li>Manter documentação atualizada e válida</li>
                <li>Prestar serviços de acordo com as normas do seu conselho profissional</li>
                <li>Não utilizar termos regulados como "plano de saúde" para descrever seus serviços</li>
                <li>Respeitar os direitos dos pacientes</li>
              </ul>
            </section>

            <section>
              <h3 className="text-base font-semibold text-foreground mb-2">5. Obrigações do Paciente</h3>
              <p>Ao utilizar a plataforma, o paciente se compromete a:</p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Fornecer informações verdadeiras em seu cadastro</li>
                <li>Utilizar a plataforma de forma ética e respeitosa</li>
                <li>Não realizar avaliações falsas ou difamatórias</li>
                <li>Respeitar os acordos estabelecidos com os profissionais</li>
              </ul>
            </section>

            <section>
              <h3 className="text-base font-semibold text-foreground mb-2">6. Proteção de Dados Pessoais (LGPD)</h3>
              <p className="mb-2">
                <strong className="text-foreground">A AssineSaúde está comprometida com a proteção dos dados pessoais 
                de seus usuários, em conformidade com a Lei Geral de Proteção de Dados (Lei nº 13.709/2018 - LGPD).</strong>
              </p>
              <p className="mb-2">Nossos compromissos incluem:</p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li><strong className="text-foreground">Transparência:</strong> Informamos claramente quais dados coletamos e como são utilizados</li>
                <li><strong className="text-foreground">Finalidade:</strong> Seus dados são coletados apenas para fins específicos e legítimos</li>
                <li><strong className="text-foreground">Segurança:</strong> Implementamos medidas técnicas e administrativas para proteger seus dados</li>
                <li><strong className="text-foreground">Direitos do titular:</strong> Garantimos seus direitos de acesso, correção, exclusão e portabilidade dos dados</li>
                <li><strong className="text-foreground">Consentimento:</strong> Seus dados sensíveis são tratados apenas com seu consentimento expresso</li>
                <li><strong className="text-foreground">Não compartilhamento:</strong> Não vendemos ou compartilhamos seus dados com terceiros sem autorização</li>
              </ul>
              <p className="mt-2">
                Para exercer seus direitos relacionados à LGPD ou obter mais informações sobre 
                nossa política de privacidade, entre em contato através do e-mail: 
                <strong className="text-foreground"> privacidade@assinesaude.com.br</strong>
              </p>
            </section>

            <section>
              <h3 className="text-base font-semibold text-foreground mb-2">7. Modificações nos Termos</h3>
              <p>
                A AssineSaúde reserva-se o direito de modificar estes termos a qualquer momento. 
                As alterações serão comunicadas aos usuários através da plataforma e/ou por e-mail. 
                O uso continuado da plataforma após as modificações implica na aceitação dos novos termos.
              </p>
            </section>

            <section>
              <h3 className="text-base font-semibold text-foreground mb-2">8. Foro</h3>
              <p>
                Fica eleito o foro da Comarca de São Paulo/SP para dirimir quaisquer controvérsias 
                decorrentes destes Termos de Uso, renunciando as partes a qualquer outro, por mais 
                privilegiado que seja.
              </p>
            </section>

            <section className="pt-4 border-t">
              <p className="text-xs text-center text-muted-foreground">
                Ao clicar em "Li e aceito os Termos de Uso", você declara ter lido, compreendido 
                e concordado com todos os termos acima descritos.
              </p>
            </section>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default TermsOfServiceDialog;

import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { User, Stethoscope } from 'lucide-react';
import logoAssinesaude from '@/assets/logo-assinesaude.png';

const RegisterChoice = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-2xl">
        <div className="flex justify-center mb-8">
          <img src={logoAssinesaude} alt="AssineSaúde" className="h-20" />
        </div>
        
        <h1 className="text-3xl font-bold text-center mb-2">Crie sua conta</h1>
        <p className="text-center text-muted-foreground mb-8">
          Escolha o tipo de cadastro que melhor se encaixa para você
        </p>

        <div className="grid md:grid-cols-2 gap-6">
          <Card className="hover:border-primary transition-colors cursor-pointer">
            <Link to="/cadastro/paciente">
              <CardHeader className="text-center">
                <div className="mx-auto bg-accent rounded-full p-4 w-16 h-16 flex items-center justify-center mb-4">
                  <User className="w-8 h-8 text-accent-foreground" />
                </div>
                <CardTitle>Sou Paciente</CardTitle>
                <CardDescription>
                  Quero encontrar profissionais de saúde e agendar consultas
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full" variant="outline">
                  Cadastrar como Paciente
                </Button>
              </CardContent>
            </Link>
          </Card>

          <Card className="hover:border-primary transition-colors cursor-pointer">
            <Link to="/cadastro/profissional">
              <CardHeader className="text-center">
                <div className="mx-auto bg-primary/10 rounded-full p-4 w-16 h-16 flex items-center justify-center mb-4">
                  <Stethoscope className="w-8 h-8 text-primary" />
                </div>
                <CardTitle>Sou Profissional</CardTitle>
                <CardDescription>
                  Quero oferecer meus serviços de saúde na plataforma
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full">
                  Cadastrar como Profissional
                </Button>
              </CardContent>
            </Link>
          </Card>
        </div>

        <p className="text-center text-sm text-muted-foreground mt-8">
          Já tem uma conta?{' '}
          <Link to="/login" className="text-primary hover:underline">
            Entrar
          </Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterChoice;

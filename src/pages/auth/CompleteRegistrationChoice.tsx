import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { User, Stethoscope } from 'lucide-react';
import logoAssinesaude from '@/assets/logo-assinesaude.png';
import { useAuth } from '@/hooks/useAuth';
import { Navigate } from 'react-router-dom';

const CompleteRegistrationChoice = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-2xl">
        <div className="flex justify-center mb-8">
          <img src={logoAssinesaude} alt="AssineSaúde" className="h-20" />
        </div>
        
        <h1 className="text-3xl font-bold text-center mb-2">Complete seu cadastro</h1>
        <p className="text-center text-muted-foreground mb-8">
          Escolha o tipo de conta para continuar
        </p>

        <div className="grid md:grid-cols-2 gap-6">
          <Card className="hover:border-primary transition-colors cursor-pointer">
            <Link to="/completar-cadastro/paciente">
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
                  Continuar como Paciente
                </Button>
              </CardContent>
            </Link>
          </Card>

          <Card className="hover:border-primary transition-colors cursor-pointer">
            <Link to="/completar-cadastro/profissional">
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
                  Continuar como Profissional
                </Button>
              </CardContent>
            </Link>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CompleteRegistrationChoice;

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

const AuthCallback = () => {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) throw sessionError;
        
        if (!session?.user) {
          navigate('/login');
          return;
        }

        // Check if user has any roles
        const { data: roles } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', session.user.id);

        if (!roles || roles.length === 0) {
          // New user - needs to choose registration type
          navigate('/completar-cadastro');
          return;
        }

        // Check if profile is complete based on role
        const hasAdmin = roles.some(r => r.role === 'admin');
        const hasProfessional = roles.some(r => r.role === 'professional');
        const hasPatient = roles.some(r => r.role === 'patient');

        if (hasAdmin) {
          navigate('/admin');
          return;
        }

        if (hasProfessional) {
          const { data: profile } = await supabase
            .from('professional_profiles')
            .select('id, full_name, cpf')
            .eq('user_id', session.user.id)
            .maybeSingle();

          if (!profile || !profile.full_name || !profile.cpf) {
            navigate('/completar-cadastro/profissional');
            return;
          }
          navigate('/profissional');
          return;
        }

        if (hasPatient) {
          const { data: profile } = await supabase
            .from('patient_profiles')
            .select('id, full_name, cpf')
            .eq('user_id', session.user.id)
            .maybeSingle();

          if (!profile || !profile.full_name || !profile.cpf) {
            navigate('/completar-cadastro/paciente');
            return;
          }
          navigate('/paciente');
          return;
        }

        navigate('/completar-cadastro');
      } catch (err: any) {
        console.error('Auth callback error:', err);
        setError(err.message);
        setTimeout(() => navigate('/login'), 3000);
      }
    };

    handleAuthCallback();
  }, [navigate]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <p className="text-destructive mb-2">Erro: {error}</p>
          <p className="text-muted-foreground">Redirecionando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
    </div>
  );
};

export default AuthCallback;

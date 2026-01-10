import { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

type AppRole = 'admin' | 'professional' | 'patient';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: AppRole;
  requireApproval?: boolean;
}

export const ProtectedRoute = ({ children, requiredRole, requireApproval = false }: ProtectedRouteProps) => {
  const { user, loading, hasRole, roles } = useAuth();
  const location = useLocation();
  const [profileCheck, setProfileCheck] = useState<'loading' | 'complete' | 'incomplete'>('loading');

  useEffect(() => {
    const checkProfileCompletion = async () => {
      if (!user || loading) return;

      // Admin users don't need profile completion
      if (hasRole('admin')) {
        setProfileCheck('complete');
        return;
      }

      // Check based on required role
      if (requiredRole === 'professional' || hasRole('professional')) {
        const { data: profile } = await supabase
          .from('professional_profiles')
          .select('id, full_name, cpf, profession_id')
          .eq('user_id', user.id)
          .maybeSingle();

        if (!profile || !profile.full_name || !profile.cpf || !profile.profession_id) {
          setProfileCheck('incomplete');
          return;
        }
      }

      if (requiredRole === 'patient' || hasRole('patient')) {
        const { data: profile } = await supabase
          .from('patient_profiles')
          .select('id, full_name, cpf')
          .eq('user_id', user.id)
          .maybeSingle();

        if (!profile || !profile.full_name || !profile.cpf) {
          setProfileCheck('incomplete');
          return;
        }
      }

      setProfileCheck('complete');
    };

    if (!loading && user) {
      checkProfileCompletion();
    }
  }, [user, loading, hasRole, requiredRole, roles]);

  if (loading || profileCheck === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check if user has no roles yet
  if (roles.length === 0) {
    return <Navigate to="/completar-cadastro" replace />;
  }

  if (requiredRole && !hasRole(requiredRole)) {
    return <Navigate to="/" replace />;
  }

  // Redirect to complete profile if incomplete
  if (profileCheck === 'incomplete') {
    if (hasRole('professional')) {
      return <Navigate to="/completar-cadastro/profissional" replace />;
    }
    if (hasRole('patient')) {
      return <Navigate to="/completar-cadastro/paciente" replace />;
    }
    return <Navigate to="/completar-cadastro" replace />;
  }

  return <>{children}</>;
};

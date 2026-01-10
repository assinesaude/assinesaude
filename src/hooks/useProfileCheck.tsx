import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { supabase } from '@/integrations/supabase/client';

type ProfileStatus = 'loading' | 'complete' | 'incomplete' | 'no-role';

interface ProfileCheckResult {
  status: ProfileStatus;
  profileType: 'patient' | 'professional' | null;
  needsCompletion: boolean;
}

export const useProfileCheck = () => {
  const { user, roles, loading: authLoading } = useAuth();
  const [profileStatus, setProfileStatus] = useState<ProfileCheckResult>({
    status: 'loading',
    profileType: null,
    needsCompletion: false,
  });

  useEffect(() => {
    const checkProfile = async () => {
      if (authLoading) return;
      
      if (!user) {
        setProfileStatus({ status: 'loading', profileType: null, needsCompletion: false });
        return;
      }

      // Check if user has any role
      const hasPatientRole = roles.includes('patient');
      const hasProfessionalRole = roles.includes('professional');
      const hasAdminRole = roles.includes('admin');

      // Admin users don't need profile completion
      if (hasAdminRole) {
        setProfileStatus({ status: 'complete', profileType: null, needsCompletion: false });
        return;
      }

      // User has no role yet - needs to choose and complete registration
      if (!hasPatientRole && !hasProfessionalRole) {
        setProfileStatus({ status: 'no-role', profileType: null, needsCompletion: true });
        return;
      }

      // Check if professional profile is complete
      if (hasProfessionalRole) {
        const { data: profile } = await supabase
          .from('professional_profiles')
          .select('id, full_name, cpf, profession_id, specialty_id')
          .eq('user_id', user.id)
          .maybeSingle();

        if (!profile || !profile.full_name || !profile.cpf || !profile.profession_id) {
          setProfileStatus({ status: 'incomplete', profileType: 'professional', needsCompletion: true });
          return;
        }

        setProfileStatus({ status: 'complete', profileType: 'professional', needsCompletion: false });
        return;
      }

      // Check if patient profile is complete
      if (hasPatientRole) {
        const { data: profile } = await supabase
          .from('patient_profiles')
          .select('id, full_name, cpf')
          .eq('user_id', user.id)
          .maybeSingle();

        if (!profile || !profile.full_name || !profile.cpf) {
          setProfileStatus({ status: 'incomplete', profileType: 'patient', needsCompletion: true });
          return;
        }

        setProfileStatus({ status: 'complete', profileType: 'patient', needsCompletion: false });
        return;
      }
    };

    checkProfile();
  }, [user, roles, authLoading]);

  return { ...profileStatus, loading: authLoading || profileStatus.status === 'loading' };
};

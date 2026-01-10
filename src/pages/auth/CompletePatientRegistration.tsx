import { useState, useEffect } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import logoAssinesaude from '@/assets/logo-assinesaude.png';
import { ArrowLeft, Upload, User } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import TermsOfServiceDialog from '@/components/TermsOfServiceDialog';
import { useAuth } from '@/hooks/useAuth';

const CompletePatientRegistration = () => {
  const { user, loading: authLoading, roles } = useAuth();
  const [formData, setFormData] = useState({
    fullName: '',
    cpf: '',
    phone: '',
  });
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checkingProfile, setCheckingProfile] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Check if user already has a complete patient profile
  useEffect(() => {
    const checkExistingProfile = async () => {
      if (!user) return;

      const { data: profile } = await supabase
        .from('patient_profiles')
        .select('id, full_name, cpf')
        .eq('user_id', user.id)
        .maybeSingle();

      if (profile && profile.full_name && profile.cpf) {
        navigate('/paciente');
        return;
      }

      // Pre-fill with existing data if any
      if (profile) {
        setFormData({
          fullName: profile.full_name || '',
          cpf: '',
          phone: '',
        });
      }

      // Pre-fill name from Google account if available
      if (!profile && user.user_metadata?.full_name) {
        setFormData(prev => ({
          ...prev,
          fullName: user.user_metadata.full_name || '',
        }));
      }

      setCheckingProfile(false);
    };

    if (!authLoading) {
      checkExistingProfile();
    }
  }, [user, authLoading, navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadAvatar = async (userId: string): Promise<string | null> => {
    if (!avatarFile) return null;
    
    const fileExt = avatarFile.name.split('.').pop();
    const fileName = `${userId}/avatar-${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('professional-documents')
      .upload(fileName, avatarFile);

    if (uploadError) {
      console.error('Avatar upload error:', uploadError);
      return null;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('professional-documents')
      .getPublicUrl(fileName);

    return publicUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: 'Você precisa estar logado.',
      });
      return;
    }

    setLoading(true);

    try {
      // Upload avatar if provided
      const avatarUrl = await uploadAvatar(user.id);

      // Check if profile already exists
      const { data: existingProfile } = await supabase
        .from('patient_profiles')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (existingProfile) {
        // Update existing profile
        const { error: profileError } = await supabase
          .from('patient_profiles')
          .update({
            full_name: formData.fullName,
            cpf: formData.cpf,
            phone: formData.phone,
            avatar_url: avatarUrl || undefined,
          })
          .eq('user_id', user.id);

        if (profileError) throw profileError;
      } else {
        // Create patient profile
        const { error: profileError } = await supabase
          .from('patient_profiles')
          .insert({
            user_id: user.id,
            full_name: formData.fullName,
            cpf: formData.cpf,
            phone: formData.phone,
            avatar_url: avatarUrl,
          });

        if (profileError) throw profileError;
      }

      // Check if user already has patient role
      const hasPatientRole = roles.includes('patient');

      if (!hasPatientRole) {
        // Assign patient role
        const { error: roleError } = await supabase
          .from('user_roles')
          .insert({
            user_id: user.id,
            role: 'patient',
          });

        if (roleError) throw roleError;
      }

      toast({
        title: 'Cadastro completo!',
        description: 'Seu perfil foi atualizado com sucesso.',
      });

      // Force a page reload to update roles in context
      window.location.href = '/paciente';
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Erro ao completar cadastro',
        description: error.message || 'Ocorreu um erro ao atualizar seu perfil.',
      });
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || checkingProfile) {
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
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <Button
            variant="ghost"
            size="icon"
            className="absolute left-4 top-4"
            onClick={() => navigate('/completar-cadastro')}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex justify-center mb-4">
            <img src={logoAssinesaude} alt="AssineSaúde" className="h-14" />
          </div>
          <CardTitle className="text-2xl">Complete seu Cadastro</CardTitle>
          <CardDescription>
            Preencha seus dados para acessar a plataforma
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {/* Avatar Upload */}
            <div className="flex flex-col items-center gap-4">
              <Avatar className="h-24 w-24">
                <AvatarImage src={avatarPreview || user.user_metadata?.avatar_url || undefined} />
                <AvatarFallback className="bg-muted">
                  <User className="h-12 w-12 text-muted-foreground" />
                </AvatarFallback>
              </Avatar>
              <div className="relative">
                <Input
                  id="avatar"
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => document.getElementById('avatar')?.click()}
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Escolher Foto
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="fullName">Nome Completo</Label>
              <Input
                id="fullName"
                name="fullName"
                placeholder="Seu nome completo"
                value={formData.fullName}
                onChange={handleChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cpf">CPF</Label>
              <Input
                id="cpf"
                name="cpf"
                placeholder="000.000.000-00"
                value={formData.cpf}
                onChange={handleChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Telefone</Label>
              <Input
                id="phone"
                name="phone"
                placeholder="(00) 00000-0000"
                value={formData.phone}
                onChange={handleChange}
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            {/* Terms Acceptance */}
            <div className="flex items-start space-x-2 w-full">
              <Checkbox
                id="terms"
                checked={acceptedTerms}
                onCheckedChange={(checked) => setAcceptedTerms(checked === true)}
              />
              <label
                htmlFor="terms"
                className="text-sm text-muted-foreground leading-tight cursor-pointer"
              >
                Li e aceito os{' '}
                <TermsOfServiceDialog
                  trigger={
                    <button type="button" className="text-primary hover:underline font-medium">
                      Termos de Uso
                    </button>
                  }
                />
              </label>
            </div>

            <Button type="submit" className="w-full" disabled={loading || !acceptedTerms}>
              {loading ? 'Salvando...' : 'Completar Cadastro'}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default CompletePatientRegistration;

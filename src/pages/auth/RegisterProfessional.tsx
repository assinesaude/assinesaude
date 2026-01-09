import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import logoAssinesaude from '@/assets/logo-assinesaude.png';
import { ArrowLeft, Upload, FileCheck } from 'lucide-react';

const RegisterProfessional = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    cpf: '',
    professionalRegistration: '',
    specialty: '',
    phone: '',
    clinicName: '',
    clinicAddress: '',
    city: '',
    state: '',
  });
  const [documentFront, setDocumentFront] = useState<File | null>(null);
  const [documentBack, setDocumentBack] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, side: 'front' | 'back') => {
    const file = e.target.files?.[0];
    if (file) {
      if (side === 'front') {
        setDocumentFront(file);
      } else {
        setDocumentBack(file);
      }
    }
  };

  const uploadDocument = async (file: File, userId: string, side: 'front' | 'back') => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}/${side}-${Date.now()}.${fileExt}`;

    const { error: uploadError, data } = await supabase.storage
      .from('professional-documents')
      .upload(fileName, file);

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage
      .from('professional-documents')
      .getPublicUrl(fileName);

    return publicUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: 'As senhas não coincidem.',
      });
      return;
    }

    if (!documentFront || !documentBack) {
      toast({
        variant: 'destructive',
        title: 'Documentos obrigatórios',
        description: 'Por favor, envie a frente e o verso da sua identidade profissional.',
      });
      return;
    }

    setLoading(true);

    try {
      // Create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          emailRedirectTo: window.location.origin,
        },
      });

      if (authError) throw authError;

      if (authData.user) {
        // Upload documents
        const frontUrl = await uploadDocument(documentFront, authData.user.id, 'front');
        const backUrl = await uploadDocument(documentBack, authData.user.id, 'back');

        // Create professional profile
        const { error: profileError } = await supabase
          .from('professional_profiles')
          .insert({
            user_id: authData.user.id,
            full_name: formData.fullName,
            cpf: formData.cpf,
            professional_registration: formData.professionalRegistration,
            specialty: formData.specialty,
            phone: formData.phone,
            clinic_name: formData.clinicName,
            clinic_address: formData.clinicAddress,
            city: formData.city,
            state: formData.state,
            document_front_url: frontUrl,
            document_back_url: backUrl,
            approval_status: 'pending',
          });

        if (profileError) throw profileError;

        // Assign professional role
        const { error: roleError } = await supabase
          .from('user_roles')
          .insert({
            user_id: authData.user.id,
            role: 'professional',
          });

        if (roleError) throw roleError;

        toast({
          title: 'Cadastro enviado!',
          description: 'Seu cadastro foi enviado para análise. Você será notificado quando for aprovado.',
        });

        navigate('/profissional');
      }
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Erro ao cadastrar',
        description: error.message || 'Ocorreu um erro ao criar sua conta.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 py-12">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center relative">
          <Link to="/cadastro" className="absolute left-4 top-4 text-muted-foreground hover:text-foreground">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="flex justify-center mb-4">
            <img src={logoAssinesaude} alt="AssineSaúde" className="h-14" />
          </div>
          <CardTitle className="text-2xl">Cadastro de Profissional</CardTitle>
          <CardDescription>
            Preencha seus dados e envie seus documentos para verificação
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2 space-y-2">
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
              <div className="space-y-2">
                <Label htmlFor="professionalRegistration">Registro Profissional</Label>
                <Input
                  id="professionalRegistration"
                  name="professionalRegistration"
                  placeholder="CRM, CRO, CREFITO..."
                  value={formData.professionalRegistration}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="specialty">Especialidade</Label>
                <Input
                  id="specialty"
                  name="specialty"
                  placeholder="Sua especialidade"
                  value={formData.specialty}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="col-span-2 space-y-2">
                <Label htmlFor="clinicName">Nome da Clínica (opcional)</Label>
                <Input
                  id="clinicName"
                  name="clinicName"
                  placeholder="Nome do seu consultório"
                  value={formData.clinicName}
                  onChange={handleChange}
                />
              </div>
              <div className="col-span-2 space-y-2">
                <Label htmlFor="clinicAddress">Endereço de Atendimento</Label>
                <Input
                  id="clinicAddress"
                  name="clinicAddress"
                  placeholder="Rua, número, complemento"
                  value={formData.clinicAddress}
                  onChange={handleChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="city">Cidade</Label>
                <Input
                  id="city"
                  name="city"
                  placeholder="Cidade"
                  value={formData.city}
                  onChange={handleChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="state">Estado</Label>
                <Input
                  id="state"
                  name="state"
                  placeholder="UF"
                  value={formData.state}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="border-t pt-4 mt-4">
              <h3 className="font-semibold mb-4">Documentos de Verificação</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Envie fotos da frente e verso da sua identidade profissional (CRM, CRO, etc.)
              </p>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="documentFront">Frente do Documento</Label>
                  <div className="relative">
                    <Input
                      id="documentFront"
                      type="file"
                      accept="image/*,.pdf"
                      onChange={(e) => handleFileChange(e, 'front')}
                      className="hidden"
                      required
                    />
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full h-24 flex flex-col gap-2"
                      onClick={() => document.getElementById('documentFront')?.click()}
                    >
                      {documentFront ? (
                        <>
                          <FileCheck className="w-6 h-6 text-primary" />
                          <span className="text-xs truncate max-w-full">{documentFront.name}</span>
                        </>
                      ) : (
                        <>
                          <Upload className="w-6 h-6" />
                          <span className="text-xs">Frente</span>
                        </>
                      )}
                    </Button>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="documentBack">Verso do Documento</Label>
                  <div className="relative">
                    <Input
                      id="documentBack"
                      type="file"
                      accept="image/*,.pdf"
                      onChange={(e) => handleFileChange(e, 'back')}
                      className="hidden"
                      required
                    />
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full h-24 flex flex-col gap-2"
                      onClick={() => document.getElementById('documentBack')?.click()}
                    >
                      {documentBack ? (
                        <>
                          <FileCheck className="w-6 h-6 text-primary" />
                          <span className="text-xs truncate max-w-full">{documentBack.name}</span>
                        </>
                      ) : (
                        <>
                          <Upload className="w-6 h-6" />
                          <span className="text-xs">Verso</span>
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t pt-4 mt-4 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="password">Senha</Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    minLength={6}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirmar Senha</Label>
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    placeholder="••••••••"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                    minLength={6}
                  />
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Enviando cadastro...' : 'Enviar para Verificação'}
            </Button>
            <p className="text-sm text-center text-muted-foreground">
              Já tem uma conta?{' '}
              <Link to="/login" className="text-primary hover:underline">
                Entrar
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default RegisterProfessional;

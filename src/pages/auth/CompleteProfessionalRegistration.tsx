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
import { ArrowLeft, Upload, FileCheck, User } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import TermsOfServiceDialog from '@/components/TermsOfServiceDialog';
import { useAuth } from '@/hooks/useAuth';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface Profession {
  id: string;
  name: string;
}

interface Council {
  id: string;
  name: string;
  abbreviation: string;
  profession_id: string;
}

interface Specialty {
  id: string;
  name: string;
  profession_id: string;
}

interface BrazilianState {
  id: string;
  name: string;
  abbreviation: string;
}

interface BrazilianCity {
  id: string;
  name: string;
  state_id: string;
}

const CompleteProfessionalRegistration = () => {
  const { user, loading: authLoading, roles } = useAuth();
  const [formData, setFormData] = useState({
    fullName: '',
    cpf: '',
    professionalRegistration: '',
    phone: '',
    clinicName: '',
    clinicAddress: '',
    zipCode: '',
  });
  
  const [selectedProfession, setSelectedProfession] = useState('');
  const [selectedCouncil, setSelectedCouncil] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('');
  const [selectedState, setSelectedState] = useState('');
  const [selectedCity, setSelectedCity] = useState('');

  const [professions, setProfessions] = useState<Profession[]>([]);
  const [councils, setCouncils] = useState<Council[]>([]);
  const [specialties, setSpecialties] = useState<Specialty[]>([]);
  const [states, setStates] = useState<BrazilianState[]>([]);
  const [cities, setCities] = useState<BrazilianCity[]>([]);

  const [documentFront, setDocumentFront] = useState<File | null>(null);
  const [documentBack, setDocumentBack] = useState<File | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checkingProfile, setCheckingProfile] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Fetch initial data
  useEffect(() => {
    const fetchData = async () => {
      const [professionsRes, statesRes] = await Promise.all([
        supabase.from('professions').select('*').eq('is_active', true).order('name'),
        supabase.from('brazilian_states').select('*').order('name'),
      ]);

      if (professionsRes.data) setProfessions(professionsRes.data);
      if (statesRes.data) setStates(statesRes.data);
    };

    fetchData();
  }, []);

  // Check if user already has a complete professional profile
  useEffect(() => {
    const checkExistingProfile = async () => {
      if (!user) return;

      const { data: profile } = await supabase
        .from('professional_profiles')
        .select('id, full_name, cpf, profession_id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (profile && profile.full_name && profile.cpf && profile.profession_id) {
        navigate('/profissional');
        return;
      }

      // Pre-fill name from Google account if available
      if (user.user_metadata?.full_name) {
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

  // Fetch councils and specialties when profession changes
  useEffect(() => {
    const fetchProfessionData = async () => {
      if (!selectedProfession) {
        setCouncils([]);
        setSpecialties([]);
        setSelectedCouncil('');
        setSelectedSpecialty('');
        return;
      }

      const [councilsRes, specialtiesRes] = await Promise.all([
        supabase.from('professional_councils').select('*').eq('profession_id', selectedProfession).eq('is_active', true),
        supabase.from('specialties').select('*').eq('profession_id', selectedProfession).eq('is_active', true).order('name'),
      ]);

      if (councilsRes.data) setCouncils(councilsRes.data);
      if (specialtiesRes.data) setSpecialties(specialtiesRes.data);
      
      if (councilsRes.data?.length === 1) {
        setSelectedCouncil(councilsRes.data[0].id);
      } else {
        setSelectedCouncil('');
      }
      setSelectedSpecialty('');
    };

    fetchProfessionData();
  }, [selectedProfession]);

  // Fetch cities when state changes
  useEffect(() => {
    const fetchCities = async () => {
      if (!selectedState) {
        setCities([]);
        setSelectedCity('');
        return;
      }

      const { data } = await supabase
        .from('brazilian_cities')
        .select('*')
        .eq('state_id', selectedState)
        .order('name');

      if (data) setCities(data);
      setSelectedCity('');
    };

    fetchCities();
  }, [selectedState]);

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

  const uploadDocument = async (file: File, userId: string, side: 'front' | 'back') => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}/${side}-${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('professional-documents')
      .upload(fileName, file);

    if (uploadError) throw uploadError;

    // Store the path reference - the URL will be generated as signed URL when needed
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

    if (!selectedProfession || !selectedSpecialty) {
      toast({
        variant: 'destructive',
        title: 'Campos obrigatórios',
        description: 'Por favor, selecione sua profissão e especialidade.',
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
      // Upload documents and avatar
      const frontUrl = await uploadDocument(documentFront, user.id, 'front');
      const backUrl = await uploadDocument(documentBack, user.id, 'back');
      const avatarUrl = await uploadAvatar(user.id);

      // Get selected values for display
      const selectedSpecialtyData = specialties.find(s => s.id === selectedSpecialty);
      const selectedStateData = states.find(s => s.id === selectedState);
      const selectedCityData = cities.find(c => c.id === selectedCity);

      // Check if profile already exists
      const { data: existingProfile } = await supabase
        .from('professional_profiles')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (existingProfile) {
        // Update existing profile
        const { error: profileError } = await supabase
          .from('professional_profiles')
          .update({
            full_name: formData.fullName,
            cpf: formData.cpf,
            professional_registration: formData.professionalRegistration,
            specialty: selectedSpecialtyData?.name || '',
            profession_id: selectedProfession,
            specialty_id: selectedSpecialty,
            council_id: selectedCouncil || null,
            phone: formData.phone,
            clinic_name: formData.clinicName,
            clinic_address: formData.clinicAddress,
            city: selectedCityData?.name || '',
            state: selectedStateData?.abbreviation || '',
            zip_code: formData.zipCode,
            document_front_url: frontUrl,
            document_back_url: backUrl,
            avatar_url: avatarUrl || undefined,
            approval_status: 'pending',
          })
          .eq('user_id', user.id);

        if (profileError) throw profileError;
      } else {
        // Create professional profile
        const { error: profileError } = await supabase
          .from('professional_profiles')
          .insert({
            user_id: user.id,
            full_name: formData.fullName,
            cpf: formData.cpf,
            professional_registration: formData.professionalRegistration,
            specialty: selectedSpecialtyData?.name || '',
            profession_id: selectedProfession,
            specialty_id: selectedSpecialty,
            council_id: selectedCouncil || null,
            phone: formData.phone,
            clinic_name: formData.clinicName,
            clinic_address: formData.clinicAddress,
            city: selectedCityData?.name || '',
            state: selectedStateData?.abbreviation || '',
            zip_code: formData.zipCode,
            document_front_url: frontUrl,
            document_back_url: backUrl,
            avatar_url: avatarUrl,
            approval_status: 'pending',
          });

        if (profileError) throw profileError;
      }

      // Check if user already has professional role
      const hasProfessionalRole = roles.includes('professional');

      if (!hasProfessionalRole) {
        // Assign professional role
        const { error: roleError } = await supabase
          .from('user_roles')
          .insert({
            user_id: user.id,
            role: 'professional',
          });

        if (roleError) throw roleError;
      }

      toast({
        title: 'Cadastro enviado!',
        description: 'Seu cadastro foi enviado para análise. Você será notificado quando for aprovado.',
      });

      // Force a page reload to update roles in context
      window.location.href = '/profissional';
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Erro ao completar cadastro',
        description: error.message || 'Ocorreu um erro ao criar seu perfil.',
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
    <div className="min-h-screen flex items-center justify-center bg-background p-4 py-12">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center relative">
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
          <CardTitle className="text-2xl">Complete seu Cadastro Profissional</CardTitle>
          <CardDescription>
            Preencha seus dados e envie seus documentos para verificação
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {/* Avatar Upload */}
            <div className="flex flex-col items-center gap-4 pb-4 border-b">
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
                  Escolher Foto de Perfil
                </Button>
              </div>
            </div>

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

              {/* Profession Select */}
              <div className="col-span-2 space-y-2">
                <Label>Profissão *</Label>
                <Select value={selectedProfession} onValueChange={setSelectedProfession}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione sua profissão" />
                  </SelectTrigger>
                  <SelectContent>
                    {professions.map((profession) => (
                      <SelectItem key={profession.id} value={profession.id}>
                        {profession.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Specialty Select */}
              <div className="space-y-2">
                <Label>Especialidade *</Label>
                <Select 
                  value={selectedSpecialty} 
                  onValueChange={setSelectedSpecialty}
                  disabled={!selectedProfession}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    {specialties.map((specialty) => (
                      <SelectItem key={specialty.id} value={specialty.id}>
                        {specialty.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Council Select */}
              <div className="space-y-2">
                <Label>Conselho</Label>
                <Select 
                  value={selectedCouncil} 
                  onValueChange={setSelectedCouncil}
                  disabled={!selectedProfession}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    {councils.map((council) => (
                      <SelectItem key={council.id} value={council.id}>
                        {council.abbreviation} - {council.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="col-span-2 space-y-2">
                <Label htmlFor="professionalRegistration">Número do Registro Profissional</Label>
                <Input
                  id="professionalRegistration"
                  name="professionalRegistration"
                  placeholder="Ex: 12345-SP"
                  value={formData.professionalRegistration}
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

              {/* State Select */}
              <div className="space-y-2">
                <Label>Estado *</Label>
                <Select value={selectedState} onValueChange={setSelectedState}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    {states.map((state) => (
                      <SelectItem key={state.id} value={state.id}>
                        {state.name} ({state.abbreviation})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* City Select */}
              <div className="space-y-2">
                <Label>Cidade</Label>
                <Select 
                  value={selectedCity} 
                  onValueChange={setSelectedCity}
                  disabled={!selectedState || cities.length === 0}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={cities.length === 0 ? "Digite sua cidade abaixo" : "Selecione"} />
                  </SelectTrigger>
                  <SelectContent>
                    {cities.map((city) => (
                      <SelectItem key={city.id} value={city.id}>
                        {city.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="zipCode">CEP</Label>
                <Input
                  id="zipCode"
                  name="zipCode"
                  placeholder="00000-000"
                  value={formData.zipCode}
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
              {loading ? 'Enviando cadastro...' : 'Enviar para Verificação'}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default CompleteProfessionalRegistration;

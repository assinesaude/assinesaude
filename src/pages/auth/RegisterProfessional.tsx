import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import logoAssinesaude from '@/assets/logo-assinesaude.png';
import { ArrowLeft, Upload, FileCheck, User } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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

const RegisterProfessional = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
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
  const [loading, setLoading] = useState(false);
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
      
      // Auto-select council if there's only one
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
        // Upload documents and avatar
        const frontUrl = await uploadDocument(documentFront, authData.user.id, 'front');
        const backUrl = await uploadDocument(documentBack, authData.user.id, 'back');
        const avatarUrl = await uploadAvatar(authData.user.id);

        // Get selected values for display
        const selectedProfessionData = professions.find(p => p.id === selectedProfession);
        const selectedSpecialtyData = specialties.find(s => s.id === selectedSpecialty);
        const selectedStateData = states.find(s => s.id === selectedState);
        const selectedCityData = cities.find(c => c.id === selectedCity);

        // Create professional profile
        const { error: profileError } = await supabase
          .from('professional_profiles')
          .insert({
            user_id: authData.user.id,
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
            {/* Avatar Upload */}
            <div className="flex flex-col items-center gap-4 pb-4 border-b">
              <Avatar className="h-24 w-24">
                <AvatarImage src={avatarPreview || undefined} />
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
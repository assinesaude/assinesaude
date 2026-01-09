import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Send, Calendar, Users, Filter } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';

interface Profession {
  id: string;
  name: string;
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

interface PlatformMessage {
  id: string;
  title: string;
  content: string;
  message_type: string;
  target_audience: string;
  is_automatic: boolean;
  sent_at: string | null;
  created_at: string;
}

const MessagesManager = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<PlatformMessage[]>([]);

  // Filter options
  const [professions, setProfessions] = useState<Profession[]>([]);
  const [specialties, setSpecialties] = useState<Specialty[]>([]);
  const [states, setStates] = useState<BrazilianState[]>([]);
  const [cities, setCities] = useState<BrazilianCity[]>([]);

  // Form state
  const [messageForm, setMessageForm] = useState({
    title: '',
    content: '',
    messageType: 'manual',
    targetAudience: 'all',
    professionId: '',
    specialtyId: '',
    stateId: '',
    cityId: '',
    isAutomatic: false,
  });

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    // Fetch specialties when profession changes
    const fetchSpecialties = async () => {
      if (!messageForm.professionId) {
        setSpecialties([]);
        return;
      }
      const { data } = await supabase
        .from('specialties')
        .select('*')
        .eq('profession_id', messageForm.professionId)
        .eq('is_active', true)
        .order('name');
      if (data) setSpecialties(data);
    };
    fetchSpecialties();
  }, [messageForm.professionId]);

  useEffect(() => {
    // Fetch cities when state changes
    const fetchCities = async () => {
      if (!messageForm.stateId) {
        setCities([]);
        return;
      }
      const { data } = await supabase
        .from('brazilian_cities')
        .select('*')
        .eq('state_id', messageForm.stateId)
        .order('name');
      if (data) setCities(data);
    };
    fetchCities();
  }, [messageForm.stateId]);

  const fetchInitialData = async () => {
    const [professionsRes, statesRes, messagesRes] = await Promise.all([
      supabase.from('professions').select('*').eq('is_active', true).order('name'),
      supabase.from('brazilian_states').select('*').order('name'),
      supabase.from('platform_messages').select('*').order('created_at', { ascending: false }).limit(50),
    ]);

    if (professionsRes.data) setProfessions(professionsRes.data);
    if (statesRes.data) setStates(statesRes.data);
    if (messagesRes.data) setMessages(messagesRes.data);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageForm.title.trim() || !messageForm.content.trim()) {
      toast({ variant: 'destructive', title: 'Erro', description: 'Preencha título e conteúdo.' });
      return;
    }

    setLoading(true);

    const { error } = await supabase.from('platform_messages').insert({
      title: messageForm.title,
      content: messageForm.content,
      message_type: messageForm.messageType,
      target_audience: messageForm.targetAudience,
      filter_profession_id: messageForm.professionId || null,
      filter_specialty_id: messageForm.specialtyId || null,
      filter_state_id: messageForm.stateId || null,
      filter_city_id: messageForm.cityId || null,
      is_automatic: messageForm.isAutomatic,
      sent_at: new Date().toISOString(),
      created_by: user?.id,
    });

    if (error) {
      toast({ variant: 'destructive', title: 'Erro', description: 'Não foi possível enviar a mensagem.' });
    } else {
      toast({ title: 'Sucesso', description: 'Mensagem enviada!' });
      setMessageForm({
        title: '',
        content: '',
        messageType: 'manual',
        targetAudience: 'all',
        professionId: '',
        specialtyId: '',
        stateId: '',
        cityId: '',
        isAutomatic: false,
      });
      fetchInitialData();
    }

    setLoading(false);
  };

  const getMessageTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      manual: 'Manual',
      holiday: 'Feriado',
      promotion: 'Promoção',
      birthday: 'Aniversário',
    };
    return types[type] || type;
  };

  const getAudienceLabel = (audience: string) => {
    const audiences: Record<string, string> = {
      all: 'Todos',
      professionals: 'Profissionais',
      patients: 'Pacientes',
    };
    return audiences[audience] || audience;
  };

  return (
    <div className="space-y-6">
      {/* Send new message */}
      <Card>
        <CardHeader>
          <CardTitle>Enviar Nova Mensagem</CardTitle>
          <CardDescription>Comunique-se com profissionais e pacientes da plataforma</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSendMessage} className="space-y-6">
            {/* Message details */}
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2 space-y-2">
                <Label htmlFor="title">Título da Mensagem</Label>
                <Input
                  id="title"
                  value={messageForm.title}
                  onChange={(e) => setMessageForm({ ...messageForm, title: e.target.value })}
                  placeholder="Ex: Feliz Ano Novo!"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Tipo de Mensagem</Label>
                <Select
                  value={messageForm.messageType}
                  onValueChange={(value) => setMessageForm({ ...messageForm, messageType: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="manual">Manual</SelectItem>
                    <SelectItem value="holiday">Feriado</SelectItem>
                    <SelectItem value="promotion">Promoção</SelectItem>
                    <SelectItem value="birthday">Aniversário</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Público-alvo</Label>
                <Select
                  value={messageForm.targetAudience}
                  onValueChange={(value) => setMessageForm({ ...messageForm, targetAudience: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="professionals">Apenas Profissionais</SelectItem>
                    <SelectItem value="patients">Apenas Pacientes</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="col-span-2 space-y-2">
                <Label htmlFor="content">Conteúdo</Label>
                <Textarea
                  id="content"
                  value={messageForm.content}
                  onChange={(e) => setMessageForm({ ...messageForm, content: e.target.value })}
                  placeholder="Escreva sua mensagem aqui..."
                  rows={4}
                  required
                />
              </div>
            </div>

            {/* Filters */}
            <div className="border-t pt-4">
              <div className="flex items-center gap-2 mb-4">
                <Filter className="w-4 h-4" />
                <h4 className="font-medium">Filtros (opcional)</h4>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {messageForm.targetAudience !== 'patients' && (
                  <>
                    <div className="space-y-2">
                      <Label>Profissão</Label>
                      <Select
                        value={messageForm.professionId}
                        onValueChange={(value) => setMessageForm({ ...messageForm, professionId: value, specialtyId: '' })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Todas" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">Todas</SelectItem>
                          {professions.map((p) => (
                            <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Especialidade</Label>
                      <Select
                        value={messageForm.specialtyId}
                        onValueChange={(value) => setMessageForm({ ...messageForm, specialtyId: value })}
                        disabled={!messageForm.professionId}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Todas" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">Todas</SelectItem>
                          {specialties.map((s) => (
                            <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </>
                )}

                <div className="space-y-2">
                  <Label>Estado</Label>
                  <Select
                    value={messageForm.stateId}
                    onValueChange={(value) => setMessageForm({ ...messageForm, stateId: value, cityId: '' })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Todos" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Todos</SelectItem>
                      {states.map((s) => (
                        <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Cidade</Label>
                  <Select
                    value={messageForm.cityId}
                    onValueChange={(value) => setMessageForm({ ...messageForm, cityId: value })}
                    disabled={!messageForm.stateId}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Todas" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Todas</SelectItem>
                      {cities.map((c) => (
                        <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Automatic messages toggle */}
            <div className="flex items-center justify-between border-t pt-4">
              <div className="space-y-1">
                <Label>Mensagem Automática</Label>
                <p className="text-sm text-muted-foreground">
                  Ativar para mensagens recorrentes (aniversários, feriados)
                </p>
              </div>
              <Switch
                checked={messageForm.isAutomatic}
                onCheckedChange={(checked) => setMessageForm({ ...messageForm, isAutomatic: checked })}
              />
            </div>

            <Button type="submit" disabled={loading} className="w-full">
              <Send className="w-4 h-4 mr-2" />
              {loading ? 'Enviando...' : 'Enviar Mensagem'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Message history */}
      <Card>
        <CardHeader>
          <CardTitle>Histórico de Mensagens</CardTitle>
          <CardDescription>Últimas mensagens enviadas</CardDescription>
        </CardHeader>
        <CardContent>
          {messages.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">Nenhuma mensagem enviada ainda.</p>
          ) : (
            <div className="space-y-4">
              {messages.map((message) => (
                <div key={message.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-medium">{message.title}</h4>
                    <div className="flex gap-2">
                      <Badge variant="outline">{getMessageTypeLabel(message.message_type)}</Badge>
                      <Badge variant="secondary">{getAudienceLabel(message.target_audience)}</Badge>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">{message.content}</p>
                  <p className="text-xs text-muted-foreground">
                    Enviada em: {new Date(message.sent_at || message.created_at).toLocaleString('pt-BR')}
                  </p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default MessagesManager;
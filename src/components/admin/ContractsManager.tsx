import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { FileText, Edit, Plus, Eye, Trash2, Copy, Download } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';

interface ContractTemplate {
  id: string;
  name: string;
  description: string | null;
  type: 'platform' | 'service';
  content: string;
  variables: string[];
  is_active: boolean;
  created_at: string;
}

const ContractsManager = () => {
  const { toast } = useToast();
  const [contracts, setContracts] = useState<ContractTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [editingContract, setEditingContract] = useState<ContractTemplate | null>(null);
  const [previewContent, setPreviewContent] = useState('');
  
  const [form, setForm] = useState({
    name: '',
    description: '',
    type: 'platform' as 'platform' | 'service',
    content: '',
    is_active: true,
  });

  useEffect(() => {
    fetchContracts();
  }, []);

  const fetchContracts = async () => {
    setLoading(true);
    const { data, error } = await (supabase
      .from('contract_templates' as any)
      .select('*')
      .order('type', { ascending: true }) as any);

    if (error) {
      console.error('Error fetching contracts:', error);
      toast({ variant: 'destructive', title: 'Erro', description: 'Não foi possível carregar os contratos.' });
    } else if (data) {
      setContracts(data.map((c: any) => ({
        ...c,
        variables: Array.isArray(c.variables) ? c.variables : JSON.parse(c.variables || '[]')
      })));
    }
    setLoading(false);
  };

  const extractVariables = (content: string): string[] => {
    const regex = /\{\{(\w+)\}\}/g;
    const matches = content.match(regex);
    if (!matches) return [];
    return [...new Set(matches.map(m => m.replace(/\{\{|\}\}/g, '')))];
  };

  const openDialog = (contract?: ContractTemplate) => {
    if (contract) {
      setEditingContract(contract);
      setForm({
        name: contract.name,
        description: contract.description || '',
        type: contract.type,
        content: contract.content,
        is_active: contract.is_active,
      });
    } else {
      setEditingContract(null);
      setForm({
        name: '',
        description: '',
        type: 'platform',
        content: '',
        is_active: true,
      });
    }
    setShowDialog(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const variables = extractVariables(form.content);

    if (editingContract) {
      const { error } = await (supabase
        .from('contract_templates' as any)
        .update({
          name: form.name,
          description: form.description,
          type: form.type,
          content: form.content,
          variables: variables,
          is_active: form.is_active,
        })
        .eq('id', editingContract.id) as any);

      if (error) {
        toast({ variant: 'destructive', title: 'Erro', description: 'Não foi possível atualizar o contrato.' });
      } else {
        toast({ title: 'Contrato atualizado!', description: `O contrato "${form.name}" foi atualizado.` });
        setShowDialog(false);
        fetchContracts();
      }
    } else {
      const { error } = await (supabase
        .from('contract_templates' as any)
        .insert({
          name: form.name,
          description: form.description,
          type: form.type,
          content: form.content,
          variables: variables,
          is_active: form.is_active,
        }) as any);

      if (error) {
        toast({ variant: 'destructive', title: 'Erro', description: 'Não foi possível criar o contrato.' });
      } else {
        toast({ title: 'Contrato criado!', description: `O contrato "${form.name}" foi criado.` });
        setShowDialog(false);
        fetchContracts();
      }
    }
  };

  const handleDelete = async (id: string) => {
    const { error } = await (supabase
      .from('contract_templates' as any)
      .delete()
      .eq('id', id) as any);

    if (error) {
      toast({ variant: 'destructive', title: 'Erro', description: 'Não foi possível excluir o contrato.' });
    } else {
      toast({ title: 'Contrato excluído!', description: 'O contrato foi removido.' });
      fetchContracts();
    }
  };

  const handlePreview = (contract: ContractTemplate) => {
    // Generate sample preview with placeholder values
    let preview = contract.content;
    const sampleValues: Record<string, string> = {
      contract_number: 'CTR-2026-001',
      date: new Date().toLocaleDateString('pt-BR'),
      professional_name: 'Dr. João Silva',
      professional_cpf: '123.456.789-00',
      professional_registration: 'CRM-SP 123456',
      professional_specialty: 'Cardiologia',
      professional_address: 'Rua das Flores, 123',
      professional_city: 'São Paulo',
      professional_state: 'SP',
      professional_phone: '(11) 99999-9999',
      clinic_name: 'Clínica Coração Saudável',
      clinic_address: 'Av. Paulista, 1000 - Sala 501',
      patient_name: 'Maria Oliveira',
      patient_cpf: '987.654.321-00',
      patient_birth_date: '15/03/1985',
      patient_address: 'Rua das Palmeiras, 456',
      patient_city: 'São Paulo',
      patient_state: 'SP',
      patient_phone: '(11) 98888-8888',
      service_title: 'Consulta Cardiológica Completa',
      service_description: 'Avaliação completa com ECG e orientações',
      service_duration: '60',
      service_price: '350,00',
      payment_method: 'Cartão de Crédito',
      payment_date: new Date().toLocaleDateString('pt-BR'),
      plan_name: 'Plano Premium',
      plan_price: '149,90',
      plan_features: 'Perfil verificado, Cupons ilimitados, Suporte prioritário',
      start_date: new Date().toLocaleDateString('pt-BR'),
      end_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toLocaleDateString('pt-BR'),
    };

    contract.variables.forEach(variable => {
      const value = sampleValues[variable] || `[${variable}]`;
      preview = preview.replace(new RegExp(`\\{\\{${variable}\\}\\}`, 'g'), value);
    });

    setPreviewContent(preview);
    setShowPreview(true);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: 'Copiado!', description: 'Conteúdo copiado para a área de transferência.' });
  };

  const platformContracts = contracts.filter(c => c.type === 'platform');
  const serviceContracts = contracts.filter(c => c.type === 'service');

  if (loading) {
    return <div className="text-center py-12">Carregando contratos...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Modelos de Contrato</h2>
          <p className="text-muted-foreground">Gerencie os modelos de contrato da plataforma</p>
        </div>
        <Button onClick={() => openDialog()}>
          <Plus className="w-4 h-4 mr-2" />
          Novo Contrato
        </Button>
      </div>

      <Tabs defaultValue="platform" className="space-y-4">
        <TabsList>
          <TabsTrigger value="platform">
            <FileText className="w-4 h-4 mr-2" />
            Plataforma B2B ({platformContracts.length})
          </TabsTrigger>
          <TabsTrigger value="service">
            <FileText className="w-4 h-4 mr-2" />
            Serviços B2C ({serviceContracts.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="platform">
          {platformContracts.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                Nenhum contrato de plataforma cadastrado.
              </CardContent>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              {platformContracts.map(contract => (
                <ContractCard 
                  key={contract.id} 
                  contract={contract} 
                  onEdit={() => openDialog(contract)}
                  onPreview={() => handlePreview(contract)}
                  onDelete={() => handleDelete(contract.id)}
                  onCopy={() => copyToClipboard(contract.content)}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="service">
          {serviceContracts.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                Nenhum contrato de serviço cadastrado.
              </CardContent>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              {serviceContracts.map(contract => (
                <ContractCard 
                  key={contract.id} 
                  contract={contract} 
                  onEdit={() => openDialog(contract)}
                  onPreview={() => handlePreview(contract)}
                  onDelete={() => handleDelete(contract.id)}
                  onCopy={() => copyToClipboard(contract.content)}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Edit/Create Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>{editingContract ? 'Editar Contrato' : 'Novo Contrato'}</DialogTitle>
            <DialogDescription>
              Use variáveis no formato {'{{nome_variavel}}'} para campos dinâmicos.
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleSave} className="flex-1 overflow-hidden flex flex-col">
            <ScrollArea className="flex-1 pr-4">
              <div className="space-y-4 pb-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Nome do Contrato</Label>
                    <Input
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      placeholder="Ex: Contrato de Prestação de Serviços"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Tipo</Label>
                    <select
                      value={form.type}
                      onChange={(e) => setForm({ ...form, type: e.target.value as 'platform' | 'service' })}
                      className="w-full h-10 px-3 rounded-md border border-input bg-background"
                    >
                      <option value="platform">Plataforma (B2B)</option>
                      <option value="service">Serviço (B2C)</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Descrição</Label>
                  <Input
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    placeholder="Breve descrição do contrato"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Conteúdo do Contrato (Markdown)</Label>
                  <Textarea
                    value={form.content}
                    onChange={(e) => setForm({ ...form, content: e.target.value })}
                    placeholder="# CONTRATO DE PRESTAÇÃO DE SERVIÇOS&#10;&#10;Nome: {{professional_name}}&#10;..."
                    rows={20}
                    className="font-mono text-sm"
                    required
                  />
                </div>

                {form.content && (
                  <div className="p-4 bg-accent/50 rounded-lg">
                    <Label className="text-sm font-medium">Variáveis detectadas:</Label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {extractVariables(form.content).map(v => (
                        <Badge key={v} variant="secondary" className="font-mono text-xs">
                          {`{{${v}}}`}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <Switch
                    checked={form.is_active}
                    onCheckedChange={(checked) => setForm({ ...form, is_active: checked })}
                  />
                  <Label>Contrato ativo</Label>
                </div>
              </div>
            </ScrollArea>

            <DialogFooter className="pt-4 border-t">
              <Button type="button" variant="outline" onClick={() => setShowDialog(false)}>
                Cancelar
              </Button>
              <Button type="submit">
                {editingContract ? 'Atualizar' : 'Criar Contrato'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Preview Dialog */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-4xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>Pré-visualização do Contrato</DialogTitle>
            <DialogDescription>
              Esta é uma prévia com dados de exemplo.
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="h-[60vh] pr-4">
            <div className="prose prose-sm max-w-none whitespace-pre-wrap font-mono text-sm bg-card p-6 rounded-lg border">
              {previewContent}
            </div>
          </ScrollArea>
          <DialogFooter>
            <Button variant="outline" onClick={() => copyToClipboard(previewContent)}>
              <Copy className="w-4 h-4 mr-2" />
              Copiar
            </Button>
            <Button onClick={() => setShowPreview(false)}>Fechar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

interface ContractCardProps {
  contract: ContractTemplate;
  onEdit: () => void;
  onPreview: () => void;
  onDelete: () => void;
  onCopy: () => void;
}

const ContractCard = ({ contract, onEdit, onPreview, onDelete, onCopy }: ContractCardProps) => {
  return (
    <Card className={!contract.is_active ? 'opacity-60' : ''}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <FileText className="w-8 h-8 text-primary mt-1" />
            <div>
              <CardTitle className="text-lg">{contract.name}</CardTitle>
              <CardDescription>{contract.description}</CardDescription>
            </div>
          </div>
          <Badge variant={contract.is_active ? 'default' : 'secondary'}>
            {contract.is_active ? 'Ativo' : 'Inativo'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label className="text-xs text-muted-foreground">Variáveis disponíveis:</Label>
          <div className="flex flex-wrap gap-1 mt-1">
            {contract.variables.slice(0, 5).map(v => (
              <Badge key={v} variant="outline" className="text-xs font-mono">
                {v}
              </Badge>
            ))}
            {contract.variables.length > 5 && (
              <Badge variant="outline" className="text-xs">
                +{contract.variables.length - 5} mais
              </Badge>
            )}
          </div>
        </div>

        <div className="flex gap-2 pt-2 border-t">
          <Button variant="outline" size="sm" onClick={onPreview}>
            <Eye className="w-4 h-4 mr-1" />
            Prévia
          </Button>
          <Button variant="outline" size="sm" onClick={onCopy}>
            <Copy className="w-4 h-4 mr-1" />
            Copiar
          </Button>
          <Button variant="outline" size="sm" onClick={onEdit}>
            <Edit className="w-4 h-4 mr-1" />
            Editar
          </Button>
          <Button variant="destructive" size="sm" onClick={onDelete}>
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ContractsManager;

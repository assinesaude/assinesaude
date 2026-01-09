import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Plus, Trash2, Edit2, Save, X, ChevronDown, ChevronRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface Profession {
  id: string;
  name: string;
  is_active: boolean;
}

interface Council {
  id: string;
  name: string;
  abbreviation: string;
  profession_id: string;
  is_active: boolean;
}

interface Specialty {
  id: string;
  name: string;
  profession_id: string;
  is_active: boolean;
}

const ProfessionsManager = () => {
  const { toast } = useToast();
  const [professions, setProfessions] = useState<Profession[]>([]);
  const [councils, setCouncils] = useState<Council[]>([]);
  const [specialties, setSpecialties] = useState<Specialty[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedProfession, setExpandedProfession] = useState<string | null>(null);

  // Form states
  const [newProfession, setNewProfession] = useState('');
  const [newCouncil, setNewCouncil] = useState({ name: '', abbreviation: '', professionId: '' });
  const [newSpecialty, setNewSpecialty] = useState({ name: '', professionId: '' });
  const [editingProfession, setEditingProfession] = useState<{ id: string; name: string } | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    const [professionsRes, councilsRes, specialtiesRes] = await Promise.all([
      supabase.from('professions').select('*').order('name'),
      supabase.from('professional_councils').select('*').order('abbreviation'),
      supabase.from('specialties').select('*').order('name'),
    ]);

    if (professionsRes.data) setProfessions(professionsRes.data);
    if (councilsRes.data) setCouncils(councilsRes.data);
    if (specialtiesRes.data) setSpecialties(specialtiesRes.data);
    setLoading(false);
  };

  // Profession CRUD
  const handleAddProfession = async () => {
    if (!newProfession.trim()) return;

    const { error } = await supabase.from('professions').insert({ name: newProfession.trim() });

    if (error) {
      toast({ variant: 'destructive', title: 'Erro', description: 'Não foi possível adicionar a profissão.' });
    } else {
      toast({ title: 'Sucesso', description: 'Profissão adicionada!' });
      setNewProfession('');
      fetchData();
    }
  };

  const handleUpdateProfession = async () => {
    if (!editingProfession) return;

    const { error } = await supabase
      .from('professions')
      .update({ name: editingProfession.name })
      .eq('id', editingProfession.id);

    if (error) {
      toast({ variant: 'destructive', title: 'Erro', description: 'Não foi possível atualizar.' });
    } else {
      toast({ title: 'Sucesso', description: 'Profissão atualizada!' });
      setEditingProfession(null);
      fetchData();
    }
  };

  const handleDeleteProfession = async (id: string) => {
    const { error } = await supabase.from('professions').delete().eq('id', id);

    if (error) {
      toast({ variant: 'destructive', title: 'Erro', description: 'Não foi possível excluir. Verifique se não há profissionais vinculados.' });
    } else {
      toast({ title: 'Sucesso', description: 'Profissão excluída!' });
      fetchData();
    }
  };

  // Council CRUD
  const handleAddCouncil = async (professionId: string) => {
    if (!newCouncil.name.trim() || !newCouncil.abbreviation.trim()) return;

    const { error } = await supabase.from('professional_councils').insert({
      name: newCouncil.name.trim(),
      abbreviation: newCouncil.abbreviation.trim().toUpperCase(),
      profession_id: professionId,
    });

    if (error) {
      toast({ variant: 'destructive', title: 'Erro', description: 'Não foi possível adicionar o conselho.' });
    } else {
      toast({ title: 'Sucesso', description: 'Conselho adicionado!' });
      setNewCouncil({ name: '', abbreviation: '', professionId: '' });
      fetchData();
    }
  };

  const handleDeleteCouncil = async (id: string) => {
    const { error } = await supabase.from('professional_councils').delete().eq('id', id);

    if (error) {
      toast({ variant: 'destructive', title: 'Erro', description: 'Não foi possível excluir o conselho.' });
    } else {
      toast({ title: 'Sucesso', description: 'Conselho excluído!' });
      fetchData();
    }
  };

  // Specialty CRUD
  const handleAddSpecialty = async (professionId: string) => {
    if (!newSpecialty.name.trim()) return;

    const { error } = await supabase.from('specialties').insert({
      name: newSpecialty.name.trim(),
      profession_id: professionId,
    });

    if (error) {
      toast({ variant: 'destructive', title: 'Erro', description: 'Não foi possível adicionar a especialidade.' });
    } else {
      toast({ title: 'Sucesso', description: 'Especialidade adicionada!' });
      setNewSpecialty({ name: '', professionId: '' });
      fetchData();
    }
  };

  const handleDeleteSpecialty = async (id: string) => {
    const { error } = await supabase.from('specialties').delete().eq('id', id);

    if (error) {
      toast({ variant: 'destructive', title: 'Erro', description: 'Não foi possível excluir a especialidade.' });
    } else {
      toast({ title: 'Sucesso', description: 'Especialidade excluída!' });
      fetchData();
    }
  };

  if (loading) {
    return <div className="text-center py-8">Carregando...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Add new profession */}
      <Card>
        <CardHeader>
          <CardTitle>Adicionar Nova Profissão</CardTitle>
          <CardDescription>Crie uma nova categoria profissional</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Input
              value={newProfession}
              onChange={(e) => setNewProfession(e.target.value)}
              placeholder="Nome da profissão (ex: Dentista)"
              className="flex-1"
            />
            <Button onClick={handleAddProfession}>
              <Plus className="w-4 h-4 mr-2" />
              Adicionar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Professions list */}
      <div className="space-y-4">
        {professions.map((profession) => {
          const professionCouncils = councils.filter((c) => c.profession_id === profession.id);
          const professionSpecialties = specialties.filter((s) => s.profession_id === profession.id);
          const isExpanded = expandedProfession === profession.id;

          return (
            <Collapsible
              key={profession.id}
              open={isExpanded}
              onOpenChange={() => setExpandedProfession(isExpanded ? null : profession.id)}
            >
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CollapsibleTrigger className="flex items-center gap-2 hover:text-primary">
                      {isExpanded ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                      {editingProfession?.id === profession.id ? (
                        <Input
                          value={editingProfession.name}
                          onChange={(e) => setEditingProfession({ ...editingProfession, name: e.target.value })}
                          className="w-48"
                          onClick={(e) => e.stopPropagation()}
                        />
                      ) : (
                        <CardTitle className="text-lg">{profession.name}</CardTitle>
                      )}
                    </CollapsibleTrigger>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{professionCouncils.length} conselho(s)</Badge>
                      <Badge variant="outline">{professionSpecialties.length} especialidade(s)</Badge>
                      {editingProfession?.id === profession.id ? (
                        <>
                          <Button size="sm" variant="ghost" onClick={handleUpdateProfession}>
                            <Save className="w-4 h-4" />
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => setEditingProfession(null)}>
                            <X className="w-4 h-4" />
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setEditingProfession({ id: profession.id, name: profession.name })}
                          >
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button size="sm" variant="ghost" className="text-destructive">
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Excluir Profissão</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Isso excluirá também todos os conselhos e especialidades associados. Essa ação não pode
                                  ser desfeita.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDeleteProfession(profession.id)}>
                                  Excluir
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </>
                      )}
                    </div>
                  </div>
                </CardHeader>

                <CollapsibleContent>
                  <CardContent className="space-y-6 pt-0">
                    {/* Councils Section */}
                    <div>
                      <h4 className="font-medium mb-3">Conselhos Profissionais</h4>
                      <div className="space-y-2 mb-4">
                        {professionCouncils.map((council) => (
                          <div key={council.id} className="flex items-center justify-between bg-muted/50 p-2 rounded">
                            <span>
                              <strong>{council.abbreviation}</strong> - {council.name}
                            </span>
                            <Button size="sm" variant="ghost" className="text-destructive" onClick={() => handleDeleteCouncil(council.id)}>
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                      <div className="flex gap-2">
                        <Input
                          placeholder="Sigla (ex: CRO)"
                          value={newCouncil.professionId === profession.id ? newCouncil.abbreviation : ''}
                          onChange={(e) => setNewCouncil({ ...newCouncil, abbreviation: e.target.value, professionId: profession.id })}
                          className="w-24"
                        />
                        <Input
                          placeholder="Nome completo do conselho"
                          value={newCouncil.professionId === profession.id ? newCouncil.name : ''}
                          onChange={(e) => setNewCouncil({ ...newCouncil, name: e.target.value, professionId: profession.id })}
                          className="flex-1"
                        />
                        <Button size="sm" onClick={() => handleAddCouncil(profession.id)}>
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Specialties Section */}
                    <div>
                      <h4 className="font-medium mb-3">Especialidades</h4>
                      <div className="flex flex-wrap gap-2 mb-4">
                        {professionSpecialties.map((specialty) => (
                          <Badge key={specialty.id} variant="secondary" className="pr-1">
                            {specialty.name}
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-auto p-1 ml-1 text-destructive hover:text-destructive"
                              onClick={() => handleDeleteSpecialty(specialty.id)}
                            >
                              <X className="w-3 h-3" />
                            </Button>
                          </Badge>
                        ))}
                      </div>
                      <div className="flex gap-2">
                        <Input
                          placeholder="Nome da especialidade"
                          value={newSpecialty.professionId === profession.id ? newSpecialty.name : ''}
                          onChange={(e) => setNewSpecialty({ name: e.target.value, professionId: profession.id })}
                          className="flex-1"
                        />
                        <Button size="sm" onClick={() => handleAddSpecialty(profession.id)}>
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </CollapsibleContent>
              </Card>
            </Collapsible>
          );
        })}
      </div>
    </div>
  );
};

export default ProfessionsManager;
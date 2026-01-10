import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { Plus, Edit, Trash2, GripVertical, Save, X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Stethoscope, 
  SmilePlus, 
  Brain, 
  Apple, 
  Accessibility, 
  HeartPulse, 
  PawPrint, 
  Pill,
  Baby,
  Eye,
  Ear,
  Bone,
  Syringe,
  Microscope,
  Activity,
  Heart,
  Thermometer,
  Bandage,
  Dna,
  Scan,
  Waves,
  Footprints,
  Hand,
  PersonStanding
} from 'lucide-react';

interface Category {
  id: string;
  name: string;
  icon_url: string;
  display_order: number;
  is_active: boolean;
}

// Lista de ícones disponíveis
const availableIcons = [
  { name: 'stethoscope', label: 'Estetoscópio (Medicina)', icon: Stethoscope },
  { name: 'smile-plus', label: 'Sorriso (Odontologia)', icon: SmilePlus },
  { name: 'brain', label: 'Cérebro (Psicologia)', icon: Brain },
  { name: 'apple', label: 'Maçã (Nutrição)', icon: Apple },
  { name: 'accessibility', label: 'Acessibilidade (Fisioterapia)', icon: Accessibility },
  { name: 'heart-pulse', label: 'Coração (Enfermagem)', icon: HeartPulse },
  { name: 'paw-print', label: 'Pata (Veterinária)', icon: PawPrint },
  { name: 'pill', label: 'Pílula (Farmácia)', icon: Pill },
  { name: 'baby', label: 'Bebê (Pediatria)', icon: Baby },
  { name: 'eye', label: 'Olho (Oftalmologia)', icon: Eye },
  { name: 'ear', label: 'Ouvido (Otorrino)', icon: Ear },
  { name: 'bone', label: 'Osso (Ortopedia)', icon: Bone },
  { name: 'syringe', label: 'Seringa (Dermatologia)', icon: Syringe },
  { name: 'microscope', label: 'Microscópio (Patologia)', icon: Microscope },
  { name: 'heart', label: 'Coração (Cardiologia)', icon: Heart },
  { name: 'thermometer', label: 'Termômetro (Geral)', icon: Thermometer },
  { name: 'bandage', label: 'Curativo (Emergência)', icon: Bandage },
  { name: 'dna', label: 'DNA (Genética)', icon: Dna },
  { name: 'scan', label: 'Scan (Radiologia)', icon: Scan },
  { name: 'waves', label: 'Ondas (Fonoaudiologia)', icon: Waves },
  { name: 'footprints', label: 'Pegadas (Podologia)', icon: Footprints },
  { name: 'hand', label: 'Mão (Terapia Ocupacional)', icon: Hand },
  { name: 'person-standing', label: 'Pessoa (Educação Física)', icon: PersonStanding },
  { name: 'activity', label: 'Atividade (Padrão)', icon: Activity },
];

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {};
availableIcons.forEach(icon => {
  iconMap[icon.name] = icon.icon;
});

const CategoriesManager = () => {
  const { toast } = useToast();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [form, setForm] = useState({ name: '', icon_url: 'stethoscope', display_order: 0 });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('activity_categories')
      .select('id, name, icon_url, display_order, is_active')
      .order('display_order');
    
    if (data) setCategories(data);
    setLoading(false);
  };

  const openDialog = (category?: Category) => {
    if (category) {
      setEditingCategory(category);
      setForm({ 
        name: category.name, 
        icon_url: category.icon_url || 'stethoscope', 
        display_order: category.display_order 
      });
    } else {
      setEditingCategory(null);
      const maxOrder = categories.length > 0 
        ? Math.max(...categories.map(c => c.display_order)) + 1 
        : 1;
      setForm({ name: '', icon_url: 'stethoscope', display_order: maxOrder });
    }
    setShowDialog(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!form.name) {
      toast({ variant: 'destructive', title: 'Erro', description: 'Preencha o nome da categoria.' });
      return;
    }

    if (editingCategory) {
      const { error } = await supabase
        .from('activity_categories')
        .update({
          name: form.name,
          icon_url: form.icon_url,
          display_order: form.display_order,
        })
        .eq('id', editingCategory.id);

      if (error) {
        toast({ variant: 'destructive', title: 'Erro', description: 'Não foi possível atualizar a categoria.' });
      } else {
        toast({ title: 'Sucesso!', description: 'Categoria atualizada.' });
        setShowDialog(false);
        fetchCategories();
      }
    } else {
      const { error } = await supabase
        .from('activity_categories')
        .insert({
          name: form.name,
          icon_url: form.icon_url,
          display_order: form.display_order,
        });

      if (error) {
        toast({ variant: 'destructive', title: 'Erro', description: 'Não foi possível criar a categoria.' });
      } else {
        toast({ title: 'Sucesso!', description: 'Categoria criada.' });
        setShowDialog(false);
        fetchCategories();
      }
    }
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase
      .from('activity_categories')
      .delete()
      .eq('id', id);

    if (error) {
      toast({ variant: 'destructive', title: 'Erro', description: 'Não foi possível excluir a categoria.' });
    } else {
      toast({ title: 'Sucesso!', description: 'Categoria excluída.' });
      fetchCategories();
    }
  };

  const handleToggleStatus = async (category: Category) => {
    const { error } = await supabase
      .from('activity_categories')
      .update({ is_active: !category.is_active })
      .eq('id', category.id);

    if (error) {
      toast({ variant: 'destructive', title: 'Erro', description: 'Não foi possível alterar o status.' });
    } else {
      fetchCategories();
    }
  };

  const getIconComponent = (iconName: string) => {
    return iconMap[iconName] || Activity;
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Gerenciar Categorias de Profissões</CardTitle>
          <CardDescription>Adicione e edite as categorias exibidas na página inicial</CardDescription>
        </div>
        <Button onClick={() => openDialog()}>
          <Plus className="w-4 h-4 mr-2" />
          Nova Categoria
        </Button>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-center py-8">Carregando...</div>
        ) : categories.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">Nenhuma categoria cadastrada</div>
        ) : (
          <div className="space-y-3">
            {categories.map((category) => {
              const IconComponent = getIconComponent(category.icon_url);
              
              return (
                <div 
                  key={category.id} 
                  className="flex items-center gap-4 p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                >
                  <GripVertical className="w-5 h-5 text-muted-foreground cursor-grab" />
                  
                  <div className="w-14 h-14 rounded-full border border-primary/30 flex items-center justify-center bg-muted/30">
                    <IconComponent className="w-8 h-8 text-primary" />
                  </div>

                  <div className="flex-1">
                    <p className="font-medium">{category.name}</p>
                    <p className="text-sm text-muted-foreground">Ícone: {category.icon_url}</p>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">Ordem: {category.display_order}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Switch 
                      checked={category.is_active} 
                      onCheckedChange={() => handleToggleStatus(category)}
                    />
                    <span className="text-sm">{category.is_active ? 'Ativo' : 'Inativo'}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="icon" onClick={() => openDialog(category)}>
                      <Edit className="w-4 h-4" />
                    </Button>
                    
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" size="icon" className="text-destructive hover:text-destructive">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Excluir categoria?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Esta ação não pode ser desfeita. A categoria "{category.name}" será removida permanentemente.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDelete(category.id)}>
                            Excluir
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingCategory ? 'Editar Categoria' : 'Nova Categoria'}</DialogTitle>
            <DialogDescription>
              {editingCategory ? 'Atualize as informações da categoria' : 'Preencha os dados da nova categoria'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSave}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome *</Label>
                <Input 
                  id="name" 
                  value={form.name} 
                  onChange={(e) => setForm({...form, name: e.target.value})}
                  placeholder="Ex: Medicina"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="icon">Ícone *</Label>
                <Select 
                  value={form.icon_url} 
                  onValueChange={(value) => setForm({...form, icon_url: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um ícone" />
                  </SelectTrigger>
                  <SelectContent className="max-h-[300px]">
                    {availableIcons.map((iconOption) => {
                      const IconComp = iconOption.icon;
                      return (
                        <SelectItem key={iconOption.name} value={iconOption.name}>
                          <div className="flex items-center gap-2">
                            <IconComp className="w-5 h-5 text-primary" />
                            <span>{iconOption.label}</span>
                          </div>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
                
                {/* Preview do ícone selecionado */}
                <div className="mt-3 flex justify-center">
                  <div className="w-20 h-20 rounded-full border-2 border-primary/30 flex items-center justify-center bg-muted/30">
                    {(() => {
                      const PreviewIcon = getIconComponent(form.icon_url);
                      return <PreviewIcon className="w-10 h-10 text-primary" />;
                    })()}
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="display_order">Ordem de Exibição</Label>
                <Input 
                  id="display_order" 
                  type="number"
                  value={form.display_order} 
                  onChange={(e) => setForm({...form, display_order: parseInt(e.target.value) || 0})}
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowDialog(false)}>
                <X className="w-4 h-4 mr-2" />
                Cancelar
              </Button>
              <Button type="submit">
                <Save className="w-4 h-4 mr-2" />
                Salvar
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default CategoriesManager;

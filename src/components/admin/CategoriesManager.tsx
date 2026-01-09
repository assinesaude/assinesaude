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

interface Category {
  id: string;
  name: string;
  icon_url: string;
  display_order: number;
  is_active: boolean;
}

const CategoriesManager = () => {
  const { toast } = useToast();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [form, setForm] = useState({ name: '', icon_url: '', display_order: 0 });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('activity_categories' as any)
      .select('id, name, icon_url, display_order, is_active')
      .order('display_order');
    
    if (data) setCategories(data as unknown as Category[]);
    setLoading(false);
  };

  const openDialog = (category?: Category) => {
    if (category) {
      setEditingCategory(category);
      setForm({ 
        name: category.name, 
        icon_url: category.icon_url, 
        display_order: category.display_order 
      });
    } else {
      setEditingCategory(null);
      const maxOrder = categories.length > 0 
        ? Math.max(...categories.map(c => c.display_order)) + 1 
        : 1;
      setForm({ name: '', icon_url: '', display_order: maxOrder });
    }
    setShowDialog(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!form.name || !form.icon_url) {
      toast({ variant: 'destructive', title: 'Erro', description: 'Preencha todos os campos obrigatórios.' });
      return;
    }

    if (editingCategory) {
      const { error } = await supabase
        .from('activity_categories' as any)
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
        .from('activity_categories' as any)
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
      .from('activity_categories' as any)
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
      .from('activity_categories' as any)
      .update({ is_active: !category.is_active })
      .eq('id', category.id);

    if (error) {
      toast({ variant: 'destructive', title: 'Erro', description: 'Não foi possível alterar o status.' });
    } else {
      fetchCategories();
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Gerenciar Vetores/Categorias</CardTitle>
          <CardDescription>Adicione e edite os ícones de categorias exibidos na página inicial</CardDescription>
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
            {categories.map((category) => (
              <div 
                key={category.id} 
                className="flex items-center gap-4 p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
              >
                <GripVertical className="w-5 h-5 text-muted-foreground cursor-grab" />
                
                <div className="w-16 h-16 rounded-full border border-primary/30 flex items-center justify-center bg-muted/30">
                  <img 
                    src={category.icon_url} 
                    alt={category.name} 
                    className="w-10 h-10 object-contain"
                  />
                </div>

                <div className="flex-1">
                  <p className="font-medium">{category.name}</p>
                  <p className="text-sm text-muted-foreground truncate max-w-xs">{category.icon_url}</p>
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
            ))}
          </div>
        )}
      </CardContent>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
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
                <Label htmlFor="icon_url">URL do Ícone *</Label>
                <Input 
                  id="icon_url" 
                  value={form.icon_url} 
                  onChange={(e) => setForm({...form, icon_url: e.target.value})}
                  placeholder="https://..."
                />
                {form.icon_url && (
                  <div className="mt-2 flex justify-center">
                    <div className="w-20 h-20 rounded-full border border-primary/30 flex items-center justify-center bg-muted/30">
                      <img 
                        src={form.icon_url} 
                        alt="Preview" 
                        className="w-12 h-12 object-contain"
                        onError={(e) => (e.currentTarget.style.display = 'none')}
                      />
                    </div>
                  </div>
                )}
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
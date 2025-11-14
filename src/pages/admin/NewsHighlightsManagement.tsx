import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase, NewsHighlight } from '../../lib/supabase';
import { Plus, Edit2, Trash2, Save, X, ArrowLeft, Image as ImageIcon } from 'lucide-react';

export function NewsHighlightsManagement() {
  const navigate = useNavigate();
  const [highlights, setHighlights] = useState<NewsHighlight[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    image_url: '',
    title: '',
    subtitle: '',
    display_order: 1,
    is_active: true,
  });

  useEffect(() => {
    fetchHighlights();
  }, []);

  const fetchHighlights = async () => {
    try {
      const { data, error } = await supabase
        .from('news_highlights')
        .select('*')
        .order('display_order');

      if (error) throw error;
      setHighlights(data || []);
    } catch (error) {
      console.error('Error fetching highlights:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingId) {
        const { error } = await supabase
          .from('news_highlights')
          .update({
            ...formData,
            updated_at: new Date().toISOString(),
          })
          .eq('id', editingId);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('news_highlights')
          .insert([formData]);

        if (error) throw error;
      }

      setFormData({
        image_url: '',
        title: '',
        subtitle: '',
        display_order: 1,
        is_active: true,
      });
      setEditingId(null);
      fetchHighlights();
    } catch (error) {
      console.error('Error saving highlight:', error);
      alert('Erro ao salvar destaque');
    }
  };

  const handleEdit = (highlight: NewsHighlight) => {
    setFormData({
      image_url: highlight.image_url,
      title: highlight.title,
      subtitle: highlight.subtitle,
      display_order: highlight.display_order,
      is_active: highlight.is_active,
    });
    setEditingId(highlight.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este destaque?')) return;

    try {
      const { error } = await supabase
        .from('news_highlights')
        .delete()
        .eq('id', id);

      if (error) throw error;
      fetchHighlights();
    } catch (error) {
      console.error('Error deleting highlight:', error);
      alert('Erro ao excluir destaque');
    }
  };

  const handleCancel = () => {
    setFormData({
      image_url: '',
      title: '',
      subtitle: '',
      display_order: 1,
      is_active: true,
    });
    setEditingId(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="container mx-auto px-6">
        <div className="mb-6">
          <button
            onClick={() => navigate('/admin')}
            className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-800 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Voltar ao Dashboard
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <h1 className="text-3xl font-serif text-slate-800 mb-6">
            {editingId ? 'Editar Destaque' : 'Novo Destaque'}
          </h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                URL da Imagem *
              </label>
              <input
                type="url"
                value={formData.image_url}
                onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                placeholder="https://exemplo.com/imagem.jpg"
                required
              />
            </div>

            {formData.image_url && (
              <div className="border border-slate-200 rounded-lg p-4">
                <p className="text-sm text-slate-600 mb-2">Preview:</p>
                <img
                  src={formData.image_url}
                  alt="Preview"
                  className="w-full h-48 object-cover rounded-lg"
                  onError={(e) => {
                    e.currentTarget.src = '';
                    e.currentTarget.style.display = 'none';
                  }}
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Título Principal * (fonte Nelphin grande)
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                placeholder="Título do destaque"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Subtítulo/Resumo * (fonte Nelphin menor)
              </label>
              <textarea
                value={formData.subtitle}
                onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                rows={3}
                placeholder="Breve resumo do destaque"
                required
              />
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Ordem de Exibição *
                </label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={formData.display_order}
                  onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  required
                />
                <p className="text-xs text-slate-500 mt-1">Máximo de 10 destaques</p>
              </div>

              <div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                    className="w-5 h-5 text-emerald-600 rounded focus:ring-emerald-500"
                  />
                  <span className="text-sm font-medium text-slate-700">Ativo</span>
                </label>
              </div>
            </div>

            <div className="flex gap-4">
              <button
                type="submit"
                className="flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors"
              >
                <Save className="w-5 h-5" />
                {editingId ? 'Atualizar' : 'Criar'} Destaque
              </button>

              {editingId && (
                <button
                  type="button"
                  onClick={handleCancel}
                  className="flex items-center gap-2 px-6 py-3 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                  Cancelar
                </button>
              )}
            </div>
          </form>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-serif text-slate-800">Destaques Cadastrados</h2>
            <span className="text-sm text-slate-600">
              {highlights.length} / 10 destaques
            </span>
          </div>

          {highlights.length === 0 ? (
            <div className="text-center py-12">
              <ImageIcon className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500">Nenhum destaque cadastrado ainda</p>
            </div>
          ) : (
            <div className="grid gap-6">
              {highlights.map((highlight) => (
                <div
                  key={highlight.id}
                  className="border border-slate-200 rounded-lg p-6 hover:shadow-lg transition-shadow"
                >
                  <div className="grid md:grid-cols-4 gap-4">
                    <div className="md:col-span-1">
                      <img
                        src={highlight.image_url}
                        alt={highlight.title}
                        className="w-full h-32 object-cover rounded-lg"
                      />
                    </div>

                    <div className="md:col-span-3">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-grow">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-xl font-bold text-slate-800">
                              {highlight.title}
                            </h3>
                            <span className="text-sm text-slate-500">
                              #{highlight.display_order}
                            </span>
                            {highlight.is_active ? (
                              <span className="px-2 py-1 bg-emerald-100 text-emerald-700 text-xs rounded-full">
                                Ativo
                              </span>
                            ) : (
                              <span className="px-2 py-1 bg-slate-100 text-slate-600 text-xs rounded-full">
                                Inativo
                              </span>
                            )}
                          </div>
                          <p className="text-slate-600 text-sm">{highlight.subtitle}</p>
                        </div>

                        <div className="flex gap-2 ml-4">
                          <button
                            onClick={() => handleEdit(highlight)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Editar"
                          >
                            <Edit2 className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleDelete(highlight.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Excluir"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

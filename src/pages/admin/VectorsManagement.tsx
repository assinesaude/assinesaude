import React, { useState, useEffect } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { supabase, FeatureVector } from '../../lib/supabase';

export function VectorsManagement() {
  const [vectors, setVectors] = useState<FeatureVector[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    image_url: '',
    caption: '',
    font_family: 'Inter',
    font_size: '16px',
    font_color: '#1e293b',
  });

  useEffect(() => {
    fetchVectors();
  }, []);

  const fetchVectors = async () => {
    const { data } = await supabase.from('feature_vectors').select('*').order('display_order');
    setVectors(data || []);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await supabase.from('feature_vectors').insert({ ...formData, display_order: vectors.length });
      setFormData({ image_url: '', caption: '', font_family: 'Inter', font_size: '16px', font_color: '#1e293b' });
      setShowForm(false);
      fetchVectors();
    } catch (error) {
      console.error('Error adding vector:', error);
    }
  };

  const deleteVector = async (id: string) => {
    if (confirm('Excluir este vetor?')) {
      await supabase.from('feature_vectors').delete().eq('id', id);
      fetchVectors();
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-serif font-bold text-slate-800">Gerenciar Vetores</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg"
        >
          <Plus className="w-5 h-5" />
          Adicionar
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl border border-slate-200 mb-6 space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">URL da Imagem</label>
              <input
                required
                type="url"
                value={formData.image_url}
                onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Legenda</label>
              <input
                required
                value={formData.caption}
                onChange={(e) => setFormData({ ...formData, caption: e.target.value })}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Fonte</label>
              <input
                value={formData.font_family}
                onChange={(e) => setFormData({ ...formData, font_family: e.target.value })}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Tamanho</label>
              <input
                value={formData.font_size}
                onChange={(e) => setFormData({ ...formData, font_size: e.target.value })}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Cor</label>
              <input
                type="color"
                value={formData.font_color}
                onChange={(e) => setFormData({ ...formData, font_color: e.target.value })}
                className="w-full h-10 border border-slate-300 rounded-lg"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <button type="submit" className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg">
              Salvar
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-6 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg"
            >
              Cancelar
            </button>
          </div>
        </form>
      )}

      <div className="grid md:grid-cols-3 gap-6">
        {vectors.map((vector) => (
          <div key={vector.id} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm text-center">
            <div className="w-20 h-20 mx-auto mb-4 bg-slate-100 rounded-full flex items-center justify-center">
              <img src={vector.image_url} alt={vector.caption} className="w-12 h-12 object-contain" />
            </div>
            <p
              style={{
                fontFamily: vector.font_family,
                fontSize: vector.font_size,
                color: vector.font_color,
              }}
            >
              {vector.caption}
            </p>
            <button
              onClick={() => deleteVector(vector.id)}
              className="mt-4 px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg transition-colors"
            >
              <Trash2 className="w-4 h-4 mx-auto" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

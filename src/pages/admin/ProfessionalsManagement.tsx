import React, { useState, useEffect } from 'react';
import { Check, X, Eye } from 'lucide-react';
import { supabase, Professional } from '../../lib/supabase';

export function ProfessionalsManagement() {
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfessionals();
  }, []);

  const fetchProfessionals = async () => {
    try {
      const { data, error } = await supabase
        .from('professionals')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProfessionals(data || []);
    } catch (error) {
      console.error('Error fetching professionals:', error);
    } finally {
      setLoading(false);
    }
  };

  const verifyProfessional = async (id: string) => {
    try {
      const { error } = await supabase
        .from('professionals')
        .update({ verified: true, verified_at: new Date().toISOString() })
        .eq('id', id);

      if (error) throw error;
      await fetchProfessionals();
    } catch (error) {
      console.error('Error verifying professional:', error);
    }
  };

  if (loading) {
    return <div className="text-center py-12">Carregando...</div>;
  }

  return (
    <div>
      <h1 className="text-3xl font-serif font-bold text-slate-800 mb-8">Gerenciar Profissionais</h1>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Nome</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Profissão</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Cidade</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Status</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {professionals.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                  Nenhum profissional cadastrado
                </td>
              </tr>
            ) : (
              professionals.map((prof) => (
                <tr key={prof.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 text-slate-800">{prof.business_name}</td>
                  <td className="px-6 py-4 text-slate-600 capitalize">{prof.profession.replace('_', ' ')}</td>
                  <td className="px-6 py-4 text-slate-600">{prof.city}, {prof.state}</td>
                  <td className="px-6 py-4">
                    {prof.verified ? (
                      <span className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-sm font-medium">
                        <Check className="w-4 h-4" />
                        Verificado
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-sm font-medium">
                        <X className="w-4 h-4" />
                        Pendente
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {!prof.verified && (
                      <button
                        onClick={() => verifyProfessional(prof.id)}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm rounded-lg transition-colors"
                      >
                        Verificar
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

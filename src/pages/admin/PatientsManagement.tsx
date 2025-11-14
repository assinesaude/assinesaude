import React, { useState, useEffect } from 'react';
import { supabase, Patient } from '../../lib/supabase';

export function PatientsManagement() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
      const { data, error } = await supabase
        .from('patients')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPatients(data || []);
    } catch (error) {
      console.error('Error fetching patients:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="text-center py-12">Carregando...</div>;

  return (
    <div>
      <h1 className="text-3xl font-serif font-bold text-slate-800 mb-8">Gerenciar Pacientes</h1>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">CPF</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Cidade</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Data Cadastro</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {patients.length === 0 ? (
              <tr>
                <td colSpan={3} className="px-6 py-8 text-center text-slate-500">
                  Nenhum paciente cadastrado
                </td>
              </tr>
            ) : (
              patients.map((patient) => (
                <tr key={patient.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 text-slate-800">{patient.cpf}</td>
                  <td className="px-6 py-4 text-slate-600">{patient.city || '-'}</td>
                  <td className="px-6 py-4 text-slate-600">
                    {new Date(patient.created_at).toLocaleDateString()}
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

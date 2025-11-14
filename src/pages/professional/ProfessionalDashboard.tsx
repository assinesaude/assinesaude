import React, { useState } from 'react';
import {
  LayoutDashboard,
  Calendar,
  FileText,
  Users,
  CreditCard,
  Settings,
  Tag,
  MessageSquare,
} from 'lucide-react';
import AIChatButton from '../../components/AIChatButton';

type Section = 'overview' | 'schedule' | 'plans' | 'patients' | 'records' | 'payments' | 'coupons' | 'messages' | 'settings';

export function ProfessionalDashboard() {
  const [activeSection, setActiveSection] = useState<Section>('overview');

  const menuItems = [
    { id: 'overview', label: 'Visão Geral', icon: LayoutDashboard },
    { id: 'schedule', label: 'Agenda', icon: Calendar },
    { id: 'plans', label: 'Meus Planos', icon: FileText },
    { id: 'patients', label: 'Pacientes', icon: Users },
    { id: 'records', label: 'Prontuários', icon: FileText },
    { id: 'payments', label: 'Pagamentos', icon: CreditCard },
    { id: 'coupons', label: 'Cupons', icon: Tag },
    { id: 'messages', label: 'Mensagens', icon: MessageSquare },
    { id: 'settings', label: 'Configurações', icon: Settings },
  ];

  return (
    <>
    <div className="flex min-h-screen bg-slate-50">
      <aside className="w-64 bg-white border-r border-slate-200 p-6">
        <h2 className="text-lg font-bold text-slate-800 mb-6">Painel Profissional</h2>
        <nav className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id as Section)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  activeSection === item.id
                    ? 'bg-emerald-50 text-emerald-700 font-medium'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </aside>

      <main className="flex-1 p-8">
        {activeSection === 'overview' && <OverviewSection />}
        {activeSection === 'schedule' && <PlaceholderSection title="Agenda" />}
        {activeSection === 'plans' && <PlaceholderSection title="Meus Planos" />}
        {activeSection === 'patients' && <PlaceholderSection title="Pacientes" />}
        {activeSection === 'records' && <PlaceholderSection title="Prontuários" />}
        {activeSection === 'payments' && <PlaceholderSection title="Pagamentos" />}
        {activeSection === 'coupons' && <PlaceholderSection title="Cupons" />}
        {activeSection === 'messages' && <PlaceholderSection title="Mensagens" />}
        {activeSection === 'settings' && <PlaceholderSection title="Configurações" />}
      </main>
    </div>
    <AIChatButton />
    </>
  );
}

function OverviewSection() {
  return (
    <div>
      <h1 className="text-3xl font-serif font-bold text-slate-800 mb-8">Visão Geral</h1>

      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-slate-600 font-medium">Pacientes Ativos</h3>
            <Users className="w-8 h-8 text-emerald-600" />
          </div>
          <p className="text-3xl font-bold text-slate-800">0</p>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-slate-600 font-medium">Consultas Hoje</h3>
            <Calendar className="w-8 h-8 text-emerald-600" />
          </div>
          <p className="text-3xl font-bold text-slate-800">0</p>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-slate-600 font-medium">Receita Mensal</h3>
            <CreditCard className="w-8 h-8 text-emerald-600" />
          </div>
          <p className="text-3xl font-bold text-slate-800">R$ 0,00</p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <h2 className="text-xl font-semibold text-slate-800 mb-4">Bem-vindo ao seu Painel</h2>
        <p className="text-slate-600 leading-relaxed">
          Gerencie seus pacientes, agendamentos, planos de benefícios e muito mais. Use o menu lateral para navegar.
        </p>
      </div>
    </div>
  );
}

function PlaceholderSection({ title }: { title: string }) {
  return (
    <div>
      <h1 className="text-3xl font-serif font-bold text-slate-800 mb-8">{title}</h1>
      <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm text-center">
        <p className="text-slate-600">Seção em desenvolvimento</p>
      </div>
    </div>
  );
}

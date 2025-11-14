import React, { useState } from 'react';
import {
  LayoutDashboard,
  Calendar,
  FileText,
  CreditCard,
  MessageSquare,
  User,
} from 'lucide-react';
import AIChatButton from '../../components/AIChatButton';

type Section = 'overview' | 'subscriptions' | 'appointments' | 'records' | 'payments' | 'messages' | 'profile';

export function PatientDashboard() {
  const [activeSection, setActiveSection] = useState<Section>('overview');

  const menuItems = [
    { id: 'overview', label: 'Visão Geral', icon: LayoutDashboard },
    { id: 'subscriptions', label: 'Minhas Assinaturas', icon: FileText },
    { id: 'appointments', label: 'Agendamentos', icon: Calendar },
    { id: 'records', label: 'Prontuário', icon: FileText },
    { id: 'payments', label: 'Pagamentos', icon: CreditCard },
    { id: 'messages', label: 'Mensagens', icon: MessageSquare },
    { id: 'profile', label: 'Perfil', icon: User },
  ];

  return (
    <>
    <div className="flex min-h-screen bg-slate-50">
      <aside className="w-64 bg-white border-r border-slate-200 p-6">
        <h2 className="text-lg font-bold text-slate-800 mb-6">Meu Painel</h2>
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
        {activeSection === 'subscriptions' && <PlaceholderSection title="Minhas Assinaturas" />}
        {activeSection === 'appointments' && <PlaceholderSection title="Agendamentos" />}
        {activeSection === 'records' && <PlaceholderSection title="Meu Prontuário" />}
        {activeSection === 'payments' && <PlaceholderSection title="Pagamentos" />}
        {activeSection === 'messages' && <PlaceholderSection title="Mensagens" />}
        {activeSection === 'profile' && <PlaceholderSection title="Meu Perfil" />}
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
            <h3 className="text-slate-600 font-medium">Planos Ativos</h3>
            <FileText className="w-8 h-8 text-emerald-600" />
          </div>
          <p className="text-3xl font-bold text-slate-800">0</p>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-slate-600 font-medium">Próximas Consultas</h3>
            <Calendar className="w-8 h-8 text-emerald-600" />
          </div>
          <p className="text-3xl font-bold text-slate-800">0</p>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-slate-600 font-medium">Mensagens Não Lidas</h3>
            <MessageSquare className="w-8 h-8 text-emerald-600" />
          </div>
          <p className="text-3xl font-bold text-slate-800">0</p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <h2 className="text-xl font-semibold text-slate-800 mb-4">Bem-vindo ao AssineSaúde</h2>
        <p className="text-slate-600 leading-relaxed mb-4">
          Gerencie suas assinaturas de saúde, agende consultas e acompanhe seu histórico médico tudo em um só lugar.
        </p>
        <a
          href="/"
          className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg transition-colors"
        >
          Buscar Profissionais
        </a>
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

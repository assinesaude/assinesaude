import React, { useState } from 'react';
import {
  LayoutDashboard,
  Users,
  Briefcase,
  MessageSquare,
  Image,
  Tag,
  Star,
  Settings,
  Newspaper,
  ImageIcon,
  Search,
} from 'lucide-react';
import { ProfessionalsManagement } from './ProfessionalsManagement';
import { PatientsManagement } from './PatientsManagement';
import { CarouselManagement } from './CarouselManagement';
import { TestimonialsManagement } from './TestimonialsManagement';
import { CouponsManagement } from './CouponsManagement';
import { VectorsManagement } from './VectorsManagement';
import { NewsHighlightsManagement } from './NewsHighlightsManagement';
import { BannerCarouselManagement } from './BannerCarouselManagement';
import SearchDirectoryManagement from './SearchDirectoryManagement';

type AdminSection = 'overview' | 'professionals' | 'patients' | 'search-directory' | 'carousel' | 'highlights' | 'banners' | 'testimonials' | 'coupons' | 'vectors' | 'messages';

export function AdminDashboard() {
  const [activeSection, setActiveSection] = useState<AdminSection>('overview');

  const menuItems = [
    { id: 'overview', label: 'Visão Geral', icon: LayoutDashboard },
    { id: 'search-directory', label: 'Diretório TERVIS.AI', icon: Search },
    { id: 'professionals', label: 'Profissionais', icon: Briefcase },
    { id: 'patients', label: 'Pacientes', icon: Users },
    { id: 'carousel', label: 'Carrossel', icon: Image },
    { id: 'highlights', label: 'Destaques', icon: Newspaper },
    { id: 'banners', label: 'Banner Carrossel', icon: ImageIcon },
    { id: 'vectors', label: 'Vetores', icon: Settings },
    { id: 'testimonials', label: 'Testemunhos', icon: Star },
    { id: 'coupons', label: 'Cupons', icon: Tag },
    { id: 'messages', label: 'Mensagens', icon: MessageSquare },
  ];

  return (
    <div className="flex min-h-screen bg-slate-50">
      <aside className="w-64 bg-white border-r border-slate-200 p-6">
        <h2 className="text-lg font-bold text-slate-800 mb-6">Painel Admin</h2>
        <nav className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id as AdminSection)}
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
        {activeSection === 'search-directory' && <SearchDirectoryManagement />}
        {activeSection === 'professionals' && <ProfessionalsManagement />}
        {activeSection === 'patients' && <PatientsManagement />}
        {activeSection === 'carousel' && <CarouselManagement />}
        {activeSection === 'highlights' && <NewsHighlightsManagement />}
        {activeSection === 'banners' && <BannerCarouselManagement />}
        {activeSection === 'testimonials' && <TestimonialsManagement />}
        {activeSection === 'coupons' && <CouponsManagement />}
        {activeSection === 'vectors' && <VectorsManagement />}
        {activeSection === 'messages' && <MessagesSection />}
      </main>
    </div>
  );
}

function OverviewSection() {
  return (
    <div>
      <h1 className="text-3xl font-serif font-bold text-slate-800 mb-8">Visão Geral</h1>

      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-slate-600 font-medium">Profissionais</h3>
            <Briefcase className="w-8 h-8 text-emerald-600" />
          </div>
          <p className="text-3xl font-bold text-slate-800">0</p>
          <p className="text-sm text-slate-500 mt-2">Total cadastrados</p>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-slate-600 font-medium">Pacientes</h3>
            <Users className="w-8 h-8 text-emerald-600" />
          </div>
          <p className="text-3xl font-bold text-slate-800">0</p>
          <p className="text-sm text-slate-500 mt-2">Total cadastrados</p>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-slate-600 font-medium">Assinaturas Ativas</h3>
            <Tag className="w-8 h-8 text-emerald-600" />
          </div>
          <p className="text-3xl font-bold text-slate-800">0</p>
          <p className="text-sm text-slate-500 mt-2">Planos ativos</p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <h2 className="text-xl font-semibold text-slate-800 mb-4">Bem-vindo ao Painel Administrativo</h2>
        <p className="text-slate-600 leading-relaxed">
          Gerencie todos os aspectos da plataforma AssineSaúde. Use o menu lateral para navegar entre as diferentes seções.
        </p>
      </div>
    </div>
  );
}

function MessagesSection() {
  return (
    <div>
      <h1 className="text-3xl font-serif font-bold text-slate-800 mb-8">Mensagens</h1>
      <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm text-center">
        <MessageSquare className="w-16 h-16 text-slate-400 mx-auto mb-4" />
        <p className="text-slate-600">Sistema de mensagens em desenvolvimento</p>
      </div>
    </div>
  );
}

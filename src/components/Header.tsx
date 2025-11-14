import React, { useState } from 'react';
import { User, LogOut, Menu, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export function Header() {
  const { user, profile, signOut } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSignOut = async () => {
    try {
      await signOut();
      setMobileMenuOpen(false);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex-1" />

          <div className="flex items-center justify-center flex-1">
            <a href="/">
              <img
                src="/assinesaude.png"
                alt="AssineSaúde"
                className="h-32 object-contain hover:opacity-90 transition-opacity"
              />
            </a>
          </div>

          <div className="flex-1 flex justify-end items-center gap-8">
            {user ? (
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <p className="text-sm font-medium text-slate-800">{profile?.full_name}</p>
                  <p className="text-xs text-slate-500 capitalize">{profile?.role}</p>
                </div>
                <button
                  onClick={handleSignOut}
                  className="p-2 text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors"
                  title="Sair"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <>
                <a href="/login" className="hover:opacity-80 transition-opacity">
                  <img
                    src="/botão login.png"
                    alt="Entrar"
                    className="h-14 object-contain"
                  />
                </a>
                <a href="/signup" className="hover:opacity-80 transition-opacity">
                  <img
                    src="/registre-se.png"
                    alt="Registre-se"
                    className="h-14 object-contain"
                  />
                </a>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

import { useState, useEffect } from 'react';
import { Search, Mic, Pill, Bot, Loader2, AlertCircle } from 'lucide-react';
import AuthModal from './AuthModal';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export default function TervisSearch() {
  const { user } = useAuth();
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [searchResult, setSearchResult] = useState('');
  const [remainingSearches, setRemainingSearches] = useState<number | null>(null);
  const [error, setError] = useState('');
  const [isListening, setIsListening] = useState(false);

  useEffect(() => {
    if (user) {
      fetchRemainingSearches();
    }
  }, [user]);

  const fetchRemainingSearches = async () => {
    if (!user) return;

    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session.session) return;

      const today = new Date().toISOString().split('T')[0];

      const { data } = await supabase
        .from('search_usage_limits')
        .select('search_count')
        .eq('user_id', user.id)
        .eq('date', today)
        .maybeSingle();

      const used = data?.search_count || 0;
      setRemainingSearches(Math.max(0, 10 - used));
    } catch (err) {
      console.error('Error fetching remaining searches:', err);
    }
  };

  const handleVoiceSearch = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('Seu navegador não suporta reconhecimento de voz.');
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();

    recognition.lang = 'pt-BR';
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setQuery(transcript);
      setIsListening(false);
    };

    recognition.onerror = () => {
      setIsListening(false);
      alert('Erro ao capturar áudio. Tente novamente.');
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      setShowAuthModal(true);
      return;
    }

    if (!query.trim()) {
      setError('Por favor, digite o que você procura');
      return;
    }

    setIsSearching(true);
    setError('');
    setShowResults(false);

    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session.session) {
        setShowAuthModal(true);
        return;
      }

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/tervis-search`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.session.access_token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ query: query.trim() }),
        }
      );

      const data = await response.json();

      if (response.status === 429) {
        setError(data.message || 'Limite diário atingido');
        setRemainingSearches(0);
        return;
      }

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao realizar busca');
      }

      setSearchResult(data.response);
      setRemainingSearches(data.remainingSearches);
      setShowResults(true);
    } catch (err: any) {
      console.error('Search error:', err);
      setError(err.message || 'Erro ao realizar busca. Tente novamente.');
    } finally {
      setIsSearching(false);
    }
  };

  const handleAuthSuccess = () => {
    setShowAuthModal(false);
    fetchRemainingSearches();
  };

  return (
    <>
      <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-5">
        <p className="text-sm text-slate-600 mb-3">
          Digite o profissional que você precisa ou clique no microfone e pergunte
          para o TERVIS.AI
        </p>

        <form onSubmit={handleSearch}>
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <input
                type="text"
                placeholder="Ex: Dentista em São Paulo ou Psicólogo no Rio de Janeiro"
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                disabled={isSearching}
              />
            </div>

            <button
              type="button"
              onClick={handleVoiceSearch}
              disabled={isSearching || isListening}
              className={`px-4 py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                isListening
                  ? 'bg-red-500 text-white animate-pulse'
                  : 'bg-slate-200 hover:bg-slate-300 text-slate-700'
              }`}
              title="Busca por voz"
            >
              <Mic className="w-5 h-5" />
            </button>

            <button
              type="submit"
              disabled={isSearching || !query.trim()}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              title="Busca por texto"
            >
              {isSearching ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Search className="w-5 h-5" />
              )}
              Buscar
            </button>
          </div>

          <div className="flex justify-between items-center mt-3">
            <div className="flex items-center gap-4">
              <p className="text-xs text-slate-500">Busca por texto ou por voz</p>
              {user && remainingSearches !== null && (
                <p className="text-xs font-medium text-blue-600">
                  {remainingSearches} {remainingSearches === 1 ? 'busca' : 'buscas'}{' '}
                  restante{remainingSearches !== 1 ? 's' : ''} hoje
                </p>
              )}
            </div>
            <button
              type="button"
              className="text-xs text-green-600 hover:text-green-700 font-medium flex items-center gap-1"
            >
              <Pill className="w-4 h-4" />
              Consultar Bulário ANVISA
            </button>
          </div>
        </form>

        {error && (
          <div className="mt-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-start gap-2">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <p className="text-sm">{error}</p>
          </div>
        )}

        {showResults && searchResult && (
          <div className="mt-6 bg-gradient-to-br from-blue-50 to-teal-50 border-2 border-blue-200 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-blue-600 p-3 rounded-full">
                <Bot className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-gray-800">
                  Resultado da Busca TERVIS.AI
                </h3>
                <p className="text-sm text-gray-600">
                  Profissionais encontrados para você
                </p>
              </div>
            </div>

            <div className="bg-white rounded-lg p-4 shadow-sm">
              <div className="prose prose-sm max-w-none">
                <div className="whitespace-pre-wrap text-gray-700 leading-relaxed">
                  {searchResult}
                </div>
              </div>
            </div>

            <div className="mt-4 flex items-center gap-2 text-xs text-gray-600 bg-blue-50 px-4 py-2 rounded-lg">
              <AlertCircle className="w-4 h-4" />
              <p>
                As informações são fornecidas com fins informativos. Sempre
                consulte um profissional de saúde qualificado.
              </p>
            </div>
          </div>
        )}
      </div>

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSuccess={handleAuthSuccess}
      />
    </>
  );
}

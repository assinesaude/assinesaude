import { useState } from 'react';
import { MessageSquare } from 'lucide-react';
import AIChatBox from './AIChatBox';

export default function AIChatButton() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 bg-gradient-to-r from-emerald-500 to-teal-600 text-white p-4 rounded-full shadow-2xl hover:shadow-emerald-500/50 hover:scale-110 transition-all duration-300 z-40 group"
        aria-label="Abrir chat com Tervis.ai"
      >
        <MessageSquare className="w-6 h-6" />
        <span className="absolute right-full mr-3 top-1/2 -translate-y-1/2 bg-gray-900 text-white px-3 py-2 rounded-lg text-sm whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
          Fale com a Tervis.ai
        </span>
      </button>

      <AIChatBox isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
}

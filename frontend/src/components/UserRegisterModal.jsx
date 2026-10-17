import { useState } from 'react';

export default function UserRegisterModal({ isOpen, onClose, onUserCreated }) {
  const [formData, setFormData] = useState({ name: '', surname: '', email: '' });
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error('Errore durante la registrazione dell\'utente');

      const newUser = await res.json();
      if (onUserCreated) onUserCreated(newUser);
      
      setFormData({ name: '', surname: '', email: '' });
      onClose();
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-[#121624] rounded-xl border border-[#1f263e] shadow-2xl w-full max-w-md p-6 space-y-5">
        
        {/* Header Modale */}
        <div className="flex justify-between items-center border-b border-[#1f263e] pb-3">
          <div className="flex items-center space-x-2">
            <span className="text-indigo-400 text-lg">👤</span>
            <h3 className="text-lg font-bold text-white">Registra Nuovo Utente</h3>
          </div>
          <button 
            onClick={onClose} 
            className="text-gray-400 hover:text-white font-bold text-lg transition"
          >
            ✕
          </button>
        </div>

        {/* Form Modale */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
              Nome
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full bg-[#0b0e17] text-white text-sm rounded-lg px-3 py-2.5 border border-[#1f263e] focus:outline-none focus:border-[#6366f1] placeholder-gray-600"
              placeholder="Es. Mario"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
              Cognome
            </label>
            <input
              type="text"
              required
              value={formData.surname}
              onChange={(e) => setFormData({ ...formData, surname: e.target.value })}
              className="w-full bg-[#0b0e17] text-white text-sm rounded-lg px-3 py-2.5 border border-[#1f263e] focus:outline-none focus:border-[#6366f1] placeholder-gray-600"
              placeholder="Es. Rossi"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
              Email
            </label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full bg-[#0b0e17] text-white text-sm rounded-lg px-3 py-2.5 border border-[#1f263e] focus:outline-none focus:border-[#6366f1] placeholder-gray-600"
              placeholder="mario.rossi@example.com"
            />
          </div>

          {/* Azioni Modale */}
          <div className="flex justify-end space-x-3 pt-3 border-t border-[#1f263e]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-xs font-semibold text-gray-400 hover:text-white hover:bg-[#1b2238] transition"
            >
              Annulla
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-[#4f46e5] hover:bg-[#4338ca] text-white rounded-lg text-xs font-bold transition shadow-md shadow-indigo-500/20"
            >
              {loading ? 'Salvataggio...' : 'Conferma Utente'}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
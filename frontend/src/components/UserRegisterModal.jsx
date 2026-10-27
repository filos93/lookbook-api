import { useState } from 'react';

// Regex client per consentire lettere (anche accentate), spazi, apostrofi e trattini (no cifre/caratteri speciali)
const NAME_REGEX = /^[A-Za-zÀ-ÖØ-öø-ÿ\s'-]+$/;

export default function UserRegisterModal({ isOpen, onClose, onUserCreated }) {
  const [formData, setFormData] = useState({ name: '', surname: '', email: '' });
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  // Handler per la sanitizzazione in tempo reale di Nome e Cognome
  const handleNameChange = (field, value) => {
    // Rimuove cifre numeriche e caratteri speciali non ammessi al volo
    const sanitized = value.replace(/[^A-Za-zÀ-ÖØ-öø-ÿ\s'-]/g, '');
    setFormData((prev) => ({ ...prev, [field]: sanitized }));
    if (errorMessage) setErrorMessage('');
  };

  // Handler per la sanitizzazione dell'email (no spazi, sempre minuscola)
  const handleEmailChange = (value) => {
    const cleanEmail = value.trim().toLowerCase();
    setFormData((prev) => ({ ...prev, email: cleanEmail }));
    if (errorMessage) setErrorMessage('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    // Pre-validazione lato client prima di inviare al server
    const trimmedName = formData.name.trim();
    const trimmedSurname = formData.surname.trim();
    const trimmedEmail = formData.email.trim();

    if (trimmedName.length < 2 || trimmedSurname.length < 2) {
      setErrorMessage('Nome e Cognome devono contenere almeno 2 caratteri.');
      return;
    }

    if (!NAME_REGEX.test(trimmedName) || !NAME_REGEX.test(trimmedSurname)) {
      setErrorMessage('Nome e Cognome non possono contenere numeri o caratteri speciali.');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        name: trimmedName,
        surname: trimmedSurname,
        email: trimmedEmail
      };

      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Errore durante la registrazione dell\'utente');
      }

      if (onUserCreated) onUserCreated(data);
      
      setFormData({ name: '', surname: '', email: '' });
      onClose();
    } catch (err) {
      setErrorMessage(err.message);
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

        {/* Alert di Errore Backend/Client */}
        {errorMessage && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-400 text-xs rounded-lg p-3 flex items-center space-x-2">
            <span>⚠️</span>
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Form Modale */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
              Nome
            </label>
            <input
              type="text"
              required
              minLength={2}
              maxLength={50}
              value={formData.name}
              onChange={(e) => handleNameChange('name', e.target.value)}
              className="w-full bg-[#0b0e17] text-white text-sm rounded-lg px-3 py-2.5 border border-[#1f263e] focus:outline-none focus:border-[#6366f1] placeholder-gray-600 transition"
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
              minLength={2}
              maxLength={50}
              value={formData.surname}
              onChange={(e) => handleNameChange('surname', e.target.value)}
              className="w-full bg-[#0b0e17] text-white text-sm rounded-lg px-3 py-2.5 border border-[#1f263e] focus:outline-none focus:border-[#6366f1] placeholder-gray-600 transition"
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
              onChange={(e) => handleEmailChange(e.target.value)}
              className="w-full bg-[#0b0e17] text-white text-sm rounded-lg px-3 py-2.5 border border-[#1f263e] focus:outline-none focus:border-[#6366f1] placeholder-gray-600 transition"
              placeholder="mario.rossi99@example.com"
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
              className="px-4 py-2 bg-[#4f46e5] hover:bg-[#4338ca] text-white rounded-lg text-xs font-bold transition shadow-md shadow-indigo-500/20 disabled:opacity-50"
            >
              {loading ? 'Salvataggio...' : 'Conferma Utente'}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
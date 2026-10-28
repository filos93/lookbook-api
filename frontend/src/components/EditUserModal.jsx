import { useState, useEffect } from 'react';

// Regex client: ammette lettere (anche accentate), spazi, apostrofi e trattini (no cifre/caratteri speciali)
const NAME_REGEX = /^[A-Za-zÀ-ÖØ-öø-ÿ\s'-]+$/;

export default function EditUserModal({ user, onClose, onSave }) {
  const [name, setName] = useState(user?.name || '');
  const [surname, setSurname] = useState(user?.surname || '');
  const [email, setEmail] = useState(user?.email || '');
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);

  // Sincronizza lo stato locale se cambia l'utente passato come prop
  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setSurname(user.surname || '');
      setEmail(user.email || '');
      setErrorMessage('');
    }
  }, [user]);

  if (!user) return null;

  // Sanitizzazione al volo per Nome e Cognome
  const handleNameChange = (setter, value) => {
    const sanitized = value.replace(/[^A-Za-zÀ-ÖØ-öø-ÿ\s'-]/g, '');
    setter(sanitized);
    if (errorMessage) setErrorMessage('');
  };

  // Sanitizzazione per l'Email
  const handleEmailChange = (value) => {
    setEmail(value.trim().toLowerCase());
    if (errorMessage) setErrorMessage('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    const trimmedName = name.trim();
    const trimmedSurname = surname.trim();
    const trimmedEmail = email.trim();

    // Validazione Client
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
      await onSave(user.id, {
        name: trimmedName,
        surname: trimmedSurname,
        email: trimmedEmail,
      });
      onClose();
    } catch (err) {
      setErrorMessage(err.message || 'Errore durante il salvataggio delle modifiche.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-[#121624] border border-[#1f263e] w-full max-w-md rounded-2xl p-6 relative shadow-2xl text-gray-200 space-y-4">
        
        {/* Pulsante Chiusura */}
        <button
          onClick={onClose}
          disabled={loading}
          className="absolute top-4 right-4 text-gray-400 hover:text-white font-bold text-lg transition disabled:opacity-50"
        >
          ✕
        </button>

        {/* Titolo */}
        <h2 className="text-xl font-bold text-white flex items-center space-x-2">
          <span>✏️</span>
          <span>Modifica Utente</span>
        </h2>

        {/* Box Errore */}
        {errorMessage && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-400 text-xs rounded-lg p-3 flex items-center space-x-2">
            <span>⚠️</span>
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Form Modifica */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
              Nome
            </label>
            <input
              type="text"
              required
              disabled={loading}
              minLength={2}
              maxLength={50}
              value={name}
              onChange={(e) => handleNameChange(setName, e.target.value)}
              className="w-full bg-[#0b0e17] border border-[#1f263e] rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-[#4f46e5] text-sm transition disabled:opacity-50"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
              Cognome
            </label>
            <input
              type="text"
              required
              disabled={loading}
              minLength={2}
              maxLength={50}
              value={surname}
              onChange={(e) => handleNameChange(setSurname, e.target.value)}
              className="w-full bg-[#0b0e17] border border-[#1f263e] rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-[#4f46e5] text-sm transition disabled:opacity-50"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
              Email
            </label>
            <input
              type="email"
              required
              disabled={loading}
              value={email}
              onChange={(e) => handleEmailChange(e.target.value)}
              className="w-full bg-[#0b0e17] border border-[#1f263e] rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-[#4f46e5] text-sm transition disabled:opacity-50"
            />
          </div>

          {/* Azioni Modale */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-[#1f263e]">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 rounded-lg text-sm font-semibold text-gray-400 hover:bg-[#1b2238] hover:text-white transition disabled:opacity-50"
            >
              Annulla
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 rounded-lg text-sm font-semibold bg-[#4f46e5] text-white hover:bg-[#4338ca] transition shadow-md shadow-indigo-500/20 disabled:opacity-50"
            >
              {loading ? 'Salvataggio...' : 'Salva Modifiche'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
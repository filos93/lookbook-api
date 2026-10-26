import { useState } from 'react';

export default function EditUserModal({ user, onClose, onSave }) {
  const [name, setName] = useState(user.name || '');
  const [surname, setSurname] = useState(user.surname || '');
  const [email, setEmail] = useState(user.email || '');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSave(user.id, { name, surname, email });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-[#121624] border border-[#1f263e] w-full max-w-md rounded-2xl p-6 relative shadow-2xl text-gray-200">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white font-bold text-lg"
        >
          ✕
        </button>

        <h2 className="text-xl font-bold text-white mb-4 flex items-center space-x-2">
          <span>✏️</span>
          <span>Modifica Utente</span>
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
              Nome
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-[#0b0e17] border border-[#1f263e] rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-[#4f46e5]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
              Cognome
            </label>
            <input
              type="text"
              required
              value={surname}
              onChange={(e) => setSurname(e.target.value)}
              className="w-full bg-[#0b0e17] border border-[#1f263e] rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-[#4f46e5]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
              Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-[#0b0e17] border border-[#1f263e] rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-[#4f46e5]"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t border-[#1f263e]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-sm font-semibold text-gray-400 hover:bg-[#1b2238] transition"
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
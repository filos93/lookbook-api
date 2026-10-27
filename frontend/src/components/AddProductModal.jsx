import { useState } from 'react';

export default function AddProductModal({ isOpen, onClose, users = [], onProductCreated }) {
  const [formData, setFormData] = useState({ name: '', price: '', user_id: '', photo_url: '' });
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errorMessage) setErrorMessage('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    const trimmedName = formData.name.trim();
    const parsedPrice = parseFloat(formData.price);
    const selectedUserId = parseInt(formData.user_id, 10);
    const trimmedPhotoUrl = formData.photo_url.trim();

    // Validazione Client
    if (trimmedName.length < 2) {
      setErrorMessage('Il nome del capo deve contenere almeno 2 caratteri.');
      return;
    }

    if (isNaN(parsedPrice) || parsedPrice < 0) {
      setErrorMessage('Inserisci un prezzo valido maggiore o uguale a 0.');
      return;
    }

    if (!selectedUserId || isNaN(selectedUserId)) {
      setErrorMessage('Seleziona un proprietario valido per il capo.');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        name: trimmedName,
        price: parsedPrice,
        user_id: selectedUserId,
        photos: trimmedPhotoUrl ? [trimmedPhotoUrl] : []
      };

      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Errore durante la creazione del capo');
      }

      if (onProductCreated) onProductCreated(data);

      setFormData({ name: '', price: '', user_id: '', photo_url: '' });
      onClose();
    } catch (err) {
      setErrorMessage(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-[#121624] rounded-xl border border-[#1f263e] shadow-2xl w-full max-w-md p-6 space-y-5 text-gray-200">
        
        {/* Header Modale */}
        <div className="flex justify-between items-center border-b border-[#1f263e] pb-3">
          <div className="flex items-center space-x-2">
            <span className="text-indigo-400 text-lg">👕</span>
            <h3 className="text-lg font-bold text-white">Aggiungi Nuovo Capo</h3>
          </div>
          <button 
            onClick={onClose} 
            className="text-gray-400 hover:text-white font-bold text-lg transition"
          >
            ✕
          </button>
        </div>

        {/* Banner Errore */}
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
              Nome Capo / Articolo
            </label>
            <input
              type="text"
              required
              minLength={2}
              maxLength={100}
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              className="w-full bg-[#0b0e17] text-white text-sm rounded-lg px-3 py-2.5 border border-[#1f263e] focus:outline-none focus:border-[#6366f1] placeholder-gray-600 transition"
              placeholder="Es. Giacca di pelle vintage"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
              Proprietario (Utente)
            </label>
            <select
              required
              value={formData.user_id}
              onChange={(e) => handleChange('user_id', e.target.value)}
              className="w-full bg-[#0b0e17] text-white text-sm rounded-lg px-3 py-2.5 border border-[#1f263e] focus:outline-none focus:border-[#6366f1] transition"
            >
              <option value="">-- Seleziona un utente --</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name} {u.surname} ({u.email})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
              Valore Stimato (€)
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              required
              value={formData.price}
              onChange={(e) => handleChange('price', e.target.value)}
              className="w-full bg-[#0b0e17] text-white text-sm rounded-lg px-3 py-2.5 border border-[#1f263e] focus:outline-none focus:border-[#6366f1] placeholder-gray-600 transition"
              placeholder="Es. 45.00"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
              URL Immagine (Opzionale)
            </label>
            <input
              type="url"
              value={formData.photo_url}
              onChange={(e) => handleChange('photo_url', e.target.value)}
              className="w-full bg-[#0b0e17] text-white text-sm rounded-lg px-3 py-2.5 border border-[#1f263e] focus:outline-none focus:border-[#6366f1] placeholder-gray-600 transition"
              placeholder="https://images.unsplash.com/..."
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
              {loading ? 'Salvataggio...' : 'Aggiungi al Catalogo'}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
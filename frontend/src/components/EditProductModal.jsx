import { useState, useEffect } from 'react';

export default function EditProductModal({ product, users = [], onClose, onSave }) {
  const [name, setName] = useState(product?.name || '');
  const [price, setPrice] = useState(product?.price || '');
  const [userId, setUserId] = useState(product?.user_id || '');
  const [photoUrl, setPhotoUrl] = useState(
    product?.photos && product.photos.length > 0 ? product.photos[0] : ''
  );
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);

  // Sincronizza lo stato se la prop product cambia
  useEffect(() => {
    if (product) {
      setName(product.name || '');
      setPrice(product.price || '');
      setUserId(product.user_id || '');
      setPhotoUrl(product.photos && product.photos.length > 0 ? product.photos[0] : '');
      setErrorMessage('');
    }
  }, [product]);

  if (!product) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    const trimmedName = name.trim();
    const parsedPrice = parseFloat(price);
    const selectedUserId = Number(userId);
    const trimmedPhotoUrl = photoUrl.trim();

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

    const payload = {
      name: trimmedName,
      price: parsedPrice,
      user_id: selectedUserId,
      photos: trimmedPhotoUrl ? [trimmedPhotoUrl] : []
    };

    try {
      await onSave(product.id, payload);
      onClose();
    } catch (err) {
      setErrorMessage(err.message || 'Errore durante il salvataggio del prodotto.');
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
          <span>Modifica Prodotto</span>
        </h2>

        {/* Banner Errore In-line */}
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
              Nome Capo
            </label>
            <input
              type="text"
              required
              disabled={loading}
              minLength={2}
              maxLength={100}
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (errorMessage) setErrorMessage('');
              }}
              className="w-full bg-[#0b0e17] border border-[#1f263e] rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-[#4f46e5] text-sm transition disabled:opacity-50"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
              Prezzo (€)
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              required
              disabled={loading}
              value={price}
              onChange={(e) => {
                setPrice(e.target.value);
                if (errorMessage) setErrorMessage('');
              }}
              className="w-full bg-[#0b0e17] border border-[#1f263e] rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-[#4f46e5] text-sm transition disabled:opacity-50"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
              Proprietario (Utente)
            </label>
            <select
              value={userId}
              disabled={loading}
              onChange={(e) => {
                setUserId(e.target.value);
                if (errorMessage) setErrorMessage('');
              }}
              className="w-full bg-[#0b0e17] border border-[#1f263e] rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-[#4f46e5] text-sm transition disabled:opacity-50"
            >
              <option value="">-- Seleziona un utente --</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name} {u.surname} (ID: {u.id})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
              URL Immagine
            </label>
            <input
              type="url"
              disabled={loading}
              placeholder="https://images.unsplash.com/..."
              value={photoUrl}
              onChange={(e) => {
                setPhotoUrl(e.target.value);
                if (errorMessage) setErrorMessage('');
              }}
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
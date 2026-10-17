import { useState } from 'react';

export default function AddProductModal({ isOpen, onClose, users = [], onProductCreated }) {
  const [formData, setFormData] = useState({ name: '', price: '', user_id: '', photo_url: '' });
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.user_id) {
      alert('Seleziona il proprietario del capo.');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        name: formData.name,
        price: parseFloat(formData.price),
        user_id: parseInt(formData.user_id, 10),
        photos: formData.photo_url ? [formData.photo_url] : []
      };

      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error('Errore durante la creazione del capo');

      const newProduct = await res.json();
      if (onProductCreated) onProductCreated(newProduct);

      setFormData({ name: '', price: '', user_id: '', photo_url: '' });
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
        <div className="flex justify-between items-center border-b border-[#1f263e] pb-3">
          <div className="flex items-center space-x-2">
            <span className="text-indigo-400 text-lg">👕</span>
            <h3 className="text-lg font-bold text-white">Aggiungi Nuovo Capo</h3>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white font-bold text-lg">
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
              Nome Capo / Articolo
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full bg-[#0b0e17] text-white text-sm rounded-lg px-3 py-2.5 border border-[#1f263e] focus:outline-none focus:border-[#6366f1] placeholder-gray-600"
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
              onChange={(e) => setFormData({ ...formData, user_id: e.target.value })}
              className="w-full bg-[#0b0e17] text-white text-sm rounded-lg px-3 py-2.5 border border-[#1f263e] focus:outline-none focus:border-[#6366f1]"
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
              required
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              className="w-full bg-[#0b0e17] text-white text-sm rounded-lg px-3 py-2.5 border border-[#1f263e] focus:outline-none focus:border-[#6366f1] placeholder-gray-600"
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
              onChange={(e) => setFormData({ ...formData, photo_url: e.target.value })}
              className="w-full bg-[#0b0e17] text-white text-sm rounded-lg px-3 py-2.5 border border-[#1f263e] focus:outline-none focus:border-[#6366f1] placeholder-gray-600"
              placeholder="https://images.unsplash.com/..."
            />
          </div>

          <div className="flex justify-end space-x-3 pt-3 border-t border-[#1f263e]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-xs font-semibold text-gray-400 hover:text-white hover:bg-[#1b2238]"
            >
              Annulla
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-[#4f46e5] hover:bg-[#4338ca] text-white rounded-lg text-xs font-bold shadow-md shadow-indigo-500/20"
            >
              {loading ? 'Salvataggio...' : 'Aggiungi al Catalogo'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
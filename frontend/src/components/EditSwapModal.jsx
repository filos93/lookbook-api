import { useState, useEffect } from 'react';

export default function EditSwapModal({ isOpen, onClose, swap, users = [], products = [], onSave }) {
  const [selectedUserIds, setSelectedUserIds] = useState([]);
  const [selectedProductIds, setSelectedProductIds] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Sincronizza lo stato del form quando cambia lo swap selezionato
  useEffect(() => {
    if (swap) {
      const parseIds = (data) => {
        const list = Array.isArray(data) ? data : (typeof data === 'string' ? JSON.parse(data || '[]') : []);
        return list.map(item => item.id);
      };

      setSelectedUserIds(parseIds(swap.users));
      setSelectedProductIds(parseIds(swap.products));
      setError('');
    }
  }, [swap]);

  if (!isOpen || !swap) return null;

  const toggleUser = (id) => {
    setSelectedUserIds(prev => 
      prev.includes(id) ? prev.filter(uId => uId !== id) : [...prev, id]
    );
  };

  const toggleProduct = (id) => {
    setSelectedProductIds(prev => 
      prev.includes(id) ? prev.filter(pId => pId !== id) : [...prev, id]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (selectedUserIds.length === 0) {
      setError('Seleziona almeno un utente.');
      return;
    }
    if (selectedProductIds.length === 0) {
      setError('Seleziona almeno un prodotto.');
      return;
    }

    try {
      setIsSubmitting(true);
      setError('');
      await onSave(swap.id, {
        userIds: selectedUserIds,
        productIds: selectedProductIds,
      });
      onClose();
    } catch (err) {
      setError(err.message || 'Errore durante la modifica dello swap.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-[#121624] border border-[#1f263e] rounded-2xl w-full max-w-2xl p-6 shadow-2xl space-y-6 text-gray-200">
        
        {/* Header */}
        <div className="flex justify-between items-center border-b border-[#1f263e] pb-4">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <span>✏️</span> Modifica Ordine Swap #{swap.id}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition">✕</button>
        </div>

        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-xs">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Selezione Utenti */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">
              Partecipanti (Selezionati: {selectedUserIds.length})
            </label>
            <div className="max-h-36 overflow-y-auto space-y-1.5 border border-[#1f263e] bg-[#0b0e17] p-2 rounded-xl">
              {users.map(u => (
                <div 
                  key={u.id}
                  onClick={() => toggleUser(u.id)}
                  className={`p-2 rounded-lg cursor-pointer text-xs flex justify-between items-center border transition ${
                    selectedUserIds.includes(u.id) 
                      ? 'bg-indigo-500/10 border-indigo-500/40 text-indigo-300' 
                      : 'border-transparent text-gray-400 hover:bg-[#121624]'
                  }`}
                >
                  <span>{u.name} {u.surname}</span>
                  <span className="text-[10px] opacity-70">{u.email}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Selezione Prodotti */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">
              Capi Scambiati (Selezionati: {selectedProductIds.length})
            </label>
            <div className="max-h-36 overflow-y-auto space-y-1.5 border border-[#1f263e] bg-[#0b0e17] p-2 rounded-xl">
              {products.map(p => (
                <div 
                  key={p.id}
                  onClick={() => toggleProduct(p.id)}
                  className={`p-2 rounded-lg cursor-pointer text-xs flex justify-between items-center border transition ${
                    selectedProductIds.includes(p.id) 
                      ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300' 
                      : 'border-transparent text-gray-400 hover:bg-[#121624]'
                  }`}
                >
                  <span className="capitalize">{p.name}</span>
                  <span className="font-bold text-emerald-400">€{Number(p.price || 0).toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Azioni */}
          <div className="flex justify-end space-x-3 border-t border-[#1f263e] pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-[#1f263e] hover:bg-[#2a3454] text-gray-300 text-xs font-semibold rounded-lg transition"
            >
              Annulla
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg transition disabled:opacity-50"
            >
              {isSubmitting ? 'Salvataggio...' : 'Salva Modifiche'}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
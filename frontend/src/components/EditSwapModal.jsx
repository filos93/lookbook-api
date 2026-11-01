import { useState, useEffect } from 'react';

export default function EditSwapModal({ isOpen, onClose, swap, users = [], products = [], onSave }) {
  const [selectedUserIds, setSelectedUserIds] = useState([]);
  const [selectedProductIds, setSelectedProductIds] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Helper per estrarre gli ID da un array o JSON string
  const parseIds = (data) => {
    const list = Array.isArray(data) ? data : (typeof data === 'string' ? JSON.parse(data || '[]') : []);
    return list.map(item => item.id);
  };

  // Sincronizza lo stato quando viene aperto uno swap
  useEffect(() => {
    if (swap) {
      setSelectedUserIds(parseIds(swap.users));
      setSelectedProductIds(parseIds(swap.products));
      setError('');
    }
  }, [swap]);

  if (!isOpen || !swap) return null;

  // Helper per trovare l'owner ID di un prodotto (supporta owner_id o user_id)
  const getProductOwnerId = (product) => product.owner_id || product.user_id;

  // ID dei prodotti attualmente appartenenti a questo specifico swap
  const currentSwapProductIds = parseIds(swap.products);

  // Gestione selezione utenti (massimo 2) + auto-deselezione capi non più validi
  const toggleUser = (userId) => {
    setSelectedUserIds(prevUsers => {
      let updatedUsers;
      if (prevUsers.includes(userId)) {
        updatedUsers = prevUsers.filter(id => id !== userId);
      } else {
        if (prevUsers.length >= 2) {
          setError('Puoi selezionare al massimo 2 partecipanti.');
          return prevUsers;
        }
        updatedUsers = [...prevUsers, userId];
      }

      // Rimuove automaticamente i capi i cui proprietari non sono più tra gli utenti selezionati
      setSelectedProductIds(prevProducts =>
        prevProducts.filter(pId => {
          const prod = products.find(p => p.id === pId);
          return prod && updatedUsers.includes(getProductOwnerId(prod));
        })
      );

      setError('');
      return updatedUsers;
    });
  };

  // Gestione selezione capi: consentiti solo capi appartenenti agli utenti selezionati
  const toggleProduct = (product) => {
    const ownerId = getProductOwnerId(product);

    if (!selectedUserIds.includes(ownerId)) {
      setError('Puoi selezionare solo capi appartenenti agli utenti partecipanti.');
      return;
    }

    setSelectedProductIds(prev => {
      if (prev.includes(product.id)) {
        setError('');
        return prev.filter(pId => pId !== product.id);
      }

      if (prev.length >= 2) {
        setError('Puoi selezionare al massimo 2 capi.');
        return prev;
      }

      setError('');
      return [...prev, product.id];
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (selectedUserIds.length !== 2) {
      setError('Devi selezionare esattamente 2 utenti partecipanti.');
      return;
    }

    if (selectedProductIds.length !== 2) {
      setError('Devi selezionare esattamente 2 capi da scambiare.');
      return;
    }

    // Verifica che ciascuno dei 2 utenti contribuisca con esattamente 1 capo
    const selectedProductsObjs = products.filter(p => selectedProductIds.includes(p.id));
    const ownersInSwap = new Set(selectedProductsObjs.map(p => getProductOwnerId(p)));

    if (ownersInSwap.size !== 2) {
      setError('Lo swap deve includere 1 capo per ciascun utente selezionato.');
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

  // Filtra i capi: mostra i capi degli utenti selezionati che sono o disponibili o già in questo swap
  const availableProducts = products.filter(p => {
    const isOwnerSelected = selectedUserIds.includes(getProductOwnerId(p));
    const isCurrentlyInThisSwap = currentSwapProductIds.includes(p.id);
    const isAvailable = p.status !== 'swapped';

    return isOwnerSelected && (isAvailable || isCurrentlyInThisSwap);
  });

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
          <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-xs font-semibold">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* 1. Selezione Partecipanti */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-400">
                Partecipanti (Esattamente 2)
              </label>
              <span className={`text-xs font-bold ${selectedUserIds.length === 2 ? 'text-emerald-400' : 'text-amber-400'}`}>
                Selezionati: {selectedUserIds.length}/2
              </span>
            </div>
            <div className="max-h-36 overflow-y-auto space-y-1.5 border border-[#1f263e] bg-[#0b0e17] p-2 rounded-xl">
              {users.map(u => {
                const isSelected = selectedUserIds.includes(u.id);
                return (
                  <div 
                    key={u.id}
                    onClick={() => toggleUser(u.id)}
                    className={`p-2 rounded-lg cursor-pointer text-xs flex justify-between items-center border transition ${
                      isSelected 
                        ? 'bg-indigo-500/10 border-indigo-500/40 text-indigo-300' 
                        : 'border-transparent text-gray-400 hover:bg-[#121624]'
                    }`}
                  >
                    <span className="font-medium">{u.name} {u.surname}</span>
                    <span className="text-[10px] opacity-70">{u.email}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 2. Selezione Capi dei Partecipanti */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-400">
                Capi Disponibili dei Partecipanti Selezionati
              </label>
              <span className={`text-xs font-bold ${selectedProductIds.length === 2 ? 'text-emerald-400' : 'text-amber-400'}`}>
                Selezionati: {selectedProductIds.length}/2
              </span>
            </div>

            <div className="max-h-40 overflow-y-auto space-y-1.5 border border-[#1f263e] bg-[#0b0e17] p-2 rounded-xl">
              {selectedUserIds.length === 0 ? (
                <p className="text-xs text-gray-500 italic p-2 text-center">
                  Seleziona prima i partecipanti per visualizzare i loro capi.
                </p>
              ) : availableProducts.length === 0 ? (
                <p className="text-xs text-gray-500 italic p-2 text-center">
                  Nessun capo disponibile trovato per gli utenti selezionati.
                </p>
              ) : (
                availableProducts.map(p => {
                  const isSelected = selectedProductIds.includes(p.id);
                  const owner = users.find(u => u.id === getProductOwnerId(p));
                  return (
                    <div 
                      key={p.id}
                      onClick={() => toggleProduct(p)}
                      className={`p-2 rounded-lg cursor-pointer text-xs flex justify-between items-center border transition ${
                        isSelected 
                          ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300' 
                          : 'border-transparent text-gray-400 hover:bg-[#121624]'
                      }`}
                    >
                      <div className="flex flex-col">
                        <span className="capitalize font-medium">{p.name}</span>
                        <span className="text-[10px] text-gray-500">Proprietario: {owner ? `${owner.name} ${owner.surname}` : 'N/D'}</span>
                      </div>
                      <span className="font-bold text-emerald-400">€{Number(p.price || 0).toFixed(2)}</span>
                    </div>
                  );
                })
              )}
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
              disabled={isSubmitting || selectedUserIds.length !== 2 || selectedProductIds.length !== 2}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg transition disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Salvataggio...' : 'Salva Modifiche'}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
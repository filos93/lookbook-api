import { useEffect, useState } from 'react';

export default function SwapRecord({ products = [], preselectedProduct = null, onCreateSwap }) {
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Pre-seleziona automaticamente il prodotto quando viene passato come prop da App.jsx
  useEffect(() => {
    if (preselectedProduct && preselectedProduct.status !== 'swapped') {
      setSelectedProducts([preselectedProduct]);
      setErrorMessage('');
    } else if (!preselectedProduct) {
      setSelectedProducts([]);
    }
  }, [preselectedProduct]);

  const toggleSelectProduct = (product) => {
    if (errorMessage) setErrorMessage('');

    // Previene la selezione di capi già scambiati
    if (product.status === 'swapped') {
      setErrorMessage(`Il capo "${product.name}" risulta già scambiato e non è disponibile.`);
      return;
    }

    const isAlreadySelected = selectedProducts.some((p) => p.id === product.id);

    if (isAlreadySelected) {
      // Deseleziona il prodotto
      setSelectedProducts(selectedProducts.filter((p) => p.id !== product.id));
      return;
    }

    if (selectedProducts.length >= 2) {
      setErrorMessage('Puoi selezionare al massimo 2 prodotti per effettuare uno scambio.');
      return;
    }

    // Se è già stato selezionato un primo prodotto, verifica che il secondo appartenga a un utente DIVERSO
    if (selectedProducts.length === 1) {
      const firstProduct = selectedProducts[0];
      if (firstProduct.user_id === product.user_id) {
        setErrorMessage('Lo swap deve avvenire tra due utenti differenti. Seleziona un capo di un altro proprietario.');
        return;
      }
    }

    setSelectedProducts([...selectedProducts, product]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (selectedProducts.length !== 2) {
      setErrorMessage('Seleziona esattamente 2 prodotti per confermare lo swap.');
      return;
    }

    const p1 = selectedProducts[0];
    const p2 = selectedProducts[1];

    if (p1.status === 'swapped' || p2.status === 'swapped') {
      setErrorMessage('Uno o entrambi i capi selezionati risultano già scambiati.');
      return;
    }

    if (p1.user_id === p2.user_id) {
      setErrorMessage('Impossibile effettuare uno swap tra capi appartenenti allo stesso utente.');
      return;
    }

    setSubmitting(true);

    try {
      const userIds = [p1.user_id, p2.user_id];
      const productIds = [p1.id, p2.id];

      await onCreateSwap({ user_ids: userIds, product_ids: productIds });
      setSelectedProducts([]);
    } catch (err) {
      setErrorMessage(err.message || 'Errore durante la creazione dello swap.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="border border-[#1f263e] rounded-xl p-6 bg-[#121624] shadow-2xl mb-8 text-gray-200">
      <div className="flex items-center space-x-2 mb-1">
        <span className="text-emerald-400 text-xl">⇄</span>
        <h2 className="text-xl font-bold text-white">Crea Nuovo Scambio (Swap)</h2>
      </div>

      {/* Descrizione dinamica in base alla pre-selezione */}
      <p className="text-xs text-gray-400 mb-4">
        {selectedProducts.length === 1 ? (
          <span>
            Primo capo selezionato: <strong className="text-white">"{selectedProducts[0].name}"</strong>. Seleziona il secondo capo da un proprietario differente per completare la proposta di scambio.
          </span>
        ) : (
          'Seleziona 2 capi disponibili da due proprietari differenti per completare una proposta di scambio.'
        )}
      </p>

      {/* Banner Errore In-line */}
      {errorMessage && (
        <div className="mb-4 bg-red-500/10 border border-red-500/50 text-red-400 text-xs rounded-lg p-3 flex items-center space-x-2">
          <span>⚠️</span>
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Grid Selezione Prodotti */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 mb-6">
        {products.map((p) => {
          const isSelected = selectedProducts.some((sp) => sp.id === p.id);
          const isSwapped = p.status === 'swapped';
          
          // Disabilita visivamente se già scambiato, in invio o appartenente allo stesso utente del primo selezionato
          const isSameUserAsSelected =
            selectedProducts.length === 1 &&
            selectedProducts[0].user_id === p.user_id &&
            !isSelected;

          const isCardDisabled = isSwapped || isSameUserAsSelected || submitting;

          return (
            <div
              key={p.id}
              onClick={() => !isCardDisabled && toggleSelectProduct(p)}
              className={`p-3.5 border rounded-xl transition flex justify-between items-center relative overflow-hidden gap-3 ${
                isSwapped
                  ? 'opacity-40 cursor-not-allowed border-gray-800 bg-[#090b12]'
                  : isCardDisabled
                  ? 'opacity-50 cursor-not-allowed border-[#1f263e] bg-[#0b0e17]'
                  : isSelected
                  ? 'border-[#10b981] bg-[#10b981]/10 text-white font-semibold'
                  : 'border-[#1f263e] bg-[#0b0e17] hover:border-[#2d3758] cursor-pointer'
              }`}
            >
              <div className="space-y-0.5 min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2 min-w-0">
                  <p className="text-sm font-medium text-white capitalize truncate min-w-0" title={p.name}>
                    {p.name}
                  </p>
                  {isSwapped && (
                    <span className="shrink-0 bg-amber-500/10 text-amber-400 text-[9px] font-bold px-1.5 py-0.5 rounded border border-amber-500/20">
                      SCAMBIATO
                    </span>
                  )}
                </div>
                <p className="text-xs text-emerald-400 font-semibold">
                  €{Number(p.price || 0).toFixed(2)}
                </p>
                {p.owner_name && (
                  <p className="text-[11px] text-gray-400 truncate">
                    Proprietario: <span className="text-gray-300">{p.owner_name}</span>
                  </p>
                )}
              </div>

              <input
                type="checkbox"
                checked={isSelected}
                disabled={isCardDisabled}
                readOnly
                className="w-4 h-4 rounded accent-[#10b981] cursor-pointer shrink-0"
              />
            </div>
          );
        })}
      </div>

      {/* Pulsante di Conferma */}
      <button
        onClick={handleSubmit}
        disabled={selectedProducts.length !== 2 || submitting}
        className={`w-full py-2.5 px-4 rounded-xl font-bold text-xs transition shadow-lg ${
          selectedProducts.length === 2 && !submitting
            ? 'bg-[#10b981] hover:bg-[#059669] text-white shadow-emerald-500/20 active:scale-[0.99]'
            : 'bg-[#1f263e] text-gray-500 cursor-not-allowed'
        }`}
      >
        {submitting ? 'Creazione Swap in corso...' : `Conferma Ordine Swap (${selectedProducts.length}/2)`}
      </button>
    </div>
  );
}
import { useState } from 'react';

export default function SwapRecord({ products = [], onCreateSwap }) {
  const [selectedProducts, setSelectedProducts] = useState([]);

  const toggleSelectProduct = (product) => {
    if (selectedProducts.find((p) => p.id === product.id)) {
      setSelectedProducts(selectedProducts.filter((p) => p.id !== product.id));
    } else {
      if (selectedProducts.length >= 2) {
        alert('Puoi selezionare al massimo 2 prodotti per effettuare uno scambio.');
        return;
      }
      setSelectedProducts([...selectedProducts, product]);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (selectedProducts.length !== 2) {
      alert('Seleziona esattamente 2 prodotti per confermare lo swap.');
      return;
    }

    const userIds = [...new Set(selectedProducts.map((p) => p.user_id))];
    const productIds = selectedProducts.map((p) => p.id);

    onCreateSwap({ user_ids: userIds, product_ids: productIds });
    setSelectedProducts([]);
  };

  return (
    <div className="border border-borderCustom rounded-lg p-6 bg-white shadow-custom mb-8">
      <h2 className="text-xl font-bold text-heading mb-2">Crea Nuovo Scambio (Swap)</h2>
      <p className="text-sm text-body mb-4">
        Seleziona 2 capi dal catalogo per completare una proposta di scambio.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-6">
        {products.map((p) => {
          const isSel = Boolean(selectedProducts.find((sp) => sp.id === p.id));
          return (
            <div
              key={p.id}
              onClick={() => toggleSelectProduct(p)}
              className={`p-3 border rounded-md cursor-pointer transition flex justify-between items-center ${
                isSel ? 'border-accent bg-accent-bg font-semibold' : 'border-borderCustom hover:bg-codeBg'
              }`}
            >
              <div>
                <p className="text-sm text-heading capitalize">{p.name}</p>
                <p className="text-xs text-body">€{Number(p.price || 0).toFixed(2)}</p>
              </div>
              <input type="checkbox" checked={isSel} readOnly className="accent-accent" />
            </div>
          );
        })}
      </div>

      <button
        onClick={handleSubmit}
        disabled={selectedProducts.length !== 2}
        className={`w-full py-2 px-4 rounded-md font-bold text-white transition ${
          selectedProducts.length === 2
            ? 'bg-accent hover:opacity-90'
            : 'bg-gray-300 cursor-not-allowed'
        }`}
      >
        Conferma Ordine Swap ({selectedProducts.length}/2)
      </button>
    </div>
  );
}
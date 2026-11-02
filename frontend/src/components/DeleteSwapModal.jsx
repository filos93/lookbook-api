import React, { useState } from 'react';

export default function DeleteSwapModal({ swap, onClose, onConfirm }) {
  const [loading, setLoading] = useState(false);

  if (!swap) return null;

  const formattedCode = `#SWP-${String(swap.id).padStart(4, '0')}`;

  const handleConfirm = async () => {
    setLoading(true);
    try {
      await onConfirm(swap);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="w-full max-w-md rounded-2xl bg-[#121624] border border-[#1f263e] p-6 shadow-2xl text-gray-200 animate-in fade-in zoom-in-95 duration-150">
        <h3 className="text-lg font-bold text-white mb-2">Elimina Ordine Swap</h3>
        <p className="text-sm text-gray-400 mb-6 leading-relaxed">
          Sei sicuro di voler eliminare l'ordine <span className="font-semibold text-indigo-400">{formattedCode}</span>? I capi coinvolti verranno ripristinati allo stato <span className="text-emerald-400 font-semibold">disponibile</span>.
        </p>

        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 text-sm font-semibold rounded-lg bg-[#1b2238] text-gray-300 hover:bg-[#252f4e] transition disabled:opacity-50"
          >
            Annulla
          </button>
          <button
            onClick={handleConfirm}
            disabled={loading}
            className="px-4 py-2 text-sm font-semibold rounded-lg bg-red-600 text-white hover:bg-red-500 shadow-lg shadow-red-600/30 transition disabled:opacity-50"
          >
            {loading ? 'Annullamento...' : 'Annulla Swap'}
          </button>
        </div>
      </div>
    </div>
  );
}
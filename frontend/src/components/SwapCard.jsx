import React from 'react';

export default function SwapCard({ swap, onDelete, onEdit }) {
  if (!swap) return null;

  const formattedDate = swap.created_at
    ? new Date(swap.created_at).toLocaleDateString('it-IT', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      })
    : 'Data non disponibile';

  const swapRef = `#SWAP-${String(swap.id).padStart(4, '0')}`;

  const parseList = (data) => {
    if (Array.isArray(data)) return data;
    if (typeof data === 'string' && data.trim() !== '') {
      try {
        return JSON.parse(data);
      } catch {
        return [];
      }
    }
    return [];
  };

  const usersList = parseList(swap.users);
  const productsList = parseList(swap.products);

  return (
    <div className="border border-[#1f263e] rounded-xl p-5 bg-[#121624] shadow-2xl space-y-4 text-gray-200">
      {/* Header Card Anti-Accavallamento */}
      <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3 border-b border-[#1f263e] pb-4">
        {/* Blocco Sinistro: Icona + Codice Ordine + Badge + Data */}
        <div className="flex items-center space-x-3 min-w-0">
          <div className="w-10 h-10 rounded-lg bg-[#10b981]/10 border border-[#10b981]/30 flex items-center justify-center text-[#10b981] font-bold text-base shrink-0">
            ⇄
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-bold text-white text-base whitespace-nowrap">
                Ordine <span className="text-indigo-400">{swapRef}</span>
              </h3>
              <span className="shrink-0 bg-[#10b981]/20 text-[#10b981] text-[10px] font-bold px-2 py-0.5 rounded-full border border-[#10b981]/30 whitespace-nowrap">
                Completato
              </span>
            </div>
            <p className="text-xs text-gray-400 mt-0.5">{formattedDate}</p>
          </div>
        </div>

        {/* Blocco Destro: Valore Scambiato + Pulsanti Azione */}
        <div className="flex items-center gap-4 flex-wrap shrink-0 ml-auto">
          <div className="text-right">
            <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider whitespace-nowrap">
              Valore Scambiato
            </p>
            <p className="text-sm font-bold text-emerald-400 whitespace-nowrap">
              €{Number(swap.total_gross_value || 0).toFixed(2)}
            </p>
          </div>

          <div className="flex items-center space-x-2">
            {onEdit && (
              <button
                onClick={() => onEdit(swap)}
                className="px-3 py-1.5 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 rounded-lg text-xs font-semibold transition active:scale-95 whitespace-nowrap"
              >
                Modifica
              </button>
            )}

            {onDelete && (
              <button
                onClick={() => onDelete(swap)}
                className="px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg text-xs font-semibold transition active:scale-95 whitespace-nowrap"
              >
                Cancella
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Dettagli Partecipanti e Capi */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Partecipanti */}
        <div className="bg-[#0b0e17] p-3.5 rounded-xl border border-[#1f263e]">
          <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center space-x-1">
            <span>👥</span>
            <span>Partecipanti ({usersList.length})</span>
          </h4>
          <ul className="text-xs space-y-2">
            {usersList.length === 0 ? (
              <li className="text-gray-500 italic">Nessun utente associato.</li>
            ) : (
              usersList.map((u, idx) => (
                <li
                  key={u.id || idx}
                  className="flex justify-between items-center bg-[#121624] p-2.5 rounded-lg border border-[#1f263e]/60 min-w-0 gap-2"
                >
                  <span className="font-medium text-white truncate min-w-0">
                    {u.name} {u.surname}
                  </span>
                  <span className="text-[11px] text-gray-400 truncate shrink-0">
                    {u.email}
                  </span>
                </li>
              ))
            )}
          </ul>
        </div>

        {/* Capi Scambiati */}
        <div className="bg-[#0b0e17] p-3.5 rounded-xl border border-[#1f263e]">
          <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center space-x-1">
            <span>👕</span>
            <span>Capi Scambiati ({productsList.length})</span>
          </h4>
          <ul className="text-xs space-y-2">
            {productsList.length === 0 ? (
              <li className="text-gray-500 italic">Nessun capo associato.</li>
            ) : (
              productsList.map((p, idx) => (
                <li
                  key={p.id || idx}
                  className="flex justify-between items-center bg-[#121624] p-2.5 rounded-lg border border-[#1f263e]/60 min-w-0 gap-2"
                >
                  <div className="flex items-center space-x-2 truncate min-w-0 flex-1">
                    <span className="capitalize font-medium text-white truncate min-w-0" title={p.name}>
                      {p.name}
                    </span>
                    <span className="shrink-0 bg-amber-500/10 text-amber-400 text-[9px] font-bold px-1.5 py-0.5 rounded border border-amber-500/20">
                      Scambiato
                    </span>
                  </div>
                  <span className="font-bold text-emerald-400 shrink-0 ml-2">
                    €{Number(p.price || 0).toFixed(2)}
                  </span>
                </li>
              ))
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}
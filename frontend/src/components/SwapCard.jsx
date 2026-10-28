export default function SwapCard({ swap, onDelete }) {
  if (!swap) return null;

  const formattedDate = swap.created_at
    ? new Date(swap.created_at).toLocaleDateString('it-IT', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      })
    : 'Data non disponibile';

  // Parsing e guardrail sicuri per gli array di partecipanti e prodotti
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
      {/* Header Card */}
      <div className="flex justify-between items-center border-b border-[#1f263e] pb-3">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-lg bg-[#10b981]/10 border border-[#10b981]/30 flex items-center justify-center text-[#10b981] font-bold text-sm">
            ⇄
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-bold text-white text-base">Ordine Swap #{swap.id}</span>
              <span className="bg-[#10b981]/20 text-[#10b981] text-[10px] font-bold px-2 py-0.5 rounded-full border border-[#10b981]/30">
                Completato
              </span>
            </div>
            <p className="text-xs text-gray-400">{formattedDate}</p>
          </div>
        </div>

        {/* Azioni & Valore Totale */}
        <div className="flex items-center space-x-4">
          <div className="text-right hidden sm:block">
            <p className="text-[10px] uppercase font-semibold text-gray-400 tracking-wider">
              Valore Scambiato
            </p>
            <p className="text-sm font-bold text-emerald-400">
              €{Number(swap.total_gross_value || 0).toFixed(2)}
            </p>
          </div>

          {onDelete && (
            <button
              onClick={() => {
                if (confirm(`Sei sicuro di voler cancellare l'ordine Swap #${swap.id}?`)) {
                  onDelete(swap.id);
                }
              }}
              className="px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg text-xs font-semibold transition active:scale-95"
            >
              Cancella
            </button>
          )}
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
                  className="flex justify-between items-center bg-[#121624] p-2 rounded-lg border border-[#1f263e]/60"
                >
                  <span className="font-medium text-white">
                    {u.name} {u.surname}
                  </span>
                  <span className="text-[11px] text-gray-400">{u.email}</span>
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
                  className="flex justify-between items-center bg-[#121624] p-2 rounded-lg border border-[#1f263e]/60"
                >
                  <span className="capitalize font-medium text-white">{p.name}</span>
                  <span className="font-bold text-emerald-400">
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
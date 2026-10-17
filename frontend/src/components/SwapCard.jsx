export default function SwapCard({ swap, onDelete }) {
  if (!swap) return null;

  const formattedDate = swap.created_at
    ? new Date(swap.created_at).toLocaleDateString('it-IT', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      })
    : 'Data non disponibile';

  return (
    <div className="border border-borderCustom rounded-lg p-5 bg-white shadow-custom space-y-4">
      <div className="flex justify-between items-center border-b border-borderCustom pb-3">
        <div>
          <span className="font-bold text-heading text-lg">Ordine Swap #{swap.id}</span>
          <p className="text-xs text-body">{formattedDate}</p>
        </div>
        {onDelete && (
          <button
            onClick={() => onDelete(swap.id)}
            className="px-3 py-1 bg-red-50 text-red-600 border border-red-200 rounded-md hover:bg-red-100 text-xs font-semibold transition"
          >
            Cancella
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-codeBg p-3 rounded-md">
          <h4 className="text-xs font-bold text-heading uppercase mb-2">Partecipanti</h4>
          <ul className="text-sm text-body space-y-1">
            {swap.users?.map((u) => (
              <li key={u.id} className="flex justify-between">
                <span>{u.name} {u.surname}</span>
                <span className="text-xs text-gray-500">{u.email}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-codeBg p-3 rounded-md">
          <h4 className="text-xs font-bold text-heading uppercase mb-2">Capi Scambiati</h4>
          <ul className="text-sm text-body space-y-1">
            {swap.products?.map((p) => (
              <li key={p.id} className="flex justify-between">
                <span className="capitalize">{p.name}</span>
                <span className="font-semibold text-accent">€{Number(p.price || 0).toFixed(2)}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
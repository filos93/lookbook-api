export default function ProductCard({ product, onDelete, onEdit, onSwapClick }) {
  if (!product) return null;

  const { id, name, price, owner_name, photos, status = 'available' } = product;

  const isSwapped = status === 'swapped';

  // Parsing sicuro per photos
  let photoList = [];
  if (Array.isArray(photos)) {
    photoList = photos;
  } else if (typeof photos === 'string' && photos.trim() !== '') {
    try {
      photoList = JSON.parse(photos);
    } catch {
      photoList = [photos];
    }
  }

  const coverImage = photoList && photoList.length > 0 && photoList[0]
    ? photoList[0] 
    : 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&q=80&w=600';

  return (
    <div className={`bg-[#121624] border border-[#1f263e] rounded-xl overflow-hidden shadow-lg flex flex-col justify-between group transition relative ${
      isSwapped ? 'opacity-70 border-gray-800' : 'hover:border-[#374151]'
    }`}>
      <div>
        {/* Container Immagine */}
        <div className="relative h-64 w-full bg-[#0b0e17] overflow-hidden">
          {/* Azioni in alto a sinistra (Elimina & Modifica) */}
          <div className="absolute top-3 left-3 flex space-x-1.5 z-20">
            {onDelete && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(product);
                }}
                disabled={isSwapped}
                className="bg-red-600/80 hover:bg-red-600 text-white text-xs font-bold w-7 h-7 rounded-full flex items-center justify-center backdrop-blur-md transition disabled:opacity-40 disabled:cursor-not-allowed"
                title={isSwapped ? "Impossibile eliminare un capo scambiato" : "Elimina prodotto"}
              >
                ✕
              </button>
            )}

            {onEdit && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (!isSwapped) onEdit(product);
                }}
                disabled={isSwapped}
                className="bg-indigo-600/80 hover:bg-indigo-600 text-white text-xs font-bold w-7 h-7 rounded-full flex items-center justify-center backdrop-blur-md transition disabled:opacity-40 disabled:cursor-not-allowed"
                title={isSwapped ? "Impossibile modificare un capo già scambiato" : "Modifica prodotto"}
              >
                ✏️
              </button>
            )}
          </div>

          {/* Prezzo in alto a destra */}
          <span className="absolute top-3 right-3 bg-[#6366f1] text-white text-xs font-bold px-2.5 py-1 rounded-md z-10 shadow-md">
            €{Number(price || 0).toFixed(2)}
          </span>

          <img
            src={coverImage}
            alt={name || 'Capo LookBook'}
            className={`w-full h-full object-cover transition duration-300 ${
              isSwapped ? 'filter grayscale-[30%]' : 'group-hover:scale-105'
            }`}
            onError={(e) => {
              e.target.src = 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&q=80&w=600';
            }}
          />
        </div>

        {/* Dettagli Prodotto */}
        <div className="p-4">
          <h3 className="text-white font-bold text-base capitalize truncate">{name}</h3>
          <p className="text-xs text-gray-400 mt-1 flex items-center space-x-1">
            <span>👤</span>
            <span>{owner_name || 'Utente LookBook'}</span>
          </p>
        </div>
      </div>

      {/* Footer Card: Badge Stato & Pulsante Scambia (solo se disponibile) */}
      <div className="p-4 pt-0 flex justify-between items-center mt-2">
        {/* Badge Stato Dinamico */}
        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
          isSwapped 
            ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30' 
            : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
        }`}>
          {isSwapped ? 'SCAMBIATO' : 'DISPONIBILE'}
        </span>

        {/* Pulsante Scambia - mostrato solo se il capo è disponibile */}
        {!isSwapped && onSwapClick && (
          <button
            onClick={() => onSwapClick(product)}
            className="text-xs font-semibold px-3 py-1.5 rounded-md border transition flex items-center space-x-1 bg-[#1b2238] hover:bg-[#252f4c] text-[#818cf8] border-[#2d3758] active:scale-95"
          >
            <span>⇄</span>
            <span>Scambia</span>
          </button>
        )}
      </div>
    </div>
  );
}
export default function ProductCard({ product, onDelete, onEdit, onSwapClick }) {
  if (!product) return null;

  const { id, name, price, owner_name, photos } = product;

  // Parsing sicuro per photos (sia se arriva come array, sia come stringa JSON da MySQL)
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
    <div className="bg-[#121624] border border-[#1f263e] rounded-xl overflow-hidden shadow-lg flex flex-col justify-between group hover:border-[#374151] transition relative">
      <div>
        {/* Container Immagine */}
        <div className="relative h-64 w-full bg-[#0b0e17] overflow-hidden">
          {/* Azioni in alto a sinistra (Elimina & Modifica) */}
          <div className="absolute top-3 left-3 flex space-x-1.5 z-20">
            {onDelete && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (confirm(`Eliminare il capo "${name}"?`)) onDelete(id);
                }}
                className="bg-red-600/80 hover:bg-red-600 text-white text-xs font-bold w-7 h-7 rounded-full flex items-center justify-center backdrop-blur-md transition"
                title="Elimina prodotto"
              >
                ✕
              </button>
            )}

            {onEdit && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(product);
                }}
                className="bg-indigo-600/80 hover:bg-indigo-600 text-white text-xs font-bold w-7 h-7 rounded-full flex items-center justify-center backdrop-blur-md transition"
                title="Modifica prodotto"
              >
                ✏️
              </button>
            )}
          </div>

          <span className="absolute top-3 right-3 bg-[#6366f1] text-white text-xs font-bold px-2.5 py-1 rounded-md z-10 shadow-md">
            €{Number(price || 0).toFixed(2)}
          </span>
          <img
            src={coverImage}
            alt={name || 'Capo LookBook'}
            className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
            onError={(e) => {
              // Fallback automatico se l'URL dell'immagine è rotto/non raggiungibile
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

      <div className="p-4 pt-0 flex justify-between items-center mt-2">
        <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">
          DISPONIBILE
        </span>
        {onSwapClick && (
          <button
            onClick={() => onSwapClick(product)}
            className="bg-[#1b2238] hover:bg-[#252f4c] text-[#818cf8] text-xs font-semibold px-3 py-1.5 rounded-md border border-[#2d3758] transition flex items-center space-x-1"
          >
            <span>⇄</span>
            <span>Scambia</span>
          </button>
        )}
      </div>
    </div>
  );
}
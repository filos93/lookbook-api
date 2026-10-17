export default function Navbar({ 
  searchQuery, 
  setSearchQuery, 
  onOpenCreateUser, 
  onOpenCreateSwap, 
  onOpenAddProduct 
}) {
  return (
    <header className="bg-[#121624] border-b border-[#1f263e] px-6 py-4 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
        
        {/* Brand Logo */}
        <div className="flex items-center space-x-3">
          <div className="bg-[#4f46e5] p-2 rounded-lg text-white font-bold text-xl">
            ⇄
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-xl font-bold text-white tracking-wide">LookBook</span>
            <span className="bg-[#1f263e] text-[#818cf8] text-xs font-semibold px-2 py-0.5 rounded-full">
              Swap Studio
            </span>
          </div>
        </div>

        {/* Search Bar */}
        <div className="flex-1 max-w-md relative">
          <span className="absolute inset-y-0 left-3 flex items-center text-gray-400">
            🔍
          </span>
          <input
            type="text"
            placeholder="Cerca un capo, brand o utente..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#0b0e17] text-white text-sm rounded-lg pl-9 pr-4 py-2 border border-[#1f263e] focus:outline-none focus:border-[#6366f1] placeholder-gray-500"
          />
        </div>

        {/* Action Buttons Top Right */}
        <div className="flex items-center space-x-2">
          <button
            onClick={onOpenCreateUser}
            className="bg-[#1b2238] hover:bg-[#252f4c] text-gray-200 text-xs font-medium px-3.5 py-2 rounded-lg border border-[#2d3758] transition flex items-center space-x-1"
          >
            <span>👤</span>
            <span>+ Crea Utente</span>
          </button>

          <button
            onClick={onOpenCreateSwap}
            className="bg-[#1b2238] hover:bg-[#252f4c] text-emerald-400 text-xs font-medium px-3.5 py-2 rounded-lg border border-[#2d3758] transition flex items-center space-x-1"
          >
            <span>⇄</span>
            <span>Nuovo Swap</span>
          </button>

          <button
            onClick={onOpenAddProduct}
            className="bg-[#4f46e5] hover:bg-[#4338ca] text-white text-xs font-medium px-4 py-2 rounded-lg transition shadow-md shadow-indigo-500/20 flex items-center space-x-1"
          >
            <span>+</span>
            <span>Aggiungi Capo</span>
          </button>
        </div>

      </div>
    </header>
  );
}
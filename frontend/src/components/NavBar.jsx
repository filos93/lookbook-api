import logo from '../assets/logo.png';

export default function Navbar({ 
  searchQuery = '', 
  setSearchQuery, 
  activeTab = 'catalog',
  onOpenCreateUser, 
  onOpenCreateSwap, 
  onOpenAddProduct 
}) {
  const isSearchDisabled = activeTab !== 'catalog';

  const handleClearSearch = () => {
    setSearchQuery('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      handleClearSearch();
    }
  };

  return (
    <header className="bg-[#121624] border-b border-[#1f263e] px-6 py-4 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
        
        {/* Brand Logo */}
        <div className="flex items-center space-x-3">
          <img 
            src={logo} 
            alt="LookBook Swap Studio Logo" 
            className="w-10 h-10 rounded-lg object-cover border border-[#1f263e] shadow-md"
          />
          <div className="flex items-baseline space-x-2">
            <span className="text-xl font-bold text-white tracking-wide">LookBook</span>
            <span className="bg-[#1f263e] text-[#818cf8] text-xs font-semibold px-2 py-0.5 rounded-full">
              Swap Studio
            </span>
          </div>
        </div>

        {/* Search Bar con stato Disabilitato Dinamico */}
        <div className="flex-1 max-w-md relative">
          <span className={`absolute inset-y-0 left-3 flex items-center text-sm ${
            isSearchDisabled ? 'opacity-40' : 'text-gray-400'
          }`}>
            🔍
          </span>
          <input
            type="text"
            disabled={isSearchDisabled}
            placeholder={
              isSearchDisabled 
                ? 'Ricerca attiva solo in "Explore Catalog"...' 
                : 'Cerca un capo, brand o utente...'
            }
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            className={`w-full bg-[#0b0e17] text-white text-sm rounded-lg pl-9 ${
              searchQuery && !isSearchDisabled ? 'pr-9' : 'pr-4'
            } py-2 border border-[#1f263e] focus:outline-none focus:border-[#6366f1] placeholder-gray-500 transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed disabled:bg-[#070910]`}
          />
          {searchQuery && !isSearchDisabled && (
            <button
              type="button"
              onClick={handleClearSearch}
              title="Azzera ricerca (Esc)"
              className="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-white text-xs font-bold transition"
            >
              ✕
            </button>
          )}
        </div>

        {/* Action Buttons Top Right: 1. Aggiungi Capo -> 2. Nuovo Swap -> 3. Crea Utente */}
        <div className="flex items-center space-x-2.5">
          {/* 1. Aggiungi Capo */}
          <button
            onClick={onOpenAddProduct}
            className="bg-[#4f46e5] hover:bg-[#4338ca] text-white text-xs font-semibold px-3.5 py-2 rounded-lg transition-all duration-200 flex items-center space-x-1.5 shadow-md shadow-indigo-500/20 active:scale-[0.98]"
          >
            <span className="text-white font-bold">+</span>
            <span>Aggiungi Capo</span>
          </button>

          {/* 2. Nuovo Swap */}
          <button
            onClick={onOpenCreateSwap}
            className="bg-[#10b981] hover:bg-[#059669] text-emerald-50 text-xs font-semibold px-3.5 py-2 rounded-lg transition-all duration-200 flex items-center space-x-1.5 shadow-md shadow-emerald-500/20 active:scale-[0.98]"
          >
            <span className="text-emerald-200">⇄</span>
            <span>Nuovo Swap</span>
          </button>

          {/* 3. Crea Utente */}
          <button
            onClick={onOpenCreateUser}
            className="bg-[#3f3f46] hover:bg-[#27272a] text-white text-xs font-semibold px-3.5 py-2 rounded-lg transition-all duration-200 flex items-center space-x-1.5 shadow-md shadow-zinc-500/10 active:scale-[0.98]"
          >
            <span className="text-slate-200 text-sm">👤</span>
            <span>+ Crea Utente</span>
          </button>
        </div>

      </div>
    </header>
  );
}
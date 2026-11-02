import React from 'react';

export default function SwapFilters({
  startDate,
  setStartDate,
  endDate,
  setEndDate,
  productId,
  setProductId,
  products,
  onReset
}) {
  const isFiltered = startDate || endDate || productId;

  return (
    <div className="bg-[#121624] border border-[#1f263e] rounded-xl p-4 flex flex-wrap items-center justify-between gap-4 shadow-lg">
      <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
        <div className="flex flex-col">
          <label className="text-[10px] font-bold uppercase text-gray-400 mb-1">Da Data</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="bg-[#0b0e17] border border-[#1f263e] text-white text-xs rounded-lg px-3 py-2 focus:outline-none focus:border-[#6366f1]"
          />
        </div>

        <div className="flex flex-col">
          <label className="text-[10px] font-bold uppercase text-gray-400 mb-1">A Data</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="bg-[#0b0e17] border border-[#1f263e] text-white text-xs rounded-lg px-3 py-2 focus:outline-none focus:border-[#6366f1]"
          />
        </div>

        <div className="flex flex-col min-w-[200px]">
          <label className="text-[10px] font-bold uppercase text-gray-400 mb-1">Filtra per Capo Contenuto</label>
          <select
            value={productId}
            onChange={(e) => setProductId(e.target.value)}
            className="bg-[#0b0e17] border border-[#1f263e] text-white text-xs rounded-lg px-3 py-2 focus:outline-none focus:border-[#6366f1]"
          >
            <option value="">Tutti i capi</option>
            {products.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} (€{Number(p.price || 0).toFixed(2)})
              </option>
            ))}
          </select>
        </div>
      </div>

      {isFiltered && (
        <button
          onClick={onReset}
          className="px-3 py-2 bg-[#1b2238] hover:bg-[#252f4e] text-gray-300 text-xs font-semibold rounded-lg border border-[#2d3758] transition flex items-center space-x-1"
        >
          <span>↺</span>
          <span>Reset Filtri</span>
        </button>
      )}
    </div>
  );
}
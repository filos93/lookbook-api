export default function StatsOverview({ totalProducts = 0, totalSwaps = 0, totalUsers = 0, totalValue = 0 }) {
  const stats = [
    { label: 'CAPI IN CATALOGO', value: totalProducts, icon: '👕', iconBg: 'bg-indigo-950/60 text-indigo-400' },
    { label: 'ORDINI SWAP', value: totalSwaps, icon: '⇄', iconBg: 'bg-emerald-950/60 text-emerald-400' },
    { label: 'UTENTI ATTIVI', value: totalUsers, icon: '👥', iconBg: 'bg-purple-950/60 text-purple-400' },
    { label: 'VALORE SCAMBIATO', value: `€${Number(totalValue).toFixed(2)}`, icon: '💵', iconBg: 'bg-amber-950/60 text-amber-400' },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {stats.map((item, idx) => (
        <div key={idx} className="bg-[#121624] border border-[#1f263e] rounded-xl p-4 flex items-center space-x-4">
          <div className={`p-3 rounded-lg text-lg ${item.iconBg}`}>
            {item.icon}
          </div>
          <div>
            <p className="text-[10px] font-semibold tracking-wider text-gray-400 uppercase">{item.label}</p>
            <p className="text-2xl font-bold text-white mt-0.5">{item.value}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
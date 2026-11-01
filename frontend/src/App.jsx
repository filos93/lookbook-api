import { useEffect, useState } from 'react';
import Navbar from './components/NavBar';
import StatsOverview from './components/StatsOverview';
import ProductCard from './components/ProductCard';
import SwapRecord from './components/SwapRecord';
import SwapCard from './components/SwapCard';
import AddUserModal from './components/AddUserModal';
import AddProductModal from './components/AddProductModal';
import EditUserModal from './components/EditUserModal';
import EditProductModal from './components/EditProductModal';
import EditSwapModal from './components/EditSwapModal';
import { 
  fetchProducts, 
  fetchSwaps, 
  fetchUsers, 
  createSwap,
  deleteSwap, 
  deleteProduct, 
  deleteUser,
  updateUser,
  updateProduct,
  updateSwap
} from './api/client';

export default function App() {
  const [activeTab, setActiveTab] = useState('catalog');
  const [searchQuery, setSearchQuery] = useState('');
  const [products, setProducts] = useState([]);
  const [swaps, setSwaps] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Creation Modals
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [showSwapBuilder, setShowSwapBuilder] = useState(false);
  const [preselectedProduct, setPreselectedProduct] = useState(null);

  // Editing State
  const [editingUser, setEditingUser] = useState(null);
  const [editingProduct, setEditingProduct] = useState(null);
  const [editingSwap, setEditingSwap] = useState(null);

  // Swap Filters State (Task 2)
  const [startDateFilter, setStartDateFilter] = useState('');
  const [endDateFilter, setEndDateFilter] = useState('');
  const [productFilter, setProductFilter] = useState('');

  // Custom Confirmation Modal State
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    confirmText: 'Elimina',
    onConfirm: null
  });

  const loadAllData = async () => {
    try {
      const [pData, sData, uData] = await Promise.all([
        fetchProducts(),
        fetchSwaps({
          startDate: startDateFilter,
          endDate: endDateFilter,
          productId: productFilter
        }),
        fetchUsers()
      ]);
      setProducts(pData || []);
      setSwaps(sData || []);
      setUsers(uData || []);
    } catch (err) {
      console.error('Errore caricamento dati dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  // Caricamento iniziale
  useEffect(() => {
    loadAllData();
  }, []);

  // Ricarica dinamica degli swap quando cambiano i filtri
  useEffect(() => {
    const loadFilteredSwaps = async () => {
      try {
        const filteredSwaps = await fetchSwaps({
          startDate: startDateFilter,
          endDate: endDateFilter,
          productId: productFilter
        });
        setSwaps(filteredSwaps || []);
      } catch (err) {
        console.error('Errore durante il filtraggio degli swap:', err);
      }
    };

    if (!loading) {
      loadFilteredSwaps();
    }
  }, [startDateFilter, endDateFilter, productFilter]);

  const closeConfirmModal = () => {
    setConfirmModal({ isOpen: false, title: '', message: '', confirmText: 'Elimina', onConfirm: null });
  };

  const handleResetSwapFilters = () => {
    setStartDateFilter('');
    setEndDateFilter('');
    setProductFilter('');
  };

  // Creazione Swap
  const handleCreateSwap = async (swapPayload) => {
    await createSwap(swapPayload);
    await loadAllData();
    setShowSwapBuilder(false);
    setPreselectedProduct(null);
    setActiveTab('swaps');
  };

  // Pre-selezione del prodotto cliccato dalla ProductCard
  const handleStartSwapWithProduct = (product) => {
    setPreselectedProduct(product);
    setShowSwapBuilder(true);
    window.scrollTo({ top: 250, behavior: 'smooth' });
  };

  // Delete Swap con conferma personalizzata
  const promptDeleteSwap = (swapId) => {
    setConfirmModal({
      isOpen: true,
      title: 'Elimina Ordine Swap',
      message: 'Sei sicuro di voler eliminare questo ordine di swap? I capi coinvolti torneranno disponibili.',
      confirmText: 'Annulla Swap',
      onConfirm: async () => {
        try {
          await deleteSwap(swapId);
          setSwaps((prevSwaps) => prevSwaps.filter((s) => s.id !== swapId));
          const updatedProducts = await fetchProducts();
          setProducts(updatedProducts);
        } catch (err) {
          console.error('Errore eliminazione swap:', err.message);
        } finally {
          closeConfirmModal();
        }
      }
    });
  };

  // Delete Product con conferma personalizzata
  const promptDeleteProduct = (product) => {
    setConfirmModal({
      isOpen: true,
      title: 'Elimina Capo',
      message: `Sei sicuro di voler eliminare il capo "${product.name}"? L'azione non può essere annullata.`,
      confirmText: 'Elimina Capo',
      onConfirm: async () => {
        try {
          await deleteProduct(product.id);
          await loadAllData();
        } catch (err) {
          console.error('Errore eliminazione prodotto:', err.message);
        } finally {
          closeConfirmModal();
        }
      }
    });
  };

  // Delete User con conferma personalizzata
  const promptDeleteUser = (user) => {
    setConfirmModal({
      isOpen: true,
      title: 'Elimina Utente',
      message: `Sei sicuro di voler eliminare l'utente "${user.name} ${user.surname}"? Tutti i suoi capi e gli ordini di swap associati verranno rimossi.`,
      confirmText: 'Elimina Utente',
      onConfirm: async () => {
        try {
          await deleteUser(user.id);
          await loadAllData();
        } catch (err) {
          console.error('Errore eliminazione utente:', err.message);
        } finally {
          closeConfirmModal();
        }
      }
    });
  };

  const handleUpdateUser = async (userId, updatedData) => {
    await updateUser(userId, updatedData);
    await loadAllData();
    setEditingUser(null);
  };

  const handleUpdateProduct = async (productId, updatedData) => {
    await updateProduct(productId, updatedData);
    await loadAllData();
    setEditingProduct(null);
  };

  const handleUpdateSwap = async (swapId, updatedData) => {
    await updateSwap(swapId, updatedData);
    await loadAllData();
    setEditingSwap(null);
  };

  const totalSwappedValue = swaps.reduce((acc, swap) => {
    return acc + Number(swap.total_gross_value || 0);
  }, 0);

  const filteredProducts = (products || []).filter((p) => {
    const cleanQuery = searchQuery.trim().toLowerCase().replace(/\s+/g, ' ');
    if (!cleanQuery) return true;

    const name = (p.name || '').toLowerCase();
    const price = String(p.price || '');
    const ownerName = (p.owner_name || '').toLowerCase();
    const ownerEmail = (p.owner_email || '').toLowerCase();

    return (
      name.includes(cleanQuery) ||
      price.includes(cleanQuery) ||
      ownerName.includes(cleanQuery) ||
      ownerEmail.includes(cleanQuery)
    );
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0b0e17] flex items-center justify-center text-gray-400 font-medium">
        Caricamento Swap Studio in corso...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0b0e17] text-gray-200 font-sans">
      <Navbar
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        activeTab={activeTab}
        onOpenAddProduct={() => setIsProductModalOpen(true)}
        onOpenCreateSwap={() => {
          setActiveTab('catalog');
          setPreselectedProduct(null);
          setShowSwapBuilder(true);
        }}
        onOpenCreateUser={() => setIsUserModalOpen(true)}
      />

      <main className="max-w-7xl mx-auto px-6 py-8">
        <StatsOverview
          totalProducts={products.length}
          totalSwaps={swaps.length}
          totalUsers={users.length}
          totalValue={totalSwappedValue}
        />

        {showSwapBuilder && (
          <div className="mb-8 bg-[#121624] border border-[#6366f1] rounded-xl p-6 relative shadow-2xl">
            <button
              onClick={() => {
                setShowSwapBuilder(false);
                setPreselectedProduct(null);
              }}
              className="absolute top-4 right-4 text-gray-400 hover:text-white font-bold transition"
            >
              ✕
            </button>
            <SwapRecord 
              products={products} 
              preselectedProduct={preselectedProduct}
              onCreateSwap={handleCreateSwap} 
            />
          </div>
        )}

        {/* Tab Bar */}
        <div className="flex justify-between items-center border-b border-[#1f263e] pb-4 mb-6">
          <div className="flex space-x-2">
            <button
              onClick={() => setActiveTab('catalog')}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition flex items-center space-x-2 ${
                activeTab === 'catalog'
                  ? 'bg-[#4f46e5] text-white shadow-md shadow-indigo-500/20'
                  : 'text-gray-400 hover:text-white hover:bg-[#121624]'
              }`}
            >
              <span>▦</span>
              <span>Explore Catalog</span>
            </button>

            <button
              onClick={() => setActiveTab('swaps')}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition flex items-center space-x-2 ${
                activeTab === 'swaps'
                  ? 'bg-[#4f46e5] text-white shadow-md shadow-indigo-500/20'
                  : 'text-gray-400 hover:text-white hover:bg-[#121624]'
              }`}
            >
              <span>⇄</span>
              <span>Active Swaps</span>
            </button>

            <button
              onClick={() => setActiveTab('users')}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition flex items-center space-x-2 ${
                activeTab === 'users'
                  ? 'bg-[#4f46e5] text-white shadow-md shadow-indigo-500/20'
                  : 'text-gray-400 hover:text-white hover:bg-[#121624]'
              }`}
            >
              <span>👥</span>
              <span>Users Directory</span>
            </button>
          </div>
        </div>

        {/* Catalogo Capi */}
        {activeTab === 'catalog' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredProducts.map((p) => (
              <ProductCard
                key={p.id}
                product={p}
                onDelete={() => promptDeleteProduct(p)}
                onEdit={(productToEdit) => setEditingProduct(productToEdit)}
                onSwapClick={(product) => handleStartSwapWithProduct(product)}
              />
            ))}
          </div>
        )}

        {/* Ordini Swap & Barra dei Filtri */}
        {activeTab === 'swaps' && (
          <div className="space-y-6">
            {/* Barra dei Filtri per Data e Prodotto */}
            <div className="bg-[#121624] border border-[#1f263e] rounded-xl p-4 flex flex-wrap items-center justify-between gap-4 shadow-lg">
              <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
                {/* Data Inizio */}
                <div className="flex flex-col">
                  <label className="text-[10px] font-bold uppercase text-gray-400 mb-1">Da Data</label>
                  <input
                    type="date"
                    value={startDateFilter}
                    onChange={(e) => setStartDateFilter(e.target.value)}
                    className="bg-[#0b0e17] border border-[#1f263e] text-white text-xs rounded-lg px-3 py-2 focus:outline-none focus:border-[#6366f1]"
                  />
                </div>

                {/* Data Fine */}
                <div className="flex flex-col">
                  <label className="text-[10px] font-bold uppercase text-gray-400 mb-1">A Data</label>
                  <input
                    type="date"
                    value={endDateFilter}
                    onChange={(e) => setEndDateFilter(e.target.value)}
                    className="bg-[#0b0e17] border border-[#1f263e] text-white text-xs rounded-lg px-3 py-2 focus:outline-none focus:border-[#6366f1]"
                  />
                </div>

                {/* Dropdown Prodotto Contenuto */}
                <div className="flex flex-col min-w-[200px]">
                  <label className="text-[10px] font-bold uppercase text-gray-400 mb-1">Filtra per Capo Contenuto</label>
                  <select
                    value={productFilter}
                    onChange={(e) => setProductFilter(e.target.value)}
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

              {/* Pulsante Reset Filtri */}
              {(startDateFilter || endDateFilter || productFilter) && (
                <button
                  onClick={handleResetSwapFilters}
                  className="px-3 py-2 bg-[#1b2238] hover:bg-[#252f4e] text-gray-300 text-xs font-semibold rounded-lg border border-[#2d3758] transition flex items-center space-x-1"
                >
                  <span>↺</span>
                  <span>Reset Filtri</span>
                </button>
              )}
            </div>

            {/* Lista Ordini Swap */}
            <div className="space-y-4">
              {swaps.length === 0 ? (
                <p className="text-gray-500 italic p-4 text-center bg-[#121624] border border-[#1f263e] rounded-xl">
                  Nessun ordine swap corrisponde ai filtri selezionati.
                </p>
              ) : (
                swaps.map((s) => (
                  <SwapCard 
                    key={s.id} 
                    swap={s} 
                    onDelete={() => promptDeleteSwap(s.id)} 
                    onEdit={(swapToEdit) => setEditingSwap(swapToEdit)}
                  />
                ))
              )}
            </div>
          </div>
        )}

        {/* Directory Utenti */}
        {activeTab === 'users' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {users.map((u) => (
              <div 
                key={u.id} 
                className="bg-[#121624] border border-[#1f263e] rounded-xl p-4 flex items-center justify-between gap-3 min-w-0 shadow-lg"
              >
                <div className="flex items-center space-x-3 min-w-0 flex-1">
                  <div className="w-10 h-10 rounded-full bg-[#1b2238] border border-[#2d3758] flex items-center justify-center font-bold text-indigo-400 shrink-0">
                    {u.name?.charAt(0)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-white font-semibold text-sm truncate">{u.name} {u.surname}</p>
                    <p className="text-xs text-gray-400 truncate">{u.email}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-1 shrink-0">
                  <button
                    onClick={() => setEditingUser(u)}
                    className="text-gray-400 hover:text-indigo-400 hover:bg-indigo-950/40 p-1.5 rounded-lg text-sm font-bold transition"
                    title="Modifica Utente"
                  >
                    ✏️
                  </button>
                  <button
                    onClick={() => promptDeleteUser(u)}
                    className="text-red-400 hover:text-red-300 hover:bg-red-950/40 p-1.5 rounded-lg text-sm font-bold transition"
                    title="Elimina Utente"
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Modals per Creazione */}
      <AddUserModal
        isOpen={isUserModalOpen}
        onClose={() => setIsUserModalOpen(false)}
        onUserCreated={() => loadAllData()}
      />

      <AddProductModal
        isOpen={isProductModalOpen}
        onClose={() => setIsProductModalOpen(false)}
        users={users}
        onProductCreated={() => loadAllData()}
      />

      {/* Modals per Modifica */}
      {editingUser && (
        <EditUserModal
          user={editingUser}
          onClose={() => setEditingUser(null)}
          onSave={handleUpdateUser}
        />
      )}

      {editingProduct && (
        <EditProductModal
          product={editingProduct}
          users={users}
          onClose={() => setEditingProduct(null)}
          onSave={handleUpdateProduct}
        />
      )}

      {editingSwap && (
        <EditSwapModal
          isOpen={!!editingSwap}
          swap={editingSwap}
          users={users}
          products={products}
          onClose={() => setEditingSwap(null)}
          onSave={handleUpdateSwap}
        />
      )}

      {/* Modal Personalizzato di Conferma Eliminazione */}
      {confirmModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl bg-[#121624] border border-[#1f263e] p-6 shadow-2xl text-gray-200 animate-in fade-in zoom-in-95 duration-150">
            <h3 className="text-lg font-bold text-white mb-2">{confirmModal.title}</h3>
            <p className="text-sm text-gray-400 mb-6 leading-relaxed">{confirmModal.message}</p>

            <div className="flex justify-end space-x-3">
              <button
                onClick={closeConfirmModal}
                className="px-4 py-2 text-sm font-semibold rounded-lg bg-[#1b2238] text-gray-300 hover:bg-[#252f4e] transition"
              >
                Annulla
              </button>
              <button
                onClick={confirmModal.onConfirm}
                className="px-4 py-2 text-sm font-semibold rounded-lg bg-red-600 text-white hover:bg-red-500 shadow-lg shadow-red-600/30 transition"
              >
                {confirmModal.confirmText}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
import { useEffect, useState } from 'react';
import Navbar from './components/NavBar';
import StatsOverview from './components/StatsOverview';
import ProductCard from './components/ProductCard';
import SwapRecord from './components/SwapRecord';
import SwapCard from './components/SwapCard';
import UserRegisterModal from './components/UserRegisterModal';
import AddProductModal from './components/AddProductModal';
import EditUserModal from './components/EditUserModal';
import EditProductModal from './components/EditProductModal';
import { 
  fetchProducts, 
  fetchSwaps, 
  fetchUsers, 
  createSwap,
  deleteSwap, 
  deleteProduct, 
  deleteUser,
  updateUser,
  updateProduct
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

  // Editing State
  const [editingUser, setEditingUser] = useState(null);
  const [editingProduct, setEditingProduct] = useState(null);

  const loadAllData = async () => {
    try {
      const [pData, sData, uData] = await Promise.all([
        fetchProducts(),
        fetchSwaps(),
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

  useEffect(() => {
    loadAllData();
  }, []);

  // Creazione Swap integrata con client.js (eccezione propagata al banner di SwapRecord)
  const handleCreateSwap = async (swapPayload) => {
    await createSwap(swapPayload);
    await loadAllData();
    setShowSwapBuilder(false);
    setActiveTab('swaps');
  };

  const handleDeleteSwap = async (id) => {
    try {
      await deleteSwap(id);
      await loadAllData();
    } catch (err) {
      console.error('Errore eliminazione swap:', err.message);
    }
  };

  const handleDeleteProduct = async (id) => {
    try {
      await deleteProduct(id);
      await loadAllData();
    } catch (err) {
      console.error('Errore eliminazione prodotto:', err.message);
    }
  };

  const handleDeleteUser = async (id) => {
    try {
      await deleteUser(id);
      await loadAllData();
    } catch (err) {
      console.error('Errore eliminazione utente:', err.message);
    }
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

  // Calcolo dinamico del valore totale usando il valore lordo
  const totalSwappedValue = swaps.reduce((acc, swap) => {
    return acc + Number(swap.total_gross_value || 0);
  }, 0);

  // Filtraggio con sanitizzazione e ricerca flessibile (nome capo, proprietario, email o prezzo)
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
        onOpenCreateUser={() => setIsUserModalOpen(true)}
        onOpenCreateSwap={() => {
          setActiveTab('catalog');
          setShowSwapBuilder(true);
        }}
        onOpenAddProduct={() => setIsProductModalOpen(true)}
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
              onClick={() => setShowSwapBuilder(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white font-bold transition"
            >
              ✕
            </button>
            <SwapRecord products={products} onCreateSwap={handleCreateSwap} />
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
                onDelete={handleDeleteProduct}
                onEdit={(productToEdit) => setEditingProduct(productToEdit)}
                onSwapClick={() => {
                  setShowSwapBuilder(true);
                  window.scrollTo({ top: 250, behavior: 'smooth' });
                }}
              />
            ))}
          </div>
        )}

        {/* Ordini Swap */}
        {activeTab === 'swaps' && (
          <div className="space-y-4">
            {swaps.length === 0 ? (
              <p className="text-gray-500 italic">Nessun ordine swap registrato.</p>
            ) : (
              swaps.map((s) => (
                <SwapCard key={s.id} swap={s} onDelete={handleDeleteSwap} />
              ))
            )}
          </div>
        )}

        {/* Directory Utenti */}
        {activeTab === 'users' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {users.map((u) => (
              <div key={u.id} className="bg-[#121624] border border-[#1f263e] rounded-xl p-4 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full bg-[#1b2238] border border-[#2d3758] flex items-center justify-center font-bold text-indigo-400">
                    {u.name?.charAt(0)}
                  </div>
                  <div>
                    <p className="text-white font-semibold text-sm">{u.name} {u.surname}</p>
                    <p className="text-xs text-gray-400">{u.email}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => setEditingUser(u)}
                    className="text-gray-400 hover:text-indigo-400 hover:bg-indigo-950/40 p-2 rounded-lg text-sm font-bold transition"
                    title="Modifica Utente"
                  >
                    ✏️
                  </button>
                  <button
                    onClick={() => handleDeleteUser(u.id)}
                    className="text-red-400 hover:text-red-300 hover:bg-red-950/40 p-2 rounded-lg text-sm font-bold transition"
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

      {/* Modals for Creation */}
      <UserRegisterModal
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

      {/* Modals for Editing */}
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
    </div>
  );
}
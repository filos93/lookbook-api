import { useState } from 'react';
import Navbar from './components/NavBar';
import StatsOverview from './components/StatsOverview';
import ProductCard from './components/ProductCard';
import SwapRecord from './components/SwapRecord';
import SwapCard from './components/SwapCard';
import UserCard from './components/UserCard';
import SwapFilters from './components/SwapFilters';

import AddUserModal from './components/AddUserModal';
import AddProductModal from './components/AddProductModal';
import EditUserModal from './components/EditUserModal';
import EditProductModal from './components/EditProductModal';
import EditSwapModal from './components/EditSwapModal';
import DeleteUserModal from './components/DeleteUserModal';
import DeleteProductModal from './components/DeleteProductModal';
import DeleteSwapModal from './components/DeleteSwapModal';

import { useAppData } from './hooks/useAppData';

export default function App() {
  const {
    products, swaps, users, loading,
    startDateFilter, setStartDateFilter,
    endDateFilter, setEndDateFilter,
    productFilter, setProductFilter,
    handleResetSwapFilters, handleCreateSwap,
    handleConfirmDeleteSwap, handleConfirmDeleteProduct, handleConfirmDeleteUser,
    handleUpdateUser, handleUpdateProduct, handleUpdateSwap, loadAllData
  } = useAppData();

  const [activeTab, setActiveTab] = useState('catalog');
  const [searchQuery, setSearchQuery] = useState('');
  const [showSwapBuilder, setShowSwapBuilder] = useState(false);
  const [preselectedProduct, setPreselectedProduct] = useState(null);

  // Modals Local State
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [editingProduct, setEditingProduct] = useState(null);
  const [editingSwap, setEditingSwap] = useState(null);
  const [deletingUser, setDeletingUser] = useState(null);
  const [deletingProduct, setDeletingProduct] = useState(null);
  const [deletingSwap, setDeletingSwap] = useState(null);

  const totalSwappedValue = swaps.reduce((acc, s) => acc + Number(s.total_gross_value || 0), 0);

  const filteredProducts = products.filter((p) => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return true;
    return (
      (p.name || '').toLowerCase().includes(q) ||
      String(p.price || '').includes(q) ||
      (p.owner_name || '').toLowerCase().includes(q) ||
      (p.owner_email || '').toLowerCase().includes(q)
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
              onClick={() => { setShowSwapBuilder(false); setPreselectedProduct(null); }}
              className="absolute top-4 right-4 text-gray-400 hover:text-white font-bold transition"
            >
              ✕
            </button>
            <SwapRecord 
              products={products} 
              preselectedProduct={preselectedProduct}
              onCreateSwap={async (payload) => {
                await handleCreateSwap(payload);
                setShowSwapBuilder(false);
                setPreselectedProduct(null);
                setActiveTab('swaps');
              }} 
            />
          </div>
        )}

        {/* Tab Navigation Bar */}
        <div className="flex justify-between items-center border-b border-[#1f263e] pb-4 mb-6">
          <div className="flex space-x-2">
            {['catalog', 'swaps', 'users'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition capitalize ${
                  activeTab === tab
                    ? 'bg-[#4f46e5] text-white shadow-md shadow-indigo-500/20'
                    : 'text-gray-400 hover:text-white hover:bg-[#121624]'
                }`}
              >
                {tab === 'catalog' && '▦ Explore Catalog'}
                {tab === 'swaps' && '⇄ Active Swaps'}
                {tab === 'users' && '👥 Users Directory'}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Catalog */}
        {activeTab === 'catalog' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredProducts.map((p) => (
              <ProductCard
                key={p.id}
                product={p}
                onDelete={() => setDeletingProduct(p)}
                onEdit={setEditingProduct}
                onSwapClick={(prod) => {
                  setPreselectedProduct(prod);
                  setShowSwapBuilder(true);
                  window.scrollTo({ top: 250, behavior: 'smooth' });
                }}
              />
            ))}
          </div>
        )}

        {/* Tab Swaps */}
        {activeTab === 'swaps' && (
          <div className="space-y-6">
            <SwapFilters
              startDate={startDateFilter}
              setStartDate={setStartDateFilter}
              endDate={endDateFilter}
              setEndDate={setEndDateFilter}
              productId={productFilter}
              setProductId={setProductFilter}
              products={products}
              onReset={handleResetSwapFilters}
            />

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
                    onDelete={() => setDeletingSwap(s)} 
                    onEdit={setEditingSwap}
                  />
                ))
              )}
            </div>
          </div>
        )}

        {/* Tab Users */}
        {activeTab === 'users' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {users.map((u) => (
              <UserCard
                key={u.id}
                user={u}
                onEdit={setEditingUser}
                onDelete={setDeletingUser}
              />
            ))}
          </div>
        )}
      </main>

      {/* Modals Creazione */}
      <AddUserModal isOpen={isUserModalOpen} onClose={() => setIsUserModalOpen(false)} onUserCreated={loadAllData} />
      <AddProductModal isOpen={isProductModalOpen} onClose={() => setIsProductModalOpen(false)} users={users} onProductCreated={loadAllData} />

      {/* Modals Modifica */}
      {editingUser && <EditUserModal user={editingUser} onClose={() => setEditingUser(null)} onSave={async (id, data) => { await handleUpdateUser(id, data); setEditingUser(null); }} />}
      {editingProduct && <EditProductModal product={editingProduct} users={users} onClose={() => setEditingProduct(null)} onSave={async (id, data) => { await handleUpdateProduct(id, data); setEditingProduct(null); }} />}
      {editingSwap && <EditSwapModal isOpen={!!editingSwap} swap={editingSwap} users={users} products={products} onClose={() => setEditingSwap(null)} onSave={async (id, data) => { await handleUpdateSwap(id, data); setEditingSwap(null); }} />}

      {/* Modals Eliminazione */}
      <DeleteUserModal user={deletingUser} onClose={() => setDeletingUser(null)} onConfirm={async (u) => { await handleConfirmDeleteUser(u.id); setDeletingUser(null); }} />
      <DeleteProductModal product={deletingProduct} onClose={() => setDeletingProduct(null)} onConfirm={async (p) => { await handleConfirmDeleteProduct(p.id); setDeletingProduct(null); }} />
      <DeleteSwapModal swap={deletingSwap} onClose={() => setDeletingSwap(null)} onConfirm={async (s) => { await handleConfirmDeleteSwap(s.id); setDeletingSwap(null); }} />
    </div>
  );
}
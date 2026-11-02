import { useState, useEffect } from 'react';
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
} from '../api/client';

export function useAppData() {
  const [products, setProducts] = useState([]);
  const [swaps, setSwaps] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [startDateFilter, setStartDateFilter] = useState('');
  const [endDateFilter, setEndDateFilter] = useState('');
  const [productFilter, setProductFilter] = useState('');

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

  useEffect(() => {
    loadAllData();
  }, []);

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

  const handleResetSwapFilters = () => {
    setStartDateFilter('');
    setEndDateFilter('');
    setProductFilter('');
  };

  const handleCreateSwap = async (swapPayload) => {
    await createSwap(swapPayload);
    await loadAllData();
  };

  const handleConfirmDeleteSwap = async (swapId) => {
    await deleteSwap(swapId);
    setSwaps((prev) => prev.filter((s) => s.id !== swapId));
    const updatedProducts = await fetchProducts();
    setProducts(updatedProducts);
  };

  const handleConfirmDeleteProduct = async (productId) => {
    await deleteProduct(productId);
    await loadAllData();
  };

  const handleConfirmDeleteUser = async (userId) => {
    await deleteUser(userId);
    await loadAllData();
  };

  const handleUpdateUser = async (userId, updatedData) => {
    await updateUser(userId, updatedData);
    await loadAllData();
  };

  const handleUpdateProduct = async (productId, updatedData) => {
    await updateProduct(productId, updatedData);
    await loadAllData();
  };

  const handleUpdateSwap = async (swapId, updatedData) => {
    await updateSwap(swapId, updatedData);
    await loadAllData();
  };

  return {
    products,
    swaps,
    users,
    loading,
    startDateFilter,
    setStartDateFilter,
    endDateFilter,
    setEndDateFilter,
    productFilter,
    setProductFilter,
    handleResetSwapFilters,
    handleCreateSwap,
    handleConfirmDeleteSwap,
    handleConfirmDeleteProduct,
    handleConfirmDeleteUser,
    handleUpdateUser,
    handleUpdateProduct,
    handleUpdateSwap,
    loadAllData
  };
}
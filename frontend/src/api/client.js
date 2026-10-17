const API_BASE = '/api';

export const fetchUsers = async () => {
  const res = await fetch(`${API_BASE}/users`);
  if (!res.ok) throw new Error('Errore nel caricamento degli utenti');
  return res.json();
};

export const fetchProducts = async () => {
  const res = await fetch(`${API_BASE}/products`);
  if (!res.ok) throw new Error('Errore nel caricamento dei prodotti');
  return res.json();
};

export const fetchSwaps = async () => {
  const res = await fetch(`${API_BASE}/swaps`);
  if (!res.ok) throw new Error('Errore nel caricamento degli ordini swap');
  return res.json();
};

export const deleteSwap = async (id) => {
  const res = await fetch(`${API_BASE}/swaps/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Errore nella cancellazione dello swap');
  return res.json();
};

export async function deleteProduct(id) {
  const res = await fetch(`/api/products/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Errore durante l\'eliminazione del prodotto');
  return res.json();
}

export async function deleteUser(id) {
  const res = await fetch(`/api/users/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Errore durante l\'eliminazione dell\'utente');
  return res.json();
}
const API_BASE = '/api';

// --- USERS ---
export const fetchUsers = async () => {
  const res = await fetch(`${API_BASE}/users`);
  if (!res.ok) throw new Error('Errore nel caricamento degli utenti');
  return res.json();
};

export async function deleteUser(id) {
  const res = await fetch(`${API_BASE}/users/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Errore durante l\'eliminazione dell\'utente');
  return res.json();
}

export async function updateUser(id, data) {
  const res = await fetch(`${API_BASE}/users/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Errore durante l\'aggiornamento dell\'utente');
  return res.json();
}

// --- PRODUCTS ---
export const fetchProducts = async () => {
  const res = await fetch(`${API_BASE}/products`);
  if (!res.ok) throw new Error('Errore nel caricamento dei prodotti');
  return res.json();
};

export async function deleteProduct(id) {
  const res = await fetch(`${API_BASE}/products/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Errore durante l\'eliminazione del prodotto');
  return res.json();
}

export async function updateProduct(id, data) {
  const res = await fetch(`${API_BASE}/products/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Errore durante l\'aggiornamento del prodotto');
  return res.json();
}

// --- SWAPS ---
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

export const updateSwap = async (id, data) => {
  const res = await fetch(`${API_BASE}/swaps/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Errore durante l\'aggiornamento dello swap');
  return res.json();
};
const API_BASE = '/api';

// Helper generico per gestire la risposta HTTP ed estrarre l'errore del backend
async function handleResponse(res, fallbackErrorMsg) {
  if (!res.ok) {
    let errorData;
    try {
      errorData = await res.json();
    } catch {
      // Se la risposta non è un JSON valido
    }
    // Estrae error, details o message
    const message = errorData?.error 
      ? (errorData.details ? `${errorData.error}: ${errorData.details}` : errorData.error)
      : (errorData?.message || fallbackErrorMsg);
      
    throw new Error(message);
  }
  return res.json();
}

// --- USERS ---
export const fetchUsers = async () => {
  const res = await fetch(`${API_BASE}/users`);
  return handleResponse(res, 'Errore nel caricamento degli utenti');
};

export async function createUser(data) {
  const res = await fetch(`${API_BASE}/users`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return handleResponse(res, "Errore durante la creazione dell'utente");
}

export async function deleteUser(id) {
  const res = await fetch(`${API_BASE}/users/${id}`, { method: 'DELETE' });
  return handleResponse(res, "Errore durante l'eliminazione dell'utente");
}

export async function updateUser(id, data) {
  const res = await fetch(`${API_BASE}/users/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return handleResponse(res, "Errore durante l'aggiornamento dell'utente");
}

// --- PRODUCTS ---
export const fetchProducts = async () => {
  const res = await fetch(`${API_BASE}/products`);
  return handleResponse(res, 'Errore nel caricamento dei prodotti');
};

export async function createProduct(data) {
  const res = await fetch(`${API_BASE}/products`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return handleResponse(res, 'Errore durante la creazione del prodotto');
}

export async function deleteProduct(id) {
  const res = await fetch(`${API_BASE}/products/${id}`, { method: 'DELETE' });
  return handleResponse(res, "Errore durante l'eliminazione del prodotto");
}

export async function updateProduct(id, data) {
  const res = await fetch(`${API_BASE}/products/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return handleResponse(res, "Errore durante l'aggiornamento del prodotto");
}

// --- SWAPS ---
export const fetchSwaps = async () => {
  const res = await fetch(`${API_BASE}/swaps`);
  return handleResponse(res, 'Errore nel caricamento degli ordini swap');
};

export const createSwap = async (data) => {
  const res = await fetch(`${API_BASE}/swaps`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return handleResponse(res, 'Errore durante la creazione dello swap');
};

export const deleteSwap = async (id) => {
  const res = await fetch(`${API_BASE}/swaps/${id}`, { method: 'DELETE' });
  return handleResponse(res, 'Errore nella cancellazione dello swap');
};

export const updateSwap = async (id, data) => {
  const res = await fetch(`${API_BASE}/swaps/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return handleResponse(res, "Errore durante l'aggiornamento dello swap");
};
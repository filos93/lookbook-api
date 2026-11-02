import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, test, expect, vi, beforeEach } from 'vitest';
import App from '../App';
import * as apiClient from '../api/client';

vi.mock('../api/client', () => ({
  fetchUsers: vi.fn(),
  fetchProducts: vi.fn(),
  fetchSwaps: vi.fn(),
  deleteSwap: vi.fn(),
  createSwap: vi.fn(),
}));

describe('Swap Studio - Frontend Integration Tests', () => {
  const mockUsers = [
    { id: 1, name: 'Mario', surname: 'Rossi', email: 'mario@example.com' },
    { id: 2, name: 'Giulia', surname: 'Bianchi', email: 'giulia@example.com' },
  ];

  const mockProducts = [
    { id: 10, name: 'Giacca Vintage', price: '120.00', status: 'swapped', user_id: 1, owner_name: 'Mario Rossi' },
    { id: 12, name: 'T-Shirt Silk', price: '50.00', status: 'available', user_id: 2, owner_name: 'Giulia Bianchi' },
  ];

  const mockSwaps = [
    {
      id: 4,
      created_at: '2026-11-01T10:00:00.000Z',
      total_gross_value: '170.00',
      status: 'Completato',
      users: mockUsers,
      products: mockProducts,
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    apiClient.fetchUsers.mockResolvedValue(mockUsers);
    apiClient.fetchProducts.mockResolvedValue(mockProducts);
    apiClient.fetchSwaps.mockResolvedValue(mockSwaps);
    apiClient.deleteSwap.mockResolvedValue({ success: true });
  });

  // 1. Rendering Active Swaps
  test('Renderizza correttamente l\'ordine nella tab Active Swaps', async () => {
    const user = userEvent.setup();
    render(<App />);

    await waitFor(() => {
      expect(screen.queryByText(/Caricamento Swap Studio/i)).not.toBeInTheDocument();
    });

    const activeSwapsTab = await screen.findByRole('button', { name: /Active Swaps/i });
    await user.click(activeSwapsTab);

    expect(await screen.findByText(/#SWAP-0004/i)).toBeInTheDocument();
    
    const priceElements = screen.getAllByText(/170\.00/i);
    expect(priceElements.length).toBeGreaterThan(0);
  });

  // 2. Cancellazione Ordine via DeleteSwapModal
  test('Apre DeleteSwapModal ed esegue la cancellazione dell\'ordine', async () => {
    const user = userEvent.setup();
    render(<App />);

    await waitFor(() => {
      expect(screen.queryByText(/Caricamento Swap Studio/i)).not.toBeInTheDocument();
    });

    const activeSwapsTab = await screen.findByRole('button', { name: /Active Swaps/i });
    await user.click(activeSwapsTab);

    const deleteBtn = await screen.findByRole('button', { name: /Cancella/i });
    await user.click(deleteBtn);

    expect(await screen.findByText(/Elimina Ordine Swap/i)).toBeInTheDocument();

    const confirmDeleteBtn = screen.getByRole('button', { name: /Annulla Swap|Conferma/i });
    await user.click(confirmDeleteBtn);

    await waitFor(() => {
      expect(apiClient.deleteSwap).toHaveBeenCalledWith(4);
    });
  });

  // 3. Validazione selezione articoli 'swapped'
  test('Impedisce la selezione di un capo "swapped" nel builder', async () => {
    const user = userEvent.setup();
    render(<App />);

    await waitFor(() => {
      expect(screen.queryByText(/Caricamento Swap Studio/i)).not.toBeInTheDocument();
    });

    const newSwapBtn = screen.getByRole('button', { name: /Nuovo Swap/i });
    await user.click(newSwapBtn);

    // Usa findAllByText per catturare tutte le istanze del capo presente nel DOM
    const swappedItems = await screen.findAllByText('Giacca Vintage');
    expect(swappedItems.length).toBeGreaterThan(0);

    const swappedItemCard = swappedItems[0].closest('div');
    if (swappedItemCard) {
      await user.click(swappedItemCard);
    }

    const submitBtn = screen.getByRole('button', { name: /Conferma Ordine Swap/i });
    expect(submitBtn).toBeDisabled();
  });
});
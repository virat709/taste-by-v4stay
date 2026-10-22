import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import MenuView from '../MenuView';

// ── Mock Firestore used by MenuView ───────────────────────────────────────────
const addedOrders = [];
let categorySnap = null;
const itemSnaps = {};        // categoryId → docs

vi.mock('firebase/firestore', () => ({
  getDoc: vi.fn(async () => ({
    exists: () => !!categorySnap.restaurant,
    data: () => categorySnap.restaurant,
  })),
  onSnapshot: vi.fn((_q, cb) => {
    // Route by the mocked collection path: categories list vs items list.
    // Item snapshots fire asynchronously like real Firestore listener pushes —
    // the component's effect finishes subscribing (categories replace-update)
    // before item data arrives, exactly as in production.
    const p = String(_q.path || '');
    if (p.endsWith('/categories')) cb(categorySnap.docSnap);
    else {
      const m = p.match(/categories\/([^/]+)\/items$/);
      if (m) setTimeout(() => cb(itemSnaps[m[1]]), 0);
    }
    return () => {};
  }),
  addDoc: vi.fn(async (_col, payload) => {
    addedOrders.push(payload);
    return { id: 'new_order' };
  }),
  doc: vi.fn((...parts) => ({ path: parts.filter(Boolean).join('/') })),
  collection: vi.fn((...parts) => ({ path: parts.filter(Boolean).join('/') })),
  query: vi.fn((coll) => coll),
  orderBy: vi.fn(),
  serverTimestamp: vi.fn(() => ({ serverStamp: true })),
}));

vi.mock('../../../lib/firebase', () => ({ db: {} }));
vi.mock('../../../lib/razorpay', () => ({
  initializeRazorpayPayment: vi.fn(),
  DEFAULT_RAZORPAY_KEY: 'rzp_test_mock',
}));

const renderAtTable = () => render(
  <MemoryRouter initialEntries={['/menu/rest_1/5']}>
    <Routes>
      <Route path="/menu/:restaurantId/:tableNumber" element={<MenuView />} />
    </Routes>
  </MemoryRouter>
);

const snapshotDocs = (items) => ({
  docs: items.map(i => ({ id: i.id, data: () => i })),
});

beforeEach(() => {
  vi.clearAllMocks();
  addedOrders.length = 0;
  categorySnap = {
    restaurant: { name: 'Spice Garden', currency: '₹', taxRate: 10, plan: 'paid' },
    docSnap: { docs: [{ id: 'cat1', data: () => ({ name: 'Mains' }) }] },
  };
  itemSnaps.cat1 = snapshotDocs([
    { id: 'i1', name: 'Butter Chicken', price: 320, isVeg: false },
    {
      id: 'i2', name: 'Pasta', price: 250, isVeg: true,
      options: [
        { groupName: 'Portion', type: 'single', required: true, options: [{ name: 'Half', price: -30 }, { name: 'Full', price: 0 }] },
        { groupName: 'Extras', type: 'multi', required: false, options: [{ name: 'Cheese', price: 40 }] },
      ],
    },
  ]);
});

const flushMenu = async () => {
  await waitFor(() => expect(screen.getByText('Butter Chicken')).toBeInTheDocument());
  await waitFor(() => expect(screen.getByText('Pasta')).toBeInTheDocument());
};

describe('MenuView — guest ordering (frontend ↔ Firestore integration)', () => {
  it('shows the not-found screen when the restaurant does not exist', async () => {
    categorySnap.restaurant = null;
    renderAtTable();
    expect(await screen.findByText('Restaurant Not Found')).toBeInTheDocument();
  });

  it('renders restaurant name, table number and menu items', async () => {
    renderAtTable();
    await flushMenu();
    expect(screen.getByText('Spice Garden')).toBeInTheDocument();
    expect(screen.getByText(/table 5/i)).toBeInTheDocument();
  });

  it('add → remove: the quantity stepper works off the real cart lib', async () => {
    renderAtTable();
    await flushMenu();
    const addButtons = screen.getAllByText('ADD');
    fireEvent.click(addButtons[0]);                       // Butter Chicken
    await waitFor(() => expect(screen.getByText(/view order cart/i)).toBeInTheDocument());
    // 320 × 1 @ 10% tax = 352.00 shown in the sticky cart bar
    expect(screen.getByText(/352\.00/)).toBeInTheDocument();
  });

  it('required-modifier items open the customize modal and cannot be added without a choice', async () => {
    renderAtTable();
    await flushMenu();
    fireEvent.click(screen.getAllByText('ADD')[1]);       // Pasta (has required Portion)
    await waitFor(() => expect(screen.getByText(/customize pasta/i)).toBeInTheDocument());
    // Try adding with no selection → blocked with an error toast
    fireEvent.click(screen.getByText(/add to cart/i));
    expect(await screen.findByText(/choose an option/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /add to cart/i })).toBeInTheDocument();
  });

  it('selects a required portion and adds with the modifier priced into the line', async () => {
    renderAtTable();
    await flushMenu();
    fireEvent.click(screen.getAllByText('ADD')[1]);
    await waitFor(() => screen.getByText(/customize pasta/i));
    const buttons = screen.getAllByRole('button');
    const full = buttons.find(b => b.textContent.includes('Full'));
    fireEvent.click(full);
    fireEvent.click(screen.getByText(/add to cart/i));
    await waitFor(() => expect(screen.queryByText(/customize pasta/i)).not.toBeInTheDocument());
    // Cart shows the Pasta line at 250 (Full) + tax later
    await waitFor(() => expect(screen.getByText(/view order cart/i)).toBeInTheDocument());
  });

  it('places a cash order with the exact Firestore document shape', async () => {
    renderAtTable();
    await flushMenu();
    fireEvent.click(screen.getAllByText('ADD')[0]);       // 1x Butter Chicken @ 320
    await waitFor(() => screen.getByText(/view order cart/i));
    fireEvent.click(screen.getByText(/view order cart/i));
    await waitFor(() => screen.getByPlaceholderText(/extra spicy/i));
    fireEvent.change(screen.getByPlaceholderText(/extra spicy/i), { target: { value: '  no onions ' } });
    act(() => {
      fireEvent.click(screen.getByText(/pay cash \/ pay at table/i));
    });
    await waitFor(() => expect(addedOrders).toHaveLength(1));
    const doc = addedOrders[0];
    expect(doc).toMatchObject({
      tableNumber: '5',
      status: 'pending',
      paymentMethod: 'Cash',
      instructions: 'no onions',
      subtotal: 320,
      taxAmount: 32,     // taxRate 10
      total: 352,
      items: [{ id: 'i1', name: 'Butter Chicken', price: 320, qty: 1, modifiers: [], basePrice: 320 }],
    });
    expect(doc.createdAt.serverStamp).toBe(true);
    // Cart resets after the order goes through
    expect(screen.queryByText(/view order cart/i)).not.toBeInTheDocument();
  });

  it('shows the free-plan ordering block instead of payment buttons', async () => {
    categorySnap.restaurant = { ...categorySnap.restaurant, plan: 'free' };
    renderAtTable();
    await flushMenu();
    fireEvent.click(screen.getAllByText('ADD')[0]);
    await waitFor(() => screen.getByText(/view order cart/i));
    fireEvent.click(screen.getByText(/view order cart/i));
    await waitFor(() => expect(screen.getByText('Ordering Unavailable')).toBeInTheDocument());
    expect(screen.queryByText(/pay cash/i)).not.toBeInTheDocument();
    // and there must be no way to sneak an order through
    fireEvent.click(screen.getByText(/ordering unavailable/i));
    expect(addedOrders).toHaveLength(0);
  });

  it('keeps the order if addDoc fails, and surfaces an error toast', async () => {
    const { addDoc } = await import('firebase/firestore');
    addDoc.mockImplementationOnce(async () => { throw Object.assign(new Error('boom'), { code: 'permission-denied' }); });
    renderAtTable();
    await flushMenu();
    fireEvent.click(screen.getAllByText('ADD')[0]);
    await waitFor(() => screen.getByText(/view order cart/i));
    fireEvent.click(screen.getByText(/view order cart/i));
    await waitFor(() => screen.getByPlaceholderText(/extra spicy/i));
    act(() => {
      fireEvent.click(screen.getByText(/pay cash \/ pay at table/i));
    });
    expect(await screen.findByText(/failed to place order/i)).toBeInTheDocument();
    // Cart is intact so the guest can retry
    expect(screen.getByText('Your Table Order')).toBeInTheDocument();
  });
});

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import StaffLogin from '../StaffLogin';

// ── Mock the Firestore layer used by StaffLogin ──────────────────────────────
// restaurant doc:   getDoc → data() has { name, staffPin }
// staff collection: getDocs  → list of waiters { id, name, pin }
let restaurantDoc = null;
let waiters = [];
let getDocsError = null;

vi.mock('firebase/firestore', () => ({
  getDoc: vi.fn(async () => ({
    exists: () => !!restaurantDoc,
    data: () => restaurantDoc,
  })),
  getDocs: vi.fn(async () => {
    if (getDocsError) throw getDocsError;
    return {
      docs: waiters.map(w => ({ id: w.id, data: () => w })),
      empty: waiters.length === 0,
    };
  }),
  doc: vi.fn((...parts) => ({ path: parts.filter(Boolean).join('/') })),
  collection: vi.fn((...parts) => ({ path: parts.filter(Boolean).join('/') })),
}));

vi.mock('../../../lib/firebase', () => ({ db: {} }));

const setup = (url = '/staff') => render(
  <MemoryRouter initialEntries={[url]}>
    <Routes>
      <Route path="/staff" element={<StaffLogin />} />
      <Route path="/staff/:restaurantId" element={<StaffLogin />} />
      <Route path="/staff/dashboard" element={<div>Dashboard Screen</div>} />
    </Routes>
  </MemoryRouter>
);

const defaults = () => {
  restaurantDoc = { name: 'Spice Garden', staffPin: '8888' };
  waiters = [
    { id: 'w1', name: 'Riya', pin: '1234' },
    { id: 'w2', name: 'Amit', pin: '5678' },
  ];
};

const step1 = async () => {
  fireEvent.change(screen.getByPlaceholderText('e.g. abcd1234efgh'), { target: { value: 'rest_1' } });
  fireEvent.change(screen.getByPlaceholderText('••••'), { target: { value: '8888' } });
  fireEvent.submit(screen.getByText('Next').closest('form'));
};

describe('StaffLogin — legacy /staff flow (restaurant + waiter)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    getDocsError = null;
    defaults();
  });

  it('validates the restaurant staff PIN, then shows the waiter list', async () => {
    setup();
    await step1();
    await waitFor(() => expect(screen.getByText('Riya')).toBeInTheDocument());
    expect(screen.getByText('Amit')).toBeInTheDocument();
    expect(screen.getByText(/who is on duty/i)).toBeInTheDocument();
  });

  it('rejects a wrong restaurant PIN and does not list waiters', async () => {
    setup();
    fireEvent.change(screen.getByPlaceholderText('e.g. abcd1234efgh'), { target: { value: 'rest_1' } });
    fireEvent.change(screen.getByPlaceholderText('••••'), { target: { value: '0000' } });
    fireEvent.submit(screen.getByText('Next').closest('form'));
    expect(await screen.findByText('Incorrect PIN.')).toBeInTheDocument();
    expect(screen.queryByText('Riya')).not.toBeInTheDocument();
  });

  it('surfaces "restaurant not found"', async () => {
    restaurantDoc = null;
    setup();
    await step1();
    expect(await screen.findByText('Restaurant not found. Please check the ID.')).toBeInTheDocument();
  });

  it('surfaces an unconfigured staff access (no staffPin)', async () => {
    delete restaurantDoc.staffPin;
    setup();
    await step1();
    expect(await screen.findByText('Staff access is not configured for this restaurant.')).toBeInTheDocument();
  });

  it('full happy path: correct waiter PIN stores the exact session and routes to the dashboard', async () => {
    setup();
    await step1();
    await waitFor(() => expect(screen.getByRole('combobox')).toBeInTheDocument());
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'w1' } });
    fireEvent.change(screen.getByPlaceholderText('••••'), { target: { value: '1234' } });
    fireEvent.submit(screen.getByText('Clock In 🤝').closest('form'));
    await waitFor(() => expect(screen.getByText('Dashboard Screen')).toBeInTheDocument());
    expect(JSON.parse(localStorage.getItem('staffSession'))).toEqual({
      restaurantId: 'rest_1',
      staffName: 'Riya',
      restaurantName: 'Spice Garden',
      staffId: 'w1',
    });
  });

  it('wrong waiter personal PIN is rejected with no session stored', async () => {
    setup();
    await step1();
    await waitFor(() => expect(screen.getByRole('combobox')).toBeInTheDocument());
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'w2' } });
    fireEvent.change(screen.getByPlaceholderText('••••'), { target: { value: '9999' } });
    fireEvent.submit(screen.getByText('Clock In 🤝').closest('form'));
    expect(await screen.findByText('Incorrect personal PIN.')).toBeInTheDocument();
    expect(localStorage.getItem('staffSession')).toBeNull();
  });

  it('Firestore failure shows a generic error instead of crashing', async () => {
    getDocsError = Object.assign(new Error('denied'), { code: 'permission-denied' });
    setup();
    await step1();
    await waitFor(() => expect(screen.getByText(/access blocked/i)).toBeInTheDocument());
    expect(screen.queryByText('Riya')).not.toBeInTheDocument();
  });
});

describe('StaffLogin — portal link mode (/staff/:restaurantId)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    getDocsError = null;
    defaults();
  });

  it('preloads restaurant name and waiter list, skipping step 1', async () => {
    setup('/staff/rest_1');
    await waitFor(() => expect(screen.getByText('Spice Garden')).toBeInTheDocument());
    await waitFor(() => expect(screen.getByText('Riya')).toBeInTheDocument());
    expect(screen.queryByText(/restaurant credentials/i)).not.toBeInTheDocument();
  });

  it('shows a clear message when no waiters exist yet', async () => {
    waiters = [];
    setup('/staff/rest_1');
    await waitFor(() => expect(screen.getByText('No waiters have been added yet. Ask the manager to add waiters in DinePulse Admin → Waiters.')).toBeInTheDocument());
  });

  it('shows a clear message for an invalid portal link', async () => {
    restaurantDoc = null;
    setup('/staff/ghost_id');
    await waitFor(() => expect(screen.getByText('This restaurant link is invalid or the restaurant no longer exists.')).toBeInTheDocument());
  });

  it('marks the staffSession as consumed on successful portal login', async () => {
    setup('/staff/rest_1');
    await waitFor(() => expect(screen.getByText('Riya')).toBeInTheDocument());
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'w2' } });
    fireEvent.change(screen.getByPlaceholderText('••••'), { target: { value: '5678' } });
    fireEvent.submit(screen.getByText('Clock In 🤝').closest('form'));
    await waitFor(() => expect(screen.getByText('Dashboard Screen')).toBeInTheDocument());
    expect(JSON.parse(localStorage.getItem('staffSession'))).toEqual({
      restaurantId: 'rest_1',
      staffName: 'Amit',
      restaurantName: 'Spice Garden',
      staffId: 'w2',
    });
  });
});

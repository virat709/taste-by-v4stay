import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AuthProvider, useAuth } from '../AuthContext';

// Mock Firebase auth
vi.mock('firebase/auth', () => ({
  onAuthStateChanged: (auth, callback) => {
    callback({ uid: 'user123', email: 'test@restaurant.com' });
    return () => {};
  },
  signInWithEmailAndPassword: vi.fn(),
  createUserWithEmailAndPassword: vi.fn(),
  signOut: vi.fn(),
  sendPasswordResetEmail: vi.fn(),
  signInWithPopup: vi.fn(),
  GoogleAuthProvider: vi.fn(),
}));

vi.mock('../../lib/firebase', () => ({
  auth: {},
}));

function ConsumerComponent() {
  const { user } = useAuth();
  return <div>Logged in as: {user?.email}</div>;
}

describe('AuthContext', () => {
  it('provides authenticated user object to consumer component', async () => {
    render(
      <AuthProvider>
        <ConsumerComponent />
      </AuthProvider>
    );

    expect(await screen.findByText('Logged in as: test@restaurant.com')).toBeInTheDocument();
  });
});

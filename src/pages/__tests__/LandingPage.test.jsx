import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import LandingPage from '../LandingPage';

describe('LandingPage Component', () => {
  it('renders headline, feature sections, and pricing', () => {
    render(
      <HelmetProvider>
        <BrowserRouter>
          <LandingPage />
        </BrowserRouter>
      </HelmetProvider>
    );

    expect(screen.getAllByText('DinePulse')[0]).toBeInTheDocument();
    expect(screen.getByText(/Restaurant Automation &+ QR Menus/i)).toBeInTheDocument();
    expect(screen.getByText(/Calculate Your Revenue Growth/i)).toBeInTheDocument();
    expect(screen.getByText(/Frequently Asked Questions/i)).toBeInTheDocument();
  });
});

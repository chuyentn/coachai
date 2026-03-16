import { render, screen, fireEvent } from '@testing-library/react';
import { Pricing } from './Pricing';
import { useAuth } from '../hooks/useAuth';
import { MemoryRouter, useNavigate } from 'react-router-dom';
import { vi, describe, it, expect, beforeEach } from 'vitest';

// Mock useAuth hook
vi.mock('../hooks/useAuth', () => ({
  useAuth: vi.fn()
}));

// Mock react-router-dom hooks
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: vi.fn()
  };
});

describe('Pricing Navigation Logic', () => {
  const mockNavigate = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (useNavigate as any).mockReturnValue(mockNavigate);
  });

  it('shows signup link for guest users on VIP plan', async () => {
    (useAuth as any).mockReturnValue({
      profile: null,
      loading: false
    });

    render(
      <MemoryRouter>
        <Pricing />
      </MemoryRouter>
    );

    const vipLink = screen.getByText('pricing.btnBuyNow').closest('a');
    expect(vipLink).toHaveAttribute('href', '/auth/signup?plan=vip');
  });

  it('shows payment link for logged-in users on VIP plan', async () => {
    (useAuth as any).mockReturnValue({
      profile: { id: 'user123' },
      loading: false
    });

    render(
      <MemoryRouter>
        <Pricing />
      </MemoryRouter>
    );

    const vipLink = screen.getByText('pricing.btnBuyNow').closest('a');
    expect(vipLink).toHaveAttribute('href', '/payment?plan=vip');
  });
});

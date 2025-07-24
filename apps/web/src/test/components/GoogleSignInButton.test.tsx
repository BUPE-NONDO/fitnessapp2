import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { GoogleSignInButton } from '@/components/GoogleSignInButton';

// Mock Firebase Auth
vi.mock('firebase/auth', () => ({
  GoogleAuthProvider: vi.fn(() => ({
    addScope: vi.fn(),
    setCustomParameters: vi.fn(),
  })),
  signInWithPopup: vi.fn(),
  linkWithPopup: vi.fn(),
}));

vi.mock('@/lib/firebase', () => ({
  auth: {
    currentUser: null,
  },
}));

describe('GoogleSignInButton', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders with default sign in text', () => {
    render(<GoogleSignInButton />);
    
    expect(screen.getByText('Sign in with Google')).toBeInTheDocument();
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('renders with sign up text when mode is signup', () => {
    render(<GoogleSignInButton mode="signup" />);
    
    expect(screen.getByText('Sign up with Google')).toBeInTheDocument();
  });

  it('renders with link text when mode is link', () => {
    render(<GoogleSignInButton mode="link" />);
    
    expect(screen.getByText('Link Google Account')).toBeInTheDocument();
  });

  it('shows loading state when clicked', async () => {
    const { signInWithPopup } = await import('firebase/auth');
    vi.mocked(signInWithPopup).mockImplementation(() => new Promise(() => {})); // Never resolves
    
    render(<GoogleSignInButton />);
    
    const button = screen.getByRole('button');
    fireEvent.click(button);
    
    await waitFor(() => {
      expect(screen.getByText('Signing in...')).toBeInTheDocument();
    });
  });

  it('is disabled when disabled prop is true', () => {
    render(<GoogleSignInButton disabled />);
    
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
  });

  it('calls onSuccess when authentication succeeds', async () => {
    const { signInWithPopup } = await import('firebase/auth');
    const mockUser = { uid: 'test-uid', email: 'test@example.com' };
    vi.mocked(signInWithPopup).mockResolvedValue({
      user: mockUser,
      credential: null,
      operationType: 'signIn',
      providerId: 'google.com',
    } as any);
    
    const onSuccess = vi.fn();
    render(<GoogleSignInButton onSuccess={onSuccess} />);
    
    const button = screen.getByRole('button');
    fireEvent.click(button);
    
    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalled();
    });
  });

  it('calls onError when authentication fails', async () => {
    const { signInWithPopup } = await import('firebase/auth');
    const error = new Error('Authentication failed');
    error.code = 'auth/popup-closed-by-user';
    vi.mocked(signInWithPopup).mockRejectedValue(error);
    
    const onError = vi.fn();
    render(<GoogleSignInButton onError={onError} />);
    
    const button = screen.getByRole('button');
    fireEvent.click(button);
    
    await waitFor(() => {
      expect(onError).toHaveBeenCalledWith('Authentication was cancelled by the user.');
    });
  });

  it('applies custom className', () => {
    render(<GoogleSignInButton className="custom-class" />);
    
    const button = screen.getByRole('button');
    expect(button).toHaveClass('custom-class');
  });

  it('has proper accessibility attributes', () => {
    render(<GoogleSignInButton />);
    
    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('type', 'button');
  });
});

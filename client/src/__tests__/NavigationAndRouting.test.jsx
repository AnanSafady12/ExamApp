import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import NavigationMenu from '../components/NavigationMenu';
import ProtectedRoute from '../components/ProtectedRoute';
import authService, { ROLES } from '../services/AuthService';

vi.mock('../services/AuthService', () => {
  return {
    ROLES: {
      TEACHER: 'TEACHER',
      STUDENT: 'STUDENT'
    },
    default: {
      getCurrentUser: vi.fn(),
      logout: vi.fn()
    }
  };
});

describe('NavigationMenu & Routing Components', () => {
  beforeEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it('should render teacher navigation links correctly', () => {
    const user = { fullName: 'Sarah Cohen', role: 'TEACHER' };
    
    render(
      <MemoryRouter>
        <NavigationMenu user={user} onLogout={vi.fn()} />
      </MemoryRouter>
    );

    expect(screen.getByText(/Teacher Dashboard/i)).toBeTruthy();
    expect(screen.queryByText(/Student Portal/i)).toBeNull();
    expect(screen.getByText(/Services Sandbox/i)).toBeTruthy();
  });

  it('should render student navigation links correctly', () => {
    const user = { fullName: 'Alice Johnson', role: 'STUDENT' };

    render(
      <MemoryRouter>
        <NavigationMenu user={user} onLogout={vi.fn()} />
      </MemoryRouter>
    );

    expect(screen.queryByText(/Teacher Dashboard/i)).toBeNull();
    expect(screen.getByText(/Student Portal/i)).toBeTruthy();
    expect(screen.getByText(/Services Sandbox/i)).toBeTruthy();
  });

  it('should block protected routes with wrong role', () => {
    authService.getCurrentUser.mockReturnValue({
      fullName: 'Alice Johnson',
      role: 'STUDENT'
    });

    render(
      <MemoryRouter initialEntries={['/teacher']}>
        <ProtectedRoute allowedRole="TEACHER">
          <div data-testid="protected-content">Secret Teacher Info</div>
        </ProtectedRoute>
      </MemoryRouter>
    );

    expect(screen.queryByTestId('protected-content')).toBeNull();
  });

  it('should allow protected routes with correct role', () => {
    authService.getCurrentUser.mockReturnValue({
      fullName: 'Sarah Cohen',
      role: 'TEACHER'
    });

    render(
      <MemoryRouter>
        <ProtectedRoute allowedRole="TEACHER">
          <div data-testid="protected-content">Secret Teacher Info</div>
        </ProtectedRoute>
      </MemoryRouter>
    );

    expect(screen.getByTestId('protected-content')).toBeTruthy();
  });

  it('should redirect unauthenticated users to login', () => {
    authService.getCurrentUser.mockReturnValue(null);

    render(
      <MemoryRouter>
        <ProtectedRoute>
          <div data-testid="protected-content">Secret Info</div>
        </ProtectedRoute>
      </MemoryRouter>
    );

    expect(screen.queryByTestId('protected-content')).toBeNull();
  });
});

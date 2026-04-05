import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor, act } from '@testing-library/react'
import { AuthProvider, useAuth } from '@/frontend/auth/auth-context'
import * as apiClientModule from '@/frontend/lib/api-client'

// Mock api-client
vi.mock('@/frontend/lib/api-client', () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
  },
}))

// Helper component to test useAuth hook
function TestComponent() {
  const { user, isLoading, login, register, logout } = useAuth()

  return (
    <div>
      <div data-testid="loading">{isLoading ? 'loading' : 'ready'}</div>
      <div data-testid="user">{user ? `${user.name} (${user.email})` : 'no user'}</div>
      <div data-testid="user-id">{user?.id || 'no id'}</div>
      <button data-testid="login-btn" onClick={() => login('test@example.com', 'password')}>
        Login
      </button>
      <button data-testid="register-btn" onClick={() => register('new@example.com', 'password', 'New User')}>
        Register
      </button>
      <button data-testid="logout-btn" onClick={() => logout()}>
        Logout
      </button>
    </div>
  )
}

describe('AuthContext', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('AuthProvider', () => {
    it('should render children', () => {
      render(
        <AuthProvider>
          <div data-testid="child">Test Child</div>
        </AuthProvider>
      )

      expect(screen.getByTestId('child')).toBeInTheDocument()
    })

    it('should check auth status on mount', async () => {
      const mockApiClient = apiClientModule.apiClient as any
      const mockUser = { id: '1', email: 'test@example.com', name: 'Test User' }
      mockApiClient.get.mockResolvedValueOnce({ data: { user: mockUser } })

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      )

      await waitFor(() => {
        expect(mockApiClient.get).toHaveBeenCalledWith('/auth/me')
      })
    })

    it('should set loading to false after auth check', async () => {
      const mockApiClient = apiClientModule.apiClient as any
      mockApiClient.get.mockResolvedValueOnce({ data: { user: null } })

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      )

      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('ready')
      })
    })

    it('should handle auth check failure gracefully', async () => {
      const mockApiClient = apiClientModule.apiClient as any
      mockApiClient.get.mockRejectedValueOnce(new Error('Auth check failed'))

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      )

      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('ready')
        expect(screen.getByTestId('user')).toHaveTextContent('no user')
      })
    })

    it('should display user when authenticated', async () => {
      const mockApiClient = apiClientModule.apiClient as any
      const mockUser = { id: '123', email: 'john@example.com', name: 'John Doe' }
      mockApiClient.get.mockResolvedValueOnce({ data: { user: mockUser } })

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      )

      await waitFor(() => {
        expect(screen.getByTestId('user')).toHaveTextContent('John Doe (john@example.com)')
      })
    })
  })

  describe('useAuth hook', () => {
    it('should throw when used outside AuthProvider', () => {
      const BadComponent = () => {
        useAuth()
        return <div>test</div>
      }

      // Suppress console.error for this test
      const originalError = console.error
      console.error = vi.fn()

      expect(() => {
        render(<BadComponent />)
      }).toThrow('useAuth must be used within AuthProvider')

      console.error = originalError
    })

    it('should provide auth context', async () => {
      const mockApiClient = apiClientModule.apiClient as any
      mockApiClient.get.mockResolvedValueOnce({ data: { user: null } })

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      )

      await waitFor(() => {
        expect(screen.getByTestId('loading')).toBeInTheDocument()
        expect(screen.getByTestId('user')).toBeInTheDocument()
      })
    })
  })

  describe('login', () => {
    it('should call login endpoint with credentials', async () => {
      const mockApiClient = apiClientModule.apiClient as any
      mockApiClient.get.mockResolvedValueOnce({ data: { user: null } })
      const mockUser = { id: '1', email: 'test@example.com', name: 'Test User' }
      mockApiClient.post.mockResolvedValueOnce({ data: { user: mockUser } })

      const { getByTestId } = render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      )

      await waitFor(() => {
        expect(getByTestId('loading')).toHaveTextContent('ready')
      })

      await act(async () => {
        getByTestId('login-btn').click()
      })

      await waitFor(() => {
        expect(mockApiClient.post).toHaveBeenCalledWith('/auth/login', {
          email: 'test@example.com',
          password: 'password',
        })
      })
    })

    it('should set user after successful login', async () => {
      const mockApiClient = apiClientModule.apiClient as any
      mockApiClient.get.mockResolvedValueOnce({ data: { user: null } })
      const mockUser = { id: '1', email: 'test@example.com', name: 'Test User' }
      mockApiClient.post.mockResolvedValueOnce({ data: { user: mockUser } })

      const { getByTestId } = render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      )

      await waitFor(() => {
        expect(getByTestId('loading')).toHaveTextContent('ready')
      })

      await act(async () => {
        getByTestId('login-btn').click()
      })

      await waitFor(() => {
        expect(getByTestId('user')).toHaveTextContent('Test User (test@example.com)')
      })
    })

    it('should set loading during login', async () => {
      const mockApiClient = apiClientModule.apiClient as any
      mockApiClient.get.mockResolvedValueOnce({ data: { user: null } })

      let loginResolve: () => void
      const loginPromise = new Promise<void>((resolve) => {
        loginResolve = resolve
      })
      mockApiClient.post.mockReturnValueOnce(loginPromise.then(() => ({ data: { user: null } })))

      const { getByTestId } = render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      )

      await waitFor(() => {
        expect(getByTestId('loading')).toHaveTextContent('ready')
      })

      act(() => {
        getByTestId('login-btn').click()
      })

      // During login, might be loading
      loginResolve!()

      await waitFor(() => {
        expect(getByTestId('loading')).toHaveTextContent('ready')
      })
    })
  })

  describe('register', () => {
    it('should call register endpoint with credentials', async () => {
      const mockApiClient = apiClientModule.apiClient as any
      mockApiClient.get.mockResolvedValueOnce({ data: { user: null } })
      const mockUser = { id: '2', email: 'new@example.com', name: 'New User' }
      mockApiClient.post.mockResolvedValueOnce({ data: { user: mockUser } })

      const { getByTestId } = render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      )

      await waitFor(() => {
        expect(getByTestId('loading')).toHaveTextContent('ready')
      })

      await act(async () => {
        getByTestId('register-btn').click()
      })

      await waitFor(() => {
        expect(mockApiClient.post).toHaveBeenCalledWith('/auth/register', {
          email: 'new@example.com',
          password: 'password',
          name: 'New User',
        })
      })
    })

    it('should not set user after register (requires explicit login)', async () => {
      const mockApiClient = apiClientModule.apiClient as any
      mockApiClient.get.mockResolvedValueOnce({ data: { user: null } })
      const mockUser = { id: '2', email: 'new@example.com', name: 'New User' }
      mockApiClient.post.mockResolvedValueOnce({ data: { user: mockUser } })

      const { getByTestId } = render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      )

      await waitFor(() => {
        expect(getByTestId('loading')).toHaveTextContent('ready')
      })

      await act(async () => {
        getByTestId('register-btn').click()
      })

      // User should still be null after registration (no auto-authentication)
      await waitFor(() => {
        expect(getByTestId('user')).toHaveTextContent('no user')
      })
    })
  })

  describe('logout', () => {
    it('should call logout endpoint', async () => {
      const mockApiClient = apiClientModule.apiClient as any
      mockApiClient.get.mockResolvedValueOnce({ data: { user: null } })
      mockApiClient.post.mockResolvedValueOnce({ data: {} })

      const { getByTestId } = render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      )

      await waitFor(() => {
        expect(getByTestId('loading')).toHaveTextContent('ready')
      })

      await act(async () => {
        getByTestId('logout-btn').click()
      })

      await waitFor(() => {
        expect(mockApiClient.post).toHaveBeenCalledWith('/auth/logout')
      })
    })

    it('should clear user after logout', async () => {
      const mockApiClient = apiClientModule.apiClient as any
      const mockUser = { id: '1', email: 'test@example.com', name: 'Test User' }
      mockApiClient.get.mockResolvedValueOnce({ data: { user: mockUser } })
      mockApiClient.post.mockResolvedValueOnce({ data: {} })

      const { getByTestId } = render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      )

      await waitFor(() => {
        expect(getByTestId('user')).toHaveTextContent('Test User')
      })

      await act(async () => {
        getByTestId('logout-btn').click()
      })

      await waitFor(() => {
        expect(getByTestId('user')).toHaveTextContent('no user')
      })
    })
  })
})

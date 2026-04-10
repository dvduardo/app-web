import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor, act } from '@testing-library/react'
import { AuthProvider, useAuth } from '@/contexts/auth-context'
import * as apiClientModule from '@/lib/api-client'

// Mock api-client
vi.mock('@/lib/api-client', () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
  },
}))

vi.mock('next-auth/react', () => ({
  getProviders: vi.fn(async () => ({})),
  signIn: vi.fn(),
  signOut: vi.fn(async () => ({ url: '/auth/login' })),
}))

// Helper component to test useAuth hook
function TestComponent() {
  const { user, isLoading, login, register, logout, changePassword } = useAuth()

  return (
    <div>
      <div data-testid="loading">{isLoading ? 'loading' : 'ready'}</div>
      <div data-testid="user">{user ? `${user.name} (${user.email})` : 'no user'}</div>
      <div data-testid="user-id">{user?.id || 'no id'}</div>
      <div data-testid="has-password">{user ? String(user.hasPassword) : 'no user'}</div>
      <button data-testid="login-btn" onClick={() => login('test@example.com', 'password')}>
        Login
      </button>
      <button data-testid="register-btn" onClick={() => register('new@example.com', 'password', 'New User')}>
        Register
      </button>
      <button data-testid="logout-btn" onClick={() => logout()}>
        Logout
      </button>
      <button data-testid="change-password-btn" onClick={() => changePassword('oldPass', 'newPass123')}>
        ChangePassword
      </button>
      <button data-testid="set-password-btn" onClick={() => changePassword(undefined, 'newPass123')}>
        SetPassword
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

  describe('hasPassword', () => {
    it('should expose hasPassword=true when user has a password', async () => {
      const mockApiClient = apiClientModule.apiClient as any
      const mockUser = { id: '1', email: 'test@example.com', name: 'Test User', hasPassword: true }
      mockApiClient.get.mockResolvedValueOnce({ data: { user: mockUser } })

      const { getByTestId } = render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      )

      await waitFor(() => {
        expect(getByTestId('has-password')).toHaveTextContent('true')
      })
    })

    it('should expose hasPassword=false when user logged in via OAuth', async () => {
      const mockApiClient = apiClientModule.apiClient as any
      const mockUser = { id: '2', email: 'oauth@example.com', name: 'OAuth User', hasPassword: false }
      mockApiClient.get.mockResolvedValueOnce({ data: { user: mockUser } })

      const { getByTestId } = render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      )

      await waitFor(() => {
        expect(getByTestId('has-password')).toHaveTextContent('false')
      })
    })
  })

  describe('changePassword', () => {
    it('should call PATCH /auth/password with currentPassword and newPassword', async () => {
      const mockApiClient = apiClientModule.apiClient as any
      const mockUser = { id: '1', email: 'test@example.com', name: 'Test User', hasPassword: true }
      mockApiClient.get.mockResolvedValueOnce({ data: { user: mockUser } })
      mockApiClient.patch.mockResolvedValueOnce({ data: { success: true } })

      const { getByTestId } = render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      )

      await waitFor(() => {
        expect(getByTestId('loading')).toHaveTextContent('ready')
      })

      await act(async () => {
        getByTestId('change-password-btn').click()
      })

      await waitFor(() => {
        expect(mockApiClient.patch).toHaveBeenCalledWith('/auth/password', {
          currentPassword: 'oldPass',
          newPassword: 'newPass123',
        })
      })
    })

    it('should update hasPassword to true after OAuth user sets a password', async () => {
      const mockApiClient = apiClientModule.apiClient as any
      const mockUser = { id: '2', email: 'oauth@example.com', name: 'OAuth User', hasPassword: false }
      mockApiClient.get.mockResolvedValueOnce({ data: { user: mockUser } })
      mockApiClient.patch.mockResolvedValueOnce({ data: { success: true } })

      const { getByTestId } = render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      )

      await waitFor(() => {
        expect(getByTestId('has-password')).toHaveTextContent('false')
      })

      await act(async () => {
        getByTestId('set-password-btn').click()
      })

      await waitFor(() => {
        expect(getByTestId('has-password')).toHaveTextContent('true')
      })
    })

    it('should call PATCH /auth/password without currentPassword when setting for first time', async () => {
      const mockApiClient = apiClientModule.apiClient as any
      const mockUser = { id: '2', email: 'oauth@example.com', name: 'OAuth User', hasPassword: false }
      mockApiClient.get.mockResolvedValueOnce({ data: { user: mockUser } })
      mockApiClient.patch.mockResolvedValueOnce({ data: { success: true } })

      const { getByTestId } = render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      )

      await waitFor(() => {
        expect(getByTestId('loading')).toHaveTextContent('ready')
      })

      await act(async () => {
        getByTestId('set-password-btn').click()
      })

      await waitFor(() => {
        expect(mockApiClient.patch).toHaveBeenCalledWith('/auth/password', {
          currentPassword: undefined,
          newPassword: 'newPass123',
        })
      })
    })
  })
})

import { describe, expect, it } from 'vitest'
import { loginSchema, registerSchema, registerServerSchema, changePasswordSchema, setPasswordSchema } from '@/lib/schemas/auth'

describe('auth schemas', () => {
  it('trims and validates login input', () => {
    const result = loginSchema.parse({
      email: '  teste@example.com  ',
      password: 'secret123',
    })

    expect(result).toEqual({
      email: 'teste@example.com',
      password: 'secret123',
    })
  })

  it('rejects invalid login input', () => {
    const result = loginSchema.safeParse({
      email: '',
      password: '',
    })

    expect(result.success).toBe(false)
  })

  it('validates register input and matching passwords', () => {
    const result = registerSchema.parse({
      name: '  Maria  ',
      email: 'maria@example.com',
      password: '123456',
      confirmPassword: '123456',
    })

    expect(result.name).toBe('Maria')
  })

  it('rejects register input when passwords do not match', () => {
    const result = registerSchema.safeParse({
      name: 'Maria',
      email: 'maria@example.com',
      password: '123456',
      confirmPassword: '654321',
    })

    expect(result.success).toBe(false)
  })

  it('omits confirmPassword on the server schema', () => {
    const result = registerServerSchema.parse({
      name: 'Maria',
      email: 'maria@example.com',
      password: '123456',
    })

    expect(result).toEqual({
      name: 'Maria',
      email: 'maria@example.com',
      password: '123456',
    })
  })
})

describe('changePasswordSchema', () => {
  it('validates when all fields are correct and passwords match', () => {
    const result = changePasswordSchema.safeParse({
      currentPassword: 'senhaAtual123',
      newPassword: 'novaSenha123',
      confirmNewPassword: 'novaSenha123',
    })

    expect(result.success).toBe(true)
  })

  it('rejects when currentPassword is empty', () => {
    const result = changePasswordSchema.safeParse({
      currentPassword: '',
      newPassword: 'novaSenha123',
      confirmNewPassword: 'novaSenha123',
    })

    expect(result.success).toBe(false)
  })

  it('rejects when newPassword is shorter than 6 characters', () => {
    const result = changePasswordSchema.safeParse({
      currentPassword: 'senhaAtual123',
      newPassword: '12345',
      confirmNewPassword: '12345',
    })

    expect(result.success).toBe(false)
  })

  it('rejects when new passwords do not match', () => {
    const result = changePasswordSchema.safeParse({
      currentPassword: 'senhaAtual123',
      newPassword: 'novaSenha123',
      confirmNewPassword: 'outraSenha456',
    })

    expect(result.success).toBe(false)
    if (!result.success) {
      const paths = result.error.issues.map((e) => e.path.join('.'))
      expect(paths).toContain('confirmNewPassword')
    }
  })
})

describe('setPasswordSchema', () => {
  it('validates when fields are correct and passwords match', () => {
    const result = setPasswordSchema.safeParse({
      newPassword: 'novaSenha123',
      confirmNewPassword: 'novaSenha123',
    })

    expect(result.success).toBe(true)
  })

  it('rejects when newPassword is shorter than 6 characters', () => {
    const result = setPasswordSchema.safeParse({
      newPassword: '123',
      confirmNewPassword: '123',
    })

    expect(result.success).toBe(false)
  })

  it('rejects when passwords do not match', () => {
    const result = setPasswordSchema.safeParse({
      newPassword: 'novaSenha123',
      confirmNewPassword: 'diferente456',
    })

    expect(result.success).toBe(false)
    if (!result.success) {
      const paths = result.error.issues.map((e) => e.path.join('.'))
      expect(paths).toContain('confirmNewPassword')
    }
  })

  it('rejects when confirmNewPassword is empty', () => {
    const result = setPasswordSchema.safeParse({
      newPassword: 'novaSenha123',
      confirmNewPassword: '',
    })

    expect(result.success).toBe(false)
  })
})

import { describe, expect, it } from 'vitest'
import { loginSchema, registerSchema, registerServerSchema } from '@/lib/schemas/auth'

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

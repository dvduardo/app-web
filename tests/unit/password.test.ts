import { describe, it, expect } from 'vitest'
import { hashPassword, verifyPassword } from '@/server/security/password'

describe('password', () => {
  describe('hashPassword', () => {
    it('should hash a password successfully', async () => {
      const password = 'test-password-123'
      const hash = await hashPassword(password)

      expect(hash).toBeDefined()
      expect(hash).not.toBe(password)
      expect(hash.length).toBeGreaterThan(0)
    })

    it('should produce different hashes for the same password', async () => {
      const password = 'test-password-123'
      const hash1 = await hashPassword(password)
      const hash2 = await hashPassword(password)

      expect(hash1).not.toBe(hash2)
    })

    it('should handle special characters in password', async () => {
      const password = 'p@ss!w0rd#$%^&*()_+-=[]{}|;:,.<>?'
      const hash = await hashPassword(password)

      expect(hash).toBeDefined()
      expect(hash).not.toBe(password)
    })

    it('should handle empty password', async () => {
      const password = ''
      const hash = await hashPassword(password)

      expect(hash).toBeDefined()
    })
  })

  describe('verifyPassword', () => {
    it('should verify correct password', async () => {
      const password = 'test-password-123'
      const hash = await hashPassword(password)
      const result = await verifyPassword(password, hash)

      expect(result).toBe(true)
    })

    it('should reject incorrect password', async () => {
      const password = 'test-password-123'
      const hash = await hashPassword(password)
      const result = await verifyPassword('wrong-password', hash)

      expect(result).toBe(false)
    })

    it('should be case-sensitive', async () => {
      const password = 'TestPassword123'
      const hash = await hashPassword(password)
      const result = await verifyPassword('testpassword123', hash)

      expect(result).toBe(false)
    })

    it('should reject empty password against hash', async () => {
      const password = 'test-password-123'
      const hash = await hashPassword(password)
      const result = await verifyPassword('', hash)

      expect(result).toBe(false)
    })

    it('should verify password with special characters', async () => {
      const password = 'p@ss!w0rd#$%^&*()_+-=[]{}|;:,.<>?'
      const hash = await hashPassword(password)
      const result = await verifyPassword(password, hash)

      expect(result).toBe(true)
    })

    it('should reject with invalid hash format', async () => {
      const password = 'test-password-123'
      const invalidHash = 'not-a-valid-hash'
      
      const result = await verifyPassword(password, invalidHash)
      expect(result).toBe(false)
    })
  })
})

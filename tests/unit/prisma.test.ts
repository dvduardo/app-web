import { describe, it, expect } from 'vitest'

describe('prisma', () => {
  it('should export prisma module', async () => {
    const prismaModule = await import('@/server/db/prisma')
    expect(prismaModule).toBeDefined()
  })

  it('should have prisma exported', async () => {
    const { prisma } = await import('@/server/db/prisma')
    expect(prisma).toBeDefined()
  })

  it('should be an object instance', async () => {
    const { prisma } = await import('@/server/db/prisma')
    expect(typeof prisma).toBe('object')
  })
})

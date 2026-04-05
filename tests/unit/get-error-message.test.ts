import { describe, it, expect, vi } from 'vitest'
import axios from 'axios'

vi.mock('axios', async (importOriginal) => {
  const actual = await importOriginal<typeof import('axios')>()
  return { ...actual }
})

import { getErrorMessage } from '@/lib/get-error-message'

describe('getErrorMessage', () => {
  it('should return API error message from axios error response', () => {
    const axiosError = new axios.AxiosError('Request failed')
    axiosError.response = {
      data: { error: 'Email already in use' },
      status: 400,
      statusText: 'Bad Request',
      headers: {},
      config: {} as any,
    }

    const result = getErrorMessage(axiosError, 'Fallback message')
    expect(result).toBe('Email already in use')
  })

  it('should return the axios error message when there is no response', () => {
    const axiosError = new axios.AxiosError('Network Error')

    const result = getErrorMessage(axiosError, 'Fallback message')
    expect(result).toBe('Network Error')
  })

  it('should return the axios error message when response data error is empty', () => {
    const axiosError = new axios.AxiosError('Request failed')
    axiosError.response = {
      data: { error: '   ' },
      status: 500,
      statusText: 'Internal Server Error',
      headers: {},
      config: {} as any,
    }

    const result = getErrorMessage(axiosError, 'Fallback message')
    expect(result).toBe('Request failed')
  })

  it('should return message from generic Error instance', () => {
    const error = new Error('Something went wrong')

    const result = getErrorMessage(error, 'Fallback message')
    expect(result).toBe('Something went wrong')
  })

  it('should return fallback for unknown error types', () => {
    const result = getErrorMessage('unexpected string error', 'Fallback message')
    expect(result).toBe('Fallback message')
  })

  it('should return fallback for null', () => {
    const result = getErrorMessage(null, 'Fallback message')
    expect(result).toBe('Fallback message')
  })

  it('should translate known API messages', () => {
    const axiosError = new axios.AxiosError('Request failed')
    axiosError.response = {
      data: { error: 'invalid payload' },
      status: 400,
      statusText: 'Bad Request',
      headers: {},
      config: {} as any,
    }

    expect(getErrorMessage(axiosError, 'Fallback message')).toBe(
      'Dados inválidos. Revise as informações enviadas.'
    )
  })

  it('should translate known generic error messages', () => {
    expect(getErrorMessage(new Error('internal server error'), 'Fallback message')).toBe(
      'Erro interno do servidor. Tente novamente.'
    )
    expect(getErrorMessage(new Error('email and password are required'), 'Fallback message')).toBe(
      'Email e senha são obrigatórios.'
    )
  })
})

import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'

import App from './App'

describe('authentication screen', () => {
  it('shows a sign-in form', () => {
    render(<App />)

    expect(
      screen.getByRole('heading', { name: 'Welcome back' }),
    ).toBeInTheDocument()
    expect(screen.getByLabelText('Email address')).toBeInTheDocument()
    expect(screen.getByLabelText('Password')).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Sign in' }),
    ).toBeInTheDocument()
  })

  it('switches to account creation', async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.click(
      screen.getByRole('button', { name: 'Create account' }),
    )

    expect(
      screen.getByRole('heading', { name: 'Create your account' }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Register' }),
    ).toBeInTheDocument()
  })
})

function jsonResponse(data: unknown, status = 200): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => data,
  } as Response
}

afterEach(() => {
  vi.unstubAllGlobals()
  sessionStorage.clear()
})

describe('authentication API', () => {
  it('signs in and opens the inventory', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(
        jsonResponse({ access_token: 'test-token', token_type: 'bearer' }),
      )
      .mockResolvedValueOnce(
        jsonResponse({
          id: 1,
          email: 'driver@example.com',
          role: 'customer',
        }),
      )
      .mockResolvedValueOnce(jsonResponse([]))
    vi.stubGlobal('fetch', fetchMock)

    const user = userEvent.setup()
    render(<App />)

    await user.type(
      screen.getByLabelText('Email address'),
      'driver@example.com',
    )
    await user.type(
      screen.getByLabelText('Password'),
      'SecurePass123!',
    )
    await user.click(screen.getByRole('button', { name: 'Sign in' }))

    expect(
      await screen.findByRole('heading', { name: 'Available vehicles' }),
    ).toBeInTheDocument()
    expect(fetchMock).toHaveBeenCalledWith(
      '/api/auth/login',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({
          email: 'driver@example.com',
          password: 'SecurePass123!',
        }),
      }),
    )
    expect(fetchMock).toHaveBeenCalledWith(
      '/api/auth/me',
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: 'Bearer test-token',
        }),
      }),
    )
  })

  it('shows an error for incorrect credentials', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(
        jsonResponse({ detail: 'Invalid email or password' }, 401),
      )
    vi.stubGlobal('fetch', fetchMock)

    const user = userEvent.setup()
    render(<App />)

    await user.type(
      screen.getByLabelText('Email address'),
      'driver@example.com',
    )
    await user.type(screen.getByLabelText('Password'), 'wrong-password')
    await user.click(screen.getByRole('button', { name: 'Sign in' }))

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Invalid email or password',
    )
  })

  it('registers a customer and signs them in', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(
        jsonResponse({
          id: 2,
          email: 'new@example.com',
          role: 'customer',
        }, 201),
      )
      .mockResolvedValueOnce(
        jsonResponse({ access_token: 'new-token', token_type: 'bearer' }),
      )
      .mockResolvedValueOnce(
        jsonResponse({
          id: 2,
          email: 'new@example.com',
          role: 'customer',
        }),
      )
      .mockResolvedValueOnce(jsonResponse([]))
    vi.stubGlobal('fetch', fetchMock)

    const user = userEvent.setup()
    render(<App />)

    await user.click(
      screen.getByRole('button', { name: 'Create account' }),
    )
    await user.type(
      screen.getByLabelText('Email address'),
      'new@example.com',
    )
    await user.type(
      screen.getByLabelText('Password'),
      'SecurePass123!',
    )
    await user.click(screen.getByRole('button', { name: 'Register' }))

    expect(
      await screen.findByRole('heading', { name: 'Available vehicles' }),
    ).toBeInTheDocument()
    expect(fetchMock).toHaveBeenCalledWith(
      '/api/auth/register',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({
          email: 'new@example.com',
          password: 'SecurePass123!',
        }),
      }),
    )
  })
})
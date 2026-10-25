import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'

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
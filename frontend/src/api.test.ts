import { afterEach, expect, it, vi } from 'vitest'
import { createVehicle } from './api'

afterEach(() => vi.unstubAllGlobals())

it('shows a useful field error when the API rejects vehicle input', async () => {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
    ok: false,
    status: 422,
    json: async () => ({
      detail: [{ loc: ['body', 'price'], msg: 'Input should be greater than 0' }],
    }),
  }))

  await expect(createVehicle('token', {
    make: 'Tata',
    model: 'Nexon',
    category: 'SUV',
    price: '0',
    quantity: 1,
  })).rejects.toThrow('price: Input should be greater than 0')
})

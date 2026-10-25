export type Account = {
  id: number
  email: string
  role: 'customer' | 'admin'
}

export type Vehicle = {
  id: number
  make: string
  model: string
  category: string
  price: string
  quantity: number
}

export type VehicleInput = Omit<Vehicle, 'id'>

export class ApiError extends Error {
  readonly status: number

  constructor(message: string, status: number) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

async function request<T>(path: string, options: RequestInit): Promise<T> {
  let response: Response

  try {
    response = await fetch(path, options)
  } catch {
    throw new Error('Unable to connect. Please try again.')
  }

  const data: unknown = await response.json().catch(() => null)

  if (!response.ok) {
    const detail = data && typeof data === 'object' && 'detail' in data
      ? data.detail
      : null
    const fieldErrors = Array.isArray(detail)
      ? detail.map((issue: unknown) => {
          if (!issue || typeof issue !== 'object' || !('msg' in issue) || typeof issue.msg !== 'string') return ''
          const location = 'loc' in issue && Array.isArray(issue.loc)
            ? issue.loc.at(-1)
            : null
          return `${typeof location === 'string' ? `${location}: ` : ''}${issue.msg}`
        }).filter(Boolean).join('; ')
      : ''
    const message = typeof detail === 'string'
      ? detail
      : fieldErrors || 'Something went wrong. Please try again.'

    throw new ApiError(message, response.status)
  }

  return data as T
}

export async function register(
  email: string,
  password: string,
): Promise<Account> {
  return request<Account>('/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  })
}

export async function login(
  email: string,
  password: string,
): Promise<string> {
  const result = await request<{
    access_token: string
    token_type: string
  }>('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  })

  return result.access_token
}

export async function getCurrentUser(token: string): Promise<Account> {
  return request<Account>('/api/auth/me', {
    headers: { Authorization: `Bearer ${token}` },
  })
}

export async function listVehicles(token: string): Promise<Vehicle[]> {
  return request<Vehicle[]>('/api/vehicles', {
    headers: { Authorization: `Bearer ${token}` },
  })
}

export async function createVehicle(
  token: string,
  details: VehicleInput,
): Promise<Vehicle> {
  return request<Vehicle>('/api/vehicles', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(details),
  })
}

export async function purchaseVehicle(
  token: string,
  vehicleId: number,
): Promise<Vehicle> {
  return request<Vehicle>(`/api/vehicles/${vehicleId}/purchase`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
  })
}

export type VehicleFilters = {
  make: string
  model: string
  category: string
  minPrice: string
  maxPrice: string
}

export async function searchVehicles(
  token: string,
  filters: VehicleFilters,
): Promise<Vehicle[]> {
  const params = new URLSearchParams()

  if (filters.make) params.set('make', filters.make)
  if (filters.model) params.set('model', filters.model)
  if (filters.category) params.set('category', filters.category)
  if (filters.minPrice) params.set('min_price', filters.minPrice)
  if (filters.maxPrice) params.set('max_price', filters.maxPrice)

  const query = params.toString()
  const path = `/api/vehicles/search${query ? `?${query}` : ''}`

  return request<Vehicle[]>(path, {
    headers: { Authorization: `Bearer ${token}` },
  })
}

export async function updateVehicle(
  token: string,
  vehicleId: number,
  details: VehicleInput,
): Promise<Vehicle> {
  return request<Vehicle>(`/api/vehicles/${vehicleId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(details),
  })
}

export async function deleteVehicle(
  token: string,
  vehicleId: number,
): Promise<void> {
  await request<null>(`/api/vehicles/${vehicleId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  })
}

export async function restockVehicle(
  token: string,
  vehicleId: number,
  amount: number,
): Promise<Vehicle> {
  return request<Vehicle>(`/api/vehicles/${vehicleId}/restock`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ amount }),
  })
}

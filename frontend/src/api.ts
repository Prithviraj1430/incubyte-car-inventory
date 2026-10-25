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

async function request<T>(path: string, options: RequestInit): Promise<T> {
  let response: Response

  try {
    response = await fetch(path, options)
  } catch {
    throw new Error('Unable to connect. Please try again.')
  }

  const data: unknown = await response.json().catch(() => null)

  if (!response.ok) {
    const message =
      data &&
      typeof data === 'object' &&
      'detail' in data &&
      typeof data.detail === 'string'
        ? data.detail
        : 'Something went wrong. Please try again.'

    throw new Error(message)
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
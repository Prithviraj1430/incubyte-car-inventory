import { useState, type FormEvent } from 'react'

import type { Account, Vehicle, VehicleInput } from './api'

type DashboardProps = {
  account: Account
  vehicles: Vehicle[]
  onSignOut: () => void
  onAddVehicle: (details: VehicleInput) => Promise<void>
  onPurchase: (vehicleId: number) => Promise<void>
}

const formatPrice = (price: string) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(Number(price))

const inputClass =
  'w-full rounded-xl border border-[#dce2de] bg-white px-4 py-3 text-sm outline-none focus:border-[#315d61] focus:ring-4 focus:ring-[#315d61]/10'

function Dashboard({
  account,
  vehicles,
  onSignOut,
  onAddVehicle,
  onPurchase,
}: DashboardProps) {
  const [showAddForm, setShowAddForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState('')
  const [purchasePendingId, setPurchasePendingId] = useState<number | null>(
    null,
  )
  const [purchaseError, setPurchaseError] = useState('')

  async function purchase(vehicleId: number) {
    setPurchaseError('')
    setPurchasePendingId(vehicleId)

    try {
      await onPurchase(vehicleId)
    } catch (failure) {
      setPurchaseError(
        failure instanceof Error
          ? failure.message
          : 'Could not complete the purchase.',
      )
    } finally {
      setPurchasePendingId(null)
    }
  }

  async function submitVehicle(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const fields = new FormData(event.currentTarget)
    const details: VehicleInput = {
      make: String(fields.get('make') ?? '').trim(),
      model: String(fields.get('model') ?? '').trim(),
      category: String(fields.get('category') ?? '').trim(),
      price: String(fields.get('price') ?? '').trim(),
      quantity: Number(fields.get('quantity')),
    }

    setFormError('')
    setSaving(true)

    try {
      await onAddVehicle(details)
      setShowAddForm(false)
    } catch (failure) {
      setFormError(
        failure instanceof Error
          ? failure.message
          : 'Could not save the vehicle.',
      )
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#f2f3ef] text-[#172332]">
      <header className="border-b border-[#dce2de] bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-5 sm:px-8">
          <span className="text-lg font-bold tracking-[0.18em]">
            AUTO<span className="text-[#c56f48]">.</span>ATELIER
          </span>
          <div className="flex items-center gap-4">
            <span className="hidden text-sm text-[#68757b] sm:block">
              {account.email}
            </span>
            <button
              type="button"
              onClick={onSignOut}
              className="rounded-full border border-[#dce2de] px-4 py-2 text-sm font-semibold hover:bg-[#f2f3ef]"
            >
              Sign out
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-5 py-12 sm:px-8 sm:py-16">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-5">
          <div>
            <p className="text-xs font-bold tracking-[0.23em] text-[#b46a49] uppercase">
              The collection
            </p>
            <h1 className="mt-3 font-serif text-4xl tracking-tight sm:text-6xl">
              Available vehicles
            </h1>
            <p className="mt-4 text-[#68757b]">
              Explore the current inventory and live stock availability.
            </p>
          </div>
          <div className="flex items-center gap-3">
            {account.role === 'admin' && (
              <button
                type="button"
                onClick={() => {
                  setFormError('')
                  setShowAddForm(true)
                }}
                className="rounded-full bg-[#183d45] px-5 py-3 text-sm font-semibold text-white hover:bg-[#285761]"
              >
                Add vehicle
              </button>
            )}
            <span className="rounded-full bg-[#e2eae6] px-4 py-2 text-xs font-semibold text-[#23505a]">
              {account.role === 'admin' ? 'Admin access' : 'Member access'}
            </span>
          </div>
        </div>

        {showAddForm && (
          <section className="mb-8 rounded-[28px] border border-[#dce2de] bg-white p-6 shadow-[0_15px_40px_rgba(20,42,55,0.05)] sm:p-8">
            <div className="mb-6 flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-semibold tracking-[0.2em] text-[#b46a49] uppercase">
                  Admin inventory
                </p>
                <h2 className="mt-2 font-serif text-3xl">New vehicle</h2>
              </div>
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="text-sm font-semibold text-[#68757b] hover:text-[#172332]"
              >
                Cancel
              </button>
            </div>

            <form onSubmit={submitVehicle}>
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                <label className="block text-sm font-semibold">
                  Make
                  <input
                    name="make"
                    required
                    maxLength={100}
                    className={`${inputClass} mt-2`}
                  />
                </label>
                <label className="block text-sm font-semibold">
                  Model
                  <input
                    name="model"
                    required
                    maxLength={100}
                    className={`${inputClass} mt-2`}
                  />
                </label>
                <label className="block text-sm font-semibold">
                  Category
                  <input
                    name="category"
                    required
                    maxLength={100}
                    className={`${inputClass} mt-2`}
                  />
                </label>
                <label className="block text-sm font-semibold">
                  Price
                  <input
                    name="price"
                    inputMode="decimal"
                    required
                    placeholder="1499999.00"
                    className={`${inputClass} mt-2`}
                  />
                </label>
                <label className="block text-sm font-semibold">
                  Quantity
                  <input
                    name="quantity"
                    type="number"
                    min="0"
                    step="1"
                    required
                    className={`${inputClass} mt-2`}
                  />
                </label>
              </div>

              {formError && (
                <p
                  role="alert"
                  className="mt-5 rounded-xl bg-[#fff1ec] px-4 py-3 text-sm text-[#994d36]"
                >
                  {formError}
                </p>
              )}

              <button
                type="submit"
                disabled={saving}
                className="mt-7 rounded-xl bg-[#183d45] px-6 py-3.5 text-sm font-semibold text-white hover:bg-[#285761] disabled:opacity-60"
              >
                {saving ? 'Saving…' : 'Save vehicle'}
              </button>
            </form>
          </section>
        )}

        {purchaseError && (
          <p
            role="alert"
            className="mb-6 rounded-xl border border-[#edc9bd] bg-[#fff1ec] px-4 py-3 text-sm text-[#994d36]"
          >
            {purchaseError}
          </p>
        )}

        {vehicles.length === 0 ? (
          <div className="rounded-[28px] border border-[#dce2de] bg-white px-8 py-20 text-center">
            <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#e9efec] text-2xl">
              ✦
            </div>
            <h2 className="font-serif text-3xl">
              The showroom is getting ready
            </h2>
            <p className="mx-auto mt-3 max-w-md text-sm leading-7 text-[#68757b]">
              No vehicles are listed yet. Check back soon for the latest
              additions.
            </p>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {vehicles.map((vehicle) => (
              <article
                key={vehicle.id}
                className="overflow-hidden rounded-[24px] border border-[#dce2de] bg-white shadow-[0_10px_30px_rgba(20,42,55,0.04)]"
              >
                <div className="relative flex h-36 items-end bg-[#18313d] p-6 text-white">
                  <div className="absolute right-6 top-5 h-24 w-24 rounded-full border border-white/10" />
                  <span className="relative text-xs font-semibold tracking-[0.2em] text-[#efb288] uppercase">
                    {vehicle.category}
                  </span>
                </div>
                <div className="p-6">
                  <h2 className="font-serif text-3xl">
                    {vehicle.make} {vehicle.model}
                  </h2>
                  <p className="mt-3 text-xl font-semibold">
                    {formatPrice(vehicle.price)}
                  </p>
                  <p className="mt-5 text-sm text-[#68757b]">
                    {vehicle.quantity === 0
                      ? 'Sold out'
                      : `${vehicle.quantity} in stock`}
                  </p>
                  <button
                    type="button"
                    onClick={() => void purchase(vehicle.id)}
                    disabled={
                      vehicle.quantity === 0 ||
                      purchasePendingId === vehicle.id
                    }
                    className="mt-5 w-full rounded-xl bg-[#183d45] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#285761] disabled:cursor-not-allowed disabled:bg-[#dce2de] disabled:text-[#68757b]"
                  >
                    {purchasePendingId === vehicle.id
                      ? 'Processing…'
                      : 'Purchase'}
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

export default Dashboard
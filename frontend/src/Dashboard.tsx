import type { Account, Vehicle } from './api'

type DashboardProps = {
  account: Account
  vehicles: Vehicle[]
  onSignOut: () => void
}

const formatPrice = (price: string) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(Number(price))

function Dashboard({
  account,
  vehicles,
  onSignOut,
}: DashboardProps) {
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
          <span className="rounded-full bg-[#e2eae6] px-4 py-2 text-xs font-semibold text-[#23505a]">
            {account.role === 'admin' ? 'Admin access' : 'Member access'}
          </span>
        </div>

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
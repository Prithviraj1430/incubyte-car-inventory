import { useRef, useState, type FormEvent } from 'react'

import type { VehicleFilters } from './api'

type SearchPanelProps = {
  onSearch: (filters: VehicleFilters) => Promise<void>
  onReset: () => Promise<void>
}

const inputClass =
  'mt-2 w-full rounded-xl border border-[#dce2de] bg-white px-4 py-3 text-sm outline-none focus:border-[#315d61] focus:ring-4 focus:ring-[#315d61]/10'

function SearchPanel({ onSearch, onReset }: SearchPanelProps) {
  const formRef = useRef<HTMLFormElement>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const fields = new FormData(event.currentTarget)

    const filters: VehicleFilters = {
      make: String(fields.get('make') ?? '').trim(),
      model: String(fields.get('model') ?? '').trim(),
      category: String(fields.get('category') ?? '').trim(),
      minPrice: String(fields.get('min_price') ?? '').trim(),
      maxPrice: String(fields.get('max_price') ?? '').trim(),
    }

    setError('')
    setBusy(true)

    try {
      await onSearch(filters)
    } catch (failure) {
      setError(
        failure instanceof Error
          ? failure.message
          : 'Could not search vehicles.',
      )
    } finally {
      setBusy(false)
    }
  }

  async function reset() {
    formRef.current?.reset()
    setError('')
    setBusy(true)

    try {
      await onReset()
    } catch (failure) {
      setError(
        failure instanceof Error
          ? failure.message
          : 'Could not reload vehicles.',
      )
    } finally {
      setBusy(false)
    }
  }

  return (
    <section
      aria-label="Search vehicles"
      className="mb-8 rounded-[24px] border border-[#dce2de] bg-white p-5 sm:p-7"
    >
      <div className="mb-5">
        <p className="text-xs font-bold tracking-[0.2em] text-[#b46a49] uppercase">
          Refine the collection
        </p>
        <h2 className="mt-2 font-serif text-2xl">Find the right car</h2>
      </div>

      <form ref={formRef} onSubmit={submit}>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <label className="text-sm font-semibold">
            Search make
            <input name="make" className={inputClass} />
          </label>
          <label className="text-sm font-semibold">
            Search model
            <input name="model" className={inputClass} />
          </label>
          <label className="text-sm font-semibold">
            Search category
            <input name="category" className={inputClass} />
          </label>
          <label className="text-sm font-semibold">
            Minimum price
            <input
              name="min_price"
              inputMode="decimal"
              className={inputClass}
            />
          </label>
          <label className="text-sm font-semibold">
            Maximum price
            <input
              name="max_price"
              inputMode="decimal"
              className={inputClass}
            />
          </label>
        </div>

        {error && (
          <p
            role="alert"
            className="mt-5 rounded-xl bg-[#fff1ec] px-4 py-3 text-sm text-[#994d36]"
          >
            {error}
          </p>
        )}

        <div className="mt-6 flex flex-wrap gap-3">
          <button
            type="submit"
            disabled={busy}
            className="rounded-xl bg-[#183d45] px-6 py-3 text-sm font-semibold text-white hover:bg-[#285761] disabled:opacity-60"
          >
            {busy ? 'Searching…' : 'Search vehicles'}
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={() => void reset()}
            className="rounded-xl border border-[#dce2de] px-6 py-3 text-sm font-semibold text-[#24434b] hover:bg-[#f2f6f3] disabled:opacity-60"
          >
            Clear filters
          </button>
        </div>
      </form>
    </section>
  )
}

export default SearchPanel
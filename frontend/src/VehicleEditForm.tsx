import { useState, type FormEvent } from 'react'

import type { Vehicle, VehicleInput } from './api'

type VehicleEditFormProps = {
  vehicle: Vehicle
  onSave: (details: VehicleInput) => Promise<void>
  onCancel: () => void
}

const inputClass =
  'mt-1.5 w-full rounded-lg border border-[#dce2de] bg-white px-3 py-2 text-sm outline-none focus:border-[#315d61]'

function VehicleEditForm({
  vehicle,
  onSave,
  onCancel,
}: VehicleEditFormProps) {
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const fields = new FormData(event.currentTarget)

    const details: VehicleInput = {
      make: String(fields.get('make') ?? '').trim(),
      model: String(fields.get('model') ?? '').trim(),
      category: String(fields.get('category') ?? '').trim(),
      price: String(fields.get('price') ?? '').trim(),
      quantity: Number(fields.get('quantity')),
    }

    setError('')
    setSaving(true)

    try {
      await onSave(details)
      onCancel()
    } catch (failure) {
      setError(
        failure instanceof Error
          ? failure.message
          : 'Could not update the vehicle.',
      )
    } finally {
      setSaving(false)
    }
  }

  return (
    <form
      aria-label={`Edit ${vehicle.make} ${vehicle.model}`}
      onSubmit={submit}
      className="mt-5 space-y-3 border-t border-[#e4e9e5] pt-5"
    >
      <label className="block text-xs font-semibold">
        Edit make
        <input
          name="make"
          defaultValue={vehicle.make}
          required
          maxLength={100}
          className={inputClass}
        />
      </label>
      <label className="block text-xs font-semibold">
        Edit model
        <input
          name="model"
          defaultValue={vehicle.model}
          required
          maxLength={100}
          className={inputClass}
        />
      </label>
      <label className="block text-xs font-semibold">
        Edit category
        <input
          name="category"
          defaultValue={vehicle.category}
          required
          maxLength={100}
          className={inputClass}
        />
      </label>
      <label className="block text-xs font-semibold">
        Edit price
        <input
          name="price"
          defaultValue={vehicle.price}
          inputMode="decimal"
          required
          className={inputClass}
        />
      </label>
      <label className="block text-xs font-semibold">
        Edit quantity
        <input
          name="quantity"
          type="number"
          min="0"
          step="1"
          defaultValue={vehicle.quantity}
          required
          className={inputClass}
        />
      </label>

      {error && (
        <p role="alert" className="text-sm text-[#994d36]">
          {error}
        </p>
      )}

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={saving}
          className="rounded-lg bg-[#183d45] px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
        >
          {saving ? 'Saving…' : 'Save changes'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg border border-[#dce2de] px-4 py-2.5 text-sm font-semibold"
        >
          Cancel edit
        </button>
      </div>
    </form>
  )
}

export default VehicleEditForm
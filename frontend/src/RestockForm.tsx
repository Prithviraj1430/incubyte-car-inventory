import { useState, type FormEvent } from 'react'

type RestockFormProps = {
  onRestock: (amount: number) => Promise<void>
  onCancel: () => void
}

function RestockForm({ onRestock, onCancel }: RestockFormProps) {
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const fields = new FormData(event.currentTarget)
    const amount = Number(fields.get('amount'))

    setError('')
    setSaving(true)

    try {
      await onRestock(amount)
      onCancel()
    } catch (failure) {
      setError(
        failure instanceof Error
          ? failure.message
          : 'Could not restock the vehicle.',
      )
    } finally {
      setSaving(false)
    }
  }

  return (
    <form
      onSubmit={submit}
      className="mt-3 rounded-xl border border-[#dce2de] bg-[#f8faf8] p-4"
    >
      <label className="block text-sm font-semibold">
        Restock amount
        <input
          name="amount"
          type="number"
          min="1"
          step="1"
          required
          className="mt-2 w-full rounded-lg border border-[#dce2de] bg-white px-3 py-2 text-sm outline-none focus:border-[#315d61]"
        />
      </label>
      {error && (
        <p role="alert" className="mt-3 text-sm text-[#994d36]">
          {error}
        </p>
      )}
      <div className="mt-4 flex gap-3">
        <button
          type="submit"
          disabled={saving}
          className="rounded-lg bg-[#183d45] px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
        >
          {saving ? 'Restocking…' : 'Confirm restock'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg border border-[#dce2de] px-4 py-2.5 text-sm font-semibold"
        >
          Cancel
        </button>
      </div>
    </form>
  )
}

export default RestockForm
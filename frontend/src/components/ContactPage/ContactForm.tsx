'use client'

import { useState, type FormEvent } from 'react'
import { Button } from '@/components/ui/Button'

export function ContactForm() {
  const [status, setStatus] = useState<'idle' | 'submitting' | 'submitted' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = event.currentTarget
    const formData = new FormData(form)
    const payload = {
      name: formData.get('name')?.toString() ?? '',
      email: formData.get('email')?.toString() ?? '',
      phone: formData.get('phone')?.toString() ?? '',
      message: formData.get('message')?.toString() ?? '',
    }

    setStatus('submitting')
    setErrorMessage('')

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => null)
        throw new Error(data?.error ?? 'Failed to send message.')
      }

      setStatus('submitted')
    } catch (err) {
      setStatus('error')
      setErrorMessage(err instanceof Error ? err.message : 'Failed to send message.')
    }
  }

  return (
    <div className="flex flex-col gap-8 rounded-[10px] bg-[#f9f9f9] p-8">
      <h2 className="text-[30px] text-[#0a0a0a]">Send A Message</h2>

      {status === 'submitted' ? (
        <p className="text-base text-[#6a6d70]">
          Thanks for reaching out — our team will get back to you shortly.
        </p>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <label className="flex flex-col gap-2 text-sm text-[#0a0a0a]">
            Name:
            <input
              type="text"
              name="name"
              required
              className="h-[50px] w-full rounded-lg border border-[#d1d5dc] px-4 text-sm outline-none focus:border-[#b87333]"
            />
          </label>

          <label className="flex flex-col gap-2 text-sm text-[#0a0a0a]">
            Email:
            <input
              type="email"
              name="email"
              required
              className="h-[50px] w-full rounded-lg border border-[#d1d5dc] px-4 text-sm outline-none focus:border-[#b87333]"
            />
          </label>

          <label className="flex flex-col gap-2 text-sm text-[#0a0a0a]">
            Phone:
            <input
              type="tel"
              name="phone"
              className="h-[50px] w-full rounded-lg border border-[#d1d5dc] px-4 text-sm outline-none focus:border-[#b87333]"
            />
          </label>

          <label className="flex flex-col gap-2 text-sm text-[#0a0a0a]">
            Message:
            <textarea
              name="message"
              required
              rows={5}
              className="w-full resize-none rounded-lg border border-[#d1d5dc] px-4 py-3 text-sm outline-none focus:border-[#b87333]"
            />
          </label>

          {status === 'error' && (
            <p className="text-sm text-red-600">{errorMessage}</p>
          )}

          <Button
            type="submit"
            variant="primary"
            className="h-12 w-full rounded-full text-base disabled:opacity-60"
            disabled={status === 'submitting'}
          >
            {status === 'submitting' ? 'Sending...' : 'Submit'}
          </Button>
        </form>
      )}
    </div>
  )
}

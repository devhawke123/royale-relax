'use client'

import { useEffect, useState } from 'react'

interface CountdownTimerProps {
  endsAt: string
}

interface TimeLeft {
  days: number
  hours: number
  minutes: number
  seconds: number
}

function getTimeLeft(endsAt: string): TimeLeft {
  const diff = Math.max(0, new Date(endsAt).getTime() - Date.now())
  const totalSeconds = Math.floor(diff / 1000)
  return {
    days: Math.floor(totalSeconds / 86400),
    hours: Math.floor((totalSeconds % 86400) / 3600),
    minutes: Math.floor((totalSeconds % 3600) / 60),
    seconds: totalSeconds % 60,
  }
}

const units: { key: keyof TimeLeft; label: string }[] = [
  { key: 'days', label: 'Days' },
  { key: 'hours', label: 'Hours' },
  { key: 'minutes', label: 'Minutes' },
  { key: 'seconds', label: 'Seconds' },
]

export function CountdownTimer({ endsAt }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>(() => getTimeLeft(endsAt))

  useEffect(() => {
    const interval = setInterval(() => setTimeLeft(getTimeLeft(endsAt)), 1000)
    return () => clearInterval(interval)
  }, [endsAt])

  return (
    <div className="grid max-w-md grid-cols-4 gap-3 sm:gap-4">
      {units.map((unit) => (
        <div
          key={unit.key}
          className="flex flex-col items-center gap-1 rounded-[10px] border border-stone-400/40 bg-[#f9f9f9] py-4"
        >
          <span className="text-2xl font-bold text-[#b87333] tabular-nums sm:text-3xl">
            {String(timeLeft[unit.key]).padStart(2, '0')}
          </span>
          <span className="text-xs text-[#b87333] sm:text-sm">{unit.label}</span>
        </div>
      ))}
    </div>
  )
}

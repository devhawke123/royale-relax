'use client'

import { useEffect, useRef, useState } from 'react'

interface Stat {
  target: number
  decimals?: number
  suffix: string
  label: string
}

const stats: Stat[] = [
  { target: 20, suffix: '+', label: 'Bed Models' },
  { target: 4.9, decimals: 1, suffix: '★', label: 'Average Rating' },
]

const DURATION = 1800

function useCountUp(target: number, start: boolean) {
  const [value, setValue] = useState(0)

  useEffect(() => {
    if (!start) return

    let raf: number
    const startTime = performance.now()

    const tick = (now: number) => {
      const progress = Math.min((now - startTime) / DURATION, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setValue(target * eased)
      if (progress < 1) {
        raf = requestAnimationFrame(tick)
      }
    }

    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [start, target])

  return value
}

function StatBlock({ stat, start }: { stat: Stat; start: boolean }) {
  const value = useCountUp(stat.target, start)
  const display = stat.decimals ? value.toFixed(stat.decimals) : Math.round(value).toString()

  return (
    <div className="flex flex-col">
      <span className="text-3xl font-bold text-white tabular-nums sm:text-4xl">
        {display}
        {stat.suffix}
      </span>
      <span className="mt-1 text-xs font-normal text-white/80 sm:text-sm">{stat.label}</span>
    </div>
  )
}

export function HeroStats() {
  const ref = useRef<HTMLDivElement>(null)
  const [start, setStart] = useState(false)

  useEffect(() => {
    const node = ref.current
    if (!node) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setStart(true)
          observer.disconnect()
        }
      },
      { threshold: 0.3 },
    )

    observer.observe(node)
    return () => observer.disconnect()
  }, [])

  return (
    <div ref={ref} className="flex w-fit items-start gap-8 pt-2 sm:gap-10">
      {stats.map((stat) => (
        <StatBlock key={stat.label} stat={stat} start={start} />
      ))}
    </div>
  )
}

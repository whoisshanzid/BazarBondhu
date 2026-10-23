import { useEffect, useState } from 'react'

function getRemaining(target) {
  const difference = new Date(target).getTime() - Date.now()
  if (!target || Number.isNaN(difference) || difference <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, expired: true }
  }
  return {
    days: Math.floor(difference / 86400000),
    hours: Math.floor((difference / 3600000) % 24),
    minutes: Math.floor((difference / 60000) % 60),
    seconds: Math.floor((difference / 1000) % 60),
    expired: false,
  }
}

export function useCountdown(target) {
  const [, setTick] = useState(0)

  useEffect(() => {
    const timer = window.setInterval(() => {
      setTick((value) => value + 1)
    }, 1000)
    return () => window.clearInterval(timer)
  }, [])

  return getRemaining(target)
}

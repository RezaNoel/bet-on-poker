import { useCallback, useEffect, useRef, useState } from 'react'

export function useTimer(defaultSeconds = 20) {
  const [seconds, setSeconds] = useState(defaultSeconds)
  const [running, setRunning] = useState(false)
  const [duration, setDuration] = useState(defaultSeconds)
  const raf = useRef<number | null>(null)
  const endAt = useRef<number | null>(null)
  const secondsRef = useRef(seconds)
  const durationRef = useRef(duration)
  const runningRef = useRef(running)

  secondsRef.current = seconds
  durationRef.current = duration
  runningRef.current = running

  const clear = useCallback(() => {
    if (raf.current != null) {
      cancelAnimationFrame(raf.current)
      raf.current = null
    }
  }, [])

  const tick = useCallback(() => {
    if (endAt.current == null) return
    const left = Math.max(0, Math.ceil((endAt.current - Date.now()) / 1000))
    setSeconds(left)
    if (left <= 0) {
      setRunning(false)
      endAt.current = null
      clear()
      return
    }
    raf.current = requestAnimationFrame(tick)
  }, [clear])

  const start = useCallback(
    (from?: number) => {
      const total = from ?? (secondsRef.current > 0 ? secondsRef.current : durationRef.current)
      if (from != null) setDuration(from)
      setSeconds(total)
      endAt.current = Date.now() + total * 1000
      setRunning(true)
      clear()
      raf.current = requestAnimationFrame(tick)
    },
    [clear, tick],
  )

  const pause = useCallback(() => {
    if (!runningRef.current) return
    setRunning(false)
    clear()
    endAt.current = null
  }, [clear])

  const reset = useCallback(
    (to?: number) => {
      clear()
      endAt.current = null
      setRunning(false)
      const next = to ?? durationRef.current
      setDuration(next)
      setSeconds(next)
    },
    [clear],
  )

  useEffect(() => () => clear(), [clear])

  return { seconds, running, duration, start, pause, reset, setDuration }
}

import { useEffect, useRef, useState } from 'react'

export default function CountUp({ to, duration = 2000 }) {
  const [count, setCount] = useState(0)
  const ref = useRef(null)
  const started = useRef(false)

  useEffect(() => {
    const node = ref.current
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !started.current) {
        started.current = true
        const start = performance.now()
        const step = (now) => {
          const progress = Math.min((now - start) / duration, 1)
          const eased = 1 - Math.pow(1 - progress, 3) // ease-out-cubic
          setCount(Math.floor(eased * to))
          if (progress < 1) requestAnimationFrame(step)
        }
        requestAnimationFrame(step)
      }
    }, { threshold: 0.5 })
    if (node) observer.observe(node)
    return () => observer.disconnect()
  }, [to, duration])

  return <span ref={ref}>{count.toLocaleString()}</span>
}

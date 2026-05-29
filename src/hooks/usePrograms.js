import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { PROGRAMS as STATIC_PROGRAMS } from '../lib/constants'

export function usePrograms() {
  const [programs, setPrograms] = useState(STATIC_PROGRAMS)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    supabase
      .from('programs')
      .select('*')
      .eq('is_active', true)
      .order('sort_order')
      .then(({ data, error }) => {
        if (error) {
          // Fall back to static data if Supabase not configured
          setError(error)
        } else if (data && data.length > 0) {
          setPrograms(data)
        }
        setLoading(false)
      })
  }, [])

  return { programs, loading, error }
}

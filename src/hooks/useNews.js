import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

export function useNews({ category = null, limit = 20 } = {}) {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let query = supabase
      .from('news_posts')
      .select('*')
      .eq('published', true)
      .order('published_at', { ascending: false })
      .limit(limit)

    if (category) {
      query = query.eq('category', category)
    }

    query.then(({ data, error }) => {
      if (error) setError(error)
      else setPosts(data || [])
      setLoading(false)
    })
  }, [category, limit])

  return { posts, loading, error }
}

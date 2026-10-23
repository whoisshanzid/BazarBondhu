import { useCallback, useEffect, useState } from 'react'

/**
 * Loads async data and keeps the previous result visible until the new one arrives.
 * `key` identifies the request: when it changes the data is refetched and `loading`
 * becomes true again. Use `reload()` to refetch the current key.
 */
export function useAsyncData(loader, key) {
  const [state, setState] = useState({ key: null, token: 0, data: null, error: null })
  const [token, setToken] = useState(0)

  useEffect(() => {
    let cancelled = false

    Promise.resolve()
      .then(() => loader())
      .then((data) => {
        if (!cancelled) setState({ key, token, data, error: null })
      })
      .catch((error) => {
        if (!cancelled) setState({ key, token, data: null, error })
      })

    return () => {
      cancelled = true
    }
    // The loader is intentionally excluded: `key` fully describes the request.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, token])

  const reload = useCallback(() => setToken((value) => value + 1), [])
  const sameKey = state.key === key
  const current = sameKey && state.token === token
  const hasData = sameKey && state.data !== null

  return {
    data: sameKey ? state.data : null,
    error: current ? state.error : null,
    loading: !sameKey || (!current && !hasData),
    refreshing: sameKey && !current,
    reload,
  }
}

import { useEffect } from 'react'

export function usePageTitle(title) {
  useEffect(() => {
    document.title = title ? `${title} | BazarBondhu` : 'BazarBondhu - Desher Bazar, Ek Click-e'
  }, [title])
}

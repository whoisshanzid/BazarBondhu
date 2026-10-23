import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import api, { getErrorMessage } from '../services/api.js'
import { useAuth } from './AuthContext.jsx'
import { useToast } from './ToastContext.jsx'

const WishlistContext = createContext(null)
const GUEST_WISHLIST_KEY = 'bb_guest_wishlist'

function readGuestWishlist() {
  try {
    const parsed = JSON.parse(localStorage.getItem(GUEST_WISHLIST_KEY) || '[]')
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function writeGuestWishlist(items) {
  localStorage.setItem(GUEST_WISHLIST_KEY, JSON.stringify(items))
}

export function WishlistProvider({ children }) {
  const { user, loading: authLoading } = useAuth()
  const { addToast } = useToast()
  const [wishlist, setWishlist] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (authLoading) return
    let cancelled = false

    async function syncWishlist() {
      setLoading(true)
      try {
        if (user) {
          const guestItems = readGuestWishlist()
          if (guestItems.length) {
            await api.post('/wishlist/merge', {
              product_ids: guestItems.map((item) => item.id),
            })
            localStorage.removeItem(GUEST_WISHLIST_KEY)
          }
          const { data } = await api.get('/wishlist')
          if (!cancelled) setWishlist(data.wishlist)
        } else if (!cancelled) {
          setWishlist(readGuestWishlist())
        }
      } catch {
        if (!cancelled) setWishlist([])
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    syncWishlist()
    return () => {
      cancelled = true
    }
  }, [user, authLoading])

  const isWishlisted = useCallback(
    (productId) => wishlist.some((item) => item.id === productId),
    [wishlist],
  )

  const toggleWishlist = useCallback(
    async (product) => {
      const exists = wishlist.some((item) => item.id === product.id)
      try {
        if (user) {
          if (exists) {
            const { data } = await api.delete(`/wishlist/${product.id}`)
            setWishlist(data.wishlist)
            addToast('Removed from wishlist.', 'info')
          } else {
            const { data } = await api.post(`/wishlist/${product.id}`)
            setWishlist(data.wishlist)
            addToast('Saved to wishlist.')
          }
        } else {
          const items = readGuestWishlist()
          const next = exists
            ? items.filter((item) => item.id !== product.id)
            : [...items, { ...product, id: product.id }]
          writeGuestWishlist(next)
          setWishlist(next)
          addToast(exists ? 'Removed from wishlist.' : 'Saved to wishlist.', exists ? 'info' : 'success')
        }
      } catch (error) {
        addToast(getErrorMessage(error), 'error')
      }
    },
    [wishlist, user, addToast],
  )

  const removeWishlist = useCallback(
    async (productId) => {
      try {
        if (user) {
          const { data } = await api.delete(`/wishlist/${productId}`)
          setWishlist(data.wishlist)
        } else {
          const next = readGuestWishlist().filter((item) => item.id !== productId)
          writeGuestWishlist(next)
          setWishlist(next)
        }
        addToast('Removed from wishlist.', 'info')
      } catch (error) {
        addToast(getErrorMessage(error), 'error')
      }
    },
    [user, addToast],
  )

  const value = useMemo(
    () => ({ wishlist, loading, isWishlisted, toggleWishlist, removeWishlist }),
    [wishlist, loading, isWishlisted, toggleWishlist, removeWishlist],
  )

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>
}

export function useWishlist() {
  const context = useContext(WishlistContext)
  if (!context) throw new Error('useWishlist must be used inside WishlistProvider')
  return context
}

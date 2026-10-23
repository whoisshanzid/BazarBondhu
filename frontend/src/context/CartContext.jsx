import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import api, { getErrorMessage } from '../services/api.js'
import { useAuth } from './AuthContext.jsx'
import { useToast } from './ToastContext.jsx'

const CartContext = createContext(null)
const GUEST_CART_KEY = 'bb_guest_cart'

function readGuestCart() {
  try {
    const parsed = JSON.parse(localStorage.getItem(GUEST_CART_KEY) || '[]')
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function writeGuestCart(items) {
  localStorage.setItem(GUEST_CART_KEY, JSON.stringify(items))
}

function buildLocalCart(items) {
  let subtotal = 0
  let totalItems = 0
  const shaped = items.map((item) => {
    const effectivePrice = Number(item.discount_price ?? item.price)
    const lineTotal = Number((effectivePrice * item.quantity).toFixed(2))
    subtotal += lineTotal
    totalItems += item.quantity
    return {
      ...item,
      effective_price: effectivePrice,
      line_total: lineTotal,
      is_active: item.is_active !== false,
    }
  })

  return {
    items: shaped,
    total_items: totalItems,
    subtotal: Number(subtotal.toFixed(2)),
  }
}

function productSnapshot(product, quantity) {
  return {
    product_id: product.id,
    quantity,
    name: product.name,
    slug: product.slug,
    brand: product.brand,
    price: product.price,
    discount_price: product.discount_price,
    stock: product.stock,
    is_active: product.is_active !== false,
    primary_image: product.primary_image,
    category_name: product.category_name,
  }
}

export function CartProvider({ children }) {
  const { user, loading: authLoading } = useAuth()
  const { addToast } = useToast()
  const [cart, setCart] = useState({ items: [], total_items: 0, subtotal: 0 })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (authLoading) return
    let cancelled = false

    async function syncCart() {
      setLoading(true)
      try {
        if (user) {
          const guestItems = readGuestCart()
          if (guestItems.length) {
            await api.post('/cart/merge', {
              items: guestItems.map((item) => ({
                product_id: item.product_id,
                quantity: item.quantity,
              })),
            })
            localStorage.removeItem(GUEST_CART_KEY)
          }
          const { data } = await api.get('/cart')
          if (!cancelled) setCart(data.cart)
        } else if (!cancelled) {
          setCart(buildLocalCart(readGuestCart()))
        }
      } catch {
        if (!cancelled) setCart({ items: [], total_items: 0, subtotal: 0 })
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    syncCart()
    return () => {
      cancelled = true
    }
  }, [user, authLoading])

  const refreshCart = useCallback(async () => {
    if (!user) {
      setCart(buildLocalCart(readGuestCart()))
      return
    }
    const { data } = await api.get('/cart')
    setCart(data.cart)
  }, [user])

  const addToCart = useCallback(
    async (product, quantity = 1) => {
      if (!product || product.stock < 1) {
        addToast('This product is currently out of stock.', 'error')
        return false
      }

      try {
        if (user) {
          const { data } = await api.post('/cart/items', {
            product_id: product.id,
            quantity,
          })
          setCart(data.cart)
        } else {
          const items = readGuestCart()
          const existing = items.find((item) => item.product_id === product.id)
          const nextQuantity = (existing?.quantity || 0) + quantity
          if (nextQuantity > product.stock) {
            addToast(`Only ${product.stock} item(s) are available.`, 'error')
            return false
          }
          if (existing) {
            existing.quantity = nextQuantity
          } else {
            items.push(productSnapshot(product, quantity))
          }
          writeGuestCart(items)
          setCart(buildLocalCart(items))
        }
        addToast(`${product.name} added to cart.`)
        return true
      } catch (error) {
        addToast(getErrorMessage(error), 'error')
        return false
      }
    },
    [user, addToast],
  )

  const updateQuantity = useCallback(
    async (productId, quantity) => {
      try {
        if (user) {
          const { data } = await api.patch(`/cart/items/${productId}`, { quantity })
          setCart(data.cart)
        } else {
          let items = readGuestCart()
          if (quantity <= 0) {
            items = items.filter((item) => item.product_id !== productId)
          } else {
            const item = items.find((entry) => entry.product_id === productId)
            if (item && quantity > item.stock) {
              addToast(`Only ${item.stock} item(s) are available.`, 'error')
              return
            }
            items = items.map((entry) =>
              entry.product_id === productId ? { ...entry, quantity } : entry,
            )
          }
          writeGuestCart(items)
          setCart(buildLocalCart(items))
        }
      } catch (error) {
        addToast(getErrorMessage(error), 'error')
      }
    },
    [user, addToast],
  )

  const removeFromCart = useCallback(
    async (productId) => {
      try {
        if (user) {
          const { data } = await api.delete(`/cart/items/${productId}`)
          setCart(data.cart)
        } else {
          const items = readGuestCart().filter((item) => item.product_id !== productId)
          writeGuestCart(items)
          setCart(buildLocalCart(items))
        }
        addToast('Item removed from cart.', 'info')
      } catch (error) {
        addToast(getErrorMessage(error), 'error')
      }
    },
    [user, addToast],
  )

  const clearCart = useCallback(async () => {
    try {
      if (user) {
        const { data } = await api.delete('/cart')
        setCart(data.cart)
      } else {
        writeGuestCart([])
        setCart({ items: [], total_items: 0, subtotal: 0 })
      }
    } catch (error) {
      addToast(getErrorMessage(error), 'error')
    }
  }, [user, addToast])

  const value = useMemo(
    () => ({
      cart,
      loading,
      addToCart,
      updateQuantity,
      removeFromCart,
      clearCart,
      refreshCart,
    }),
    [cart, loading, addToCart, updateQuantity, removeFromCart, clearCart, refreshCart],
  )

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) throw new Error('useCart must be used inside CartProvider')
  return context
}

import { expect, test } from '@playwright/test'

test('home page loads categories and product sections', async ({ page }) => {
  await page.goto('/')

  await expect(page.getByRole('link', { name: 'BazarBondhu home' }).first()).toBeVisible()
  await expect(page.getByRole('heading', { name: 'All Categories' })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Recommended for You' })).toBeVisible()

  const cards = page.locator('a[aria-label^="View "]')
  await expect(cards.first()).toBeVisible()
  expect(await cards.count()).toBeGreaterThan(3)
})

test('search, product detail and guest cart work end to end', async ({ page }) => {
  await page.goto('/')

  const search = page.getByPlaceholder('Search in BazarBondhu...').first()
  await search.fill('nexora')
  await search.press('Enter')

  await expect(page).toHaveURL(/\/products\?q=nexora/)
  await expect(page.getByRole('heading', { name: /Search results for/i })).toBeVisible()
  await expect(page.getByText(/result/i).first()).toBeVisible()

  const firstCard = page.locator('a[aria-label^="View "]').first()
  const productName = (await firstCard.getAttribute('aria-label')).replace('View ', '')
  await firstCard.click()

  await expect(page).toHaveURL(/\/product\//)
  await expect(page.getByRole('heading', { name: productName })).toBeVisible()

  await page.getByRole('button', { name: 'Add to Cart' }).click()
  await expect(page.getByText(`${productName} added to cart.`)).toBeVisible()

  await page.getByLabel(/Shopping cart with/).click()
  await expect(page).toHaveURL(/\/cart/)
  await expect(page.getByRole('heading', { name: /Shopping Cart/ })).toBeVisible()
  await expect(page.getByText(productName).first()).toBeVisible()
})

test('customer demo login opens account orders', async ({ page }) => {
  await page.goto('/login')

  await page.getByRole('button', { name: 'Use customer demo' }).click()
  await page.getByRole('button', { name: 'Login', exact: true }).click()

  await expect(page).toHaveURL('/')
  await expect(page.getByLabel('My account')).toBeVisible()

  await page.goto('/account?tab=orders')
  await expect(page.getByRole('heading', { name: 'My orders' })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Ayesha Rahman' })).toBeVisible()
})

test('logged-in customer can open checkout with a filled cart', async ({ page }) => {
  await page.goto('/login')
  await page.getByRole('button', { name: 'Use customer demo' }).click()
  await page.getByRole('button', { name: 'Login', exact: true }).click()
  await expect(page).toHaveURL('/')

  const listResponse = await page.request.get('/api/products?limit=1')
  const { products } = await listResponse.json()
  await page.request.post('/api/cart/items', { data: { product_id: products[0].id, quantity: 1 } })

  await page.goto('/checkout')
  await expect(page.getByRole('heading', { name: 'Checkout' })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Delivery address' })).toBeVisible()
  await expect(page.getByRole('button', { name: /Place order/ })).toBeVisible()

  await page.request.delete('/api/cart')
})

test('admin demo login can open dashboard and product management', async ({ page }) => {
  await page.goto('/login')

  await page.getByRole('button', { name: 'Use admin demo' }).click()
  await page.getByRole('button', { name: 'Login', exact: true }).click()

  await expect(page).toHaveURL('/')
  await expect(page.getByLabel('My account')).toBeVisible()

  await page.goto('/admin')
  await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible()
  await expect(page.getByText('Total revenue')).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Recent orders' })).toBeVisible()

  await page.goto('/admin/products')
  await expect(page.getByRole('heading', { name: 'Products', exact: true })).toBeVisible()
  await expect(page.locator('table')).toBeVisible()
})

test('mobile layout exposes and closes the navigation drawer', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/')

  await page.getByRole('button', { name: 'Open menu' }).click()
  const menu = page.getByRole('dialog', { name: 'Menu' })
  await expect(menu).toBeVisible()
  await expect(menu.getByRole('link', { name: 'Help center' })).toBeVisible()

  await menu.getByRole('button', { name: 'Close menu' }).last().click()
  await expect(menu).toBeHidden()
})

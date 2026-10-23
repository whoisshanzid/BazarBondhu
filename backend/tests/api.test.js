import assert from 'node:assert/strict'
import { after, before, test } from 'node:test'
import request from 'supertest'
import app from '../src/app.js'
import { pool } from '../src/config/db.js'

const unique = Date.now()
const customer = {
  name: 'API Test Shopper',
  email: `api-test-${unique}@bazarbondhu.test`,
  phone: '+8801700000999',
  password: 'TestPass12345',
}

const agent = request.agent(app)
const adminAgent = request.agent(app)
let product
let order

before(async () => {
  const [products] = await pool.query(
    'SELECT id, slug, name, stock FROM products WHERE is_active = 1 AND stock > 2 ORDER BY id LIMIT 1',
  )
  assert.ok(products.length, 'Seed the database with npm run db:setup before running API tests.')
  product = products[0]
})

after(async () => {
  if (order?.id) {
    await pool.query('DELETE FROM orders WHERE id = ?', [order.id])
  }
  await pool.query('DELETE FROM users WHERE email = ?', [customer.email])
  await pool.end()
})

test('health endpoint responds', async () => {
  const response = await request(app).get('/api/health').expect(200)
  assert.equal(response.body.status, 'ok')
})

test('catalog exposes categories and products', async () => {
  const categories = await request(app).get('/api/categories').expect(200)
  assert.ok(categories.body.categories.length > 0)

  const list = await request(app).get('/api/products?limit=4').expect(200)
  assert.ok(Array.isArray(list.body.products))
  assert.equal(list.body.products.length, 4)

  const detail = await request(app).get(`/api/products/${product.slug}`).expect(200)
  assert.equal(detail.body.product.id, product.id)
  assert.ok(Array.isArray(detail.body.product.reviews))
})

test('rejects invalid login and unauthenticated cart access', async () => {
  await request(app)
    .post('/api/auth/login')
    .send({ email: customer.email, password: 'WrongPass12345' })
    .expect(401)

  await request(app).get('/api/cart').expect(401)
})

test('registers, manages cart and places an order', async () => {
  const registered = await agent.post('/api/auth/register').send(customer).expect(201)
  assert.equal(registered.body.user.email, customer.email)

  const me = await agent.get('/api/auth/me').expect(200)
  assert.equal(me.body.user.name, customer.name)

  const added = await agent
    .post('/api/cart/items')
    .send({ product_id: product.id, quantity: 2 })
    .expect(201)
  assert.equal(added.body.cart.items.length, 1)
  assert.equal(added.body.cart.items[0].quantity, 2)

  const placed = await agent
    .post('/api/orders')
    .send({
      payment_method: 'cod',
      accepted: true,
      save_address: true,
      shipping: {
        recipient_name: customer.name,
        phone: customer.phone,
        address_line: 'House 12, Road 5, Dhanmondi',
        area: 'Dhanmondi',
        city: 'Dhaka',
        postal_code: '1205',
      },
    })
    .expect(201)

  order = placed.body.order
  assert.equal(order.status, 'pending')
  assert.ok(Number(order.total) > 0)
  assert.equal(order.items.length, 1)

  const addresses = await agent.get('/api/users/addresses').expect(200)
  assert.ok(addresses.body.addresses.length >= 1)

  const fetched = await agent.get(`/api/orders/${order.id}`).expect(200)
  assert.equal(fetched.body.order.id, order.id)

  const cancelled = await agent.patch(`/api/orders/${order.id}/cancel`).expect(200)
  assert.equal(cancelled.body.order.status, 'cancelled')
})

test('customer can review a product but cannot reach admin APIs', async () => {
  const review = await agent
    .post(`/api/products/${product.id}/reviews`)
    .send({ rating: 5, comment: 'Fast delivery and the product matched the description.' })
    .expect(201)
  assert.equal(review.body.review.rating, 5)

  await agent.get('/api/admin/stats').expect(403)
})

test('admin can read dashboard data', async () => {
  await adminAgent
    .post('/api/auth/login')
    .send({ email: 'admin@bazarbondhu.test', password: 'Admin@12345' })
    .expect(200)

  const stats = await adminAgent.get('/api/admin/stats').expect(200)
  assert.ok(stats.body.stats)

  const orders = await adminAgent.get('/api/admin/orders?limit=5').expect(200)
  assert.ok(Array.isArray(orders.body.orders))
})

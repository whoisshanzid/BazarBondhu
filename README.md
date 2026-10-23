# BazarBondhu

BazarBondhu is a full-stack, Bangladesh-inspired marketplace ("Desher bazar, ek click-e") built for a local shopping experience. It includes a responsive React storefront, a MySQL-backed Express API, cookie-based authentication, cart and checkout flows, product reviews, and a server-protected admin dashboard.

All branding, copy, product names and imagery are original SVG assets created for this project. It is a demo and is not affiliated with any existing retailer.

## Tech stack

- **Frontend:** React 19, Vite, React Router, Tailwind CSS, Axios, Lucide icons
- **Backend:** Node.js, Express 5, MySQL (`mysql2`), JWT + bcrypt, express-validator
- **Tests:** Node's built-in test runner with Supertest, Playwright

## Features

**Storefront**
- Home page with categories, hero carousel, flash sale countdown, featured and new arrivals
- Catalog search, category filters (price, rating, stock, discounts), sorting and pagination
- Product detail pages with image gallery, quantity picker, wishlist and reviews
- Guest cart and wishlist stored in `localStorage`, merged into the account on login
- Checkout with saved/new address, delivery estimate, order notes and Cash on Delivery or clearly-labelled mock wallet payment
- Order confirmation, order history and cancellation; account profile, addresses and password management
- Informational pages (help, terms, privacy, sell, app), responsive navigation and a mobile drawer

**Admin**
- Dashboard with revenue, order, customer, stock and monthly sales summaries
- Product management with create/edit, image upload or URL images, visibility toggle and deletion
- Category management, customer overview, order list and order status updates
- All admin routes are protected on the server with `requireAdmin`, not only in the UI

## Quick start

### Prerequisites

- Node.js 22+
- MySQL 8+ running locally
- npm 10+

### 1. Install dependencies

```bash
npm install
```

### 2. Create the database and user

```bash
mysql -u root -e "CREATE DATABASE bazarbondhu CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
mysql -u root -e "CREATE USER 'bazarbondhu'@'localhost' IDENTIFIED BY 'your_password';"
mysql -u root -e "GRANT ALL PRIVILEGES ON bazarbondhu.* TO 'bazarbondhu'@'localhost'; FLUSH PRIVILEGES;"
```

### 3. Configure the environment

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

Set `DB_PASSWORD` in `backend/.env` to the password you chose above, and generate a real `JWT_SECRET` with `openssl rand -hex 32`.

### 4. Create the schema and seed demo data

```bash
npm run db:setup
```

This applies `backend/database/schema.sql` and `backend/database/seed.sql` (10 categories, 40 products, reviews, wishlists and sample orders). Running it again resets the catalog data.

### 5. Start the app

```bash
npm run dev
```

- Storefront: http://localhost:5173
- API health check: http://localhost:4000/api/health

Vite proxies `/api` and `/uploads` to the backend, so no CORS configuration is needed in development.

## Demo accounts

| Role | Email | Password |
| --- | --- | --- |
| Customer | `customer@bazarbondhu.test` | `Customer@12345` |
| Admin | `admin@bazarbondhu.test` | `Admin@12345` |

The login page fills these credentials for you in local development. Production builds only show the customer demo button; the seeded admin account still exists, so rotate its password before going live.

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Runs the API and Vite dev server together |
| `npm run dev:backend` / `npm run dev:frontend` | Runs one side only |
| `npm run build` | Production build of the frontend |
| `npm start` | Starts the API and serves the built frontend (production) |
| `npm run lint` | ESLint for the frontend |
| `npm run db:setup` | Resets and seeds the MySQL database |
| `npm run admin:set-password` | Rotates an admin password from `ADMIN_EMAIL` / `ADMIN_PASSWORD` |
| `npm run test:api` | Supertest integration tests against the API |
| `npm run test:e2e` | Playwright browser tests (starts servers if needed) |
| `npm test` | Runs API and browser tests |

Install the Playwright browser once before running browser tests:

```bash
npx playwright install chromium
```

## Project structure

```
backend/
  database/        schema.sql, seed.sql and setup script
  src/
    config/        MySQL pool and transaction helper
    controllers/   route handlers (auth, catalog, cart, orders, admin...)
    middleware/    auth, validation, uploads, errors
    routes/        REST route definitions
    services/      product shaping and shared queries
  tests/           Supertest API tests
frontend/
  e2e/             Playwright specs
  public/images/   Original SVG product, category and banner artwork
  src/
    components/    shared UI (header, cards, forms, admin tables...)
    context/       Auth, Cart, Wishlist and Toast providers
    hooks/         useAsyncData, countdown, debounce, page title...
    pages/         storefront and admin screens
    services/      Axios API clients
    utils/         currency, dates and shipping helpers
```

## API overview

All endpoints are prefixed with `/api`. Authentication uses an HTTP-only JWT cookie.

| Area | Endpoints |
| --- | --- |
| Auth | `POST /auth/register`, `POST /auth/login`, `POST /auth/logout`, `GET /auth/me`, `PUT /auth/password` |
| Catalog | `GET /products`, `GET /products/:slug`, `GET /categories`, `POST /products/:id/reviews` |
| Cart | `GET /cart`, `POST /cart/items`, `PATCH /cart/items/:id`, `DELETE /cart/items/:id`, `DELETE /cart`, `POST /cart/merge` |
| Wishlist | `GET /wishlist`, `POST /wishlist/:productId`, `DELETE /wishlist/:productId`, `POST /wishlist/merge` |
| Account | `PUT /users/profile`, CRUD for `/users/addresses` |
| Orders | `GET /orders`, `POST /orders`, `GET /orders/:id`, `PATCH /orders/:id/cancel` |
| Admin | `/admin/stats`, `/admin/products`, `/admin/categories`, `/admin/customers`, `/admin/orders`, `/admin/uploads` |

### Business rules

- Shipping: ৳60 inside Dhaka, ৳120 elsewhere, free when the subtotal is ৳5,000 or more.
- Payment: `cod` (Cash on Delivery) or `mock_wallet`. The wallet option is a demo only and does not process real money.
- Orders can be cancelled by the customer while their status is still `pending` or `confirmed`; an admin can update statuses from the dashboard.

## Testing notes

- `npm run test:api` expects a seeded database. The tests create a temporary customer, exercise cart/checkout/order/review flows and remove the test data afterwards.
- `npm run test:e2e` covers the home page, search, product detail, guest cart, customer and admin login, checkout rendering and the mobile menu. It reuses running dev servers when available. Set `PLAYWRIGHT_BASE_URL=https://your-app.onrender.com` to point it at a deployment; the admin test needs the dev-only demo button, so verify production admin login manually after rotating credentials.
- The production build currently ships as one bundle (~526 kB) with a Vite chunk-size warning; route-level code splitting is a possible follow-up.

## Free deployment (Render + Aiven)

The recommended zero-cost setup serves the API and the built frontend from one Render web service, backed by a free Aiven MySQL database. Single-origin hosting keeps the auth cookie same-site and avoids CORS and `/uploads` path problems.

### 1. Create the free MySQL database

1. Create an Aiven account and a **MySQL** service on the free plan.
2. Copy the host, port, user, password and database name (`defaultdb` by default).
3. Download the service CA certificate (`ca.pem`).
4. Encode the certificate for the `DB_SSL_CA_BASE64` environment variable:

```bash
base64 -i ca.pem | tr -d '\n'
```

Aiven's free database may power off after long inactivity; the first request after that can take a little longer.

### 2. Push the project to GitHub

Render deploys from a Git repository:

```bash
git init
git add .
git commit -m "Prepare BazarBondhu for deployment"
git branch -M main
git remote add origin https://github.com/YOUR_NAME/bazarbondhu.git
git push -u origin main
```

### 3. Create the Render web service

In Render, create a **Web Service** from the repository, or use the included `render.yaml` blueprint.

- **Runtime:** Node
- **Plan:** Free
- **Build command:** `npm ci --include=dev && npm run build -w frontend`
- **Start command:** `npm run start -w backend`
- **Health check path:** `/api/health`

Set these environment variables:

| Variable | Value |
| --- | --- |
| `NODE_ENV` | `production` |
| `NODE_VERSION` | `22` |
| `JWT_SECRET` | Output of `openssl rand -hex 32` |
| `CLIENT_URL` | Your Render URL, e.g. `https://bazarbondhu.onrender.com` |
| `DB_HOST` / `DB_PORT` | Aiven connection details |
| `DB_USER` / `DB_PASSWORD` | Aiven credentials |
| `DB_NAME` | Aiven database name (`defaultdb`) |
| `DB_SSL` | `true` |
| `DB_SSL_CA_BASE64` | Base64 CA certificate from step 1 |
| `DB_SSL_REJECT_UNAUTHORIZED` | `true` |

`CLIENT_URL` accepts a comma-separated list. After the first deploy, update it to the actual `onrender.com` URL and redeploy if needed.

### 4. Seed the database once

Run this locally with the Aiven values. **`db:setup` drops and recreates tables**, so only run it against the fresh database.

```bash
DB_HOST=... DB_PORT=... DB_USER=... DB_PASSWORD=... DB_NAME=defaultdb \
DB_SSL=true DB_SSL_CA_BASE64="$(base64 -i ca.pem | tr -d '\n')" \
npm run db:setup
```

### 5. Rotate the admin password

The seed contains a public admin password. Replace it before sharing the URL:

```bash
DB_HOST=... DB_PORT=... DB_USER=... DB_PASSWORD=... DB_NAME=defaultdb \
DB_SSL=true DB_SSL_CA_BASE64="$(base64 -i ca.pem | tr -d '\n')" \
ADMIN_EMAIL=admin@bazarbondhu.test ADMIN_PASSWORD='ChooseAStrongPassword123' \
npm run admin:set-password
```

The customer demo account and its data remain available. The production login page hides the admin demo button.

### 6. Verify

- `https://YOUR_APP.onrender.com/api/health` returns `{"status":"ok"}`
- Storefront loads and product images display
- Customer login persists after refresh, cart and checkout work
- Admin login works with the rotated password
- Refresh a deep link such as `/products` or `/admin/orders` and confirm it does not 404

### Free-tier caveats

- The Render service sleeps after about 15 minutes of inactivity. An uptime pinger can keep it warm.
- Render's filesystem is ephemeral, so **uploaded** product images disappear on restart. Prefer pasting image URLs in the admin product form, or add a Cloudinary-style image host later.
- Aiven's free plan has a 1 GB storage limit and may suspend idle services.

## Limitations

This is a demonstration project. It intentionally omits real payment processing, email/SMS delivery, seller accounts and production-grade media storage. Uploaded images use the local filesystem (or `UPLOAD_DIR`) and require a persistent volume to survive restarts.

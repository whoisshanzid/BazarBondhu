import { useLocation } from 'react-router-dom'
import { ArrowRight, HelpCircle, Mail, ShieldCheck } from 'lucide-react'
import { Link } from 'react-router-dom'
import { usePageTitle } from '../hooks/usePageTitle.js'

const pages = {
  '/help': {
    eyebrow: 'Customer support',
    title: 'How can we help?',
    description: 'Answers to common questions about ordering, delivery and returns.',
    sections: [
      {
        title: 'Placing an order',
        body: 'Browse a category or use search, choose an available product, and add it to your cart. At checkout, select a saved delivery address or add a new one, choose Cash on Delivery or the demo wallet, then place your order.',
      },
      {
        title: 'Delivery charges and timing',
        body: 'Delivery is ৳60 inside Dhaka and ৳120 outside Dhaka. Orders of ৳5,000 or more ship free. Most orders arrive within 2-5 business days after confirmation.',
      },
      {
        title: 'Cancellations and returns',
        body: 'You can cancel a pending or confirmed order from its order details page. Once an order has shipped, please contact support. This demo includes a 7-day return policy for eligible unused items.',
      },
      {
        title: 'Payments',
        body: 'Cash on Delivery is available nationwide. The BazarBondhu Wallet option is a local demo that confirms orders instantly and never charges real money.',
      },
    ],
    faqs: [
      ['Do I need an account to order?', 'You can add items to a guest cart and wishlist, but you need an account to check out and track orders.'],
      ['Can I change my delivery address after ordering?', 'Contact support as soon as possible. Once an order is processing, the address can no longer be changed.'],
      ['How do I track my order?', 'Open My Account, then My Orders, and select an order to see its current status and delivery details.'],
    ],
  },
  '/terms': {
    eyebrow: 'Legal',
    title: 'Terms & Conditions',
    description: 'The rules for using the BazarBondhu demo marketplace.',
    sections: [
      {
        title: 'Using this site',
        body: 'BazarBondhu is a locally built demonstration marketplace. You agree to use it lawfully, provide accurate account and delivery information, and not attempt to disrupt or misuse the service.',
      },
      {
        title: 'Accounts',
        body: 'You are responsible for keeping your password private and for activity under your account. Notify support immediately if you believe your account has been compromised.',
      },
      {
        title: 'Products and pricing',
        body: 'Product information, pricing and stock are managed by the demo administration panel and may change without notice. Prices are shown in Bangladeshi Taka (৳).',
      },
      {
        title: 'Orders and payment',
        body: 'Submitting an order creates a purchase request. Cash on Delivery orders are unpaid until delivery. The mock wallet is a demonstration only and does not process real payments.',
      },
      {
        title: 'Limitation',
        body: 'This site is provided for demonstration and educational purposes without warranties. Do not use it to transmit sensitive personal or financial information.',
      },
    ],
  },
  '/privacy': {
    eyebrow: 'Legal',
    title: 'Privacy Policy',
    description: 'How BazarBondhu handles the information you provide.',
    sections: [
      {
        title: 'Information we collect',
        body: 'We store the name, email, optional phone number, hashed password, delivery addresses and order history needed to operate your account. Passwords are hashed with bcrypt and are never stored in plain text.',
      },
      {
        title: 'How information is used',
        body: 'Your information is used to authenticate you, fulfil orders, display order history and improve the shopping experience. It is not sold to third parties.',
      },
      {
        title: 'Cookies and sessions',
        body: 'Login uses a secure HTTP-only cookie containing a signed session token. Guest cart and wishlist data is stored locally in your browser until you log in and merge it.',
      },
      {
        title: 'Your choices',
        body: 'You can update your profile and remove saved addresses from your account. This local demo keeps data in its own MySQL database and does not connect to external marketing services.',
      },
    ],
  },
  '/sell': {
    eyebrow: 'For sellers',
    title: 'Sell on BazarBondhu',
    description: 'Bring your products to customers across Bangladesh.',
    sections: [
      {
        title: 'A marketplace built for local businesses',
        body: 'BazarBondhu is designed to connect verified sellers with shoppers nationwide. Sellers get product management, stock control, order tracking and clear delivery workflows.',
      },
      {
        title: 'How onboarding works',
        body: 'Seller applications are reviewed before a shop is created. Share your business name, product category and contact details with our team to begin the conversation.',
      },
      {
        title: 'What you will need',
        body: 'A valid business identity, accurate product information, realistic stock levels and a reliable dispatch process. Product images and descriptions should match what customers receive.',
      },
      {
        title: 'Demo status',
        body: 'Seller self-registration is not part of this local demo yet. The admin workspace manages catalog and orders on behalf of the store.',
      },
    ],
  },
  '/app': {
    eyebrow: 'BazarBondhu app',
    title: 'Shopping that fits in your pocket',
    description: 'The same BazarBondhu experience, designed for every screen.',
    sections: [
      {
        title: 'Responsive by design',
        body: 'This storefront adapts from wide desktop screens down to small phones, with a mobile menu, compact product cards and a checkout built for touch.',
      },
      {
        title: 'Faster repeat orders',
        body: 'Save addresses, keep a synced wishlist and reorder everyday essentials from your order history using a single account.',
      },
      {
        title: 'Stay informed',
        body: 'Order status updates, stock availability and delivery details are available from your account whenever you need them.',
      },
      {
        title: 'Demo note',
        body: 'A native mobile application and app-store download are not included in this local build. Use the responsive website on any device.',
      },
    ],
  },
}

export default function InfoPage() {
  const { pathname } = useLocation()
  const page = pages[pathname] || pages['/help']
  usePageTitle(page.title)

  return (
    <div className="bg-slate-50">
      <section className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-12 text-white sm:py-16">
        <div className="container-page max-w-3xl">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand-400">{page.eyebrow}</p>
          <h1 className="mt-3 text-3xl font-extrabold sm:text-4xl">{page.title}</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300 sm:text-base">{page.description}</p>
        </div>
      </section>

      <div className="container-page max-w-4xl py-8 sm:py-10">
        <div className="space-y-4">
          {page.sections.map((section) => (
            <section key={section.title} className="rounded-xl border border-slate-100 bg-white p-5 shadow-sm sm:p-6">
              <h2 className="text-base font-bold text-slate-900">{section.title}</h2>
              <p className="mt-2 text-sm leading-7 text-slate-600">{section.body}</p>
            </section>
          ))}
        </div>

        {page.faqs && (
          <section className="mt-6">
            <h2 className="flex items-center gap-2 text-lg font-bold text-slate-900">
              <HelpCircle className="h-5 w-5 text-brand-500" /> Frequently asked questions
            </h2>
            <div className="mt-3 space-y-2">
              {page.faqs.map(([question, answer]) => (
                <details key={question} className="group rounded-lg border border-slate-100 bg-white p-4 shadow-sm">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-sm font-semibold text-slate-800">
                    {question}
                    <span className="text-slate-400 transition group-open:rotate-90">
                      <ArrowRight className="h-4 w-4" />
                    </span>
                  </summary>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{answer}</p>
                </details>
              ))}
            </div>
          </section>
        )}

        <section className="mt-6 flex flex-col items-start justify-between gap-4 rounded-xl border border-brand-100 bg-brand-50 p-5 sm:flex-row sm:items-center sm:p-6">
          <div className="flex items-start gap-3">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-white text-brand-600 shadow-sm">
              <Mail className="h-5 w-5" />
            </span>
            <div>
              <p className="font-bold text-brand-900">Still need a hand?</p>
              <p className="mt-0.5 text-sm text-brand-800">Email support@bazarbondhu.test for this local demo.</p>
            </div>
          </div>
          <Link to="/products" className="btn-primary shrink-0">Continue shopping</Link>
        </section>

        <p className="mt-6 flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
          <ShieldCheck className="h-3.5 w-3.5" /> BazarBondhu demo policies · Local development build
        </p>
      </div>
    </div>
  )
}

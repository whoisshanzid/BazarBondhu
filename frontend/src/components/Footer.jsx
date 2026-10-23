import { Facebook, Instagram, Mail, MapPin, Phone, Youtube } from 'lucide-react'
import { Link } from 'react-router-dom'
import Logo from './Logo.jsx'

const columns = [
  {
    title: 'Customer Service',
    links: [
      { label: 'Help Center', to: '/help' },
      { label: 'Track Your Order', to: '/account?tab=orders' },
      { label: 'Returns & Refunds', to: '/returns' },
      { label: 'Shipping Information', to: '/shipping' },
      { label: 'Contact Us', to: '/contact' },
    ],
  },
  {
    title: 'About BazarBondhu',
    links: [
      { label: 'About Us', to: '/about' },
      { label: 'Sell on BazarBondhu', to: '/sell' },
      { label: 'Careers', to: '/careers' },
      { label: 'Privacy Policy', to: '/privacy' },
      { label: 'Terms & Conditions', to: '/terms' },
    ],
  },
  {
    title: 'Shop With Confidence',
    links: [
      { label: 'Cash on Delivery', to: '/shipping' },
      { label: 'Buyer Protection', to: '/help' },
      { label: 'Download Our App', to: '/app' },
      { label: 'Delivery Areas', to: '/shipping' },
    ],
  },
]

export default function Footer() {
  return (
    <footer className="mt-12 border-t border-slate-200 bg-slate-900 text-slate-300">
      <div className="container-page grid gap-8 py-10 sm:grid-cols-2 lg:grid-cols-5">
        <div className="lg:col-span-2">
          <Logo light />
          <p className="mt-4 max-w-sm text-sm leading-6 text-slate-400">
            A homegrown marketplace connecting shoppers across Bangladesh with trusted sellers,
            everyday essentials and fast local delivery.
          </p>
          <div className="mt-5 space-y-2 text-sm text-slate-400">
            <p className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-brand-400" /> Dhaka, Bangladesh
            </p>
            <p className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-brand-400" /> +880 9600 000 000
            </p>
            <p className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-brand-400" /> support@bazarbondhu.test
            </p>
          </div>
          <div className="mt-5 flex items-center gap-2">
            {[
              { icon: Facebook, label: 'Facebook', href: 'https://www.facebook.com/' },
              { icon: Instagram, label: 'Instagram', href: 'https://www.instagram.com/' },
              { icon: Youtube, label: 'YouTube', href: 'https://www.youtube.com/' },
            ].map(({ icon: Icon, label, href }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noreferrer"
                className="grid h-9 w-9 place-items-center rounded-lg bg-slate-800 text-slate-400 transition hover:bg-brand-500 hover:text-white"
                aria-label={label}
              >
                <Icon className="h-4 w-4" />
              </a>
            ))}
          </div>
        </div>

        {columns.map((column) => (
          <div key={column.title}>
            <h2 className="text-sm font-bold text-white">{column.title}</h2>
            <ul className="mt-4 space-y-2.5">
              {column.links.map((link) => (
                <li key={link.label}>
                  <Link to={link.to} className="text-sm text-slate-400 transition hover:text-brand-300">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="border-t border-slate-800">
        <div className="container-page flex flex-col gap-4 py-5 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-slate-500">
            &copy; {new Date().getFullYear()} BazarBondhu. Original demo marketplace. Not affiliated
            with any existing retailer.
          </p>
          <div className="flex flex-wrap items-center gap-2 text-[11px] font-semibold text-slate-400">
            <span className="mr-1">We accept:</span>
            <span className="rounded border border-slate-700 bg-slate-800 px-2 py-1">Cash on Delivery</span>
            <span className="rounded border border-slate-700 bg-slate-800 px-2 py-1">bKash (demo)</span>
            <span className="rounded border border-slate-700 bg-slate-800 px-2 py-1">Card (demo)</span>
          </div>
        </div>
      </div>
    </footer>
  )
}

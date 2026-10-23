import { BadgeCheck, Headphones, ShieldCheck, Truck } from 'lucide-react'
import Logo from './Logo.jsx'

const benefits = [
  { icon: Truck, title: 'Nationwide delivery', text: 'Fast dispatch to all 64 districts.' },
  { icon: ShieldCheck, title: 'Secure account', text: 'Your details stay private and protected.' },
  { icon: BadgeCheck, title: 'Buyer protection', text: 'Shop original products with confidence.' },
  { icon: Headphones, title: 'Local support', text: 'Friendly help in Bangla and English.' },
]

export default function AuthSplit({ title, subtitle, children, footer }) {
  return (
    <div className="grid min-h-[calc(100vh-68px)] bg-white lg:grid-cols-[1.05fr_1fr]">
      <aside className="relative hidden overflow-hidden bg-gradient-to-br from-brand-600 via-brand-500 to-orange-400 p-10 text-white lg:flex lg:flex-col lg:justify-between xl:p-14">
        <div className="absolute -right-24 -top-24 h-80 w-80 rounded-full bg-white/10" />
        <div className="absolute -bottom-36 -left-20 h-96 w-96 rounded-full bg-slate-900/10" />
        <div className="relative">
          <Logo light />
          <p className="mt-12 max-w-md text-3xl font-extrabold leading-tight xl:text-4xl">
            Everyday shopping, made simpler for Bangladesh.
          </p>
          <p className="mt-4 max-w-md text-sm leading-6 text-white/75">
            From your weekly groceries to the latest tech, BazarBondhu brings trusted sellers and
            dependable delivery together in one place.
          </p>
        </div>
        <div className="relative mt-10 grid gap-3 sm:grid-cols-2">
          {benefits.map(({ icon: Icon, title: benefitTitle, text }) => (
            <div key={benefitTitle} className="rounded-xl border border-white/15 bg-white/10 p-4 backdrop-blur-sm">
              <Icon className="h-5 w-5 text-brand-100" />
              <p className="mt-2 text-sm font-bold">{benefitTitle}</p>
              <p className="mt-0.5 text-[11px] leading-4 text-white/70">{text}</p>
            </div>
          ))}
        </div>
      </aside>

      <main className="flex items-center justify-center px-4 py-10 sm:px-8 lg:px-12">
        <div className="w-full max-w-md">
          <div className="mb-8 lg:hidden">
            <Logo />
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 sm:text-3xl">{title}</h1>
          {subtitle && <p className="mt-2 text-sm leading-6 text-slate-500">{subtitle}</p>}
          <div className="mt-7">{children}</div>
          {footer && <div className="mt-6 text-center text-sm text-slate-500">{footer}</div>}
        </div>
      </main>
    </div>
  )
}

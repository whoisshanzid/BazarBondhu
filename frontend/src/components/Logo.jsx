import { Link } from 'react-router-dom'

export default function Logo({ light = false, compact = false, className = '' }) {
  return (
    <Link
      to="/"
      className={`group inline-flex items-center gap-2.5 ${className}`}
      aria-label="BazarBondhu home"
    >
      <span
        className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl transition group-hover:rotate-3 ${
          light ? 'bg-white text-brand-600' : 'bg-brand-500 text-white'
        }`}
      >
        <svg viewBox="0 0 32 32" className="h-6 w-6" fill="none" aria-hidden="true">
          <path
            d="M7.5 11h17l-1.7 14a2 2 0 0 1-2 1.8H11.2a2 2 0 0 1-2-1.8L7.5 11Z"
            fill="currentColor"
            opacity=".22"
          />
          <path
            d="M11 11V9a5 5 0 0 1 10 0v2M6.9 11h18.2l-1.8 15H8.7L6.9 11Z"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
      <span className="leading-none">
        <span
          className={`block text-xl font-extrabold tracking-tight ${light ? 'text-white' : 'text-slate-900'}`}
        >
          Bazar<span className={light ? 'text-brand-200' : 'text-brand-500'}>Bondhu</span>
        </span>
        {!compact && (
          <span
            className={`mt-1 block text-[10px] font-medium tracking-[0.16em] ${
              light ? 'text-slate-400' : 'text-slate-500'
            }`}
          >
            DESHER BAZAR, EK CLICK-E
          </span>
        )}
      </span>
    </Link>
  )
}

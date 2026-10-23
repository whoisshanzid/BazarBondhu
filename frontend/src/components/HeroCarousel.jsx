import { useEffect, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Link } from 'react-router-dom'

const slides = [
  {
    image: '/images/banners/banner-1.svg',
    alt: 'Eid shopping sale with up to 45 percent off',
    to: '/products?sort=discount',
  },
  {
    image: '/images/banners/banner-2.svg',
    alt: 'Home essentials and appliances promotion',
    to: '/products?category=appliances',
  },
  {
    image: '/images/banners/banner-3.svg',
    alt: 'New season fashion collection',
    to: '/products?category=fashion',
  },
]

export default function HeroCarousel() {
  const [active, setActive] = useState(0)

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActive((current) => (current + 1) % slides.length)
    }, 5500)
    return () => window.clearInterval(timer)
  }, [])

  function goPrevious() {
    setActive((current) => (current - 1 + slides.length) % slides.length)
  }

  function goNext() {
    setActive((current) => (current + 1) % slides.length)
  }

  return (
    <section className="group relative overflow-hidden rounded-xl bg-slate-100 shadow-sm" aria-roledescription="carousel" aria-label="Featured promotions">
      <div className="relative aspect-[1200/520] sm:aspect-[1200/430]">
        {slides.map((slide, index) => (
          <Link
            key={slide.image}
            to={slide.to}
            className={`absolute inset-0 transition-opacity duration-500 ${
              index === active ? 'z-10 opacity-100' : 'pointer-events-none opacity-0'
            }`}
            aria-hidden={index !== active}
            tabIndex={index === active ? 0 : -1}
          >
            <img
              src={slide.image}
              alt={slide.alt}
              className="h-full w-full object-cover"
              loading={index === 0 ? 'eager' : 'lazy'}
            />
          </Link>
        ))}
      </div>

      <button
        type="button"
        onClick={goPrevious}
        className="absolute left-2 top-1/2 z-20 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-full bg-white/80 text-slate-700 opacity-0 shadow transition hover:bg-white group-hover:opacity-100 focus:opacity-100 sm:left-3 sm:h-9 sm:w-9"
        aria-label="Previous slide"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>
      <button
        type="button"
        onClick={goNext}
        className="absolute right-2 top-1/2 z-20 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-full bg-white/80 text-slate-700 opacity-0 shadow transition hover:bg-white group-hover:opacity-100 focus:opacity-100 sm:right-3 sm:h-9 sm:w-9"
        aria-label="Next slide"
      >
        <ChevronRight className="h-5 w-5" />
      </button>

      <div className="absolute bottom-2.5 left-1/2 z-20 flex -translate-x-1/2 gap-1.5 sm:bottom-3">
        {slides.map((slide, index) => (
          <button
            key={slide.image}
            type="button"
            onClick={() => setActive(index)}
            className={`h-1.5 rounded-full transition-all ${
              index === active ? 'w-6 bg-white' : 'w-2 bg-white/55 hover:bg-white/80'
            }`}
            aria-label={`Go to slide ${index + 1}`}
            aria-current={index === active}
          />
        ))}
      </div>
    </section>
  )
}

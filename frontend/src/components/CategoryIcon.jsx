import {
  Baby,
  BookOpen,
  Dumbbell,
  Laptop,
  Package,
  Shirt,
  ShoppingBasket,
  Smartphone,
  Sofa,
  Sparkles,
  WashingMachine,
} from 'lucide-react'

const icons = {
  Smartphone,
  Laptop,
  Shirt,
  Sofa,
  WashingMachine,
  ShoppingBasket,
  Sparkles,
  Dumbbell,
  Baby,
  BookOpen,
  Package,
}

export default function CategoryIcon({ name, className = 'h-5 w-5' }) {
  const Icon = icons[name] || Package
  return <Icon className={className} aria-hidden="true" />
}

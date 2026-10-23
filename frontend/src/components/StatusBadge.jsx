import { orderStatusStyles } from '../utils/format.js'

export default function StatusBadge({ status }) {
  return (
    <span
      className={`badge border capitalize ${orderStatusStyles[status] || 'border-slate-200 bg-slate-50 text-slate-600'}`}
    >
      {status?.replaceAll('_', ' ')}
    </span>
  )
}

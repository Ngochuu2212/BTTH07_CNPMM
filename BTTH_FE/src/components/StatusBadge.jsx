import { STATUS_CONFIG } from '~/utils/orderConstants'

const StatusBadge = ({ status }) => {
  const cfg = STATUS_CONFIG[status] || { label: status, icon: '?', color: 'bg-gray-100 text-gray-600 border-gray-200' }
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-bold ${cfg.color}`}>
      <span>{cfg.icon}</span>{cfg.label}
    </span>
  )
}

export default StatusBadge

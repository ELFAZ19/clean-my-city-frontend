import { motion } from 'framer-motion';

const STATUS_CONFIG = {
  PENDING:     { label: 'Pending',     cls: 'badge-pending' },
  IN_PROGRESS: { label: 'In Progress', cls: 'badge-progress' },
  RESOLVED:    { label: 'Resolved',    cls: 'badge-resolved' },
};

export default function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] || { label: status, cls: 'badge-pending' };
  return (
    <span className={`badge ${cfg.cls}`}>
      <span style={{
        width: 6, height: 6, borderRadius: '50%',
        background: 'currentColor', display: 'inline-block',
      }} />
      {cfg.label}
    </span>
  );
}

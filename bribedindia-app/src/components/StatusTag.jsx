import { STATUS_LABELS } from '../lib/constants.js'

const classes = {
  unverified: 'tag-unverified',
  pending_review: 'tag-pending',
  verified: 'tag-verified',
}

export default function StatusTag({ status }) {
  const label = STATUS_LABELS[status] || status
  const cls = classes[status] || 'tag-unverified'
  return <span className={cls}>{label}</span>
}

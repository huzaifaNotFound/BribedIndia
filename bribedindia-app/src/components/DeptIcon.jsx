import {
  ShieldAlert,
  Building2,
  Landmark,
  Car,
  Plane,
  FileText,
  FlaskConical,
  Zap,
  MoreHorizontal,
} from 'lucide-react'
import { DEPARTMENT_MAP } from '../lib/constants.js'

const icons = {
  police: ShieldAlert,
  municipal: Building2,
  revenue: Landmark,
  rto: Car,
  passport: Plane,
  tax: FileText,
  fda: FlaskConical,
  electricity: Zap,
  other: MoreHorizontal,
}

export default function DeptIcon({ code, size = 18, className = '' }) {
  const dept = DEPARTMENT_MAP[code]
  const Icon = icons[dept?.icon] || MoreHorizontal
  return <Icon size={size} strokeWidth={1.5} className={className} />
}

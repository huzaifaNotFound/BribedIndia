export const SITE_NAME = 'BribedIndia'
export const TAGLINE =
  'No account. No name. No trace. Just the facts - department, amount, what happened. That\u2019s enough to change things.'

export const STATUS_LABELS = {
  unverified: 'Unverified',
  pending_review: 'Pending Review',
  verified: 'Verified',
}

export const REPORT_TYPES = [
  { value: 'paid_bribe', label: 'I paid a bribe', default: true },
  { value: 'refused_to_pay', label: 'I refused to pay', default: false },
]

export const DEPARTMENTS = [
  { code: 'P', name: 'Police', category: 'Law enforcement · state', icon: 'police' },
  { code: 'MC', name: 'Municipal Corporation', category: 'Municipal · local', icon: 'municipal' },
  { code: 'RV', name: 'Revenue / Land Records', category: 'Revenue · state', icon: 'revenue' },
  { code: 'R', name: 'RTO', category: 'Transport · state', icon: 'rto' },
  { code: 'PC', name: 'Passport Office', category: 'Central · central', icon: 'passport' },
  { code: 'IT', name: 'Income Tax', category: 'Central · central', icon: 'tax' },
  { code: 'F&D', name: 'Food & Drug Administration', category: 'Regulatory · state', icon: 'fda' },
  { code: 'EB', name: 'Electricity Board', category: 'Utilities · state', icon: 'electricity' },
  { code: 'T', name: 'Other / Not listed', category: 'Specify below', icon: 'other' },
]

export const DEPARTMENT_MAP = Object.fromEntries(DEPARTMENTS.map((d) => [d.code, d]))

export const STATES = [
  'Andhra Pradesh',
  'Arunachal Pradesh',
  'Assam',
  'Bihar',
  'Chhattisgarh',
  'Goa',
  'Gujarat',
  'Haryana',
  'Himachal Pradesh',
  'Jharkhand',
  'Karnataka',
  'Kerala',
  'Madhya Pradesh',
  'Maharashtra',
  'Manipur',
  'Meghalaya',
  'Mizoram',
  'Nagaland',
  'Odisha',
  'Punjab',
  'Rajasthan',
  'Sikkim',
  'Tamil Nadu',
  'Telangana',
  'Tripura',
  'Uttar Pradesh',
  'Uttarakhand',
  'West Bengal',
  'Andaman and Nicobar Islands',
  'Chandigarh',
  'Dadra and Nagar Haveli and Daman and Diu',
  'Delhi',
  'Jammu and Kashmir',
  'Ladakh',
  'Lakshadweep',
  'Puducherry',
]

export const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
]

export const YEAR_OPTIONS = (() => {
  const now = new Date()
  const years = []
  for (let y = now.getFullYear(); y >= now.getFullYear() - 3; y -= 1) {
    years.push(y)
  }
  return years
})()

export const CREDIBILITY_NOTE =
  'Verified means a human admin confirmed a credible pattern of reports. It does not mean any individual allegation or person has been proven guilty.'

export const RATE_LIMIT = {
  maxSubmissions: 3,
  windowMinutes: 10,
}

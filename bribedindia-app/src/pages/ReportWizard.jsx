import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Check, ArrowRight, ArrowLeft, Pencil } from 'lucide-react'
import {
  DEPARTMENTS,
  REPORT_TYPES,
  STATES,
  MONTHS,
  YEAR_OPTIONS,
} from '../lib/constants.js'
import { DISTRICTS_BY_STATE, MAX_BRIBE_AMOUNT } from '../lib/districts.js'
import { getClientSession } from '../lib/demoStore.js'
import { submitReport } from '../lib/data.js'
import DeptIcon from '../components/DeptIcon.jsx'
import { formatRupees } from '../lib/format.js'

const emptyForm = {
  report_type: 'paid_bribe',
  department_code: null,
  department_other: '',
  state: '',
  district: '',
  service: '',
  approx_month: new Date().getMonth() + 1,
  approx_year: new Date().getFullYear(),
  bribe_amount: '',
  description: '',
}

function Progress({ current }) {
  const steps = ['Report type', 'Details', 'Review']
  return (
    <div className="flex items-center gap-6">
      {steps.map((label, i) => {
        const n = i + 1
        const state = n < current ? 'done' : n === current ? 'current' : 'todo'
        return (
          <div key={label} className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <span className={`step-circle ${state === 'current' ? 'active' : ''}`}>
                {state === 'done' ? <Check size={16} /> : n}
              </span>
              <span className="label-upper hidden sm:inline">{label}</span>
            </div>
            {n < steps.length ? <div className="h-px w-10 bg-line" /> : null}
          </div>
        )
      })}
    </div>
  )
}

export default function ReportWizard() {
  const [step, setStep] = useState(1)
  const [form, setForm] = useState(emptyForm)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)

  const set = (key) => (value) => {
    setForm((f) => ({ ...f, [key]: value }))
    setError(null)
  }

  const step1Valid =
    form.report_type &&
    form.department_code &&
    (form.department_code !== 'T' || form.department_other.trim().length > 0)

  const amountValue = form.bribe_amount === '' ? null : Number(form.bribe_amount)
  const amountTooLarge =
    amountValue !== null && !Number.isNaN(amountValue) && amountValue > MAX_BRIBE_AMOUNT

  const required2 = [
    form.state.trim().length > 0,
    form.district.length > 0,
    form.service.trim().length > 0,
    form.description.trim().length > 0,
  ]
  const step2Valid = required2.every(Boolean) && !amountTooLarge

  const handleStateChange = (state) => {
    setForm((f) => ({
      ...f,
      state,
      district: f.state !== state ? '' : f.district,
    }))
    setError(null)
  }

  const districtOptions = form.state ? DISTRICTS_BY_STATE[form.state] || [] : []

  const handleSubmit = async () => {
    if (!step2Valid) return
    setSubmitting(true)
    setError(null)
    const result = await submitReport({
      report_type: form.report_type,
      department_code: form.department_code,
      department_other: form.department_code === 'T' ? form.department_other : null,
      state: form.state,
      district: form.district,
      service: form.service,
      approx_month: Number(form.approx_month),
      approx_year: Number(form.approx_year),
      bribe_amount: form.bribe_amount === '' ? null : Number(form.bribe_amount),
      description: form.description,
      client_session_id: getClientSession(),
    })
    setSubmitting(false)
    if (result.error === 'rate_limited') {
      setError(
        'Too many submissions from this device in a short time. Please wait a few minutes and try again.'
      )
      return
    }
    if (result.error) {
      setError('Something went wrong submitting your report. Please try again.')
      return
    }
    setStep(4)
  }

  if (step === 4) {
    return (
      <section className="mx-auto max-w-2xl px-4 py-24 text-center">
        <p className="h-serif text-3xl md:text-4xl">
          Thank you. Your report is now part of the public record.
        </p>
        <p className="mt-4 text-sm leading-relaxed text-muted">
          It was added to the map as unverified. If a pattern emerges, it will move to
          pending review and be confirmed by a human.
        </p>
        <Link to="/" className="btn-primary mt-8">
          Back to Map
        </Link>
      </section>
    )
  }

  return (
    <section className="mx-auto max-w-3xl px-4 py-12">
      <div className="flex items-center justify-between">
        <h1 className="h-serif text-3xl">Report a Bribe</h1>
        <Progress current={step} />
      </div>

      <div className="mt-8 panel p-6 md:p-8">
        {step === 1 && (
          <div>
            <p className="label-upper">What happened?</p>
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
              {REPORT_TYPES.map((t) => (
                <button
                  key={t.value}
                  type="button"
                  onClick={() => set('report_type')(t.value)}
                  className={`border p-5 text-left ${
                    form.report_type === t.value
                      ? 'border-ink bg-ink text-white'
                      : 'border-line text-ink hover:border-ink'
                  }`}
                >
                  <span className="text-sm font-semibold">{t.label}</span>
                </button>
              ))}
            </div>

            <p className="label-upper mt-8">Which department?</p>
            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
              {DEPARTMENTS.map((d) => {
                const active = form.department_code === d.code
                return (
                  <button
                    key={d.code}
                    type="button"
                    onClick={() => set('department_code')(d.code)}
                    className={`border p-4 text-left ${
                      active ? 'border-ink bg-accent' : 'border-line hover:border-ink'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <DeptIcon code={d.code} size={16} />
                      <span className="text-xs font-bold tracking-wider">{d.code}</span>
                    </div>
                    <p className="mt-2 text-sm font-semibold leading-tight">{d.name}</p>
                    <p className="mt-1 text-xs text-muted">{d.category}</p>
                  </button>
                )
              })}
            </div>

            {form.department_code === 'T' && (
              <div className="mt-4">
                <p className="label-upper-muted">Which department / agency?</p>
                <input
                  className="input-field mt-2"
                  value={form.department_other}
                  onChange={(e) => set('department_other')(e.target.value)}
                  placeholder="e.g. Court administration"
                />
              </div>
            )}

            <div className="mt-8 flex justify-end">
              <button
                type="button"
                className="btn-primary"
                disabled={!step1Valid}
                onClick={() => setStep(2)}
              >
                Next <ArrowRight size={14} />
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div>
            <p className="label-upper">Details</p>
            <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div>
                <label className="label-upper-muted">
                  State <span className="text-muted">*</span>
                </label>
                <select
                  className="input-field mt-2"
                  value={form.state}
                  onChange={(e) => handleStateChange(e.target.value)}
                >
                  <option value="">Select a state</option>
                  {STATES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label-upper-muted">
                  District <span className="text-muted">*</span>
                </label>
                <select
                  className="input-field mt-2"
                  value={form.district}
                  onChange={(e) => set('district')(e.target.value)}
                  disabled={!form.state}
                >
                  <option value="">
                    {form.state ? 'Select a district' : 'Select a state first'}
                  </option>
                  {districtOptions.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>
              <div className="sm:col-span-2">
                <label className="label-upper-muted">
                  Service <span className="text-muted">*</span>
                </label>
                <input
                  className="input-field mt-2"
                  value={form.service}
                  onChange={(e) => set('service')(e.target.value)}
                  placeholder="e.g. Driving license renewal"
                />
              </div>
              <div>
                <label className="label-upper-muted">Approximate month</label>
                <select
                  className="input-field mt-2"
                  value={form.approx_month}
                  onChange={(e) => set('approx_month')(e.target.value)}
                >
                  {MONTHS.map((m, i) => (
                    <option key={m} value={i + 1}>
                      {m}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label-upper-muted">Approximate year</label>
                <select
                  className="input-field mt-2"
                  value={form.approx_year}
                  onChange={(e) => set('approx_year')(e.target.value)}
                >
                  {YEAR_OPTIONS.map((y) => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label-upper-muted">Bribe amount</label>
                <div className="relative mt-2">
                  <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-sm text-muted">
                    ₹
                  </span>
                  <input
                    className="input-field pl-7"
                    type="number"
                    min="0"
                    max={MAX_BRIBE_AMOUNT}
                    value={form.bribe_amount}
                    onChange={(e) => set('bribe_amount')(e.target.value)}
                    placeholder="5000"
                  />
                </div>
                {amountTooLarge ? (
                  <p className="mt-1.5 border border-ink bg-accent px-2 py-1 text-xs">
                    Amount cannot exceed ₹{MAX_BRIBE_AMOUNT.toLocaleString('en-IN')}.
                  </p>
                ) : (
                  <p className="mt-1.5 text-xs text-muted">
                    Optional. Max ₹{MAX_BRIBE_AMOUNT.toLocaleString('en-IN')}.
                  </p>
                )}
              </div>
              <div className="sm:col-span-2">
                <label className="label-upper-muted">
                  Description <span className="text-muted">*</span>
                </label>
                <textarea
                  className="input-field mt-2 min-h-28"
                  value={form.description}
                  onChange={(e) => set('description')(e.target.value)}
                  placeholder="Describe what happened, without naming individuals."
                />
              </div>
            </div>
            {!step2Valid ? (
              <p className="mt-5 text-xs text-muted">
                Fill the required fields (state, district, service, description) to
                continue.
              </p>
            ) : null}
            <div className="mt-8 flex items-center justify-between">
              <button type="button" className="btn-outline" onClick={() => setStep(1)}>
                <ArrowLeft size={14} /> Back
              </button>
              <button
                type="button"
                className="btn-primary"
                disabled={!step2Valid}
                onClick={() => setStep(3)}
              >
                Next <ArrowRight size={14} />
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div>
            <p className="label-upper">Review your report</p>
            <div className="mt-5 divide-y divide-line">
              <SummaryRow
                label="Report type"
                value={REPORT_TYPES.find((t) => t.value === form.report_type)?.label}
                onEdit={() => setStep(1)}
              />
              <SummaryRow
                label="Department"
                value={
                  form.department_code === 'T'
                    ? form.department_other
                    : DEPARTMENTS.find((d) => d.code === form.department_code)?.name
                }
                onEdit={() => setStep(1)}
              />
              <SummaryRow label="State" value={form.state} onEdit={() => setStep(2)} />
              <SummaryRow label="District" value={form.district} onEdit={() => setStep(2)} />
              <SummaryRow label="Service" value={form.service} onEdit={() => setStep(2)} />
              <SummaryRow
                label="Approximate date"
                value={`${MONTHS[Number(form.approx_month) - 1]} ${form.approx_year}`}
                onEdit={() => setStep(2)}
              />
              <SummaryRow
                label="Bribe amount"
                value={formatRupees(form.bribe_amount)}
                onEdit={() => setStep(2)}
              />
              <SummaryRow
                label="Description"
                value={form.description}
                onEdit={() => setStep(2)}
              />
            </div>

            {error ? (
              <p className="mt-5 border border-ink bg-accent px-3 py-2 text-sm">{error}</p>
            ) : null}

            <div className="mt-8 flex items-center justify-between">
              <button type="button" className="btn-outline" onClick={() => setStep(2)}>
                <ArrowLeft size={14} /> Back
              </button>
              <button
                type="button"
                className="btn-primary"
                disabled={submitting || !form.state}
                onClick={handleSubmit}
              >
                {submitting ? 'Submitting…' : 'Submit Report'}
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}

function SummaryRow({ label, value, onEdit }) {
  return (
    <div className="flex items-center justify-between gap-4 py-4">
      <div>
        <p className="label-upper-muted">{label}</p>
        <p className="mt-1 text-sm">{value || '—'}</p>
      </div>
      <button
        type="button"
        onClick={onEdit}
        className="flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-ink hover:opacity-70"
      >
        <Pencil size={12} /> Edit
      </button>
    </div>
  )
}

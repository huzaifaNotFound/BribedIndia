import PageHeader from '../components/PageHeader.jsx'
import { CREDIBILITY_NOTE } from '../lib/constants.js'

const sections = [
  {
    title: 'What Happened',
    body: [
      'Over three months, the platform received a stream of reports describing a routine problem: drivers whose licenses were up for renewal were being told their paperwork was incomplete, then offered a fix for a fee. The fee was never invoiced, never receipted, and always roughly the same.',
      'The reports followed the same shape - a payment demanded after the file had already been approved on paper, a clerk acting as an intermediary, and a renewal that was processed within days once the amount was handed over.',
    ],
  },
  {
    title: 'Where It Occurred',
    body: [
      'All the reports clustered around driving license renewals at a regional transport office in a mid-sized city in central India. Because reporters did not name individuals, the office appears here only as a place and a process, never as persons.',
      'The district field was free text, so reports referred to the office by different local names. The clustering rule keys on the normalized service description, which let the pattern stay intact despite the spelling differences.',
    ],
  },
  {
    title: 'The Pattern Identified',
    body: [
      'Three reports that shared the same department, state, and normalized service arrived within a 90-day window. The automated rule marked the cluster as pending review. No single report claimed anything stronger than a personal experience; together they described a consistent, repeated procedure.',
      'A human admin then reviewed the cluster and confirmed it: the descriptions matched, the amounts fell in a narrow band, and the reported offices were the same. The cluster was moved to verified - meaning a credible pattern of reports, not an allegation against any individual.',
    ],
  },
  {
    title: 'What Followed',
    body: [
      'The verified pattern now appears on the public record: the department, the service, the typical amount, and the number of matching reports. Residents can see that this renewal process is the subject of a confirmed pattern before they walk in. Journalists and civic groups can ask the office for a formal answer.',
      'The office has not been contacted by this platform, and no employee is named. What the record shows is the pattern, so it can be examined, investigated, or explained. That is the entire point.',
    ],
  },
]

export default function CaseStudies() {
  return (
    <div>
      <PageHeader
        eyebrow="Case Study"
        title="The Renewal Fee"
        intro="A fictional but plausible example of how a repeated pattern gets flagged and verified. No real individuals are named."
      />

      <article className="mx-auto max-w-2xl px-4 py-12">
        <div className="border-b border-line pb-8">
          <p className="text-sm text-muted">Regional transport office · Driving license renewals</p>
          <p className="mt-2 text-sm text-muted">
            8 verified reports · ₹1,200 typical fee · flagged pending review, then verified
          </p>
        </div>

        {sections.map((section, i) => (
          <section key={section.title} className="pt-10">
            <p className="label-upper-muted">{String(i + 1).padStart(2, '0')}</p>
            <h2 className="h-serif mt-2 text-2xl md:text-3xl">{section.title}</h2>
            {section.body.map((paragraph) => (
              <p
                key={paragraph.slice(0, 32)}
                className="mt-4 text-[15px] leading-[1.9] text-ink/90"
              >
                {paragraph}
              </p>
            ))}
          </section>
        ))}

        <div className="mt-12 border-l-2 border-accent bg-accent/10 px-4 py-3">
          <p className="text-sm leading-relaxed">{CREDIBILITY_NOTE}</p>
        </div>
      </article>
    </div>
  )
}

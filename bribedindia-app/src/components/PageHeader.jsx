export default function PageHeader({ eyebrow, title, intro }) {
  return (
    <div className="border-b border-line py-10">
      <div className="mx-auto max-w-6xl px-4">
        {eyebrow ? <p className="label-upper-muted">{eyebrow}</p> : null}
        <h1 className="h-serif mt-2 text-4xl md:text-5xl">{title}</h1>
        {intro ? (
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted">{intro}</p>
        ) : null}
      </div>
    </div>
  )
}

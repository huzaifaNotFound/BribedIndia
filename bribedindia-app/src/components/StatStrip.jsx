export default function StatStrip({ stats }) {
  return (
    <div className="border-y border-line">
      <div className="mx-auto grid max-w-6xl grid-cols-3 divide-x divide-line px-4">
        <div className="py-5 pr-6">
          <p className="h-serif text-3xl md:text-4xl">{stats.total.toLocaleString('en-IN')}</p>
          <p className="label-upper-muted mt-1">Total reports filed</p>
        </div>
        <div className="px-6 py-5">
          <p className="h-serif text-3xl md:text-4xl">{stats.statesCovered}</p>
          <p className="label-upper-muted mt-1">States & UTs covered</p>
        </div>
        <div className="py-5 pl-6">
          <p className="h-serif text-3xl md:text-4xl">{stats.departmentsCovered}</p>
          <p className="label-upper-muted mt-1">Departments covered</p>
        </div>
      </div>
    </div>
  )
}

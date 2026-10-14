export default function StatStrip({ stats }) {
  return (
    <div className="border-y border-line">
      <div className="mx-auto grid max-w-6xl grid-cols-3 divide-x divide-line px-4">
        <div className="py-4 pr-2 sm:py-5 sm:pr-6">
          <p className="h-serif text-xl sm:text-2xl md:text-4xl">{stats.total.toLocaleString('en-IN')}</p>
          <p className="label-upper-muted mt-1 text-[0.55rem] sm:text-[0.6875rem]">
            Total reports filed
          </p>
        </div>
        <div className="px-2 py-4 sm:px-6 sm:py-5">
          <p className="h-serif text-xl sm:text-2xl md:text-4xl">{stats.statesCovered}</p>
          <p className="label-upper-muted mt-1 text-[0.55rem] sm:text-[0.6875rem]">
            States &amp; UTs covered
          </p>
        </div>
        <div className="py-4 pl-2 sm:py-5 sm:pl-6">
          <p className="h-serif text-xl sm:text-2xl md:text-4xl">{stats.departmentsCovered}</p>
          <p className="label-upper-muted mt-1 text-[0.55rem] sm:text-[0.6875rem]">
            Departments covered
          </p>
        </div>
      </div>
    </div>
  )
}

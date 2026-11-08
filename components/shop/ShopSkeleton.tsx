export function ShopSkeleton() {
  return (
    <div className="mx-auto max-w-7xl animate-pulse px-4 py-10 lg:px-6">
      <div className="h-4 w-20 rounded bg-chip" />
      <div className="mt-3 h-9 w-48 rounded-xl bg-chip" />
      <div className="mt-8 flex gap-2 overflow-hidden">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-10 w-24 shrink-0 rounded-full bg-chip" />
        ))}
      </div>
      <div className="mt-10 grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="overflow-hidden rounded-3xl border border-line bg-card">
            <div className="aspect-[4/5] bg-chip" />
            <div className="space-y-2 p-4">
              <div className="h-4 w-3/4 rounded bg-chip" />
              <div className="h-4 w-1/3 rounded bg-chip" />
              <div className="mt-4 h-10 rounded-full bg-chip" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function HomeSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="min-h-[70vh] bg-chip/60" />
      <div className="mx-auto max-w-7xl px-4 py-10 lg:px-6">
        <div className="h-8 w-56 rounded-xl bg-chip" />
        <div className="mt-8 flex gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-10 w-28 rounded-full bg-chip" />
          ))}
        </div>
      </div>
    </div>
  );
}

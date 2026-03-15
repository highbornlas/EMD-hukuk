'use client';

export function SkeletonTable({ rows = 6, cols = 7 }: { rows?: number; cols?: number }) {
  return (
    <div className="bg-surface border border-border rounded-lg overflow-hidden animate-pulse">
      {/* Header */}
      <div className="grid gap-4 py-3 px-4 border-b border-border" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
        {Array.from({ length: cols }).map((_, i) => (
          <div key={i} className="h-3 bg-surface2 rounded w-3/4" />
        ))}
      </div>
      {/* Rows */}
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} className="grid gap-4 py-3.5 px-4 border-b border-border/50" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
          {Array.from({ length: cols }).map((_, c) => (
            <div key={c} className="h-3 bg-surface2/60 rounded" style={{ width: `${50 + Math.random() * 40}%` }} />
          ))}
        </div>
      ))}
    </div>
  );
}

export function SkeletonKPI({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-3 lg:grid-cols-6 gap-3 animate-pulse">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-surface border border-border rounded-lg p-4">
          <div className="h-2.5 bg-surface2 rounded w-2/3 mb-3" />
          <div className="h-6 bg-surface2 rounded w-1/3" />
        </div>
      ))}
    </div>
  );
}

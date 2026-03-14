'use client';

/* ══════════════════════════════════════════════════════════════
   Dashboard Skeleton — Yükleniyor iskelet animasyonu
   Dashboard layout'unu taklit eder (KPI strip + bento grid)
   ══════════════════════════════════════════════════════════════ */

function Pulse({ className }: { className?: string }) {
  return <div className={`bg-surface2 animate-pulse rounded-lg ${className || ''}`} />;
}

function KpiSkeleton() {
  return (
    <div className="kpi-card px-4 py-3.5">
      <div className="flex items-start gap-3">
        <Pulse className="w-8 h-8 rounded-lg flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <Pulse className="h-5 w-16" />
          <Pulse className="h-2.5 w-20" />
          <Pulse className="h-2 w-14" />
        </div>
      </div>
    </div>
  );
}

function PanelSkeleton({ lines = 4 }: { lines?: number }) {
  return (
    <div className="dash-panel dp-gold">
      <div className="flex items-center justify-between px-4 pt-3.5 pb-2">
        <Pulse className="h-4 w-32" />
        <Pulse className="h-3 w-14" />
      </div>
      <div className="px-4 pb-3.5 space-y-2.5">
        {Array.from({ length: lines }).map((_, i) => (
          <div key={i} className="flex items-center gap-2.5">
            <Pulse className="w-6 h-6 rounded-md flex-shrink-0" />
            <div className="flex-1 space-y-1.5">
              <Pulse className="h-3 w-full" />
              <Pulse className="h-2 w-2/3" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="w-full">
      {/* Header */}
      <div className="mb-5 space-y-1.5">
        <Pulse className="h-7 w-48" />
        <Pulse className="h-4 w-64" />
      </div>

      {/* KPI Strip */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-5">
        {Array.from({ length: 5 }).map((_, i) => (
          <KpiSkeleton key={i} />
        ))}
      </div>

      {/* Row 1: 3 panels */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <PanelSkeleton lines={5} />
        <PanelSkeleton lines={4} />
        <PanelSkeleton lines={4} />
      </div>

      {/* Row 2: 3 panels */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <PanelSkeleton lines={3} />
        <PanelSkeleton lines={3} />
        <PanelSkeleton lines={3} />
      </div>

      {/* Row 3: 2 panels */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <PanelSkeleton lines={4} />
        <PanelSkeleton lines={5} />
      </div>
    </div>
  );
}

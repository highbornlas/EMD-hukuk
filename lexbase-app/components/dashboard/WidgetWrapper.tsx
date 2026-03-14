'use client';

import Link from 'next/link';

/* ══════════════════════════════════════════════════════════════
   Widget Wrapper — Her dashboard widget'ını saran konteyner
   Edit modda: drag handle + gizle butonu gösterir
   ══════════════════════════════════════════════════════════════ */

interface WidgetWrapperProps {
  title: string;
  subtitle?: string;
  linkText?: string;
  linkHref?: string;
  color?: string; // green, blue, gold, red, purple
  editMode?: boolean;
  onHide?: () => void;
  children: React.ReactNode;
  className?: string;
  noPadding?: boolean;
}

export function WidgetWrapper({
  title,
  subtitle,
  linkText,
  linkHref,
  color = 'gold',
  editMode = false,
  onHide,
  children,
  className = '',
  noPadding = false,
}: WidgetWrapperProps) {
  return (
    <div className={`dash-panel dp-${color} h-full flex flex-col ${editMode ? 'ring-1 ring-gold/20 ring-dashed' : ''} ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-3.5 pb-2 flex-shrink-0">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          {editMode && (
            <span className="widget-drag-handle cursor-grab active:cursor-grabbing text-text-dim hover:text-gold transition-colors text-xs flex-shrink-0" title="Sürükle">
              ⠿
            </span>
          )}
          <div className="text-[13px] font-bold text-text truncate">
            {title}
            {subtitle && <span className="text-[10px] text-text-muted font-normal ml-1.5">{subtitle}</span>}
          </div>
        </div>

        <div className="flex items-center gap-1.5 flex-shrink-0">
          {linkText && linkHref && (
            <Link href={linkHref} className="text-[11px] text-gold hover:text-gold-light transition-colors font-medium">
              {linkText}
            </Link>
          )}
          {editMode && onHide && (
            <button
              onClick={(e) => { e.stopPropagation(); onHide(); }}
              className="w-5 h-5 flex items-center justify-center rounded text-text-dim hover:text-red hover:bg-red-dim transition-colors text-[10px]"
              title="Widget'ı gizle"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className={`flex-1 overflow-auto ${noPadding ? '' : 'px-4 pb-3.5'}`}>
        {children}
      </div>
    </div>
  );
}

/* ── Boş durum ── */
export function EmptyState({ icon, text, action, actionHref }: { icon?: string; text: string; action?: string; actionHref?: string }) {
  return (
    <div className="flex items-center gap-3 py-5 px-2">
      {icon && <span className="text-xl opacity-40">{icon}</span>}
      <div className="flex-1">
        <div className="text-[12px] text-text-dim">{text}</div>
      </div>
      {action && actionHref && (
        <Link href={actionHref} className="text-[11px] text-gold hover:text-gold-light transition-colors font-medium flex-shrink-0">{action}</Link>
      )}
    </div>
  );
}

/* ── Gün Badge ── */
export function GunBadge({ gun }: { gun: number }) {
  const cls = gun <= 1 ? 'bg-red text-white' : gun <= 3 ? 'bg-red-dim text-red' : gun <= 7 ? 'bg-gold-dim text-gold' : 'bg-surface2 text-text-muted';
  const text = gun === 0 ? 'Bugün' : gun === 1 ? 'Yarın' : `${gun}g`;
  return <span className={`text-[10px] font-bold px-2 py-1 rounded-md flex-shrink-0 leading-none ${cls}`}>{text}</span>;
}

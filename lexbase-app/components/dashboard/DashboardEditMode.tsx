'use client';

import { useState } from 'react';
import type { WidgetTanim } from '@/lib/hooks/useDashboardLayout';

/* ══════════════════════════════════════════════════════════════
   Dashboard Edit Mode Toolbar
   "Düzenle" / "Kaydet" toggle + Widget Ekle dropdown + Reset
   ══════════════════════════════════════════════════════════════ */

interface DashboardEditModeProps {
  editMode: boolean;
  onToggleEdit: () => void;
  gizliWidgetler: WidgetTanim[];
  onWidgetGoster: (id: string) => void;
  onReset: () => void;
}

export function DashboardEditMode({
  editMode,
  onToggleEdit,
  gizliWidgetler,
  onWidgetGoster,
  onReset,
}: DashboardEditModeProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {/* Düzenle / Kaydet toggle */}
      <button
        onClick={onToggleEdit}
        className={`
          flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-semibold transition-all duration-200
          ${editMode
            ? 'bg-gold text-[#0D1117] shadow-[0_2px_8px_rgba(201,168,76,0.3)]'
            : 'border border-border text-text-muted hover:text-gold hover:border-gold/30'
          }
        `}
      >
        {editMode ? '✓ Kaydet' : '⚙️ Düzenle'}
      </button>

      {/* Edit modda ek kontroller */}
      {editMode && (
        <>
          {/* Widget Ekle dropdown */}
          {gizliWidgetler.length > 0 && (
            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-[12px] font-medium border border-gold/30 text-gold hover:bg-gold-dim transition-colors"
              >
                + Widget Ekle ({gizliWidgetler.length})
              </button>
              {dropdownOpen && (
                <div className="absolute left-0 top-full mt-1 w-52 bg-surface border border-border rounded-xl shadow-lg z-50 py-1">
                  {gizliWidgetler.map((w) => (
                    <button
                      key={w.id}
                      onClick={() => {
                        onWidgetGoster(w.id);
                        setDropdownOpen(false);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-[12px] text-text-muted hover:text-text hover:bg-surface2 transition-colors"
                    >
                      <span>{w.icon}</span>
                      <span>{w.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Varsayılana Dön */}
          <button
            onClick={onReset}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-[12px] font-medium text-text-dim hover:text-red hover:bg-red-dim transition-colors"
          >
            ↺ Sıfırla
          </button>
        </>
      )}
    </div>
  );
}

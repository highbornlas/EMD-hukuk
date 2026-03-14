'use client';

import { useState, useCallback, useMemo } from 'react';

/* ══════════════════════════════════════════════════════════════
   Bulk Selection Hook — Generic çoklu seçim
   ══════════════════════════════════════════════════════════════ */

export function useBulkSelection<T extends { id: string }>(items: T[]) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const toggle = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const selectAll = useCallback(() => {
    setSelectedIds(new Set(items.map((i) => i.id)));
  }, [items]);

  const clearSelection = useCallback(() => {
    setSelectedIds(new Set());
  }, []);

  const isSelected = useCallback((id: string) => selectedIds.has(id), [selectedIds]);

  const allSelected = items.length > 0 && selectedIds.size === items.length;

  const toggleAll = useCallback(() => {
    if (allSelected) {
      clearSelection();
    } else {
      selectAll();
    }
  }, [allSelected, clearSelection, selectAll]);

  const selectedItems = useMemo(
    () => items.filter((i) => selectedIds.has(i.id)),
    [items, selectedIds],
  );

  return {
    selectedIds,
    selectedItems,
    selectedCount: selectedIds.size,
    allSelected,
    toggle,
    selectAll,
    clearSelection,
    toggleAll,
    isSelected,
  };
}

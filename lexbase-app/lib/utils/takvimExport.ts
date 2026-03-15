// ================================================================
// LEXBASE — Takvim Dışa Aktarım Araçları
// lib/utils/takvimExport.ts
//
// ICS (iCal) ve CSV formatında etkinlik dışa aktarımı
// Google Calendar, Outlook, Apple Calendar uyumlu
// ================================================================

import type { Etkinlik } from '@/lib/hooks/useEtkinlikler';

// ── ICS (iCalendar) Export ──────────────────────────────────────

function icsEscape(str: string): string {
  return str
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\n/g, '\\n');
}

function toIcsDate(tarih: string, saat?: string): string {
  // YYYYMMDD veya YYYYMMDDTHHmmSS formatı
  const ymd = tarih.replace(/-/g, '');
  if (saat) {
    const hm = saat.replace(/:/g, '');
    return `${ymd}T${hm}00`;
  }
  return ymd;
}

/**
 * Etkinlik listesinden ICS dosyası oluşturur
 * Google Calendar, Outlook, Apple Calendar ile uyumlu
 */
export function generateICS(etkinlikler: Etkinlik[], muvAdMap?: Record<string, string>): string {
  const lines: string[] = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//LexBase//Takvim//TR',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'X-WR-CALNAME:LexBase Takvim',
    'X-WR-TIMEZONE:Europe/Istanbul',
  ];

  for (const e of etkinlikler) {
    if (!e.tarih) continue;

    const uid = `${e.id}@lexbase.app`;
    const baslik = e.baslik || 'Etkinlik';
    const dtStart = toIcsDate(e.tarih, e.saat);
    const dtEnd = e.bitisSaati
      ? toIcsDate(e.tarih, e.bitisSaati)
      : e.saat
        ? toIcsDate(e.tarih, `${String(parseInt(e.saat.split(':')[0]) + 1).padStart(2, '0')}:${e.saat.split(':')[1]}`)
        : toIcsDate(e.tarih);

    const descParts: string[] = [];
    if (e.tur) descParts.push(`Tür: ${e.tur}`);
    if (e.muvId && muvAdMap?.[e.muvId]) descParts.push(`Müvekkil: ${muvAdMap[e.muvId]}`);
    if (e.sanal) descParts.push(`Kaynak: ${e.kaynak || 'otomatik'}`);
    if (e.not) descParts.push(e.not as string);
    if (e.adliTatilUzama) descParts.push(`⚠️ Adli tatil süre uzaması: ${e.adliTatilUzama}`);

    lines.push('BEGIN:VEVENT');
    lines.push(`UID:${uid}`);
    lines.push(`DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').split('.')[0]}Z`);

    if (e.saat) {
      lines.push(`DTSTART;TZID=Europe/Istanbul:${dtStart}`);
      lines.push(`DTEND;TZID=Europe/Istanbul:${dtEnd}`);
    } else {
      lines.push(`DTSTART;VALUE=DATE:${dtStart}`);
      lines.push(`DTEND;VALUE=DATE:${dtEnd}`);
    }

    lines.push(`SUMMARY:${icsEscape(baslik)}`);
    if (descParts.length) lines.push(`DESCRIPTION:${icsEscape(descParts.join('\\n'))}`);
    if (e.yer) lines.push(`LOCATION:${icsEscape(e.yer)}`);

    // Hatırlatma
    if (e.hatirlatma && parseInt(e.hatirlatma) > 0) {
      lines.push('BEGIN:VALARM');
      lines.push('ACTION:DISPLAY');
      lines.push(`DESCRIPTION:${icsEscape(baslik)}`);
      lines.push(`TRIGGER:-PT${e.hatirlatma}M`);
      lines.push('END:VALARM');
    }

    lines.push('END:VEVENT');
  }

  lines.push('END:VCALENDAR');
  return lines.join('\r\n');
}

// ── CSV Export ──────────────────────────────────────────────────

function csvEscape(val: string): string {
  if (val.includes(';') || val.includes('"') || val.includes('\n')) {
    return `"${val.replace(/"/g, '""')}"`;
  }
  return val;
}

/**
 * Etkinlik listesinden CSV dosyası oluşturur (Türkçe uyumlu, BOM prefix)
 */
export function generateCSV(etkinlikler: Etkinlik[], muvAdMap?: Record<string, string>): string {
  const BOM = '\uFEFF';
  const header = ['Başlık', 'Tarih', 'Saat', 'Bitiş', 'Tür', 'Konum', 'Müvekkil', 'Kaynak', 'Notlar'].join(';');

  const rows = etkinlikler
    .filter((e) => e.tarih)
    .sort((a, b) => (a.tarih || '').localeCompare(b.tarih || ''))
    .map((e) => {
      return [
        csvEscape(e.baslik || ''),
        e.tarih || '',
        e.saat || '',
        e.bitisSaati || '',
        e.tur || '',
        csvEscape(e.yer || ''),
        e.muvId && muvAdMap?.[e.muvId] ? csvEscape(muvAdMap[e.muvId]) : '',
        e.sanal ? (e.kaynak || 'otomatik') : 'manuel',
        csvEscape((e.not as string) || ''),
      ].join(';');
    });

  return BOM + [header, ...rows].join('\n');
}

// ── Dosya İndirme Yardımcısı ────────────────────────────────────

export function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: `${mimeType};charset=utf-8` });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

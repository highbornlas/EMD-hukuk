/* ══════════════════════════════════════════════════════════════
   PDF Export — Rapor ve liste PDF çıktıları
   (Dynamic import: jsPDF sadece tarayıcıda yüklenir)
   ══════════════════════════════════════════════════════════════ */

type JsPDF = import('jspdf').jsPDF;

// Ortak header
function headerEkle(doc: JsPDF, baslik: string, altBaslik?: string) {
  doc.setFontSize(18);
  doc.setTextColor(184, 155, 72);
  doc.text('LexBase', 20, 20);

  doc.setFontSize(10);
  doc.setTextColor(120, 120, 120);
  doc.text(new Date().toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' }), 190, 20, { align: 'right' });

  doc.setFontSize(14);
  doc.setTextColor(30, 30, 30);
  doc.text(baslik, 20, 35);

  if (altBaslik) {
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(altBaslik, 20, 42);
  }

  return altBaslik ? 50 : 45;
}

function footerEkle(doc: JsPDF) {
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(
      `Bu rapor LexBase tarafindan olusturulmustur. Sayfa ${i}/${pageCount}`,
      105,
      290,
      { align: 'center' }
    );
  }
}

// ── Müvekkil Listesi PDF ──────────────────────────────────────
export async function exportMuvekkilListePDF(muvekkillar: Array<Record<string, unknown>>) {
  const { default: jsPDF } = await import('jspdf');
  const { default: autoTable } = await import('jspdf-autotable');

  const doc = new jsPDF();
  const startY = headerEkle(doc, 'Muvekkil Listesi', `Toplam: ${muvekkillar.length} muvekkil`);

  autoTable(doc, {
    startY,
    head: [['#', 'Ad', 'Tip', 'TC / VKN', 'Telefon', 'E-posta']],
    body: muvekkillar.map((m, i) => [
      i + 1,
      (m.ad as string) || '-',
      (m.tip as string) === 'tuzel' ? 'Tuzel' : 'Gercek',
      (m.tc as string) || (m.vergiNo as string) || '-',
      (m.tel as string) || '-',
      (m.mail as string) || '-',
    ]),
    styles: { fontSize: 9, cellPadding: 3 },
    headStyles: { fillColor: [184, 155, 72], textColor: [255, 255, 255] },
    alternateRowStyles: { fillColor: [245, 245, 245] },
  });

  footerEkle(doc);
  doc.save(`muvekkil-listesi-${new Date().toISOString().slice(0, 10)}.pdf`);
}

// ── Karşı Taraf Listesi PDF ────────────────────────────────────
export async function exportKarsiTarafListePDF(liste: Array<Record<string, unknown>>) {
  const { default: jsPDF } = await import('jspdf');
  const { default: autoTable } = await import('jspdf-autotable');

  const doc = new jsPDF();
  const startY = headerEkle(doc, 'Karsi Taraf Listesi', `Toplam: ${liste.length} kayit`);

  autoTable(doc, {
    startY,
    head: [['#', 'Ad', 'Tip', 'TC / VKN', 'Telefon', 'E-posta']],
    body: liste.map((k, i) => [
      i + 1,
      (k.ad as string) || '-',
      (k.tip as string) === 'tuzel' ? 'Tuzel' : 'Gercek',
      (k.tc as string) || (k.vergiNo as string) || '-',
      (k.tel as string) || '-',
      (k.mail as string) || '-',
    ]),
    styles: { fontSize: 9, cellPadding: 3 },
    headStyles: { fillColor: [184, 155, 72], textColor: [255, 255, 255] },
    alternateRowStyles: { fillColor: [245, 245, 245] },
  });

  footerEkle(doc);
  doc.save(`karsi-taraflar-${new Date().toISOString().slice(0, 10)}.pdf`);
}

// ── Avukat Listesi PDF ────────────────────────────────────────
export async function exportAvukatListePDF(liste: Array<Record<string, unknown>>) {
  const { default: jsPDF } = await import('jspdf');
  const { default: autoTable } = await import('jspdf-autotable');

  const doc = new jsPDF();
  const startY = headerEkle(doc, 'Avukat Listesi', `Toplam: ${liste.length} avukat`);

  autoTable(doc, {
    startY,
    head: [['#', 'Ad', 'Baro', 'Sicil', 'TBB', 'Telefon', 'E-posta']],
    body: liste.map((v, i) => [
      i + 1,
      (v.ad as string) || '-',
      (v.baro as string) || '-',
      (v.baroSicil as string) || '-',
      (v.tbbSicil as string) || '-',
      (v.tel as string) || '-',
      (v.mail as string) || '-',
    ]),
    styles: { fontSize: 9, cellPadding: 3 },
    headStyles: { fillColor: [184, 155, 72], textColor: [255, 255, 255] },
    alternateRowStyles: { fillColor: [245, 245, 245] },
  });

  footerEkle(doc);
  doc.save(`avukatlar-${new Date().toISOString().slice(0, 10)}.pdf`);
}

// ── Faaliyet Raporu PDF ───────────────────────────────────────
export interface FaaliyetItem {
  tarih: string;
  tur: string;
  aciklama: string;
}

export async function exportFaaliyetRaporuPDF(
  muvekkilAd: string,
  faaliyetler: FaaliyetItem[],
  baslangic: string,
  bitis: string,
) {
  const { default: jsPDF } = await import('jspdf');
  const { default: autoTable } = await import('jspdf-autotable');

  const doc = new jsPDF();
  const startY = headerEkle(
    doc,
    `Faaliyet Raporu: ${muvekkilAd}`,
    `Donem: ${baslangic} - ${bitis}`
  );

  if (faaliyetler.length === 0) {
    doc.setFontSize(11);
    doc.setTextColor(100, 100, 100);
    doc.text('Bu donemde faaliyet bulunamadi.', 20, startY + 10);
  } else {
    autoTable(doc, {
      startY,
      head: [['Tarih', 'Tur', 'Aciklama']],
      body: faaliyetler.map((f) => [f.tarih, f.tur, f.aciklama]),
      styles: { fontSize: 9, cellPadding: 3 },
      headStyles: { fillColor: [184, 155, 72], textColor: [255, 255, 255] },
      alternateRowStyles: { fillColor: [245, 245, 245] },
      columnStyles: {
        0: { cellWidth: 30 },
        1: { cellWidth: 35 },
        2: { cellWidth: 'auto' },
      },
    });
  }

  footerEkle(doc);
  doc.save(`faaliyet-raporu-${muvekkilAd.replace(/\s+/g, '-')}-${new Date().toISOString().slice(0, 10)}.pdf`);
}

// ── Finansal Rapor PDF ────────────────────────────────────────
export interface FinansOzet {
  toplamUcret: number;
  toplamTahsilat: number;
  toplamHarcama: number;
  toplamAvans: number;
  net: number;
}

export async function exportFinansRaporuPDF(muvekkilAd: string, ozet: FinansOzet) {
  const { default: jsPDF } = await import('jspdf');
  const { default: autoTable } = await import('jspdf-autotable');

  const doc = new jsPDF();
  const startY = headerEkle(doc, `Finansal Ozet: ${muvekkilAd}`);

  const fmt = (n: number) => new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(n);

  autoTable(doc, {
    startY,
    head: [['Kalem', 'Tutar']],
    body: [
      ['Toplam Ucret', fmt(ozet.toplamUcret)],
      ['Toplam Tahsilat', fmt(ozet.toplamTahsilat)],
      ['Toplam Harcama', fmt(ozet.toplamHarcama)],
      ['Toplam Avans', fmt(ozet.toplamAvans)],
      ['Net', fmt(ozet.net)],
    ],
    styles: { fontSize: 11, cellPadding: 5 },
    headStyles: { fillColor: [184, 155, 72], textColor: [255, 255, 255] },
    columnStyles: {
      1: { halign: 'right' },
    },
  });

  footerEkle(doc);
  doc.save(`finans-raporu-${muvekkilAd.replace(/\s+/g, '-')}-${new Date().toISOString().slice(0, 10)}.pdf`);
}

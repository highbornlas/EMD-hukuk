-- ================================================================
-- LEXBASE — FAİZ ORANLARI TABLOSU
-- 006_faiz_oranlari.sql
--
-- Admin panelinden güncellenir, uygulama açılışında çekilir.
-- RLS: Herkes okuyabilir, sadece admin yazabilir.
-- ================================================================

CREATE TABLE IF NOT EXISTS faiz_oranlari (
  id          serial PRIMARY KEY,
  baslangic   date NOT NULL,         -- Oranın yürürlük tarihi
  yasal       numeric(6,2) NOT NULL, -- Yasal faiz oranı %
  ticari      numeric(6,2) NOT NULL, -- Ticari (avans) faiz oranı %
  kaynak      text DEFAULT '',       -- 'Resmi Gazete 2024/32145' vb.
  notlar      text DEFAULT '',
  created_at  timestamptz DEFAULT now(),
  updated_at  timestamptz DEFAULT now(),
  UNIQUE(baslangic)                  -- Aynı tarihte iki oran olamaz
);

-- Başlangıç indeksi
CREATE INDEX IF NOT EXISTS idx_fo_baslangic ON faiz_oranlari(baslangic DESC);

-- RLS: Herkes okuyabilir (hesaplayıcı için), sadece buro sahibi yazabilir
ALTER TABLE faiz_oranlari ENABLE ROW LEVEL SECURITY;

-- Okuma — herkese açık (faiz oranları gizli değil)
DO $$ BEGIN
  CREATE POLICY faiz_oranlari_read ON faiz_oranlari FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Yazma — sadece authenticated kullanıcı (admin kontrolü JS tarafında)
DO $$ BEGIN
  CREATE POLICY faiz_oranlari_write ON faiz_oranlari FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY faiz_oranlari_update ON faiz_oranlari FOR UPDATE USING (auth.uid() IS NOT NULL);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY faiz_oranlari_delete ON faiz_oranlari FOR DELETE USING (auth.uid() IS NOT NULL);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ── VARSAYILAN VERİ (Türkiye yasal/ticari faiz tarihi) ──────
-- Kaynak: TCMB / Resmi Gazete
INSERT INTO faiz_oranlari (baslangic, yasal, ticari, kaynak) VALUES
  ('2005-05-01',  12,    24,     'Resmi Gazete'),
  ('2006-01-01',   9,    18,     'Resmi Gazete'),
  ('2014-01-01',   9,    11.75,  'TCMB'),
  ('2017-01-01',   9,    14.75,  'TCMB'),
  ('2019-03-01',   9,    28.50,  'TCMB'),
  ('2019-05-01',   9,    25.50,  'TCMB'),
  ('2019-08-01',   9,    19.50,  'TCMB'),
  ('2019-10-01',   9,    16.75,  'TCMB'),
  ('2019-12-01',   9,    12.75,  'TCMB'),
  ('2020-01-01',   9,    11.75,  'TCMB'),
  ('2020-04-01',   9,    10.75,  'TCMB'),
  ('2020-06-01',   9,     9.75,  'TCMB'),
  ('2020-12-01',   9,    17.75,  'TCMB'),
  ('2021-04-01',   9,    20.25,  'TCMB'),
  ('2021-10-01',   9,    19.25,  'TCMB'),
  ('2021-11-01',   9,    16.25,  'TCMB'),
  ('2021-12-01',   9,    15.75,  'TCMB'),
  ('2022-01-01',   9,    15.75,  'TCMB'),
  ('2022-06-01',   9,    15.75,  'TCMB'),
  ('2022-09-01',   9,    14.75,  'TCMB'),
  ('2023-01-01',   9,    10.75,  'TCMB'),
  ('2023-07-01',   9,    19.25,  'TCMB'),
  ('2023-09-01',   9,    34.25,  'TCMB'),
  ('2023-12-01',   9,    44.25,  'TCMB'),
  ('2024-01-01',   9,    49.00,  'TCMB'),
  ('2024-04-01',   9,    54.00,  'TCMB'),
  ('2024-07-01',  24,    54.00,  'Resmi Gazete 2024 — Yasal faiz %24''e çıktı'),
  ('2024-10-01',  24,    54.00,  'TCMB'),
  ('2025-01-01',  24,    49.00,  'TCMB'),
  ('2025-04-01',  24,    44.00,  'TCMB')
ON CONFLICT (baslangic) DO NOTHING;

-- ================================================================
-- Supabase SQL Editor'de çalıştırın.
-- Ardından Ayarlar → Admin Paneli → Faiz Oranları'ndan yönetin.
-- ================================================================

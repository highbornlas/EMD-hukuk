-- ================================================================
-- LEXBASE — FİNANS, CARİ HESAP & TAHSİLAT SİSTEMİ
-- 005_finans_sistemi.sql
--
-- KEŞFEDİLEN MEVCUT TABLOLAR:
-- ┌─────────────────┬──────────────────────┬─────────────┐
-- │ State Key       │ Supabase Tablo       │ Şema        │
-- ├─────────────────┼──────────────────────┼─────────────┤
-- │ muvekkillar     │ muvekkillar          │ id text, buro_id uuid, data jsonb │
-- │ davalar         │ davalar              │ aynı        │
-- │ icra            │ icra                 │ aynı        │
-- │ butce           │ butce                │ aynı        │
-- │ avanslar        │ avanslar             │ aynı        │
-- │ karsiTaraflar   │ karsi_taraflar       │ aynı        │
-- │ faturalar       │ (localStorage only)  │ -           │
-- └─────────────────┴──────────────────────┴─────────────┘
--
-- UYUMLU: Mevcut şema (id text, buro_id uuid, data jsonb)
-- Doğrudan Supabase SQL Editor'de "Run" ile çalıştırın.
-- ================================================================

-- ── 1. CARİ HESAPLAR TABLOSU ─────────────────────────────────
-- Her müvekkilin otomatik hesaplanan bakiye özeti.
-- Trigger ile güncellenir, doğrudan yazılmaz.
CREATE TABLE IF NOT EXISTS cari_hesaplar (
  id            text PRIMARY KEY,  -- müvekkil id ile aynı
  buro_id       uuid NOT NULL,
  muvekkil_id   text NOT NULL,     -- muvekkillar.id referans
  toplam_borc   numeric(14,2) DEFAULT 0,  -- Büro → Müvekkile borç (masraflar)
  toplam_alacak numeric(14,2) DEFAULT 0,  -- Müvekkil → Büroya alacak (avanslar, ödemeler)
  bakiye        numeric(14,2) DEFAULT 0,  -- alacak - borc (pozitif = müvekkil lehine)
  son_islem     timestamptz,
  created_at    timestamptz DEFAULT now(),
  updated_at    timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_cari_buro ON cari_hesaplar(buro_id);
CREATE INDEX IF NOT EXISTS idx_cari_muvekkil ON cari_hesaplar(muvekkil_id);

-- ── 2. FİNANS İŞLEMLERİ (Birleşik İşlem Defteri) ───────────
-- Tüm parasal hareketlerin tek noktadan kaydı.
-- butce + avanslar + tahsilatlar → tek tablo
CREATE TABLE IF NOT EXISTS finans_islemler (
  id          text PRIMARY KEY,
  buro_id     uuid NOT NULL,
  data        jsonb DEFAULT '{}'::jsonb,
  -- data içeriği:
  -- {
  --   muvId: text,           -- müvekkil id
  --   tur: text,             -- 'Masraf'|'Avans'|'Tahsilat'|'Hakediş'|'Vekalet Ücreti'|'Fatura'|'İade'
  --   yön: text,             -- 'borc'|'alacak' (çift taraflı muhasebe)
  --   tutar: numeric,        -- her zaman pozitif
  --   tarih: text,           -- YYYY-MM-DD
  --   aciklama: text,
  --   kategori: text,        -- 'Harç','Tebligat','Bilirkişi','Avukatlık Ücreti' vb.
  --   dosyaTur: text,        -- 'dava'|'icra'|null
  --   dosyaId: text,         -- ilişkili dosya id
  --   dosyaNo: text,         -- görüntüleme için
  --   durum: text,           -- 'Onaylandı'|'Bekliyor'|'İptal'
  --   kdvOran: numeric,
  --   kdvTutar: numeric,
  --   belge: jsonb,          -- {ad, tip, data} opsiyonel ek
  --   _kaynakTablo: text,    -- 'butce'|'avanslar'|'tahsilat' (migrasyon izi)
  --   _kaynakId: text,       -- orijinal kayıt id
  --   _otoHakedis: boolean,  -- otomatik oluşturulan hakediş mi
  -- }
  created_at  timestamptz DEFAULT now(),
  updated_at  timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_fi_buro ON finans_islemler(buro_id);
CREATE INDEX IF NOT EXISTS idx_fi_muv ON finans_islemler USING btree ((data->>'muvId'));
CREATE INDEX IF NOT EXISTS idx_fi_tur ON finans_islemler USING btree ((data->>'tur'));
CREATE INDEX IF NOT EXISTS idx_fi_tarih ON finans_islemler USING btree ((data->>'tarih') DESC);
CREATE INDEX IF NOT EXISTS idx_fi_dosya ON finans_islemler USING btree ((data->>'dosyaId'));

-- ── 3. ÜCRET ANLAŞMALARI TABLOSU ────────────────────────────
-- Dava/İcra bazlı avukatlık ücreti sözleşmeleri
CREATE TABLE IF NOT EXISTS ucret_anlasmalari (
  id          text PRIMARY KEY,
  buro_id     uuid NOT NULL,
  data        jsonb DEFAULT '{}'::jsonb,
  -- data içeriği:
  -- {
  --   muvId: text,
  --   dosyaTur: text,      -- 'dava'|'icra'
  --   dosyaId: text,
  --   dosyaNo: text,
  --   anlasmaTuru: text,   -- 'sabit'|'taksit'|'tahsilat'|'basari'|'karma'
  --   sabitUcret: numeric,
  --   yuzde: numeric,      -- tahsilat payı %
  --   bazTutar: numeric,   -- yüzde hesaplama bazı
  --   taksitSayi: int,
  --   taksitTutar: numeric,
  --   karmaP: numeric,     -- karma: peşin kısmı
  --   karmaYuzde: numeric, -- karma: yüzde kısmı
  --   not: text,
  --   tarih: text,
  -- }
  created_at  timestamptz DEFAULT now(),
  updated_at  timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_ua_buro ON ucret_anlasmalari(buro_id);
CREATE INDEX IF NOT EXISTS idx_ua_dosya ON ucret_anlasmalari USING btree ((data->>'dosyaId'));

-- ── 4. RLS POLİTİKALARI ─────────────────────────────────────
DO $$
DECLARE
  t text;
  tablolar text[] := ARRAY['cari_hesaplar', 'finans_islemler', 'ucret_anlasmalari'];
BEGIN
  FOREACH t IN ARRAY tablolar LOOP
    EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY', t);
    BEGIN EXECUTE format('CREATE POLICY %I ON %I FOR SELECT USING (buro_id = get_user_buro_id())', t||'_sel', t);
    EXCEPTION WHEN duplicate_object THEN NULL; END;
    BEGIN EXECUTE format('CREATE POLICY %I ON %I FOR INSERT WITH CHECK (buro_id = get_user_buro_id())', t||'_ins', t);
    EXCEPTION WHEN duplicate_object THEN NULL; END;
    BEGIN EXECUTE format('CREATE POLICY %I ON %I FOR UPDATE USING (buro_id = get_user_buro_id())', t||'_upd', t);
    EXCEPTION WHEN duplicate_object THEN NULL; END;
    BEGIN EXECUTE format('CREATE POLICY %I ON %I FOR DELETE USING (buro_id = get_user_buro_id())', t||'_del', t);
    EXCEPTION WHEN duplicate_object THEN NULL; END;
  END LOOP;
END $$;

-- ── 5. TRIGGER: OTOMATİK BAKİYE GÜNCELLEME ──────────────────
-- finans_islemler tablosuna INSERT/UPDATE/DELETE olduğunda
-- ilgili müvekkilin cari bakiyesini yeniden hesapla
CREATE OR REPLACE FUNCTION fn_cari_bakiye_guncelle()
RETURNS TRIGGER AS $$
DECLARE
  v_muv_id text;
  v_buro_id uuid;
  v_borc numeric;
  v_alacak numeric;
BEGIN
  -- Hangi müvekkil etkilendi?
  IF TG_OP = 'DELETE' THEN
    v_muv_id := OLD.data->>'muvId';
    v_buro_id := OLD.buro_id;
  ELSE
    v_muv_id := NEW.data->>'muvId';
    v_buro_id := NEW.buro_id;
  END IF;

  IF v_muv_id IS NULL THEN RETURN COALESCE(NEW, OLD); END IF;

  -- Toplam borç ve alacak hesapla
  SELECT
    COALESCE(SUM(CASE WHEN data->>'yön' = 'borc' THEN (data->>'tutar')::numeric ELSE 0 END), 0),
    COALESCE(SUM(CASE WHEN data->>'yön' = 'alacak' THEN (data->>'tutar')::numeric ELSE 0 END), 0)
  INTO v_borc, v_alacak
  FROM finans_islemler
  WHERE buro_id = v_buro_id AND data->>'muvId' = v_muv_id
    AND COALESCE(data->>'durum', 'Onaylandı') != 'İptal';

  -- Cari hesabı upsert
  INSERT INTO cari_hesaplar (id, buro_id, muvekkil_id, toplam_borc, toplam_alacak, bakiye, son_islem, updated_at)
  VALUES (v_muv_id, v_buro_id, v_muv_id, v_borc, v_alacak, v_alacak - v_borc, now(), now())
  ON CONFLICT (id) DO UPDATE SET
    toplam_borc = EXCLUDED.toplam_borc,
    toplam_alacak = EXCLUDED.toplam_alacak,
    bakiye = EXCLUDED.bakiye,
    son_islem = now(),
    updated_at = now();

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_cari_bakiye ON finans_islemler;
CREATE TRIGGER trg_cari_bakiye
  AFTER INSERT OR UPDATE OR DELETE ON finans_islemler
  FOR EACH ROW
  EXECUTE FUNCTION fn_cari_bakiye_guncelle();

-- ── 6. TRIGGER: OTOMATİK HAKEDİŞ HESAPLAMA ──────────────────
-- Tahsilat eklendiğinde, ücret anlaşmasına bakıp hakediş oluştur
CREATE OR REPLACE FUNCTION fn_hakedis_hesapla()
RETURNS TRIGGER AS $$
DECLARE
  v_tur text;
  v_dosya_id text;
  v_tutar numeric;
  v_anlasma record;
  v_hakedis numeric;
  v_muv_id text;
BEGIN
  v_tur := NEW.data->>'tur';
  v_dosya_id := NEW.data->>'dosyaId';
  v_tutar := COALESCE((NEW.data->>'tutar')::numeric, 0);
  v_muv_id := NEW.data->>'muvId';

  -- Sadece Tahsilat türündeki işlemler için çalış
  IF v_tur != 'Tahsilat' OR v_dosya_id IS NULL OR v_tutar <= 0 THEN
    RETURN NEW;
  END IF;

  -- İlişkili ücret anlaşmasını bul
  SELECT * INTO v_anlasma FROM ucret_anlasmalari
  WHERE buro_id = NEW.buro_id AND data->>'dosyaId' = v_dosya_id
  LIMIT 1;

  IF v_anlasma IS NULL THEN RETURN NEW; END IF;

  -- Yüzdelik anlaşma varsa hakediş hesapla
  IF v_anlasma.data->>'anlasmaTuru' IN ('tahsilat', 'basari') THEN
    v_hakedis := v_tutar * COALESCE((v_anlasma.data->>'yuzde')::numeric, 0) / 100;

    IF v_hakedis > 0 THEN
      -- Eski otomatik hakedişi sil (bu tahsilat için)
      DELETE FROM finans_islemler
      WHERE buro_id = NEW.buro_id
        AND (data->>'_kaynakId') = NEW.id
        AND (data->>'_otoHakedis')::boolean = true;

      -- Yeni hakediş kaydı oluştur
      INSERT INTO finans_islemler (id, buro_id, data) VALUES (
        gen_random_uuid()::text,
        NEW.buro_id,
        jsonb_build_object(
          'muvId', v_muv_id,
          'tur', 'Hakediş',
          'yön', 'alacak',
          'tutar', v_hakedis,
          'tarih', NEW.data->>'tarih',
          'aciklama', 'Tahsilat payı (%' || (v_anlasma.data->>'yuzde') || ') — ' || COALESCE(NEW.data->>'aciklama', ''),
          'kategori', 'Avukatlık Ücreti',
          'dosyaTur', NEW.data->>'dosyaTur',
          'dosyaId', v_dosya_id,
          'dosyaNo', COALESCE(NEW.data->>'dosyaNo', ''),
          'durum', 'Onaylandı',
          '_kaynakId', NEW.id,
          '_otoHakedis', true
        )
      );
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_hakedis ON finans_islemler;
CREATE TRIGGER trg_hakedis
  AFTER INSERT OR UPDATE ON finans_islemler
  FOR EACH ROW
  EXECUTE FUNCTION fn_hakedis_hesapla();

-- ── 7. TRIGGER: updated_at ──────────────────────────────────
CREATE OR REPLACE FUNCTION fn_finans_updated()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_fi_updated ON finans_islemler;
CREATE TRIGGER trg_fi_updated BEFORE UPDATE ON finans_islemler
  FOR EACH ROW EXECUTE FUNCTION fn_finans_updated();

DROP TRIGGER IF EXISTS trg_ua_updated ON ucret_anlasmalari;
CREATE TRIGGER trg_ua_updated BEFORE UPDATE ON ucret_anlasmalari
  FOR EACH ROW EXECUTE FUNCTION fn_finans_updated();

-- ── 8. RPC: Müvekkil Cari Özeti ──────────────────────────────
CREATE OR REPLACE FUNCTION get_cari_ozet(p_buro_id uuid)
RETURNS jsonb AS $$
DECLARE
  result jsonb;
BEGIN
  SELECT jsonb_agg(jsonb_build_object(
    'muvId', muvekkil_id,
    'borc', toplam_borc,
    'alacak', toplam_alacak,
    'bakiye', bakiye,
    'sonIslem', son_islem
  )) INTO result
  FROM cari_hesaplar
  WHERE buro_id = p_buro_id;

  RETURN COALESCE(result, '[]'::jsonb);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ── 9. RPC: Dosya Bazlı Finansal Özet ────────────────────────
CREATE OR REPLACE FUNCTION get_dosya_finans(p_buro_id uuid, p_dosya_id text)
RETURNS jsonb AS $$
DECLARE
  result jsonb;
BEGIN
  SELECT jsonb_build_object(
    'toplamMasraf', COALESCE(SUM(CASE WHEN data->>'tur' = 'Masraf' THEN (data->>'tutar')::numeric ELSE 0 END), 0),
    'toplamTahsilat', COALESCE(SUM(CASE WHEN data->>'tur' = 'Tahsilat' THEN (data->>'tutar')::numeric ELSE 0 END), 0),
    'toplamHakedis', COALESCE(SUM(CASE WHEN data->>'tur' = 'Hakediş' THEN (data->>'tutar')::numeric ELSE 0 END), 0),
    'toplamAvans', COALESCE(SUM(CASE WHEN data->>'tur' = 'Avans' THEN (data->>'tutar')::numeric ELSE 0 END), 0),
    'islemSayisi', COUNT(*)
  ) INTO result
  FROM finans_islemler
  WHERE buro_id = p_buro_id AND data->>'dosyaId' = p_dosya_id;

  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ================================================================
-- KURULUM TAMAMLANDI
--
-- Tablolar:
-- ✅ cari_hesaplar — Müvekkil bazlı otomatik bakiye
-- ✅ finans_islemler — Birleşik işlem defteri
-- ✅ ucret_anlasmalari — Dosya bazlı ücret sözleşmeleri
--
-- Trigger'lar:
-- ✅ trg_cari_bakiye — İşlem ekle/sil → bakiye otomatik güncelle
-- ✅ trg_hakedis — Tahsilat → anlaşmaya göre hakediş oluştur
--
-- RPC:
-- ✅ get_cari_ozet(buro_id) — Tüm müvekkil bakiyeleri
-- ✅ get_dosya_finans(buro_id, dosya_id) — Dosya bazlı özet
-- ================================================================

-- ================================================================
-- LEXBASE — İHTARNAME MODÜLÜ SUPABASE MİGRASYONU (v2)
-- 
-- UYUMLU: Mevcut tablo yapısı (id text, buro_id uuid, data jsonb)
-- Doğrudan Supabase SQL Editor'de çalıştırın.
-- ================================================================

-- ── 1. İHTARNAMELER TABLOSU (mevcut yapıyı kontrol et) ──────
-- Mevcut "ihtarnameler" tablosu zaten varsa dokunmuyoruz.
-- Yoksa oluştur:
CREATE TABLE IF NOT EXISTS ihtarnameler (
  id       text PRIMARY KEY,
  buro_id  uuid NOT NULL,
  data     jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ihtarnameler_buro ON ihtarnameler(buro_id);

-- ── 2. RLS ───────────────────────────────────────────────────
ALTER TABLE ihtarnameler ENABLE ROW LEVEL SECURITY;

-- Mevcut policy varsa hata vermesin
DO $$ BEGIN
  CREATE POLICY "ihtarnameler_select" ON ihtarnameler FOR SELECT
    USING (buro_id IN (
      SELECT buro_id FROM kullanicilar WHERE auth_id = auth.uid()
    ));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "ihtarnameler_insert" ON ihtarnameler FOR INSERT
    WITH CHECK (buro_id IN (
      SELECT buro_id FROM kullanicilar WHERE auth_id = auth.uid()
    ));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "ihtarnameler_update" ON ihtarnameler FOR UPDATE
    USING (buro_id IN (
      SELECT buro_id FROM kullanicilar WHERE auth_id = auth.uid()
    ));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "ihtarnameler_delete" ON ihtarnameler FOR DELETE
    USING (buro_id IN (
      SELECT buro_id FROM kullanicilar WHERE auth_id = auth.uid()
    ));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ── 3. UPDATED_AT OTOMATİK GÜNCELLEME ───────────────────────
CREATE OR REPLACE FUNCTION update_ihtarnameler_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_ihtarnameler_updated ON ihtarnameler;
CREATE TRIGGER trg_ihtarnameler_updated
  BEFORE UPDATE ON ihtarnameler
  FOR EACH ROW
  EXECUTE FUNCTION update_ihtarnameler_timestamp();

-- ── 4. MASRAF OTOMASYONU ─────────────────────────────────────
-- İhtarname kaydedildiğinde masraf varsa avanslar tablosuna otomatik ekle
CREATE OR REPLACE FUNCTION auto_ihtar_masraf()
RETURNS TRIGGER AS $$
DECLARE
  masraf_tutar numeric;
  masraf_yansit boolean;
  muv_id text;
  ihtar_no text;
  ihtar_tur text;
  ihtar_tarih text;
BEGIN
  -- JSONB'den verileri çek
  masraf_tutar := COALESCE((NEW.data->>'masrafTutar')::numeric, 0);
  masraf_yansit := COALESCE((NEW.data->>'masrafYansit')::boolean, true);
  muv_id := NEW.data->>'muvId';
  ihtar_no := COALESCE(NEW.data->>'no', '');
  ihtar_tur := COALESCE(NEW.data->>'tur', 'İhtarname');
  ihtar_tarih := COALESCE(NEW.data->>'tarih', to_char(now(), 'YYYY-MM-DD'));

  IF masraf_tutar > 0 AND masraf_yansit AND muv_id IS NOT NULL THEN
    -- Eski otomatik masrafı sil (güncelleme durumu)
    DELETE FROM avanslar 
    WHERE buro_id = NEW.buro_id 
      AND (data->>'_ihtarId') = NEW.id 
      AND (data->>'tur') = 'Masraf';

    -- Yeni masraf kaydı
    INSERT INTO avanslar (id, buro_id, data) VALUES (
      gen_random_uuid()::text,
      NEW.buro_id,
      jsonb_build_object(
        'muvId', muv_id,
        'tur', 'Masraf',
        'tutar', masraf_tutar,
        'acik', ihtar_no || ' numaralı ' || ihtar_tur || ' masrafı',
        'tarih', ihtar_tarih,
        'durum', 'Bekliyor',
        'odeme', '',
        '_ihtarId', NEW.id
      )
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_ihtar_masraf ON ihtarnameler;
CREATE TRIGGER trg_ihtar_masraf
  AFTER INSERT OR UPDATE ON ihtarnameler
  FOR EACH ROW
  EXECUTE FUNCTION auto_ihtar_masraf();

-- ── 5. GÖREV OTOMASYONU ──────────────────────────────────────
-- Tebliğ Edildi + süre verilmişse otomatik görev oluştur
CREATE OR REPLACE FUNCTION auto_ihtar_gorev()
RETURNS TRIGGER AS $$
DECLARE
  teblig_durum text;
  teblig_tarih text;
  verilen_sure int;
  sure_sonu date;
  muv_id text;
  ihtar_no text;
  eski_durum text;
BEGIN
  teblig_durum := NEW.data->>'tebligDurum';
  teblig_tarih := NEW.data->>'tebligTarih';
  verilen_sure := COALESCE((NEW.data->>'verilenSure')::int, 0);
  muv_id := NEW.data->>'muvId';
  ihtar_no := COALESCE(NEW.data->>'no', '');
  
  -- Eski durumu kontrol et (sadece UPDATE'te)
  IF TG_OP = 'UPDATE' THEN
    eski_durum := OLD.data->>'tebligDurum';
  END IF;

  -- Tebliğ Edildi + tarih + süre → görev oluştur
  IF teblig_durum = 'Tebliğ Edildi' 
     AND teblig_tarih IS NOT NULL AND teblig_tarih != ''
     AND verilen_sure > 0
     AND (TG_OP = 'INSERT' OR eski_durum IS DISTINCT FROM teblig_durum) THEN
    
    sure_sonu := teblig_tarih::date + (verilen_sure || ' days')::interval;

    -- Eski otomatik görevi sil
    DELETE FROM todolar 
    WHERE buro_id = NEW.buro_id 
      AND (data->>'_ihtarId') = NEW.id 
      AND (data->>'_otoIhtar')::boolean = true;

    -- Yeni görev
    INSERT INTO todolar (id, buro_id, data) VALUES (
      gen_random_uuid()::text,
      NEW.buro_id,
      jsonb_build_object(
        'baslik', ihtar_no || ' — İhtarname Süresi Doldu',
        'aciklama', 'Tebliğ: ' || to_char(teblig_tarih::date, 'DD.MM.YYYY') 
          || ' | Süre: ' || verilen_sure || ' gün'
          || ' | Son gün: ' || to_char(sure_sonu, 'DD.MM.YYYY'),
        'sonTarih', to_char(sure_sonu, 'YYYY-MM-DD'),
        'durum', 'Bekliyor',
        'oncelik', 'Yüksek',
        'muvId', muv_id,
        '_ihtarId', NEW.id,
        '_otoIhtar', true
      )
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_ihtar_gorev ON ihtarnameler;
CREATE TRIGGER trg_ihtar_gorev
  AFTER INSERT OR UPDATE ON ihtarnameler
  FOR EACH ROW
  EXECUTE FUNCTION auto_ihtar_gorev();

-- ── 6. SİLME TEMİZLİĞİ ─────────────────────────────────────
-- İhtarname silindiğinde ilgili otomatik masraf ve görevi de sil
CREATE OR REPLACE FUNCTION auto_ihtar_temizle()
RETURNS TRIGGER AS $$
BEGIN
  DELETE FROM avanslar 
  WHERE buro_id = OLD.buro_id 
    AND (data->>'_ihtarId') = OLD.id;
  
  DELETE FROM todolar 
  WHERE buro_id = OLD.buro_id 
    AND (data->>'_ihtarId') = OLD.id 
    AND (data->>'_otoIhtar')::boolean = true;

  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_ihtar_temizle ON ihtarnameler;
CREATE TRIGGER trg_ihtar_temizle
  BEFORE DELETE ON ihtarnameler
  FOR EACH ROW
  EXECUTE FUNCTION auto_ihtar_temizle();

-- ── 7. İHTARNAME İSTATİSTİKLERİ (RPC) ──────────────────────
CREATE OR REPLACE FUNCTION get_ihtar_stats(p_buro_id uuid)
RETURNS jsonb AS $$
DECLARE
  result jsonb;
BEGIN
  SELECT jsonb_build_object(
    'toplam', COUNT(*),
    'giden', COUNT(*) FILTER (WHERE data->>'yon' = 'Giden'),
    'gelen', COUNT(*) FILTER (WHERE data->>'yon' = 'Gelen'),
    'teblig_bekliyor', COUNT(*) FILTER (WHERE data->>'tebligDurum' = 'Bekliyor'),
    'teblig_edildi', COUNT(*) FILTER (WHERE data->>'tebligDurum' = 'Tebliğ Edildi'),
    'bila', COUNT(*) FILTER (WHERE data->>'tebligDurum' = 'Bila'),
    'toplam_masraf', COALESCE(
      SUM((data->>'masrafTutar')::numeric) FILTER (
        WHERE (data->>'masrafTutar')::numeric > 0
      ), 0
    ),
    'yaklasan_sureler', COUNT(*) FILTER (
      WHERE data->>'sureSonu' IS NOT NULL 
        AND (data->>'sureSonu')::date BETWEEN CURRENT_DATE AND CURRENT_DATE + 7
    )
  ) INTO result
  FROM ihtarnameler
  WHERE buro_id = p_buro_id;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ── 8. JSONB İNDEKSLERİ (Performans) ────────────────────────
CREATE INDEX IF NOT EXISTS idx_ihtar_yon 
  ON ihtarnameler USING btree ((data->>'yon'));
CREATE INDEX IF NOT EXISTS idx_ihtar_durum 
  ON ihtarnameler USING btree ((data->>'tebligDurum'));
CREATE INDEX IF NOT EXISTS idx_ihtar_muv 
  ON ihtarnameler USING btree ((data->>'muvId'));
CREATE INDEX IF NOT EXISTS idx_ihtar_tarih 
  ON ihtarnameler USING btree ((data->>'tarih') DESC);
CREATE INDEX IF NOT EXISTS idx_ihtar_sure 
  ON ihtarnameler USING btree ((data->>'sureSonu'));

-- Avanslar ve todolar'da _ihtarId indeksi
CREATE INDEX IF NOT EXISTS idx_avans_ihtar 
  ON avanslar USING btree ((data->>'_ihtarId'));
CREATE INDEX IF NOT EXISTS idx_todo_ihtar 
  ON todolar USING btree ((data->>'_ihtarId'));

-- ================================================================
-- KURULUM TAMAMLANDI
-- 
-- Oluşturulan:
-- ✅ ihtarnameler tablosu (yoksa) + RLS
-- ✅ Masraf otomasyonu trigger (INSERT/UPDATE → avanslar)
-- ✅ Görev otomasyonu trigger (Tebliğ + Süre → todolar)
-- ✅ Silme temizliği trigger (DELETE → ilişkili kayıtları sil)
-- ✅ İstatistik RPC fonksiyonu
-- ✅ JSONB performans indeksleri
--
-- Test:
-- SELECT get_ihtar_stats('BURO_ID_BURAYA');
-- ================================================================

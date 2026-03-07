-- ================================================================
-- LEXBASE — İCRA TAKİP MODÜLÜ SUPABASE MİGRASYONU
--
-- UYUMLU: Mevcut tablo yapısı (id text, buro_id uuid, data jsonb)
-- Doğrudan Supabase SQL Editor'de çalıştırın.
-- ================================================================

-- ── 1. İCRA TABLOSU (mevcut "icra" tablosu zaten var) ────────
CREATE TABLE IF NOT EXISTS icra (
  id       text PRIMARY KEY,
  buro_id  uuid NOT NULL,
  data     jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_icra_buro ON icra(buro_id);

-- ── 2. RLS ───────────────────────────────────────────────────
ALTER TABLE icra ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "icra_select" ON icra FOR SELECT
    USING (buro_id IN (SELECT buro_id FROM kullanicilar WHERE auth_id = auth.uid()));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "icra_insert" ON icra FOR INSERT
    WITH CHECK (buro_id IN (SELECT buro_id FROM kullanicilar WHERE auth_id = auth.uid()));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "icra_update" ON icra FOR UPDATE
    USING (buro_id IN (SELECT buro_id FROM kullanicilar WHERE auth_id = auth.uid()));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "icra_delete" ON icra FOR DELETE
    USING (buro_id IN (SELECT buro_id FROM kullanicilar WHERE auth_id = auth.uid()));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ── 3. UPDATED_AT TRIGGER ────────────────────────────────────
CREATE OR REPLACE FUNCTION update_icra_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_icra_updated ON icra;
CREATE TRIGGER trg_icra_updated
  BEFORE UPDATE ON icra
  FOR EACH ROW
  EXECUTE FUNCTION update_icra_timestamp();

-- ── 4. HARCAMA → FİNANS OTOMASYONU ──────────────────────────
-- İcra dosyasına harcama eklendiğinde (data->'harcamalar' güncellendiğinde)
-- avanslar tablosuna otomatik masraf kaydı oluştur
CREATE OR REPLACE FUNCTION auto_icra_harcama_sync()
RETURNS TRIGGER AS $$
DECLARE
  harc jsonb;
  harc_item jsonb;
  muv_id text;
  dosya_no text;
BEGIN
  -- Harcamalar değişmediyse çık
  IF TG_OP = 'UPDATE' AND (OLD.data->'harcamalar') IS NOT DISTINCT FROM (NEW.data->'harcamalar') THEN
    RETURN NEW;
  END IF;

  muv_id := NEW.data->>'muvId';
  dosya_no := COALESCE(NEW.data->>'no', '');

  -- Bu icra dosyasına ait eski otomatik masrafları sil
  DELETE FROM avanslar 
  WHERE buro_id = NEW.buro_id 
    AND (data->>'_icraId') = NEW.id 
    AND (data->>'_otoHarcama')::boolean = true;

  -- Yeni harcamaları ekle
  harc := COALESCE(NEW.data->'harcamalar', '[]'::jsonb);
  FOR harc_item IN SELECT * FROM jsonb_array_elements(harc)
  LOOP
    IF (harc_item->>'tutar')::numeric > 0 THEN
      INSERT INTO avanslar (id, buro_id, data) VALUES (
        gen_random_uuid()::text,
        NEW.buro_id,
        jsonb_build_object(
          'muvId', muv_id,
          'tur', 'Masraf',
          'tutar', (harc_item->>'tutar')::numeric,
          'acik', dosya_no || ' İcra — ' || COALESCE(harc_item->>'kat', 'Harcama') || ': ' || COALESCE(harc_item->>'acik', ''),
          'tarih', COALESCE(harc_item->>'tarih', to_char(now(), 'YYYY-MM-DD')),
          'durum', 'Bekliyor',
          'odeme', '',
          '_icraId', NEW.id,
          '_otoHarcama', true
        )
      );
    END IF;
  END LOOP;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_icra_harcama ON icra;
CREATE TRIGGER trg_icra_harcama
  AFTER INSERT OR UPDATE ON icra
  FOR EACH ROW
  EXECUTE FUNCTION auto_icra_harcama_sync();

-- ── 5. TAHSİLAT → HAKEDİŞ HESAPLAMA OTOMASYONU ─────────────
-- İcra dosyasına tahsilat eklendiğinde (data->'tahsilatlar' güncellendiğinde)
-- Anlaşmadaki orana göre hakediş hesapla
CREATE OR REPLACE FUNCTION auto_icra_hakedis()
RETURNS TRIGGER AS $$
DECLARE
  tahsilatlar jsonb;
  anlasma jsonb;
  anlasma_tur text;
  anlasma_yuzde numeric;
  toplam_tahsilat numeric;
  hakedis numeric;
BEGIN
  -- Tahsilatlar değişmediyse çık
  IF TG_OP = 'UPDATE' AND (OLD.data->'tahsilatlar') IS NOT DISTINCT FROM (NEW.data->'tahsilatlar') THEN
    RETURN NEW;
  END IF;

  tahsilatlar := COALESCE(NEW.data->'tahsilatlar', '[]'::jsonb);
  anlasma := COALESCE(NEW.data->'anlasma', '{}'::jsonb);
  anlasma_tur := COALESCE(anlasma->>'tur', '');
  anlasma_yuzde := COALESCE((anlasma->>'yuzde')::numeric, 0);

  -- Toplam tahsilatı hesapla
  SELECT COALESCE(SUM((t->>'tutar')::numeric), 0) INTO toplam_tahsilat
  FROM jsonb_array_elements(tahsilatlar) t
  WHERE t->>'tur' = 'tahsilat';

  -- tahsil alanını güncelle (state sync)
  NEW.data = jsonb_set(NEW.data, '{tahsil}', to_jsonb(toplam_tahsilat));

  -- Tahsilat payı varsa hakediş hesapla
  IF anlasma_tur IN ('tahsilat', 'basari') AND anlasma_yuzde > 0 AND toplam_tahsilat > 0 THEN
    hakedis := toplam_tahsilat * anlasma_yuzde / 100;
    -- Hakediş bilgisini data'ya yaz
    NEW.data = jsonb_set(NEW.data, '{hesaplananHakedis}', to_jsonb(hakedis));
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_icra_hakedis ON icra;
CREATE TRIGGER trg_icra_hakedis
  BEFORE UPDATE ON icra
  FOR EACH ROW
  EXECUTE FUNCTION auto_icra_hakedis();

-- ── 6. ÖDEME EMRİ → İTİRAZ SÜRESİ + GÖREV OTOMASYONU ──────
-- Ödeme emri tarihi girildiğinde itiraz süresini hesapla
-- ve süre dolmadan 2 gün önce otomatik görev oluştur
CREATE OR REPLACE FUNCTION auto_icra_itiraz_gorev()
RETURNS TRIGGER AS $$
DECLARE
  otarih text;
  itarih text;
  tur text;
  dosya_no text;
  muv_id text;
  yasal_sure int;
  itiraz_tarihi date;
  gorev_tarihi date;
  eski_otarih text;
BEGIN
  otarih := NEW.data->>'otarih';  -- Ödeme emri tarihi
  itarih := NEW.data->>'itarih';  -- Manuel itiraz tarihi
  tur := COALESCE(NEW.data->>'tur', '');
  dosya_no := COALESCE(NEW.data->>'no', '');
  muv_id := NEW.data->>'muvId';

  -- Eski ödeme emri tarihini kontrol et
  IF TG_OP = 'UPDATE' THEN
    eski_otarih := OLD.data->>'otarih';
    -- Değişmediyse çık
    IF otarih IS NOT DISTINCT FROM eski_otarih AND itarih IS NOT DISTINCT FROM (OLD.data->>'itarih') THEN
      RETURN NEW;
    END IF;
  END IF;

  -- Yasal süre hesapla (tür bazlı)
  yasal_sure := CASE 
    WHEN tur = 'İlamsız İcra' THEN 7
    WHEN tur = 'Kambiyo Senedi' THEN 5
    WHEN tur = 'İlamlı İcra' THEN 7
    ELSE 7
  END;

  -- Manuel itiraz tarihi varsa onu kullan, yoksa hesapla
  IF itarih IS NOT NULL AND itarih != '' THEN
    itiraz_tarihi := itarih::date;
  ELSIF otarih IS NOT NULL AND otarih != '' THEN
    itiraz_tarihi := otarih::date + (yasal_sure || ' days')::interval;
    -- İtiraz tarihini data'ya yaz
    NEW.data = jsonb_set(NEW.data, '{itarih}', to_jsonb(to_char(itiraz_tarihi, 'YYYY-MM-DD')));
  ELSE
    RETURN NEW; -- Tarih yoksa çık
  END IF;

  -- 2 gün önce görev tarihi
  gorev_tarihi := itiraz_tarihi - interval '2 days';

  -- Eski otomatik görevi sil
  DELETE FROM todolar 
  WHERE buro_id = NEW.buro_id 
    AND (data->>'_icraId') = NEW.id 
    AND (data->>'_otoItiraz')::boolean = true;

  -- Yeni görev oluştur (eğer itiraz tarihi gelecekte ise)
  IF itiraz_tarihi > CURRENT_DATE THEN
    INSERT INTO todolar (id, buro_id, data) VALUES (
      gen_random_uuid()::text,
      NEW.buro_id,
      jsonb_build_object(
        'baslik', '🔴 ' || dosya_no || ' — İtiraz süresi doluyor',
        'aciklama', 'Ödeme Emri: ' || to_char(otarih::date, 'DD.MM.YYYY')
          || ' | İtiraz Son: ' || to_char(itiraz_tarihi, 'DD.MM.YYYY')
          || ' | Kesinleştirme işlemi yapılabilir.',
        'sonTarih', to_char(gorev_tarihi, 'YYYY-MM-DD'),
        'durum', 'Bekliyor',
        'oncelik', 'Yüksek',
        'muvId', muv_id,
        '_icraId', NEW.id,
        '_otoItiraz', true
      )
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_icra_itiraz ON icra;
CREATE TRIGGER trg_icra_itiraz
  BEFORE INSERT OR UPDATE ON icra
  FOR EACH ROW
  EXECUTE FUNCTION auto_icra_itiraz_gorev();

-- ── 7. SİLME TEMİZLİĞİ ─────────────────────────────────────
CREATE OR REPLACE FUNCTION auto_icra_temizle()
RETURNS TRIGGER AS $$
BEGIN
  -- Otomatik masrafları sil
  DELETE FROM avanslar 
  WHERE buro_id = OLD.buro_id 
    AND (data->>'_icraId') = OLD.id;
  
  -- Otomatik görevleri sil
  DELETE FROM todolar 
  WHERE buro_id = OLD.buro_id 
    AND (data->>'_icraId') = OLD.id;

  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_icra_temizle ON icra;
CREATE TRIGGER trg_icra_temizle
  BEFORE DELETE ON icra
  FOR EACH ROW
  EXECUTE FUNCTION auto_icra_temizle();

-- ── 8. İCRA İSTATİSTİKLERİ (RPC) ────────────────────────────
CREATE OR REPLACE FUNCTION get_icra_stats(p_buro_id uuid)
RETURNS jsonb AS $$
DECLARE
  result jsonb;
BEGIN
  SELECT jsonb_build_object(
    'toplam', COUNT(*),
    'aktif', COUNT(*) FILTER (WHERE data->>'durum' NOT IN ('kapandi', 'Kapandı')),
    'toplam_alacak', COALESCE(SUM((data->>'alacak')::numeric), 0),
    'toplam_tahsil', COALESCE(SUM((data->>'tahsil')::numeric), 0),
    'kalan', COALESCE(SUM((data->>'alacak')::numeric), 0) - COALESCE(SUM((data->>'tahsil')::numeric), 0),
    'toplam_harcama', COALESCE(
      SUM(
        (SELECT COALESCE(SUM((h->>'tutar')::numeric), 0) 
         FROM jsonb_array_elements(COALESCE(data->'harcamalar', '[]'::jsonb)) h)
      ), 0
    ),
    'yaklasan_itiraz', COUNT(*) FILTER (
      WHERE data->>'itarih' IS NOT NULL 
        AND (data->>'itarih')::date BETWEEN CURRENT_DATE AND CURRENT_DATE + 7
    ),
    'haciz_asamasi', COUNT(*) FILTER (WHERE data->>'durum' IN ('haciz', 'Haciz Aşaması')),
    'satis_asamasi', COUNT(*) FILTER (WHERE data->>'durum' IN ('satis', 'Satış Aşaması'))
  ) INTO result
  FROM icra
  WHERE buro_id = p_buro_id;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ── 9. JSONB İNDEKSLERİ (Performans) ────────────────────────
CREATE INDEX IF NOT EXISTS idx_icra_durum 
  ON icra USING btree ((data->>'durum'));
CREATE INDEX IF NOT EXISTS idx_icra_muv 
  ON icra USING btree ((data->>'muvId'));
CREATE INDEX IF NOT EXISTS idx_icra_tarih 
  ON icra USING btree ((data->>'tarih') DESC);
CREATE INDEX IF NOT EXISTS idx_icra_itarih 
  ON icra USING btree ((data->>'itarih'));
CREATE INDEX IF NOT EXISTS idx_icra_alacak 
  ON icra USING btree (((data->>'alacak')::numeric) DESC);

-- Avanslar ve todolar'da _icraId indeksi
CREATE INDEX IF NOT EXISTS idx_avans_icra 
  ON avanslar USING btree ((data->>'_icraId'));
CREATE INDEX IF NOT EXISTS idx_todo_icra 
  ON todolar USING btree ((data->>'_icraId'));

-- ================================================================
-- KURULUM TAMAMLANDI
-- 
-- Oluşturulan Trigger'lar:
-- ✅ trg_icra_updated — updated_at otomatik güncelleme
-- ✅ trg_icra_harcama — Harcama eklenince avanslar'a masraf kaydı
-- ✅ trg_icra_hakedis — Tahsilat eklenince tahsil güncelleme + hakediş
-- ✅ trg_icra_itiraz  — Ödeme emri tarihi → itiraz süresi + görev
-- ✅ trg_icra_temizle — Dosya silinince ilişkili kayıtları temizle
--
-- RPC:
-- ✅ get_icra_stats(buro_id) — İcra özet istatistikleri
--
-- Test:
-- SELECT get_icra_stats('BURO_ID_BURAYA');
-- ================================================================

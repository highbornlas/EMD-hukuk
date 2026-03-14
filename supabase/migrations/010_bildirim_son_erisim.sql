-- ================================================================
-- LEXBASE — BİLDİRİMLER + SON ERİŞİMLER
-- 010_bildirim_son_erisim.sql
--
-- 1. bildirimler tablosu (Topbar bildirim sistemi)
-- 2. son_erisimler tablosu (Hızlı erişim — kullanıcı bazlı)
-- 3. Otomatik bildirim trigger fonksiyonları
-- ================================================================

-- ════════════════════════════════════════════════════════════════
-- 1. BİLDİRİMLER TABLOSU
-- ════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS bildirimler (
  id          text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  buro_id     uuid NOT NULL,
  tip         text NOT NULL DEFAULT 'sistem',
  baslik      text NOT NULL,
  mesaj       text,
  link        text,
  okundu      boolean DEFAULT false,
  olusturma   timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_bildirimler_buro
  ON bildirimler(buro_id);
CREATE INDEX IF NOT EXISTS idx_bildirimler_okundu
  ON bildirimler(buro_id, okundu) WHERE okundu = false;
CREATE INDEX IF NOT EXISTS idx_bildirimler_tarih
  ON bildirimler(buro_id, olusturma DESC);

ALTER TABLE bildirimler ENABLE ROW LEVEL SECURITY;

-- RLS: Kullanıcı sadece kendi bürosunun bildirimlerini görebilir
DO $$ BEGIN
  CREATE POLICY bildirimler_sel ON bildirimler FOR SELECT
    USING (buro_id = get_user_buro_id());
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY bildirimler_ins ON bildirimler FOR INSERT
    WITH CHECK (buro_id = get_user_buro_id());
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY bildirimler_upd ON bildirimler FOR UPDATE
    USING (buro_id = get_user_buro_id());
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY bildirimler_del ON bildirimler FOR DELETE
    USING (buro_id = get_user_buro_id());
EXCEPTION WHEN duplicate_object THEN NULL; END $$;


-- ════════════════════════════════════════════════════════════════
-- 2. SON ERİŞİMLER TABLOSU (kullanıcı bazlı, cihazlar arası sync)
-- ════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS son_erisimler (
  id                  text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  buro_id             uuid NOT NULL,
  kullanici_auth_id   uuid NOT NULL DEFAULT auth.uid(),
  kaynak_id           text NOT NULL,
  kaynak_tip          text NOT NULL,
  baslik              text NOT NULL,
  sabitlenen          boolean DEFAULT false,
  erisim_zamani       timestamptz DEFAULT now(),
  UNIQUE(kullanici_auth_id, kaynak_id)
);

CREATE INDEX IF NOT EXISTS idx_son_erisim_kullanici
  ON son_erisimler(kullanici_auth_id, erisim_zamani DESC);
CREATE INDEX IF NOT EXISTS idx_son_erisim_buro
  ON son_erisimler(buro_id);
CREATE INDEX IF NOT EXISTS idx_son_erisim_sabitlenen
  ON son_erisimler(kullanici_auth_id, sabitlenen) WHERE sabitlenen = true;

ALTER TABLE son_erisimler ENABLE ROW LEVEL SECURITY;

-- RLS: Kullanıcı sadece kendi erişim kayıtlarını görebilir
DO $$ BEGIN
  CREATE POLICY son_erisimler_sel ON son_erisimler FOR SELECT
    USING (buro_id = get_user_buro_id() AND kullanici_auth_id = auth.uid());
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY son_erisimler_ins ON son_erisimler FOR INSERT
    WITH CHECK (buro_id = get_user_buro_id() AND kullanici_auth_id = auth.uid());
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY son_erisimler_upd ON son_erisimler FOR UPDATE
    USING (buro_id = get_user_buro_id() AND kullanici_auth_id = auth.uid());
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY son_erisimler_del ON son_erisimler FOR DELETE
    USING (buro_id = get_user_buro_id() AND kullanici_auth_id = auth.uid());
EXCEPTION WHEN duplicate_object THEN NULL; END $$;


-- ════════════════════════════════════════════════════════════════
-- 3. OTOMATİK BİLDİRİM TRIGGER FONKSİYONLARI
-- ════════════════════════════════════════════════════════════════

-- ── Yeni dava eklendiğinde bildirim ──
CREATE OR REPLACE FUNCTION fn_bildirim_yeni_dava()
RETURNS trigger AS $$
BEGIN
  INSERT INTO bildirimler (buro_id, tip, baslik, mesaj, link)
  VALUES (
    NEW.buro_id,
    'dosya',
    'Yeni dava dosyası eklendi',
    COALESCE(NEW.data->>'dosyaNo', '') || ' — ' || COALESCE(NEW.data->>'konu', 'Belirtilmemiş'),
    '/davalar/' || NEW.id
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_bildirim_yeni_dava ON davalar;
CREATE TRIGGER trg_bildirim_yeni_dava
  AFTER INSERT ON davalar
  FOR EACH ROW
  EXECUTE FUNCTION fn_bildirim_yeni_dava();


-- ── Yeni icra dosyası eklendiğinde bildirim ──
CREATE OR REPLACE FUNCTION fn_bildirim_yeni_icra()
RETURNS trigger AS $$
BEGIN
  INSERT INTO bildirimler (buro_id, tip, baslik, mesaj, link)
  VALUES (
    NEW.buro_id,
    'dosya',
    'Yeni icra dosyası eklendi',
    COALESCE(NEW.data->>'dosyaNo', '') || ' — ' || COALESCE(NEW.data->>'borclu', 'Belirtilmemiş'),
    '/icra/' || NEW.id
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_bildirim_yeni_icra ON icra;
CREATE TRIGGER trg_bildirim_yeni_icra
  AFTER INSERT ON icra
  FOR EACH ROW
  EXECUTE FUNCTION fn_bildirim_yeni_icra();


-- ── Yeni görev eklendiğinde bildirim ──
CREATE OR REPLACE FUNCTION fn_bildirim_yeni_gorev()
RETURNS trigger AS $$
BEGIN
  INSERT INTO bildirimler (buro_id, tip, baslik, mesaj, link)
  VALUES (
    NEW.buro_id,
    'gorev',
    'Yeni görev eklendi',
    COALESCE(NEW.data->>'baslik', 'Görev'),
    '/gorevler'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_bildirim_yeni_gorev ON todolar;
CREATE TRIGGER trg_bildirim_yeni_gorev
  AFTER INSERT ON todolar
  FOR EACH ROW
  EXECUTE FUNCTION fn_bildirim_yeni_gorev();


-- ── Yeni etkinlik eklendiğinde bildirim ──
CREATE OR REPLACE FUNCTION fn_bildirim_yeni_etkinlik()
RETURNS trigger AS $$
DECLARE
  etkinlik_tip text;
  etkinlik_baslik text;
BEGIN
  etkinlik_tip := COALESCE(NEW.data->>'tur', 'etkinlik');
  etkinlik_baslik := COALESCE(NEW.data->>'baslik', NEW.data->>'konu', 'Yeni etkinlik');

  INSERT INTO bildirimler (buro_id, tip, baslik, mesaj, link)
  VALUES (
    NEW.buro_id,
    CASE WHEN etkinlik_tip = 'durusma' THEN 'durusma' ELSE 'sistem' END,
    CASE WHEN etkinlik_tip = 'durusma' THEN 'Yeni duruşma planlandı' ELSE 'Yeni etkinlik eklendi' END,
    etkinlik_baslik,
    '/takvim'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_bildirim_yeni_etkinlik ON etkinlikler;
CREATE TRIGGER trg_bildirim_yeni_etkinlik
  AFTER INSERT ON etkinlikler
  FOR EACH ROW
  EXECUTE FUNCTION fn_bildirim_yeni_etkinlik();


-- ════════════════════════════════════════════════════════════════
-- 4. REALTIME — bildirimler tablosunu yayınla
-- ════════════════════════════════════════════════════════════════
ALTER PUBLICATION supabase_realtime ADD TABLE bildirimler;


-- ════════════════════════════════════════════════════════════════
-- 5. ESKİ BİLDİRİMLERİ TEMİZLEME FONKSİYONU
-- (30 günden eski okunmuş bildirimleri siler — cron ile çağrılır)
-- ════════════════════════════════════════════════════════════════
CREATE OR REPLACE FUNCTION fn_bildirim_temizle()
RETURNS void AS $$
BEGIN
  DELETE FROM bildirimler
  WHERE okundu = true
    AND olusturma < now() - interval '30 days';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

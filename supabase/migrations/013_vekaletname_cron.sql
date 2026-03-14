-- ================================================================
-- LEXBASE — VEKALETNAME SÜRE TAKİBİ
-- 013_vekaletname_cron.sql
--
-- 1. Vekaletname süresi kontrol fonksiyonu
-- 2. pg_cron ile gece 02:00 otomatik çalışır
-- 3. 30, 15, 3 gün kala bildirim oluşturur
-- ================================================================

-- ════════════════════════════════════════════════════════════════
-- 1. VEKALETNAME KONTROL FONKSİYONU
-- ════════════════════════════════════════════════════════════════
CREATE OR REPLACE FUNCTION fn_vekaletname_kontrol()
RETURNS void AS $$
DECLARE
  rec RECORD;
  kalan_gun integer;
  bildirim_mesaj text;
  bildirim_tip text;
  bugun date := current_date;
BEGIN
  -- Vekaletname türündeki belgeleri tara
  FOR rec IN
    SELECT
      b.id,
      b.buro_id,
      b.data->>'ad' AS belge_ad,
      b.data->>'muvId' AS muv_id,
      (b.data->'meta'->>'bitis')::date AS bitis_tarihi
    FROM belgeler b
    WHERE b.data->>'tur' = 'vekaletname'
      AND b.data->'meta'->>'bitis' IS NOT NULL
      AND (b.data->'meta'->>'bitis')::date >= bugun
  LOOP
    kalan_gun := rec.bitis_tarihi - bugun;

    -- Sadece 30, 15, 3 gün eşiklerinde bildirim
    IF kalan_gun NOT IN (30, 15, 3) THEN
      CONTINUE;
    END IF;

    -- Deduplikasyon: bugün aynı belge için zaten bildirim var mı?
    IF EXISTS (
      SELECT 1 FROM bildirimler
      WHERE buro_id = rec.buro_id
        AND tip = 'sure'
        AND link = '/muvekkillar/' || rec.muv_id
        AND mesaj LIKE '%' || rec.belge_ad || '%'
        AND olusturma::date = bugun
    ) THEN
      CONTINUE;
    END IF;

    -- Bildirim mesajı
    IF kalan_gun = 30 THEN
      bildirim_mesaj := rec.belge_ad || ' — 30 gün kaldı';
      bildirim_tip := 'sure';
    ELSIF kalan_gun = 15 THEN
      bildirim_mesaj := rec.belge_ad || ' — 15 gün kaldı!';
      bildirim_tip := 'sure';
    ELSIF kalan_gun = 3 THEN
      bildirim_mesaj := rec.belge_ad || ' — SON 3 GÜN!';
      bildirim_tip := 'sure';
    END IF;

    INSERT INTO bildirimler (buro_id, tip, baslik, mesaj, link)
    VALUES (
      rec.buro_id,
      bildirim_tip,
      'Vekaletname süresi dolmak üzere',
      bildirim_mesaj,
      '/muvekkillar/' || rec.muv_id
    );
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ════════════════════════════════════════════════════════════════
-- 2. pg_cron ile Zamanlama (her gece 02:00)
-- ════════════════════════════════════════════════════════════════
-- Not: pg_cron uzantısı Supabase'de varsayılan olarak aktif.
-- Eğer aktif değilse Dashboard > Extensions'dan etkinleştirin.

-- Önce mevcut job varsa kaldır
SELECT cron.unschedule('vekaletname-kontrol')
WHERE EXISTS (
  SELECT 1 FROM cron.job WHERE jobname = 'vekaletname-kontrol'
);

-- Yeni cron job oluştur
SELECT cron.schedule(
  'vekaletname-kontrol',
  '0 2 * * *',
  $$SELECT fn_vekaletname_kontrol()$$
);

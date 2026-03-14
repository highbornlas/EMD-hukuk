-- ================================================================
-- LEXBASE — DOSYA YÜKLEME LİMİTLERİ
-- 016_upload_limitler.sql
--
-- Büro bazlı belge istatistiklerini döndüren RPC fonksiyonu.
-- Kötüye kullanımı önlemek için client-side limit kontrolü yapar.
-- ================================================================

-- ════════════════════════════════════════════════════════════════
-- 1. BELGE İSTATİSTİK FONKSİYONU
-- ════════════════════════════════════════════════════════════════
CREATE OR REPLACE FUNCTION fn_belge_istatistik(p_buro_id uuid)
RETURNS TABLE(toplam_sayi bigint, toplam_boyut bigint) AS $$
BEGIN
  RETURN QUERY
  SELECT
    count(*)::bigint,
    coalesce(sum((data->>'boyut')::bigint), 0)::bigint
  FROM belgeler
  WHERE buro_id = p_buro_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

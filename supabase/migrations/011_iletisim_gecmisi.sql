-- ═══════════════════════════════════════════════════════════
-- 011: İletişim Geçmişi Tablosu
-- ═══════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS iletisimler (
  id   text PRIMARY KEY,
  buro_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  data jsonb DEFAULT '{}'::jsonb
);

-- İndeksler
CREATE INDEX IF NOT EXISTS idx_iletisimler_buro ON iletisimler(buro_id);

-- RLS
ALTER TABLE iletisimler ENABLE ROW LEVEL SECURITY;

CREATE POLICY "iletisimler_select" ON iletisimler FOR SELECT
  USING (buro_id = get_user_buro_id());

CREATE POLICY "iletisimler_insert" ON iletisimler FOR INSERT
  WITH CHECK (buro_id = get_user_buro_id());

CREATE POLICY "iletisimler_update" ON iletisimler FOR UPDATE
  USING (buro_id = get_user_buro_id());

CREATE POLICY "iletisimler_delete" ON iletisimler FOR DELETE
  USING (buro_id = get_user_buro_id());

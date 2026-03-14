# LexBase — Bildirim + Son Erişim + Hava Durumu Uygulama Planı

## ADIM 1: Supabase Migration (010_bildirim_son_erisim.sql)

### 1a. `bildirimler` tablosu (zaten hook'lar hazır, tablo eksik)
```sql
CREATE TABLE bildirimler (
  id          text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  buro_id     uuid NOT NULL,
  tip         text NOT NULL DEFAULT 'sistem',  -- durusma/gorev/dosya/sure/finans/sistem
  baslik      text NOT NULL,
  mesaj       text,
  link        text,
  okundu      boolean DEFAULT false,
  olusturma   timestamptz DEFAULT now()
);
CREATE INDEX idx_bildirimler_buro ON bildirimler(buro_id);
CREATE INDEX idx_bildirimler_okundu ON bildirimler(buro_id, okundu);
+ RLS: buro_id = get_user_buro_id()
```

### 1b. `son_erisimler` tablosu (kullanıcı bazlı, cihazlar arası senkron)
```sql
CREATE TABLE son_erisimler (
  id                text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  buro_id           uuid NOT NULL,
  kullanici_auth_id uuid NOT NULL DEFAULT auth.uid(),
  kaynak_id         text NOT NULL,
  kaynak_tip        text NOT NULL,   -- dava/icra/muvekkil/danismanlik/arabuluculuk/ihtarname
  baslik            text NOT NULL,
  sabitlenen        boolean DEFAULT false,
  erisim_zamani     timestamptz DEFAULT now(),
  UNIQUE(kullanici_auth_id, kaynak_id)
);
CREATE INDEX idx_son_erisim_kullanici ON son_erisimler(kullanici_auth_id, erisim_zamani DESC);
+ RLS: buro_id = get_user_buro_id() AND kullanici_auth_id = auth.uid()
```

### 1c. Bildirim oluşturma trigger fonksiyonları
- `fn_bildirim_yeni_dava()` → davalar tablosuna INSERT yapıldığında "Yeni dava eklendi: X" bildirimi
- `fn_bildirim_yeni_icra()` → icra tablosuna INSERT yapıldığında bildirim
- `fn_bildirim_yeni_gorev()` → todolar tablosuna INSERT yapıldığında bildirim
- Trigger: AFTER INSERT ON davalar/icra/todolar → ilgili fonksiyon

### 1d. Migration'ı Supabase'e uygulama
- `supabase/migrations/010_bildirim_son_erisim.sql` dosyası olarak kaydet
- Supabase MCP apply_migration ile uygula

---

## ADIM 2: `useSonErisim` Hook — Supabase'e Geçiş

**Dosya:** `lib/hooks/useSonErisim.ts`

Mevcut: localStorage tabanlı → Yeni: React Query + Supabase

- `sonErisimler` → useQuery: `son_erisimler` tablosundan `sabitlenen = false`, `ORDER BY erisim_zamani DESC LIMIT 20`
- `sabitlenenler` → useQuery: `son_erisimler` tablosundan `sabitlenen = true`
- `kaydetErisim(kayit)` → useMutation: UPSERT (ON CONFLICT kullanici_auth_id, kaynak_id → UPDATE erisim_zamani)
- `toggleSabitle(kayit)` → useMutation: UPDATE sabitlenen = !mevcut
- `isSabitlenen(id)` → sabitlenenler listesinden kontrol

HizliErisimWidget aynı interface'i kullandığı için değişiklik gerektirmez.

---

## ADIM 3: Hava Durumu Sistemi

### 3a. `useHavaDurumu` Hook
**Dosya:** `lib/hooks/useHavaDurumu.ts`

**API:** Open-Meteo (ücretsiz, API key gereksiz)
```
https://api.open-meteo.com/v1/forecast?latitude=X&longitude=Y
  &current=temperature_2m,weather_code,relative_humidity_2m,wind_speed_10m
  &hourly=temperature_2m,weather_code
  &daily=weather_code,temperature_2m_max,temperature_2m_min
  &timezone=Europe/Istanbul&forecast_days=7
```

**Konum stratejisi:**
1. Browser Geolocation API → koordinat al
2. Başarısız → kullanıcı profil ayarlarındaki şehir (localStorage `lb_sehir`)
3. O da yok → varsayılan İstanbul (41.01, 28.98)

**React Query:** staleTime 30dk, refetchInterval 30dk

**WMO Hava Kodu → Türkçe eşleme:**
- 0: Açık ☀️ / 1-3: Parçalı Bulutlu ⛅ / 45-48: Sisli 🌫️ / 51-67: Yağmurlu 🌧️ / 71-77: Karlı ❄️ / 80-82: Sağanak 🌦️ / 95-99: Fırtına ⛈️

### 3b. `HavaDurumuBadge` Bileşeni
**Dosya:** `components/dashboard/HavaDurumuBadge.tsx`

- Dashboard başlığının yanında küçük inline badge
- Gösterim: `☀️ 18°C İstanbul` (ikon + sıcaklık + şehir)
- Tıklanabilir → modal açar
- Loading state: skeleton shimmer
- Hata state: gizle (graceful degradation)

### 3c. `HavaDurumuModal` Bileşeni
**Dosya:** `components/dashboard/HavaDurumuModal.tsx`

Modal içeriği:
1. **Mevcut Durum:** Büyük sıcaklık, ikon, açıklama, nem, rüzgar
2. **Saatlik Tahmin:** Bugünün kalan saatleri, yatay kaydırılabilir kartlar
3. **Haftalık Tahmin:** 7 günlük tahmin, günlük min/max sıcaklık + ikon
4. **Şehir Değiştirme:** Dropdown ile Türkiye şehirleri seçimi

### 3d. Dashboard Entegrasyonu
**Dosya:** `app/(app)/dashboard/page.tsx`

Mevcut başlık satırına badge ekleme:
```tsx
<div className="flex items-center gap-3">
  <h1>Genel Bakış</h1>
  <HavaDurumuBadge onClick={() => setHavaOpen(true)} />
</div>
<HavaDurumuModal open={havaOpen} onClose={() => setHavaOpen(false)} />
```

---

## ADIM 4: Build & Deploy

- `npx next build` → type check + build
- `npx opennextjs-cloudflare build` → Cloudflare bundle
- `npx wrangler deploy` → canlıya al

---

## Dosya Listesi (Yeni + Değişen)

| Dosya | İşlem |
|-------|-------|
| `supabase/migrations/010_bildirim_son_erisim.sql` | YENİ — Migration |
| `lib/hooks/useSonErisim.ts` | GÜNCELLE — localStorage → Supabase |
| `lib/hooks/useHavaDurumu.ts` | YENİ — Weather hook |
| `components/dashboard/HavaDurumuBadge.tsx` | YENİ — Küçük badge |
| `components/dashboard/HavaDurumuModal.tsx` | YENİ — Detay modal |
| `app/(app)/dashboard/page.tsx` | GÜNCELLE — Hava durumu entegrasyonu |

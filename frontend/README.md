# Admin Panel (Vite) Kurulum Notları

## Ortam Değerleri

Çalıştırmadan önce kök dizine bir `.env` dosyası ekleyip aşağıdaki değişkenleri tanımlayın:

```
VITE_API_URL=https://localhost:7245/api
```

Gerekirse ileride başka değişkenler de eklenebilir. `VITE_API_URL` tanımlı değilse uygulama varsayılan olarak `https://localhost:7245/api` adresine istek atar ve konsola uyarı düşer.

## Geliştirme

```
npm install
npm run dev
```

> Not: Admin paneli JWT tabanlıdır. Başarısız 401/403 yanıtlarında kullanıcı otomatik olarak `localStorage` temizlenerek giriş sayfasına yönlendirilir.

## Build & Ücretsiz Dağıtım

1. Üretim paketini oluştur:
   ```
   npm run build
   ```
   Çıkan `dist` klasörünü statik barındırmaya (Vercel, Netlify, Cloudflare Pages vb.) yükleyebilirsin.

2. Platform ayarlarında `VITE_API_URL` değişkenini backend’in HTTPS adresine, gerekiyorsa diğer ortam değişkenlerini tanımla.

3. Vercel gibi Git tabanlı servislerde repo’yu bağlayıp *Root Directory*’yi `frontend` olarak, build komutunu `npm run build`, output klasörünü `dist` olarak ayarlaman yeterli olur.

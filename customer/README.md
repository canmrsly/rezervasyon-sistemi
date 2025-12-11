# Customer Uygulaması Ortam Değerleri

Vite tabanlı müşteri arayüzünü çalıştırmadan önce kök dizine bir `.env` dosyası ekleyip aşağıdaki değişkenleri tanımlayın:

```
VITE_API_URL=https://localhost:7245/api
VITE_RECAPTCHA_SITE_KEY=buraya-google-recaptcha-site-key
```

`VITE_RECAPTCHA_SITE_KEY` değeri Google reCAPTCHA v2/v3 kontrol panelinden alınmalıdır. Yerel geliştirmede dahi boş bırakmayın; aksi halde rezervasyon formundaki doğrulama bileşeni devre dışı kalacaktır.

## Build & Deployment

1. Bağımlılıkları kurup prod build alın:
   ```
   npm install
   npm run build
   ```
   `dist` klasörü statik hosta gönderilir.

2. Vercel/Netlify gibi servislerde proje kökünü `customer` olarak seçip build komutunu `npm run build`, output klasörünü `dist` yapın.

3. Ortam değişkenlerinde `VITE_API_URL` (yayındaki API adresi) ve `VITE_RECAPTCHA_SITE_KEY` (ilgili domain için tanımlanmış anahtar) değerlerini girin.


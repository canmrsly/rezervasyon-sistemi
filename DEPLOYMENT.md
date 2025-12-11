# 🚀 Deployment Guide - Randevu/Rezervasyon Sistemi

Bu guide'da projenizi **tamamen ücretsiz** olarak internete nasıl koyacağınızı adım adım öğreneceksiniz.

## 📊 Genel Bakış

Sistemimiz 3 ana bileşenden oluşuyor:
- **Backend API** (.NET 9 + PostgreSQL) → Railway.app'te deploy edilecek
- **Admin Panel** (React) → Vercel'de deploy edilecek
- **Customer App** (React) → Vercel'de deploy edilecek

---

## 🎯 ADIM 1: Railway.app - Backend Deployment

Railway, Docker container'larınızı ücretsiz host etmenizi sağlar.

### 1.1 Railway Hesabı Oluşturun

1. [railway.app](https://railway.app) adresine gidin
2. "Login" → "Login with GitHub" ile giriş yapın
3. GitHub hesabınızla yetkilendirme yapın

### 1.2 Yeni Proje Oluşturun

1. Railway dashboard'da **"New Project"** butonuna tıklayın
2. **"Deploy from GitHub repo"** seçeneğini seçin
3. Repository listenizden `frontdenemnesi` projesini seçin
4. **"Deploy Now"** butonuna tıklayın

### 1.3 PostgreSQL Veritabanı Ekleyin

1. Proje sayfanızda sağ üstteki **"+ New"** butonuna tıklayın
2. **"Database"** → **"Add PostgreSQL"** seçin
3. Railway otomatik olarak bir PostgreSQL instance oluşturacak

### 1.4 Backend Servisini Yapılandırın

1. Proje içinde **backend service** (siz deploy ettiğinizde otomatik oluşacak) seçin
2. **"Settings"** sekmesine gidin
3. Aşağıdaki ayarları yapın:

#### Root Directory:
```
randevu app
```

#### Build Command (otomatik algılanır, kontrol edin):
```
docker build -t api .
```

#### Start Command:
```
Dockerfile
```

### 1.5 Environment Variables (Ortam Değişkenleri)

Backend servisinizin **"Variables"** sekmesine gidin ve şunları ekleyin:

```bash
ASPNETCORE_ENVIRONMENT=Production

# PostgreSQL Bağlantısı (Railway otomatik sağlar, aşağıdaki gibi olacak)
ConnectionStrings__DefaultConnection=${{Postgres.DATABASE_URL}}

# JWT Secret (GÜVENLİ BİR KELİME OLUŞTURUN!)
Jwt__Key=super-gizli-production-anahtari-buraya-2024

# reCAPTCHA Keys
Captcha__SiteKey=6LeT6hYsAAAAAK6H03TnK_B6DSAgocp3_ZL_ppra
Captcha__SecretKey=6LeT6hYsAAAAAKdtFQommol_6LBsIW24Ot7UdZhs
```

> **ÖNEMLİ:** `${{Postgres.DATABASE_URL}}` yazdığınızda Railway otomatik olarak PostgreSQL connection string'i buraya inject edecektir.

> **GÜVENLİK UYARISI:** Production'da `Jwt__Key` değerini mutlaka değiştirin! Rastgele, güçlü bir anahtar kullanın.

### 1.6 CORS Ayarları

Backend'inizdeki `Program.cs` dosyasında CORS ayarlarını production domain'lerinizle güncelleyin:

```csharp
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins(
            "http://localhost:5173", 
            "http://localhost:5174",
            "https://your-admin-app.vercel.app",  // Admin Vercel URL
            "https://your-customer-app.vercel.app" // Customer Vercel URL
        )
        .AllowAnyHeader()
        .AllowAnyMethod()
        .AllowCredentials();
    });
});
```

### 1.7 Deploy ve Test

1. Railway otomatik olarak deploy edecek
2. **"Deployments"** sekmesinden build loglarını izleyin
3. Deploy tamamlandığında **"Settings" → "Networking"** → "Generate Domain"** ile public URL alın
4. URL'niz şuna benzer olacak: `https://your-app.up.railway.app`

**Test için:**
```
https://your-app.up.railway.app/api/business
```
Bu endpoint bir JSON response dönmeli.

---

## ⚡ ADIM 2: Vercel - Admin Panel Deployment

### 2.1 Vercel Hesabı Oluşturun

1. [vercel.com](https://vercel.com) adresine gidin
2. **"Sign Up"** → **"Continue with GitHub"**
3. GitHub ile yetkilendirme yapın

### 2.2 Admin Panel Deploy

1. Vercel dashboard'da **"Add New..."** → **"Project"**
2. GitHub repository'nizi seçin (`frontdenemnesi`)
3. **"Import"** butonuna tıklayın

### 2.3 Proje Ayarları

**Framework Preset:** Vite
**Root Directory:** `frontend`
**Build Command:** `npm run build`
**Output Directory:** `dist`

### 2.4 Environment Variables

**"Environment Variables"** bölümünde şunları ekleyin:

```bash
VITE_API_URL=https://your-app.up.railway.app/api
VITE_RECAPTCHA_SITE_KEY=6LeT6hYsAAAAAK6H03TnK_B6DSAgocp3_ZL_ppra
```

> **ÖNEMLİ:** `VITE_API_URL` değerini Railway'den aldığınız backend URL ile değiştirin!

### 2.5 Deploy

1. **"Deploy"** butonuna tıklayın
2. Build tamamlandığında Vercel size bir URL verecek: `https://your-admin-panel.vercel.app`

---

## 👥 ADIM 3: Vercel - Customer App Deployment

Aynı adımları customer uygulaması için de tekrarlayın:

### 3.1 Yeni Proje Oluştur

1. Vercel dashboard'da **"Add New..."** → **"Project"**
2. Aynı GitHub repository'yi seçin
3. **"Import"** butonuna tıklayın

### 3.2 Proje Ayarları

**Framework Preset:** Vite
**Root Directory:** `customer`
**Build Command:** `npm run build`
**Output Directory:** `dist`

### 3.3 Environment Variables

```bash
VITE_API_URL=https://your-app.up.railway.app/api
VITE_RECAPTCHA_SITE_KEY=6LeT6hYsAAAAAK6H03TnK_B6DSAgocp3_ZL_ppra
```

### 3.4 Deploy

**"Deploy"** butonuna tıklayın. Customer app URL'niz: `https://your-customer-app.vercel.app`

---

## 🔐 ADIM 4: CORS Güncellemesi (ÖNEMLİ!)

Vercel'den aldığınız URL'leri Railway backend'inizdeki CORS ayarlarına ekleyin:

1. `randevu app/ReservationSystem.Api/Program.cs` dosyasını açın
2. CORS policy'yi güncelleyin:

```csharp
policy.WithOrigins(
    "https://your-admin-panel.vercel.app",
    "https://your-customer-app.vercel.app"
)
```

3. Değişiklikleri commit & push edin
4. Railway otomatik olarak yeniden deploy edecek

---

## ✅ ADIM 5: Doğrulama ve Test

### Backend Testi
```bash
# API health check
https://your-app.up.railway.app/api/business
```

### Admin Panel Testi
1. `https://your-admin-panel.vercel.app` adresine gidin
2. Login sayfası açılmalı
3. Admin hesabı oluşturun/login olun

### Customer App Testi
1. `https://your-customer-app.vercel.app` adresine gidin
2. Rezervasyon formu çalışmalı
3. Rezervasyon oluşturmayı test edin

---

## 📋 Ortam Değişkenleri Özet Tablosu

### Railway (Backend)
| Değişken | Değer |
|----------|-------|
| `ASPNETCORE_ENVIRONMENT` | Production |
| `ConnectionStrings__DefaultConnection` | ${{Postgres.DATABASE_URL}} |
| `Jwt__Key` | (güçlü bir secret key) |
| `Captcha__SiteKey` | 6LeT6hYsAAAAAK6H03TnK_B6DSAgocp3_ZL_ppra |
| `Captcha__SecretKey` | 6LeT6hYsAAAAAKdtFQommol_6LBsIW24Ot7UdZhs |

### Vercel (Admin Panel - frontend)
| Değişken | Değer |
|----------|-------|
| `VITE_API_URL` | https://your-app.up.railway.app/api |
| `VITE_RECAPTCHA_SITE_KEY` | 6LeT6hYsAAAAAK6H03TnK_B6DSAgocp3_ZL_ppra |

### Vercel (Customer App - customer)
| Değişken | Değer |
|----------|-------|
| `VITE_API_URL` | https://your-app.up.railway.app/api |
| `VITE_RECAPTCHA_SITE_KEY` | 6LeT6hYsAAAAAK6H03TnK_B6DSAgocp3_ZL_ppra |

---

## 💰 Ücretsiz Limitler

### Railway.app (Ücretsiz Plan)
- ✅ **500 saat/ay** execution time
- ✅ **1GB RAM**
- ✅ **1GB Disk**
- ✅ PostgreSQL database dahil

> 💡 **İpucu:** Bir aylık kullanım için 500 saat yeterli (24x30 = 720 saat). Yoğun kullanımda sınıra yaklaşırsanız Hobby Plan ($5/ay) düşünebilirsiniz.

### Vercel (Ücretsiz Plan)
- ✅ **Sınırsız** deployment
- ✅ **100GB** bandwidth/ay
- ✅ **Otomatik HTTPS**
- ✅ **Global CDN**

---

## 🐛 Troubleshooting (Sorun Giderme)

### Backend 500 Hatası Alıyorum
- Railway logs'u kontrol edin: **Deployments** → Log'lara bakın
- PostgreSQL connection string'i doğru mu?
- Environment variables eksiksiz mi?

### Frontend'den API'ye istek atamıyorum
- CORS ayarları doğru mu?
- `VITE_API_URL` Railway URL'i ile eşleşiyor mu?
- Browser console'da hata var mı?

### Database migration çalışmıyor
- Railway'de PostgreSQL servisi çalışıyor mu kontrol edin
- Backend logs'ta migration hatası var mı bakın

### reCAPTCHA çalışmıyor
- Google reCAPTCHA admin panelinde domain'lerinizi eklediniz mi?
- Production domain'leri (vercel.app URL'leri) authorized domains'e eklemelisiniz

---

## 🎉 Tebrikler!

Artık sisteminiz tamamen ücretsiz olarak Production'da çalışıyor! 

**URL'leriniz:**
- 🔧 **Backend API:** `https://your-app.up.railway.app`
- 👨‍💼 **Admin Panel:** `https://your-admin-panel.vercel.app`
- 👥 **Customer App:** `https://your-customer-app.vercel.app`

---

## 📞 Sonraki Adımlar

1. **Custom Domain:** Vercel'de kendi domain'inizi bağlayabilirsiniz (ücretsiz)
2. **Monitoring:** Railway ve Vercel dashboard'larından traffic'i izleyin
3. **Analytics:** Google Analytics ekleyebilirsiniz
4. **Email Notifications:** Rezervasyon bildirimleri için email servisi ekleyebilirsiniz (SendGrid, Resend.com ücretsiz planları var)

İyi çalışmalar! 🚀

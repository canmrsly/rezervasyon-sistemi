# 📤 GitHub'a Projeyi Yükleme Rehberi

Bu rehber projenizi adım adım GitHub'a nasıl yükleyeceğinizi gösterir.

## 🎯 Adım 1: Git Kurulumu Kontrolü

Git'in yüklü olup olmadığını kontrol edin:

```bash
git --version
```

Eğer hata alırsanız, [git-scm.com](https://git-scm.com/downloads) adresinden Git'i indirip kurun.

---

## 🔧 Adım 2: Git Kullanıcı Bilgilerini Ayarlayın

Git'i ilk kez kullanıyorsanız, kullanıcı bilgilerinizi ayarlayın:

```bash
git config --global user.name "İsminiz"
git config --global user.email "email@example.com"
```

> **Not:** Email adresiniz GitHub'dakiyle aynı olmalı.

---

## 📁 Adım 3: .gitignore Dosyası Oluşturun

Gereksiz dosyaların GitHub'a yüklenmemesi için `.gitignore` dosyası oluşturun:

Proje kök dizininizde (frontdenemnesi klasöründe) `.gitignore` dosyası oluşturup aşağıdaki içeriği ekleyin:

```gitignore
# Dependencies
node_modules/
**/node_modules/

# Build outputs
**/dist/
**/build/
**/bin/
**/obj/

# .NET
*.dll
*.exe
*.pdb
*.cache
*.user
*.suo
.vs/

# Environment files (ÖNEMLİ: şifreleri GitHub'a yüklemeyin!)
.env
**/.env
.env.local
.env.production

# IDE
.vscode/
.idea/
*.swp
*.swo

# Docker
docker-compose.override.yml

# Logs
*.log
logs/

# OS
.DS_Store
Thumbs.db

# Database
*.db
*.sqlite

# Temporary files
*.tmp
*.temp
```

---

## 🆕 Adım 4: GitHub'da Yeni Repository Oluşturun

1. [GitHub.com](https://github.com) adresine gidin ve giriş yapın
2. Sağ üstteki **"+"** işaretine tıklayın → **"New repository"** seçin
3. Repository ayarları:
   - **Repository name:** `rezervasyon-sistemi` (veya istediğiniz isim)
   - **Description:** "Randevu/Rezervasyon Yönetim Sistemi - .NET 9 + React"
   - **Visibility:** **Private** veya **Public** (tercihinize göre)
   - ⚠️ **Initialize this repository** seçeneklerinden HİÇBİRİNİ SEÇMEYİN (README, .gitignore, license)
4. **"Create repository"** butonuna tıklayın

GitHub size bir sayfa açacak, oradaki komutları kullanacağız.

---

## 💻 Adım 5: Yerel Git Repository'si Oluşturun

PowerShell'de proje dizininize gidin ve şu komutları çalıştırın:

```bash
cd c:\Users\canmurselay\Desktop\frontdenemnesi

# Git repository'si oluştur
git init

# Tüm dosyaları staging area'ya ekle
git add .

# İlk commit'i oluştur
git commit -m "Initial commit: Rezervasyon sistemi - Backend + Frontend + Customer"
```

---

## 🔗 Adım 6: GitHub Repository'sine Bağlayın

GitHub'da oluşturduğunuz repository sayfasında gösterilen URL'i kopyalayın.
URL şuna benzer olacak: `https://github.com/kullanici-adiniz/rezervasyon-sistemi.git`

Sonra şu komutları çalıştırın:

```bash
# GitHub repository'sini remote olarak ekle
git remote add origin https://github.com/KULLANICI-ADINIZ/REPO-ADINIZ.git

# Ana branch ismini 'main' olarak ayarla
git branch -M main

# Projeyi GitHub'a yükle
git push -u origin main
```

---

## 🔐 GitHub Authentication

İlk push sırasında GitHub size authentication soracak:

### Yöntem 1: GitHub Desktop (Kolay)
1. [GitHub Desktop](https://desktop.github.com/) uygulamasını indirin
2. GitHub hesabınızla giriş yapın
3. "Add Existing Repository" ile projenizi ekleyin
4. "Publish repository" butonuyla yükleyin

### Yöntem 2: Personal Access Token (Komut Satırı)
1. GitHub → **Settings** → **Developer settings** → **Personal access tokens** → **Tokens (classic)**
2. **"Generate new token (classic)"**
3. Scope'lar: `repo` (tüm kutucukları işaretleyin)
4. Token'ı kopyalayın (bir daha göremezsiniz!)
5. Push yaparken şifre istediğinde bu token'ı kullanın

---

## ✅ Adım 7: Yüklemeyi Doğrulayın

GitHub repository sayfanıza gidin (`https://github.com/kullanici-adiniz/repo-adiniz`)

Şu klasör yapısını görmelisiniz:
```
frontdenemnesi/
├── customer/
├── frontend/
├── randevu app/
├── docker-compose.yml
├── DEPLOYMENT.md
└── .gitignore
```

---

## 🚀 ARTIK RAILWAY'DE DEPLOY EDEBİLİRSİNİZ!

GitHub'a yükleme tamamlandı! Şimdi Railway deployment adımlarını izleyebilirsiniz:

1. [railway.app](https://railway.app) → Login with GitHub
2. New Project → Deploy from GitHub repo
3. Repository'nizi seçin (`rezervasyon-sistemi`)
4. Deploy!

Railway otomatik olarak `Dockerfile` ve `docker-compose.yml` dosyalarını algılayacak.

---

## 🔄 Gelecekte Değişiklik Yaptığınızda

Projenizde değişiklik yaptığınızda GitHub'a şöyle yükleyin:

```bash
# Değişiklikleri staging'e ekle
git add .

# Commit oluştur (açıklayıcı mesaj yazın)
git commit -m "CORS ayarları güncellendi"

# GitHub'a yükle
git push
```

Railway otomatik olarak yeni değişiklikleri algılayıp re-deploy edecek! 🎉

---

## 🛠️ Faydalı Git Komutları

```bash
# Değişiklikleri kontrol et
git status

# Değişiklikleri görüntüle
git diff

# Commit geçmişini gör
git log --oneline

# Son commit'i geri al (dikkatli kullanın!)
git reset --soft HEAD~1

# Tüm değişiklikleri eski haline döndür
git checkout .
```

---

## ⚠️ ÖNEMLİ UYARILAR

> [!WARNING]
> **Şifreleri GitHub'a Yüklemeyin!**
> 
> `.gitignore` dosyası `.env` dosyalarını otomatik olarak hariç tutar. Ama yine de kontrol edin:
> ```bash
> git status
> ```
> Eğer `.env` dosyaları görünüyorsa, `.gitignore`'u kontrol edin!

> [!IMPORTANT]
> **Production Şifreleri**
> 
> Production şifrelerinizi (JWT Key, database password) asla GitHub'a yüklemeyin!
> Bunları Railway ve Vercel'de environment variables olarak ayarlayın.

---

## 🎉 Tebrikler!

Artık projeniz GitHub'da ve Railway ile deploy etmeye hazırsınız!

**Sıradaki adımlar:**
1. ✅ GitHub'a yüklediniz
2. ⏭️ Railway'de deploy edin ([DEPLOYMENT.md](DEPLOYMENT.md) dosyasındaki adımları izleyin)
3. ⏭️ Vercel'de frontend'leri deploy edin

İyi çalışmalar! 🚀

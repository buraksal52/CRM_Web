# Deployment Checklist

Netlify ve diğer platformlara deployment için adım adım rehber.

## 🎯 Netlify Deployment Checklist

### ✅ Ön Hazırlık

- [ ] `_redirects` dosyası eklendi (`crm_frontend/public/_redirects`)
- [ ] `netlify.toml` yapılandırması oluşturuldu
- [ ] Environment variables belirlendi
- [ ] Backend API URL'i hazır
- [ ] CORS ayarları backend'de yapıldı

### ✅ Build Test

```bash
cd crm_frontend
npm run build
npm run preview  # Build'i test edin
```

- [ ] Build başarıyla tamamlandı
- [ ] `dist/` klasörü oluştu
- [ ] Preview'da sayfa açılıyor
- [ ] Routing çalışıyor (farklı sayfalara gidip refresh yapın)

### ✅ Netlify Deployment

1. **GitHub'a Push:**
```bash
git add .
git commit -m "chore: Add Netlify deployment configuration"
git push origin main
```
- [ ] Kod GitHub'a push edildi

2. **Netlify'da Site Oluştur:**
- [ ] [Netlify Dashboard](https://app.netlify.com/) açıldı
- [ ] "Add new site" → "Import an existing project" seçildi
- [ ] GitHub repository bağlandı
- [ ] Repository seçildi: `CRM_Web`

3. **Build Settings:**
- [ ] Base directory: `crm_frontend`
- [ ] Build command: `npm run build`
- [ ] Publish directory: `dist`
- [ ] Node version: 18 (otomatik algılanır)

4. **Environment Variables:**
   
   Site settings → Build & deploy → Environment variables → Add variable
   
   - [ ] `VITE_API_URL` = Backend API URL (örn: `https://your-backend.herokuapp.com/api`)

5. **Deploy:**
- [ ] "Deploy site" butonuna tıklandı
- [ ] Build log'larını izleyin
- [ ] Build başarılı oldu ✅

### ✅ Deploy Sonrası Kontroller

- [ ] Site açılıyor (Netlify URL'iniz)
- [ ] Login sayfası görünüyor
- [ ] Register çalışıyor
- [ ] Login başarılı (backend bağlantısı OK)
- [ ] Dashboard açılıyor
- [ ] Customers sayfası çalışıyor
- [ ] Leads sayfası çalışıyor
- [ ] Tasks sayfası çalışıyor
- [ ] API istekleri başarılı
- [ ] Logout çalışıyor
- [ ] Sayfa yenileme sonrası 404 hatası YOK ✅
- [ ] Doğrudan URL ile sayfa açılıyor (örn: `/dashboard`, `/customers`)

### 🐛 Yaygın Sorunlar

#### Problem: Page Not Found (404)
**Çözüm:**
```bash
# _redirects dosyasını kontrol edin
cat crm_frontend/public/_redirects
# İçerik: /*    /index.html   200

# veya netlify.toml kontrol edin
```

#### Problem: API bağlantı hatası
**Çözüm:**
1. Environment variable kontrolü:
   - Netlify Dashboard → Site settings → Environment variables
   - `VITE_API_URL` doğru mu?

2. CORS kontrolü (Backend):
```python
# settings.py
CORS_ALLOWED_ORIGINS = [
    "http://localhost:5173",
    "https://your-site.netlify.app",  # Netlify URL'inizi ekleyin
]
```

3. Backend'i yeniden başlatın

#### Problem: Build Failed
**Çözüm:**
```bash
# Base directory kontrol edin
# Netlify settings: Base directory = crm_frontend

# Package.json kontrol edin
cat crm_frontend/package.json

# Node version kontrol edin (netlify.toml)
NODE_VERSION = "18"
```

#### Problem: Blank Page
**Çözüm:**
1. Browser console'u açın (F12)
2. Hata mesajlarını kontrol edin
3. Network tab'ı kontrol edin
4. Environment variables doğru mu kontrol edin

## 🎯 Backend Deployment Checklist (Heroku)

### ✅ Ön Hazırlık

1. **Production Dependencies:**
```bash
# requirements.txt oluşturun
pip freeze > requirements.txt

# Gunicorn ekleyin
pip install gunicorn
pip freeze > requirements.txt
```
- [ ] `requirements.txt` güncel

2. **Procfile oluşturun:**
```bash
echo "web: gunicorn crm_project.wsgi" > Procfile
```
- [ ] `Procfile` oluşturuldu

3. **Static files yapılandırması:**
```bash
pip install whitenoise
```

`settings.py` güncelleyin:
```python
MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',  # Ekleyin
    # ...
]

STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')
STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'
```
- [ ] WhiteNoise yapılandırıldı

### ✅ Heroku Deployment

1. **Heroku CLI kurulumu:**
```bash
# https://devcenter.heroku.com/articles/heroku-cli
heroku --version
```
- [ ] Heroku CLI kurulu

2. **Login:**
```bash
heroku login
```
- [ ] Heroku'ya login yapıldı

3. **App oluştur:**
```bash
heroku create your-crm-backend
```
- [ ] Heroku app oluşturuldu

4. **PostgreSQL ekle:**
```bash
heroku addons:create heroku-postgresql:mini
```
- [ ] PostgreSQL eklendi

5. **Environment Variables:**
```bash
heroku config:set SECRET_KEY="your-secret-key"
heroku config:set DEBUG=False
heroku config:set DJANGO_ALLOWED_HOSTS=your-crm-backend.herokuapp.com
```
- [ ] Environment variables eklendi

6. **Deploy:**
```bash
git push heroku main
```
- [ ] Backend deploy edildi

7. **Migrate:**
```bash
heroku run python manage.py migrate
heroku run python manage.py createsuperuser
```
- [ ] Migration tamamlandı
- [ ] Superuser oluşturuldu

### ✅ Backend Sonrası Kontroller

- [ ] API endpoint'ler çalışıyor
- [ ] `/api/token/` (login) çalışıyor
- [ ] `/api/customers/` çalışıyor
- [ ] `/swagger/` dokümantasyon açılıyor
- [ ] CORS ayarları Netlify domain'ini içeriyor

## 🎯 Production Settings Checklist

### Django Backend

```python
# settings.py

# Security
DEBUG = False  # ✅
SECRET_KEY = os.environ.get('SECRET_KEY')  # ✅
ALLOWED_HOSTS = ['your-backend.herokuapp.com']  # ✅

# Database
# SQLite yerine PostgreSQL  # ✅

# CORS
CORS_ALLOWED_ORIGINS = [
    "https://your-frontend.netlify.app",  # ✅
]

# Static Files
STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')  # ✅

# HTTPS
SECURE_SSL_REDIRECT = True  # ✅
SESSION_COOKIE_SECURE = True  # ✅
CSRF_COOKIE_SECURE = True  # ✅
```

### React Frontend

```javascript
// .env.production
VITE_API_URL=https://your-backend.herokuapp.com/api  // ✅
```

## 📊 Final Checklist

- [ ] Frontend Netlify'da live
- [ ] Backend Heroku'da live
- [ ] Domain'ler birbirine bağlı
- [ ] HTTPS aktif
- [ ] Login/Register çalışıyor
- [ ] CRUD operasyonları çalışıyor
- [ ] Tüm sayfalar erişilebilir
- [ ] Mobile responsive
- [ ] Performance test OK
- [ ] Error handling çalışıyor

## 🎉 Deployment Tamamlandı!

Siteniz artık production'da! 🚀

**Netlify Dashboard:**
- Site URL: `https://your-site.netlify.app`
- Deploy logs: Site overview → Production deploys

**Heroku Dashboard:**
- App URL: `https://your-backend.herokuapp.com`
- Logs: `heroku logs --tail`

**Monitoring:**
```bash
# Backend logs
heroku logs --tail

# Frontend build logs
# Netlify Dashboard → Deploys → Deploy log
```

## 🔄 Güncellemeler

Her kod değişikliğinde:

1. **Git push:**
```bash
git add .
git commit -m "feat: New feature"
git push origin main
```

2. **Otomatik deploy:**
- Netlify: Otomatik build ve deploy ✅
- Heroku: Otomatik deploy (GitHub integration ile) ✅

## 📞 Destek

Sorun yaşarsanız:
1. Build log'larını kontrol edin
2. Environment variables'ları doğrulayın
3. CORS ayarlarını kontrol edin
4. Backend ve frontend sürümlerinin uyumlu olduğundan emin olun

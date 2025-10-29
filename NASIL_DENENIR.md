# 🚀 CRM Projesini Nasıl Deneyebilirsiniz?

Bu rehber, CRM projenizi yerel ortamınızda çalıştırmanız ve test etmeniz için adım adım talimatlar içerir.

---

## 📋 Ön Gereksinimler

Aşağıdaki yazılımların bilgisayarınızda kurulu olduğundan emin olun:

- ✅ **Python 3.12.5** (veya üzeri)
- ✅ **Node.js** (v16 veya üzeri) ve **npm**
- ✅ **Git** (proje klonlama için)
- ✅ **Visual Studio Code** (önerilen IDE)

---

## 🔧 Kurulum Adımları

### 1️⃣ Backend (Django) Kurulumu

#### Adım 1.1: Virtual Environment Aktif Edin
PowerShell'de proje klasörüne gidin ve virtual environment'ı aktif edin:

```powershell
cd C:\Users\user\Desktop\Proje\Web_Projects\CRM
.\venv\Scripts\Activate.ps1
```

**Not**: Eğer PowerShell execution policy hatası alırsanız:
```powershell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
```

#### Adım 1.2: Gerekli Paketlerin Kurulu Olduğunu Kontrol Edin
```powershell
pip list
```

Eksik paket varsa:
```powershell
pip install -r requirements.txt
```

#### Adım 1.3: Veritabanı Migration'larını Uygulayın
```powershell
python manage.py migrate
```

#### Adım 1.4: Admin Kullanıcısı Oluşturun (İlk kurulumsa)
```powershell
python manage.py createsuperuser
```
- **Username**: admin
- **Email**: admin@example.com
- **Password**: admin123 (veya istediğiniz bir şifre)

#### Adım 1.5: Test Verisi Oluşturun (Opsiyonel)
```powershell
python manage.py test_query_performance --create-data
```

Bu komut otomatik olarak oluşturur:
- 10 müşteri (Customer)
- 10 potansiyel satış (Lead)
- 10 görev (Task)

---

### 2️⃣ Frontend (React) Kurulumu

#### Adım 2.1: Yeni Bir Terminal/PowerShell Penceresi Açın
(Backend sunucusu çalışırken ayrı bir pencere gereklidir)

#### Adım 2.2: Frontend Klasörüne Gidin
```powershell
cd C:\Users\user\Desktop\Proje\Web_Projects\CRM\crm_frontend
```

#### Adım 2.3: Node Modüllerini Kurun (İlk kurulumsa)
```powershell
npm install
```

---

## ▶️ Projeyi Çalıştırma

### Backend Sunucusu (Django)
**Terminal 1 - Backend** (proje ana klasöründe):
```powershell
cd C:\Users\user\Desktop\Proje\Web_Projects\CRM
.\venv\Scripts\Activate.ps1
python manage.py runserver
```

✅ Backend şurada çalışacak: **http://127.0.0.1:8000**

### Frontend Sunucusu (React)
**Terminal 2 - Frontend** (frontend klasöründe):
```powershell
cd C:\Users\user\Desktop\Proje\Web_Projects\CRM\crm_frontend
npm run dev
```

✅ Frontend şurada çalışacak: **http://localhost:5173**

---

## 🌐 Uygulamaya Erişim

### 1. React Web Arayüzü
Tarayıcınızda açın:
```
http://localhost:5173
```

**Giriş Bilgileri** (superuser oluşturduysanız):
- **Kullanıcı Adı**: admin
- **Şifre**: admin123 (veya belirlediğiniz şifre)

### 2. Django Admin Paneli
Tarayıcınızda açın:
```
http://127.0.0.1:8000/admin
```

**Giriş Bilgileri**:
- **Kullanıcı Adı**: admin
- **Şifre**: admin123

### 3. API Dokümantasyonu (Swagger UI)
Tarayıcınızda açın:
```
http://127.0.0.1:8000/api/docs/
```

### 4. API Dokümantasyonu (ReDoc)
Tarayıcınızda açın:
```
http://127.0.0.1:8000/api/redoc/
```

### 5. OpenAPI Schema (JSON)
```
http://127.0.0.1:8000/api/schema/
```

---

## 🧪 Özellikleri Test Etme

### Test 1: Kullanıcı Kayıt ve Giriş
1. `http://localhost:5173` adresine gidin
2. **"Register"** butonuna tıklayın
3. Yeni bir kullanıcı oluşturun
4. Giriş yapın

### Test 2: Müşteri (Customer) Ekleme
1. Giriş yaptıktan sonra **"Customers"** sekmesine gidin
2. **"Add Customer"** butonuna tıklayın
3. Formu doldurun:
   - Name: "Ahmet Yılmaz"
   - Email: "ahmet@example.com"
   - Phone: "05551234567"
   - Company: "ABC Şirketi"
4. **"Create"** butonuna tıklayın
5. ✅ **Toast bildirimi** göreceksiniz: "Customer created successfully!"

### Test 3: Potansiyel Satış (Lead) Ekleme
1. **"Leads"** sekmesine gidin
2. **"Add Lead"** butonuna tıklayın
3. Formu doldurun:
   - Title: "Yeni Satış Fırsatı"
   - Customer: Müşteri seçin
   - Value: 50000
   - Stage: "Qualified"
   - Priority: "High"
4. **"Create"** butonuna tıklayın
5. ✅ Lead listesinde göreceksiniz

### Test 4: Görev (Task) Ekleme
1. **"Tasks"** sekmesine gidin
2. **"Add Task"** butonuna tıklayın
3. Formu doldurun:
   - Title: "Müşteriyle görüşme yap"
   - Description: "Proje detaylarını konuş"
   - Due Date: Bir tarih seçin
   - Priority: "High"
   - Status: "Pending"
4. **"Create"** butonuna tıklayın
5. ✅ Görev listesinde göreceksiniz

### Test 5: Dashboard ve Grafikler
1. **"Dashboard"** sekmesine gidin
2. ✅ Aşağıdaki grafikleri göreceksiniz:
   - **Bar Chart**: Lead'lerin stage'lere göre dağılımı
   - **Doughnut Chart**: Task'ların durumlarına göre dağılımı
   - İstatistikler: Toplam müşteri, lead, task sayıları

### Test 6: Dark Mode (Karanlık Tema)
1. Sağ üst köşede **ay/güneş ikonuna** tıklayın
2. ✅ Tema değişecek
3. Sayfayı yenileyin
4. ✅ Tema tercihini hatırlayacak (localStorage)

### Test 7: Rate Limiting Testi
1. Swagger UI'ye gidin: `http://127.0.0.1:8000/api/docs/`
2. **POST /api/login/** endpoint'ini bulun
3. **"Try it out"** butonuna tıklayın
4. 6 kez üst üste **"Execute"** yapın
5. ✅ 6. denemede **429 Too Many Requests** hatası alacaksınız

### Test 8: Query Optimization Testi
PowerShell'de:
```powershell
python manage.py test_query_performance
```

✅ Sonuç:
- Lead Endpoint: **90% sorgu azalması** (11 → 1)
- Task Endpoint: **90% sorgu azalması** (11 → 1)

### Test 9: API Dokümantasyonu
1. `http://127.0.0.1:8000/api/docs/` adresine gidin
2. ✅ Tüm endpoint'leri göreceksiniz
3. **Authorize** butonuna tıklayın
4. Giriş yaparak JWT token alın
5. Herhangi bir endpoint'i test edin

---

## 🎯 Temel API Endpoint'leri

### Authentication (Kimlik Doğrulama)
```
POST /api/register/      - Yeni kullanıcı kaydı
POST /api/login/         - Giriş yap (JWT token al)
POST /api/token/refresh/ - Token yenile
GET  /api/user/me/       - Kullanıcı bilgilerini al
```

### Customers (Müşteriler)
```
GET    /api/customers/     - Tüm müşterileri listele
POST   /api/customers/     - Yeni müşteri ekle
GET    /api/customers/{id}/ - Müşteri detayı
PUT    /api/customers/{id}/ - Müşteri güncelle
DELETE /api/customers/{id}/ - Müşteri sil
```

### Leads (Potansiyel Satışlar)
```
GET    /api/leads/     - Tüm lead'leri listele
POST   /api/leads/     - Yeni lead ekle
GET    /api/leads/{id}/ - Lead detayı
PUT    /api/leads/{id}/ - Lead güncelle
DELETE /api/leads/{id}/ - Lead sil
```

### Tasks (Görevler)
```
GET    /api/tasks/     - Tüm görevleri listele
POST   /api/tasks/     - Yeni görev ekle
GET    /api/tasks/{id}/ - Görev detayı
PUT    /api/tasks/{id}/ - Görev güncelle
DELETE /api/tasks/{id}/ - Görev sil
```

---

## 🔍 API Test Örneği (PowerShell ile)

### 1. Kullanıcı Kaydı
```powershell
$body = @{
    username = "testuser"
    email = "test@example.com"
    password = "test123"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://127.0.0.1:8000/api/register/" -Method POST -Body $body -ContentType "application/json"
```

### 2. Giriş Yap (Token Al)
```powershell
$loginBody = @{
    username = "testuser"
    password = "test123"
} | ConvertTo-Json

$response = Invoke-RestMethod -Uri "http://127.0.0.1:8000/api/login/" -Method POST -Body $loginBody -ContentType "application/json"
$token = $response.access
```

### 3. Müşteri Listele (Token ile)
```powershell
$headers = @{
    Authorization = "Bearer $token"
}

Invoke-RestMethod -Uri "http://127.0.0.1:8000/api/customers/" -Method GET -Headers $headers
```

---

## 🛠️ Yaygın Sorunlar ve Çözümleri

### Sorun 1: "Port 8000 zaten kullanımda"
**Çözüm**:
```powershell
# Başka bir port kullanın
python manage.py runserver 8001
```

### Sorun 2: "Port 5173 zaten kullanımda"
**Çözüm**:
Frontend'de `vite.config.js` dosyasını düzenleyin:
```javascript
export default defineConfig({
  server: {
    port: 5174
  }
})
```

### Sorun 3: "CORS Error" (Tarayıcı konsolunda)
**Çözüm**:
`settings.py` dosyasında `CORS_ALLOWED_ORIGINS` kontrol edin:
```python
CORS_ALLOWED_ORIGINS = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]
```

### Sorun 4: "Database is locked" hatası
**Çözüm**:
```powershell
# Sunucuları durdurun (Ctrl+C)
# Migration'ları tekrar uygulayın
python manage.py migrate
```

### Sorun 5: Virtual Environment aktif edilemiyor
**Çözüm**:
```powershell
# PowerShell execution policy ayarlayın
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass

# Ardından tekrar deneyin
.\venv\Scripts\Activate.ps1
```

---

## 📊 Test Komutları

### Veritabanı Sorgu Performansını Test Et
```powershell
python manage.py test_query_performance
```

### Rate Limiting Test Et
```powershell
python manage.py test_rate_limit
```

### Test Verisi Oluştur
```powershell
python manage.py test_query_performance --create-data
```

### Django Shell'e Gir (Manuel test için)
```powershell
python manage.py shell
```

---

## 🎨 Frontend Özellikleri

### ✅ Dark Mode
- Sağ üst köşedeki ay/güneş ikonuna tıklayın
- Tercih localStorage'da saklanır

### ✅ Toast Notifications
- Her CRUD işleminde (create, update, delete) bildirim gösterilir
- Başarı: Yeşil
- Hata: Kırmızı
- Bilgi: Mavi
- Uyarı: Sarı

### ✅ Interactive Charts
- Dashboard'da 2 grafik:
  - Bar Chart: Lead stage dağılımı
  - Doughnut Chart: Task status dağılımı

### ✅ Responsive Design
- Mobil, tablet ve masaüstü uyumlu
- Tailwind CSS ile tasarlanmış

---

## 📝 Önemli Notlar

1. **Backend ve Frontend'i Aynı Anda Çalıştırın**
   - Backend: `http://127.0.0.1:8000`
   - Frontend: `http://localhost:5173`

2. **Test Verisi Kullanın**
   - Boş veritabanında grafik göremezsiniz
   - Test verisi oluşturmak için: `python manage.py test_query_performance --create-data`

3. **Admin Paneli Kullanımı**
   - Django admin'den de veri ekleyebilirsiniz
   - `http://127.0.0.1:8000/admin`

4. **API Dokümantasyonu**
   - Swagger UI interaktif test imkanı sunar
   - ReDoc daha temiz dokümantasyon sağlar

5. **Rate Limiting**
   - Login endpoint'i 5 request/minute ile sınırlıdır
   - Test için Swagger UI kullanın

---

## 🚀 Hızlı Başlangıç (Tek Komut)

### Backend Başlat
```powershell
cd C:\Users\user\Desktop\Proje\Web_Projects\CRM; .\venv\Scripts\Activate.ps1; python manage.py runserver
```

### Frontend Başlat (Yeni Terminal)
```powershell
cd C:\Users\user\Desktop\Proje\Web_Projects\CRM\crm_frontend; npm run dev
```

---

## 📚 Ek Kaynaklar

- **QA Test Raporu**: `QA_TEST_REPORT_DAY5.md` dosyasında detaylı test sonuçları
- **API Schema**: `schema.yml` dosyasında OpenAPI 3.0 şeması
- **Django Admin**: Veritabanı yönetimi için `http://127.0.0.1:8000/admin`

---

## ✅ Başarı Kontrol Listesi

Test ederken şunları kontrol edin:

- [ ] Backend sunucusu çalışıyor (`http://127.0.0.1:8000`)
- [ ] Frontend sunucusu çalışıyor (`http://localhost:5173`)
- [ ] Kullanıcı kaydı yapabiliyorum
- [ ] Giriş yapabiliyorum
- [ ] Müşteri ekleyebiliyorum
- [ ] Lead ekleyebiliyorum
- [ ] Görev ekleyebiliyorum
- [ ] Dashboard grafikleri görünüyor
- [ ] Dark mode çalışıyor
- [ ] Toast bildirimleri gösteriliyor
- [ ] Swagger UI açılıyor (`http://127.0.0.1:8000/api/docs/`)
- [ ] Rate limiting çalışıyor (6. denemede 429 hatası)
- [ ] Veri silme işlemi çalışıyor
- [ ] Veri güncelleme işlemi çalışıyor

---

**İyi Testler! 🎉**

Sorularınız için: GitHub Issues veya Email

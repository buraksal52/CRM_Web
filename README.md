# FlowCRM

Modern, hızlı, minimal ve profesyonel bir CRM sistemi.

## 🚀 Özellikler

- **Müşteri Yönetimi**: Müşteri bilgilerini görüntüleme, ekleme, düzenleme ve silme
- **Potansiyel Müşteriler (Leads)**: Lead takibi ve durum yönetimi (Açık/Kazanıldı/Kaybedildi)
- **Görev Yönetimi**: Görev oluşturma, atama ve tamamlanma durumu takibi
- **Dashboard**: Gerçek zamanlı istatistikler ve grafikler
- **Kimlik Doğrulama**: JWT tabanlı güvenli oturum yönetimi
- **Modern UI**: Navy mavi ve beyaz temalı, responsive tasarım
- **API Dokümantasyonu**: OpenAPI/Swagger entegrasyonu

## 🛠️ Teknoloji Stack'i

### Backend
- **Django 4.2+**: Python web framework
- **Django REST Framework**: RESTful API
- **SQLite**: Veritabanı
- **JWT Authentication**: rest_framework_simplejwt
- **drf-yasg**: API dokümantasyonu

### Frontend
- **React 18**: UI framework
- **Vite**: Build tool ve dev server
- **React Router**: Sayfa navigasyonu
- **Chart.js**: Veri görselleştirme
- **Axios**: HTTP client
- **React Hot Toast**: Bildirim sistemi

## 📦 Kurulum

### Gereksinimler
- Python 3.8+
- Node.js 16+
- npm veya yarn

### Backend Kurulumu

1. Sanal ortam oluşturun ve aktifleştirin:
```bash
python -m venv venv
venv\Scripts\activate  # Windows
# source venv/bin/activate  # Linux/Mac
```

2. Gerekli paketleri yükleyin:
```bash
pip install django djangorestframework djangorestframework-simplejwt django-cors-headers drf-yasg
```

3. Veritabanı migration'larını çalıştırın:
```bash
python manage.py migrate
```

4. Superuser oluşturun:
```bash
python manage.py createsuperuser
```

5. Geliştirme sunucusunu başlatın:
```bash
python manage.py runserver
```

Backend varsayılan olarak `http://localhost:8000` adresinde çalışacaktır.

### Frontend Kurulumu

1. Frontend dizinine gidin:
```bash
cd crm_frontend
```

2. Bağımlılıkları yükleyin:
```bash
npm install
```

3. Geliştirme sunucusunu başlatın:
```bash
npm run dev
```

Frontend varsayılan olarak `http://localhost:5173` adresinde çalışacaktır.

## 📁 Proje Yapısı

```
CRM/
├── crm_app/                    # Django uygulaması
│   ├── management/            # Custom Django komutları
│   ├── migrations/            # Veritabanı migration'ları
│   ├── models.py              # Veri modelleri
│   ├── serializers.py         # DRF serializers
│   ├── views.py               # API view'ları
│   ├── urls.py                # URL yapılandırması
│   ├── permissions.py         # Özel izinler
│   └── middleware.py          # Custom middleware
│
├── crm_project/               # Django proje ayarları
│   ├── settings.py            # Ana ayarlar
│   ├── urls.py                # Root URL yapılandırması
│   └── wsgi.py                # WSGI yapılandırması
│
├── crm_frontend/              # React uygulaması
│   ├── src/
│   │   ├── api/              # API istemci yapılandırması
│   │   ├── components/       # Yeniden kullanılabilir bileşenler
│   │   ├── pages/            # Sayfa bileşenleri
│   │   ├── hooks/            # Custom React hooks
│   │   ├── utils/            # Yardımcı fonksiyonlar
│   │   ├── App.jsx           # Ana uygulama bileşeni
│   │   ├── main.jsx          # Giriş noktası
│   │   └── index.css         # Global stiller
│   │
│   ├── public/               # Statik dosyalar
│   ├── package.json          # NPM bağımlılıkları
│   └── vite.config.js        # Vite yapılandırması
│
├── docs/                      # Dokümantasyon
├── venv/                      # Python sanal ortamı
├── db.sqlite3                # SQLite veritabanı
├── manage.py                 # Django yönetim scripti
└── schema.yml                # OpenAPI şeması
```

## 🔑 API Endpoints

### Authentication
- `POST /api/token/` - JWT token alma
- `POST /api/token/refresh/` - Token yenileme

### Customers
- `GET /api/customers/` - Tüm müşterileri listele
- `POST /api/customers/` - Yeni müşteri oluştur
- `GET /api/customers/{id}/` - Müşteri detayı
- `PUT /api/customers/{id}/` - Müşteri güncelle
- `DELETE /api/customers/{id}/` - Müşteri sil

### Leads
- `GET /api/leads/` - Tüm lead'leri listele
- `POST /api/leads/` - Yeni lead oluştur
- `GET /api/leads/{id}/` - Lead detayı
- `PUT /api/leads/{id}/` - Lead güncelle
- `DELETE /api/leads/{id}/` - Lead sil

### Tasks
- `GET /api/tasks/` - Tüm görevleri listele
- `POST /api/tasks/` - Yeni görev oluştur
- `GET /api/tasks/{id}/` - Görev detayı
- `PUT /api/tasks/{id}/` - Görev güncelle
- `DELETE /api/tasks/{id}/` - Görev sil

### Documentation
- `GET /swagger/` - Swagger UI
- `GET /redoc/` - ReDoc UI
- `GET /swagger.json` - OpenAPI JSON schema

## 🎨 Tasarım Sistemi

- **Ana Renkler**:
  - Navy Blue: `#1e40af` (primary)
  - Dark Navy: `#1e3a8a` (primary-dark)
  - White: `#ffffff`
  - Light Gray: `#f3f4f6` (background)

- **Tipografi**: System font stack (SF Pro, Segoe UI, Roboto)
- **Animasyonlar**: Smooth transitions ve hover efektleri
- **Responsive**: Mobil-öncelikli tasarım

## 🔒 Güvenlik

- JWT tabanlı kimlik doğrulama
- CORS yapılandırması
- CSRF koruması
- Güvenli HTTP headers
- Input validasyonu

## �📝 Geliştirme Notları

- Backend API `http://localhost:8000` adresinde çalışır
- Frontend `http://localhost:5173` adresinde çalışır
- SQLite veritabanı kullanılmaktadır (production için PostgreSQL önerilir)
- Tüm API istekleri JWT token gerektirir (login hariç)

## 🤝 Katkıda Bulunma

1. Fork yapın
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Değişikliklerinizi commit edin (`git commit -m 'feat: Add amazing feature'`)
4. Branch'inizi push edin (`git push origin feature/amazing-feature`)
5. Pull Request oluşturun

## 👤 İletişim

Proje Sahibi - [@buraksal52](https://github.com/buraksal52)

Proje Linki: [https://github.com/buraksal52/CRM_Web](https://github.com/buraksal52/CRM_Web)

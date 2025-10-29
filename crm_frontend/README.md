# CRM Frontend

Modern ve responsive CRM uygulaması frontend kısmı.

## 🚀 Teknolojiler

- **React 18** - UI framework
- **Vite** - Build tool ve dev server
- **React Router DOM** - Sayfa yönlendirme
- **Axios** - HTTP client
- **Chart.js** - Veri görselleştirme
- **React Hot Toast** - Bildirim sistemi

## 📦 Kurulum

```bash
# Bağımlılıkları yükle
npm install

# Development server'ı başlat
npm run dev

# Production build
npm run build

# Build önizleme
npm run preview
```

## 📁 Proje Yapısı

```
src/
├── api/              # API client yapılandırması
│   └── axios.js      # Axios instance ve interceptors
├── components/       # Yeniden kullanılabilir bileşenler
│   ├── Layout.jsx    # Navigation wrapper
│   ├── ConfirmModal.jsx
│   └── LoadingSpinner.jsx
├── pages/           # Sayfa bileşenleri
│   ├── Dashboard.jsx
│   ├── Customers.jsx
│   ├── Leads.jsx
│   ├── Tasks.jsx
│   ├── Login.jsx
│   └── Register.jsx
├── hooks/           # Custom React hooks
├── utils/           # Yardımcı fonksiyonlar
├── App.jsx          # Ana uygulama
├── main.jsx         # Giriş noktası
└── index.css        # Global stiller
```

## 🎨 Tasarım Sistemi

### Renkler
- Primary: `#1e40af` (Navy Blue)
- Primary Dark: `#1e3a8a`
- Background: `#f3f4f6`
- White: `#ffffff`

### CSS Custom Properties

Tüm renkler ve spacing değerleri `index.css` içinde CSS custom properties olarak tanımlanmıştır:

```css
:root {
  --color-primary: #1e40af;
  --color-primary-dark: #1e3a8a;
  --spacing-md: 1rem;
  /* ... diğerleri */
}
```

## 🔌 API Entegrasyonu

### Base Configuration

```javascript
// src/api/axios.js
const api = axios.create({
  baseURL: 'http://localhost:8000/api',
});

// Request interceptor - Token ekleme
api.interceptors.request.use((config) => {
  const token = sessionStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor - Hata yönetimi
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token geçersiz - login'e yönlendir
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
```

### Kullanım Örneği

```javascript
import api from '../api/axios';

// GET request
const fetchCustomers = async () => {
  const response = await api.get('/customers/?limit=1000');
  return response.data.results || response.data || [];
};

// POST request
const createCustomer = async (data) => {
  const response = await api.post('/customers/', data);
  return response.data;
};

// PUT request
const updateCustomer = async (id, data) => {
  const response = await api.put(`/customers/${id}/`, data);
  return response.data;
};

// DELETE request
const deleteCustomer = async (id) => {
  await api.delete(`/customers/${id}/`);
};
```

## 📊 Chart.js Kullanımı

### Bar Chart Örneği

```javascript
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

function MyChart({ data }) {
  const chartData = {
    labels: ['Customers', 'Leads', 'Tasks'],
    datasets: [{
      label: 'Statistics',
      data: [data.customers, data.leads, data.tasks],
      backgroundColor: 'rgba(30, 64, 175, 0.8)',
    }]
  };

  return <Bar data={chartData} />;
}
```

## 🎯 Sayfalar

### Dashboard
- Toplam müşteri, lead ve görev sayıları
- Bar chart ve Doughnut chart ile görselleştirme
- Son eklenen kayıtlar listesi

### Customers
- Müşteri kartları görünümü
- Arama fonksiyonu
- CRUD operasyonları

### Leads
- Lead listesi ve durum filtreleme
- Status badge'leri (Open/Won/Lost)
- Currency formatting

### Tasks
- Görev listesi ve checkbox'lar
- Durum filtreleme (All/Completed/Pending)
- Kullanıcı atama

## 🔐 Authentication

### Login Flow

```javascript
const handleLogin = async (credentials) => {
  try {
    const response = await api.post('/token/', credentials);
    sessionStorage.setItem('access_token', response.data.access);
    sessionStorage.setItem('refresh_token', response.data.refresh);
    navigate('/dashboard');
  } catch (error) {
    toast.error('Invalid credentials');
  }
};
```

### Protected Routes

```javascript
function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      {/* ... */}
    </Routes>
  );
}
```

## 🎨 Styling Best Practices

1. **CSS Custom Properties kullan**
2. **Component-specific classes** - `.customer-card`, `.task-item`
3. **Hover effects** - Kullanıcı deneyimi için
4. **Responsive design** - Mobile-first yaklaşım
5. **Smooth transitions** - `transition: all 0.2s ease`

## 🚀 Build ve Deploy

### Development
```bash
npm run dev
# http://localhost:5173
```

### Production Build
```bash
npm run build
# dist/ klasörüne build alınır
```

### Preview
```bash
npm run preview
# Production build'i önizle
```

### Netlify Deployment

Bu proje Netlify'da deploy edilmeye hazır hale getirilmiştir.

#### Otomatik Yapılandırma
- ✅ `netlify.toml` - Build ve redirect ayarları
- ✅ `public/_redirects` - SPA routing için
- ✅ Build directory: `dist`
- ✅ Build command: `npm run build`

#### Netlify'da Deploy Adımları

1. **GitHub'a push edin:**
```bash
git add .
git commit -m "Add Netlify configuration"
git push origin main
```

2. **Netlify'da yeni site oluşturun:**
   - [Netlify Dashboard](https://app.netlify.com/) → "Add new site" → "Import an existing project"
   - GitHub repository'nizi seçin
   - Build settings otomatik algılanacak:
     - Build command: `npm run build`
     - Publish directory: `dist`
     - Base directory: `crm_frontend`

3. **Environment Variables ekleyin:**
   - Site settings → Build & deploy → Environment
   - `VITE_API_URL` = Backend API URL'iniz (örn: `https://your-backend.com/api`)

4. **Deploy edin:**
   - "Deploy site" butonuna tıklayın
   - Build tamamlandıktan sonra siteniz yayında!

#### Yaygın Sorunlar ve Çözümleri

**❌ Page Not Found hatası:**
- ✅ Çözüm: `_redirects` dosyası zaten eklendi. Tekrar build alın.

**❌ API bağlantı hatası:**
- ✅ Çözüm: CORS ayarlarını backend'de kontrol edin
- Backend `settings.py` içinde Netlify domain'inizi `CORS_ALLOWED_ORIGINS`'e ekleyin:
```python
CORS_ALLOWED_ORIGINS = [
    "http://localhost:5173",
    "https://your-site.netlify.app",
]
```

**❌ Build başarısız:**
- ✅ Çözüm: Base directory'yi `crm_frontend` olarak ayarlayın
- Node.js version: 18+ (netlify.toml'da belirtildi)

#### Custom Domain (Opsiyonel)

1. Netlify Dashboard → Domain settings
2. "Add custom domain" → Domain adınızı girin
3. DNS kayıtlarını güncelleyin (Netlify size yönlendirme verecek)
4. SSL sertifikası otomatik olarak oluşturulur

#### Sürekli Deployment

Her `main` branch'ine push yaptığınızda Netlify otomatik olarak yeniden deploy eder.

Branch bazlı preview URL'ler için:
- Feature branch oluşturun
- Push edin
- Netlify otomatik preview URL oluşturur

## 📝 Environment Variables

`.env` dosyası oluşturun:

```env
VITE_API_URL=http://localhost:8000/api
```

Kullanımı:
```javascript
const apiUrl = import.meta.env.VITE_API_URL;
```

## 🐛 Debugging

### React DevTools
Chrome/Firefox extension yükleyin

### Network Tab
API isteklerini izleyin

### Console Logs
```javascript
console.log('State:', state);
console.error('Error:', error);
```

## 📚 Daha Fazla Bilgi

- Ana README: `../README.md`
- API Dokümantasyonu: `../docs/API.md`
- Geliştirme Rehberi: `../docs/DEVELOPMENT.md`

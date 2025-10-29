# Geliştirme Rehberi

CRM uygulaması geliştirme için best practices ve kurallar.

## 🏗️ Proje Mimarisi

### Backend (Django)

**Model-View-Serializer Yaklaşımı:**
```
Request → URL Router → View → Serializer → Model → Database
                          ↓
                       Response
```

### Frontend (React)

**Component-Based Architecture:**
```
App.jsx
  ├── Layout.jsx (Navigation wrapper)
  ├── Pages/
  │   ├── Dashboard.jsx
  │   ├── Customers.jsx
  │   ├── Leads.jsx
  │   └── Tasks.jsx
  ├── Components/ (Reusable)
  └── API Client
```

## 📝 Kod Standartları

### Python/Django

**Naming Conventions:**
- Models: `PascalCase` (örn: `Customer`, `Lead`)
- Functions: `snake_case` (örn: `get_customer_list`)
- Constants: `UPPER_SNAKE_CASE` (örn: `MAX_PAGE_SIZE`)
- Private methods: `_underscore_prefix`

**Example Model:**
```python
class Customer(models.Model):
    name = models.CharField(max_length=200)
    email = models.EmailField(unique=True)
    phone = models.CharField(max_length=20)
    company = models.CharField(max_length=200)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-created_at']
        
    def __str__(self):
        return self.name
```

**Example ViewSet:**
```python
from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated

class CustomerViewSet(viewsets.ModelViewSet):
    queryset = Customer.objects.all()
    serializer_class = CustomerSerializer
    permission_classes = [IsAuthenticated]
    
    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)
```

### JavaScript/React

**Naming Conventions:**
- Components: `PascalCase` (örn: `CustomerList.jsx`)
- Functions: `camelCase` (örn: `fetchCustomers`)
- Constants: `UPPER_SNAKE_CASE` (örn: `API_BASE_URL`)
- CSS Classes: `kebab-case` (örn: `customer-card`)

**Component Structure:**
```jsx
import { useState, useEffect } from 'react';
import api from '../api/axios';

function CustomerList() {
  // 1. State tanımlamaları
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // 2. Effects
  useEffect(() => {
    fetchCustomers();
  }, []);
  
  // 3. Handler fonksiyonları
  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const response = await api.get('/customers/');
      setCustomers(response.data.results || []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };
  
  // 4. Render
  return (
    <div className="customer-list">
      {/* JSX content */}
    </div>
  );
}

export default CustomerList;
```

## 🎨 CSS Tasarım Sistemi

### CSS Custom Properties

```css
:root {
  /* Colors */
  --color-primary: #1e40af;
  --color-primary-dark: #1e3a8a;
  --color-white: #ffffff;
  --color-gray-50: #f9fafb;
  --color-gray-100: #f3f4f6;
  
  /* Spacing */
  --spacing-xs: 0.25rem;
  --spacing-sm: 0.5rem;
  --spacing-md: 1rem;
  --spacing-lg: 1.5rem;
  --spacing-xl: 2rem;
  
  /* Border Radius */
  --radius-sm: 0.375rem;
  --radius-md: 0.5rem;
  --radius-lg: 0.75rem;
  
  /* Shadows */
  --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
}
```

### Component Styling

```css
.component-name {
  /* Layout */
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
  
  /* Spacing */
  padding: var(--spacing-lg);
  
  /* Visual */
  background: var(--color-white);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-md);
  
  /* Animation */
  transition: all 0.2s ease;
}

.component-name:hover {
  box-shadow: var(--shadow-lg);
  transform: translateY(-2px);
}
```

## 🔐 Güvenlik Best Practices

### Backend

1. **Always validate input:**
```python
class CustomerSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(required=True)
    
    def validate_email(self, value):
        if Customer.objects.filter(email=value).exists():
            raise serializers.ValidationError("Email already exists")
        return value
```

2. **Use permissions:**
```python
from rest_framework.permissions import IsAuthenticated

class CustomerViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
```

3. **Sanitize queries:**
```python
# ✅ Good - Parameterized query
Customer.objects.filter(email=user_input)

# ❌ Bad - SQL injection risk
Customer.objects.raw(f"SELECT * FROM customers WHERE email='{user_input}'")
```

### Frontend

1. **Store tokens securely:**
```javascript
// ✅ Good - httpOnly cookie (backend)
// or sessionStorage for short-term
sessionStorage.setItem('token', token);

// ❌ Bad - localStorage (XSS vulnerable)
localStorage.setItem('token', token);
```

2. **Validate input:**
```javascript
const validateEmail = (email) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};
```

3. **Handle API errors:**
```javascript
try {
  const response = await api.get('/customers/');
  setCustomers(response.data.results);
} catch (error) {
  if (error.response?.status === 401) {
    // Redirect to login
    navigate('/login');
  } else {
    // Show error message
    toast.error('An error occurred');
  }
}
```

## 🧪 Testing

### Backend Tests

```python
from django.test import TestCase
from .models import Customer

class CustomerModelTest(TestCase):
    def setUp(self):
        self.customer = Customer.objects.create(
            name="Test Customer",
            email="test@example.com"
        )
    
    def test_customer_creation(self):
        self.assertEqual(self.customer.name, "Test Customer")
        self.assertTrue(isinstance(self.customer, Customer))
```

### Frontend Tests (Future)

```javascript
import { render, screen } from '@testing-library/react';
import CustomerList from './CustomerList';

test('renders customer list', () => {
  render(<CustomerList />);
  const heading = screen.getByText(/customers/i);
  expect(heading).toBeInTheDocument();
});
```

## 🚀 Deployment

### Backend (Django)

1. **Production Settings:**
```python
DEBUG = False
ALLOWED_HOSTS = ['yourdomain.com']
SECRET_KEY = os.environ.get('SECRET_KEY')

# Use PostgreSQL
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': os.environ.get('DB_NAME'),
        'USER': os.environ.get('DB_USER'),
        'PASSWORD': os.environ.get('DB_PASSWORD'),
        'HOST': os.environ.get('DB_HOST'),
        'PORT': '5432',
    }
}
```

2. **Static Files:**
```bash
python manage.py collectstatic
```

### Frontend (React)

1. **Build:**
```bash
npm run build
```

2. **Environment Variables:**
```javascript
// .env.production
VITE_API_URL=https://api.yourdomain.com
```

## 📊 Performance

### Backend Optimizations

1. **Database Indexing:**
```python
class Customer(models.Model):
    email = models.EmailField(unique=True, db_index=True)
```

2. **Select Related:**
```python
# ✅ Good - Single query
Task.objects.select_related('assigned_to').all()

# ❌ Bad - N+1 queries
Task.objects.all()  # Multiple queries for assigned_to
```

3. **Pagination:**
```python
REST_FRAMEWORK = {
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.LimitOffsetPagination',
    'PAGE_SIZE': 10
}
```

### Frontend Optimizations

1. **Lazy Loading:**
```javascript
const Dashboard = lazy(() => import('./pages/Dashboard'));
```

2. **Memoization:**
```javascript
const expensiveCalculation = useMemo(() => {
  return calculateStats(data);
}, [data]);
```

3. **Debouncing:**
```javascript
const debouncedSearch = useDebounce(searchTerm, 300);
```

## 🐛 Debugging

### Backend

```python
import logging
logger = logging.getLogger(__name__)

def my_view(request):
    logger.debug(f"Request data: {request.data}")
    logger.info("Processing request")
    logger.error("Something went wrong")
```

### Frontend

```javascript
// React DevTools
// Redux DevTools (if using Redux)
// Network tab in browser
console.log('State:', state);
console.error('Error:', error);
```

## 📚 Kaynaklar

- [Django Documentation](https://docs.djangoproject.com/)
- [Django REST Framework](https://www.django-rest-framework.org/)
- [React Documentation](https://react.dev/)
- [MDN Web Docs](https://developer.mozilla.org/)

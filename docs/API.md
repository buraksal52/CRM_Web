# API Dokümantasyonu

CRM uygulaması için detaylı API referansı.

## Base URL

```
http://localhost:8000/api
```

## Authentication

Tüm API endpoints (login/register hariç) JWT token gerektirir.

### Token Alma

**Endpoint:** `POST /api/token/`

**Request Body:**
```json
{
  "username": "kullanici_adi",
  "password": "sifre"
}
```

**Response:**
```json
{
  "access": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc..."
}
```

### Token Kullanımı

Her API isteğinde Authorization header'ına token ekleyin:

```
Authorization: Bearer {access_token}
```

### Token Yenileme

**Endpoint:** `POST /api/token/refresh/`

**Request Body:**
```json
{
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc..."
}
```

## Customers API

### List Customers

**Endpoint:** `GET /api/customers/`

**Query Parameters:**
- `limit` (optional): Sayfa başına kayıt sayısı (varsayılan: 10)
- `offset` (optional): Başlangıç offseti

**Response:**
```json
{
  "count": 50,
  "next": "http://localhost:8000/api/customers/?limit=10&offset=10",
  "previous": null,
  "results": [
    {
      "id": 1,
      "name": "Ahmet Yılmaz",
      "email": "ahmet@example.com",
      "phone": "+90 555 123 4567",
      "company": "ABC Şirketi",
      "created_at": "2024-01-15T10:30:00Z"
    }
  ]
}
```

### Create Customer

**Endpoint:** `POST /api/customers/`

**Request Body:**
```json
{
  "name": "Mehmet Demir",
  "email": "mehmet@example.com",
  "phone": "+90 555 987 6543",
  "company": "XYZ Ltd."
}
```

### Update Customer

**Endpoint:** `PUT /api/customers/{id}/`

**Request Body:** (Tüm alanlar zorunlu)
```json
{
  "name": "Mehmet Demir",
  "email": "mehmet.yeni@example.com",
  "phone": "+90 555 987 6543",
  "company": "XYZ Ltd."
}
```

**Endpoint:** `PATCH /api/customers/{id}/`

**Request Body:** (Sadece değişen alanlar)
```json
{
  "email": "mehmet.yeni@example.com"
}
```

### Delete Customer

**Endpoint:** `DELETE /api/customers/{id}/`

**Response:** `204 No Content`

## Leads API

### List Leads

**Endpoint:** `GET /api/leads/`

**Response:**
```json
{
  "count": 30,
  "results": [
    {
      "id": 1,
      "name": "Potansiyel Müşteri A",
      "email": "potansiyel@example.com",
      "phone": "+90 555 111 2222",
      "company": "Startup Inc.",
      "status": "Open",
      "value": 15000.00,
      "created_at": "2024-01-20T14:00:00Z"
    }
  ]
}
```

**Status Values:**
- `Open` - Açık
- `Won` - Kazanıldı
- `Lost` - Kaybedildi

### Create Lead

**Endpoint:** `POST /api/leads/`

**Request Body:**
```json
{
  "name": "Yeni Potansiyel",
  "email": "yeni@example.com",
  "phone": "+90 555 333 4444",
  "company": "Yeni Şirket",
  "status": "Open",
  "value": 25000.00
}
```

### Update Lead Status

**Endpoint:** `PATCH /api/leads/{id}/`

**Request Body:**
```json
{
  "status": "Won"
}
```

## Tasks API

### List Tasks

**Endpoint:** `GET /api/tasks/`

**Response:**
```json
{
  "count": 45,
  "results": [
    {
      "id": 1,
      "title": "Müşteri ile toplantı",
      "description": "Ürün tanıtımı yapılacak",
      "assigned_to": {
        "id": 2,
        "username": "ahmet",
        "first_name": "Ahmet",
        "last_name": "Yılmaz"
      },
      "due_date": "2024-02-01",
      "completed": false,
      "created_at": "2024-01-25T09:00:00Z"
    }
  ]
}
```

### Create Task

**Endpoint:** `POST /api/tasks/`

**Request Body:**
```json
{
  "title": "Teklif hazırla",
  "description": "ABC Şirketi için detaylı teklif",
  "assigned_to": 2,
  "due_date": "2024-02-05",
  "completed": false
}
```

### Mark Task as Completed

**Endpoint:** `PATCH /api/tasks/{id}/`

**Request Body:**
```json
{
  "completed": true
}
```

## Error Responses

### 400 Bad Request
```json
{
  "email": ["Enter a valid email address."],
  "name": ["This field is required."]
}
```

### 401 Unauthorized
```json
{
  "detail": "Authentication credentials were not provided."
}
```

### 404 Not Found
```json
{
  "detail": "Not found."
}
```

### 500 Internal Server Error
```json
{
  "detail": "Internal server error."
}
```

## Rate Limiting

API istekleri kullanıcı başına sınırlandırılmıştır:
- Anonymous: 100 istek/saat
- Authenticated: 1000 istek/saat

## Pagination

Tüm liste endpoint'leri LimitOffsetPagination kullanır:

```
GET /api/customers/?limit=20&offset=40
```

- `limit`: Sayfa başına kayıt sayısı (max: 1000)
- `offset`: Başlangıç pozisyonu

## Best Practices

1. **Always use HTTPS** in production
2. **Store JWT tokens securely** (httpOnly cookies recommended)
3. **Refresh tokens proactively** before expiration
4. **Handle rate limiting** with exponential backoff
5. **Validate input** on client side before sending
6. **Use pagination** for large datasets
7. **Implement proper error handling** for all API calls

## Interactive Documentation

Swagger UI: `http://localhost:8000/swagger/`
ReDoc: `http://localhost:8000/redoc/`

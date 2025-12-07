# 🌐 Backend URL Configuration

Backend URL telah diupdate dengan URL Cloud Workstations baru.

---

## ✅ Backend URL Baru

```
https://9000-firebase-cek-1765096581593.cluster-va5f6x3wzzh4stde63ddr3qgge.cloudworkstations.dev
```

---

## 📝 File yang Sudah Di-Update

### 1. **frontend/.env.local**
```env
VITE_API_URL=https://9000-firebase-cek-1765096581593.cluster-va5f6x3wzzh4stde63ddr3qgge.cloudworkstations.dev
```
- Digunakan untuk development
- Otomatis di-load oleh Vite

### 2. **frontend/.env.example**
```env
VITE_API_URL=https://9000-firebase-cek-1765096581593.cluster-va5f6x3wzzh4stde63ddr3qgge.cloudworkstations.dev
```
- Template untuk environment variables
- Gunakan sebagai referensi

---

## 🚀 Untuk Menggunakan URL Backend Baru

### Development dengan Vite

```bash
cd frontend
npm install
npm run dev
```

Frontend otomatis akan menggunakan URL dari `.env.local`:
- API URL: https://9000-firebase-cek-1765096581593.cluster-va5f6x3wzzh4stde63ddr3qgge.cloudworkstations.dev

---

### Docker Compose (Local)

Jika ingin menggunakan backend remote dengan Docker Compose, update `docker-compose.yml`:

```yaml
frontend:
  environment:
    # Gunakan backend URL Cloud Workstations
    - VITE_API_URL=https://9000-firebase-cek-1765096581593.cluster-va5f6x3wzzh4stde63ddr3qgge.cloudworkstations.dev
```

Kemudian:

```bash
docker-compose up
```

---

## 🔍 Testing Connection

### Test di Browser Console

```javascript
fetch('https://9000-firebase-cek-1765096581593.cluster-va5f6x3wzzh4stde63ddr3qgge.cloudworkstations.dev/api/health')
  .then(r => r.json())
  .then(console.log)
```

### Test dengan cURL

```bash
curl https://9000-firebase-cek-1765096581593.cluster-va5f6x3wzzh4stde63ddr3qgge.cloudworkstations.dev/api/health
```

### Test di React Component

```jsx
useEffect(() => {
  const apiUrl = import.meta.env.VITE_API_URL;
  console.log('Backend URL:', apiUrl); // Should show Cloud Workstations URL
  
  // Test connection
  fetch(`${apiUrl}/health`)
    .then(r => r.json())
    .then(data => console.log('Backend connected:', data))
    .catch(err => console.error('Backend error:', err))
}, [])
```

---

## 📊 URL Details

| Property | Value |
|----------|-------|
| **Protocol** | HTTPS (Secure) |
| **Domain** | firebase-cek-1765096581593 |
| **Cluster** | va5f6x3wzzh4stde63ddr3qgge |
| **Service** | Cloud Workstations |
| **Port** | 9000 |
| **Status** | ✅ Active |

---

## ⚠️ Important Notes

1. **HTTPS Required** - URL menggunakan HTTPS (tidak HTTP)
2. **CORS Headers** - Backend harus mengirim CORS headers yang tepat
3. **Query Parameters** - URL memiliki parameter (monospaceUid, embedded) yang bisa diabaikan untuk API calls

---

## 🔄 Switching Backend URLs

Untuk switch antar backend:

### Development (localhost)
```env
VITE_API_URL=http://localhost:5000/api
```

### Cloud Workstations (Remote)
```env
VITE_API_URL=https://9000-firebase-cek-1765096581593.cluster-va5f6x3wzzh4stde63ddr3qgge.cloudworkstations.dev
```

### Production
```env
VITE_API_URL=https://your-production-domain.com
```

---

## ✅ Verification Checklist

- [x] `.env.local` updated dengan URL baru
- [x] `.env.example` updated dengan URL baru
- [ ] Frontend di-rebuild (npm run dev)
- [ ] Test API connection
- [ ] Verify CORS working
- [ ] Check browser network tab untuk API calls

---

**Last Updated:** December 7, 2025
**Status:** ✅ Configuration Complete
**Backend:** Cloud Workstations (Remote) 🚀


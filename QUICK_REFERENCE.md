# QUICK REFERENCE CARD

## 🚀 Start Application (3 Commands)

```bash
# Terminal 1: MongoDB
mongod

# Terminal 2: Backend
cd backend && npm start
# Runs on http://localhost:5000

# Terminal 3: Frontend  
cd frontend && npm run dev
# Runs on http://localhost:5173
```

Open http://localhost:5173 in browser ✅

---

## 🧪 Run Tests

```bash
cd backend
npm test
```

---

## 📡 API Quick Reference

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | /api/verify | Verify single email |
| POST | /api/bulk | Verify multiple emails (max 100) |
| GET | /api/history | Get last 20 verifications |
| GET | /api/stats | Get valid/invalid/unknown counts |
| GET | /api/health | Server health check |

### Test Single Verification

```bash
curl -X POST http://localhost:5000/api/verify \
  -H "Content-Type: application/json" \
  -d '{"email": "test@gmail.com"}'
```

### Response Format

```json
{
  "email": "test@gmail.com",
  "result": "valid",
  "resultcode": 1,
  "subresult": "mailbox_exists",
  "domain": "gmail.com",
  "mxRecords": ["mx1.gmail.com"],
  "disposable": false,
  "emailProvider": { "name": "Gmail", "icon": "📧 Gmail" },
  "didyoumean": null,
  "executiontime": 2,
  "error": null,
  "timestamp": "2026-02-11T10:30:00Z"
}
```

---

## 📁 Key Files

**Backend Core:**
- `backend/src/verifier/emailVerifier.js` - Main verification logic
- `backend/src/verifier/typoDetector.js` - Levenshtein algorithm
- `backend/src/routes/api.js` - API endpoints
- `backend/src/server.js` - Express app

**Frontend:**
- `frontend/src/App.jsx` - Main component
- `frontend/src/App.css` - All styling
- `frontend/src/components/` - React components

**Tests:**
- `backend/tests/emailVerifier.test.js` - 30+ tests

**Docs:**
- `README.md` - Full documentation
- `TECHNICAL_DOCUMENTATION.md` - Architecture
- `GETTING_STARTED.md` - Setup guide

---

## ⚙️ Configure Environment

Edit `backend/.env`:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/email-verifier
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000,http://localhost:5173
```

---

## 🔍 Verify Setup

```bash
# Check MongoDB connection
curl http://localhost:5000/api/health
# Expected: {"status":"ok","database":"connected"}

# Test verification
curl -X POST http://localhost:5000/api/verify \
  -H "Content-Type: application/json" \
  -d '{"email": "user@gmail.com"}'
```

---

## 🐛 Common Issues

| Problem | Solution |
|---------|----------|
| MongoDB connection error | Run `mongod` in separate terminal |
| Frontend can't reach backend | Ensure backend is running on port 5000 |
| Port 5000 already in use | Change PORT in `.env` or kill process using port |
| Tests failing | Ensure MongoDB is running first |

---

## 📊 Feature Checklist

- [x] Email syntax validation
- [x] DNS MX lookup
- [x] SMTP verification
- [x] Levenshtein distance (typo detection)
- [x] Disposable domain detection
- [x] MX provider mapping
- [x] Rate limiting
- [x] Error handling
- [x] MongoDB integration
- [x] React frontend
- [x] Bulk verification
- [x] Statistics dashboard
- [x] Dark mode
- [x] Responsive design
- [x] 30+ tests
- [x] Comprehensive documentation

---

## 🎯 Result Codes

| Code | Meaning | Example |
|------|---------|---------|
| 1 | Valid | Mailbox exists |
| 3 | Unknown | DNS failed, timeout, greylisted |
| 6 | Invalid | Format error, mailbox doesn't exist |

---

## 📱 UI Features

1. **Single Email Mode**
   - Enter email → Click "Verify Email"
   - See result card with all details

2. **Bulk Mode**
   - Paste multiple emails (one per line)
   - Click "Verify All"
   - See results in list

3. **History Panel**
   - Shows last 10 verifications
   - Color-coded badges
   - Timestamps

4. **Statistics**
   - Pie chart of results
   - Valid/invalid/unknown counts
   - Percentage breakdown

5. **Dark Mode**
   - Click moon/sun button
   - Persists in browser

---

## 🚀 Deployment

### Simple Deployment Steps

1. **Backend (Heroku example)**
   ```bash
   heroku create your-app-name
   git push heroku main
   ```

2. **Frontend (Vercel example)**
   ```bash
   vercel deploy
   ```

3. **Database (MongoDB Atlas)**
   - Create free cluster
   - Get connection string
   - Update backend .env

---

## 📞 Support

See `GETTING_STARTED.md` for detailed troubleshooting.

Key docs:
- `README.md` - Full reference
- `TECHNICAL_DOCUMENTATION.md` - Architecture decisions
- Code comments - Inline explanations

---

## ✅ Test Coverage

```
Email Format Validation:     12 tests ✅
Typo Detection:              4 tests ✅
Disposable Domains:          4 tests ✅
Response Format:             5 tests ✅
Edge Cases:                  5+ tests ✅

Total: 30+ tests
Pass Rate: 100%
```

---

**Everything is ready to use! 🎉**

1. Run `setup.bat` (Windows) or `bash setup.sh` (macOS/Linux)
2. Start MongoDB, Backend, Frontend in separate terminals
3. Open http://localhost:5173
4. Start verifying emails!

Need help? Read `GETTING_STARTED.md` 📖

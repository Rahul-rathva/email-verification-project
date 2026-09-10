# Getting Started - Email Verification Module

## ⚙️ Prerequisites

Before you begin, ensure you have installed:

- **Node.js 14+** - Download from https://nodejs.org/
- **npm 6+** - Comes with Node.js
- **MongoDB** - Download from https://www.mongodb.com/try/download/community (optional for initial testing)

Verify installations:
```bash
node --version    # Should be v14.0.0 or higher
npm --version     # Should be 6.0.0 or higher
mongod --version  # Optional - should show version if installed
```

## 🚀 Quick Start (3 Steps)

### Step 1: Install Dependencies

**On Windows:**
```bash
setup.bat
```

**On macOS/Linux:**
```bash
bash setup.sh
```

**Manual installation:**
```bash
# Backend
cd backend
npm install

# Frontend
cd frontend
npm install
```

### Step 2: Start MongoDB

```bash
# macOS (using Homebrew)
brew services start mongodb-community

# Windows (after installation, MongoDB is usually installed as a service)
# Or run manually:
mongod

# Linux
sudo systemctl start mongod

# Docker (alternative)
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

Verify MongoDB is running:
```bash
mongo  # or mongosh
# You should see a connected prompt
# Exit with: exit()
```

### Step 3: Start Backend and Frontend

**Terminal 1 - Backend:**
```bash
cd backend
npm start
# You should see: ✓ Server running on http://localhost:5000
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
# You should see: ✓ running at http://localhost:5173/
```

**That's it!** Open http://localhost:5173 in your browser.

---

## 🧪 Running Tests

### Backend Tests

```bash
cd backend

# Run all tests
npm test

# Run tests in watch mode (auto-rerun on file changes)
npm run test:watch

# Run tests with coverage
npm test -- --coverage
```

**Expected output:**
```
PASS  tests/emailVerifier.test.js
  Email Format Validation
    ✓ should accept valid email format
    ✓ should reject email without @ symbol
    ✓ should reject email with multiple @ symbols
    ... (30+ total tests)

Tests:       30 passed, 30 total
Time:        2.5s
```

### Frontend Tests

```bash
cd frontend

# No tests configured yet, but you can add them with:
# npm test
```

---

## 🔍 Testing the API Manually

### Test Single Email Verification

**Using curl:**
```bash
curl -X POST http://localhost:5000/api/verify \
  -H "Content-Type: application/json" \
  -d '{"email": "test@gmail.com"}'
```

**Response example:**
```json
{
  "email": "test@gmail.com",
  "result": "valid",
  "resultcode": 1,
  "subresult": "mailbox_exists",
  "domain": "gmail.com",
  "mxRecords": [
    "alt1.gmail-smtp-in.l.google.com",
    "alt2.gmail-smtp-in.l.google.com"
  ],
  "disposable": false,
  "emailProvider": {
    "name": "Gmail",
    "icon": "📧 Gmail"
  },
  "didyoumean": null,
  "executiontime": 2,
  "error": null,
  "timestamp": "2026-02-11T10:30:00.000Z"
}
```

### Test Bulk Verification

```bash
curl -X POST http://localhost:5000/api/bulk \
  -H "Content-Type: application/json" \
  -d '{
    "emails": [
      "user1@gmail.com",
      "user2@outlook.com",
      "invalid@@test.com"
    ]
  }'
```

### Get Verification History

```bash
curl http://localhost:5000/api/history
```

### Get Statistics

```bash
curl http://localhost:5000/api/stats
```

### Health Check

```bash
curl http://localhost:5000/api/health
```

---

## 📁 Project Structure

```
email-verification-project/
├── backend/
│   ├── src/
│   │   ├── verifier/           # Core verification logic
│   │   ├── models/             # MongoDB schemas
│   │   ├── routes/             # API endpoints
│   │   ├── middleware/         # Express middleware
│   │   └── server.js           # Express app
│   ├── tests/
│   │   └── emailVerifier.test.js
│   ├── package.json
│   ├── jest.config.js
│   └── .env
│
├── frontend/
│   ├── src/
│   │   ├── components/         # React components
│   │   ├── App.jsx             # Main component
│   │   ├── App.css             # Styles
│   │   └── main.jsx            # Entry point
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
│
├── README.md                   # Full documentation
├── TECHNICAL_DOCUMENTATION.md  # Architecture & design
└── setup.bat / setup.sh        # Setup scripts
```

---

## 🛠️ Troubleshooting

### MongoDB Connection Error

**Problem:** Backend shows "MongoDB connection failed"

**Solutions:**
```bash
# Option 1: Start MongoDB locally
mongod

# Option 2: Use MongoDB Atlas cloud (free)
# 1. Go to https://www.mongodb.com/cloud/atlas
# 2. Create free cluster
# 3. Get connection string
# 4. Update backend/.env:
#    MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/email-verifier

# Option 3: Use Docker
docker run -d -p 27017:27017 mongo
```

### Frontend Can't Connect to Backend

**Problem:** Frontend shows "Verification failed" or CORS error

**Solutions:**
1. Ensure backend is running: `npm start` in backend folder
2. Check backend is on port 5000: http://localhost:5000/api/health
3. Verify CORS in backend/src/server.js includes your frontend URL
4. Update frontend API_BASE if backend runs on different port

### SMTP Verification Returns "unknown"

**Problem:** All emails show as "unknown" result

**Possible causes:**
- ISP blocking port 25 (SMTP)
- SMTP servers not responding in time
- Server is greylisting (temporary rejection)

**Try:** 
- Test with gmail.com (most reliable)
- Check internet connection
- Try from different ISP/VPN

### Port Already in Use

**Problem:** "Port 5000 is already in use" or "Port 5173 is already in use"

**Solutions:**
```bash
# Find what's using port 5000
lsof -i :5000         # macOS/Linux
netstat -ano | grep :5000  # Windows

# Kill the process or use different port
# Update PORT in backend/.env or vite config
```

### npm install Fails

**Problem:** "npm ERR!" during install

**Solutions:**
```bash
# Clear npm cache
npm cache clean --force

# Try install again
npm install

# Or use npm ci (more reliable for CI)
npm ci
```

### Tests Failing

**Problem:** Jest tests show errors

**Solutions:**
```bash
# Ensure MongoDB is running first
mongod

# Run tests again
npm test

# Run tests with debug output
npm test -- --verbose

# Run specific test file
npm test -- emailVerifier.test.js
```

---

## 📊 Performance Tips

### Make Verifications Faster

1. **Use bulk verification** for multiple emails (100x faster than sequential)
2. **Verify with major providers first** (Gmail, Outlook - most reliable)
3. **Check stats regularly** to see success rate

### Optimize Database Queries

Already optimized! But if needed:
- MongoDB indexes are set up automatically
- History queries use indexed timestamp field
- Stats aggregation is efficient

---

## 🔐 Security Tips for Deployment

### Before Going Live

1. **Update .env file:**
   - Change MongoDB URI to production instance
   - Set NODE_ENV=production
   - Update CORS_ORIGIN to your domain only
   - Increase rate limit thresholds if needed

2. **Security headers:**
   - Add helmet.js for security headers
   - Use HTTPS only
   - Set up rate limiting on nginx/load balancer

3. **API authentication:**
   - Add API keys for production use
   - Implement OAuth for user accounts
   - Add request signing

4. **Monitoring:**
   - Set up error logging (Sentry, DataDog)
   - Monitor database performance
   - Track API response times

---

## 📚 Additional Resources

- **Backend Documentation**: See `backend/` files for detailed comments
- **Frontend Documentation**: See `frontend/` files for detailed comments
- **API Reference**: See `README.md` "API Endpoints" section
- **Technical Details**: See `TECHNICAL_DOCUMENTATION.md`

---

## ✅ Verify Everything Works

After setup, verify all components:

```bash
# 1. Check backend is running
curl http://localhost:5000/api/health

# Expected: {"status":"ok", ...}

# 2. Check frontend is accessible
# Open http://localhost:5173 in browser

# 3. Try a verification
curl -X POST http://localhost:5000/api/verify \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com"}'

# 4. Check history
curl http://localhost:5000/api/history
```

---

## 🎉 You're All Set!

You now have a fully functional Email Verification Module running locally!

### Next Steps

1. **Test the UI**: Enter emails in the frontend
2. **Try bulk mode**: Paste multiple emails
3. **Check history**: See past verifications
4. **View statistics**: See valid/invalid/unknown counts
5. **Toggle dark mode**: Click the moon/sun button

### Need Help?

- Check error messages in browser console (F12)
- Check backend logs in terminal
- Review "Troubleshooting" section above
- Read code comments in `src/` folders
- Check `TECHNICAL_DOCUMENTATION.md` for architecture

Happy verifying! 🚀

# Trustmaps - Local Development Startup Guide

This guide provides step-by-step instructions for spinning up all required services to run Trustmaps locally.

---

## 📋 Table of Contents

1. [Services Overview](#services-overview)
2. [Prerequisites](#prerequisites)
3. [Quick Start](#quick-start)
4. [Detailed Startup Instructions](#detailed-startup-instructions)
5. [Port Reference](#port-reference)
6. [Verification Steps](#verification-steps)
7. [Troubleshooting](#troubleshooting)
8. [Stopping Services](#stopping-services)

---

## 🏗️ Services Overview

Trustmaps runs entirely locally with **no cloud dependencies**. You'll need to start these services:

| Service | Description | Port | Required |
|---------|-------------|------|----------|
| **PostgreSQL + PostGIS** | Database with geospatial extensions | 5432 | ✅ Yes |
| **Backend API** | Express.js REST API | 3001 | ✅ Yes |
| **Frontend** | Expo + React Native Web | 8081, 19000-19006 | ✅ Yes |
| **Prisma Studio** | Database GUI (optional) | 5555 | ⚪ Optional |

---

## 🔧 Prerequisites

### Required Software
- **Node.js 20+** - [Download](https://nodejs.org/)
- **Docker** - [Docker Desktop](https://www.docker.com/products/docker-desktop/) or [Colima](https://github.com/abiosoft/colima)
- **npm** or **yarn** (comes with Node.js)

### Verify Installation
```bash
node --version   # Should be 20.x or higher
docker --version # Should be 20.x or higher
npm --version    # Should be 9.x or higher
```

### First-Time Setup Only
If you're setting up for the first time, you'll also need to install dependencies and configure environment variables (covered in Detailed Startup Instructions).

---

## 🚀 Quick Start

If you've already completed first-time setup, use these commands to start all services:

```bash
# Terminal 1: Start PostgreSQL
docker-compose up -d

# Terminal 2: Start Backend API
cd backend
npm run dev

# Terminal 3: Start Frontend
cd frontend
npm run web
```

Then open http://localhost:8081 in your browser.

---

## 📖 Detailed Startup Instructions

### Step 1: Start PostgreSQL Database

The database must be running before starting the backend.

```bash
# From project root (/trustmap)
docker-compose up -d
```

**What this does:**
- Starts PostgreSQL 15 with PostGIS 3.3 extension
- Creates database named `trustmap`
- Uses credentials: `trustmap` / `trustmap_dev_password`
- Exposes port 5432 to localhost
- Runs in detached mode (`-d` flag)

**Verify it's running:**
```bash
docker ps | grep trustmap-postgres
```

You should see `trustmap-postgres` container status as `Up`.

**Check database health:**
```bash
docker exec trustmap-postgres pg_isready -U trustmap
```

Expected output: `trustmap-postgres:5432 - accepting connections`

---

### Step 2: Backend Setup (First Time Only)

If you haven't set up the backend before, complete these steps once:

```bash
cd backend

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Push database schema to PostgreSQL
npx prisma db push

# Generate Prisma Client
npx prisma generate
```

**Environment Variables (`backend/.env`):**
The default values in `.env.example` work for local development. Key variables:

```env
DATABASE_URL="postgresql://trustmap:trustmap_dev_password@localhost:5432/trustmap?schema=public"
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
PORT=3001
NODE_ENV="development"
UPLOAD_DIR="./uploads"
```

⚠️ **Important:** If you modify `PORT`, update the frontend API client configuration in `/frontend/src/api/client.ts`.

---

### Step 3: Start Backend API

```bash
# From /trustmap/backend directory
npm run dev
```

**What this does:**
- Starts Express.js server with `nodemon` + `tsx` for hot-reloading
- Listens on http://localhost:3001
- Serves REST API endpoints under `/api`
- Serves static uploads from `/backend/uploads`

**Expected console output:**
```
[nodemon] starting `tsx src/index.ts`
Server running on http://localhost:3001
Database connected
```

**Test the API:**
```bash
curl http://localhost:3001/api/auth/me
```

Expected: `{"message": "Unauthorized"}` (this is correct - no JWT token provided)

---

### Step 4: Frontend Setup (First Time Only)

If you haven't set up the frontend before:

```bash
cd frontend

# Install dependencies
npm install
```

**API Configuration:**
The frontend API client is configured in `/frontend/src/api/client.ts`:

```typescript
const API_URL = 'http://localhost:3001';
```

If your backend runs on a different port, update this file.

---

### Step 5: Start Frontend

```bash
# From /trustmap/frontend directory

# Option 1: Web only (recommended for development)
npm run web

# Option 2: Full Expo with iOS/Android/Web
npm start
```

**What this does:**
- Starts Expo Metro bundler
- Compiles React Native Web for browser
- Opens development server on http://localhost:8081
- Expo DevTools available at http://localhost:19002

**Expected console output:**
```
Starting Metro Bundler
› Metro waiting on exp://192.168.x.x:8081
› Scan the QR code above with Expo Go (Android) or the Camera app (iOS)

› Web is running on http://localhost:8081
```

**Open in browser:**
```bash
# Automatically opens in default browser
open http://localhost:8081
```

---

### Step 6: (Optional) Start Prisma Studio

Prisma Studio provides a GUI for viewing and editing database records.

```bash
# From /trustmap/backend directory
npm run prisma:studio
```

**Access at:** http://localhost:5555

**Useful for:**
- Viewing user accounts
- Inspecting lists and places
- Debugging data issues
- Manually creating test data

---

## 🌐 Port Reference

| Port | Service | URL | Notes |
|------|---------|-----|-------|
| **3001** | Backend API | http://localhost:3001 | REST API endpoints under `/api` |
| **5432** | PostgreSQL | localhost:5432 | Database connection (not HTTP) |
| **5555** | Prisma Studio | http://localhost:5555 | Optional database GUI |
| **8081** | Frontend Web | http://localhost:8081 | React Native Web app |
| **19000-19006** | Expo DevTools | http://localhost:19002 | Expo developer tools |

---

## ✅ Verification Steps

### 1. Check Database Connection
```bash
# From /trustmap/backend
npx prisma db pull
```

Expected: Schema is already in sync, no changes needed.

### 2. Test Backend API
```bash
curl http://localhost:3001/api/auth/me
```

Expected: `{"message":"Unauthorized"}` (correct - no auth token)

### 3. Test Frontend
Open http://localhost:8081 in your browser. You should see the Trustmaps login screen.

### 4. Create Test User
```bash
curl -X POST http://localhost:3001/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "username": "testuser",
    "password": "password123",
    "displayName": "Test User"
  }'
```

Expected: `{"user": {...}, "token": "..."}`

### 5. Verify User in Database
Open Prisma Studio (http://localhost:5555) and check the `User` table. You should see your test user with 100 TRUST tokens.

---

## 🛠️ Troubleshooting

### Problem: "Port 5432 already in use"

**Cause:** PostgreSQL is already running (either via Docker or locally installed Postgres).

**Solutions:**

**Option 1:** Stop the conflicting PostgreSQL instance
```bash
# If using Docker
docker ps | grep postgres
docker stop <container_id>

# If using Homebrew PostgreSQL
brew services stop postgresql
```

**Option 2:** Use a different port in `docker-compose.yml`
```yaml
ports:
  - "5433:5432"  # Maps host 5433 to container 5432
```

Then update `backend/.env`:
```env
DATABASE_URL="postgresql://trustmap:trustmap_dev_password@localhost:5433/trustmap?schema=public"
```

---

### Problem: "Port 3001 already in use"

**Cause:** Another backend instance is already running.

**Solution 1:** Find and kill the process
```bash
lsof -ti:3001 | xargs kill -9
```

**Solution 2:** Change the backend port
Edit `backend/.env`:
```env
PORT=3002
```

Update `frontend/src/api/client.ts`:
```typescript
const API_URL = 'http://localhost:3002';
```

---

### Problem: "Port 8081 already in use"

**Cause:** Another Expo dev server is running.

**Solution 1:** Kill existing Expo processes
```bash
lsof -ti:8081 | xargs kill -9
pkill -f "expo start"
```

**Solution 2:** Use a different port
```bash
npx expo start --web --port 8082
```

---

### Problem: Multiple Frontend Instances Running

**Symptom:** You see many `npx expo start` processes when running `ps aux | grep expo`.

**Solution:** Clear all Expo and Metro bundler processes
```bash
# Kill all Expo processes
pkill -f "expo"
pkill -f "metro"

# Clear Expo cache
cd frontend
npx expo start --clear
```

---

### Problem: "Cannot connect to database"

**Symptom:** Backend logs show `Error: connect ECONNREFUSED 127.0.0.1:5432`.

**Checklist:**
1. **Is Docker running?**
   ```bash
   docker ps
   ```

2. **Is PostgreSQL container healthy?**
   ```bash
   docker logs trustmap-postgres
   ```

3. **Can you connect with psql?**
   ```bash
   docker exec -it trustmap-postgres psql -U trustmap -d trustmap
   ```

4. **Restart the container**
   ```bash
   docker-compose down
   docker-compose up -d
   ```

---

### Problem: "Prisma Client not generated"

**Symptom:** Backend crashes with `Error: Cannot find module '@prisma/client'`.

**Solution:**
```bash
cd backend
npx prisma generate
npm run dev
```

---

### Problem: Frontend shows "Network request failed"

**Cause:** Frontend can't reach the backend API.

**Checklist:**
1. **Is backend running?**
   ```bash
   curl http://localhost:3001/api/auth/me
   ```

2. **Check API_URL in `/frontend/src/api/client.ts`**
   ```typescript
   const API_URL = 'http://localhost:3001'; // Must match backend PORT
   ```

3. **Check browser console for CORS errors**
   - Backend already has CORS enabled for localhost
   - If testing from a different host, update CORS config in `/backend/src/index.ts`

---

### Problem: "Module not found" errors in Frontend

**Cause:** Dependencies not installed or cache corruption.

**Solution:**
```bash
cd frontend

# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install

# Clear Expo cache
npx expo start --clear
```

---

### Problem: Database schema out of sync

**Symptom:** Backend crashes with Prisma validation errors.

**Solution:**
```bash
cd backend

# Option 1: Push schema changes (non-destructive)
npx prisma db push

# Option 2: Reset database (destructive - deletes all data)
npx prisma migrate reset

# Regenerate Prisma Client
npx prisma generate
```

---

### Problem: "JWT malformed" or authentication errors

**Cause:** JWT_SECRET mismatch or token corruption.

**Solutions:**

**Option 1:** Clear AsyncStorage in frontend
```typescript
// In browser console (http://localhost:8081)
localStorage.clear();
// Refresh page
```

**Option 2:** Generate new JWT_SECRET
```bash
# Edit backend/.env
JWT_SECRET="new-random-secret-key-$(openssl rand -hex 32)"

# Restart backend
cd backend
npm run dev
```

⚠️ This will invalidate all existing tokens - users must log in again.

---

### Problem: File upload fails

**Symptom:** Import flow crashes when uploading ZIP files.

**Checklist:**
1. **Does uploads directory exist?**
   ```bash
   mkdir -p backend/uploads
   ```

2. **Check file size limits in `backend/.env`**
   ```env
   MAX_FILE_SIZE=52428800  # 50MB in bytes
   ```

3. **Check disk space**
   ```bash
   df -h
   ```

---

### Problem: Geocoding rate limit errors

**Symptom:** Import flow shows "Too many requests" for geocoding.

**Cause:** Nominatim (OpenStreetMap) has rate limits (1 request/second).

**Solutions:**

**Option 1:** Reduce batch size
Edit `backend/src/services/geocodingService.ts` to add delays between requests.

**Option 2:** Use Mapbox Geocoding API (optional)
1. Get free API token at https://account.mapbox.com/access-tokens/
2. Add to `backend/.env`:
   ```env
   MAPBOX_TOKEN="pk.your-token-here"
   ```
3. Update geocoding service to use Mapbox instead of Nominatim

---

## 🛑 Stopping Services

### Stop All Services
```bash
# Stop frontend (Ctrl+C in terminal)

# Stop backend (Ctrl+C in terminal)

# Stop PostgreSQL
docker-compose down

# Stop Prisma Studio (Ctrl+C in terminal)
```

### Stop PostgreSQL but Keep Data
```bash
docker-compose stop
```

### Stop and Remove All Data (⚠️ Destructive)
```bash
docker-compose down -v
```

---

## 🔄 Clean Restart (Nuclear Option)

If everything is broken and you want to start fresh:

```bash
# Kill all running processes
pkill -f "expo"
pkill -f "nodemon"
pkill -f "prisma"

# Stop and remove PostgreSQL data
docker-compose down -v

# Clean backend
cd backend
rm -rf node_modules package-lock.json
npm install
npx prisma generate
npx prisma db push

# Clean frontend
cd ../frontend
rm -rf node_modules package-lock.json
npm install

# Start everything fresh
cd ..
docker-compose up -d
cd backend && npm run dev &
cd ../frontend && npm run web
```

---

## 📚 Additional Resources

- **Main README:** [README.md](./README.md)
- **Implementation Roadmap:** [ROADMAP.md](./ROADMAP.md)
- **Design Principles:** [design_principles_and_best_practices.md](./design_principles_and_best_practices.md)
- **Product Requirements:** [PRD — Trustmaps.md](./PRD%20—%20Trustmaps.md)
- **Prisma Docs:** https://www.prisma.io/docs
- **Expo Docs:** https://docs.expo.dev/

---

## 🐛 Still Having Issues?

If you've tried the troubleshooting steps above and still can't get Trustmaps running:

1. **Check for port conflicts:**
   ```bash
   lsof -i :3001
   lsof -i :5432
   lsof -i :8081
   ```

2. **Check Docker status:**
   ```bash
   docker ps -a
   docker logs trustmap-postgres
   ```

3. **Verify Node.js version:**
   ```bash
   node --version  # Must be 20.x or higher
   ```

4. **Check environment variables:**
   ```bash
   cat backend/.env
   ```

5. **Review backend logs:**
   Look for error messages in the terminal where `npm run dev` is running.

6. **Check browser console:**
   Open DevTools (F12) and look for network errors or JavaScript exceptions.

---

**Last Updated:** December 11, 2025
**Trustmaps Version:** 1.0.0 (Hackathon)

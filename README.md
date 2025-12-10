# Trustmaps

**Google Maps Saved Lists Search, Discovery & InfoFi Marketplace**

Transform your saved places into a searchable database, a marketplace of curated travel guides, and a reputation-driven knowledge economy.

## 🚀 Project Status: Phase 1 Complete

### ✅ Completed Features

- **Database**: PostgreSQL + PostGIS running in Docker
- **Backend API**: Express + TypeScript + Prisma ORM
- **Authentication**: JWT-based auth with bcrypt & Passport.js
- **User Management**: Signup, Login, Profile endpoints
- **Data Models**: 8 tables (Users, Places, Lists, Purchases, Stakes, Reviews, etc.)
- **Frontend**: Expo app with React Native Web support

## 🏗️ Tech Stack

### Backend
- Node.js 20+
- TypeScript
- Express.js
- Prisma ORM
- PostgreSQL 15 + PostGIS
- JWT + Passport.js
- bcrypt

### Frontend
- Expo SDK 53+
- React Native
- React Native Web
- TypeScript

### Infrastructure
- Docker Compose
- Colima (Docker runtime)

## 🚦 Getting Started

### Prerequisites
- Node.js 20+
- Docker & Colima (or Docker Desktop)
- PostgreSQL client tools

### Backend Setup

```bash
# Start PostgreSQL
docker-compose up -d

# Navigate to backend
cd backend

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env

# Push database schema
npx prisma db push

# Start development server
npm run dev
```

Backend runs on `http://localhost:3001`

### Frontend Setup

```bash
# Navigate to frontend
cd frontend

# Install dependencies
npm install

# Start Expo
npm start
```

## 📡 API Endpoints

### Authentication
- `POST /api/auth/signup` - Create new user (starts with 100 TRUST tokens)
- `POST /api/auth/login` - Login with email or username
- `GET /api/auth/me` - Get authenticated user profile (JWT required)

## 🎯 Roadmap

### Phase 2: Import Flow (Next)
- ZIP upload endpoint (Multer)
- Google Takeout parser
- Nominatim geocoding integration
- Place enrichment

### Phase 3: Personal Library
- List management
- Search & filtering
- Map integration
- Place details

### Phase 4: Marketplace
- Browse public lists
- Search & discovery
- List previews

### Phase 5: TRUST Staking
- Simulated TRUST economy
- Stake on lists
- Revenue distribution

### Phase 6: Creator System
- Creator profiles
- Reputation scores
- Earnings dashboard

## 🗂️ Data Models

- **User**: Authentication, TRUST balance, reputation
- **Place**: Geographic locations with metadata
- **List**: Curated collections of places
- **ListPlace**: Many-to-many relationship with order
- **Purchase**: Marketplace transactions
- **Stake**: TRUST staking on lists
- **UserStake**: TRUST staking on creators
- **Review**: User ratings and comments

## 🔐 Environment Variables

```env
# Database
DATABASE_URL="postgresql://trustmap:trustmap_dev_password@localhost:5432/trustmap?schema=public"

# JWT
JWT_SECRET="your-secret-key"
JWT_EXPIRES_IN="7d"

# Server
PORT=3001
NODE_ENV="development"
```

## 📝 License

MIT

## 🤝 Contributing

This is a hackathon project. Contributions welcome!

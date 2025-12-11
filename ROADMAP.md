# Trustmaps Implementation Roadmap

**Version:** 1.2
**Date:** December 11, 2025
**Status:** 98% Complete - Phase 1 & 2 COMPLETE ✅

---

## 📊 Executive Summary

**Current State:** Trustmaps has achieved 98% completion of core PRD features with all critical Phase 1 and Phase 2 features implemented and tested. All must-have features from the PRD are now functional, plus comprehensive polish features.

**Key Achievements:**
- ✅ 8/8 design components implemented (ProgressCircle, MetadataGrid, Badge, Avatar, etc.)
- ✅ Complete marketplace with search, filtering, and pagination
- ✅ Full authentication and user management with auto-initialization
- ✅ Import flow for Google Takeout processing
- ✅ Personal library with 3-tab organization
- ✅ **NEW: Staking API and UI** - Stake TRUST on lists and creators
- ✅ **NEW: Review and rating system** - 5-star ratings with comments
- ✅ **NEW: Export functionality** - KML, GeoJSON, and CSV formats
- ✅ **NEW: Dynamic reputation updates** - Auto-calculated on actions

**Phase 1 Completed Features:**
- ✅ Staking API with stake/unstake endpoints (`stakes.ts`)
- ✅ Review API with CRUD operations (`reviews.ts`)
- ✅ Reputation service with dynamic calculation (`reputationService.ts`)
- ✅ Export service with 3 formats (`exportService.ts`, `export.ts`)
- ✅ Frontend components: Modal, StakeModal, StakeCard, StarRating, ReviewForm, ReviewCard, ExportModal
- ✅ Integration in list detail page with all new features
- ✅ Critical bug fixes: API URL paths, authentication initialization

**Phase 2 Completed Features:**
- ✅ Skeleton loading states - Replaced all ActivityIndicator with Skeleton components
- ✅ Profile editing - Backend endpoints for profile and image upload with multer
- ✅ Profile edit screen - Cross-platform image upload with expo-image-picker
- ✅ Creator public profiles - Backend API (`users.ts`) for creator stats and lists
- ✅ Creator profile screen - Public profile view with reputation and published lists
- ✅ Purchase history - Backend endpoint with revenue breakdown
- ✅ Purchase history screen - Comprehensive view with revenue distribution
- ✅ Staking earnings - Backend endpoint with APR and share calculations

**Recommended Next Steps:** Phase 3 optional features (Map visualization, blurred previews, following system, recommendations).

---

## 🏗️ Architecture Overview

### Local-First Development
All services run locally with no cloud dependencies:

| Service | Location | Purpose |
|---------|----------|---------|
| PostgreSQL + PostGIS | Docker (localhost:5432) | Database |
| Backend API | localhost:3001 | Express + TypeScript + Prisma |
| Frontend | localhost:8081 | Expo + React Native Web |
| Prisma Studio | localhost:5555 | Database management UI |
| File Uploads | `/backend/uploads/` | Local file storage |
| Static Files | Express middleware | Serve uploaded images |

---

## 📈 Implementation Phases

### PHASE 1: Critical PRD Must-Haves (48 hours)

Target: 95% PRD coverage, all blocking features complete

#### 1.1 Staking System ⭐ HIGHEST PRIORITY
**Time Estimate:** 8 hours
**Why Critical:** Core value proposition, enables 25% revenue share for stakers

**Backend Implementation:**
```
File: /backend/src/api/routes/stakes.ts (NEW)

Endpoints:
  POST   /api/stakes/list/:listId      - Stake TRUST on a list
  POST   /api/stakes/user/:userId      - Stake TRUST on a creator
  GET    /api/stakes                   - Get user's staking positions
  DELETE /api/stakes/list/:listId      - Unstake from a list

Business Logic:
  - Validate user has sufficient TRUST balance
  - For paid lists: verify user purchased before allowing stake
  - Deduct TRUST from User.trustBalance
  - Create Stake or UserStake record
  - Update List.totalStaked or User.totalStaked
  - Calculate and display APR for staking positions
```

**Frontend Implementation:**
```
Files to Create:
  /frontend/src/components/common/Modal.tsx
  /frontend/src/components/stakes/StakeModal.tsx
  /frontend/src/components/stakes/StakeCard.tsx
  /frontend/app/stakes/index.tsx

Files to Modify:
  /frontend/app/list/[id].tsx - Add "Stake TRUST" button to Overview tab
  /frontend/app/(tabs)/profile.tsx - Add "My Stakes" menu item

Components:
  - Modal: Reusable overlay with borderRadius.lg
  - StakeModal: Amount input with TRUST balance validation
  - StakeCard: Display stake position with earned revenue & APR
  - MyStakesScreen: TabBar for "On Lists" / "On Creators"
```

**Design Requirements:**
- Modal uses `colors.accent[500]` for primary actions
- 44px minimum touch targets on all interactive elements
- Amount input validates max = user's TRUST balance
- Success toast: "Staked {amount} TRUST on {listName}"
- APR calculation: `(earnedRevenue / stakedAmount) * 100%`

---

#### 1.2 Reviews & Ratings System
**Time Estimate:** 6 hours
**Why Critical:** Required for reputation calculation and user trust signals

**Backend Implementation:**
```
File: /backend/src/api/routes/reviews.ts (NEW)

Endpoints:
  POST /api/reviews/list/:listId      - Submit review (rating 1-5 + comment)
  GET  /api/reviews/list/:listId      - Get all reviews for a list
  PUT  /api/reviews/:reviewId         - Edit own review

Post-Review Actions:
  1. Calculate new List.averageRating
  2. Update List record
  3. Trigger creator reputation recalculation
```

**Frontend Implementation:**
```
Files to Create:
  /frontend/src/components/common/StarRating.tsx
  /frontend/src/components/reviews/ReviewForm.tsx
  /frontend/src/components/reviews/ReviewCard.tsx

Files to Modify:
  /frontend/app/list/[id].tsx - Populate Reviews tab with form + list

Components:
  - StarRating: 5-star selector with 44px targets, amber active color
  - ReviewForm: Stars + textarea with 500 char limit
  - ReviewCard: Avatar + name + rating + comment + timestamp
```

**Design Requirements:**
- Star buttons: 44px × 44px touch targets
- Active star: `colors.warning` (amber #F59E0B)
- Inactive star: `colors.neutral[300]`
- Submit disabled until rating selected
- One review per user per list (enforce uniqueness)

---

#### 1.3 Reputation Auto-Update
**Time Estimate:** 2 hours
**Why Critical:** Reputation must be dynamic, not static

**Backend Implementation:**
```
File: /backend/src/services/reputationService.ts (NEW)

Function: updateCreatorReputation(userId: string)

Formula:
  reputation =
    SUM(TRUST staked on user's lists) * 0.3 +
    SUM(TRUST staked on user profile) * 0.2 +
    AVG(ratings on user's lists) * 10 +
    User.totalSales * 0.5 +
    stakerROI_percentage * 0.2 +
    COUNT(unique stakers) * 0.1 +
    COUNT(lists with trustRank > 80) * 5

Trigger Points:
  - After list purchase (update buyer & creator reputation)
  - After staking (update staker & stakee reputation)
  - After review submission (update list creator reputation)
  - After list publication
```

**Integration:**
```
Files to Modify:
  /backend/src/api/routes/lists.ts - Call after purchase
  /backend/src/api/routes/stakes.ts - Call after stake/unstake
  /backend/src/api/routes/reviews.ts - Call after review
```

---

#### 1.4 Export Functionality
**Time Estimate:** 6 hours
**Why Critical:** PRD must-have, allows users to import lists back into Google Maps

**Backend Implementation:**
```
File: /backend/src/api/routes/export.ts (NEW)
File: /backend/src/services/exportService.ts (NEW)

Endpoints:
  GET /api/export/list/:listId/kml      - Google Maps KML format
  GET /api/export/list/:listId/geojson  - GeoJSON format
  GET /api/export/list/:listId/csv      - CSV format

Access Control:
  - User owns list OR
  - User purchased list OR
  - List is free
  → Return 403 Forbidden if no access

Implementation:
  - Generate files in-memory (no temp files)
  - Set Content-Disposition: attachment; filename="listname.kml"
  - Return file as downloadable response
  - No cloud storage required
```

**KML Format Example:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<kml xmlns="http://www.opengis.net/kml/2.2">
  <Document>
    <name>Best Coffee Shops in SF</name>
    <description>Curated by @username</description>
    <Placemark>
      <name>Blue Bottle Coffee</name>
      <description>Great pour-over coffee</description>
      <Point>
        <coordinates>-122.4194,37.7749</coordinates>
      </Point>
    </Placemark>
  </Document>
</kml>
```

**Frontend Implementation:**
```
Files to Create:
  /frontend/src/components/export/ExportModal.tsx

Files to Modify:
  /frontend/app/list/[id].tsx - Add "Export" button (after purchase/if owned)

Modal Features:
  - Radio buttons: KML, GeoJSON, CSV
  - Format descriptions: "KML - Import to Google Maps"
  - Download button triggers file save
  - Success toast: "Exported to Downloads/listname.kml"

Platform-Specific Download:
  Web: fetch().then(r => r.blob()).then(save)
  Mobile: expo-file-system to save to Downloads folder
```

---

### PHASE 2: Polish & Quick Wins (8 hours)

Target: Fix design inconsistencies, complete 80%-done features

#### 2.1 Replace ActivityIndicator with Skeleton
**Time:** 1 hour
**Why:** Design compliance (Part 8.3 of design_principles_and_best_practices.md)

**Files to Fix:**
```
/frontend/app/(tabs)/library.tsx line 156
/frontend/app/(tabs)/marketplace.tsx line 194
/frontend/app/list/[id].tsx line 295

Change:
  <ActivityIndicator size="large" color={colors.accent[500]} />
  ↓
  <Skeleton variant="card" count={3} />
```

---

#### 2.2 Profile Editing
**Time:** 3 hours

**Backend:**
```
File: /backend/src/api/routes/auth.ts (MODIFY)

Add Endpoints:
  PUT  /api/users/profile       - Update displayName, bio
  POST /api/users/profile/image - Upload profile image

Local Image Storage:
  - Use multer middleware
  - Save to /backend/uploads/profiles/{userId}.jpg
  - Add Express static middleware: app.use('/uploads', express.static('uploads'))
  - Return URL: http://localhost:3001/uploads/profiles/{userId}.jpg
```

**Frontend:**
```
File: /frontend/app/profile/edit.tsx (NEW)

Features:
  - Input fields: Display Name, Bio (multiline)
  - Image picker (expo-image-picker)
  - Upload via FormData
  - Update authStore on success
```

---

#### 2.3 Creator Public Profiles
**Time:** 6 hours

**Backend:**
```
File: /backend/src/api/routes/users.ts (NEW)

Endpoints:
  GET /api/users/:id       - Public profile data
  GET /api/users/:id/lists - Creator's published lists
```

**Frontend:**
```
File: /frontend/app/creator/[id].tsx (NEW)

Layout:
  - Avatar (xl size) + ProgressCircle (reputation)
  - MetadataGrid: TRUST staked, Lists published, Total sales
  - TabBar: "Published Lists" | "Top Lists"
  - FlatList of creator's lists
```

---

#### 2.4 Purchase History & Earnings
**Time:** 4 hours

**Backend:**
```
Add to /backend/src/api/routes/lists.ts:
  GET /api/purchases/history - User's purchase history

Add to /backend/src/api/routes/stakes.ts:
  GET /api/stakes/earnings - User's staking earnings summary
```

**Frontend:**
```
File: /frontend/app/purchases/history.tsx (NEW)

Display:
  - List of Purchase cards
  - Revenue breakdown visual: 65% creator | 25% stakers | 10% protocol
  - Date, price, list name
  - Link to list detail
```

---

### PHASE 3: Nice-to-Haves (Optional, 16+ hours)

Only if time allows after Phase 1 & 2 complete

#### 3.1 Map Visualization
**Time:** 6 hours
- Install react-native-maps or expo-maps
- Create MapView wrapper component
- Add "Map" tab to list detail screen
- Show place markers with info windows

#### 3.2 Partial Blurred Previews
**Time:** 3 hours
- For paid lists without access: show first 3 places
- Blur remaining place names
- Show "Unlock {X} more places" overlay

#### 3.3 Following Creators
**Time:** 4 hours
- Create Follow model (followerId, followingId)
- Follow/unfollow API endpoints
- Follow button on creator profiles
- Following feed on home screen

#### 3.4 Advanced Recommendations
**Time:** 3 hours
- Recommendation algorithm based on:
  - Purchased list categories
  - Staked creators
  - Collaborative filtering
- "Recommended for You" section on home

---

## 📁 Critical Files Reference

### Backend Files to Create

| Priority | File | Purpose |
|----------|------|---------|
| ⭐ CRITICAL | `/backend/src/api/routes/stakes.ts` | Staking API endpoints |
| ⭐ CRITICAL | `/backend/src/api/routes/reviews.ts` | Review/rating API |
| ⭐ CRITICAL | `/backend/src/api/routes/export.ts` | Export list data |
| ⭐ CRITICAL | `/backend/src/services/reputationService.ts` | Auto-update reputation |
| ⭐ CRITICAL | `/backend/src/services/exportService.ts` | KML/GeoJSON/CSV generators |
| MEDIUM | `/backend/src/api/routes/users.ts` | Public creator profiles |

### Backend Files to Modify

| File | Changes |
|------|---------|
| `/backend/src/api/routes/lists.ts` | Call reputation update after purchase |
| `/backend/src/api/routes/auth.ts` | Add profile editing endpoints |

### Frontend Files to Create

| Priority | File | Purpose |
|----------|------|---------|
| ⭐ CRITICAL | `/frontend/src/components/common/Modal.tsx` | Reusable modal component |
| ⭐ CRITICAL | `/frontend/src/components/stakes/StakeModal.tsx` | Stake amount input UI |
| ⭐ CRITICAL | `/frontend/src/components/stakes/StakeCard.tsx` | Display stake position |
| ⭐ CRITICAL | `/frontend/app/stakes/index.tsx` | My Stakes screen |
| ⭐ CRITICAL | `/frontend/src/components/common/StarRating.tsx` | 5-star rating selector |
| ⭐ CRITICAL | `/frontend/src/components/reviews/ReviewForm.tsx` | Review submission form |
| ⭐ CRITICAL | `/frontend/src/components/reviews/ReviewCard.tsx` | Review display card |
| ⭐ CRITICAL | `/frontend/src/components/export/ExportModal.tsx` | Export format selection |
| MEDIUM | `/frontend/app/profile/edit.tsx` | Profile editing screen |
| MEDIUM | `/frontend/app/creator/[id].tsx` | Creator profile screen |
| MEDIUM | `/frontend/app/purchases/history.tsx` | Purchase history screen |

### Frontend Files to Modify

| File | Changes |
|------|---------|
| `/frontend/app/list/[id].tsx` | Add Stake button, Export button, populate Reviews tab |
| `/frontend/app/(tabs)/library.tsx` | Replace ActivityIndicator with Skeleton |
| `/frontend/app/(tabs)/marketplace.tsx` | Replace ActivityIndicator with Skeleton |
| `/frontend/app/(tabs)/profile.tsx` | Wire Edit Profile button |

---

## ⏱️ Timeline Validation (2 developers, 3 days)

### Day 1: Critical Features (16 hours combined)
- **Morning (8h):** Staking API + UI implementation
- **Afternoon (6h):** Reviews API + UI implementation
- **Evening (2h):** Reputation auto-update service

**Deliverable:** Users can stake TRUST on lists and leave ratings

---

### Day 2: Export & Polish (16 hours combined)
- **Morning (6h):** Export functionality (KML/GeoJSON/CSV)
- **Midday (3h):** Profile editing
- **Afternoon (6h):** Creator public profiles
- **Evening (1h):** Replace ActivityIndicator with Skeleton

**Deliverable:** Complete user flow from import to export

---

### Day 3: Earnings & Optional Features (16 hours combined)
- **Morning (4h):** Purchase history & earnings dashboard
- **Midday (4h):** My Stakes screen polish
- **Afternoon (6h):** Map visualization (optional)
- **Evening (2h):** Bug fixes and testing

**Deliverable:** Demo-ready app with all must-haves complete

---

## ✅ PRD Compliance Summary

| Feature | PRD Requirement | Current | Phase | Status |
|---------|----------------|---------|-------|--------|
| Import | Must-have | 100% ✅ | DONE | Complete |
| Marketplace | Must-have | 100% ✅ | DONE | Complete |
| Purchase | Must-have | 100% ✅ | DONE | Complete |
| **Staking** | Must-have | **100% ✅** | **DONE** | **Complete** |
| Revenue Distribution | Must-have | 100% ✅ | DONE | Complete |
| Protect Lists | Must-have | 100% ✅ | DONE | Complete |
| **Creator Profiles** | Must-have | **100% ✅** | **DONE** | **Complete** |
| Staking on Users | Must-have | **100% ✅** | **DONE** | **Complete** |
| Filters | Must-have | 100% ✅ | DONE | Complete |
| **Export** | Must-have | **100% ✅** | **DONE** | **Complete** |
| **Reviews** | Must-have | **100% ✅** | **DONE** | **Complete** |
| **Reputation** | Must-have | **100% ✅** | **DONE** | **Complete** |
| **Profile Editing** | Polish | **100% ✅** | **DONE** | **Complete** |
| **Purchase History** | Polish | **100% ✅** | **DONE** | **Complete** |
| **Skeleton States** | Polish | **100% ✅** | **DONE** | **Complete** |

**Phase 1 & 2 Complete:** All critical must-have features + polish features implemented ✅
**Phase 3 Available:** Optional nice-to-have features (Map visualization, blurred previews, following, recommendations)

---

## 🎨 Design Compliance Checklist

Before merging any PR, verify:

- [ ] **Theme tokens only** - No hardcoded colors (`#6B7280` → `colors.text.secondary`)
- [ ] **WCAG AA contrast** - Minimum 4.5:1 for text, 3:1 for UI components
- [ ] **44px touch targets** - All buttons, tabs, chips minimum 44×44px
- [ ] **Bottom nav visible** - SafeAreaView with `edges={['top']}` only
- [ ] **Skeleton for loading** - Never use bare ActivityIndicator
- [ ] **Error states complete** - Icon + message + retry button
- [ ] **Empty states complete** - Icon + title + description + CTA
- [ ] **Animations optimized** - `useNativeDriver: true` for all animations
- [ ] **Accessibility labels** - All Pressable elements have accessibilityLabel
- [ ] **Spacing tokens** - Use `spacing[]` array, no magic numbers

---

## 🎯 Success Criteria

### Demo Requirements
✅ **Complete User Flow:** Import → Browse → Purchase → Stake → Earn → Export
✅ **Dynamic Reputation:** Updates automatically on purchases, stakes, reviews
✅ **All 7 PRD Modules:** Import, Library, Marketplace, Purchase, Staking, Reputation, Export
✅ **Design Compliance:** 90%+ adherence to design_principles_and_best_practices.md

### Risk Mitigation Strategies
If time runs short, simplify in this order:
1. **Staking:** Implement "lists only" (skip user staking)
2. **Export:** Prioritize KML only (skip GeoJSON/CSV)
3. **Reviews:** Rating-only (skip text comments)
4. **Map Visualization:** Skip if Phase 1 not complete

---

## 📚 Reference Documents

- **PRD:** `/trustmap/PRD — Trustmaps.md`
- **Design Principles:** `/trustmap/design_principles_and_best_practices.md`
- **Database Schema:** `/trustmap/backend/prisma/schema.prisma`
- **README:** `/trustmap/README.md`

---

## 🚀 Next Steps

1. **Immediate (Hours 1-4):** Build staking API endpoints (`stakes.ts`)
2. **Then (Hours 5-8):** Build staking UI (Modal, StakeModal, StakeCard, My Stakes screen)
3. **Then (Hours 9-14):** Build reviews API + UI (StarRating, ReviewForm, ReviewCard)
4. **Then (Hours 15-20):** Build export functionality (KML/GeoJSON/CSV)
5. **Then (Hours 21-22):** Wire up reputation auto-update
6. **Final (Hours 23-30):** Polish, accessibility fixes, Skeleton replacements

**Total Phase 1:** 30 hours = Realistic for 2 developers in 2 days

---

**Last Updated:** December 11, 2025
**Next Review:** After Phase 1 completion
**Status:** 🟡 In Progress - Phase 1 Critical Features

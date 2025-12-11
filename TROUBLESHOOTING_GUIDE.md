# Troubleshooting Guide

**Last Updated:** December 11, 2025

This guide documents common issues and their solutions to help quickly unblock development in the future.

---

## Critical Component Interface Requirements

### 1. API Client URL Pattern ⚠️

**Issue**: Double `/api/` in URLs causing 404 errors

**Root Cause**:
- `API_URL` in `client.ts` already includes `/api`: `http://localhost:3001/api`
- Endpoints were incorrectly prefixed with `/api/`

**Correct Pattern**:
```typescript
// ❌ WRONG - Double /api/
await apiClient.get('/api/lists/123')
// Results in: http://localhost:3001/api/api/lists/123

// ✅ CORRECT
await apiClient.get('/lists/123')
// Results in: http://localhost:3001/api/lists/123
```

**Files to Check**: Any file calling `apiClient.get|post|put|delete()`

---

### 2. API Response Structure ⚠️

**Issue**: Accessing `response.data.lists` returns undefined

**Root Cause**:
- `apiClient` unwraps responses automatically
- Backend returns `{ lists: [...] }`
- No `.data` wrapper needed

**Correct Pattern**:
```typescript
// ❌ WRONG
const response = await apiClient.get('/lists');
setLists(response.data.lists);  // undefined!

// ✅ CORRECT
const response = await apiClient.get('/lists');
setLists(response.lists);
```

---

### 3. Button Component Interface ⚠️

**Issue**: Button text not visible, component expects string `title` prop

**Root Cause**:
- Button component does NOT accept children
- Must use `title` prop for text
- Icons go in `icon` prop

**Correct Pattern**:
```typescript
// ❌ WRONG - No children support
<Button onPress={handleClick}>
  <Ionicons name="cart" />
  <Text>Buy Now</Text>
</Button>

// ✅ CORRECT
<Button
  title="Buy Now"
  onPress={handleClick}
  icon={<Ionicons name="cart" size={20} color={colors.surface} />}
/>
```

**Component File**: `/frontend/src/components/common/Button.tsx`

---

### 4. Badge Component Interface ⚠️

**Issue**: Badge content not visible, expects `label` prop

**Root Cause**:
- Badge component does NOT accept children
- Must use `label` prop for text
- Icon specified via `icon` prop (icon name string)
- NO `size` prop exists

**Correct Pattern**:
```typescript
// ❌ WRONG - No children support
<Badge variant="success" size="sm">
  FREE
</Badge>

// ✅ CORRECT
<Badge
  label="FREE"
  variant="success"
  icon="star"  // Optional: icon name string
/>
```

**Component File**: `/frontend/src/components/common/Badge.tsx`

---

### 5. Avatar Component Interface ⚠️

**Issue**: Avatar expects `initials`, not `name`

**Correct Pattern**:
```typescript
// ❌ WRONG
<Avatar
  name={user.displayName}
  imageUrl={user.profileImage}
/>

// ✅ CORRECT
<Avatar
  initials={user.displayName?.substring(0, 2).toUpperCase() || '??'}
  imageUrl={user.profileImage}
/>
```

**Component File**: `/frontend/src/components/common/Avatar.tsx`

---

### 6. TabBar Component Interface ⚠️

**Issue**: Tabs not switching, expects `value` property in tabs array

**Root Cause**:
- TabBar looks for `tab.value` to match `activeTab`
- Using `key` property causes matching to fail

**Correct Pattern**:
```typescript
// ❌ WRONG
<TabBar
  tabs={[
    { key: 'overview', label: 'Overview' },  // Wrong property
    { key: 'places', label: 'Places' },
  ]}
  activeTab={activeTab}
/>

// ✅ CORRECT
<TabBar
  tabs={[
    { value: 'overview', label: 'Overview' },  // Correct property
    { value: 'places', label: 'Places' },
  ]}
  activeTab={activeTab}
/>
```

**Component File**: `/frontend/src/components/common/TabBar.tsx`

---

## Authentication Issues

### 7. Authentication Not Initializing ⚠️

**Issue**: API requests fail with 401/404 even when logged in

**Root Cause**:
- `apiClient.init()` never called on app startup
- Token not loaded from AsyncStorage

**Solution**:
```typescript
// In app/index.tsx
export default function Index() {
  const { loadUser } = useAuthStore();

  useEffect(() => {
    loadUser();  // ✅ Must call on app start
  }, []);
}
```

**Also**: Add auto-initialization in `apiClient`:
```typescript
private async ensureInitialized() {
  if (this.initialized) return;
  await this.init();
}

private async request() {
  await this.ensureInitialized();  // ✅ Auto-init before each request
  // ... rest of request logic
}
```

**Files**:
- `/frontend/app/index.tsx`
- `/frontend/src/api/client.ts`

---

## Data Import Limitations

### 8. Google Takeout Data ⚠️

**Issue**: Places missing ratings, price levels, cuisine, photos

**Root Cause**:
- Google Takeout ONLY exports basic saved location data
- Does NOT include Google Places API data

**What's Included**:
- ✅ Place name
- ✅ Address (approximate)
- ✅ Latitude/Longitude
- ❌ Rating
- ❌ Price level
- ❌ Cuisine
- ❌ Photos
- ❌ Reviews
- ❌ Opening hours

**Solution**:
- Conditionally render fields only if data exists
- Consider enriching with Google Places API (requires API key)

**Pattern**:
```typescript
{place.rating && (
  <View>
    <Text>⭐ {place.rating}</Text>
  </View>
)}
```

---

## Debugging Checklist

When encountering issues, check:

1. ✅ **API URLs** - No double `/api/` prefix
2. ✅ **API Responses** - Access fields directly, no `.data` wrapper
3. ✅ **Component Props** - Use correct prop names (title, label, initials, value)
4. ✅ **Authentication** - Token loaded on app start
5. ✅ **Console Logs** - Check browser/terminal for actual API calls
6. ✅ **Component Files** - Read component interface when in doubt
7. ✅ **Data Existence** - Conditionally render based on actual data

---

## Quick Reference: Component Interfaces

```typescript
// Button
<Button
  title="Text"           // Required string
  onPress={() => {}}     // Required function
  icon={<Icon />}        // Optional ReactNode
  variant="primary"      // Optional: primary|secondary|outline|ghost|danger
/>

// Badge
<Badge
  label="Text"          // Required string
  variant="neutral"     // Optional: neutral|accent|success|warning|error|rating
  icon="star"          // Optional: icon name string
/>

// Avatar
<Avatar
  initials="AB"        // Required string (2 chars)
  imageUrl="url"       // Optional string
  size="md"           // Optional: xs|sm|md|lg|xl
/>

// TabBar
<TabBar
  tabs={[{ value: 'key', label: 'Label' }]}  // value is required
  activeTab="key"
  onChange={(value) => {}}
/>
```

---

## Backend Port Reference

- **Backend API**: http://localhost:3001
- **Frontend Dev**: http://localhost:8081
- **Prisma Studio**: http://localhost:5555
- **PostgreSQL**: localhost:5432

---

**Remember**: When in doubt, READ THE COMPONENT FILE to see the actual interface!

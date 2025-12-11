# Trustmaps Design Principles & Best Practices

**Version:** 1.0
**Last Updated:** December 11, 2025
**Purpose:** North Star design document for Trustmaps development, serving as the authoritative guide for UI/UX decisions, component patterns, and implementation standards.

---

## Table of Contents

1. [Design Philosophy & Inspiration](#part-1-design-philosophy--inspiration)
2. [Design System Tokens](#part-2-design-system-tokens)
3. [Component Patterns](#part-3-component-patterns)
4. [Layout & Navigation Patterns](#part-4-layout--navigation-patterns)
5. [Screen-Specific Design Patterns](#part-5-screen-specific-design-patterns)
6. [Accessibility Requirements](#part-6-accessibility-requirements)
7. [Performance & Optimization](#part-7-performance--optimization)
8. [Error Handling & Empty States](#part-8-error-handling--empty-states)
9. [Design Inspiration Sources](#part-9-design-inspiration-sources)
10. [Implementation Guidelines](#part-10-implementation-guidelines)

---

## PART 1: DESIGN PHILOSOPHY & INSPIRATION

### 1.1 Core Design Philosophy

Based on theme.ts design principles and SuppCo app inspiration:

#### Ultra-Minimal, Accessibility First
- **Clarity over cleverness**: Every design decision prioritizes user understanding
- **WCAG AA compliant**: Minimum 4.5:1 text contrast, 3:1 UI contrast
- **Every design decision must pass accessibility tests**

#### Modern Mobile-First
- Designed for touch interfaces (44px minimum touch targets)
- Persistent bottom navigation that never gets covered
- Gesture-friendly interactions
- Platform-aware (iOS vs Android differences)

#### Visually Rich Yet Refined
- Inspired by SuppCo app's information density
- Scannable metadata grids
- Multi-segment progress indicators
- Colored category systems
- Strategic use of gradients for premium features

#### Consistency & Predictability
- Unified design system (color, typography, spacing)
- Reusable component patterns
- Predictable user flows

### 1.2 SuppCo App Inspiration Analysis

**Reference Images:** `/Trustmap/inspirational UI/`

**Key Patterns Adopted from SuppCo:**

#### 1. Multi-Segment Progress Circles (IMG_4398)
- **SuppCo Pattern**: StackScore circular gauge with colored segments (red/amber/green)
- Large number + label in center
- Visual representation of complex metrics
- **Trustmaps Implementation**: ProgressCircle component for engagement scores, TRUST scores

#### 2. Metadata Grids (IMG_4399)
- **SuppCo Pattern**: Product cards show Servings, Price/serv, From, Format
- 2-4 column grid layout
- Icon + Label + Value pattern
- **Trustmaps Implementation**: MetadataGrid component for list details (places, sales, stakers, price)

#### 3. Rating Badges with Colored Dots (IMG_4399)
- **SuppCo Pattern**: Score + colored dot + label (9.50 EXCELLENT with green dot)
- Color-coded quality indicators
- **Trustmaps Implementation**: Badge component with "rating" variant

#### 4. Pill-Shaped Category Chips (IMG_4399, IMG_4400)
- **SuppCo Pattern**: Horizontal scrollable filters
- Active state: filled background + white text
- Inactive: outline + gray text
- Icon support
- **Trustmaps Implementation**: CategoryChip component

#### 5. Tab Navigation with Underline (IMG_4398, IMG_4400)
- **SuppCo Pattern**: Products, Schedule, Nutrients, Plans
- Animated underline indicator
- Bold active state
- **Trustmaps Implementation**: TabBar component

#### 6. Gradient Premium Cards (IMG_4400)
- **SuppCo Pattern**: "SuppCo Pro" card with blue→purple gradient
- Yellow CTA button for contrast
- Premium feature promotion
- **Trustmaps Implementation**: GradientCard component

#### 7. Creator Attribution (IMG_4398)
- **SuppCo Pattern**: Author avatar + name on content cards
- Builds trust and credibility
- **Trustmaps Implementation**: Avatar component with 5 sizes

#### 8. Bottom Navigation Persistence
- **SuppCo Pattern**: Always visible across all screens
- Never hidden or covered
- **Trustmaps Implementation**: Expo Router tabs with proper safe area handling

---

## PART 2: DESIGN SYSTEM TOKENS

### 2.1 Color System

**Philosophy:** Neutral-first with single accent color (Indigo) for maximum flexibility

#### Neutral Palette (Cool grays for depth)
```typescript
neutral: {
  0: '#FFFFFF',    // Pure white
  50: '#F9FAFB',   // Background
  100: '#F3F4F6',  // Subtle background
  200: '#E5E7EB',  // Borders
  300: '#D1D5DB',  // Disabled text
  400: '#9CA3AF',  // Placeholder text
  500: '#6B7280',  // Secondary text
  600: '#4B5563',  // Primary text
  700: '#374151',  // Headings
  800: '#1F2937',  // Strong headings
  900: '#111827',  // Darkest text
}
```

#### Accent Color (Indigo for primary actions)
```typescript
accent: {
  50: '#EEF2FF',
  100: '#E0E7FF',
  200: '#C7D2FE',
  300: '#A5B4FC',
  400: '#818CF8',
  500: '#6366F1',  // PRIMARY - use for buttons, links, focus states
  600: '#4F46E5',
  700: '#4338CA',
  800: '#3730A3',
  900: '#312E81',
}
```

#### Semantic Colors
```typescript
success: '#10B981',  // Green for positive actions
warning: '#F59E0B',  // Amber for warnings
error: '#EF4444',    // Red for errors/destructive actions
info: '#3B82F6',     // Blue for informational messages
```

#### Text Colors (High contrast for accessibility)
```typescript
text: {
  primary: neutral[900],    // #111827 - Body text, headings
  secondary: neutral[600],  // #4B5563 - Supporting text
  tertiary: neutral[500],   // #6B7280 - Captions, metadata
  disabled: neutral[400],   // #9CA3AF - Disabled states
  inverse: neutral[0],      // #FFFFFF - Text on dark backgrounds
}
```

#### Category Gradients (Visual distinction for list categories)
```typescript
categoryGradients: {
  food: ['#F59E0B', '#EF4444'],         // Amber → Red
  travel: ['#3B82F6', '#6366F1'],       // Blue → Indigo
  nightlife: ['#8B5CF6', '#7C3AED'],    // Purple → Dark purple
  shopping: ['#EC4899', '#DB2777'],     // Pink → Dark pink
  wellness: ['#10B981', '#059669'],     // Green → Dark green
  culture: ['#6366F1', '#4F46E5'],      // Indigo → Dark indigo
  outdoors: ['#059669', '#047857'],     // Dark green → Darker green
  entertainment: ['#F59E0B', '#D97706'], // Amber → Dark amber
}
```

#### Premium Gradient (For promotional cards)
```typescript
premium: ['#3B82F6', '#8B5CF6']  // Blue → Purple (SuppCo inspired)
```

#### Contrast Ratios (WCAG AA Compliance)
- Body text `neutral[600]` on white: **7.3:1** ✅
- Headings `neutral[900]` on white: **10.4:1** ✅
- Accent `accent[500]` on white: **4.9:1** ✅

### 2.2 Typography

**Font Family:** Inter (400, 500, 600, 700)

#### Type Scale (Major third ratio: 1.250)
```typescript
sizes: {
  xs: 12,    // Captions, small labels
  sm: 14,    // Body small, secondary text
  base: 16,  // Body text, inputs
  lg: 20,    // H4, card titles
  xl: 25,    // H3, section titles
  '2xl': 31, // H2, page titles
  '3xl': 39, // H1, hero text
  '4xl': 49, // Display text (rare)
}
```

#### Line Heights
```typescript
lineHeights: {
  tight: 1.25,   // Headings
  normal: 1.5,   // Body text
  relaxed: 1.75, // Long-form content
}
```

#### Font Weights
```typescript
fonts: {
  regular: 'Inter_400Regular',
  medium: 'Inter_500Medium',    // Buttons, labels, emphasis
  semibold: 'Inter_600SemiBold', // H3-H4, card titles
  bold: 'Inter_700Bold',         // H1-H2, strong emphasis
}
```

#### Pre-Styled Text Components
Use these for consistency:

```typescript
textStyles: {
  h1: {
    fontSize: 39,
    fontWeight: 700,
    color: neutral[900],
    lineHeight: tight
  },
  h2: {
    fontSize: 31,
    fontWeight: 700,
    color: neutral[900],
    lineHeight: tight
  },
  h3: {
    fontSize: 25,
    fontWeight: 600,
    color: neutral[900],
    lineHeight: tight
  },
  h4: {
    fontSize: 20,
    fontWeight: 600,
    color: neutral[900],
    lineHeight: tight
  },
  body: {
    fontSize: 16,
    fontWeight: 400,
    color: neutral[600],
    lineHeight: normal
  },
  bodySmall: {
    fontSize: 14,
    fontWeight: 400,
    color: neutral[600],
    lineHeight: normal
  },
  caption: {
    fontSize: 12,
    fontWeight: 400,
    color: neutral[500],
    lineHeight: normal
  },
  label: {
    fontSize: 14,
    fontWeight: 500,
    color: neutral[700],
    lineHeight: normal
  },
  button: {
    fontSize: 16,
    fontWeight: 600,
    color: surface,
    lineHeight: tight
  },
  link: {
    fontSize: 16,
    fontWeight: 500,
    color: accent[500],
    textDecorationLine: 'underline'
  },
}
```

### 2.3 Spacing System

**Base Unit:** 4px (8px grid for larger gaps)

#### Scale
```typescript
spacing: {
  0: 0,
  1: 4,    // Tight padding (icon gaps, badges)
  2: 8,    // Small gaps (between related items)
  3: 12,   // Medium gaps (card sections)
  4: 16,   // Standard padding (cards, buttons)
  5: 20,   // Larger padding
  6: 24,   // Screen padding (horizontal margins)
  8: 32,   // Section gaps
  10: 40,  // Large section gaps
  12: 48,  // Extra large gaps
  16: 64,  // Hero spacing
  20: 80,  // Maximum spacing
}
```

#### Usage Guidelines
- **Screen horizontal padding**: `spacing[6]` (24px)
- **Card padding**: `spacing[4]` or `spacing[5]` (16-20px)
- **Between sections**: `spacing[6]` to `spacing[8]` (24-32px)
- **Icon-to-text gap**: `spacing[2]` (8px)
- **List item gap**: `spacing[3]` or `spacing[4]` (12-16px)

### 2.4 Border Radius

```typescript
borderRadius: {
  none: 0,
  sm: 4,     // Badges, chips
  base: 8,   // Buttons, inputs
  md: 12,    // Cards
  lg: 16,    // Large cards, modals
  xl: 24,    // Hero cards
  full: 9999, // Pills, circular elements
}
```

### 2.5 Shadows

**Elevation System** (Subtle depth, not decorative)

```typescript
shadows: {
  none: {},
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  base: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 4,
  },
  colored: {
    shadowColor: accent[500],
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 4,
  },
}
```

### 2.6 Animation Timings

#### Durations
```typescript
animations: {
  fast: 150,    // Button press, toggle, hover states
  normal: 250,  // Modals, slide-ins, fades
  slow: 400,    // Page transitions, large movements
}
```

#### Spring Configuration
```typescript
spring: {
  damping: 15,
  stiffness: 200,
}
```

#### Usage
- **Fast (150ms)**: Touch feedback, button scale, toggle switches
- **Normal (250ms)**: Modal open/close, dropdown expand, tab switch
- **Slow (400ms)**: Screen transitions, drawer slide, hero animations

---

## PART 3: COMPONENT PATTERNS

### 3.1 ProgressCircle Component

**File:** `src/components/common/ProgressCircle.tsx`

**Purpose:** Multi-segment circular progress indicators inspired by SuppCo StackScore

#### Props
```typescript
interface ProgressCircleProps {
  value: number;                    // 0-100
  size?: 'sm' | 'md' | 'lg';       // 60px | 80px | 120px
  label?: string;                   // Text below value
  segments?: Array<{
    color: string;
    percentage: number;
  }>;
}
```

#### Visual Specs
- **Stroke width**: size === 'sm' ? 6 : size === 'md' ? 8 : 10
- **Auto-color**: Green (80+), Amber (60-79), Red (0-59)
- **Center**: Large value + small label below

#### Use Cases
- Engagement scores on home screen
- TRUST reputation scores
- List quality metrics
- Staking progress indicators

---

### 3.2 MetadataGrid Component

**File:** `src/components/common/MetadataGrid.tsx`

**Purpose:** Scannable information grid inspired by SuppCo product metadata

#### Props
```typescript
interface MetadataGridProps {
  items: Array<{
    label: string;
    value: string;
    icon?: keyof typeof Ionicons.glyphMap;
  }>;
  compact?: boolean;  // Tighter spacing
}
```

#### Visual Specs
- **Responsive**: 2 columns (mobile), 4 columns (tablet+)
- **Gap**: `spacing[3]` (12px) or `spacing[2]` (8px) if compact
- **Label**: caption style, neutral[500]
- **Value**: bodySmall style, semibold, neutral[900]

#### Use Cases
- List detail stats (places, sales, stakers, price)
- User profile stats (TRUST, followers, following)
- Place details (rating, price level, category)

---

### 3.3 Badge Component

**File:** `src/components/common/Badge.tsx`

**Purpose:** Inline status indicators and category labels

#### Variants
- `neutral`: Gray for general labels
- `accent`: Indigo for primary tags
- `success`: Green for positive status (FREE, verified)
- `warning`: Amber for warnings
- `error`: Red for errors
- `rating`: Special variant with colored dot + score

#### Props
```typescript
interface BadgeProps {
  label: string;
  variant: 'neutral' | 'accent' | 'success' | 'warning' | 'error' | 'rating';
  size?: 'sm' | 'base';
  icon?: keyof typeof Ionicons.glyphMap;
  score?: number;       // For rating variant
  dotColor?: 'success' | 'warning' | 'error';
}
```

#### Visual Specs
- **Border radius**: `borderRadius.full`
- **Padding**: `spacing[2]` x `spacing[3]` (8px × 12px)
- **Font**: medium weight
- **Icon size**: 12px

#### Use Cases
- Price tags (FREE, 10 TRUST)
- Category labels
- Status indicators
- Rating badges (9.5 EXCELLENT with green dot)

---

### 3.4 TrustScoreBadge Component

**File:** `src/components/marketplace/TrustScoreBadge.tsx`

**Purpose:** Circular badge displaying TRUST scores

#### Props
```typescript
interface TrustScoreBadgeProps {
  score: number;  // 0-100
  size?: 'sm' | 'md' | 'lg';  // 40px | 56px | 80px
}
```

#### Visual Specs
- Circular badge
- **Color-coded**: Green (80+), Amber (60-79), Gray (<60)
- Score + "TRUST" label in center
- **Border**: 2px of score color

#### Use Cases
- List cards (top-right overlay on image)
- Creator profiles
- Marketplace rankings

---

### 3.5 Avatar Component

**File:** `src/components/common/Avatar.tsx`

**Purpose:** User avatars with image or initials fallback

#### Props
```typescript
interface AvatarProps {
  imageUrl?: string;
  initials?: string;
  name?: string;        // For generating initials
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';  // 24 | 32 | 48 | 80 | 120px
  border?: 'none' | 'thin' | 'thick';
  showOnlineStatus?: boolean;
}
```

#### Visual Specs
- Circular (`borderRadius.full`)
- 7 deterministic colors for initials fallback
- **Border**: 1px (thin) or 2px (thick) white
- **Online status**: 8px green dot (bottom-right)

#### Use Cases
- User profiles (xl: 120px)
- List creators on cards (xs: 24px, sm: 32px)
- Comment authors (md: 48px)
- Activity feeds (sm: 32px)

---

### 3.6 GradientCard Component

**File:** `src/components/common/GradientCard.tsx`

**Purpose:** Premium feature promotional cards inspired by SuppCo "Go Pro" card

#### Props
```typescript
interface GradientCardProps {
  gradient: [string, string];  // Start and end colors
  title: string;
  subtitle?: string;
  ctaText: string;
  ctaColor?: string;   // Default: '#FBBF24' (yellow)
  onPress: () => void;
  onDismiss?: () => void;
  icon?: keyof typeof Ionicons.glyphMap;
}
```

#### Visual Specs
- Linear gradient background (top-left to bottom-right)
- White text overlay
- Yellow CTA button for high contrast
- Optional dismiss X button (top-right)
- Optional icon (top-left)
- **Border radius**: `borderRadius.lg` (16px)

#### Use Cases
- Premium feature promotions
- Special offers
- Upgrade CTAs
- Highlighted announcements

---

### 3.7 CategoryChip Component

**File:** `src/components/common/CategoryChip.tsx`

**Purpose:** Pill-shaped filter chips inspired by SuppCo category filters

#### Props
```typescript
interface CategoryChipProps {
  label: string;
  active: boolean;
  onPress: () => void;
  icon?: keyof typeof Ionicons.glyphMap;
  iconColor?: string;
}
```

#### Visual Specs
- **Border radius**: `borderRadius.full` (pill shape)
- **Active**: `accent[500]` background, white text
- **Inactive**: transparent background, `neutral[200]` border, `neutral[600]` text
- Icon + label layout
- **Padding**: `spacing[2]` x `spacing[4]` (8px × 16px)

#### Use Cases
- Marketplace category filters
- List detail filters
- Multi-select filter UI
- Tag selection

---

### 3.8 TabBar Component

**File:** `src/components/common/TabBar.tsx`

**Purpose:** Horizontal tab navigation with animated underline

#### Props
```typescript
interface TabBarProps {
  tabs: Array<{ key: string; label: string }>;
  activeTab: string;
  onChange: (key: string) => void;
  style?: ViewStyle;
}
```

#### Visual Specs
- Horizontal flexbox layout
- **Active tab**: semibold font, `accent[500]` color
- **Inactive tab**: medium font, `neutral[500]` color
- **Underline**: 2px height, `accent[500]` color, animated position
- **Border bottom**: 1px `neutral[200]`

#### Use Cases
- List detail screens (Overview, Places, Reviews)
- Profile sections (Lists, Stakes, Activity)
- Settings screens

---

## PART 4: LAYOUT & NAVIGATION PATTERNS

### 4.1 Navigation Requirements

**Bottom Navigation Rules:**
- Must be visible on ALL tab screens
- Never covered by content
- Proper safe area handling (`edges={['top']}` on SafeAreaView)
- Platform-specific padding (iOS: include notch, Android: include gesture bar)

#### ✅ APPROVED Pattern
```tsx
<SafeAreaView style={styles.container} edges={['top']}>
  <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
    {/* Content */}
  </ScrollView>
</SafeAreaView>
```

#### ❌ AVOID Pattern
```tsx
<SafeAreaView edges={['top']}>
  <View style={{ flex: 1 }}>  {/* Don't wrap in flex View */}
    <ScrollView style={{ flex: 1 }}> {/* Don't use flex on ScrollView */}
      {/* Content */}
    </ScrollView>
  </View>
</SafeAreaView>
```

### 4.2 Tab Screen Structure Requirements

- SafeAreaView with `edges={['top']}` only
- ScrollView or FlatList as direct child (preferred)
- If multiple sections needed, use column-based flex layout WITHOUT `flex: 1` on content areas
- Always add `paddingBottom` to account for bottom tab bar height (typically 60-80px)

### 4.3 Safe Area Handling

- **Top:** Handled by SafeAreaView `edges={['top']}`
- **Bottom:** Handled by Expo Router tab bar + manual padding in content
- **Never use:** `edges={['top', 'bottom']}` on tab screens (conflicts with tab bar)

### 4.4 Component Guidelines

#### Screen-level Components
- Must respect bottom navigation space
- Use ScrollView for scrollable content
- Add paddingBottom to contentContainerStyle

#### Reusable Components
- Should be layout-agnostic
- Let parent control positioning
- No hardcoded heights that might interfere with navigation

### 4.5 Common Pitfalls to Avoid

1. ❌ Using `flex: 1` on Views wrapping ScrollView
2. ❌ Forgetting paddingBottom on scrollable content
3. ❌ Using `edges={['bottom']}` on SafeAreaView in tab screens
4. ❌ Nested Views with conflicting flex constraints
5. ❌ Custom tab bars that compete with bottom navigation

### 4.6 Testing Checklist

Before merging any screen changes:
- [ ] Bottom navigation visible on screen
- [ ] Bottom navigation clickable (not covered)
- [ ] Content scrolls without cutting off last item
- [ ] Safe area respected on notched devices
- [ ] Works on both iOS and Android
- [ ] Works in web view (if applicable)

### 4.7 Layout Tokens

```typescript
// In theme.ts or constants
export const LAYOUT = {
  bottomTabBarHeight: {
    web: 64,
    mobile: 60,
  },
  safeBottomPadding: {
    web: 64,
    mobile: 80, // 60 + 20 extra buffer
  },
};
```

### 4.8 Screen Type Examples

#### Simple Scrolling Screen
```tsx
<SafeAreaView edges={['top']}>
  <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
    <Text>Content</Text>
  </ScrollView>
</SafeAreaView>
```

#### Multi-Section Screen
```tsx
<SafeAreaView edges={['top']}>
  <View style={styles.header}>{/* Fixed header */}</View>
  <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
    <Text>Scrollable content</Text>
  </ScrollView>
</SafeAreaView>
```

#### With Internal Tabs
```tsx
<SafeAreaView edges={['top']}>
  <View style={styles.header}>{/* Fixed header */}</View>
  <View style={styles.tabBar}>{/* Internal tabs */}</View>
  <ScrollView contentContainerStyle={{ padding: 24, paddingBottom: 100 }}>
    {/* Tab content */}
  </ScrollView>
</SafeAreaView>
```

---

## PART 5: SCREEN-SPECIFIC DESIGN PATTERNS

### 5.1 Marketplace Screen

**Visual Hierarchy:**
1. Search bar (48px height, full width)
2. Category chips (horizontal scrollable)
3. Grid of list cards (2 columns mobile, 3-4 columns tablet)
4. Pagination controls

**Components Used:**
- Input (search variant with icon)
- CategoryChip (active/inactive states)
- MarketplaceListCard (with MetadataGrid + TrustScoreBadge + Avatar)
- Badge (for price tags: FREE, 10 TRUST)

**Layout:**
```tsx
<SafeAreaView edges={['top']}>
  <View style={styles.searchContainer}>
    <Input variant="search" placeholder="Search lists..." />
  </View>
  <ScrollView horizontal style={styles.chipContainer}>
    {categories.map(cat => <CategoryChip key={cat} ... />)}
  </ScrollView>
  <FlatList
    data={lists}
    numColumns={2}
    contentContainerStyle={{ paddingBottom: 100 }}
    renderItem={({ item }) => <MarketplaceListCard list={item} />}
  />
</SafeAreaView>
```

### 5.2 List Detail Screen

**Visual Hierarchy:**
1. Hero image (220px height, gradient overlay)
2. TrustScoreBadge (top-right overlay)
3. TabBar navigation (Overview, Places, Reviews)
4. Tab content (scrollable)

**Components Used:**
- TabBar (3 tabs with animated underline)
- MetadataGrid (places, sales, stakers, price)
- Badge (rating variant for avg rating)
- Avatar (creator attribution)
- Button (primary for Purchase, secondary for Save)

**Access Control:**
- If paid & NOT purchased: Show 1 place preview + lock overlay
- If owned/purchased/free+saved: Show all places

### 5.3 Profile Screen

**Visual Hierarchy:**
1. Large avatar (120px) with edit button
2. Display name + username
3. ProgressCircle (reputation score)
4. MetadataGrid (TRUST, staked, followers, following)
5. Menu list (My Lists, Purchases, Stakes, Settings)
6. Logout button (danger variant)

**Components Used:**
- Avatar (xl size with image/initials)
- ProgressCircle (reputation visualization)
- MetadataGrid (4 stats in 2x2 grid)
- Button (outline for Edit Profile, danger for Logout)

### 5.4 Home Screen

**Visual Hierarchy:**
1. Greeting (Welcome back, {displayName})
2. TRUST balance badge
3. ProgressCircle (engagement score)
4. Quick action cards (Import Maps, Explore Marketplace)
5. Featured section (optional carousel)

**Components Used:**
- ProgressCircle (central engagement metric)
- Badge (accent variant for TRUST balance)
- Card (interactive variant for CTAs)
- GradientCard (optional promotional content)

### 5.5 Library Screen

**Visual Hierarchy:**
1. Header with "Library" title
2. Internal tab bar (My Lists, Saved, Purchased)
3. List cards grid
4. Pull-to-refresh support

**Critical Layout Pattern:**
```tsx
<SafeAreaView style={styles.container} edges={['top']}>
  <View style={styles.header}>
    <Text style={styles.headerTitle}>Library</Text>
  </View>

  <View style={styles.tabBar}>
    {/* Internal tabs */}
  </View>

  {/* ScrollView directly, NOT wrapped in flex View */}
  <ScrollView
    style={{ flex: 1 }}
    contentContainerStyle={{
      padding: spacing[6],
      paddingBottom: 100, // Space for bottom tab bar
    }}
  >
    {/* Content */}
  </ScrollView>
</SafeAreaView>
```

**Common Mistake:** Wrapping ScrollView in `<View style={{ flex: 1 }}>` - this covers the bottom navigation.

---

## PART 6: ACCESSIBILITY REQUIREMENTS

### 6.1 WCAG AA Compliance

#### Contrast Ratios
- **Normal text (< 18px)**: Minimum 4.5:1
- **Large text (≥ 18px or 14px bold)**: Minimum 3:1
- **UI components**: Minimum 3:1

**Current Implementation:**
- Body text `neutral[600]` on white: **7.3:1** ✅
- Headings `neutral[900]` on white: **10.4:1** ✅
- Accent `accent[500]` on white: **4.9:1** ✅

#### Touch Targets
- **Minimum**: 44px × 44px (iOS HIG, Material Design)
- **Preferred**: 48px × 48px for critical actions
- **Spacing between targets**: Minimum 8px

#### Focus Indicators
- Visible focus ring on all interactive elements
- 2px `accent[500]` border + 3px `accent[100]` shadow
- **Never remove `:focus` styles**

### 6.2 Screen Reader Support

#### Semantic HTML/Accessible Components
- Use proper heading hierarchy (h1 → h2 → h3)
- Label all form inputs
- Provide alt text for all images
- Use `accessibilityLabel` on React Native components

**Example:**
```tsx
<Pressable
  accessibilityRole="button"
  accessibilityLabel="Purchase list for 10 TRUST tokens"
  accessibilityHint="Opens purchase confirmation dialog"
>
  <Text>Purchase (10 TRUST)</Text>
</Pressable>
```

### 6.3 Keyboard Navigation

**Web Requirements:**
- Tab order follows visual flow (top to bottom, left to right)
- Skip to main content link
- Escape key closes modals/drawers
- Enter/Space activates buttons
- Arrow keys navigate lists/grids

---

## PART 7: PERFORMANCE & OPTIMIZATION

### 7.1 Image Optimization

#### Google Places Photos
- Request appropriate size (don't load 1600px for 320px display)
- Use placeholder while loading
- Cache aggressively (24hr minimum)

#### Gradient Placeholders
- Pre-generate category gradients
- Use deterministic colors from list/place name hash
- Fallback when Google Photos unavailable

### 7.2 Animation Performance

#### 60fps Target
- Use `useNativeDriver: true` for transforms/opacity
- Avoid animating layout properties (width, height, padding)
- Prefer `transform: [{ scale }]` over width/height changes
- Use `InteractionManager.runAfterInteractions()` for heavy operations

**Example:**
```tsx
Animated.timing(fadeAnim, {
  toValue: 1,
  duration: animations.normal, // 250ms
  useNativeDriver: true, // GPU acceleration
}).start();
```

### 7.3 List Rendering

**FlatList Optimization:**
```tsx
<FlatList
  data={items}
  renderItem={renderItem}
  keyExtractor={item => item.id}
  initialNumToRender={10}
  maxToRenderPerBatch={10}
  windowSize={5}
  removeClippedSubviews={true}
  getItemLayout={(data, index) => ({
    length: ITEM_HEIGHT,
    offset: ITEM_HEIGHT * index,
    index,
  })}
/>
```

---

## PART 8: ERROR HANDLING & EMPTY STATES

### 8.1 Error States

**Visual Pattern:**
- Icon (warning/error color)
- Clear message (what went wrong)
- Action button (retry/go back)

**Example:**
```tsx
<View style={styles.errorContainer}>
  <Ionicons name="alert-circle" size={48} color={colors.error} />
  <Text style={textStyles.h4}>Failed to load lists</Text>
  <Text style={textStyles.body}>
    Please check your connection and try again
  </Text>
  <Button variant="primary" onPress={retry}>Retry</Button>
</View>
```

### 8.2 Empty States

**Visual Pattern:**
- Friendly icon (neutral color)
- Encouraging message
- CTA to create first item

**Example (Empty Library):**
```tsx
<View style={styles.emptyContainer}>
  <Ionicons name="bookmarks-outline" size={64} color={colors.neutral[400]} />
  <Text style={textStyles.h3}>No lists yet</Text>
  <Text style={textStyles.body}>
    Start by importing your Google Maps lists
  </Text>
  <Button variant="primary" onPress={navigateToImport}>
    Import Your Maps
  </Button>
</View>
```

### 8.3 Loading States

**Use Skeleton Component:**
- Never use bare ActivityIndicator
- Match skeleton layout to actual content
- Shimmer animation (light → lighter gray)

**Example:**
```tsx
{loading ? (
  <Skeleton variant="card" count={3} />
) : (
  lists.map(list => <ListCard key={list.id} list={list} />)
)}
```

---

## PART 9: DESIGN INSPIRATION SOURCES

### 9.1 Apps to Study

#### Modern Web Apps
- **Stripe Dashboard**: Clean neutrals, excellent typography, clear CTAs
- **Linear**: Keyboard-first, fast interactions, minimal chrome
- **Notion**: Content-focused, clear hierarchy, subtle interactions

#### Mobile Apps
- **SuppCo** (PRIMARY INSPIRATION): Metadata grids, progress circles, category chips
- **Airbnb**: Card layouts, clean filters, trust indicators
- **Apple Maps**: Clean UI, clear actions, minimal distractions

### 9.2 What to Avoid

**Anti-Patterns:**
- Crypto aesthetics (purple gradients everywhere, geometric chaos)
- Over-designed components (too many shadows, borders, effects)
- Decorative elements without purpose
- Low-contrast "trendy" designs
- Inconsistent spacing/sizing
- Gratuitous animations

---

## PART 10: IMPLEMENTATION GUIDELINES

### 10.1 When Creating New Components

**Checklist:**
1. ✅ Props interface with TypeScript
2. ✅ Use theme tokens (no hardcoded colors/sizes)
3. ✅ Accessibility props (accessibilityRole, accessibilityLabel)
4. ✅ Responsive sizing (mobile vs tablet)
5. ✅ Loading/error/empty states
6. ✅ Dark mode support (future)
7. ✅ Platform-specific adaptations if needed

**File Naming:**
- **PascalCase** for component files: `ProgressCircle.tsx`
- **kebab-case** for utility files: `haptics.ts`

### 10.2 When Designing New Screens

**Process:**
1. Reference this design doc
2. Identify similar existing screens
3. Reuse components wherever possible
4. Follow layout patterns (SafeAreaView + ScrollView + paddingBottom)
5. Add to testing checklist before merge

### 10.3 Code Review Standards

**Design Compliance Checklist:**
- [ ] Uses theme tokens (no magic numbers)
- [ ] WCAG AA contrast ratios met
- [ ] 44px minimum touch targets
- [ ] Bottom navigation visible (tab screens)
- [ ] Loading states use Skeleton (not ActivityIndicator)
- [ ] Error states include retry action
- [ ] Empty states include CTA
- [ ] Animations use `useNativeDriver: true`

### 10.4 Common Implementation Mistakes

#### Layout Issues
```tsx
// ❌ WRONG - Covers bottom navigation
<SafeAreaView edges={['top']}>
  <View style={{ flex: 1 }}>
    <ScrollView style={{ flex: 1 }}>
      {content}
    </ScrollView>
  </View>
</SafeAreaView>

// ✅ CORRECT - Respects bottom navigation
<SafeAreaView edges={['top']}>
  <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
    {content}
  </ScrollView>
</SafeAreaView>
```

#### Color Usage
```tsx
// ❌ WRONG - Hardcoded colors
<Text style={{ color: '#6B7280' }}>Caption</Text>

// ✅ CORRECT - Theme tokens
<Text style={{ color: colors.text.secondary }}>Caption</Text>
```

#### Touch Targets
```tsx
// ❌ WRONG - Too small
<Pressable style={{ width: 32, height: 32 }}>
  <Icon name="close" size={16} />
</Pressable>

// ✅ CORRECT - Minimum 44px
<Pressable style={{ width: 44, height: 44, justifyContent: 'center', alignItems: 'center' }}>
  <Icon name="close" size={16} />
</Pressable>
```

---

## SUCCESS CRITERIA

### Design Quality
- ✅ WCAG AA contrast all text (4.5:1 min)
- ✅ 44x44px touch targets minimum
- ✅ 4px/8px grid spacing consistency
- ✅ NO decorative gradients (only functional: categories, premium)
- ✅ 60fps animations

### Usability
- ✅ Clear hierarchy every screen
- ✅ Predictable buttons/links
- ✅ Keyboard navigation (web)
- ✅ Clear feedback all actions
- ✅ Screen reader accessible

### Cross-Platform
- ✅ Native feel (iOS/Android)
- ✅ Perfect web (desktop + mobile)
- ✅ Responsive 320px - 1920px
- ✅ Consistent experience all platforms

### Maintainability
- ✅ All components use theme tokens
- ✅ Clear prop interfaces
- ✅ Reusable patterns
- ✅ Easy to onboard new developers

---

## APPENDIX: QUICK REFERENCE

### Color Quick Reference
```typescript
// Text
colors.text.primary    // #111827 - Body text, headings
colors.text.secondary  // #4B5563 - Supporting text
colors.text.tertiary   // #6B7280 - Captions, metadata

// UI
colors.accent[500]     // #6366F1 - Primary actions
colors.success         // #10B981 - Positive actions
colors.error           // #EF4444 - Errors/destructive
colors.neutral[200]    // #E5E7EB - Borders
```

### Spacing Quick Reference
```typescript
spacing[2]  // 8px  - Icon gaps
spacing[4]  // 16px - Card padding
spacing[6]  // 24px - Screen padding
spacing[8]  // 32px - Section gaps
```

### Typography Quick Reference
```typescript
textStyles.h1         // 39px, bold
textStyles.h3         // 25px, semibold
textStyles.body       // 16px, regular
textStyles.caption    // 12px, regular
```

---

**Document Version:** 1.0
**Last Updated:** December 11, 2025
**Next Review:** January 11, 2026

This document is the authoritative guide for all Trustmaps design decisions. When in doubt, reference this document. When this document doesn't cover a scenario, update it to include the new pattern.

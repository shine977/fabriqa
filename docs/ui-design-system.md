# Fabriqa UI Design System

## 1. Design Principles & Overview

Fabriqa adopts a modern, tech-forward design style following these core principles:

- **User-Centered Design**: Always prioritizing user needs and intuitive interfaces
- **Consistency**: Maintaining consistent visual language and interaction patterns 
- **Responsiveness**: Seamlessly adapting to different device sizes
- **Refined Details**: Attention to micro-interactions and visual effects
- **Accessibility**: Ensuring interfaces are usable for all types of users

## 2. Technology Stack

- **React**: Core UI library
- **Tailwind CSS**: Utility-first CSS framework
- **Chakra UI**: Component library providing accessible, composable UI elements
- **React Router**: Routing solution
- **React Icons**: Icon library (primarily using Feather icons via Fi* imports)

## 3. Theme System

### 3.1 Basic Architecture

Fabriqa implements a class-based dark mode strategy (`class` strategy), offering three theme options:
- Light theme
- Dark theme
- System theme - automatically follows system preferences

Themes are implemented using CSS variables. All colors are defined in HSL format for easy adjustment of lightness and saturation.

### 3.2 Light Mode Color System

```css
:root {
  /* Background & Foreground */
  --background: 210 40% 98%;       /* Light blue-gray background #f8fafc */
  --foreground: 222 47% 11%;       /* Deep blue-gray text #1e293b */

  /* Card */
  --card: 0 0% 100%;               /* Pure white card background #ffffff */
  --card-foreground: 222 47% 11%;  /* Deep blue-gray card text #1e293b */

  /* Popover */
  --popover: 0 0% 100%;            /* Pure white popover background #ffffff */
  --popover-foreground: 222 47% 11%; /* Deep blue-gray popover text #1e293b */

  /* Primary */
  --primary: 210 100% 50%;         /* Vibrant blue primary #0080ff */
  --primary-foreground: 210 40% 98%; /* Near-white blue-gray text #f8fafc */

  /* Secondary */
  --secondary: 210 40% 96%;        /* Light blue-gray secondary #f1f5f9 */
  --secondary-foreground: 222 47% 11%; /* Deep blue-gray secondary text #1e293b */

  /* Muted */
  --muted: 210 40% 96%;            /* Light blue-gray muted bg #f1f5f9 */
  --muted-foreground: 215 16% 47%; /* Medium blue-gray muted text #64748b */

  /* Accent */
  --accent: 210 40% 96%;           /* Light blue-gray accent bg #f1f5f9 */
  --accent-foreground: 222 47% 11%; /* Deep blue-gray accent text #1e293b */

  /* Destructive */
  --destructive: 0 84% 60%;        /* Vibrant red destructive #f43f5e */
  --destructive-foreground: 210 40% 98%; /* Near-white destructive text #f8fafc */

  /* Border & Input */
  --border: 214 32% 91%;           /* Light gray border #e2e8f0 */
  --input: 214 32% 91%;            /* Light gray input #e2e8f0 */
  --ring: 222 47% 11%;             /* Deep blue-gray focus ring #1e293b */

  /* Radius */
  --radius: 0.5rem;                /* 8px radius */

  /* Sidebar Specific Colors */
  --sidebar-background: 0 0% 100%;   /* Pure white sidebar bg #ffffff */
  --sidebar-foreground: 222 47% 11%; /* Deep blue-gray sidebar text #1e293b */
  --sidebar-primary: 210 100% 50%;   /* Vibrant blue sidebar primary #0080ff */
  --sidebar-primary-foreground: 0 0% 100%; /* Pure white sidebar primary text #ffffff */
  --sidebar-accent: 210 40% 96%;     /* Light blue-gray sidebar accent #f1f5f9 */
  --sidebar-accent-foreground: 222 47% 11%; /* Deep blue-gray sidebar accent text #1e293b */
  --sidebar-border: 214 32% 91%;     /* Light gray sidebar border #e2e8f0 */
  --sidebar-ring: 210 100% 50%;      /* Vibrant blue sidebar focus ring #0080ff */
}
```

### 3.3 Dark Mode Color System

Implemented using Tailwind's `dark:` prefix, key colors include:

- **Background**: `dark:bg-neutral-900` (#171717)
- **Foreground/Text**: `dark:text-white` (#ffffff)
- **Card Background**: `dark:bg-neutral-800` (#262626)
- **Card Border**: `dark:border-neutral-700` (#404040)
- **Primary**: `dark:bg-primary-500` (#3b82f6)
- **Primary Text**: `dark:text-white` (#ffffff)
- **Secondary Background**: `dark:bg-neutral-700` (#404040)
- **Muted Text**: `dark:text-gray-400` (#9ca3af)
- **Accent Background**: `dark:bg-primary-500/40` (semi-transparent blue)
- **Hover State**: `dark:hover:bg-neutral-700` (#404040)
- **Form Controls**: `dark:bg-neutral-800` (#262626)

Theme color variables are toggled via themePlugin, which adds the `dark` class to the root element in dark mode.

### 3.4 Theme Switching Implementation

Themes are managed by the ThemeManager class, supporting:

```typescript
// Set theme
setTheme(mode: 'light' | 'dark' | 'system')

// Toggle between light and dark
toggleTheme()

// Get current theme mode
getCurrentTheme() // returns 'light'|'dark'|'system'

// Get effective theme (considering system settings)
getEffectiveTheme() // returns 'light'|'dark'
```

Theme settings are persisted in localStorage and automatically respond to system theme changes.

## 4. Layout System

### 4.1 Main Layout Structure (MainLayout)

The layout consists of three main areas:

1. **Top Navigation Bar** - Fixed position, containing:
   - App Logo (left)
   - Menu collapse button (mobile only)
   - Utility section (right) with:
     - Search button
     - Theme toggle
     - Language selector
     - Notifications menu (with unread badge)
     - User menu

2. **Sidebar Navigation** - Responsive implementation:
   - Desktop: Persistent sidebar, collapsible (expanded 240px/collapsed 60px)
   - Mobile: Drawer sidebar
   - Collapsible menu groups and multi-level menus

3. **Main Content Area**:
   - Breadcrumb navigation
   - Content container (scrollable)

### 4.2 Common Layout Classes & Containers

```css
/* Page container */
.page-container {
  @apply w-full h-screen overflow-hidden;
}

/* Content area */
.page-content {
  @apply h-full overflow-y-auto;
}

/* Content area padding */
.section-padding {
  @apply px-6 py-6 md:px-8 lg:px-10;
}
```

## 5. Component System

### 5.1 Cards & Containers

Three glass morphism style variants:

```css
/* Standard glass effect */
.glass {
  @apply bg-white/80 backdrop-blur-md border border-white/20 shadow-sm;
}

/* Darker glass effect */
.glass-darker {
  @apply bg-white/90 backdrop-blur-md border border-border shadow-sm;
}

/* Dark glass effect */
.glass-dark {
  @apply bg-foreground/5 backdrop-blur-md border border-foreground/10 shadow-sm;
}

/* Data card */
.data-card {
  @apply glass rounded-lg p-4 transition-all duration-300 hover:shadow-md;
}

/* Chart container */
.chart-container {
  @apply bg-white rounded-lg p-4 shadow-sm transition-all duration-300 hover:shadow-md;
}
```

### 5.2 Status Indicators

Four status types:

```css
/* Base status indicator */
.status-indicator {
  @apply inline-block w-2.5 h-2.5 rounded-full mr-2;
}

/* Active status - green */
.status-active {
  @apply bg-green-500;
}

/* Warning status - amber */
.status-warning {
  @apply bg-amber-500;
}

/* Error status - red */
.status-error {
  @apply bg-red-500;
}

/* Idle status - gray */
.status-idle {
  @apply bg-gray-400;
}
```

### 5.3 Animations & Transitions

Series of predefined animation classes:

```css
/* Transitions */
.transition-all-200 { @apply transition-all duration-200; }
.transition-all-300 { @apply transition-all duration-300; }
.transition-transform-200 { @apply transition-transform duration-200; }
.transition-opacity-200 { @apply transition-opacity duration-200; }

/* Fade animations */
@keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
@keyframes fade-out { from { opacity: 1; } to { opacity: 0; } }

/* Slide animations */
@keyframes slide-in-right { from { transform: translateX(100%); } to { transform: translateX(0); } }
@keyframes slide-out-right { from { transform: translateX(0); } to { transform: translateX(100%); } }
@keyframes slide-in-left { from { transform: translateX(-100%); } to { transform: translateX(0); } }
@keyframes slide-out-left { from { transform: translateX(0); } to { transform: translateX(-100%); } }
@keyframes slide-in-top { from { transform: translateY(-100%); } to { transform: translateY(0); } }
@keyframes slide-out-top { from { transform: translateY(0); } to { transform: translateY(-100%); } }
@keyframes slide-in-bottom { from { transform: translateY(100%); } to { transform: translateY(0); } }
@keyframes slide-out-bottom { from { transform: translateY(0); } to { transform: translateY(100%); } }

/* Scale animations */
@keyframes scale-in { 
  from { transform: scale(0.95); opacity: 0; } 
  to { transform: scale(1); opacity: 1; } 
}

/* Pulse animations */
@keyframes pulse-slow { 
  0%, 100% { opacity: 1; } 
  50% { opacity: 0.8; } 
}
```

Each animation has a corresponding class, such as `animate-fade-in`, `animate-slide-in-right`, etc.

### 5.4 Special Effects

Gradient mesh background:

```css
.gradient-mesh {
  background-color: #0f2027;
  background-image: linear-gradient(to right, rgba(32, 67, 96, 0.8), rgba(0, 42, 83, 0.8)),
    radial-gradient(at 0% 0%, rgba(12, 180, 206, 0.3) 0%, rgba(0, 0, 0, 0) 50%),
    radial-gradient(at 100% 100%, rgba(247, 120, 107, 0.4) 0%, rgba(0, 0, 0, 0) 50%);
  background-size: 100% 100%, 50% 50%, 50% 50%;
  background-position: 0% 0%, 0% 0%, 100% 100%;
}
```

## 6. Responsive Design

### 6.1 Breakpoint System

Using Tailwind default breakpoints:
- `sm`: 640px
- `md`: 768px
- `lg`: 1024px
- `xl`: 1280px
- `2xl`: 1536px

Container configuration:
```javascript
container: {
  center: true,
  padding: '2rem',
  screens: {
    '2xl': '1400px',
  },
}
```

### 6.2 Responsive Strategy

- **Mobile-first design**: Base styles target mobile devices, expanding to larger screens via media queries
- **Sidebar**: Drawer design on mobile, persistent sidebar on desktop
- **Navigation**: Appropriately hide elements on small screens, preserving core functionality
- **Spacing & Typography**: Increase padding and font sizes with larger screen sizes

## 7. Implementation Examples

### 7.1 Sidebar Implementation

```tsx
// Style class definitions
const styles = {
  sidebarContainer: "flex flex-col h-[calc(100vh-4rem)] overflow-y-auto bg-white dark:bg-neutral-800",
  scrollbar: "scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent",
  navHeader: "text-xs font-medium uppercase text-gray-500 dark:text-gray-400 mb-4 ml-2",
  menuItem: "flex items-center py-2 px-3 mb-1 rounded-md transition-all-200",
  menuItemActive: "bg-primary-100 dark:bg-primary-500/40 text-primary-700 dark:text-white font-medium",
  menuItemInactive: "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-neutral-700/50",
}
```

### 7.2 Main Layout Key Classes

```tsx
// Main container
<Box minH="100vh" className="dark:bg-neutral-900 bg-white">

// Top navigation bar
<Flex
  as="header"
  position="fixed"
  w="full"
  className="dark:bg-neutral-800 dark:border-neutral-700 bg-white border-gray-200 shadow-nav"
>

// Sidebar
<Box
  display={{ base: 'none', md: 'block' }}
  w={collapsed ? "60px" : "240px"}
  className="dark:bg-neutral-800 bg-white border-r dark:border-neutral-700 transition-width duration-300"
>

// Main content area
<Box
  flex="1"
  pt="16"
  className="dark:bg-neutral-900 bg-gray-50"
>
```

## 8. Best Practices

### 8.1 New Component Development

1. Prioritize Tailwind utility classes
2. Follow color system variables
3. Ensure components support both light and dark themes
4. Use encapsulated animation and transition classes

### 8.2 Responsive Development

1. Always design from mobile view first
2. Use Flexbox and Grid for layouts
3. Leverage Tailwind responsive prefixes (`sm:`, `md:`, `lg:`)
4. Test behavior at various breakpoints

### 8.3 Dark Mode Support

1. Add corresponding `dark:` prefix classes for each component
2. Ensure sufficient contrast
3. Avoid fixed color values, prioritize theme variables

## 9. Utility Functions & Plugin Integration

### 9.1 Theme Management

```typescript
// Get current theme
const themeMode = appPlugin.applyHooks('theme:getCurrentTheme', 'system')

// Set theme
appPlugin.applyHooks('theme:set', 'dark')

// Listen for theme changes
appPlugin.applyHooks('theme:changed', (mode) => {
  console.log(`Theme changed to ${mode}`);
})
```

### 9.2 Internationalization

```typescript
// Use translation function
const { t } = useTranslation();
t('navigation.dashboard') // Returns translated text

// Switch language
const { language, setLanguage } = useLanguage();
setLanguage('zh-CN')
```

## 10. Complete Component Examples

### 10.1 MainLayout Component

The MainLayout component serves as the primary layout structure, combining:
- Top navigation with branding and user controls
- Responsive sidebar navigation
- Main content area with breadcrumbs

Key features include:
- Theme switching between light/dark/system modes
- Language selection
- Notification system with badge indicators
- User profile menu with quick actions
- Responsive design for all screen sizes

### 10.2 Sidebar Implementation

The sidebar includes:
- Collapsible navigation with toggle controls
- Multi-level menu support
- Visual indicators for active routes
- Smooth transition animations
- Complete dark mode support

## 11. Shadow System

Custom shadow variants:

```javascript
boxShadow: {
  soft: '0 2px 15px 0 rgba(0, 0, 0, 0.05)',
  card: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  nav: '0 0 15px 0 rgba(0, 0, 0, 0.05)',
  popup: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
}
```

## 12. Typography System

- **Font Family**: Inter as primary font with system fallbacks
- **Font Features**: OpenType features for enhanced readability
- **Text Truncation**: Utilities for handling text overflow

## 13. Extended Spacing System

Additional spacing values beyond Tailwind defaults:
```javascript
spacing: {
  18: '4.5rem',  // 72px
  72: '18rem',   // 288px
  84: '21rem',   // 336px
  96: '24rem',   // 384px
  128: '32rem',  // 512px
}
```

This comprehensive design system documentation provides all necessary details for consistent UI development across the Fabriqa application.
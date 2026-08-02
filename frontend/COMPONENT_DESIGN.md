# Component Design Document: Community Exchange Network (CEN) Frontend

---

## 1. Executive Overview

The **Community Exchange Network (CEN)** frontend is a modern, high-performance web application designed for housing society management, resource sharing, skill exchange, and resident governance. Built using **React 19**, **TanStack Start**, **TanStack Router**, and **Tailwind CSS v4**, the frontend follows a modular, atomic component hierarchy that prioritizes type safety, role-based accessibility, visual elegance, and seamless user interaction.

This document presents the full **Component Design Specification** of the CEN frontend, detailing the component architecture, visual design system, generic UI primitives, domain-specific layout components, route page views, role-based state management, and data flow patterns suitable for inclusion in technical project reports and software documentation.

---

## 2. Component Architectural Overview

The frontend architecture follows a modified **Atomic Design Pattern** integrated with **TanStack File-Based Routing**. Components are organized into clear abstraction layers:

```
src/
├── components/
│   ├── ui/                   # Layer 1: Primitive UI Components (Atoms)
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── badge.tsx
│   │   ├── dialog.tsx
│   │   ├── table.tsx
│   │   ├── select.tsx
│   │   └── ... (47 Radix-backed primitives)
│   └── layout/               # Layer 2: Domain Layout & Composite Components (Molecules/Organisms)
│       ├── AppShell.tsx       # Main layout wrapper with role-based navigation sidebar & header
│       └── ExchangeItemCard.tsx # Reusable card component for skills and resource listings
├── routes/                   # Layer 3: Page & View Components (Templates/Pages)
│   ├── __root.tsx            # Global provider wrapper & root layout
│   ├── index.tsx             # Landing / Hero page
│   ├── login.tsx & signup.tsx # Authentication views
│   ├── app.tsx               # App shell route guard
│   ├── app.dashboard.tsx     # Role-customized dashboard overview
│   ├── app.skills.tsx        # Skill Exchange Marketplace
│   ├── app.resources.tsx     # Shared Physical Resource Directory
│   ├── app.wallet.tsx        # Credit Balance & Transaction History
│   ├── app.events.tsx        # Society Events & RSVP System
│   ├── app.complaints.tsx    # Resident Issue Escalation & Tracking
│   ├── app.notices.tsx       # Society Broadcast & Announcements
│   ├── app.chat.tsx          # Direct Messaging Interface
│   ├── app.coord.*.tsx       # Coordinator Moderation & Approval Views
│   ├── app.admin.*.tsx       # Admin Resident & Onboarding Management
│   └── app.owner.*.tsx       # Platform Owner Multi-Society Management
├── lib/                      # Cross-cutting Utilities & Contexts
│   ├── auth.tsx              # Authentication & Role State Context
│   └── utils.ts              # Class name merging & utility helpers
└── services/                 # API & Data Abstraction Layer
    ├── index.ts              # Service handlers & query hooks
    └── ai.ts                 # Smart assistant & automated summary service
```

---

## 3. Design System & Styling Architecture

### 3.1 Design Tokens & Palette
The interface uses a curated, accessible color system built with CSS variable tokens and Tailwind CSS v4, supporting both light and dark theme contrast rules:

- **Primary Brand Colors**: Deep Slate / Indigo (`#1e293b` / `#4f46e5`) representing trust, security, and community governance.
- **Accent / Token Colors**: Vibrant Emerald (`#059669`) for positive credit balance and available listings, Warm Amber (`#d97706`) for pending approvals, and Crimson (`#dc2626`) for high-priority complaints.
- **Surface & Backgrounds**: Clean slate backgrounds (`#f8fafc`) with semi-transparent frosted glass elements (`backdrop-blur-md`).
- **Typography**: Clean sans-serif font stack (Inter / System UI) with standardized weight hierarchies (Font Regular, Medium, Semibold, Bold).

### 3.2 Component Styling Paradigm
All UI components leverage **Class Variance Authority (`cva`)** combined with `clsx` and `tailwind-merge` (`cn` utility) for dynamic variant assignment without style pollution.

```tsx
// Pattern: Variant-Based Styling with CVA
const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-lg text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm",
        destructive: "bg-red-600 text-white hover:bg-red-700 shadow-sm",
        outline: "border border-slate-200 bg-white hover:bg-slate-100 text-slate-900",
        secondary: "bg-slate-100 text-slate-900 hover:bg-slate-200",
        ghost: "hover:bg-slate-100 text-slate-700",
        link: "text-indigo-600 underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-8 px-3 text-xs",
        lg: "h-12 px-8 text-base",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);
```

---

## 4. Primary Layout Components

### 4.1 `AppShell` (Root Structural Framework)
The `AppShell` component is the main layout frame wrapping all authenticated routes. It dynamically reconfigures navigation sidebar items, quick stats header, user profile dropdowns, and role simulation switchers based on the active user role (`resident`, `coordinator`, `admin`, `owner`).

#### Key Features & Props Interface
- **Role-Driven Navigation**: Renders unique sidebar links per role.
- **Role Mode Switcher**: Allows multi-role users (e.g., a Resident who is also a Coordinator) to toggle view modes seamlessly.
- **Notification Drawer**: Displays unread alerts, complaint updates, and credit transfers.
- **Mobile Responsive Drawer**: Collapsible sheet navigation for mobile screens.

```tsx
interface AppShellProps {
  children?: ReactNode;
}

// Navigation Schema by Role
const NAV: Record<Role, NavItem[]> = {
  resident: [
    { to: "/app/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { to: "/app/skills", label: "Skill Exchange", icon: Sparkles },
    { to: "/app/resources", label: "Shared Resources", icon: Package },
    { to: "/app/wallet", label: "My Wallet", icon: Wallet },
    { to: "/app/events", label: "Events Directory", icon: Calendar },
    { to: "/app/complaints", label: "My Complaints", icon: AlertCircle },
    { to: "/app/notices", label: "Broadcast Notices", icon: Megaphone },
    { to: "/app/chat", label: "Direct Messages", icon: MessageSquare },
  ],
  coordinator: [ /* Coordinator Moderation Views */ ],
  admin: [ /* Admin Resident Onboarding & Governance */ ],
  owner: [ /* Platform Multi-Society Owner Controls */ ]
};
```

### 4.2 `ExchangeItemCard` (Marketplace Item Component)
`ExchangeItemCard` is a composite component designed for listing and interacting with community skills and physical resources. It handles booking validation, insufficient balance guards, ownership badges, and confirmation dialogs.

#### Detailed Component Specification
- **Prop Contract**:
  | Prop Name | Type | Description |
  | :--- | :--- | :--- |
  | `id` | `string` | Unique resource or skill identifier |
  | `title` | `string` | Title of the offering |
  | `description` | `string` | Detailed description text |
  | `category` | `string` | Categorization tag (e.g., Repair, Tutoring, Tools) |
  | `credits` | `number` | Required community exchange credits |
  | `providerName`| `string` | Display name of offering resident |
  | `providerId`  | `string` | User ID of the provider |
  | `type`        | `"skill" \| "resource"` | Type discriminator |
  | `available`   | `boolean` | Resource availability flag |
  | `onAction`    | `Function` | Async handler triggered on booking/borrowing |

- **State Management & UI Guards**:
  - Automatically disables action buttons if the resident is the item owner (`"My Item"` / `"My Offered Skill"`).
  - Validates resident credit balance against required credits, rendering a warning state (`"Insufficient Credits"`).
  - Triggers a Radix `AlertDialog` modal before executing irreversible credit deduction transactions.

---

## 5. UI Primitive Components Catalog (`src/components/ui`)

The UI layer comprises 47 accessible, modular components built on top of Radix UI primitives. Below is a structured summary of core primitives used across the project:

| Category | Component Name | Base Primitive | Description & Key Use Cases |
| :--- | :--- | :--- | :--- |
| **Data Display** | `Card` | Custom HTML5 | Content container with structured Header, Content, and Footer sub-components. |
| | `Badge` | Custom HTML5 | Status indicator pill with color variants (default, secondary, outline, destructive). |
| | `Avatar` | `@radix-ui/react-avatar` | User profile avatar with automatic image fallback to user initials. |
| | `Table` | Custom HTML5 | Data table with responsive overflow, selectable rows, and styled headers. |
| | `Accordion` | `@radix-ui/react-accordion` | Collapsible content sections used in FAQs, complaints history, and guidelines. |
| **Inputs & Forms** | `Button` | Slot (`@radix-ui/react-slot`) | Interactive button supporting sizes, variants, loading states, and icon prefixes. |
| | `Input` | HTML `<input>` | Styled text input with clear focus ring and validation state borders. |
| | `Select` | `@radix-ui/react-select` | Accessible dropdown pickers for categories, filters, and society selection. |
| | `Switch` | `@radix-ui/react-switch` | Toggle switch for boolean settings and notification preferences. |
| | `Form` | `react-hook-form` | Context-aware form wrapper providing automated validation message rendering. |
| **Feedback & Dialogs**| `Dialog` / `Sheet` | `@radix-ui/react-dialog` | Modal dialogs and sliding slide-over sidebars for complex creation forms. |
| | `AlertDialog` | `@radix-ui/react-alert-dialog` | High-priority confirmation popups for credit spending, deletions, and approvals. |
| | `Sonner` | `sonner` | Toast alert system providing non-blocking operation feedback (success, error). |
| | `Progress` | `@radix-ui/react-progress` | Animated bar indicator for onboarding progress and goal metrics. |
| **Navigation & Layout**| `Tabs` | `@radix-ui/react-tabs` | Tabbed container for switching views within pages (e.g., Skills offered vs requested). |
| | `Breadcrumb` | Custom HTML5 | Hierarchical path navigation for deep admin and coordinator sub-pages. |
| | `DropdownMenu` | `@radix-ui/react-dropdown-menu` | Action menus for table rows, profile settings, and item moderation options. |

---

## 6. Page & Feature Route Component Specifications

### 6.1 Resident Dashboard (`app.dashboard.tsx`)
- **Purpose**: Serves as the central command center for residents.
- **Key Modules**:
  - **Metrics Overview Bar**: Displays credit balance, active skill requests, borrowed items, and upcoming events.
  - **Quick Action Grid**: One-tap navigation to offer skills, list resources, or report issues.
  - **Activity Feed Component**: Real-time list of recent community interactions and announcements.
  - **Recharts Credit Analytics**: Visual bar/line chart displaying monthly credit earnings and expenditure.

### 6.2 Skill Exchange Directory (`app.skills.tsx`)
- **Purpose**: Facilitates peer-to-peer skill sharing within the housing society.
- **Key Modules**:
  - **Search & Filter Bar**: Real-time filtering by category, search text, and credit cost.
  - **Grid View Component**: Rendered using `ExchangeItemCard` components.
  - **Offer Skill Dialog**: Form modal built with `zod` schema validation for listing new skills.

### 6.3 Shared Physical Resources (`app.resources.tsx`)
- **Purpose**: Enables residents to lend and borrow tools, equipment, and appliances.
- **Key Modules**:
  - **Availability Filter**: Toggles between available items and currently borrowed items.
  - **Borrowing Flow Component**: Handles deposit calculations, duration selection, and request submission.

### 6.4 Society Wallet & Credits (`app.wallet.tsx`)
- **Purpose**: Manages the community currency (CEN Credits) ledger.
- **Key Modules**:
  - **Balance Card**: Highlighted container showing total balance and pending transfers.
  - **Direct Transfer Component**: Form component to send credits to another resident.
  - **Transaction History Table**: Paginated log of all credit entries and expenditures with status badges.

### 6.5 Coordinator Moderation Modules (`app.coord.*.tsx`)
- **Purpose**: Gives society coordinators tools to approve listings, resolve disputes, and moderate events.
- **Key Modules**:
  - `app.coord.approvals.tsx`: Verification queue for new resident skill listings and resource submissions.
  - `app.coord.disputes.tsx`: Case management UI for mediation between residents with status step indicators.

### 6.6 Admin Governance Modules (`app.admin.*.tsx`)
- **Purpose**: Allows society administrators to manage onboarding, member directories, and society performance.
- **Key Modules**:
  - `app.admin.onboarding.tsx`: Verification workflow for new resident verification requests with document preview.
  - `app.admin.performance.tsx`: High-level analytics dashboard utilizing `Recharts` for society activity metrics.

---

## 7. State Management & Data Flow Architecture

The frontend state design strictly separates **Client UI State**, **Global Auth/Session State**, and **Server/Async State**:

```
+-------------------------------------------------------------------+
|                        Component Tree                             |
+-------------------------------------------------------------------+
       |                                      |
       v                                      v
+-----------------------+          +--------------------------------+
| Auth Context Provider |          |     TanStack React Query       |
| (Session, Active Role,|          |  (Server State, API Data,      |
|  User Profile State)  |          |   Caching & Invalidation)      |
+-----------------------+          +--------------------------------+
       |                                      |
       +-------------------+------------------+
                           |
                           v
              +--------------------------+
              | API / Service Layer      |
              | (services/index.ts)      |
              +--------------------------+
```

1. **Authentication State (`useAuth`)**: Maintained via React Context (`src/lib/auth.tsx`). Manages user credentials, permissions, society membership, and role switching.
2. **Server State & Caching (`TanStack Query`)**: All API calls use query hooks with declarative key invalidation (`queryClient.invalidateQueries(...)`), ensuring instant UI updates upon credit transfer or item booking.
3. **Form & Validation State (`react-hook-form` + `Zod`)**: Forms validate inputs client-side prior to server submission, rendering localized error messages under form fields.

---

## 8. Summary of Component Design Highlights for Project Documentation

When including this component design in the project PDF, highlight the following key technical achievements:

- **Type-Safe Component Hierarchy**: Built completely in TypeScript with zero un-typed props or implicit `any` types.
- **Role-Adaptive User Interface**: Seamlessly transforms layout and feature accessibility across four user roles (`Resident`, `Coordinator`, `Admin`, `Platform Owner`).
- **Atomic & Modular Primitives**: 47 Radix-backed UI primitives ensuring full keyboard accessibility (WAI-ARIA compliant) and consistent aesthetic styling.
- **Optimistic & Reactive UX**: Dynamic visual feedback utilizing Sonner toast notifications, confirmation dialogs, and automated React Query re-fetching.

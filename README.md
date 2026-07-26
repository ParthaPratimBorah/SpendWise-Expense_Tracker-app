# SpendWise - Expense Tracker App

An ultra-secure, hyper-responsive, and visually distinctive neo-brutalist expense tracker and budget planner. **SpendWise** merges premium high-contrast visual design with robust multi-channel Firebase authentication, dual-persistence fallback storage, and real-time AI-powered financial advisory.

---

## 🎨 Design Philosophy & Visual Concept

Expense Vault breaks free from generic corporate dashboards by adopting a **Neo-Brutalist design language**:
*   **Heavy Inks & Sharp Borders**: Thick solid black borders (`border-4 border-black`), sharp corners, and deep box shadows (`shadow-brutal-sm` / `shadow-brutal-lg`).
*   **Aesthetic Typography Pairing**: Elegant, high-readability Display titles paired with clean code monospaces for telemetry, rates, and timestamps.
*   **Polished Asymmetry**: Micro-animations, interactive hovering scales, retro ribbons, and skewed elements (like the **AI ASSIST** sticker badge) that catch the eye and elevate the user experience.

---

## 🚀 Key Features

### 1. Multi-Channel Secure Authentication
*   **Google Auth**: One-click OAuth login, fortified with domain-mismatch protections and custom iframe-escape guides.
*   **Phone OTP Authentication**: Complete SMS-OTP login utilizing E.164 format filtering (+country code) and real-time numeric constraint checking.
*   **Email & Password**: Standard credential authentication with custom error handling to replace cryptic Firebase system messages with actionable guidelines.

### 2. Dual-Persistence & Real-Time Syncing
*   **Real-time Firestore Sync**: Instant snapshot syncing for Expenses and Budgets, keeping lists updated immediately across multiple devices.
*   **Strict Security & Format Controls**: Validated at the database level using granular Security Rules (`firestore.rules`) which verify user matching, entity sizes, and numeric boundaries.
*   **Robust Local Storage Fallback**: Gracefully degrades to a client-side database if offline or when Firebase configuration is not present, allowing 100% offline-ready operations.
*   **Long-Polling Core**: Built-in long-polling mode to safely circumvent cross-origin sandbox limitations inside containerized preview frames.

### 3. Dynamic Visual Analytics
*   **Neo-Brutal Bento Grid**: Dashboard modules showing month-to-date spending, top categories, and dynamic over-budget warn cards.
*   **Interactive Visualizations**: Clean category-wise cost breakdowns, active progress bars, and custom color-coded status badges for instant readability.

### 4. Smart AI Budget Analysis
*   **On-Demand Financial Coach**: Analyzes active expense records and monthly budgets using Google Gemini models.
*   **Contextual Advice**: Instantly generates recommendations on savings targets, category allocations, overspending hazards, and financial optimizations.

---

## 🏗️ Technical Architecture

```
                                  ┌───────────────────────────┐
                                  │      React SPA Client     │
                                  │    (TypeScript, Tailwind) │
                                  └──────────────┬────────────┘
                                                 │
                        ┌────────────────────────┼────────────────────────┐
                        │ (Auth / Write Requests)│                        │ (AI Prompt Sync)
                        ▼                        ▼                        ▼
           ┌────────────────────────┐  ┌────────────────────┐  ┌────────────────────┐
           │ Firebase Auth Server   │  │ Firestore Database │  │ Server-Side Proxy  │
           │ (Email, Phone, Google) │  │  (Real-time Sync)  │  │   (Gemini API)     │
           └────────────────────────┘  └────────────────────┘  └────────────────────┘
```

### Frontend Stack
*   **React & TypeScript**: Strong typing throughout the lifecycle of payloads, state actions, and custom authentication contexts.
*   **Styling**: Modern utility-first CSS via Tailwind.
*   **State Management**: Real-time listeners coupled with React context patterns (`AuthProvider` and `useRealtime` hook listeners).
*   **Vector Library**: Clear icon telemetry from Lucide React.

### Backend & Core Persistence
*   **Cloud Firestore**: Highly structured collections (`expenses/{expenseId}` and `budgets/{budgetId}`) controlled by strict type schemas in `firebase-blueprint.json`.
*   **Firestore Rules Engine**: Robust safety gates for operations (`isSignedIn`, `isValidId`, `isValidExpense`, `isValidBudget`).
*   **Server-Side Proxy**: Standard Node/Express environment (`server.ts`) hosting secure API proxy routes to request Gemini recommendations without exposing secret tokens to client browsers.

---

## 📁 Directory Structure

```text
├── src/
│   ├── components/            # Reusable UI Widgets & Features
│   │   ├── features/          # Feature-level UI groups (expenses, budgets, AI analysis)
│   │   ├── layout/            # Protected Routes and Navbar shells
│   │   └── ui/                # Base aesthetic components (buttons, badges)
│   ├── contexts/              # Core global UI & Application states
│   ├── hooks/                 # Custom Hooks (useAuth, useRealtime listeners)
│   ├── lib/                   # Module initiators (Firebase core setup, Firestore long-polling)
│   ├── pages/                 # Full Page Layouts (Dashboard, Login, Budgets, Profile)
│   ├── providers/             # React Provider wrapping trees
│   ├── services/              # AI Service wrappers (Gemini integrations)
│   └── types/                 # Shared TypeScript models and interfaces
├── firebase-applet-config.json # Connection tokens for Firebase Products
├── firebase-blueprint.json    # Strict JSON-schema description of database entities
├── firestore.rules            # Security rules ensuring cloud data safety
├── metadata.json              # Application metadata and descriptors
└── package.json               # Package manifests and runner definitions
```

---

## ⚙️ Running & Building

### 1. Developer Setup
Install initial dependencies to prepare the local workspace modules:
```bash
npm install
```

### 2. Development Execution
Launch the local Hot Module Replacement development server:
```bash
npm run dev
```

### 3. Production Build
Compile optimized static files for deployment:
```bash
npm run build
```

### 4. Linter Validation
Check code styling, type safety, and framework conventions:
```bash
npm run lint
```

cd# ♻️ Clean My City — Frontend

**Beautiful, performant, and premium React frontend for the Clean My City civic issue reporting platform.**

[![React](https://img.shields.io/badge/React-19-blue)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-7-purple)](https://vite.dev)
[![Framer Motion](https://img.shields.io/badge/Framer_Motion-12-pink)](https://www.framer.com/motion/)
[![Lucide](https://img.shields.io/badge/Lucide-Latest-orange)](https://lucide.dev/)

---

## 📋 Table of Contents

- [System Overview](#system-overview)
- [Key Features](#key-features)
- [Technology Stack](#technology-stack)
- [Installation](#installation)
- [Configuration](#configuration)
- [Running Locally](#running-locally)
- [Project Structure](#project-structure)
- [Authentication & Security](#authentication--security)
- [Design System](#design-system)
- [API Integration](#api-integration)

---

## 🎯 System Overview

Clean My City (Frontend) is a modern web application designed to bridge the gap between citizens and municipal organizations. It provides a visual interface for reporting public issues, tracking resolution progress in real-time, and managing department-specific queues.

The application follows a role-based architecture, offering tailored experiences for three distinct user types:
- **Citizens**: Report issues, track their history, and stay updated.
- **Authority Users**: Manage department queues, update issue statuses, and handle resolution.
- **Administrators**: System-wide control, organization management, and user oversight.

---

## ✨ Key Features

### 🏢 Page-level Capabilities
| Page | Features |
|------|----------|
| **Landing** | Animated hero with Three.js/Canvas, live impact stats, feature showcase, and role navigation. |
| **Credentials** | Interactive guide for reviewers with one-click copy for seed user accounts. |
| **Login** | Secure entry point with glassmorphic cards and dynamic validation. |
| **Register** | Progressive multi-step registration (Role selection → Personal/Org details). |
| **Citizen Dashboard** | Overview of reported issues, status filtering, and quick-report CTAs. |
| **Issue Reporting** | GPS-pinnable issue forms with category selection and photo support (logic). |
| **Org Dashboard** | Professional queue management system for department officers. |
| **Admin Panel** | Centralized hub for controlling organization accounts and activation status. |

### 🛠 System Features
- **Role-Based Access Control (RBAC)**: Secure route guards and conditional rendering based on user roles.
- **Dynamic Theming**: Support for dark/light modes with smooth transitions.
- **Real-time UI**: Integrated Framer Motion animations for high-quality interactions.
- **Duplicate Detection UI**: (Planned/Logic) Visual indicators if a reported issue matches existing ones.

---

## 🛠 Technology Stack

| Component | Technology |
|-----------|-----------|
| **Framework** | React 19 (Functional Components + Hooks) |
| **Build Tool** | Vite 7 (High-performance HMR) |
| **Routing** | React Router DOM 7 |
| **State Management** | React Context API (Auth & Theme) |
| **Animations** | Framer Motion 12 |
| **HTTP Client** | Axios (with Interceptors) |
| **Icons** | Lucide React |
| **Styling** | Vanilla CSS (CSS Variables + Utility classes) |

---

## 📦 Installation

### Prerequisites
- **Node.js**: 18.0 or higher
- **Backend**: Ensure the [Clean My City Backend](../backend/README.md) is running.

### Steps
1. **Navigate to the frontend directory**
   ```bash
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure Environment**
   ```bash
   cp .env.example .env (if applicable)
   ```

---

## ⚙️ Configuration

The application uses Vite environment variables. Create a `.env` file in the root `frontend/` folder:

```env
# API Base URL
VITE_API_URL=http://localhost:3000/api

# App Settings
VITE_APP_NAME="Clean My City"
```

*Note: In development, `VITE_API_URL` defaults to `http://localhost:3000/api` if not specified.*

---

## 🚀 Running Locally

### Start Development Server
```bash
npm run dev
```
Accessible at: `http://localhost:5173`

### Production Build
```bash
# Build the application
npm run build

# Preview the production build locally
npm run preview
```

---

## 📁 Project Structure

```
frontend/
├── src/
│   ├── main.jsx              # Application entry point
│   ├── App.jsx               # Main router & provider wrapper
│   ├── index.css             # Design system tokens & global styles
│   ├── api/
│   │   └── axiosInstance.js  # Axios configuration + JWT interceptor
│   ├── context/
│   │   ├── AuthContext.jsx   # Authentication & session persistence
│   │   └── ThemeContext.jsx  # Dark/Light mode management
│   ├── components/
│   │   ├── Navbar.jsx        # Responsive navigation with auth states
│   │   ├── IssueCard.jsx     # Animated data card with status logic
│   │   └── StatusBadge.jsx   # Semantic colored badges
│   ├── pages/
│   │   ├── Landing.jsx       # Public-facing animated landing
│   │   ├── Credentials.jsx   # Platform demo guide
│   │   ├── citizen/          # Citizen-specific views
│   │   ├── organization/     # Authority-specific views
│   │   └── admin/            # Administrative views
│   └── assets/               # Static images and branding resources
└── public/                   # Public assets (logo, favicon)
```

---

## 🔐 Authentication & Security

- **Storage**: JWT tokens are securely stored in `localStorage` under `cmc_token`.
- **Interceptors**: Axios interceptors automatically attach the `Authorization` header to every outgoing request.
- **Route Guards**: Protected routes (`ProtectedRoute`) prevent unauthorized access to dashboards.
- **Auto-Logout**: The application automatically clears session data on `401 Unauthorized` responses from the backend.

---

## 🎨 Design System

The application uses a custom-built design system based on **CSS Variables**:
- **Palette**: Vibrant primary colors (`#22d3a0`) paired with deep slate backgrounds.
- **Typography**: `Plus Jakarta Sans` for headers and `Inter` for body text.
- **Glassmorphism**: Extensive use of `backdrop-filter: blur()` and semi-transparent borders.
- **Animations**: Standardized transition durations and spring-based physics for a premium feel.

---

## 🔗 API Integration

All API calls are centralized in the `axiosInstance`.
- **Base URL**: Set via Vite env variables.
- **Error Handling**: Centralized catch-all for network errors and auth failures.
- **Headers**: `Content-Type: application/json` used by default.

---
© 2026 Clean My City. All rights reserved.

# WebOS — Browser Desktop Simulator

A full-stack web app that simulates a desktop OS in the browser.

## Stack
- **Frontend**: React 19, Tailwind CSS v4, Zustand, Vite
- **Backend**: Node.js, Express, MongoDB (Mongoose), JWT, Multer

## Setup

### Prerequisites
- Node.js 18+
- MongoDB running locally (`mongod`) or a MongoDB Atlas URI

### 1. Backend
```bash
cd webos/backend
npm install
# Edit .env if needed (MONGO_URI, JWT_SECRET)
npm run dev
```
Runs on http://localhost:5000

### 2. Frontend
```bash
cd webos/frontend
npm install
npm run dev
```
Runs on http://localhost:3000

## Features
- Sign up / Sign in with JWT auth
- Draggable, resizable, closable windows (macOS-style traffic lights)
- Desktop icons — double-click to open apps
- Right-click context menu
- **File Manager** — upload (drag & drop), rename, delete files
- **Notes** — create, edit, delete notes with color labels
- **Settings** — dark/light theme, wallpaper picker (persisted per user)
- **App Store** — enable/disable apps on your desktop
- **Calculator** — fully functional
- **Clock** — analog + world clocks
- Taskbar with live clock, open windows, user menu
- Toast notification system
- Persistent layout via MongoDB

## Folder Structure
```
webos/
├── backend/
│   ├── src/
│   │   ├── config/db.js
│   │   ├── middleware/auth.js
│   │   ├── models/          # User, Note, File, Desktop
│   │   ├── routes/          # auth, notes, files, desktop, apps
│   │   └── server.js
│   └── .env
└── frontend/
    └── src/
        ├── components/
        │   ├── apps/        # FileManager, Notes, Settings, AppStore, Calculator, Clock
        │   ├── Window.jsx
        │   ├── WindowManager.jsx
        │   ├── Taskbar.jsx
        │   ├── DesktopIcons.jsx
        │   ├── ContextMenu.jsx
        │   └── NotificationStack.jsx
        ├── pages/           # AuthPage, Desktop
        ├── store/           # useAuthStore, useDesktopStore
        └── utils/api.js
```

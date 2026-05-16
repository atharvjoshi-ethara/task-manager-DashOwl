# Atharv.Joshi Task Manager

A modern dark-mode team productivity dashboard for managing projects, tasks, members, notifications, progress tracking, and kanban workflows.

## Features

- Dark developer-tool inspired dashboard UI
- Admin and member authentication
- Project creation and team member management
- Kanban task board with task priorities and status updates
- Task assignment, comments, and activity drawer
- Dashboard analytics and charts
- Team progress tracking
- Notification panel
- Google OAuth support
- Railway-ready full-stack deployment

## Tech Stack

- Frontend: React, Vite, Tailwind CSS, Redux Toolkit, Framer Motion, Recharts
- Backend: Node.js, Express, MongoDB, Mongoose, JWT, Passport Google OAuth
- Deployment: Railway

## Project Structure

```text
TEAM-TASK-MANAGER/
  backend/        Express API, MongoDB models, routes, controllers
  frontend/       React Vite app
  railway.json    Railway deployment config
  package.json    Root scripts for build/start/dev
```

## Local Setup

Install dependencies:

```powershell
npm install
npm install --prefix backend
npm install --prefix frontend
```

Create `backend/.env`:

```env
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secure_jwt_secret
ADMIN_SECRET_KEY=your_admin_secret_key
PORT=5000
NODE_ENV=development
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

Run the app locally:

```powershell
npm run dev
```

Frontend:

```text
http://localhost:5173
```

Backend:

```text
http://localhost:5000
```

## Build

Build the frontend for production:

```powershell
npm run build
```

Start the production server:

```powershell
npm start
```

The backend serves the built frontend from `frontend/dist` in production.

## Railway Deployment

This repo includes `railway.json`, so Railway can build and start the app automatically.

Railway build command:

```powershell
npm run build
```

Railway start command:

```powershell
npm start
```

Add these Railway variables:

```env
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secure_jwt_secret
ADMIN_SECRET_KEY=your_admin_secret_key
NODE_ENV=production
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

Do not set `PORT` on Railway. Railway provides it automatically.

If MongoDB Atlas blocks the deployed app, add Railway access in MongoDB Atlas Network Access. For quick testing, you can allow:

```text
0.0.0.0/0
```

## Useful Commands

Run frontend lint:

```powershell
npm run lint --prefix frontend
```

Run frontend build only:

```powershell
npm run build --prefix frontend
```

Run backend only:

```powershell
npm start --prefix backend
```

## Notes

- Keep `.env` files private.
- Do not commit real MongoDB, JWT, Google OAuth, or admin secret values.
- The admin secret key is required when signing up as an Admin.

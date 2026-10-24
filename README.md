# Taskyard - Kanban Task Manager

Full-stack Kanban board with drag-and-drop. Users register, log in and manage their own private tasks across three columns: **To do**, **In progress**, **Done**.

**Live demo:** <your-vercel-link>
**Backend API:** <your-render-link>

## Features
- JWT authentication (register / login, passwords hashed with bcrypt)
- Drag and drop tasks between columns and reorder inside a column (order is saved in the database)
- Create, edit (double-click a card) and delete tasks
- Priority (low / medium / high) and due dates with overdue highlighting
- Search and priority filter, progress bar of completed tasks
- Optimistic UI updates with rollback if the server fails
- Responsive layout (columns stack on mobile)

## Tech stack
| Layer | Tech |
|---|---|
| Frontend | React 18, Vite, React Router, @hello-pangea/dnd |
| Backend | Node.js, Express, JWT, bcryptjs |
| Database | MongoDB (Mongoose) on MongoDB Atlas |
| Hosting | Vercel (frontend), Render (backend), Atlas (database) |

## Folder structure
```
kanban-board/
  backend/
    config/db.js
    middleware/auth.js
    models/User.js, Task.js
    routes/auth.js, tasks.js
    server.js
  frontend/
    src/
      components/  Column, TaskCard, TaskModal
      pages/       Login, Register, Board
      context/     AuthContext
      api.js
```

## API
| Method | Endpoint | Description |
|---|---|---|
| POST | /api/auth/register | Create account |
| POST | /api/auth/login | Log in, returns JWT |
| GET | /api/auth/me | Current user |
| GET | /api/tasks | All tasks of the user |
| POST | /api/tasks | Create task |
| PUT | /api/tasks/:id | Update task |
| DELETE | /api/tasks/:id | Delete task |
| PUT | /api/tasks/reorder/bulk | Save positions after drag and drop |

All `/api/tasks` routes need `Authorization: Bearer <token>`.

---

## Run locally

### 1. Backend
```bash
cd backend
npm install
cp .env.example .env      # Windows: copy .env.example .env
# fill MONGO_URI and JWT_SECRET in .env
npm run dev
```
Runs on http://localhost:5000

### 2. Frontend
```bash
cd frontend
npm install
cp .env.example .env      # VITE_API_URL=http://localhost:5000
npm run dev
```
Runs on http://localhost:5173

---

## Deploy (all free)

### Step 1 - Database: MongoDB Atlas
1. Create a free account at mongodb.com/atlas and create a free **M0** cluster.
2. **Database Access** -> add a user (username + password).
3. **Network Access** -> add IP `0.0.0.0/0` (allow from anywhere, needed for Render).
4. **Connect -> Drivers** -> copy the connection string. Replace `<password>` and add the database name `kanban` before the `?`.

### Step 2 - Push code to GitHub
Create a repo and push the whole `kanban-board` folder (the `.gitignore` already skips `node_modules` and `.env`).

### Step 3 - Backend: Render
1. render.com -> **New -> Web Service** -> connect your GitHub repo.
2. Settings:
   - Root Directory: `backend`
   - Build Command: `npm install`
   - Start Command: `npm start`
   - Instance type: Free
3. Environment variables:
   - `MONGO_URI` = your Atlas connection string
   - `JWT_SECRET` = any long random string
   - `CLIENT_URL` = `http://localhost:5173` (you will add the Vercel URL in step 5)
4. Deploy. Open the Render URL, you should see `{"status":"ok"}`.

### Step 4 - Frontend: Vercel
1. vercel.com -> **Add New -> Project** -> import the same repo.
2. Settings:
   - Root Directory: `frontend`
   - Framework Preset: Vite (auto-detected)
3. Environment variable: `VITE_API_URL` = your Render URL (no trailing slash).
4. Deploy. `vercel.json` already handles page refresh routing.

### Step 5 - Connect them (CORS)
In Render -> Environment, set
`CLIENT_URL` = `http://localhost:5173,https://your-app.vercel.app`
(your real Vercel URL, no trailing slash). Render redeploys automatically.

### Notes
- Render free instances sleep after ~15 minutes of inactivity. First request can take 30-50 seconds. Open the backend URL once before a demo.
- If you change `VITE_API_URL`, redeploy the frontend (Vite reads it at build time).

## Possible future improvements
Labels/tags, multiple boards, drag-to-reorder while filtered, real-time sync with Socket.io, dark mode.

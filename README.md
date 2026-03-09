# Timetable Pro

Timetable Pro is a high-performance, modern school timetable management system. It provides a seamless interface for administrators to organize classes, subjects, and teaching staff with an intuitive drag-and-drop experience.

## Core Features

- **Transposed Grid Architecture**: The timetable is displayed with Days as rows and Periods as columns, providing a compact and readable overview of the weekly schedule.
- **Dynamic Subject Assignment**: Use the right-side searchable drawer to drag subjects directly into the grid. The system automatically assigns the corresponding teacher based on pre-configured subject expertise.
- **Conflict Detection**: Real-time validation alerts users to potential double-bookings or teacher availability conflicts.
- **Custom UI Components**: Built with Tailwind CSS v4 and React 19, the application uses a professional design system with dark-themed sidebars, glassmorphism, and custom-built modal dialogs for all interactions.
- **PDF Export Engine**: Generate high-quality, print-ready PDF versions of your timetables with a single click, supporting modern CSS features and custom color palettes.

## Technology Stack

- **Frontend**: React 19, Vite, Tailwind CSS v4, dnd-kit (Drag and Drop), Lucide Icons.
- **Backend**: Go (Golang), Gin Framework, MongoDB.
- **Deployment**: GitHub Actions for CI/CD, GitHub Pages for hosting.

## Installation and Setup

### Prerequisites

- Go 1.21 or higher.
- Node.js 20 or higher.
- MongoDB instance (MongoDB Atlas is recommended; an in-memory fallback is included for local development).

### Backend Configuration

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Optional: Configure environment variables for MongoDB connectivity:
   - `DB_USER`
   - `DB_PASSWORD`
   - `DB_HOST`
3. Launch the server:
   ```bash
   go run main.go
   ```
   *The API will be available at http://localhost:8080*

### Frontend Configuration

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install the necessary packages:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
   *The application will be available at http://localhost:5173*

## Deployment

#### Frontend (GitHub Pages)

The frontend is configured to deploy automatically to GitHub Pages via GitHub Actions.

1.  Push your changes to the `main` branch.
2.  In your GitHub repository, go to **Settings > Pages**.
3.  Under **Build and deployment > Source**, select **GitHub Actions**.
4.  The site will be available at `https://<your-username>.github.io/timetable/`.

> [!IMPORTANT]
> GitHub Pages only hosts static files (the frontend). To make the application functional online, you must host the backend and database separately.

#### Backend & Database (Hosting)

To host the backend API and MongoDB:

1.  **Database**: Use [MongoDB Atlas](https://www.mongodb.com/products/platform/atlas-database) (Free Tier) to host your database. Update your `MONGODB_URI` environment variable with the connection string.
2.  **API**: Host the Go backend on a platform like [Render](https://render.com/), [Railway](https://railway.app/), or any VPS.
    - Set the `PORT` environment variable (usually `8080`).
    - Set `MONGODB_URI` to your Atlas connection string.
3.  **Frontend Configuration**:
    - In your GitHub repository, go to **Settings > Secrets and variables > Actions**.
    - Add a new **Variable** (not secret) named `VITE_API_URL` and set its value to your hosted backend URL (e.g., `https://your-api.onrender.com`).
    - Redeploy the frontend.

---

**Co-authored-by**: Sundrabomjan & Antigravity.

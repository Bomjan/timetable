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

## Deployment to GitHub Pages

The project includes an automated deployment pipeline using GitHub Actions.

### Deployment Steps

1. Push your changes to the main branch of your GitHub repository.
2. Navigate to your repository settings on GitHub.
3. Select **Settings** from the top menu, then click on **Pages** in the left sidebar.
4. Under **Build and deployment**, ensure the **Source** is set to **GitHub Actions**.
5. The deployment workflow will trigger automatically and publish the site to your GitHub Pages URL.

---

This project is a collaborative effort by Sundrabomjan and the Antigravity AI assistant.

# Employee Management System (EMS)

A modern, high-performance Employee Management System built with **React**, **Vite**, **TanStack Router**, and **Firebase**. The project provides a seamless and responsive admin dashboard to manage team members securely.

## ✨ Features

- **Secure Authentication**: Firebase-powered user authentication. Only authorized users can access the dashboard.
- **Real-time Dashboard**: Live overview of team metrics (Total Employees, Active Employees, Departments).
- **Activity Feed**: Automatically tracks and logs every action (creation, updates, deletions) performed on the employee database.
- **Comprehensive CRUD Operations**: Add, edit, view, and permanently delete employee records.
- **Advanced Filtering & Search**: Find employees instantly by name, email, position, department, or active status.
- **CSV Export**: Export your filtered employee list to a CSV file in one click.
- **Dark/Light Mode**: Full theme support for comfortable viewing in any lighting condition.
- **Modern UI/UX**: Built with standard Radix UI primitives, Tailwind CSS (with beautiful glassmorphism and gradient effects), and smooth transitions.

## 🛠️ Tech Stack

- **Frontend Framework**: React 19
- **Build Tool**: Vite & TanStack Start
- **Routing**: TanStack Router (File-based routing)
- **Backend / Database**: Firebase (Auth & Firestore)
- **Styling**: Tailwind CSS v4
- **Components**: Radix UI Primitives, Lucide React (Icons)
- **Data Export**: PapaParse

## 🚀 Getting Started

### Prerequisites
Make sure you have [Node.js](https://nodejs.org/) installed on your machine.

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/AmarAhmedDev/employee-hub.git
   cd employee-hub
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up Firebase**:
   Ensure your Firebase configuration details are correctly set up in the `src/lib/firebase.ts` file to connect to your Firestore database.

4. **Start the development server**:
   ```bash
   npm run dev
   ```
   The app will be available locally at `http://localhost:8080` (or another port provided by Vite).

## 📂 Project Structure

- `src/components/`: Reusable UI components (buttons, inputs, dialogs) built with Radix UI.
- `src/components/app/`: App-specific components like the `AppShell` (sidebar, header) and `EmployeeForm`.
- `src/lib/`: Firebase configuration, authentication context, theme providers, and API utilities.
- `src/routes/`: Pages managed by TanStack Router (`login.tsx`, `dashboard.tsx`, `employees.tsx`, `activity.tsx`).

## 📝 License

This project was built as part of a Full Stack Internship task. All rights reserved.

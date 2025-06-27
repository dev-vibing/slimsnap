# SlimSnap

A blazingly fast and privacy-focused image compressor and resizer built with React, TypeScript, and Tailwind CSS. Process all your images directly in your browser without ever uploading them to a server.

## ✨ Features

- **Client-Side Processing:** All image processing happens in your browser. No data is ever sent to a server, ensuring your privacy.
- **Freemium Model:** Access basic features for free, with premium options for advanced users.
- **Adjustable Compression:** Control the quality, max width, and max height of your images.
- **Batch Processing:** Upload and process multiple images at once.
- **User Authentication:** Sign in to access premium features.
- **Modern UI:** A clean and responsive user interface built with Tailwind CSS.

## 🚀 Tech Stack

- **Framework:** [React](https://reactjs.org/)
- **Language:** [TypeScript](https://www.typescriptlang.org/)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)
- **Backend-as-a-Service:** [Supabase](https://supabase.io/) for user authentication
- **Build Tool:** [Vite](https://vitejs.dev/)
- **Icons:** [Lucide React](https://lucide.dev/guide/packages/lucide-react)

## 📦 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/en/) (version 18.x or higher)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/slimsnap.git
   ```
2. Navigate to the project directory:
   ```bash
   cd slimsnap
   ```
3. Install the dependencies:
   ```bash
   npm install
   ```
4. Create a `.env.local` file in the root of the project and add your Supabase environment variables:
    ```
    VITE_SUPABASE_URL=your_supabase_url
    VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
    ```
### Running the Project

To start the development server, run:
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) to view it in the browser.

## 📜 Scripts

- `npm run dev`: Starts the development server.
- `npm run build`: Builds the app for production.
- `npm run lint`: Lints the codebase.
- `npm run preview`: Serves the production build locally.

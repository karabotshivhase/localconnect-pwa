// src/main.jsx (CORRECTED FILE PATH)

import React from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import './index.css'; // Import your global styles.

// Import your Root layout
import Root from './routes/Root';
// Import your pages
import App from './App.jsx';
import ProfilePage from './pages/ProfilePage.jsx'; // <--- THIS LINE IS NOW FIXED
import AuthPage from './pages/AuthPage.jsx';
import SavedPage from './pages/SavedPage.jsx';

const router = createBrowserRouter([
  {
    path: "/",
    element: <Root />,
    children: [
      {
        index: true,
        element: <App />,
      },
      {
        path: "saved",
        element: <SavedPage />,
      },
      {
        path: "business/:businessId",
        element: <ProfilePage />,
      },
      {
        path: "portal",
        element: <AuthPage />
      },
    ]
  },
]);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
);
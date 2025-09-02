// src/routes/Root.jsx (WITH ANALYTICS)

import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar";
import { Analytics } from '@vercel/analytics/react'; // <-- Import the component

export default function Root() {
  return (
    <>
      <main className="content">
        <Outlet />
      </main>
      
      <Navbar />

      <Analytics /> {/* <-- Add the component here */}
    </>
  );
}
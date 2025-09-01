// src/routes/Root.jsx
import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar";

export default function Root() {
  return (
    <>
      {/* The main content for each page will be rendered here */}
      <main className="content">
        <Outlet />
      </main>
      
      {/* The Navbar will be visible on all pages */}
      <Navbar />
    </>
  );
}


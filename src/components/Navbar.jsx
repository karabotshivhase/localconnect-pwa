// src/components/Navbar.jsx (CORRECTED)

// We need to import NavLink for the links and the CSS for the styling.
import { NavLink } from "react-router-dom";
import './Navbar.css'; // <--- THIS IS THE CRUCIAL FIX.

export default function Navbar() {
    return (
        <nav className="navbar">
            <NavLink to="/">Discover</NavLink>
            <NavLink to="/saved">Saved</NavLink>
            <NavLink to="/portal">For Business</NavLink>
        </nav>
    );
}
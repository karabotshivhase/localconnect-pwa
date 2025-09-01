// src/components/BusinessCard.jsx

import { Link } from 'react-router-dom';

export default function BusinessCard({ business }) {
  return (
    // The Link component makes the entire card clickable
    <Link to={`/business/${business.id}`} className="card-link">
      <div className="card">
        {/* We'll add the image here once image uploads are implemented */}
        {/* <img src={business.image_url || 'default-image.png'} alt={business.name} /> */}
        <h3>{business.name}</h3>
        <p>{business.category}</p>
      </div>
    </Link>
  );
}
// src/pages/ProfilePage.jsx (FINAL VERSION WITH ADDRESS DISPLAY)

import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useSavedBusinesses } from '../hooks/useSavedBusinesses';
import { supabase } from '../supabaseClient';

export default function ProfilePage() {
  const { businessId } = useParams();
  const { isBusinessSaved, toggleSaveBusiness } = useSavedBusinesses();
  const [business, setBusiness] = useState(null);
  const [galleryImages, setGalleryImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchBusinessData() {
      setLoading(true);
      setError(null);
      const [businessResponse, imagesResponse] = await Promise.all([
        supabase.from('businesses').select('*').eq('id', businessId).single(),
        supabase.from('business_images').select('id, image_url').eq('business_id', businessId)
      ]);

      if (businessResponse.error) {
        console.error('Error fetching profile:', businessResponse.error);
        setError('Business profile not found.');
      } else {
        setBusiness(businessResponse.data);
      }
      
      if (imagesResponse.error) {
        console.error('Error fetching images:', imagesResponse.error);
      } else {
        setGalleryImages(imagesResponse.data);
      }
      
      setLoading(false);
    }
    
    fetchBusinessData();
  }, [businessId]);
  
  function getPublicUrl(path, placeholder = 'https://placehold.co/600x400') {
    if (!path) return placeholder;
    const { data } = supabase.storage.from('business-images').getPublicUrl(path);
    return data.publicUrl;
  }

  if (loading) return <div>Loading business profile...</div>;
  if (error) return <div>{error}</div>;
  if (!business) return <div>Profile not available.</div>;

  const isSaved = isBusinessSaved(business.id);

  return (
    <div className="profile-page">
      <img
        src={getPublicUrl(galleryImages[0]?.image_url)} 
        alt={business.name}
        className="profile-image-large"
        style={{ width: '100%', height: 'auto', maxHeight: '400px', objectFit: 'cover', borderRadius: '8px' }}
      />
      
      <h1>{business.name}</h1>
      
      <div className="actions" style={{ display: 'flex', gap: '1rem', margin: '1rem 0' }}>
        <button onClick={() => toggleSaveBusiness(business.id)} className="save-button">
          {isSaved ? '★ Saved' : '☆ Save for Later'}
        </button>
        {business.phone && (
          <a href={`tel:${business.phone}`} className="button-primary">Call Us</a>
        )}
      </div>

      <p style={{ color: '#6B7280', fontWeight: 500 }}>{business.category}</p>
      <p style={{ color: '#111827' }}>{business.description}</p>
      
      {/* --- THIS IS THE FIX --- */}
      {/* This block conditionally renders the address if it exists. */}
      {business.address && (
        <div className="address-section" style={{ marginTop: '1.5rem', borderTop: '1px solid var(--color-border)', paddingTop: '1rem' }}>
          <h3>Location</h3>
          <p style={{ margin: '0.25rem 0', color: '#111827' }}>{business.address}</p>
          <a
            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(business.address)}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            Open in Google Maps
          </a>
        </div>
      )}
      {/* --- END OF FIX --- */}

      {galleryImages.length > 0 && (
        <div className="gallery-section" style={{ marginTop: '2rem' }}>
          <h2>Gallery</h2>
          <div className="gallery-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
            {galleryImages.map(image => (
              <img key={image.id} src={getPublicUrl(image.image_url, 'https://placehold.co/200')} alt="Business gallery item" style={{ width: '100%', height: '200px', objectFit: 'cover', borderRadius: '8px' }} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
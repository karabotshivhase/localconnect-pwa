// src/pages/ProfilePage.jsx (GALLERY DISPLAY VERSION)

import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useSavedBusinesses } from '../hooks/useSavedBusinesses';
import { supabase } from '../supabaseClient';

export default function ProfilePage() {
  const { businessId } = useParams();
  const { isBusinessSaved, toggleSaveBusiness } = useSavedBusinesses();
  
  // State for business details
  const [business, setBusiness] = useState(null);
  
  // NEW: State to hold the gallery images
  const [galleryImages, setGalleryImages] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // This function will now fetch data from both tables in parallel
    async function fetchBusinessData() {
      setLoading(true);
      setError(null);

      // We can use Promise.all to fetch both sets of data simultaneously for better performance
      const [businessResponse, imagesResponse] = await Promise.all([
        // Promise 1: Fetch the main business profile
        supabase.from('businesses').select('*').eq('id', businessId).single(),
        // Promise 2: Fetch all images linked to this businessId
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
        // We won't set the main page error for this, so the profile can still load if images fail.
      } else {
        setGalleryImages(imagesResponse.data);
      }
      
      setLoading(false);
    }
    
    fetchBusinessData();
  }, [businessId]);
  
  // Helper function to get the full public URL for a storage path
  function getPublicUrl(path, placeholder = 'https://placehold.co/600x400') {
    if (!path) return placeholder;
    const { data } = supabase.storage.from('business-images').getPublicUrl(path);
    return data.publicUrl;
  }

  // --- Render logic ---
  
  if (loading) return <div>Loading business profile...</div>;
  if (error) return <div>{error}</div>;
  if (!business) return <div>Profile not available.</div>;

  const isSaved = isBusinessSaved(business.id);

  return (
    <div className="profile-page">
      {/* For the main image, we'll try to use the first gallery image as a header. */}
      {/* We are no longer using the old single 'image_url'. */}
      <img
        src={getPublicUrl(galleryImages[0]?.image_url)} 
        alt={business.name}
        className="profile-image-large"
        style={{ width: '100%', height: 'auto', maxHeight: '400px', objectFit: 'cover', borderRadius: '8px' }}
      />
      
      <h1>{business.name}</h1>
      
      {/* Action buttons (Save, Call) are unchanged */}
      <div className="actions" style={{ display: 'flex', gap: '1rem', margin: '1rem 0' }}>
        <button onClick={() => toggleSaveBusiness(business.id)} className="save-button">
          {isSaved ? '★ Saved' : '☆ Save for Later'}
        </button>
        {business.phone && (
          <a href={`tel:${business.phone}`} className="button-primary">Call Us</a>
        )}
      </div>

      {/* Main business details are unchanged */}
      <p style={{ color: '#6B7280', fontWeight: 500 }}>{business.category}</p>
      <p style={{ color: '#111827' }}>{business.description}</p>
      {business.address && (
        <div className="address-section" style={{ marginTop: '1.5rem' }}>
          {/* ... Address details ... */}
        </div>
      )}

      {/* --- NEW: THE GALLERY SECTION --- */}
      {galleryImages.length > 0 && (
        <div className="gallery-section" style={{ marginTop: '2rem' }}>
          <h2>Gallery</h2>
          <div className="gallery-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
            {galleryImages.map(image => (
              <img
                key={image.id}
                src={getPublicUrl(image.image_url, 'https://placehold.co/200')}
                alt="Business gallery item"
                style={{ width: '100%', height: '200px', objectFit: 'cover', borderRadius: '8px' }}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
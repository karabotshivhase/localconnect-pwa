// src/components/BusinessProfileEditor.jsx (GALLERY MANAGEMENT VERSION)

import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

export default function BusinessProfileEditor({ session }) {
  // State for the main profile details
  const [loading, setLoading] = useState(true);
  const [businessId, setBusinessId] = useState(null); // We need the business ID now
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  
  // State for the new gallery feature
  const [galleryImages, setGalleryImages] = useState([]);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (!session) return;
    
    async function fetchProfileAndImages() {
      try {
        setLoading(true);
        const { user } = session;

        // 1. Fetch the main business profile to get its ID and details
        let { data: businessData, error: businessError } = await supabase
          .from('businesses')
          .select(`id, name, category, description, address, phone`)
          .eq('user_id', user.id)
          .single();
          
        if (businessError && businessError.code !== 'PGRST116') throw businessError;

        if (businessData) {
          setBusinessId(businessData.id);
          setName(businessData.name);
          setCategory(businessData.category);
          setDescription(businessData.description);
          setAddress(businessData.address);
          setPhone(businessData.phone);

          // 2. Once we have the business ID, fetch all its images
          let { data: imagesData, error: imagesError } = await supabase
            .from('business_images')
            .select('id, image_url')
            .eq('business_id', businessData.id);
          
          if (imagesError) throw imagesError;
          
          setGalleryImages(imagesData || []);
        }
      } catch (error) {
        alert(error.message);
      } finally {
        setLoading(false);
      }
    }
    
    fetchProfileAndImages();
  }, [session]);

  // Upload function now adds to the new 'business_images' table
  async function uploadGalleryImage(event) {
    // A check to ensure a profile exists before uploading images
    if (!businessId) {
      alert("Please fill out and save your business name before uploading images.");
      return;
    }

    try {
      setUploading(true);
      if (!event.target.files || event.target.files.length === 0) throw new Error('You must select an image to upload.');
      
      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      const filePath = `gallery/${businessId}/${Date.now()}.${fileExt}`;
      
      let { error: uploadError } = await supabase.storage.from('business-images').upload(filePath, file);
      if (uploadError) throw uploadError;
      
      // Insert a new row into our 'business_images' table
      let { data: newImageData, error: insertError } = await supabase.from('business_images')
        .insert({ business_id: businessId, image_url: filePath })
        .select() // Use .select() to get the new row data back
        .single();
        
      if(insertError) throw insertError;

      // Add the new image to our local state to instantly update the UI
      setGalleryImages(prevImages => [...prevImages, newImageData]);
    } catch (error) {
      alert(error.message);
    } finally {
      setUploading(false);
    }
  }

  // New function to handle deleting a gallery image
  async function deleteImage(image) {
    // Optimistic UI update: remove the image from state immediately
    setGalleryImages(galleryImages.filter(item => item.id !== image.id));
    
    // 1. Delete the file from Supabase Storage
    const { error: storageError } = await supabase.storage.from('business-images').remove([image.image_url]);
    if (storageError) {
      alert('Error deleting file from storage:', storageError.message);
      // Revert UI if it fails
      setGalleryImages(prevImages => [...prevImages, image].sort((a,b)=>a.created_at - b.created_at));
      return; 
    }
    
    // 2. Delete the row from the 'business_images' table
    const { error: dbError } = await supabase.from('business_images').delete().eq('id', image.id);
    if (dbError) {
      alert('Error deleting image record:', dbError.message);
       // Revert UI if it fails
      setGalleryImages(prevImages => [...prevImages, image].sort((a,b)=>a.created_at - b.created_at));
    }
  }
  
  // The original profile update function, simplified to only handle text
  async function updateProfileDetails(event) {
    event.preventDefault();
    setLoading(true);
    const updates = { user_id: session.user.id, name, category, description, address, phone };
    let { error } = await supabase.from('businesses').upsert(updates, { onConflict: 'user_id' });
    if (error) {
      alert(error.message);
    } else {
      alert('Profile details saved successfully!');
    }
    setLoading(false);
  }

  function getPublicUrl(path) {
    if (!path) return 'https://placehold.co/150';
    const { data } = supabase.storage.from('business-images').getPublicUrl(path);
    return data.publicUrl;
  }

  return (
    <div>
      <form onSubmit={updateProfileDetails} className="form-widget">
        <h2>Your Business Details</h2>
        <p>Edit your business information below.</p>
        <div>
          <label htmlFor="name">Business Name</label>
          <input id="name" type="text" value={name || ''} onChange={(e) => setName(e.target.value)} required />
        </div>
        {/* ... All other text input fields ... */}
        <div>
          <label htmlFor="category">Category</label>
          <input id="category" type="text" value={category || ''} onChange={(e) => setCategory(e.target.value)} />
        </div>
        <div>
          <label htmlFor="description">Description</label>
          <textarea id="description" value={description || ''} onChange={(e) => setDescription(e.target.value)} />
        </div>
        <div>
          <label htmlFor="address">Address</label>
          <input id="address" type="text" value={address || ''} onChange={(e) => setAddress(e.target.value)} />
        </div>
        <div>
          <label htmlFor="phone">Phone Number</label>
          <input id="phone" type="tel" value={phone || ''} onChange={(e) => setPhone(e.target.value)} />
        </div>
        <div>
          <button type="submit" disabled={loading}>{loading ? 'Saving...' : 'Save Details'}</button>
        </div>
      </form>
      
      <div className="gallery-manager">
        <h2>Your Business Gallery</h2>
        <p>Upload images of your products, services, or location.</p>
        
        <div>
          <label className="button primary block" htmlFor="gallery-uploader">{uploading ? 'Uploading...' : 'Upload New Image'}</label>
          <input style={{visibility: 'hidden', position: 'absolute'}} type="file" id="gallery-uploader" accept="image/*" onChange={uploadGalleryImage} disabled={uploading} />
        </div>

        <div className="gallery-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '1rem', marginTop: '1rem' }}>
          {galleryImages.map(image => (
            <div key={image.id} className="gallery-item" style={{ position: 'relative' }}>
              <img src={getPublicUrl(image.image_url)} alt="Gallery item" style={{ width: '100%', height: '150px', objectFit: 'cover', borderRadius: '8px' }} />
              <button onClick={() => deleteImage(image)} style={{ position: 'absolute', top: '5px', right: '5px' }}>X</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
// src/components/BusinessProfileEditor.jsx (FINAL CLEANED VERSION)
import { useState, useEffect } from 'react'; // <-- ONLY ONE IMPORT STATEMENT
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';

// <-- TABBUTTON IS DEFINED ONLY ONCE AT THE TOP
function TabButton({ children, isActive, onClick }) {
  return (
    <button onClick={onClick} style={{ padding: '10px 15px', border: 'none', borderBottom: isActive ? '2px solid var(--color-primary)' : '2px solid transparent', background: 'none', color: isActive ? 'var(--color-primary)' : 'var(--color-text-light)', cursor: 'pointer', fontWeight: isActive ? 'bold' : 'normal' }}>{children}</button>
  );
}

export default function BusinessProfileEditor({ session }) {
  const [activeTab, setActiveTab] = useState('details');
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [businessId, setBusinessId] = useState(null);
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [galleryImages, setGalleryImages] = useState([]);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (!session) return;
    async function fetchProfileAndImages() {
      try {
        setLoading(true);
        const { user } = session;
        let { data: businessData, error: businessError } = await supabase
          .from('businesses').select(`id, name, category, description, address, phone`)
          .eq('user_id', user.id).single();
        if (businessError && businessError.code !== 'PGRST116') throw businessError;
        if (businessData) {
          setBusinessId(businessData.id); setName(businessData.name); setCategory(businessData.category);
          setDescription(businessData.description); setAddress(businessData.address); setPhone(businessData.phone);
          let { data: imagesData, error: imagesError } = await supabase.from('business_images').select('id, image_url').eq('business_id', businessData.id);
          if (imagesError) throw imagesError;
          setGalleryImages(imagesData || []);
        }
      } catch (error) { alert(error.message); } finally { setLoading(false); }
    }
    fetchProfileAndImages();
  }, [session]);

  async function uploadGalleryImage(event) {
    if (!businessId) { alert("Please save your business details before adding images."); return; }
    try {
      setUploading(true);
      if (!event.target.files || event.target.files.length === 0) throw new Error('You must select an image to upload.');
      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      const filePath = `gallery/${businessId}/${Date.now()}.${fileExt}`;
      let { error: uploadError } = await supabase.storage.from('business-images').upload(filePath, file);
      if (uploadError) throw uploadError;
      let { data: newImageData, error: insertError } = await supabase.from('business_images').insert({ business_id: businessId, image_url: filePath }).select().single();
      if(insertError) throw insertError;
      setGalleryImages(prevImages => [...prevImages, newImageData]);
    } catch (error) { alert(error.message); } finally { setUploading(false); }
  }

  async function deleteImage(image) {
    setGalleryImages(galleryImages.filter(item => item.id !== image.id));
    const { error: storageError } = await supabase.storage.from('business-images').remove([image.image_url]);
    if (storageError) { alert('Error deleting file from storage:', storageError.message); setGalleryImages(prev => [...prev, image]); return; }
    const { error: dbError } = await supabase.from('business_images').delete().eq('id', image.id);
    if (dbError) { alert('Error deleting image record:', dbError.message); setGalleryImages(prev => [...prev, image]); }
  }
  
  async function updateProfileDetails(event) {
    event.preventDefault(); setLoading(true);
    const updates = { user_id: session.user.id, name, category, description, address, phone };
    let { data, error } = await supabase.from('businesses').upsert(updates, { onConflict: 'user_id' }).select().single();
    if (error) { alert(error.message); } else { if (data) { setBusinessId(data.id); } alert('Profile details saved successfully!'); }
    setLoading(false);
  }

  async function handleDeleteBusiness() {
    if (!businessId) { alert("No business profile to delete."); return; }
    const isConfirmed = window.confirm("Are you absolutely sure you want to delete your business profile? This will permanently remove all your details and gallery images. This action cannot be undone.");
    if (!isConfirmed) return;
    try {
      setLoading(true);
      if (galleryImages.length > 0) {
        const filePaths = galleryImages.map(image => image.image_url);
        const { error: storageError } = await supabase.storage.from('business-images').remove(filePaths);
        if (storageError) throw storageError;
      }
      const { error: dbError } = await supabase.from('businesses').delete().eq('id', businessId);
      if (dbError) throw dbError;
      await supabase.auth.signOut();
      alert("Your business profile has been successfully deleted.");
      navigate('/');
    } catch (error) { alert("Error deleting profile: " + error.message); } finally { setLoading(false); }
  }

  function getPublicUrl(path) { if (!path) return 'https://placehold.co/150'; const { data } = supabase.storage.from('business-images').getPublicUrl(path); return data.publicUrl; }
  
  return (
    <div>
      <h2>Your Business Profile</h2>
      <div className="tabs-container" style={{ borderBottom: '1px solid var(--color-border)', marginBottom: '1.5rem' }}>
        <TabButton isActive={activeTab === 'details'} onClick={() => setActiveTab('details')}>Profile Details</TabButton>
        {businessId && (
          <>
            <TabButton isActive={activeTab === 'gallery'} onClick={() => setActiveTab('gallery')}>Manage Gallery</TabButton>
            <TabButton isActive={activeTab === 'settings'} onClick={() => setActiveTab('settings')}>Settings</TabButton>
          </>
        )}
      </div>
      <div className="tab-content">
        {activeTab === 'details' && (
          <form onSubmit={updateProfileDetails} className="form-widget">
            {!businessId && ( <p style={{ fontWeight: 'bold' }}>Welcome! Please fill out and save your business details to unlock the gallery and settings.</p> )}
            <div><label htmlFor="name">Business Name</label><input id="name" type="text" value={name || ''} onChange={(e) => setName(e.target.value)} required /></div>
            <div><label htmlFor="category">Category</label><input id="category" type="text" value={category || ''} onChange={(e) => setCategory(e.target.value)} /></div>
            <div><label htmlFor="description">Description</label><textarea id="description" value={description || ''} onChange={(e) => setDescription(e.target.value)} /></div>
            <div><label htmlFor="address">Address</label><input id="address" type="text" value={address || ''} onChange={(e) => setAddress(e.target.value)} /></div>
            <div><label htmlFor="phone">Phone Number</label><input id="phone" type="text" value={phone || ''} onChange={(e) => setPhone(e.target.value)} /></div>
            <div><button className="button primary block" type="submit" disabled={loading}>{loading ? 'Saving...' : 'Save Details'}</button></div>
          </form>
        )}
        {activeTab === 'gallery' && businessId && (
          <div className="gallery-manager">
            <p>Upload images of your products, services, or location.</p>
            <div>
              <label className="button primary block" htmlFor="gallery-uploader">{uploading ? 'Uploading...' : 'Upload New Image'}</label>
              <input style={{visibility: 'hidden', position: 'absolute'}} type="file" id="gallery-uploader" accept="image/*" onChange={uploadGalleryImage} disabled={uploading} />
            </div>
            <div className="gallery-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '1rem', marginTop: '1rem' }}>
              {galleryImages.map(image => (
                <div key={image.id} className="gallery-item" style={{ position: 'relative' }}>
                  <img src={getPublicUrl(image.image_url)} alt="Gallery item" style={{ width: '100%', height: '150px', objectFit: 'cover', borderRadius: '8px' }} />
                  <button onClick={() => deleteImage(image)} style={{ position: 'absolute', top: '5px', right: '5px', background: 'rgba(0,0,0,0.5)', color: 'white', border: 'none', borderRadius: '50%', width: '24px', height: '24px', cursor: 'pointer' }}>X</button>
                </div>
              ))}
            </div>
          </div>
        )}
        {activeTab === 'settings' && businessId && (
          <div className="danger-zone">
            <h3>Delete Profile</h3>
            <p>Permanently remove your business profile and all associated data from LocalConnect. This action cannot be undone.</p>
            <button onClick={handleDeleteBusiness} disabled={loading} style={{ backgroundColor: '#EF4444' }}>{loading ? 'Deleting...' : 'Delete My Business Profile'}</button>
          </div>
        )}
      </div>
    </div>
  );
}
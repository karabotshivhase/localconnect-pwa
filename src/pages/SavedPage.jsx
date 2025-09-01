// src/pages/SavedPage.jsx (IMPROVED)
import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { useSavedBusinesses } from '../hooks/useSavedBusinesses';
import BusinessCard from '../components/BusinessCard';

export default function SavedPage() {
  const { savedBusinesses } = useSavedBusinesses();
  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null); // FIX: Add error state

  useEffect(() => {
    // This effect runs whenever the list of saved business IDs changes.
    async function fetchSavedBusinesses() {
      // FIX: If the saved businesses array is empty, handle it explicitly.
      if (savedBusinesses.length === 0) {
        setBusinesses([]); // Clear any previous (stale) data.
        setLoading(false);
        return; // Stop execution here.
      }

      try {
        setLoading(true);
        setError(null);
        const { data, error } = await supabase
          .from('businesses')
          .select('*')
          .in('id', savedBusinesses); // Fetches all rows where 'id' is in the array.

        if (error) {
          // Instead of just logging, we'll throw the error to be caught below.
          throw error;
        }

        setBusinesses(data || []); // Ensure we always have an array.

      } catch (error) {
        console.error('Error fetching saved businesses:', error);
        setError('Could not fetch saved businesses. Please try again.');
        setBusinesses([]); // Clear data on error
      } finally {
        setLoading(false);
      }
    }

    fetchSavedBusinesses();
  }, [savedBusinesses]); // Dependency array is correct.

  // Render logic is now more explicit
  const renderContent = () => {
    if (loading) {
      return <p>Loading your saved places...</p>;
    }
    if (error) {
      return <p>{error}</p>;
    }
    if (businesses.length === 0) {
      return <p>You haven't saved any businesses yet. Start exploring!</p>;
    }
    return (
      <div className="business-grid">
        {businesses.map(business => <BusinessCard key={business.id} business={business} />)}
      </div>
    );
  };

  return (
    <div>
      <h1>Saved Businesses</h1>
      {renderContent()}
    </div>
  );
}

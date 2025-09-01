// src/App.jsx (CORRECT AND FINAL VERSION)

import { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import BusinessCard from './components/BusinessCard';

function App() {
  // FIX: All hooks are called at the top level, in the same order, every time.
  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState(null);

  useEffect(() => {
    async function getBusinesses() {
      setLoading(true);
      setError(null);

      let query = supabase.from('businesses').select('*');

      if (searchTerm) {
        query = query.ilike('name', `%${searchTerm}%`);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching businesses:', error);
        setError(error.message);
        setBusinesses([]);
      } else {
        setBusinesses(data);
      }
      setLoading(false);
    }

    getBusinesses();
  }, [searchTerm]);

  // FIX: Conditional rendering logic comes *after* all hooks.
  const renderContent = () => {
    if (loading) {
      return <p>Loading businesses...</p>;
    }
    if (error) {
      return <p>Error loading businesses: {error}</p>;
    }
    if (businesses.length === 0) {
      return <p>No businesses found.</p>;
    }
    return (
      <div className="business-grid">
        {businesses.map((business) => (
          <BusinessCard key={business.id} business={business} />
        ))}
      </div>
    );
  };

  return (
    <div>
      <h1>Discover Local Businesses</h1>
      <div className="filters-container">
        <input
          type="search"
          placeholder="Search by business name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      {renderContent()}
    </div>
  );
}

export default App;
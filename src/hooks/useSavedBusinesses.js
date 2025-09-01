// src/hooks/useSavedBusinesses.js
import { useState, useCallback } from 'react';

const STORAGE_KEY = 'saved_businesses';

export function useSavedBusinesses() {
  const [saved, setSaved] = useState(() => {
    // Get initial saved businesses from local storage
    const savedBusinesses = window.localStorage.getItem(STORAGE_KEY);
    return savedBusinesses ? JSON.parse(savedBusinesses) : [];
  });

  const isBusinessSaved = useCallback((businessId) => {
    return saved.includes(businessId);
  }, [saved]);

  const toggleSaveBusiness = useCallback((businessId) => {
    let updatedSaved;
    if (isBusinessSaved(businessId)) {
      // Remove it
      updatedSaved = saved.filter(id => id !== businessId);
    } else {
      // Add it
      updatedSaved = [...saved, businessId];
    }
    setSaved(updatedSaved);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedSaved));
  }, [saved, isBusinessSaved]);

  return { savedBusinesses: saved, isBusinessSaved, toggleSaveBusiness };
}
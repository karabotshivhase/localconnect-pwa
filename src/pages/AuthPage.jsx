// src/pages/AuthPage.jsx (CORRECTED AND FINAL VERSION)

import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase } from '../supabaseClient';
import { useState, useEffect } from 'react';

import BusinessProfileEditor from '../components/BusinessProfileEditor';

export default function AuthPage() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for an existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false); // We're done checking, so stop loading
    });

    // Listen for future changes in authentication state
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    // Cleanup the listener when the component is unmounted
    return () => subscription.unsubscribe();
  }, []);

  // Show a loading message while we check for a session
  if (loading) {
    return <div>Loading...</div>;
  }

  // If there's no session, show the login/signup form
  if (!session) {
    return <Auth supabaseClient={supabase} appearance={{ theme: ThemeSupa }} />;
  } 
  // If there is a session, show the profile editor
  else {
    return <BusinessProfileEditor key={session.user.id} session={session} />;
  }
}
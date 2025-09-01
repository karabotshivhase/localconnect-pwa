// src/supabaseClient.js
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://ngdnesveuhcrmbatyczz.supabase.co' // Found in your Supabase project's API settings
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5nZG5lc3ZldWhjcm1iYXR5Y3p6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYwNTc4MTMsImV4cCI6MjA3MTYzMzgxM30.tD7P8kHWq4AQ3HTO4nS3_dvngUD5AyQQfJcyVmD78Vo'   // Found in your Supabase project's API settings

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
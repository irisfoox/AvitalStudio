import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://aszchfuopyygnzovvafj.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFzemNoZnVvcHl5Z256b3Z2YWZqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY2NjE3MjIsImV4cCI6MjA5MjIzNzcyMn0.vNFo8CIcjpn0AXoqrqbizvVyiEKp3gX90Br3iFnCNyE';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

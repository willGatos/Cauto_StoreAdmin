import { createClient } from '@supabase/supabase-js';

// Reemplaza estos valores con los de tu proyecto
const SUPABASE_URL = import.meta.env.VITE_REACT_APP_SUPABASE_URL as string;
const SUPABASE_ANON_KEY = import.meta.env.VITE_REACT_APP_SUPABASE_ANON_KEY as string;    

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export default supabase;
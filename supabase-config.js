// Supabase Configuration - Shared across all pages
const SUPABASE_URL = 'https://vkyvjftutivsnjponsvj.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_a-MY-4wpbvzM2gdWNxE4Wg_bPgY5noX';

const { createClient } = supabase;
const supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);


import { createClient } from '@supabase/supabase-js';

// Configuration from project settings
const supabaseUrl = 'https://mllceivdzmwkbqgnocri.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1sbGNlaXZkem13a2JxZ25vY3JpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkxODUwMjQsImV4cCI6MjA4NDc2MTAyNH0.qkfl-GOXPc5Vw3MbhBbRk9FxLRm98MkF66igevjkh_k';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

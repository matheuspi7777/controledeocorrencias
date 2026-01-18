import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://kavhkkspgxvuieardiiw.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imthdmhra3NwZ3h2dWllYXJkaWl3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg3NjcyMDksImV4cCI6MjA4NDM0MzIwOX0.EU7VE48LaHFPjgnZ_4mqSMZYrMlPJiAZZO_IvL-KvZQ';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

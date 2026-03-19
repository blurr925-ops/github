import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  'https://ohcxifhjzoxyvtrdyjdu.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9oY3hpZmhqem94eXZ0cmR5amR1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM4OTYzNTQsImV4cCI6MjA4OTQ3MjM1NH0.ufxp98Kzgmuw3laCNXHoG92s_5awmRKGRIo2JUGtF9g'
);

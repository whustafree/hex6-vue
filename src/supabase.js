import { createClient } from '@supabase/supabase-js'

// Tus credenciales de HEX6
const supabaseUrl = 'https://yweeqpnuqorgojanrwam.supabase.co'
const supabaseKey = 'sb_publishable_SDZLc8AmtPXJ1iiLKl_qHg_w0VFasGD'

export const supabase = createClient(supabaseUrl, supabaseKey)
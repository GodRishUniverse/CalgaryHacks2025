import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async (req) => {
  const { projectId, title, userEmail } = await req.json()

  // Create Supabase client
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  )

  // Send email using Supabase's built-in email service
  const { error } = await supabase.auth.admin.createUser({
    email: userEmail,
    email_template: 'project-approved',
    user_metadata: {
      projectId,
      projectTitle: title,
    },
  })

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { 'Content-Type': 'application/json' },
      status: 400,
    })
  }

  return new Response(
    JSON.stringify({ message: 'Approval email sent successfully' }),
    {
      headers: { 'Content-Type': 'application/json' },
      status: 200,
    },
  )
}) 
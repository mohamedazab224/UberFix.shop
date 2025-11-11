import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.56.1';

// CORS headers - السماح لجميع النطاقات
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ErrorLog {
  message: string;
  stack?: string;
  url?: string;
  user_agent?: string;
  level: 'error' | 'warning' | 'info';
  metadata?: Record<string, any>;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Validate request method
    if (req.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), {
        status: 405,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Verify JWT authentication
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Missing authorization header' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    // Create client with user's JWT for authentication check
    const supabaseClient = createClient(supabaseUrl, supabaseKey, {
      global: {
        headers: { Authorization: authHeader },
      },
    });

    // Verify user is authenticated
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Create admin client for database operations
    const supabase = createClient(supabaseUrl, supabaseKey);

    const body = await req.json();
    const errors = Array.isArray(body) ? body : [body];

    // Process and insert errors
    const errorLogs = errors.map((error: ErrorLog) => ({
      user_id: user.id,
      message: error.message || 'Unknown error',
      stack: error.stack,
      level: error.level || 'error',
      url: error.url,
      user_agent: error.user_agent,
      metadata: {
        ...error.metadata,
        user_email: user.email,
        timestamp: new Date().toISOString(),
      },
    }));

    // Insert errors (trigger will handle grouping and hashing)
    const { data: insertedErrors, error: insertError } = await supabase
      .from('error_logs')
      .insert(errorLogs)
      .select();

    if (insertError) {
      console.error('Error inserting logs:', insertError);
      return new Response(
        JSON.stringify({ error: 'Failed to save error logs', details: insertError.message }), 
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get critical errors for notification
    const criticalErrors = errorLogs.filter(log => log.level === 'error');
    
    if (criticalErrors.length > 0) {
      // Get admin users for notification
      const { data: adminUsers } = await supabase
        .from('user_roles')
        .select('user_id')
        .in('role', ['admin', 'manager']);

      if (adminUsers && adminUsers.length > 0) {
        // Create notifications for admins
        const notifications = adminUsers.map(admin => ({
          recipient_id: admin.user_id,
          title: `🚨 خطأ حرج في النظام`,
          message: `تم تسجيل ${criticalErrors.length} خطأ حرج. يرجى المراجعة فوراً.`,
          type: 'error' as const,
          entity_type: 'error_log',
          entity_id: insertedErrors?.[0]?.id,
        }));

        await supabase.from('notifications').insert(notifications);
      }
    }

    console.log(`Successfully logged ${errorLogs.length} errors for user ${user.id}`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        logged: insertedErrors?.length || 0,
        grouped: errorLogs.length - (insertedErrors?.length || 0)
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (err) {
    console.error('Error in error-tracking function:', err);
    return new Response(
      JSON.stringify({ success: false, error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
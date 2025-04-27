import { serve } from "node:http";
import { createClient } from "npm:@supabase/supabase-js@2.38.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-API-Key",
};

// Rate limiting implementation
const rateLimits = new Map();
const RATE_LIMIT = 100; // requests per minute
const RATE_WINDOW = 60 * 1000; // 1 minute in milliseconds

function rateLimit(ip: string): boolean {
  const now = Date.now();
  const windowStart = now - RATE_WINDOW;
  
  // Clear old entries
  for (const [key, timestamp] of rateLimits.entries()) {
    if (timestamp < windowStart) {
      rateLimits.delete(key);
    }
  }
  
  // Count requests in current window
  let count = 0;
  for (const [key, timestamp] of rateLimits.entries()) {
    if (key.startsWith(ip) && timestamp >= windowStart) {
      count++;
    }
  }
  
  // If under limit, add this request and return true
  if (count < RATE_LIMIT) {
    rateLimits.set(`${ip}:${now}`, now);
    return true;
  }
  
  return false;
}

// API Key validation
async function validateApiKey(req: Request): Promise<{valid: boolean, userId?: string}> {
  try {
    const apiKey = req.headers.get("X-API-Key");
    if (!apiKey) return { valid: false };
    
    // Connect to Supabase
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Check if API key exists and is not revoked
    const { data, error } = await supabase
      .from("api_keys")
      .select("owner_id, expires_at, revoked")
      .eq("key", apiKey)
      .single();
    
    if (error || !data) return { valid: false };
    
    // Check if key is revoked
    if (data.revoked) return { valid: false };
    
    // Check if key is expired
    if (data.expires_at && new Date(data.expires_at) < new Date()) {
      return { valid: false };
    }
    
    // Update last_used_at
    await supabase
      .from("api_keys")
      .update({ last_used_at: new Date().toISOString() })
      .eq("key", apiKey);
    
    return { valid: true, userId: data.owner_id };
  } catch (error) {
    console.error("API key validation error:", error);
    return { valid: false };
  }
}

const handleRequest = async (req: Request): Promise<Response> => {
  // CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders, status: 204 });
  }
  
  // Get client IP for rate limiting
  const clientIp = req.headers.get("x-forwarded-for") || "unknown";
  
  // Check rate limit
  if (!rateLimit(clientIp)) {
    return new Response(
      JSON.stringify({
        error: "Too many requests",
        message: "Rate limit exceeded. Try again later.",
      }),
      {
        status: 429,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  }
  
  // Get requested endpoint
  const url = new URL(req.url);
  const path = url.pathname.replace(/^\/api/, "");
  
  // Validate API key for all non-GET requests
  if (req.method !== "GET") {
    const { valid, userId } = await validateApiKey(req);
    if (!valid) {
      return new Response(
        JSON.stringify({
          error: "Unauthorized",
          message: "Invalid or expired API key",
        }),
        {
          status: 401,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }
    
    // Add userId to request for RLS policies
    // This is a simplified version - in production you'd use Supabase Auth
    (req as any).userId = userId;
  }
  
  try {
    // Connect to Supabase
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Routes
    if (path === "/projects" && req.method === "GET") {
      // List projects - basic example
      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      
      return new Response(
        JSON.stringify(data),
        {
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }
    
    // Default response for unhandled routes
    return new Response(
      JSON.stringify({
        error: "Not Found",
        message: "Endpoint not found",
        availableEndpoints: ["/api/projects"],
      }),
      {
        status: 404,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("API error:", error);
    
    return new Response(
      JSON.stringify({
        error: "Internal Server Error",
        message: "An unexpected error occurred",
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  }
};

serve(handleRequest, { port: 8000 });
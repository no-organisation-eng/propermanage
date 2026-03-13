import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

console.log("Hello from rent_due_reminder_cron function!")

// This function is expected to be triggered by a pg_cron or Supabase Schedule
serve(async (req) => {
    try {

        // 1. Query Tenancies where due_date is within X days (e.g., 3 days) and active = true
        // 2. For each tenancy, fetch tenant's device token
        // 3. Send Push Notification: "Your rent is due on [Date]"
        // 4. Optionally create in-app notification record

        return new Response(
            JSON.stringify({ message: "Rent due reminders evaluated", success: true }),
            { headers: { "Content-Type": "application/json" } },
        )
    } catch (error) {
        return new Response(
            JSON.stringify({ error: error.message }),
            { status: 400, headers: { "Content-Type": "application/json" } },
        )
    }
})

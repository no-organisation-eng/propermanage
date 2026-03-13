import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

console.log("Hello from on_electricity_log_insert function!")

serve(async (req) => {
    try {
        const payload = await req.json()
        console.log("Electricity Log Payload:", payload)

        // 1. Fetch Landlord Device Token
        // 2. Send Push Notification: "Tenant uploaded new electricity bill"

        return new Response(
            JSON.stringify({ message: "Electricity notification logic triggered", success: true }),
            { headers: { "Content-Type": "application/json" } },
        )
    } catch (error) {
        return new Response(
            JSON.stringify({ error: error.message }),
            { status: 400, headers: { "Content-Type": "application/json" } },
        )
    }
})

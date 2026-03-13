// @ts-ignore
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

console.log("Hello from on_announcement_insert function!")

serve(async (req: Request) => {
    try {
        const payload = await req.json()
        console.log("Announcement Payload:", payload)

        // 1. Fetch relevant tenants (either for specific property or all properties)
        // 2. Insert into notifications table
        // 3. Send Bulk Push Notifications via FCM

        return new Response(
            JSON.stringify({ message: "Announcement broadcast logic triggered", success: true }),
            { headers: { "Content-Type": "application/json" } },
        )
    } catch (error: any) {
        return new Response(
            JSON.stringify({ error: error.message }),
            { status: 400, headers: { "Content-Type": "application/json" } },
        )
    }
})

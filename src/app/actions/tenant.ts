'use server'

import { createAdminClient } from "@/lib/supabase/admin"
import { revalidatePath } from "next/cache"

export async function addTenantAction(formData: FormData) {
    const admin = createAdminClient()

    const unitId = formData.get('unit_id') as string
    const formatRedirect = formData.get('redirect_path') as string
    const fullName = formData.get('full_name') as string
    const phone = formData.get('phone') as string
    const rentAmount = formData.get('rent_amount') as string
    const dueDate = formData.get('due_date') as string

    try {
        // 1. Create User in Auth
        // Using phone as pseudo-email or just letting Supabase handle phone auth.
        // For MVP, if phone signup is used, we can create the user with phone + password.
        const { data: authData, error: authError } = await admin.auth.admin.createUser({
            phone: phone,
            password: 'defaultPassword123!', // Tenant can reset this later
            user_metadata: {
                full_name: fullName,
                phone: phone,
                role: 'tenant'
            },
            email_confirm: true,
            phone_confirm: true
        })

        if (authError) {
            console.error("Auth Error:", authError)

            // If user already exists by phone, we might need to fetch them
            // In a real production app, we'd handle the "User already exists" case
            // by fetching the existing user and just creating a new tenancy.
            return { error: authError.message }
        }

        const tenantId = authData.user.id

        // 2. Create Tenancy Record
        const { error: tenancyError } = await admin
            .from('tenancies')
            .insert({
                unit_id: unitId,
                tenant_id: tenantId,
                rent_amount: Number(rentAmount),
                due_date: new Date(dueDate).toISOString(),
                start_date: new Date().toISOString(),
                active: true
            })

        if (tenancyError) {
            console.error("Tenancy Error:", tenancyError)
            return { error: tenancyError.message }
        }

        // 3. Update Unit Status
        await admin.from('units').update({ status: 'occupied' }).eq('id', unitId)

        if (formatRedirect) {
            revalidatePath(formatRedirect)
        }

        return { success: true }

    } catch (err: any) {
        return { error: err.message || "An unexpected error occurred." }
    }
}

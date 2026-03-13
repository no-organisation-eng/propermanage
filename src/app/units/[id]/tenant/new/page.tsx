"use client"

import { useState } from "react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, UserPlus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { addTenantAction } from "@/app/actions/tenant"

export default function AddTenantPage() {
    const params = useParams()
    const unitId = params.id as string
    const router = useRouter()

    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setIsLoading(true)
        setError(null)

        const formData = new FormData(e.currentTarget)
        formData.append('unit_id', unitId)
        formData.append('redirect_path', `/units/${unitId}`)

        try {
            const result = await addTenantAction(formData)
            if (result?.error) {
                setError(result.error)
            } else {
                router.push(`/units/${unitId}`)
            }
        } catch (err: any) {
            setError(err.message || "An error occurred.")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="flex flex-col min-h-screen bg-slate-50 animate-in slide-in-from-right-4 duration-500 pb-20 mesh-gradient font-sans">
            {/* Header */}
            <div className="px-6 py-6 glass flex items-center border-b border-white/40 sticky top-0 z-20">
                <Link href={`/units/${unitId}`} className="p-2 -ml-2 rounded-full hover:bg-slate-100 transition-colors mr-3">
                    <ArrowLeft className="w-5 h-5 text-slate-700" />
                </Link>
                <h1 className="text-xl font-bold tracking-tight text-slate-900">Add Tenant</h1>
            </div>

            <div className="flex-1 p-6 flex flex-col pt-8 space-y-8">
                <div className="flex flex-col items-center text-center">
                    <div className="w-20 h-20 bg-[#115e59]/10 rounded-full flex items-center justify-center mb-4">
                        <UserPlus className="w-8 h-8 text-[#115e59]" />
                    </div>
                    <h2 className="text-2xl font-black text-slate-900 mb-1">Tenant Details</h2>
                    <p className="text-sm text-slate-500 font-medium px-4">
                        We'll securely create their account and assign them to this unit.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6 flex flex-col flex-1">
                    {error && (
                        <div className="p-3 bg-red-50 text-red-600 rounded-xl text-sm border border-red-100 font-bold">
                            {error}
                        </div>
                    )}

                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Full Name</label>
                        <Input
                            name="full_name"
                            placeholder="e.g. Samuel Ojo"
                            className="h-14 bg-white/50 border-slate-200 rounded-2xl focus:bg-white shadow-soft font-bold"
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Phone Number</label>
                        <Input
                            name="phone"
                            type="tel"
                            placeholder="+234 800 000 0000"
                            className="h-14 bg-white/50 border-slate-200 rounded-2xl focus:bg-white shadow-soft font-bold"
                            required
                        />
                        <p className="text-[10px] text-slate-400 font-medium ml-1">Include country code. This acts as their login ID.</p>
                    </div>

                    <div className="space-y-2 pt-2">
                        <h3 className="text-lg font-black text-slate-800">Tenancy Agreement</h3>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Rent Amount (₦)</label>
                        <Input
                            name="rent_amount"
                            type="number"
                            placeholder="350000"
                            className="h-14 bg-white/50 border-slate-200 rounded-2xl focus:bg-white shadow-soft font-bold text-lg"
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Next Due Date</label>
                        <Input
                            name="due_date"
                            type="date"
                            className="h-14 bg-white/50 border-slate-200 rounded-2xl focus:bg-white shadow-soft font-bold"
                            required
                        />
                    </div>

                    <div className="mt-auto pt-8">
                        <Button
                            type="submit"
                            className="w-full text-lg py-7 h-auto rounded-2xl shadow-lg shadow-[#115e59]/20"
                            disabled={isLoading}
                        >
                            {isLoading ? "Creating Tenant..." : "Save Tenant"}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    )
}

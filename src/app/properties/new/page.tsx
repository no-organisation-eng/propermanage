"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowLeft, Building2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { createClient } from "@/lib/supabase/client"
import { MapLocationPicker, LocationData } from "@/components/MapLocationPicker"

export default function AddPropertyPage() {
    const router = useRouter()
    const supabase = createClient()

    const [formData, setFormData] = useState({
        name: "",
        address: "",
        lat: null as number | null,
        lng: null as number | null,
    })

    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const handleAddProperty = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        setError(null)

        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) throw new Error("Not authenticated")

            // In real implementation we would dynamically add units immediately or after
            const { data, error: insertError } = await supabase
                .from('properties')
                .insert([
                    {
                        name: formData.name,
                        address: formData.address,
                        latitude: formData.lat,
                        longitude: formData.lng,
                        owner_id: user.id
                    }
                ])
                .select()

            if (insertError) throw insertError

            router.push(`/properties/${data[0].id}?new=true`)
        } catch (err: any) {
            setError(err.message)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="flex flex-col min-h-screen bg-slate-50 animate-in slide-in-from-right-4 duration-500 pb-20">

            {/* Header */}
            <div className="px-6 py-6 bg-white flex items-center shadow-[0_2px_4px_-2px_rgb(0,0,0,0.02)] sticky top-0 z-20">
                <Link href="/dashboard" className="p-2 -ml-2 rounded-full hover:bg-slate-100 transition-colors mr-3">
                    <ArrowLeft className="w-5 h-5 text-slate-700" />
                </Link>
                <h1 className="text-xl font-bold tracking-tight text-slate-900">Add Property</h1>
            </div>

            <div className="flex-1 p-6 flex flex-col pt-8">

                <div className="w-16 h-16 bg-[#115e59]/10 rounded-[1.2rem] flex items-center justify-center mb-6">
                    <Building2 className="w-8 h-8 text-[#115e59]" />
                </div>

                <h2 className="text-2xl font-bold text-slate-900 mb-2">Property Details</h2>
                <p className="text-sm text-slate-500 mb-8">
                    Enter the basic details of the property. You can add units on the next screen.
                </p>

                <form onSubmit={handleAddProperty} className="space-y-5 flex-1 flex flex-col">
                    {error && (
                        <div className="p-3 bg-red-50 text-red-600 rounded-xl text-sm border border-red-100">
                            {error}
                        </div>
                    )}

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700 ml-1">Property Name</label>
                        <Input
                            placeholder="e.g. Peace Villa"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            required
                            autoFocus
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700 ml-1">Property Location</label>
                        <MapLocationPicker
                            onLocationChange={(loc: LocationData) => setFormData({ ...formData, address: loc.address, lat: loc.lat, lng: loc.lng })}
                            error={!formData.address && error ? "Location is required" : undefined}
                        />
                    </div>

                    <div className="mt-auto pt-6 pb-4">
                        <Button
                            type="submit"
                            className="w-full text-base py-6"
                            disabled={isLoading}
                        >
                            {isLoading ? "Creating..." : "Save & Continue"}
                        </Button>
                    </div>
                </form>

            </div>
        </div>
    )
}

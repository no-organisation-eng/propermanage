"use client"

import { useState } from "react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, DoorOpen } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { createClient } from "@/lib/supabase/client"

export default function AddUnitPage() {
    const params = useParams()
    const propertyId = params.id as string
    const router = useRouter()
    const supabase = createClient()

    const [formData, setFormData] = useState({
        name: "",
        type: "1 Bedroom", // Default
    })

    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const unitTypes = [
        "Selfcon",
        "1 Bedroom",
        "2 Bedroom",
        "3 Bedroom",
        "Flat",
        "Shop",
        "Office Space"
    ]

    const handleAddUnit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        setError(null)

        try {
            const { error: insertError } = await supabase
                .from('units')
                .insert([
                    {
                        property_id: propertyId,
                        unit_name: formData.name,
                        type: formData.type,
                        status: 'vacant' // New units are vacant by default
                    }
                ])

            if (insertError) throw insertError

            router.push(`/properties/${propertyId}`)
        } catch (err: any) {
            setError(err.message)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="flex flex-col min-h-screen bg-slate-50 animate-in slide-in-from-right-4 duration-500 pb-20 mesh-gradient font-sans">

            {/* Header */}
            <div className="px-6 py-6 glass flex items-center border-b border-white/40 sticky top-0 z-20">
                <Link href={`/properties/${propertyId}`} className="p-2 -ml-2 rounded-full hover:bg-slate-100 transition-colors mr-3">
                    <ArrowLeft className="w-5 h-5 text-slate-700" />
                </Link>
                <h1 className="text-xl font-bold tracking-tight text-slate-900">Add Unit</h1>
            </div>

            <div className="flex-1 p-6 flex flex-col pt-8 space-y-8">

                <div className="flex flex-col items-center text-center">
                    <div className="w-20 h-20 bg-white shadow-soft rounded-full flex items-center justify-center mb-4 border border-slate-100">
                        <DoorOpen className="w-10 h-10 text-[#115e59]" />
                    </div>
                    <h2 className="text-2xl font-black text-slate-900 mb-1">Unit Details</h2>
                    <p className="text-sm text-slate-500 font-medium px-4">
                        Add a new rentable space to this property.
                    </p>
                </div>

                <form onSubmit={handleAddUnit} className="space-y-6 flex flex-col flex-1">
                    {error && (
                        <div className="p-3 bg-red-50 text-red-600 rounded-xl text-sm border border-red-100 font-bold">
                            {error}
                        </div>
                    )}

                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Unit Name or Number</label>
                        <Input
                            placeholder="e.g. Unit A1"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="h-14 bg-white/50 border-slate-200 rounded-2xl focus:bg-white shadow-soft text-lg font-bold"
                            required
                            autoFocus
                        />
                    </div>

                    <div className="space-y-3">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Type of Unit</label>
                        <div className="grid grid-cols-2 gap-3">
                            {unitTypes.map((type) => (
                                <button
                                    key={type}
                                    type="button"
                                    onClick={() => setFormData({ ...formData, type })}
                                    className={`py-3 px-4 rounded-xl text-sm font-bold border transition-all ${formData.type === type
                                            ? 'bg-[#115e59] text-white border-[#115e59] shadow-md shadow-[#115e59]/30'
                                            : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300 shadow-sm hover:shadow-soft'
                                        }`}
                                >
                                    {type}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="mt-auto pt-8">
                        <Button
                            type="submit"
                            className="w-full text-lg py-7 h-auto rounded-2xl shadow-lg shadow-[#115e59]/20"
                            disabled={isLoading}
                        >
                            {isLoading ? "Saving Unit..." : "Save Unit"}
                        </Button>
                    </div>
                </form>

            </div>
        </div>
    )
}

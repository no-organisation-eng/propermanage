"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useParams, useRouter, useSearchParams } from "next/navigation"
import { ArrowLeft, MapPin, Plus, DoorOpen, Users, Activity } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"

export default function PropertyDashboardPage() {
    const params = useParams()
    const searchParams = useSearchParams()
    const isNew = searchParams.get("new") === "true"
    const propertyId = params.id as string

    const router = useRouter()
    const supabase = createClient()

    const [property, setProperty] = useState<any>(null)
    const [units, setUnits] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        async function fetchPropertyData() {
            // Fetch Property Details
            const { data: propData } = await supabase
                .from('properties')
                .select('*')
                .eq('id', propertyId)
                .single()

            if (propData) {
                setProperty(propData)
            }

            // Fetch Units
            const { data: unitsData } = await supabase
                .from('units')
                .select(`
                    *,
                    tenancies (
                        id,
                        tenant_id,
                        active,
                        users ( full_name )
                    )
                `)
                .eq('property_id', propertyId)

            if (unitsData) {
                setUnits(unitsData)
            }

            setIsLoading(false)
        }

        fetchPropertyData()
    }, [propertyId, supabase])

    if (isLoading) {
        return <div className="min-h-screen bg-slate-50 flex items-center justify-center">
            <div className="w-10 h-10 border-4 border-[#115e59] border-t-transparent rounded-full animate-spin"></div>
        </div>
    }

    if (!property) {
        return <div className="p-6 text-center mt-20">Property not found.</div>
    }

    const totalUnits = units.length
    const occupiedUnits = units.filter(u => u.status === 'occupied').length
    const vacantUnits = totalUnits - occupiedUnits
    const occupancyRate = totalUnits === 0 ? 0 : Math.round((occupiedUnits / totalUnits) * 100)

    return (
        <div className="flex flex-col min-h-screen bg-slate-50 pb-24 font-sans animate-in fade-in duration-500 mesh-gradient">

            {/* Header */}
            <div className="px-6 py-6 pb-4 glass sticky top-0 z-20 flex justify-between items-center border-b border-white/40">
                <div className="flex items-center">
                    <button onClick={() => router.push(isNew ? '/dashboard' : '/properties')} className="p-2 -ml-2 rounded-full hover:bg-slate-100 transition-colors mr-3">
                        <ArrowLeft className="w-5 h-5 text-slate-700" />
                    </button>
                    <div>
                        <h1 className="text-xl font-extrabold tracking-tight text-slate-900 truncate max-w-[200px]">
                            {property.name}
                        </h1>
                    </div>
                </div>
            </div>

            <div className="flex-1 p-6 space-y-8">

                {isNew && totalUnits === 0 && (
                    <div className="bg-green-50 text-green-800 p-4 rounded-2xl border border-green-100 flex items-start space-x-3 mb-2 shadow-soft">
                        <div className="mt-0.5"><Activity className="w-5 h-5 text-green-600" /></div>
                        <div>
                            <p className="font-bold text-sm">Property Created Successfully!</p>
                            <p className="text-xs mt-1 text-green-700/80">Next step: Add units to this property so you can assign tenants.</p>
                        </div>
                    </div>
                )}

                {/* Location Card */}
                <div className="bg-white/60 backdrop-blur-md rounded-2xl p-4 flex items-start space-x-3 shadow-soft border border-white">
                    <div className="bg-[#115e59]/10 p-2.5 rounded-xl">
                        <MapPin className="w-5 h-5 text-[#115e59]" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-slate-700 leading-snug">{property.address}</p>
                    </div>
                </div>

                {/* Stats Dashboard */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="premium-card !bg-[#115e59] text-white p-5 relative overflow-hidden flex flex-col items-center justify-center text-center col-span-2 !border-none shadow-lg shadow-[#115e59]/20">
                        <div className="absolute right-0 top-0 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
                        <span className="text-3xl font-black mb-1 relative z-10">{occupancyRate}%</span>
                        <span className="text-[10px] uppercase tracking-widest font-bold opacity-80 relative z-10">Occupancy Rate</span>

                        {/* Progress Bar */}
                        <div className="w-full h-2 bg-black/20 rounded-full mt-4 relative z-10 overflow-hidden">
                            <div className="h-full bg-teal-300 rounded-full transition-all duration-1000 ease-out" style={{ width: `${occupancyRate}%` }}></div>
                        </div>
                    </div>

                    <div className="soft-card p-5 flex flex-col items-center text-center justify-center">
                        <span className="text-2xl font-black text-slate-800">{occupiedUnits}</span>
                        <span className="text-[10px] uppercase tracking-widest font-bold text-slate-400 mt-1">Occupied</span>
                    </div>

                    <div className="soft-card p-5 flex flex-col items-center text-center justify-center">
                        <span className="text-2xl font-black text-slate-800">{vacantUnits}</span>
                        <span className="text-[10px] uppercase tracking-widest font-bold text-slate-400 mt-1">Vacant</span>
                    </div>
                </div>

                {/* Units Section */}
                <div>
                    <div className="flex justify-between items-center mb-4 px-1">
                        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Units ({totalUnits})</h3>
                    </div>

                    {units.length === 0 ? (
                        <div className="text-center py-12 px-6 border-2 border-dashed border-slate-200 rounded-[1.5rem] bg-white/50">
                            <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                <DoorOpen className="w-6 h-6 text-slate-400" />
                            </div>
                            <h4 className="text-sm font-bold text-slate-700 mb-1">No units added yet</h4>
                            <p className="text-xs text-slate-500 mb-5">Create your first unit to start managing tenants.</p>
                            <Link href={`/properties/${propertyId}/units/new`}>
                                <Button className="bg-[#115e59] hover:bg-[#0f766e] text-white shadow-brand rounded-[1rem]">
                                    <Plus className="w-4 h-4 mr-2" /> Add Your First Unit
                                </Button>
                            </Link>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {units.map((unit) => {
                                const activeTenancy = unit.tenancies?.find((t: any) => t.active);
                                const tenantName = activeTenancy?.users?.full_name || "No tenant";

                                return (
                                    <Link key={unit.id} href={`/units/${unit.id}`}>
                                        <div className="bg-white rounded-[1.25rem] p-4 shadow-soft border border-slate-100 flex items-center justify-between transition-all hover:-translate-y-0.5 hover:shadow-md mb-3">
                                            <div className="flex items-center space-x-4">
                                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${unit.status === 'occupied' ? 'bg-[#115e59]/10' : 'bg-slate-100'}`}>
                                                    <DoorOpen className={`w-6 h-6 ${unit.status === 'occupied' ? 'text-[#115e59]' : 'text-slate-400'}`} />
                                                </div>
                                                <div>
                                                    <h4 className="font-bold text-slate-900 text-sm">{unit.unit_name}</h4>
                                                    <div className="flex items-center mt-1 space-x-2">
                                                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{unit.type}</span>
                                                        <span className="w-1 h-1 bg-slate-200 rounded-full"></span>
                                                        <span className="text-xs text-slate-500 line-clamp-1">{tenantName}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex flex-col items-end">
                                                <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${unit.status === 'occupied' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'}`}>
                                                    {unit.status}
                                                </span>
                                            </div>
                                        </div>
                                    </Link>
                                )
                            })}
                        </div>
                    )}
                </div>

            </div>

            {/* Floating Add Action (if units exist) */}
            {totalUnits > 0 && (
                <div className="fixed bottom-24 right-6 z-30">
                    <Link href={`/properties/${propertyId}/units/new`}>
                        <button className="w-14 h-14 bg-[#115e59] text-white rounded-full flex items-center justify-center shadow-float hover:scale-105 transition-transform active:scale-95">
                            <Plus className="w-6 h-6" />
                        </button>
                    </Link>
                </div>
            )}
        </div>
    )
}

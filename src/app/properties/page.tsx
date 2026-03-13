"use client"

import Link from "next/link"
import { ArrowLeft, Building2, MapPin, Plus } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"

export default function PropertiesPage() {
    const supabase = createClient()
    const [properties, setProperties] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        async function fetchProperties() {
            const { data: { user } } = await supabase.auth.getUser()

            if (user) {
                // Fetch properties with nested units to calculate stats
                const { data, error } = await supabase
                    .from('properties')
                    .select('id, name, address, units(id, status)')
                    .eq('owner_id', user.id)
                    .order('created_at', { ascending: false })

                if (data && !error) {
                    const formattedProps = data.map((prop: any) => {
                        const totalUnits = prop.units ? prop.units.length : 0
                        const occupied = prop.units ? prop.units.filter((u: any) => u.status === 'occupied').length : 0
                        const vacant = totalUnits - occupied
                        const occupancyRate = totalUnits > 0 ? Math.round((occupied / totalUnits) * 100) : 0

                        return {
                            id: prop.id,
                            name: prop.name,
                            address: prop.address,
                            units: totalUnits,
                            occupied: occupied,
                            vacant: vacant,
                            occupancyRate: occupancyRate,
                        }
                    })
                    setProperties(formattedProps)
                }
                setIsLoading(false)
            }
        }
        fetchProperties()
    }, [])
    return (
        <div className="flex flex-col min-h-screen pb-20 bg-slate-50 animate-in fade-in duration-500">

            {/* Header */}
            <div className="px-6 py-6 bg-white flex justify-between items-center shadow-[0_2px_4px_-2px_rgb(0,0,0,0.02)] sticky top-0 z-20">
                <div className="flex items-center space-x-3">
                    <Link href="/dashboard" className="p-2 -ml-2 rounded-full hover:bg-slate-100 transition-colors">
                        <ArrowLeft className="w-5 h-5 text-slate-700" />
                    </Link>
                    <h1 className="text-xl font-bold tracking-tight text-slate-900">Properties</h1>
                </div>
                <Link href="/properties/new">
                    <Button className="h-9 px-3 rounded-full shadow-none text-xs">
                        <Plus className="w-4 h-4 mr-1" /> Add
                    </Button>
                </Link>
            </div>

            <div className="flex-1 p-6 space-y-6">

                {/* Properties List */}
                <div className="space-y-4">
                    {isLoading ? (
                        <div className="p-10 text-center text-slate-500 text-sm animate-pulse">
                            Loading properties...
                        </div>
                    ) : properties.length === 0 ? (
                        <div className="p-10 text-center flex flex-col items-center bg-white rounded-2xl shadow-sm">
                            <Building2 className="w-10 h-10 text-slate-300 mb-3" />
                            <h3 className="font-semibold text-slate-800">No properties yet</h3>
                            <p className="text-sm text-slate-500 mb-4">Add your first property to get started.</p>
                            <Link href="/properties/new">
                                <Button className="rounded-full">Add Property</Button>
                            </Link>
                        </div>
                    ) : (
                        properties.map((property) => (
                            <Link href={`/properties/${property.id}`} key={property.id} className="block group">
                                <Card className="border-0 shadow-soft bg-white hover:border-[#115e59] transition-colors border border-transparent">
                                    <CardContent className="p-5">
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="flex items-center space-x-3">
                                                <div className="w-12 h-12 rounded-[0.8rem] bg-[#115e59]/10 flex items-center justify-center">
                                                    <Building2 className="w-6 h-6 text-[#115e59]" />
                                                </div>
                                                <div>
                                                    <h3 className="font-semibold text-slate-900">{property.name}</h3>
                                                    <p className="text-xs text-slate-500 flex items-center mt-0.5">
                                                        <MapPin className="w-3 h-3 mr-1" />
                                                        {property.address}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between text-sm mb-2">
                                            <span className="text-slate-500">{property.units} Units Total</span>
                                            <span className="font-medium text-[#115e59]">{property.occupancyRate}% Occupancy</span>
                                        </div>

                                        {/* Progress Bar (Savings Goal Style) */}
                                        <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden flex">
                                            <div
                                                className="bg-[#115e59] h-full rounded-full transition-all duration-1000 ease-out"
                                                style={{ width: `${property.occupancyRate}%` }}
                                            />
                                        </div>

                                        <div className="flex justify-between mt-3 text-xs font-medium">
                                            <div className="flex items-center text-slate-700">
                                                <div className="w-2 h-2 rounded-full bg-[#115e59] mr-1.5" />
                                                {property.occupied} Occupied
                                            </div>
                                            <div className="flex items-center text-slate-500">
                                                <div className="w-2 h-2 rounded-full bg-slate-300 mr-1.5" />
                                                {property.vacant} Vacant
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </Link>
                        ))
                    )}
                </div>

            </div>
        </div>
    )
}

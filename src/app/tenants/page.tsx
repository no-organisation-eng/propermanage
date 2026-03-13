"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { ArrowLeft, User, DoorOpen, MapPin, Search } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { Input } from "@/components/ui/input"

export default function TenantsPage() {
    const supabase = createClient()
    const [tenancies, setTenancies] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState("")

    useEffect(() => {
        async function fetchTenants() {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return

            // We need to get all tenancies for units owned by this landlord
            const { data, error } = await supabase
                .from('tenancies')
                .select(`
                    id, active, rent_amount, due_date,
                    users ( id, full_name, phone ),
                    units ( 
                        id, unit_name, type,
                        properties ( name, address )
                    )
                `)
                .eq('active', true)
                .order('created_at', { ascending: false })

            // Filtering by landlord is implicitly handled by RLS, 
            // but just to be sure we fetched data successfully:
            if (!error && data) {
                setTenancies(data)
            }
            setIsLoading(false)
        }

        fetchTenants()
    }, [supabase])

    const filteredTenancies = tenancies.filter(t =>
        t.users?.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.units?.unit_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.units?.properties?.name?.toLowerCase().includes(searchQuery.toLowerCase())
    )

    return (
        <div className="flex flex-col min-h-screen bg-slate-50 font-sans pb-24 animate-in fade-in duration-500 mesh-gradient">

            {/* Header */}
            <div className="px-6 py-8 pb-6 glass flex items-center border-b border-white/40 sticky top-0 z-20">
                <Link href="/dashboard" className="p-2 -ml-2 rounded-full hover:bg-slate-100 transition-colors mr-3">
                    <ArrowLeft className="w-5 h-5 text-slate-700" />
                </Link>
                <div>
                    <h1 className="text-xl font-extrabold tracking-tight text-slate-900">Tenants</h1>
                    <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-0.5">
                        {tenancies.length} Active {tenancies.length === 1 ? 'Tenant' : 'Tenants'}
                    </p>
                </div>
            </div>

            <div className="flex-1 p-6 space-y-6">

                <div className="relative">
                    <Search className="absolute left-4 top-4 w-5 h-5 text-slate-400" />
                    <Input
                        placeholder="Search by name, unit, or property..."
                        className="pl-12 h-14 bg-white/70 backdrop-blur-md border-white shadow-soft rounded-2xl focus:bg-white text-base font-medium"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                {isLoading ? (
                    <div className="flex justify-center py-20">
                        <div className="w-8 h-8 border-4 border-[#115e59] border-t-transparent rounded-full animate-spin"></div>
                    </div>
                ) : filteredTenancies.length === 0 ? (
                    <div className="text-center py-16 px-6 bg-white/50 border-2 border-dashed border-slate-200 rounded-[1.5rem]">
                        <div className="w-16 h-16 bg-[#115e59]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                            <User className="w-8 h-8 text-[#115e59]" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-800 mb-2">No tenants found</h3>
                        <p className="text-sm text-slate-500 leading-relaxed font-medium">
                            {searchQuery ? "Try adjusting your search criteria." : "You haven't added any tenants yet. Go to a vacant unit to add one."}
                        </p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {filteredTenancies.map((tenancy) => {
                            const isRentDue = new Date(tenancy.due_date) < new Date()

                            return (
                                <Link key={tenancy.id} href={`/units/${tenancy.units?.id}`}>
                                    <div className="premium-card bg-white p-5 hover:border-[#115e59]/30 transition-all border-transparent">
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="flex items-center space-x-3">
                                                <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center border border-slate-200">
                                                    <span className="text-lg font-black text-slate-700">
                                                        {tenancy.users?.full_name?.charAt(0) || <User className="w-5 h-5" />}
                                                    </span>
                                                </div>
                                                <div>
                                                    <h3 className="font-bold text-slate-900 text-base">{tenancy.users?.full_name}</h3>
                                                    <p className="text-xs text-slate-500 font-medium">{tenancy.users?.phone}</p>
                                                </div>
                                            </div>

                                            {isRentDue && (
                                                <span className="bg-red-50 text-red-600 text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-md border border-red-100">
                                                    Rent Due
                                                </span>
                                            )}
                                        </div>

                                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 mt-2">
                                            <div className="flex items-center text-[10px] font-black uppercase tracking-widest text-[#115e59] mb-2">
                                                <MapPin className="w-3.5 h-3.5 mr-1.5 opacity-70" />
                                                <span className="line-clamp-1">{tenancy.units?.properties?.name}</span>
                                            </div>
                                            <div className="flex justify-between items-center text-xs font-bold text-slate-700">
                                                <span className="flex items-center"><DoorOpen className="w-3.5 h-3.5 mr-1.5 text-slate-400" /> {tenancy.units?.unit_name}</span>
                                                <div className="flex flex-col items-end">
                                                    <span className="text-slate-900">₦{Number(tenancy.rent_amount).toLocaleString()}</span>
                                                    <span className="text-[9px] text-slate-400 uppercase tracking-tighter">Per Year</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            )
                        })}
                    </div>
                )}
            </div>
        </div>
    )
}

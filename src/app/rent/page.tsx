"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { ArrowLeft, Wallet, CheckCircle2, AlertCircle, Search, DollarSign } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

export default function RentTrackingPage() {
    const supabase = createClient()
    const [tenancies, setTenancies] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState("")
    const [isMarkingPaid, setIsMarkingPaid] = useState<string | null>(null)

    useEffect(() => {
        fetchRentData()
    }, [])

    async function fetchRentData() {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        const { data, error } = await supabase
            .from('tenancies')
            .select(`
                id, rent_amount, due_date, active,
                users ( full_name, phone ),
                units ( 
                    unit_name, 
                    properties ( name )
                )
            `)
            .eq('active', true)
            .order('due_date', { ascending: true })

        if (!error && data) {
            setTenancies(data)
        }
        setIsLoading(false)
    }

    const handleMarkPaid = async (tenancyId: string, amount: number, currentDueDate: string) => {
        setIsMarkingPaid(tenancyId)
        try {
            // 1. Insert payment record
            const { error: paymentError } = await supabase
                .from('payments')
                .insert({
                    tenancy_id: tenancyId,
                    amount: amount
                })

            if (paymentError) throw paymentError

            // 2. Extend due date by 1 year (MVP assumes yearly rent)
            const date = new Date(currentDueDate)
            date.setFullYear(date.getFullYear() + 1)
            const newDueDate = date.toISOString()

            const { error: updateError } = await supabase
                .from('tenancies')
                .update({ due_date: newDueDate })
                .eq('id', tenancyId)

            if (updateError) throw updateError

            // Refresh data
            await fetchRentData()
        } catch (error) {
            console.error("Error marking rent paid:", error)
            alert("Failed to mark rent as paid.")
        } finally {
            setIsMarkingPaid(null)
        }
    }

    const filteredTenancies = tenancies.filter(t =>
        t.users?.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.units?.unit_name?.toLowerCase().includes(searchQuery.toLowerCase())
    )

    const overdueTenancies = filteredTenancies.filter(t => new Date(t.due_date) < new Date())
    const upcomingTenancies = filteredTenancies.filter(t => new Date(t.due_date) >= new Date())

    return (
        <div className="flex flex-col min-h-screen bg-slate-50 font-sans pb-24 animate-in fade-in duration-500 mesh-gradient">
            {/* Header */}
            <div className="px-6 py-8 pb-6 glass flex justify-between items-center border-b border-white/40 sticky top-0 z-20">
                <div className="flex items-center">
                    <Link href="/dashboard" className="p-2 -ml-2 rounded-full hover:bg-slate-100 transition-colors mr-3">
                        <ArrowLeft className="w-5 h-5 text-slate-700" />
                    </Link>
                    <div>
                        <h1 className="text-xl font-extrabold tracking-tight text-slate-900">Rent Tracking</h1>
                        <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-0.5">
                            {overdueTenancies.length} Overdue
                        </p>
                    </div>
                </div>
            </div>

            <div className="flex-1 p-6 space-y-6">
                <div className="relative">
                    <Search className="absolute left-4 top-4 w-5 h-5 text-slate-400" />
                    <Input
                        placeholder="Search tenant or unit..."
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
                        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Wallet className="w-8 h-8 text-slate-400" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-800 mb-2">No rent records</h3>
                        <p className="text-sm text-slate-500 leading-relaxed font-medium">
                            Add tenants to units to start tracking their rent payments here.
                        </p>
                    </div>
                ) : (
                    <div className="space-y-8">
                        {/* Overdue Section */}
                        {overdueTenancies.length > 0 && (
                            <div className="space-y-4">
                                <h3 className="text-[10px] font-black tracking-widest uppercase text-red-500 flex items-center mb-2 px-1">
                                    <AlertCircle className="w-3.5 h-3.5 mr-1" /> Overdue Rent
                                </h3>
                                {overdueTenancies.map(t => (
                                    <RentCard
                                        key={t.id}
                                        tenancy={t}
                                        isOverdue={true}
                                        isLoading={isMarkingPaid === t.id}
                                        onMarkPaid={() => handleMarkPaid(t.id, t.rent_amount, t.due_date)}
                                    />
                                ))}
                            </div>
                        )}

                        {/* Upcoming Section */}
                        {upcomingTenancies.length > 0 && (
                            <div className="space-y-4">
                                <h3 className="text-[10px] font-black tracking-widest uppercase text-slate-400 flex items-center mb-2 px-1">
                                    <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Up to Date / Upcoming
                                </h3>
                                {upcomingTenancies.map(t => (
                                    <RentCard
                                        key={t.id}
                                        tenancy={t}
                                        isOverdue={false}
                                        isLoading={isMarkingPaid === t.id}
                                        onMarkPaid={() => handleMarkPaid(t.id, t.rent_amount, t.due_date)}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}

function RentCard({ tenancy, isOverdue, isLoading, onMarkPaid }: any) {
    return (
        <div className={`premium-card bg-white p-5 border relative overflow-hidden transition-all ${isOverdue ? 'border-red-100 shadow-red-500/5' : 'border-slate-100 shadow-soft'}`}>
            {isOverdue && <div className="absolute top-0 left-0 w-1 h-full bg-red-400"></div>}

            <div className="flex justify-between items-start mb-4">
                <div>
                    <h3 className="font-bold text-slate-900 text-base leading-tight mb-1">{tenancy.users?.full_name}</h3>
                    <p className="text-xs font-bold text-slate-400">{tenancy.units?.properties?.name} • {tenancy.units?.unit_name}</p>
                </div>
                <div className="text-right">
                    <p className="text-lg font-black text-slate-800">₦{Number(tenancy.rent_amount).toLocaleString()}</p>
                    <p className={`text-[9px] font-bold tracking-widest uppercase mt-1 ${isOverdue ? 'text-red-500' : 'text-slate-400'}`}>
                        Due: {new Date(tenancy.due_date).toLocaleDateString()}
                    </p>
                </div>
            </div>

            <Button
                onClick={onMarkPaid}
                disabled={isLoading}
                className={`w-full py-5 rounded-xl font-bold text-sm transition-all ${isOverdue ? 'bg-red-50 text-red-600 hover:bg-red-100 shadow-none border border-red-100' : 'bg-slate-50 text-slate-600 hover:bg-slate-100 shadow-none border border-slate-100'}`}
            >
                {isLoading ? (
                    <span className="flex items-center"><div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2"></div> Processing...</span>
                ) : (
                    <span className="flex items-center"><DollarSign className="w-4 h-4 mr-1" /> Check In Payment</span>
                )}
            </Button>
        </div>
    )
}

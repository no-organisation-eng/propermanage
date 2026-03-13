"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, User, Wallet, FileText, CheckCircle2, AlertCircle, Plus } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"

export default function UnitDetailsPage() {
    const params = useParams()
    const unitId = params.id as string
    const router = useRouter()
    const supabase = createClient()

    const [unit, setUnit] = useState<any>(null)
    const [tenancy, setTenancy] = useState<any>(null)
    const [payments, setPayments] = useState<any[]>([])
    const [electricityLogs, setElectricityLogs] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        async function fetchUnitDetails() {
            // Fetch Unit + Active Tenancy
            const { data: unitData } = await supabase
                .from('units')
                .select(`
                    *,
                    properties (id, name),
                    tenancies (
                        id, tenant_id, rent_amount, due_date, start_date, active,
                        users (full_name, phone)
                    )
                `)
                .eq('id', unitId)
                .single()

            if (unitData) {
                setUnit(unitData)
                const active = unitData.tenancies?.find((t: any) => t.active)
                if (active) {
                    setTenancy(active)

                    // Fetch Payments for this tenancy
                    const { data: paymentsData } = await supabase
                        .from('payments')
                        .select('*')
                        .eq('tenancy_id', active.id)
                        .order('paid_at', { ascending: false })
                        .limit(3)
                    if (paymentsData) setPayments(paymentsData)

                    // Fetch Electricity logs
                    const { data: elecData } = await supabase
                        .from('electricity_logs')
                        .select('*')
                        .eq('unit_id', unitId)
                        .order('created_at', { ascending: false })
                        .limit(3)
                    if (elecData) setElectricityLogs(elecData)
                }
            }
            setIsLoading(false)
        }

        fetchUnitDetails()
    }, [unitId, supabase])

    if (isLoading) {
        return <div className="min-h-screen bg-slate-50 flex items-center justify-center">
            <div className="w-10 h-10 border-4 border-[#115e59] border-t-transparent rounded-full animate-spin"></div>
        </div>
    }

    if (!unit) {
        return <div className="p-6 text-center mt-20">Unit not found.</div>
    }

    const isVacant = unit.status === 'vacant' || !tenancy

    const isRentDue = tenancy
        ? new Date(tenancy.due_date) < new Date()
        : false

    return (
        <div className="flex flex-col min-h-screen bg-slate-50 pb-24 font-sans animate-in fade-in duration-500 mesh-gradient">

            {/* Header */}
            <div className="px-6 py-6 pb-4 glass sticky top-0 z-20 flex justify-between items-center border-b border-white/40">
                <div className="flex items-center">
                    <button onClick={() => router.push(`/properties/${unit.property_id}`)} className="p-2 -ml-2 rounded-full hover:bg-slate-100 transition-colors mr-3">
                        <ArrowLeft className="w-5 h-5 text-slate-700" />
                    </button>
                    <div>
                        <h1 className="text-xl font-extrabold tracking-tight text-slate-900 truncate max-w-[200px]">
                            {unit.unit_name}
                        </h1>
                        <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">{unit.type}</p>
                    </div>
                </div>
                <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border ${unit.status === 'occupied'
                        ? 'bg-green-50 text-green-700 border-green-200'
                        : 'bg-slate-100 text-slate-600 border-slate-200'
                    }`}>
                    {unit.status}
                </span>
            </div>

            <div className="flex-1 p-6 space-y-8">

                {isVacant ? (
                    <div className="premium-card bg-[#115e59] text-white p-8 relative overflow-hidden shadow-lg shadow-[#115e59]/20 flex flex-col items-center text-center">
                        <div className="absolute -right-4 -top-8 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
                        <div className="absolute -left-4 -bottom-8 w-32 h-32 bg-teal-400/10 rounded-full blur-2xl"></div>

                        <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mb-4 relative z-10 backdrop-blur-md border border-white/20">
                            <User className="w-8 h-8 text-white" />
                        </div>
                        <h2 className="text-2xl font-black mb-2 tracking-tight relative z-10">Unit is Vacant</h2>
                        <p className="text-sm font-medium text-teal-100 mb-6 relative z-10">Assign a tenant to this unit to start tracking rent and bills automatically.</p>

                        <Link href={`/units/${unit.id}/tenant/new`} className="relative z-10 w-full">
                            <button className="w-full bg-white text-[#115e59] font-black rounded-2xl py-4 hover:bg-slate-50 transition-colors shadow-lg shadow-black/10">
                                Add Tenant
                            </button>
                        </Link>
                    </div>
                ) : (
                    <>
                        {/* Occupied Tenant Info Card */}
                        <div className="soft-card p-5">
                            <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Current Tenant</h3>
                            <div className="flex items-center space-x-4">
                                <div className="w-12 h-12 bg-[#115e59]/10 rounded-full flex items-center justify-center">
                                    <User className="w-6 h-6 text-[#115e59]" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-slate-900">{tenancy.users?.full_name}</h4>
                                    <p className="text-sm text-slate-500">{tenancy.users?.phone}</p>
                                </div>
                            </div>
                        </div>

                        {/* Rent Info */}
                        <div className="premium-card bg-white p-6 border-0 shadow-lg shadow-slate-200/50">
                            <div className="flex justify-between items-end mb-6">
                                <div>
                                    <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Expected Rent</h3>
                                    <p className="text-3xl font-black text-slate-800">₦{Number(tenancy.rent_amount).toLocaleString()}</p>
                                </div>
                                <div className={`flex items-center space-x-1 ${isRentDue ? 'text-red-500' : 'text-slate-500'}`}>
                                    {isRentDue ? <AlertCircle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
                                    <span className="text-xs font-bold uppercase tracking-widest">
                                        {isRentDue ? 'Overdue' : 'Due ' + new Date(tenancy.due_date).toLocaleDateString()}
                                    </span>
                                </div>
                            </div>

                            <Button className="w-full h-12 text-base font-bold bg-[#115e59] hover:bg-[#0f766e] shadow-brand rounded-2xl">
                                Mark Rent as Paid
                            </Button>
                        </div>

                        {/* Recent History grid */}
                        <div className="grid grid-cols-2 gap-4">
                            {/* Payments */}
                            <div className="soft-card p-4">
                                <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center"><Wallet className="w-3 h-3 justify-center mr-1" /> Payments</h3>
                                {payments.length === 0 ? (
                                    <p className="text-xs text-slate-400 font-medium">No history</p>
                                ) : (
                                    <div className="space-y-3">
                                        {payments.map(p => (
                                            <div key={p.id} className="flex justify-between items-center text-sm">
                                                <span className="font-bold text-green-700">₦{Number(p.amount).toLocaleString()}</span>
                                                <span className="text-[10px] text-slate-400 font-bold uppercase">{new Date(p.created_at).toLocaleDateString()}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Electricity */}
                            <div className="soft-card p-4">
                                <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center"><FileText className="w-3 h-3 justify-center mr-1" /> Power Bills</h3>
                                {electricityLogs.length === 0 ? (
                                    <p className="text-xs text-slate-400 font-medium">No recent bills</p>
                                ) : (
                                    <div className="space-y-3">
                                        {electricityLogs.map(l => (
                                            <div key={l.id} className="flex flex-col text-sm border-b border-slate-50 pb-2 last:border-0 last:pb-0">
                                                <span className="font-bold text-slate-800">₦{Number(l.amount).toLocaleString()}</span>
                                                <span className={`text-[10px] font-bold uppercase ${l.status === 'approved' ? 'text-green-500' : 'text-amber-500'}`}>{l.status}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Quick Action: Mark Vacant */}
                        <div className="mt-8 text-center border-t border-slate-200/60 pt-6">
                            <button className="text-xs font-bold text-red-500 uppercase tracking-widest hover:text-red-700 transition-colors">
                                End Tenancy & Mark Vacant
                            </button>
                        </div>
                    </>
                )}

            </div>
        </div>
    )
}

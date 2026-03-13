"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Home, Zap, AlertCircle, FileText, CheckCircle2, Bell } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"

export default function TenantDashboard() {
    const supabase = createClient()
    const router = useRouter()

    const [tenancy, setTenancy] = useState<any>(null)
    const [electricityLogs, setElectricityLogs] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        async function fetchTenantData() {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) {
                router.push('/login')
                return
            }

            // Fetch Active Tenancy
            const { data: tenancyData, error } = await supabase
                .from('tenancies')
                .select(`
                    *,
                    units (
                        unit_name, type,
                        properties ( name, address )
                    )
                `)
                .eq('tenant_id', user.id)
                .eq('active', true)
                .single()

            if (tenancyData) {
                setTenancy(tenancyData)

                // Fetch recent electricity logs
                const { data: elecs } = await supabase
                    .from('electricity_logs')
                    .select('*')
                    .eq('unit_id', tenancyData.unit_id)
                    .order('created_at', { ascending: false })
                    .limit(5)

                if (elecs) setElectricityLogs(elecs)
            }

            setIsLoading(false)
        }

        fetchTenantData()
    }, [router, supabase])

    if (isLoading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="w-10 h-10 border-4 border-[#115e59] border-t-transparent rounded-full animate-spin"></div>
            </div>
        )
    }

    if (!tenancy) {
        return (
            <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
                <div className="w-20 h-20 bg-slate-200 rounded-full flex items-center justify-center mb-6">
                    <Home className="w-8 h-8 text-slate-400" />
                </div>
                <h1 className="text-2xl font-black text-slate-800 mb-2">No Active Tenancy</h1>
                <p className="text-slate-500 font-medium">You have not been assigned to any property unit by a landlord yet. Please contact your landlord.</p>
                <Button onClick={async () => { await supabase.auth.signOut(); router.push('/login') }} className="mt-8 bg-slate-800 hover:bg-slate-700 rounded-full px-8">
                    Log out
                </Button>
            </div>
        )
    }

    const isRentDue = new Date(tenancy.due_date) < new Date()

    return (
        <div className="flex flex-col min-h-screen bg-slate-50 font-sans pb-24 animate-in fade-in duration-500 mesh-gradient">
            {/* Header */}
            <div className="px-6 py-8 pb-10 glass sticky top-0 z-20 border-b border-white/40">
                <div className="flex justify-between items-start">
                    <div>
                        <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 mb-1">
                            {tenancy.units?.properties?.name}
                        </h1>
                        <p className="text-sm text-slate-500 font-bold uppercase tracking-widest flex items-center">
                            <Home className="w-4 h-4 mr-1.5" /> {tenancy.units?.unit_name}
                        </p>
                    </div>
                </div>
            </div>

            <div className="flex-1 p-6 space-y-8 -mt-6">

                {/* Rent Status Card */}
                <div className="premium-card !bg-[#115e59] text-white p-6 relative overflow-hidden flex flex-col items-center text-center !border-none shadow-lg shadow-[#115e59]/30 z-30 transform hover:-translate-y-1 transition-transform">
                    <div className="absolute right-0 top-0 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
                    <div className="absolute -left-10 -bottom-10 w-40 h-40 bg-teal-400/20 rounded-full blur-3xl"></div>

                    <h3 className="text-[10px] font-bold text-teal-100 uppercase tracking-widest mb-2 relative z-10">Current Rent Status</h3>

                    <div className="flex items-center justify-center space-x-2 mb-4 relative z-10">
                        {isRentDue ? (
                            <span className="bg-red-500/20 border border-red-500 text-red-100 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full flex items-center">
                                <AlertCircle className="w-3 h-3 justify-center mr-1.5" /> Overdue
                            </span>
                        ) : (
                            <span className="bg-green-400/20 border border-green-400 text-green-100 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full flex items-center">
                                <CheckCircle2 className="w-3 h-3 justify-center mr-1.5" /> Up to date
                            </span>
                        )}
                    </div>

                    <h2 className="text-4xl font-black relative z-10 tracking-tight">₦{Number(tenancy.rent_amount).toLocaleString()}</h2>
                    <p className="text-xs font-medium text-teal-200 mt-2 relative z-10">Due entirely on {new Date(tenancy.due_date).toLocaleDateString()}</p>
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-2 gap-4">
                    <Link href="/tenant/electricity/new">
                        <div className="soft-card p-5 flex flex-col items-center justify-center text-center cursor-pointer hover:border-[#115e59]/20 group h-full transition-all hover:shadow-md">
                            <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                                <Zap className="w-6 h-6" />
                            </div>
                            <span className="text-sm font-bold text-slate-800">Log Power Bill</span>
                        </div>
                    </Link>

                    <Link href="/tenant/announcements">
                        <div className="soft-card p-5 flex flex-col items-center justify-center text-center cursor-pointer hover:border-[#115e59]/20 group h-full transition-all hover:shadow-md">
                            <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                                <Bell className="w-6 h-6" />
                            </div>
                            <span className="text-sm font-bold text-slate-800">Notices</span>
                        </div>
                    </Link>
                </div>

                {/* Recent Electricity Logs */}
                <div className="space-y-4">
                    <div className="flex justify-between items-center px-1">
                        <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest">Recent Power Bills</h3>
                        <Link href="/tenant/bills" className="text-[10px] font-black uppercase tracking-widest text-[#115e59] hover:underline">
                            View All
                        </Link>
                    </div>

                    {electricityLogs.length === 0 ? (
                        <div className="soft-card p-8 text-center bg-white/50 border-dashed border-2">
                            <Zap className="w-6 h-6 text-slate-300 mx-auto mb-2" />
                            <p className="text-xs font-semibold text-slate-500">No power bills logged yet.</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {electricityLogs.map((log) => (
                                <div key={log.id} className="premium-card bg-white p-4 flex items-center justify-between transition-all hover:-translate-y-0.5 border-transparent hover:border-[#115e59]/10">
                                    <div className="flex items-center space-x-4">
                                        <div className="w-10 h-10 bg-amber-50 rounded-full flex items-center justify-center">
                                            <Zap className="w-5 h-5 text-amber-500" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-slate-900 text-base">₦{Number(log.amount).toLocaleString()}</h4>
                                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">{new Date(log.created_at).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                    <div>
                                        <span className={`text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded border ${log.status === 'approved'
                                            ? 'bg-green-50 text-green-600 border-green-100'
                                            : log.status === 'rejected'
                                                ? 'bg-red-50 text-red-600 border-red-100'
                                                : 'bg-amber-50 text-amber-600 border-amber-100'
                                            }`}>
                                            {log.status}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

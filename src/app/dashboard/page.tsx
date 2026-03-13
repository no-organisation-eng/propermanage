"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { PlusCircle, Megaphone, Users, LayoutDashboard, Wallet, Bell, Activity } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { createClient } from "@/lib/supabase/client"
export default function DashboardPage() {
    const supabase = createClient()
    const [userName, setUserName] = useState("Landlord")
    const [userId, setUserId] = useState<string | null>(null)
    const [summary, setSummary] = useState({
        totalExpectedRent: 0,
        totalUnits: 0,
        occupiedUnits: 0,
        vacantUnits: 0,
    })
    const [hasProperties, setHasProperties] = useState(true)
    const [activities, setActivities] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        async function fetchDashboardData() {
            const { data: { user } } = await supabase.auth.getUser()
            if (user) {
                if (user.user_metadata?.full_name) {
                    setUserName(user.user_metadata.full_name.split(' ')[0])
                }
                setUserId(user.id)

                // Fetch summary from view
                const { data: summaryData, error } = await supabase
                    .from('landlord_dashboard_summary')
                    .select('*')
                    .eq('owner_id', user.id)

                if (!error && summaryData) {
                    if (summaryData.length === 0) {
                        setHasProperties(false)
                    } else {
                        setHasProperties(true)
                        const totalRent = summaryData.reduce((acc, curr) => acc + Number(curr.expected_rent), 0)
                        const totalUnits = summaryData.reduce((acc, curr) => acc + Number(curr.total_units), 0)
                        const occupiedUnits = summaryData.reduce((acc, curr) => acc + Number(curr.occupied_units), 0)
                        const vacantUnits = summaryData.reduce((acc, curr) => acc + Number(curr.vacant_units), 0)

                        setSummary({
                            totalExpectedRent: totalRent,
                            totalUnits: totalUnits,
                            occupiedUnits: occupiedUnits,
                            vacantUnits: vacantUnits
                        })
                    }
                }

                setIsLoading(false)
            }
        }
        fetchDashboardData()
    }, [])

    useEffect(() => {
        if (!userId) return

        const fetchActivities = async () => {
            // Fetch recent payments via rls
            const { data: payments } = await supabase
                .from('payments')
                .select('id, amount, created_at, tenancies(users(full_name), units(unit_name))')
                .order('created_at', { ascending: false })
                .limit(5)

            // Fetch electricity logs via rls
            const { data: elecs } = await supabase
                .from('electricity_logs')
                .select('id, amount, created_at, units(unit_name)')
                .order('created_at', { ascending: false })
                .limit(5)

            const { data: announcements } = await supabase
                .from('announcements')
                .select('id, message, created_at')
                .order('created_at', { ascending: false })
                .limit(5)

            const combined = [
                ...(payments || []).map((p: any) => ({
                    id: `pay_${p.id}`,
                    message: `${p.tenancies?.users?.full_name || 'A tenant'} paid ₦${Number(p.amount).toLocaleString()}`,
                    created_at: p.created_at
                })),
                ...(elecs || []).map((e: any) => ({
                    id: `elec_${e.id}`,
                    message: `New electricity bill of ₦${Number(e.amount).toLocaleString()} logged`,
                    created_at: e.created_at
                })),
                ...(announcements || []).map((a: any) => ({
                    id: `ann_${a.id}`,
                    message: `You broadcasted an announcement`,
                    created_at: a.created_at
                }))
            ]

            combined.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
            setActivities(combined.slice(0, 5))
        }
        fetchActivities()

        // Realtime Subscription for updates
        const channel = supabase.channel('dashboard_updates')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'units' }, () => {
                fetchActivities()
            })
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'payments' }, () => {
                fetchActivities()
            })
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'electricity_logs' }, () => {
                fetchActivities()
            })
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [userId])

    return (
        <div className="flex flex-col min-h-screen pb-32 bg-slate-50 animate-in fade-in duration-500 font-sans mesh-gradient">

            {/* Header */}
            <div className="px-6 py-8 pb-6 glass flex justify-between items-center z-10 sticky top-0 border-b border-white/40">
                <div>
                    <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">Hello, {userName}</h1>
                    <p className="text-sm text-slate-500 font-medium tracking-tight">Welcome to your property bank</p>
                </div>
                <div className="relative">
                    <div className="w-11 h-11 bg-white shadow-soft rounded-full flex items-center justify-center border border-slate-100">
                        <Bell className="w-5 h-5 text-slate-600" />
                    </div>
                    <span className="absolute top-0.5 right-0.5 w-3.5 h-3.5 bg-red-500 border-2 border-white rounded-full"></span>
                </div>
            </div>

            <div className="flex-1 p-6 space-y-10">

                {/* Top Section */}
                {isLoading ? (
                    <div className="h-48 rounded-[1.5rem] bg-slate-200 animate-pulse"></div>
                ) : !hasProperties ? (
                    <div className="premium-card !bg-[#115e59] text-white p-8 relative overflow-hidden !border-none shadow-lg shadow-[#115e59]/30 flex flex-col items-center text-center">
                        <div className="absolute -right-4 -top-8 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
                        <div className="absolute -left-4 -bottom-8 w-32 h-32 bg-teal-400/10 rounded-full blur-2xl"></div>

                        <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mb-4 relative z-10 backdrop-blur-md border border-white/20">
                            <PlusCircle className="w-8 h-8 text-white" />
                        </div>
                        <h2 className="text-2xl font-black mb-2 tracking-tight relative z-10">Welcome to Property Bank</h2>
                        <p className="text-sm font-medium text-teal-100 mb-6 relative z-10">Let's set up your portfolio. Add your first property to start managing units and tenants.</p>

                        <Link href="/properties/new" className="relative z-10 w-full">
                            <button className="w-full bg-white text-[#115e59] font-black rounded-2xl py-4 hover:bg-slate-50 transition-colors shadow-lg shadow-black/10">
                                Add First Property
                            </button>
                        </Link>
                    </div>
                ) : (
                    <div className="premium-card !bg-[#115e59] text-white overflow-hidden relative !border-none shadow-lg shadow-[#115e59]/30">
                        <div className="absolute -right-4 -top-8 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
                        <div className="absolute -left-4 -bottom-8 w-32 h-32 bg-teal-400/10 rounded-full blur-2xl"></div>

                        <CardContent className="p-8 relative z-10">
                            <div className="flex items-center space-x-2 mb-2 opacity-70">
                                <Wallet className="w-4 h-4" />
                                <span className="text-xs font-bold uppercase tracking-widest">Expected Rent (This Month)</span>
                            </div>
                            <h2 className="text-5xl font-black mb-8 tracking-tighter">
                                ₦{summary.totalExpectedRent.toLocaleString()}
                            </h2>

                            <div className="flex justify-between items-center bg-white/10 rounded-3xl p-5 border border-white/10 backdrop-blur-md">
                                <div className="flex flex-col items-center">
                                    <span className="text-2xl font-black">{summary.totalUnits}</span>
                                    <span className="text-[10px] opacity-70 uppercase tracking-widest font-bold">Units</span>
                                </div>
                                <div className="h-10 w-px bg-white/20"></div>
                                <div className="flex flex-col items-center">
                                    <span className="text-2xl font-black">{summary.occupiedUnits}</span>
                                    <span className="text-[10px] opacity-70 uppercase tracking-widest font-bold">Occupied</span>
                                </div>
                                <div className="h-10 w-px bg-white/20"></div>
                                <div className="flex flex-col items-center">
                                    <span className="text-2xl font-black">{summary.vacantUnits}</span>
                                    <span className="text-[10px] opacity-70 uppercase tracking-widest font-bold">Vacant</span>
                                </div>
                            </div>
                        </CardContent>
                    </div>
                )}

                {/* Middle Section (Quick Actions) */}
                <div>
                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest px-1 mb-6">Quick Actions</h3>
                    <div className="grid grid-cols-4 gap-4">
                        <Link href="/properties/new" className="flex flex-col items-center justify-center space-y-3 group">
                            <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-soft border border-slate-100 group-active:scale-90 transition-all group-hover:bg-slate-50">
                                <PlusCircle className="w-7 h-7 text-[#115e59]" />
                            </div>
                            <span className="text-[11px] font-bold text-slate-600 text-center tracking-tight leading-tight">Add<br />Property</span>
                        </Link>

                        <Link href="/announcements/new" className="flex flex-col items-center justify-center space-y-3 group">
                            <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-soft border border-slate-100 group-active:scale-90 transition-all group-hover:bg-slate-50">
                                <Megaphone className="w-7 h-7 text-[#115e59]" />
                            </div>
                            <span className="text-[11px] font-bold text-slate-600 text-center tracking-tight leading-tight">Post<br />Update</span>
                        </Link>

                        <Link href="/tenants" className="flex flex-col items-center justify-center space-y-3 group">
                            <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-soft border border-slate-100 group-active:scale-90 transition-all group-hover:bg-slate-50">
                                <Users className="w-7 h-7 text-[#115e59]" />
                            </div>
                            <span className="text-[11px] font-bold text-slate-600 text-center tracking-tight leading-tight">View<br />Tenants</span>
                        </Link>

                        <Link href="/properties" className="flex flex-col items-center justify-center space-y-3 group">
                            <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-soft border border-slate-100 group-active:scale-90 transition-all group-hover:bg-slate-50">
                                <LayoutDashboard className="w-7 h-7 text-[#115e59]" />
                            </div>
                            <span className="text-[11px] font-bold text-slate-600 text-center tracking-tight leading-tight">View<br />Units</span>
                        </Link>
                    </div>
                </div>

                {/* Bottom Section (Activity Feed) */}
                <div>
                    <div className="flex justify-between items-center mb-6 px-1">
                        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest flex items-center">
                            <Activity className="w-4 h-4 mr-2" />
                            Activity Feed
                        </h3>
                        <span className="text-xs text-[#115e59] font-black uppercase tracking-widest">See all</span>
                    </div>

                    <div className="premium-card p-2 bg-white border border-slate-100/50">
                        <div className="divide-y divide-slate-50">
                            {activities.length > 0 ? (
                                activities.map((activity, i) => (
                                    <div key={activity.id} className="p-5 flex items-center justify-between animate-in fade-in slide-in-from-left-2 transition-all hover:bg-slate-50/50 rounded-xl" style={{ animationDelay: `${i * 100}ms` }}>
                                        <div className="flex items-center space-x-4">
                                            <div className="w-2.5 h-2.5 rounded-full bg-[#115e59] shadow-[0_0_8px_rgba(17,94,89,0.3)]"></div>
                                            <span className="text-sm font-bold text-slate-800 leading-snug">{activity.message}</span>
                                        </div>
                                        <span className="text-[10px] font-bold text-slate-300 uppercase tracking-tighter">
                                            {new Date(activity.created_at).toLocaleDateString()}
                                        </span>
                                    </div>
                                ))
                            ) : (
                                <div className="p-10 text-center flex flex-col items-center">
                                    <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                                        <Activity className="w-6 h-6 text-slate-200" />
                                    </div>
                                    <p className="text-sm font-bold text-slate-300 uppercase tracking-widest">No recent activity</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

            </div>
        </div>
    )
}

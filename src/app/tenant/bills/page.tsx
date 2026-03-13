"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Zap, FileText, Calendar, ChevronRight } from "lucide-react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"

export default function TenantBillsPage() {
    const supabase = createClient()
    const router = useRouter()
    const [bills, setBills] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        async function fetchBills() {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) {
                router.push('/login')
                return
            }

            // Get the tenant's unit_id first
            const { data: tenancy } = await supabase
                .from('tenancies')
                .select('unit_id')
                .eq('tenant_id', user.id)
                .eq('active', true)
                .single()

            if (tenancy) {
                const { data } = await supabase
                    .from('electricity_logs')
                    .select('*')
                    .eq('unit_id', tenancy.unit_id)
                    .order('created_at', { ascending: false })

                if (data) setBills(data)
            }
            setIsLoading(false)
        }

        fetchBills()
    }, [router, supabase])

    return (
        <div className="flex flex-col min-h-screen bg-slate-50 font-sans pb-24 animate-in fade-in duration-500 mesh-gradient">
            {/* Header */}
            <div className="px-6 py-8 pb-6 glass flex items-center border-b border-white/40 sticky top-0 z-20">
                <Link href="/tenant/dashboard" className="p-2 -ml-2 rounded-full hover:bg-slate-100 transition-colors mr-3">
                    <ArrowLeft className="w-5 h-5 text-slate-700" />
                </Link>
                <div>
                    <h1 className="text-xl font-extrabold tracking-tight text-slate-900">Power Bills</h1>
                    <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-0.5">
                        Historical Log
                    </p>
                </div>
            </div>

            <div className="flex-1 p-6 space-y-6">
                {isLoading ? (
                    <div className="flex justify-center py-20">
                        <div className="w-8 h-8 border-4 border-[#115e59] border-t-transparent rounded-full animate-spin"></div>
                    </div>
                ) : bills.length === 0 ? (
                    <div className="text-center py-16 px-6 bg-white/50 border-2 border-dashed border-slate-200 rounded-[1.5rem]">
                        <div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Zap className="w-8 h-8 text-amber-500" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-800 mb-2">No bills found</h3>
                        <p className="text-sm text-slate-500 leading-relaxed font-medium">
                            You haven't submitted any electricity bills yet.
                        </p>
                        <Link href="/tenant/electricity/new" className="mt-6 inline-block">
                            <span className="bg-[#115e59] text-white px-6 py-3 rounded-xl font-bold text-sm shadow-brand hover:bg-[#0f766e] transition-colors">
                                Submit New Bill
                            </span>
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {bills.map((bill) => (
                            <div key={bill.id} className="premium-card bg-white p-5 flex items-center justify-between border-transparent hover:border-[#115e59]/10 transition-all">
                                <div className="flex items-center space-x-4">
                                    <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center shadow-inner">
                                        <Zap className="w-6 h-6 text-amber-500" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-slate-900 text-lg leading-tight">₦{Number(bill.amount).toLocaleString()}</h3>
                                        <div className="flex items-center text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">
                                            <Calendar className="w-3 h-3 mr-1" />
                                            {new Date(bill.created_at).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <span className={`text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded border inline-block mb-2 ${bill.status === 'approved'
                                            ? 'bg-green-50 text-green-600 border-green-100'
                                            : bill.status === 'rejected'
                                                ? 'bg-red-50 text-red-600 border-red-100'
                                                : 'bg-amber-50 text-amber-600 border-amber-100'
                                        }`}>
                                        {bill.status}
                                    </span>
                                    {bill.receipt_url && (
                                        <a href={bill.receipt_url} target="_blank" rel="noopener noreferrer" className="flex items-center text-xs font-bold text-[#115e59] hover:underline">
                                            <FileText className="w-3 h-3 mr-1" /> Receipt
                                        </a>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}

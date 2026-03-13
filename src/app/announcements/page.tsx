"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Bell, Calendar, Plus, MapPin } from "lucide-react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"

export default function LandlordAnnouncementsPage() {
    const supabase = createClient()
    const router = useRouter()
    const [announcements, setAnnouncements] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        async function fetchAnnouncements() {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) {
                router.push('/login')
                return
            }

            const { data } = await supabase
                .from('announcements')
                .select(`
                    *,
                    properties ( name )
                `)
                .order('created_at', { ascending: false })

            if (data) setAnnouncements(data)
            setIsLoading(false)
        }

        fetchAnnouncements()
    }, [router, supabase])

    return (
        <div className="flex flex-col min-h-screen bg-slate-50 font-sans pb-24 animate-in fade-in duration-500 mesh-gradient">
            {/* Header */}
            <div className="px-6 py-8 pb-6 glass flex justify-between items-center border-b border-white/40 sticky top-0 z-20">
                <div className="flex items-center">
                    <Link href="/dashboard" className="p-2 -ml-2 rounded-full hover:bg-slate-100 transition-colors mr-3">
                        <ArrowLeft className="w-5 h-5 text-slate-700" />
                    </Link>
                    <div>
                        <h1 className="text-xl font-extrabold tracking-tight text-slate-900">Announcements</h1>
                        <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-0.5">
                            Manage Updates
                        </p>
                    </div>
                </div>
                <Link href="/announcements/new">
                    <div className="w-10 h-10 bg-[#115e59] text-white rounded-full flex items-center justify-center shadow-brand active:scale-95 transition-all">
                        <Plus className="w-5 h-5" />
                    </div>
                </Link>
            </div>

            <div className="flex-1 p-6 space-y-6">
                {isLoading ? (
                    <div className="flex justify-center py-20">
                        <div className="w-8 h-8 border-4 border-[#115e59] border-t-transparent rounded-full animate-spin"></div>
                    </div>
                ) : announcements.length === 0 ? (
                    <div className="text-center py-16 px-6 bg-white/50 border-2 border-dashed border-slate-200 rounded-[1.5rem]">
                        <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Bell className="w-8 h-8 text-blue-500" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-800 mb-2">No announcements</h3>
                        <p className="text-sm text-slate-500 leading-relaxed font-medium">
                            Keep your tenants informed by posting updates and alerts.
                        </p>
                        <Link href="/announcements/new" className="mt-6 inline-block">
                            <span className="bg-[#115e59] text-white px-6 py-3 rounded-xl font-bold text-sm shadow-brand hover:bg-[#0f766e] transition-colors">
                                Create Announcement
                            </span>
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {announcements.map((ann) => (
                            <div key={ann.id} className="premium-card bg-white p-6 border-transparent hover:border-[#115e59]/10 transition-all relative overflow-hidden">
                                <div className="absolute top-0 left-0 w-1.5 h-full bg-[#115e59]/20"></div>
                                <div className="flex justify-between items-start mb-3">
                                    <div className="flex items-center space-x-2">
                                        <div className="bg-teal-50 text-[#115e59] text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full flex items-center">
                                            <MapPin className="w-3 h-3 mr-1" /> {ann.properties?.name}
                                        </div>
                                    </div>
                                    <div className="flex items-center text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                                        <Calendar className="w-3 h-3 mr-1" />
                                        {new Date(ann.created_at).toLocaleDateString()}
                                    </div>
                                </div>
                                <h3 className="font-bold text-slate-900 text-lg leading-tight mb-2 italic">"{ann.title}"</h3>
                                <p className="text-sm text-slate-600 leading-relaxed font-medium">
                                    {ann.content}
                                </p>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}

"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowLeft, Megaphone } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"

export default function AddAnnouncementPage() {
    const supabase = createClient()
    const router = useRouter()

    const [message, setMessage] = useState("")
    const [propertyId, setPropertyId] = useState<string>("all")
    const [properties, setProperties] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        async function fetchProperties() {
            const { data } = await supabase.from('properties').select('id, name')
            if (data) setProperties(data)
        }
        fetchProperties()
    }, [supabase])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        setError(null)

        try {
            const { error: insertError } = await supabase
                .from('announcements')
                .insert({
                    message: message,
                    property_id: propertyId === "all" ? null : propertyId
                })

            if (insertError) throw insertError

            router.push('/dashboard')
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
                <Link href="/dashboard" className="p-2 -ml-2 rounded-full hover:bg-slate-100 transition-colors mr-3">
                    <ArrowLeft className="w-5 h-5 text-slate-700" />
                </Link>
                <h1 className="text-xl font-bold tracking-tight text-slate-900">Broadcast</h1>
            </div>

            <div className="flex-1 p-6 flex flex-col pt-8 space-y-8">
                <div className="flex flex-col items-center text-center">
                    <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mb-4 border border-blue-200">
                        <Megaphone className="w-8 h-8 text-blue-500 transform -rotate-12" />
                    </div>
                    <h2 className="text-2xl font-black text-slate-900 mb-1">New Announcement</h2>
                    <p className="text-sm text-slate-500 font-medium px-4">
                        Send an important message to your tenants. It will appear on their dashboard.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6 flex flex-col flex-1">
                    {error && (
                        <div className="p-4 bg-red-50 text-red-700 rounded-2xl text-sm border border-red-100 font-bold">
                            {error}
                        </div>
                    )}

                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Target Audience</label>
                        <select
                            value={propertyId}
                            onChange={(e) => setPropertyId(e.target.value)}
                            className="w-full h-14 bg-white/50 border-slate-200 rounded-2xl focus:bg-white shadow-soft font-bold text-slate-700 px-4 appearance-none outline-none focus:ring-2 focus:ring-[#115e59]/20"
                        >
                            <option value="all">All Properties</option>
                            {properties.map(p => (
                                <option key={p.id} value={p.id}>{p.name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Message</label>
                        <textarea
                            placeholder="Type your announcement here..."
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            className="w-full h-40 bg-white/50 border border-slate-200 rounded-2xl focus:bg-white shadow-soft font-bold p-4 outline-none focus:ring-2 focus:ring-[#115e59]/20 resize-none"
                            required
                        />
                    </div>

                    <div className="mt-auto pt-8">
                        <Button
                            type="submit"
                            className="w-full text-lg py-7 h-auto rounded-2xl shadow-lg shadow-[#115e59]/20 bg-[#115e59] hover:bg-[#0f766e]"
                            disabled={isLoading}
                        >
                            {isLoading ? "Broadcasting..." : "Broadcast Message"}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    )
}

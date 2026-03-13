"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowLeft, CalendarDays } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export default function ScheduleMeetingPage() {
    const supabase = createClient()
    const router = useRouter()

    const [title, setTitle] = useState("")
    const [description, setDescription] = useState("")
    const [meetingDate, setMeetingDate] = useState("")
    const [meetingTime, setMeetingTime] = useState("")
    const [propertyId, setPropertyId] = useState<string>("")
    const [properties, setProperties] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        async function fetchProperties() {
            const { data } = await supabase.from('properties').select('id, name')
            if (data && data.length > 0) {
                setProperties(data)
                setPropertyId(data[0].id)
            }
        }
        fetchProperties()
    }, [supabase])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!propertyId) {
            setError("Please select a property.")
            return
        }

        setIsLoading(true)
        setError(null)

        try {
            const dateTimeStr = `${meetingDate}T${meetingTime}:00`
            const timestamp = new Date(dateTimeStr).toISOString()

            const { error: insertError } = await supabase
                .from('meetings')
                .insert({
                    title: title,
                    description: description,
                    meeting_date: timestamp,
                    property_id: propertyId
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
                <h1 className="text-xl font-bold tracking-tight text-slate-900">Schedule Meeting</h1>
            </div>

            <div className="flex-1 p-6 flex flex-col pt-8 space-y-8">
                <div className="flex flex-col items-center text-center">
                    <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center mb-4 border border-indigo-200">
                        <CalendarDays className="w-8 h-8 text-indigo-500" />
                    </div>
                    <h2 className="text-2xl font-black text-slate-900 mb-1">New Meeting</h2>
                    <p className="text-sm text-slate-500 font-medium px-4">
                        Set a date and time to hold a meeting with tenants in a property.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6 flex flex-col flex-1">
                    {error && (
                        <div className="p-4 bg-red-50 text-red-700 rounded-2xl text-sm border border-red-100 font-bold">
                            {error}
                        </div>
                    )}

                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Select Property</label>
                        <select
                            value={propertyId}
                            onChange={(e) => setPropertyId(e.target.value)}
                            className="w-full h-14 bg-white/50 border-slate-200 rounded-2xl focus:bg-white shadow-soft font-bold text-slate-700 px-4 appearance-none outline-none focus:ring-2 focus:ring-[#115e59]/20"
                            required
                        >
                            <option value="" disabled>Select a property</option>
                            {properties.map(p => (
                                <option key={p.id} value={p.id}>{p.name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Meeting Title</label>
                        <Input
                            placeholder="e.g. End of Year Security Briefing"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="h-14 bg-white/50 border-slate-200 rounded-2xl focus:bg-white shadow-soft font-bold"
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Description (Optional)</label>
                        <textarea
                            placeholder="Agenda..."
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="w-full h-24 bg-white/50 border border-slate-200 rounded-2xl focus:bg-white shadow-soft font-bold p-4 outline-none focus:ring-2 focus:ring-[#115e59]/20 resize-none"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Date</label>
                            <Input
                                type="date"
                                value={meetingDate}
                                onChange={(e) => setMeetingDate(e.target.value)}
                                className="h-14 bg-white/50 border-slate-200 rounded-2xl focus:bg-white shadow-soft font-bold"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Time</label>
                            <Input
                                type="time"
                                value={meetingTime}
                                onChange={(e) => setMeetingTime(e.target.value)}
                                className="h-14 bg-white/50 border-slate-200 rounded-2xl focus:bg-white shadow-soft font-bold"
                                required
                            />
                        </div>
                    </div>

                    <div className="mt-auto pt-8">
                        <Button
                            type="submit"
                            className="w-full text-lg py-7 h-auto rounded-2xl shadow-lg shadow-[#115e59]/20 bg-[#115e59] hover:bg-[#0f766e]"
                            disabled={isLoading}
                        >
                            {isLoading ? "Scheduling..." : "Schedule Meeting"}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    )
}

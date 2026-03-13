"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { ArrowLeft, CheckCircle2, ShieldCheck, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

export default function ProfilePage() {
    const supabase = createClient()
    const router = useRouter()
    const [user, setUser] = useState<any>(null)
    const [kycStatus, setKycStatus] = useState<"unverified" | "pending" | "verified">("unverified")
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        async function getProfile() {
            const { data: { user } } = await supabase.auth.getUser()
            if (user) {
                setUser(user)
            }
            setIsLoading(false)
        }
        getProfile()
    }, [supabase])

    const handleVerify = () => {
        setKycStatus("pending")
        setTimeout(() => {
            setKycStatus("verified")
        }, 2000)
    }

    if (isLoading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="w-8 h-8 border-4 border-[#115e59] border-t-transparent rounded-full animate-spin"></div>
            </div>
        )
    }

    const fullName = user?.user_metadata?.full_name || "User"
    const phone = user?.phone || user?.user_metadata?.phone || "No phone"
    const role = user?.user_metadata?.role || "landlord"
    const backLink = role === 'tenant' ? '/tenant/dashboard' : '/dashboard'

    return (
        <div className="flex flex-col min-h-screen pb-20 bg-slate-50 animate-in fade-in duration-500">

            {/* Header */}
            <div className="px-6 py-6 bg-white flex items-center shadow-[0_2px_4px_-2px_rgb(0,0,0,0.02)] sticky top-0 z-20">
                <Link href={backLink} className="p-2 -ml-2 rounded-full hover:bg-slate-100 transition-colors mr-3">
                    <ArrowLeft className="w-5 h-5 text-slate-700" />
                </Link>
                <h1 className="text-xl font-bold tracking-tight text-slate-900">Profile</h1>
            </div>

            <div className="flex-1 p-6 space-y-6 pt-8">

                <div className="flex flex-col items-center">
                    <div className="w-24 h-24 bg-slate-200 rounded-full flex items-center justify-center mb-4 relative">
                        <User className="w-10 h-10 text-slate-500" />
                        {kycStatus === "verified" && (
                            <div className="absolute bottom-0 right-0 w-6 h-6 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
                                <CheckCircle2 className="w-4 h-4 text-white" />
                            </div>
                        )}
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900 capitalize">{fullName}</h2>
                    <p className="text-slate-500 font-medium">{phone}</p>
                    <span className="mt-2 px-3 py-1 bg-teal-50 text-teal-700 text-[10px] font-black uppercase tracking-widest rounded-full">{role}</span>
                </div>

                <div className="bg-white rounded-[1rem] shadow-soft p-5 border-0">
                    <div className="flex justify-between items-center border-b border-slate-100 pb-4 mb-4">
                        <div className="flex items-center">
                            <ShieldCheck className={`w-5 h-5 mr-3 ${kycStatus === 'verified' ? 'text-green-500' : 'text-slate-400'}`} />
                            <div>
                                <h3 className="font-semibold text-slate-900">KYC Verification</h3>
                                <p className="text-[11px] text-slate-500 mt-0.5">Verify identity for marketplace trust</p>
                            </div>
                        </div>
                        {kycStatus === "verified" && (
                            <span className="text-xs font-bold text-green-600 bg-green-50 px-2.5 py-1 rounded-full uppercase tracking-wider">
                                Verified
                            </span>
                        )}
                        {kycStatus === "pending" && (
                            <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full uppercase tracking-wider">
                                Pending
                            </span>
                        )}
                    </div>

                    {kycStatus === "unverified" && (
                        <div>
                            <p className="text-sm text-slate-600 mb-4 leading-relaxed">
                                To build trust with future tenants on the marketplace, please confirm your identity using a valid ID.
                            </p>
                            <Button onClick={handleVerify} className="w-full text-sm">
                                Verify Account
                            </Button>
                        </div>
                    )}
                </div>

                <div className="bg-white rounded-[1rem] shadow-soft overflow-hidden border-0">
                    <div className="divide-y divide-slate-100">
                        <div className="p-4 hover:bg-slate-50 transition-colors cursor-pointer flex justify-between items-center">
                            <span className="text-sm font-medium text-slate-800">Account Settings</span>
                            <ArrowLeft className="w-4 h-4 text-slate-300 rotate-180" />
                        </div>
                        <div className="p-4 hover:bg-slate-50 transition-colors cursor-pointer flex justify-between items-center">
                            <span className="text-sm font-medium text-slate-800">Notification Preferences</span>
                            <ArrowLeft className="w-4 h-4 text-slate-300 rotate-180" />
                        </div>
                        <button
                            onClick={async () => {
                                await supabase.auth.signOut();
                                router.push('/login');
                            }}
                            className="w-full text-left p-4 hover:bg-slate-50 transition-colors cursor-pointer flex justify-between items-center group"
                        >
                            <span className="text-sm font-medium text-red-600 group-hover:text-red-700">Sign Out</span>
                        </button>
                    </div>
                </div>

            </div>
        </div>
    )
}

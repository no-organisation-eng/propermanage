"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Building2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { createClient } from "@/lib/supabase/client"

export default function RegisterPage() {
    const router = useRouter()
    const supabase = createClient()

    const [step, setStep] = useState(1) // 1: Info, 2: OTP/Verify Simulation
    const [formData, setFormData] = useState({
        fullName: "",
        phone: "",
        email: "",
        password: "",
    })

    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        setError(null)

        try {
            const { data, error: signUpError } = await supabase.auth.signUp({
                email: formData.email,
                password: formData.password,
                options: {
                    data: {
                        full_name: formData.fullName,
                        phone: formData.phone,
                        role: 'landlord', // Default to landlord for this flow
                    }
                }
            })

            if (signUpError) throw signUpError

            // In MVP, we might simulate OTP or skip directly to dashboard if auto-confirmed.
            // If email confirmation is enabled on Supabase, they'd check their email.
            // For now, let's assume they are signed in or need to check email:
            if (data.session) {
                router.push("/dashboard")
            } else {
                setStep(2) // Move to "Check Email / OTP Simulation" step
            }

        } catch (err: any) {
            setError(err.message)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="flex flex-col min-h-screen mesh-gradient p-6 animate-in slide-in-from-right-4 duration-500 font-sans">

            <Link href="/" className="w-10 h-10 bg-white shadow-soft rounded-full flex items-center justify-center mb-8 border border-white/40">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-600 w-5 h-5"><path d="m15 18-6-6 6-6" /></svg>
            </Link>

            <div className="w-full max-w-sm mx-auto space-y-6">
                <div>
                    <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 mb-2">
                        {step === 1 ? "Create Account" : "Verify Account"}
                    </h1>
                    <p className="text-slate-500 font-medium">
                        {step === 1 ? "Set up your property bank profile." : "We've sent a verification link to your email."}
                    </p>
                </div>

                <div className="glass shadow-float rounded-[2.5rem] p-8 border border-white/40">
                    {step === 1 ? (
                        <form onSubmit={handleRegister} className="space-y-4">
                            {error && (
                                <div className="p-3 bg-red-50 text-red-600 rounded-xl text-sm border border-red-100">
                                    {error}
                                </div>
                            )}

                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Full Name</label>
                                <Input
                                    placeholder="John Doe"
                                    value={formData.fullName}
                                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                                    className="h-12 bg-white/50 border-slate-100 rounded-xl focus:bg-white shadow-none"
                                    required
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Phone Number</label>
                                <Input
                                    type="tel"
                                    placeholder="+234 800 000 0000"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    className="h-12 bg-white/50 border-slate-100 rounded-xl focus:bg-white shadow-none"
                                    required
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Email Address</label>
                                <Input
                                    type="email"
                                    placeholder="name@example.com"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    className="h-12 bg-white/50 border-slate-100 rounded-xl focus:bg-white shadow-none"
                                    required
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Password</label>
                                <Input
                                    type="password"
                                    placeholder="••••••••"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    className="h-12 bg-white/50 border-slate-100 rounded-xl focus:bg-white shadow-none"
                                    required
                                    minLength={6}
                                />
                            </div>

                            <Button
                                type="submit"
                                className="w-full text-lg py-7 h-auto rounded-2xl mt-6 shadow-lg shadow-[#115e59]/20"
                                disabled={isLoading}
                            >
                                {isLoading ? "Creating..." : "Continue"}
                            </Button>
                        </form>
                    ) : (
                        <div className="space-y-6 flex flex-col items-center justify-center py-6 text-center">
                            <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mb-2">
                                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-600"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><path d="m9 11 3 3L22 4" /></svg>
                            </div>
                            <div className="space-y-2">
                                <p className="text-slate-800 font-bold text-lg">Check your email</p>
                                <p className="text-sm text-slate-500 leading-relaxed italic">After verification, you can log in to your dashboard.</p>
                            </div>
                            <Link href="/login" className="w-full mt-4">
                                <Button className="w-full text-lg py-7 h-auto rounded-2xl">
                                    Go to Login
                                </Button>
                            </Link>
                        </div>
                    )}

                    {step === 1 && (
                        <div className="mt-8 text-center border-t border-slate-100 pt-6">
                            <p className="text-sm text-slate-500 font-medium">
                                Already have an account?{" "}
                                <Link href="/login" className="text-[#115e59] font-bold hover:underline">
                                    Sign in
                                </Link>
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

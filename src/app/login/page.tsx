"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Building2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { createClient } from "@/lib/supabase/client"

export default function LoginPage() {
    const router = useRouter()
    const supabase = createClient()

    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        setError(null)

        try {
            const { error: authError } = await supabase.auth.signInWithPassword({
                email,
                password,
            })

            if (authError) {
                // Log the raw error for better debugging visibility if needed
                console.error("Supabase Auth Error:", authError)

                // Provide user-friendly messages for common errors
                switch (authError.message) {
                    case "Invalid login credentials":
                        setError("Incorrect email or password. Please try again.")
                        break
                    case "Email not confirmed":
                        setError("Please check your inbox and confirm your email address.")
                        break
                    default:
                        setError(authError.message || "An unexpected error occurred during sign in.")
                }
                return
            }

            // Successfully logged in
            router.push("/dashboard")
            router.refresh()
        } catch (err: any) {
            console.error("Login catch block:", err)
            setError("Something went wrong. Please check your connection and try again.")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="flex flex-col min-h-screen mesh-gradient p-6 justify-center animate-in fade-in duration-500 font-sans">

            <Link href="/" className="absolute top-8 left-6 w-10 h-10 bg-white/50 backdrop-blur-md rounded-full flex items-center justify-center border border-white/40">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-600 w-5 h-5"><path d="m15 18-6-6 6-6" /></svg>
            </Link>

            <div className="w-full max-w-sm mx-auto space-y-8">
                <div className="flex flex-col items-center text-center">
                    <div className="w-16 h-16 bg-white shadow-float rounded-2xl flex items-center justify-center mb-6 border border-white/50">
                        <Building2 className="w-8 h-8 text-[#115e59]" />
                    </div>
                    <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 mb-2">
                        Welcome back
                    </h1>
                    <p className="text-slate-500 font-medium">
                        Sign in to your property bank.
                    </p>
                </div>

                <div className="glass shadow-float rounded-[2.5rem] p-8 border border-white/40">
                    <form onSubmit={handleLogin} className="space-y-6">
                        {error && (
                            <div className="p-4 bg-red-50 text-red-600 rounded-2xl text-sm border border-red-100 animate-in fade-in slide-in-from-top-1">
                                {error}
                            </div>
                        )}

                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Email Address</label>
                            <Input
                                type="email"
                                placeholder="name@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="h-14 bg-white/50 border-slate-100 rounded-2xl focus:bg-white transition-all shadow-none"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Password</label>
                            <Input
                                type="password"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="h-14 bg-white/50 border-slate-100 rounded-2xl focus:bg-white transition-all shadow-none"
                                required
                            />
                        </div>

                        <Button
                            type="submit"
                            className="w-full text-lg py-7 h-auto rounded-2xl mt-4 shadow-lg shadow-[#115e59]/20"
                            disabled={isLoading}
                        >
                            {isLoading ? "Signing in..." : "Sign in"}
                        </Button>
                    </form>

                    <div className="mt-8 text-center">
                        <p className="text-sm text-slate-500 font-medium">
                            Don't have an account?{" "}
                            <Link href="/register" className="text-[#115e59] font-bold hover:underline">
                                Create account
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}

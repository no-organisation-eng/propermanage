"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowLeft, Zap, UploadCloud, FileImage, AlertCircle } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export default function LogElectricityBillPage() {
    const supabase = createClient()
    const router = useRouter()

    const [amount, setAmount] = useState("")
    const [receiptFile, setReceiptFile] = useState<File | null>(null)
    const [previewUrl, setPreviewUrl] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const file = e.target.files[0]
            setReceiptFile(file)
            setPreviewUrl(URL.createObjectURL(file))
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!amount) {
            setError("Please enter the bill amount.")
            return
        }

        setIsLoading(true)
        setError(null)

        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) throw new Error("Not authenticated")

            // Get tenant's unit ID
            const { data: tenancy } = await supabase
                .from('tenancies')
                .select('unit_id')
                .eq('tenant_id', user.id)
                .eq('active', true)
                .single()

            if (!tenancy) throw new Error("Could not find your active tenancy.")

            let receipt_url = ""

            // Upload receipt if provided
            if (receiptFile) {
                const fileExt = receiptFile.name.split('.').pop()
                const fileName = `${user.id}_${Date.now()}.${fileExt}`
                const filePath = `electricity/${fileName}`

                const { error: uploadError } = await supabase.storage
                    .from('receipts')
                    .upload(filePath, receiptFile)

                if (uploadError) {
                    console.error("Upload error:", uploadError)
                    throw new Error("Failed to upload the receipt. Ensure standard image format and that the 'receipts' storage bucket is created by your landlord.")
                }

                const { data: publicUrlData } = supabase.storage
                    .from('receipts')
                    .getPublicUrl(filePath)

                receipt_url = publicUrlData.publicUrl
            }

            // Insert log
            const { error: insertError } = await supabase
                .from('electricity_logs')
                .insert({
                    unit_id: tenancy.unit_id,
                    tenant_id: user.id,
                    amount: Number(amount),
                    receipt_url: receipt_url,
                    status: 'submitted'
                })

            if (insertError) throw insertError

            router.push('/tenant/dashboard')

        } catch (err: any) {
            setError(err.message || "An unexpected error occurred.")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="flex flex-col min-h-screen bg-slate-50 animate-in slide-in-from-right-4 duration-500 pb-20 mesh-gradient font-sans">
            {/* Header */}
            <div className="px-6 py-6 glass flex items-center border-b border-white/40 sticky top-0 z-20">
                <Link href="/tenant/dashboard" className="p-2 -ml-2 rounded-full hover:bg-slate-100 transition-colors mr-3">
                    <ArrowLeft className="w-5 h-5 text-slate-700" />
                </Link>
                <h1 className="text-xl font-bold tracking-tight text-slate-900">Log Power Bill</h1>
            </div>

            <div className="flex-1 p-6 flex flex-col pt-8 space-y-8">
                <div className="flex flex-col items-center text-center">
                    <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mb-4 border border-amber-200 shadow-soft">
                        <Zap className="w-8 h-8 text-amber-500" />
                    </div>
                    <h2 className="text-2xl font-black text-slate-900 mb-1">Submit Electricity Bill</h2>
                    <p className="text-sm text-slate-500 font-medium px-4">
                        Log your power payment so your landlord can verify and approve it.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6 flex flex-col flex-1">
                    {error && (
                        <div className="p-4 bg-red-50 text-red-700 rounded-2xl text-sm border border-red-100 font-bold shadow-soft">
                            <AlertCircle className="w-5 h-5 mb-2 text-red-500" />
                            {error}
                        </div>
                    )}

                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Bill Amount (₦)</label>
                        <Input
                            type="number"
                            placeholder="e.g. 5000"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            className="h-14 bg-white/50 border-slate-200 rounded-2xl focus:bg-white shadow-soft font-bold text-lg"
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Upload Receipt (Optional)</label>

                        <div className="relative">
                            <input
                                type="file"
                                id="receipt-upload"
                                accept="image/*"
                                className="hidden"
                                onChange={handleFileChange}
                            />

                            <label
                                htmlFor="receipt-upload"
                                className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-[#115e59]/30 bg-white/50 rounded-2xl cursor-pointer hover:bg-[#115e59]/5 transition-colors group overflow-hidden relative"
                            >
                                {previewUrl ? (
                                    <>
                                        <div className="absolute inset-0 bg-black/40 z-10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                            <span className="text-white font-bold text-sm bg-black/50 px-4 py-2 rounded-full backdrop-blur-md">Change Photo</span>
                                        </div>
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img src={previewUrl} alt="Receipt Preview" className="w-full h-full object-cover" />
                                    </>
                                ) : (
                                    <>
                                        <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                                            <UploadCloud className="w-6 h-6 text-slate-500" />
                                        </div>
                                        <p className="text-sm font-bold text-slate-700">Tap to upload receipt photo</p>
                                        <p className="text-xs text-slate-400 font-medium mt-1">JPEG, PNG, HEIC up to 5MB</p>
                                    </>
                                )}
                            </label>
                        </div>
                    </div>

                    <div className="mt-auto pt-8">
                        <Button
                            type="submit"
                            className="w-full text-lg py-7 h-auto rounded-2xl shadow-lg shadow-[#115e59]/20"
                            disabled={isLoading}
                        >
                            {isLoading ? "Submitting..." : "Submit Power Bill"}
                        </Button>
                    </div>
                </form>

            </div>
        </div>
    )
}

"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, Building2, Users, User, Wallet } from "lucide-react"
import { cn } from "@/lib/utils"

export function BottomNav() {
    const pathname = usePathname()

    // Ensure bottom nav only shows for landlord or tenant logged in routes
    // and is hidden on landing page (/) and auth pages.
    const isHiddenRoute = pathname === "/" || pathname.startsWith("/login") || pathname.startsWith("/register") || pathname.startsWith("/auth")
    if (isHiddenRoute) return null

    // A simple simulated role state for MVP design implementation. 
    const isLandlord = !pathname.startsWith("/tenant")

    const landlordLinks = [
        { id: "landlord-dashboard", href: "/dashboard", label: "Home", icon: Home },
        { id: "landlord-properties", href: "/properties", label: "Properties", icon: Building2 },
        { id: "landlord-tenants", href: "/tenants", label: "Tenants", icon: Users },
        { id: "landlord-profile", href: "/profile", label: "Profile", icon: User },
    ]

    const tenantLinks = [
        { id: "tenant-home", href: "/tenant/dashboard", label: "Home", icon: Home },
        { id: "tenant-bills", href: "/tenant/electricity/new", label: "Bills", icon: Wallet },
        { id: "tenant-announcements", href: "/announcements", label: "Announced", icon: Users },
        { id: "tenant-profile", href: "/profile", label: "Profile", icon: User },
    ]

    const links = isLandlord ? landlordLinks : tenantLinks

    return (
        <nav className="fixed bottom-6 left-6 right-6 z-50 lg:hidden font-sans">
            <div className="glass shadow-float rounded-[2rem] p-2 flex justify-between items-center px-4 max-w-lg mx-auto border border-white/40 backdrop-blur-xl">
                {links.map((link) => {
                    const Icon = link.icon
                    const isActive = pathname === link.href

                    return (
                        <Link
                            key={link.id || link.href}
                            href={link.href}
                            className={cn(
                                "flex flex-col items-center justify-center min-w-[3.5rem] py-2 transition-all duration-300 rounded-2xl relative",
                                isActive ? "text-[#115e59]" : "text-slate-400 hover:text-slate-600"
                            )}
                        >
                            <Icon className={cn("w-5 h-5 mb-1", isActive ? "scale-110" : "scale-100")} strokeWidth={isActive ? 2.5 : 2} />
                            <span className={cn("text-[10px] font-bold tracking-tight", isActive ? "opacity-100" : "opacity-60")}>
                                {link.label}
                            </span>
                            {isActive && (
                                <div className="absolute -bottom-1 w-1.5 h-1.5 bg-[#115e59] rounded-full shadow-[0_0_8px_rgba(17,94,89,0.5)]" />
                            )}
                        </Link>
                    )
                })}
            </div>
        </nav>
    )
}

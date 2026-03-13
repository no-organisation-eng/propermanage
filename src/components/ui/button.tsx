import * as React from "react"
import { cn } from "@/lib/utils"

export interface ButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: "default" | "secondary" | "outline" | "ghost"
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = "default", ...props }, ref) => {
        return (
            <button
                ref={ref}
                className={cn(
                    "inline-flex items-center justify-center rounded-[1rem] px-4 py-3 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
                    {
                        "bg-[#115e59] text-white hover:bg-[#0f766e] focus-visible:ring-[#115e59] shadow-[0_4px_6px_-2px_rgb(17,94,89,0.3)]":
                            variant === "default",
                        "bg-slate-100 text-slate-900 hover:bg-slate-200 focus-visible:ring-slate-400":
                            variant === "secondary",
                        "border border-slate-200 bg-transparent text-slate-900 hover:bg-slate-100 focus-visible:ring-slate-400":
                            variant === "outline",
                        "bg-transparent text-slate-900 hover:bg-slate-100 focus-visible:ring-slate-400":
                            variant === "ghost",
                    },
                    className
                )}
                {...props}
            />
        )
    }
)
Button.displayName = "Button"

export { Button }

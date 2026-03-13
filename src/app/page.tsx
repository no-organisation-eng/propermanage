import Link from "next/link"
import { Building2, CheckCircle2, ShieldCheck, BarChart3, MapPin, Smartphone, ArrowRight, Notebook, Bell, MessageSquare, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen mesh-gradient overflow-hidden font-sans">

      {/* 🔵 HERO SECTION */}
      <section className="px-6 pt-16 pb-12 flex flex-col items-center text-center space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
        <div className="w-20 h-20 bg-white shadow-float rounded-3xl flex items-center justify-center mb-4 border border-white/50">
          <Building2 className="w-10 h-10 text-[#115e59]" />
        </div>

        <div className="space-y-4">
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 leading-[1.1]">
            Manage Your Rental Properties <span className="text-[#115e59]">With Clarity.</span>
          </h1>
          <p className="text-lg text-slate-600 max-w-sm mx-auto leading-relaxed">
            Track vacant units, monitor rent payments, and communicate with tenants — all in one simple dashboard built for landlords in Uyo.
          </p>
        </div>

        <div className="w-full max-w-xs space-y-3 pt-4">
          <Link href="/register" className="w-full block">
            <Button className="w-full text-lg py-7 h-auto rounded-2xl shadow-lg shadow-[#115e59]/20 hover:shadow-xl hover:shadow-[#115e59]/30 transition-all">
              Get Started Free <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </Link>
          <Button variant="outline" className="w-full text-lg py-7 h-auto rounded-2xl border-2 border-slate-200 bg-white/50 backdrop-blur-sm">
            Book a Demo
          </Button>
        </div>
      </section>

      {/* 🟢 SECTION 1 — THE PROBLEM */}
      <section className="px-6 py-16 bg-white/40 backdrop-blur-sm">
        <div className="max-w-sm mx-auto">
          <h2 className="text-sm font-bold uppercase tracking-widest text-[#115e59] mb-4">The Problem</h2>
          <h3 className="text-2xl font-bold text-slate-900 mb-8">Most landlords still manage properties with:</h3>

          <div className="grid grid-cols-2 gap-4 mb-10">
            {[
              { icon: Notebook, label: "Notebooks" },
              { icon: Bell, label: "Phone reminders" },
              { icon: AlertCircle, label: "Memory" },
              { icon: MessageSquare, label: "WhatsApp" }
            ].map((item, i) => (
              <div key={i} className="flex flex-col items-center p-4 rounded-2xl bg-white border border-slate-100 shadow-soft">
                <item.icon className="w-6 h-6 text-slate-400 mb-2" />
                <span className="text-xs font-semibold text-slate-600">{item.label}</span>
              </div>
            ))}
          </div>

          <div className="space-y-4 text-slate-600">
            <p className="flex items-center text-sm font-medium">
              <span className="w-6 h-6 rounded-full bg-red-50 text-red-500 flex items-center justify-center mr-3 text-xs">!</span>
              Missed rent tracking
            </p>
            <p className="flex items-center text-sm font-medium">
              <span className="w-6 h-6 rounded-full bg-red-50 text-red-500 flex items-center justify-center mr-3 text-xs">!</span>
              Confusion over vacant units
            </p>
            <p className="flex items-center text-sm font-medium">
              <span className="w-6 h-6 rounded-full bg-red-50 text-red-500 flex items-center justify-center mr-3 text-xs">!</span>
              Poor tenant communication
            </p>
            <p className="flex items-center text-sm font-medium">
              <span className="w-6 h-6 rounded-full bg-red-50 text-red-500 flex items-center justify-center mr-3 text-xs">!</span>
              Lost income
            </p>
          </div>

          <p className="mt-8 text-lg font-bold text-slate-900 border-l-4 border-red-500 pl-4">
            Your properties deserve better control.
          </p>
        </div>
      </section>

      {/* 🟢 SECTION 2 — THE SOLUTION */}
      <section className="px-6 py-20 bg-[#115e59] text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -mr-32 -mt-32"></div>
        <div className="relative z-10 max-w-sm mx-auto">
          <h2 className="text-sm font-bold uppercase tracking-widest text-[#2dd4bf] mb-4">The Solution</h2>
          <h3 className="text-3xl font-bold mb-8 leading-snug">Introducing a smarter way to manage your rentals.</h3>

          <div className="space-y-6 mb-12">
            {[
              "See total units at a glance",
              "Know exactly which rooms are vacant",
              "Track rent payments monthly",
              "Log electricity bills",
              "Send announcements instantly"
            ].map((text, i) => (
              <div key={i} className="flex items-center space-x-4">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-[#134e4a] flex items-center justify-center border border-white/20">
                  <CheckCircle2 className="w-4 h-4 text-[#2dd4bf]" />
                </div>
                <span className="text-lg font-medium opacity-90">{text}</span>
              </div>
            ))}
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-[2rem] p-6 border border-white/10 text-center">
            <p className="text-xl font-bold mb-1">All from your phone.</p>
            <p className="text-sm opacity-70 italic">No complicated software. No accounting knowledge required.</p>
          </div>
        </div>
      </section>

      {/* 🟢 SECTION 3 — HOW IT WORKS */}
      <section className="px-6 py-20 bg-white">
        <div className="max-w-sm mx-auto text-center">
          <h2 className="text-4xl font-black text-slate-100 mb-8 absolute left-0 right-0 -mt-12 opacity-50 uppercase tracking-tighter pointer-events-none">Workflow</h2>
          <h3 className="text-3xl font-bold text-slate-900 mb-12">How it works</h3>

          <div className="space-y-16 relative">
            <div className="absolute top-8 bottom-8 left-[27px] w-0.5 bg-slate-100"></div>

            {[
              { id: "1", title: "Add Your Property", desc: "Enter your property details and number of units." },
              { id: "2", title: "Track Occupancy", desc: "Instantly see how many units are occupied or vacant." },
              { id: "3", title: "Manage Tenants", desc: "Add tenants, track rent status, log electricity bills." },
              { id: "4", title: "Stay In Control", desc: "Send announcements and meeting reminders directly to tenants." }
            ].map((step, i) => (
              <div key={i} className="flex items-start text-left relative z-10">
                <div className="w-14 h-14 rounded-2xl bg-white border-2 border-slate-100 flex items-center justify-center text-xl font-bold text-[#115e59] shadow-soft flex-shrink-0">
                  {step.id}
                </div>
                <div className="ml-6 pt-2">
                  <h4 className="text-lg font-bold text-slate-900 mb-1">{step.title}</h4>
                  <p className="text-slate-500 leading-relaxed">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <p className="mt-16 text-xl font-bold text-[#115e59] bg-[#115e59]/5 py-4 rounded-2xl">
            Everything updates in real time.
          </p>
        </div>
      </section>

      {/* 🟢 SECTION 4 — WHY LANDLORDS TRUST US */}
      <section className="px-6 py-20 bg-slate-50">
        <div className="max-w-sm mx-auto">
          <h3 className="text-2xl font-bold text-slate-900 mb-10 text-center">Why Landlords Trust Us</h3>

          <div className="space-y-6">
            {[
              { icon: ShieldCheck, title: "Verified Landlord System", desc: "We verify landlord identities to maintain trust and credibility." },
              { icon: BarChart3, title: "Simple Financial Overview", desc: "See expected monthly rent clearly on your dashboard." },
              { icon: MapPin, title: "Accurate Property Location", desc: "Integrated map and satellite view for transparency." },
              { icon: Smartphone, title: "Mobile Banking–Style", desc: "Clean, simple dashboard inspired by modern banking apps." }
            ].map((item, i) => (
              <div key={i} className="p-6 rounded-[2rem] bg-white border border-slate-100 shadow-soft">
                <item.icon className="w-10 h-10 text-[#115e59] mb-4" />
                <h4 className="text-lg font-bold text-slate-900 mb-2">{item.title}</h4>
                <p className="text-sm text-slate-500 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 🟢 SECTION 5 — BUILT FOR UYO LANDLORDS */}
      <section className="px-6 py-20 bg-[#f1f5f9] relative">
        <div className="max-w-sm mx-auto text-center">
          <div className="px-4 py-1.5 bg-[#115e59]/10 text-[#115e59] rounded-full text-xs font-bold inline-block mb-6 uppercase tracking-widest">Local Focus</div>
          <h3 className="text-3xl font-extrabold text-slate-900 mb-6">Built for Uyo Landlords</h3>
          <p className="text-lg text-slate-600 mb-8 max-w-xs mx-auto">
            We are focused on one mission: To bring structure and clarity to rental management in Uyo.
          </p>
          <p className="text-slate-500 font-medium">
            No national confusion. No unnecessary complexity. Just local property control.
          </p>
        </div>
      </section>

      {/* 🟢 SECTION 6 — PRICING */}
      <section className="px-6 py-20 bg-white">
        <div className="max-w-sm mx-auto">
          <h3 className="text-2xl font-bold text-slate-900 mb-10 text-center">Simple Pricing</h3>

          <div className="space-y-6">
            <div className="p-8 rounded-[2.5rem] bg-slate-50 border-2 border-slate-100 relative">
              <div className="absolute top-6 right-8 text-xl font-bold text-[#115e59]">Free</div>
              <h4 className="text-xl font-bold mb-6">Property Management</h4>
              <ul className="space-y-4 text-slate-600 font-medium">
                <li className="flex items-center"><CheckCircle2 className="w-4 h-4 mr-3 text-teal-600" /> Add unlimited properties</li>
                <li className="flex items-center"><CheckCircle2 className="w-4 h-4 mr-3 text-teal-600" /> Track units</li>
                <li className="flex items-center"><CheckCircle2 className="w-4 h-4 mr-3 text-teal-600" /> Manage tenants</li>
                <li className="flex items-center"><CheckCircle2 className="w-4 h-4 mr-3 text-teal-600" /> Post announcements</li>
              </ul>
            </div>

            <div className="p-8 rounded-[2.5rem] bg-[#115e59] text-white relative shadow-xl shadow-[#115e59]/20">
              <div className="absolute top-6 right-8 text-xl font-bold text-[#2dd4bf]">₦5,000</div>
              <h4 className="text-xl font-bold mb-2">Verified Landlord Badge</h4>
              <p className="text-sm opacity-70 mb-6">One-time payment</p>
              <p className="text-sm leading-relaxed opacity-90">
                Premium features will be introduced gradually for landlords who want advanced tools.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 🟢 SECTION 7 — FUTURE BENEFITS */}
      <section className="px-6 py-20 bg-slate-900 text-white text-center">
        <div className="max-w-sm mx-auto">
          <h3 className="text-2xl font-bold mb-6">Future Benefits</h3>
          <p className="text-slate-400 mb-10 leading-relaxed">
            Soon, landlords on our platform will be able to:
          </p>

          <div className="space-y-4 mb-12">
            {[
              "List vacant units publicly",
              "Get help finding tenants",
              "Access verified tenant screening"
            ].map((text, i) => (
              <div key={i} className="p-4 rounded-xl bg-white/5 border border-white/10">
                <p className="font-semibold opacity-90">{text}</p>
              </div>
            ))}
          </div>

          <p className="text-teal-400 font-bold italic">
            By joining early, you position your property for future visibility.
          </p>
        </div>
      </section>

      {/* 🟢 SECTION 8 — CALL TO ACTION */}
      <section className="px-6 py-24 text-center bg-white">
        <div className="max-w-sm mx-auto space-y-8">
          <div className="space-y-4">
            <h3 className="text-3xl font-extrabold text-slate-900">Take control of your rental income today.</h3>
            <p className="text-slate-500 font-medium">Stop managing properties manually. Start managing with clarity.</p>
          </div>

          <Link href="/register" className="w-full block">
            <Button className="w-full text-lg py-8 h-auto rounded-3xl bg-[#115e59] shadow-xl shadow-[#115e59]/30">
              Create Free Account
            </Button>
          </Link>

          <div className="pt-8">
            <p className="text-xs font-bold text-slate-300 uppercase tracking-widest">Developed with care for Uyo</p>
          </div>
        </div>
      </section>

      {/* Footer is handled by layout with conditional logic */}
      <footer className="pb-8 text-center px-6">
        <p className="text-[10px] text-slate-400 font-medium tracking-wide">
          © 2026 PROPERTY BANK NIGERIA. ALL RIGHTS RESERVED.
        </p>
      </footer>

    </div>
  )
}

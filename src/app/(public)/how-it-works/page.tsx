import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Search,
  CreditCard,
  PhoneCall,
  Home,
  ShieldCheck,
  BadgeIndianRupee,
  ArrowRight,
} from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "How It Works",
  description: "Understand how HiranandaniHomes works — browse verified listings, register interest for free, and connect directly with owners. Zero brokerage, completely free.",
};

const steps = [
  {
    icon: Search,
    step: "01",
    title: "Browse Verified Listings",
    desc: "Search through our curated, manually verified properties in Hiranandani Estate. Filter by BHK, budget, property type, and locality.",
    color: "bg-blue-50 text-blue-600",
  },
  {
    icon: CreditCard,
    step: "02",
    title: "Register Interest — Free",
    desc: "Found a property you like? Click 'Register Interest' — it's completely free. Owner contact details (phone, email, address) are revealed to you immediately.",
    color: "bg-green-50 text-green-600",
  },
  {
    icon: PhoneCall,
    step: "03",
    title: "Connect Directly with the Owner",
    desc: "Call or email the owner directly. Schedule a visit, negotiate the terms, and finalise the deal — no middleman, no hidden charges during this stage.",
    color: "bg-purple-50 text-purple-600",
  },
  {
    icon: Home,
    step: "04",
    title: "Sign the Deal & Move In",
    desc: "Negotiate directly with the owner, finalise the agreement, and move in. No fees, no commissions, no middlemen — ever.",
    color: "bg-orange-50 text-orange-600",
  },
];

export default function HowItWorksPage() {
  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-blue-900 to-indigo-900 text-white py-20">
        <div className="container mx-auto px-4 text-center max-w-3xl">
          <h1 className="text-4xl font-bold mb-4">How HiranandaniHomes Works</h1>
          <p className="text-blue-100 text-lg">
            We replaced traditional brokers with a simple, transparent process.
            Completely free. Direct access. Zero commissions.
          </p>
        </div>
      </section>

      {/* Steps */}
      <section className="py-20">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="space-y-12">
            {steps.map(({ icon: Icon, step, title, desc, color }, i) => (
              <div key={step} className="flex gap-6 items-start">
                <div className="shrink-0">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${color}`}>
                    <Icon className="h-7 w-7" />
                  </div>
                </div>
                <div className="flex-1 pt-1">
                  <span className="text-xs font-semibold text-gray-400 uppercase tracking-widest">
                    Step {step}
                  </span>
                  <h3 className="text-xl font-bold text-gray-900 mt-1 mb-2">{title}</h3>
                  <p className="text-gray-500 leading-relaxed">{desc}</p>
                </div>
                {i < steps.length - 1 && (
                  <div className="absolute left-7 mt-16 h-8 w-px bg-gray-200 hidden" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why no broker */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4 max-w-4xl">
          <h2 className="text-3xl font-bold text-center mb-10">Why No Broker?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              {
                icon: BadgeIndianRupee,
                title: "You save lakhs",
                desc: "Traditional brokers charge 1–2 months rent as commission. On a ₹60,000/month flat, that's ₹1.2L in brokerage. We charge ₹9,999 flat — period.",
              },
              {
                icon: ShieldCheck,
                title: "We verify, you decide",
                desc: "Our team verifies every listing before it goes live. You get accurate information and deal directly with the actual property owner — no inflated listings.",
              },
            ].map(({ icon: Icon, title, desc }) => (
              <Card key={title} className="border-0 shadow-sm">
                <CardContent className="pt-6">
                  <Icon className="h-8 w-8 text-blue-600 mb-3" />
                  <h3 className="font-semibold text-gray-900 mb-2">{title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to find your home?</h2>
          <p className="text-gray-500 mb-8">Browse verified listings in Hiranandani Estate today.</p>
          <Link href="/listings">
            <Button className="bg-blue-600 hover:bg-blue-700 px-8 gap-2">
              Browse Listings <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}

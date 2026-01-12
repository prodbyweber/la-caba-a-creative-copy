import React from "react";
import { motion } from "framer-motion";
import { Check, Star, Zap, Crown } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

const plans = [
  {
    name: "Starter",
    price: "299",
    period: "/month",
    description: "For emerging artists ready to build structure",
    icon: Zap,
    color: "emerald",
    features: [
      "Artist Dashboard Access",
      "Basic Performance Analytics",
      "Content Vault (10GB)",
      "2 Studio Sessions/month",
      "Distribution to 5 Platforms",
      "Email Support"
    ],
    cta: "Start Building",
    popular: false
  },
  {
    name: "Pro",
    price: "599",
    period: "/month",
    description: "For serious artists scaling their career",
    icon: Star,
    color: "purple",
    features: [
      "Everything in Starter",
      "Advanced Analytics & Forecasting",
      "Content Vault (50GB)",
      "6 Studio Sessions/month",
      "Distribution to 15+ Platforms",
      "Clip Control System",
      "Smart Wallet",
      "Priority Support"
    ],
    cta: "Go Pro",
    popular: true
  },
  {
    name: "Elite",
    price: "1,299",
    period: "/month",
    description: "For professional artists demanding excellence",
    icon: Crown,
    color: "orange",
    features: [
      "Everything in Pro",
      "AI-Powered Insights (Early Access)",
      "Unlimited Content Vault",
      "Unlimited Studio Sessions",
      "Global Distribution",
      "Dedicated Account Manager",
      "Revenue Optimization",
      "White-glove Support"
    ],
    cta: "Join Elite",
    popular: false
  }
];

export default function MembershipPlans() {
  return (
    <section id="pricing" className="relative py-32 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0b] via-[#111113] to-[#0a0a0b]" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-purple-500/5 rounded-full blur-[150px]" />

      <div className="relative max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="text-orange-400 text-sm font-medium tracking-wider uppercase mb-4 block">
            Membership
          </span>
          <h2 className="text-4xl sm:text-5xl font-bold mb-4">
            Invest in your <span className="text-purple-400">system</span>
          </h2>
          <p className="text-gray-400 text-lg max-w-xl mx-auto">
            Not just songs. A complete infrastructure for your creative career.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {plans.map((plan, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className={`relative ${plan.popular ? 'md:-mt-4 md:mb-4' : ''}`}
            >
              {/* Popular Badge */}
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1.5 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full text-xs font-bold z-10">
                  Most Popular
                </div>
              )}

              <div className={`bg-[#111113] rounded-3xl p-8 border ${plan.popular ? 'border-purple-500/30' : 'border-white/5'} hover:border-white/10 transition-all duration-500 h-full flex flex-col`}>
                {/* Header */}
                <div className="flex items-center gap-3 mb-4">
                  <div className={`w-12 h-12 rounded-xl bg-${plan.color}-500/10 flex items-center justify-center`}>
                    <plan.icon className={`w-6 h-6 text-${plan.color}-400`} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">{plan.name}</h3>
                    <p className="text-xs text-gray-500">{plan.description}</p>
                  </div>
                </div>

                {/* Price */}
                <div className="mb-6">
                  <div className="flex items-baseline gap-1">
                    <span className="text-sm text-gray-500">$</span>
                    <span className="text-5xl font-bold">{plan.price}</span>
                    <span className="text-gray-500">{plan.period}</span>
                  </div>
                </div>

                {/* Features */}
                <div className="flex-1 mb-8">
                  <ul className="space-y-3">
                    {plan.features.map((feature, j) => (
                      <li key={j} className="flex items-start gap-3">
                        <div className={`w-5 h-5 rounded-full bg-${plan.color}-500/10 flex items-center justify-center flex-shrink-0 mt-0.5`}>
                          <Check className={`w-3 h-3 text-${plan.color}-400`} />
                        </div>
                        <span className="text-sm text-gray-300">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* CTA */}
                <Link to={createPageUrl("Dashboard")}>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`w-full py-4 rounded-xl font-medium transition-all duration-300 ${
                      plan.popular
                        ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40'
                        : 'bg-white/5 border border-white/10 text-white hover:bg-white/10'
                    }`}
                  >
                    {plan.cta}
                  </motion.button>
                </Link>
              </div>

              {/* Background Glow for Popular */}
              {plan.popular && (
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-3xl blur-2xl -z-10" />
              )}
            </motion.div>
          ))}
        </div>

        {/* Money Back Guarantee */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mt-12"
        >
          <p className="text-gray-500 text-sm">
            14-day money-back guarantee. No questions asked.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
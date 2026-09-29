import React, { useState } from 'react';
import { Check, Sparkles, ShieldCheck, HelpCircle, ArrowRight, X } from 'lucide-react';
import { PRICING_PLANS } from '../config/appConfig';
import { useApp } from '../context/AppContext';
import { PricingPlan } from '../types';

export const PricingPage: React.FC = () => {
  const { user, updateUserProfile, addToast } = useApp();
  const [isAnnual, setIsAnnual] = useState(false);
  const [selectedPlanForUpgrade, setSelectedPlanForUpgrade] = useState<PricingPlan | null>(null);

  const handleSelectPlan = (plan: PricingPlan) => {
    if (plan.id === 'free') {
      updateUserProfile({ plan: 'Free' });
      addToast('Switched to Free Starter plan', 'info');
      return;
    }
    setSelectedPlanForUpgrade(plan);
  };

  const handleConfirmUpgrade = () => {
    if (!selectedPlanForUpgrade) return;
    updateUserProfile({ plan: selectedPlanForUpgrade.name.split(' ')[0] as any });
    addToast(`Successfully upgraded to ${selectedPlanForUpgrade.name}!`, 'success');
    setSelectedPlanForUpgrade(null);
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      {/* Title */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <span className="text-xs font-bold uppercase tracking-widest text-indigo-600 dark:text-indigo-400">
          Transparent Pricing
        </span>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 dark:text-white">
          Simple, Predictable Plans for Everyone
        </h1>
        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400">
          From individual Urdu storytellers to high-volume media agencies, pick the capacity that fits your workflow.
        </p>

        {/* Annual / Monthly Toggle */}
        <div className="pt-4 flex items-center justify-center gap-3">
          <span className={`text-xs font-semibold ${!isAnnual ? 'text-slate-900 dark:text-white' : 'text-slate-500'}`}>
            Monthly Billing
          </span>
          <button
            onClick={() => setIsAnnual(!isAnnual)}
            className="w-12 h-6 rounded-full bg-indigo-600 p-0.5 transition-colors relative"
          >
            <div
              className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform ${
                isAnnual ? 'translate-x-6' : 'translate-x-0'
              }`}
            />
          </button>
          <span className={`text-xs font-semibold flex items-center gap-1.5 ${isAnnual ? 'text-slate-900 dark:text-white' : 'text-slate-500'}`}>
            <span>Annual Billing</span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              Save 20%
            </span>
          </span>
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
        {PRICING_PLANS.map((plan) => {
          const isCurrentPlan = user.plan.toLowerCase() === plan.id;
          const price = isAnnual ? plan.priceAnnual : plan.priceMonthly;

          return (
            <div
              key={plan.id}
              className={`relative rounded-3xl p-7 flex flex-col justify-between transition-all ${
                plan.popular
                  ? 'border-2 border-indigo-600 dark:border-indigo-500 bg-white dark:bg-slate-900 shadow-xl shadow-indigo-500/10 md:-translate-y-2'
                  : 'border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 shadow-sm'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-indigo-600 text-white text-[11px] font-extrabold uppercase tracking-wider shadow-md">
                  Most Popular
                </div>
              )}

              <div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                  {plan.name}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 min-h-[32px]">
                  {plan.description}
                </p>

                {/* Price display */}
                <div className="mt-5 pb-6 border-b border-slate-100 dark:border-slate-800 flex items-baseline gap-1">
                  <span className="text-4xl font-extrabold text-slate-900 dark:text-white">
                    ${price}
                  </span>
                  <span className="text-xs font-semibold text-slate-500">
                    / month {isAnnual && price > 0 ? '(billed yearly)' : ''}
                  </span>
                </div>

                {/* Capacity badge */}
                <div className="mt-4 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800/80 text-xs font-semibold text-slate-700 dark:text-slate-300">
                  ⚡ {plan.formattedChars}
                </div>

                {/* Feature List */}
                <div className="mt-6 space-y-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Included Features
                  </span>
                  <ul className="space-y-2.5 text-xs text-slate-600 dark:text-slate-300">
                    {plan.features.map((feat, idx) => (
                      <li key={idx} className="flex items-start gap-2.5">
                        <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Action Button */}
              <div className="mt-8 pt-4">
                <button
                  onClick={() => handleSelectPlan(plan)}
                  disabled={isCurrentPlan}
                  className={`w-full py-3 rounded-xl font-bold text-xs transition shadow-sm ${
                    isCurrentPlan
                      ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-default'
                      : plan.popular
                      ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-500/25'
                      : 'bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900'
                  }`}
                >
                  {isCurrentPlan ? 'Current Plan' : plan.cta}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* UPGRADE MODAL */}
      {selectedPlanForUpgrade && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 max-w-md w-full shadow-2xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-600" />
                <span>Upgrade to {selectedPlanForUpgrade.name}</span>
              </h3>
              <button
                onClick={() => setSelectedPlanForUpgrade(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-600 dark:text-slate-300">
              <p>
                You are switching to the <strong>{selectedPlanForUpgrade.name}</strong> with a quota of{' '}
                <strong>{selectedPlanForUpgrade.formattedChars}</strong>.
              </p>

              <div className="p-3 rounded-xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/80 text-[11px] text-indigo-900 dark:text-indigo-200">
                <strong>Payment Integration Note:</strong> For production deployment, connect Stripe or LemonSqueezy webhook keys in your environment variables. In this build environment, confirming will instantly activate your plan tier and quota.
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setSelectedPlanForUpgrade(null)}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmUpgrade}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md transition"
              >
                Confirm Upgrade
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

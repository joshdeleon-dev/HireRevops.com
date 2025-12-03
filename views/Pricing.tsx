
import React, { useState } from 'react';
import { PlanTier } from '../types';
import { PLANS } from '../constants';
import { Button } from '../components/Button';
import { Check, Shield, Zap, Building2, CreditCard, Loader2 } from 'lucide-react';
import * as DB from '../services/database';

interface PricingViewProps {
  onBack: () => void;
  currentUser: any;
  onUpgradeSuccess: () => void;
}

export const PricingView: React.FC<PricingViewProps> = ({ onBack, currentUser, onUpgradeSuccess }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedPlanId, setSelectedPlanId] = useState<PlanTier | null>(null);

  // Determine current plan
  const company = currentUser?.companyId ? DB.getCompanyById(currentUser.companyId) : null;
  const currentPlanId = company?.subscription?.planId || PlanTier.FREE;

  const handleSubscribe = (planId: PlanTier) => {
    setSelectedPlanId(planId);
    setIsProcessing(true);

    // Simulate Stripe Checkout Flow
    setTimeout(() => {
      if (company) {
        DB.upgradeSubscription(company.id, planId);
        onUpgradeSuccess();
      }
      setIsProcessing(false);
      setSelectedPlanId(null);
      alert(`Successfully subscribed to ${PLANS[planId].name}!`);
      onBack();
    }, 2000);
  };

  const PlanCard = ({ tier }: { tier: PlanTier }) => {
    const plan = PLANS[tier];
    const isCurrent = currentPlanId === tier;
    const isPopular = tier === PlanTier.PROFESSIONAL;

    return (
      <div className={`relative flex flex-col p-8 bg-white rounded-2xl border ${isCurrent ? 'border-emerald-500 ring-2 ring-emerald-500 ring-offset-2' : 'border-gray-200'} ${isPopular && !isCurrent ? 'border-purple-200 shadow-xl' : 'shadow-sm'} transition-all hover:shadow-md`}>
        {isPopular && (
           <div className="absolute top-0 right-0 bg-purple-600 text-white text-xs font-bold px-3 py-1 rounded-bl-xl rounded-tr-xl">
              MOST POPULAR
           </div>
        )}
        <div className="mb-4">
          <h3 className="text-xl font-bold text-gray-900">{plan.name}</h3>
          <div className="mt-2 flex items-baseline gap-1">
             <span className="text-3xl font-bold text-gray-900">${plan.price}</span>
             <span className="text-gray-500">/month</span>
          </div>
        </div>
        
        <ul className="flex-1 space-y-4 mb-8">
          {plan.features.map((feat, i) => (
            <li key={i} className="flex items-start gap-3 text-sm text-gray-600">
               <Check className="w-5 h-5 text-emerald-500 flex-shrink-0" />
               {feat}
            </li>
          ))}
        </ul>

        {isCurrent ? (
           <Button variant="outline" disabled className="w-full border-emerald-200 bg-emerald-50 text-emerald-700 font-bold">Current Plan</Button>
        ) : (
           <Button 
             className={`w-full ${tier === PlanTier.ENTERPRISE ? 'bg-slate-900' : 'bg-emerald-600'} hover:opacity-90`}
             onClick={() => handleSubscribe(tier)}
             disabled={isProcessing}
           >
             {tier === PlanTier.FREE ? 'Downgrade' : `Upgrade to ${plan.name}`}
           </Button>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 py-20 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
           <button onClick={onBack} className="text-sm text-gray-500 hover:text-emerald-600 mb-4 inline-flex items-center gap-1">
              &larr; Back to Dashboard
           </button>
           <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">Choose the right plan for your team</h1>
           <p className="text-xl text-slate-500 max-w-2xl mx-auto">
             Whether you're hiring your first GTM engineer or scaling a global RevOps organization, we have a plan for you.
           </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
           <PlanCard tier={PlanTier.FREE} />
           <PlanCard tier={PlanTier.LITE} />
           <PlanCard tier={PlanTier.PROFESSIONAL} />
           <PlanCard tier={PlanTier.ENTERPRISE} />
        </div>

        <div className="mt-20 bg-white rounded-2xl p-10 border border-gray-200 flex flex-col md:flex-row items-center justify-between gap-8">
           <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center">
                 <Shield className="w-6 h-6 text-slate-600" />
              </div>
              <div>
                 <h3 className="font-bold text-lg text-gray-900">Enterprise Security</h3>
                 <p className="text-gray-500">SSO, SOC2 compliance, and dedicated support available.</p>
              </div>
           </div>
           <Button variant="outline">Contact Sales</Button>
        </div>
      </div>

      {/* Stripe Simulation Modal */}
      {isProcessing && selectedPlanId && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
           <div className="bg-white rounded-xl p-8 max-w-md w-full shadow-2xl text-center">
              <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
                 <CreditCard className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Processing Payment</h3>
              <p className="text-gray-500 mb-8">Securely connecting to Stripe Checkout for {PLANS[selectedPlanId].name}...</p>
              
              <div className="flex items-center justify-center gap-3 text-sm text-gray-400">
                 <Loader2 className="w-5 h-5 animate-spin" />
                 <span>Verifying credentials...</span>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

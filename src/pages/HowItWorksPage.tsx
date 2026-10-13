import React from 'react';
import {
  FileText,
  MapPin,
  CheckCircle,
  Truck,
  Sparkles,
  ShieldCheck,
  ArrowRight,
  Clock,
} from 'lucide-react';

interface HowItWorksPageProps {
  onNavigate: (page: string) => void;
}

export const HowItWorksPage: React.FC<HowItWorksPageProps> = ({ onNavigate }) => {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      {/* Header */}
      <div className="space-y-3">
        <div className="text-xs font-semibold text-emerald-700 tracking-wider uppercase font-mono">
          Transparent Operations
        </div>
        <h1 className="text-3xl font-extrabold text-neutral-900">
          How FoodShare Lanka Works
        </h1>
        <p className="text-base text-neutral-600 max-w-2xl leading-relaxed">
          From function hall to dining table in under 4 hours. A transaction-safe, verified redistribution workflow tailored to Jaffna District.
        </p>
      </div>

      {/* 6 Step Interactive Process Diagram */}
      <div className="space-y-6">
        <h2 className="text-xl font-bold text-neutral-900">The 6-Step Redistribution Workflow</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
          <div className="p-5 bg-white rounded-xl border border-neutral-200 shadow-xs space-y-2">
            <div className="flex items-center justify-between text-neutral-400 font-mono">
              <span className="font-bold text-emerald-700 text-sm">Step 01</span>
              <FileText className="w-4 h-4 text-emerald-600" />
            </div>
            <h3 className="text-sm font-bold text-neutral-900">Donor Posts Surplus Listing</h3>
            <p className="text-neutral-600 leading-relaxed">
              Wedding halls or caterers log food category, portion count, preparation timestamp, holding conditions, and safe deadline.
            </p>
          </div>

          <div className="p-5 bg-white rounded-xl border border-neutral-200 shadow-xs space-y-2">
            <div className="flex items-center justify-between text-neutral-400 font-mono">
              <span className="font-bold text-emerald-700 text-sm">Step 02</span>
              <MapPin className="w-4 h-4 text-emerald-600" />
            </div>
            <h3 className="text-sm font-bold text-neutral-900">Smart Jaffna Match Engine</h3>
            <p className="text-neutral-600 leading-relaxed">
              The platform immediately pinpoints registered children's and elders' homes within 2-15km with matching dietary preferences.
            </p>
          </div>

          <div className="p-5 bg-white rounded-xl border border-neutral-200 shadow-xs space-y-2">
            <div className="flex items-center justify-between text-neutral-400 font-mono">
              <span className="font-bold text-emerald-700 text-sm">Step 03</span>
              <CheckCircle className="w-4 h-4 text-emerald-600" />
            </div>
            <h3 className="text-sm font-bold text-neutral-900">Institution Submits Request</h3>
            <p className="text-neutral-600 leading-relaxed">
              The home requests specific portions (cannot exceed remaining balance) and indicates pickup or delivery arrangements.
            </p>
          </div>

          <div className="p-5 bg-white rounded-xl border border-neutral-200 shadow-xs space-y-2">
            <div className="flex items-center justify-between text-neutral-400 font-mono">
              <span className="font-bold text-emerald-700 text-sm">Step 04</span>
              <Clock className="w-4 h-4 text-emerald-600" />
            </div>
            <h3 className="text-sm font-bold text-neutral-900">Donor Review & Approval</h3>
            <p className="text-neutral-600 leading-relaxed">
              Donor approves the request. Portions are reserved in real-time, preventing double allocation or over-commitment.
            </p>
          </div>

          <div className="p-5 bg-white rounded-xl border border-neutral-200 shadow-xs space-y-2">
            <div className="flex items-center justify-between text-neutral-400 font-mono">
              <span className="font-bold text-emerald-700 text-sm">Step 05</span>
              <Truck className="w-4 h-4 text-emerald-600" />
            </div>
            <h3 className="text-sm font-bold text-neutral-900">Hygienic Collection</h3>
            <p className="text-neutral-600 leading-relaxed">
              Care home vehicle arrives with clean stainless steel pots. Temperature and aroma are verified at the venue.
            </p>
          </div>

          <div className="p-5 bg-white rounded-xl border border-neutral-200 shadow-xs space-y-2">
            <div className="flex items-center justify-between text-neutral-400 font-mono">
              <span className="font-bold text-emerald-700 text-sm">Step 06</span>
              <Sparkles className="w-4 h-4 text-emerald-600" />
            </div>
            <h3 className="text-sm font-bold text-neutral-900">Receipt Confirmation</h3>
            <p className="text-neutral-600 leading-relaxed">
              Recipient marks food as collected. The donation status is finalized, logging portions into Jaffna's waste diversion record.
            </p>
          </div>
        </div>
      </div>

      {/* Two Roles Comparison */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
        <div className="bg-emerald-50/60 border border-emerald-200 p-6 rounded-xl space-y-3">
          <h3 className="text-base font-bold text-emerald-950">For Food Donors</h3>
          <ul className="text-xs space-y-2 text-emerald-900/90 leading-relaxed">
            <li>• Quick 2-minute posting on mobile or desktop</li>
            <li>• Instant notification of nearby requests</li>
            <li>• Total control to approve or decline requests</li>
            <li>• Verified charity documentation for every donation</li>
          </ul>
          <button
            onClick={() => onNavigate('donorDashboard')}
            className="mt-2 text-xs font-semibold text-emerald-800 hover:text-emerald-950 flex items-center gap-1"
          >
            <span>Open Donor Portal</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="bg-teal-50/60 border border-teal-200 p-6 rounded-xl space-y-3">
          <h3 className="text-base font-bold text-teal-950">For Care Homes & Shelters</h3>
          <ul className="text-xs space-y-2 text-teal-900/90 leading-relaxed">
            <li>• Live feed of nearby surplus meals in Jaffna</li>
            <li>• Exact allergen and spice disclosure upfront</li>
            <li>• Capacity-based portion requests</li>
            <li>• Direct contact numbers for pickup coordination</li>
          </ul>
          <button
            onClick={() => onNavigate('institutionDashboard')}
            className="mt-2 text-xs font-semibold text-teal-800 hover:text-teal-950 flex items-center gap-1"
          >
            <span>Open Institution Portal</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};

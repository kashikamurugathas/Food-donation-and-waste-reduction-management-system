import React from 'react';
import {
  ShieldAlert,
  Thermometer,
  Clock,
  CheckSquare,
  AlertTriangle,
  FileCheck2,
  Package,
  HeartHandshake,
} from 'lucide-react';

export const FoodSafetyPage: React.FC = () => {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Header */}
      <div className="space-y-2">
        <div className="text-xs font-semibold text-emerald-700 tracking-wider uppercase font-mono">
          Public Health & Hygiene Protocol
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900">
          Food Safety Guidelines & Standard Operating Procedures
        </h1>
        <p className="text-sm text-neutral-600 max-w-3xl leading-relaxed">
          FoodShare Lanka enforces strict hygiene and safe holding policies across Jaffna District. Donated surplus food must never compromise the health of children and elderly residents.
        </p>
      </div>

      {/* Critical Disclaimer Box */}
      <div className="bg-amber-50 border border-amber-300 rounded-xl p-5 text-amber-950 space-y-2">
        <div className="flex items-center gap-2 font-bold text-amber-900 text-sm">
          <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0" />
          <span>Non-Certification Policy (Important Notice)</span>
        </div>
        <p className="text-xs text-amber-900/90 leading-relaxed">
          FoodShare Lanka acts as a coordination network. <strong className="font-semibold">The platform does not automatically certify food as safe based solely on donor-entered information.</strong> Every receiving institution is empowered and required to conduct a mandatory sensory and temperature inspection upon collection before serving meals.
        </p>
      </div>

      {/* The 4-Hour Cooked Food Rule */}
      <div className="bg-white rounded-xl border border-neutral-200 p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-neutral-900">The 4-Hour Rule for Surplus Cooked Food</h2>
            <p className="text-xs text-neutral-500">Universal standard for banquet and catered food redistribution in Sri Lanka</p>
          </div>
        </div>

        <p className="text-xs text-neutral-600 leading-relaxed">
          In tropical climates like Jaffna, prepared rice, lentils (dhal), gravies, and curries are subject to rapid bacterial growth if left in the "Temperature Danger Zone".
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs pt-2">
          <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-200 space-y-1.5">
            <span className="font-bold text-emerald-900">0 to 2 Hours</span>
            <p className="text-emerald-800 text-[11px] leading-relaxed">
              Ideal window. Surplus food is freshly covered or held in chafing warmers. Can be safely collected and consumed immediately.
            </p>
          </div>
          <div className="p-4 bg-amber-50 rounded-lg border border-amber-200 space-y-1.5">
            <span className="font-bold text-amber-900">2 to 4 Hours</span>
            <p className="text-amber-800 text-[11px] leading-relaxed">
              Urgent collection window. Must be collected and consumed immediately or rapidly refrigerated below 5°C.
            </p>
          </div>
          <div className="p-4 bg-rose-50 rounded-lg border border-rose-200 space-y-1.5">
            <span className="font-bold text-rose-900">&gt; 4 Hours Ambient</span>
            <p className="text-rose-800 text-[11px] leading-relaxed">
              Strictly Discard. If cooked food remained at room temperature for over 4 hours, listings automatically expire and cannot be served.
            </p>
          </div>
        </div>
      </div>

      {/* Temperature Safety Chart */}
      <div className="bg-white rounded-xl border border-neutral-200 p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-teal-100 text-teal-800 flex items-center justify-center font-bold">
            <Thermometer className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-neutral-900">Temperature Holding Standards</h2>
            <p className="text-xs text-neutral-500">Preventing the Danger Zone (5°C to 60°C)</p>
          </div>
        </div>

        <div className="space-y-3 text-xs">
          <div className="p-3 bg-neutral-50 rounded-lg border border-neutral-200 flex items-start gap-3">
            <div className="font-mono font-bold text-emerald-700 whitespace-nowrap">&gt; 60°C</div>
            <div>
              <strong className="text-neutral-900">Hot Holding Zone:</strong> Wedding banquet warmers, steam tables, and insulated catering thermal carriers keep cooked rice and curries piping hot, safely stopping bacterial proliferation.
            </div>
          </div>

          <div className="p-3 bg-neutral-50 rounded-lg border border-neutral-200 flex items-start gap-3">
            <div className="font-mono font-bold text-teal-700 whitespace-nowrap">&lt; 5°C</div>
            <div>
              <strong className="text-neutral-900">Cold Storage Zone:</strong> Commercial refrigeration or chilled ice-pack boxes for fresh cut fruit platters, desserts, and bakery items.
            </div>
          </div>

          <div className="p-3 bg-rose-50 rounded-lg border border-rose-200 flex items-start gap-3">
            <div className="font-mono font-bold text-rose-700 whitespace-nowrap">5°C – 60°C</div>
            <div>
              <strong className="text-rose-900">Temperature Danger Zone:</strong> Food must never sit open in this range. All donations must be shielded with food-grade lids.
            </div>
          </div>
        </div>
      </div>

      {/* Mandatory Inspection Checklist for Receiving Homes */}
      <div className="bg-white rounded-xl border border-neutral-200 p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
            <CheckSquare className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-neutral-900">Care Home Receiving Checklist</h2>
            <p className="text-xs text-neutral-500">Required steps before serving food to residents</p>
          </div>
        </div>

        <ul className="space-y-2.5 text-xs text-neutral-700">
          <li className="flex items-start gap-2.5">
            <FileCheck2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <span><strong>Visual Inspection:</strong> Confirm food shows no signs of drying, odd discoloration, or unsealed contamination.</span>
          </li>
          <li className="flex items-start gap-2.5">
            <FileCheck2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <span><strong>Aroma Check:</strong> Confirm fresh aroma with no sourness or fermentation, especially in coconut milk (sothi/curry) preparations.</span>
          </li>
          <li className="flex items-start gap-2.5">
            <FileCheck2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <span><strong>Clean Transport Vessels:</strong> Ensure drivers transport food exclusively in clean, covered stainless steel vessels or food-grade containers.</span>
          </li>
          <li className="flex items-start gap-2.5">
            <FileCheck2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <span><strong>Re-Heating Requirement:</strong> Any hot meal collected after 2 hours must be brought to a rolling boil or reheated above 75°C prior to service.</span>
          </li>
        </ul>
      </div>
    </div>
  );
};

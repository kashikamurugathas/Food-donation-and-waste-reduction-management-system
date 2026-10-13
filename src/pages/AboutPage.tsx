import React from 'react';
import { HeartHandshake, ShieldCheck, MapPin, Users, Target, ArrowRight } from 'lucide-react';

interface AboutPageProps {
  onNavigate: (page: string) => void;
}

export const AboutPage: React.FC<AboutPageProps> = ({ onNavigate }) => {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      {/* Hero */}
      <div className="space-y-3">
        <div className="text-xs font-semibold text-emerald-700 tracking-wider uppercase font-mono">
          Our Heritage & Community Mission
        </div>
        <h1 className="text-3xl font-extrabold text-neutral-900">
          About FoodShare Lanka
        </h1>
        <p className="text-base text-neutral-600 max-w-2xl leading-relaxed">
          Bridging abundance and necessity across Jaffna District. We transform banquet surplus into wholesome nutrition for registered care homes.
        </p>
      </div>

      {/* Narrative Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        <div className="space-y-4 text-sm text-neutral-600 leading-relaxed">
          <h2 className="text-xl font-bold text-neutral-900">Rooted in Jaffna Hospitality</h2>
          <p>
            In Northern Province, weddings and communal gatherings are celebrated with boundless generosity. However, cultural expectations of abundance often leave caterers and families with 50 to 100 extra portions of hot, delicious meals.
          </p>
          <p>
            Meanwhile, children's homes in Nallur, elders' sanctuaries in Kopay, and care centres in Point Pedro face high operating expenses. FoodShare Lanka is an independent, non-commercial initiative providing the digital bridge to coordinate collection safely, swiftly, and with profound respect.
          </p>
        </div>
        <div className="rounded-xl overflow-hidden border border-neutral-200 shadow-sm">
          <img
            src="/src/assets/images/hero_jaffna_feast_1791886444901.jpg"
            alt="Traditional Jaffna banquet meal"
            referrerPolicy="no-referrer"
            className="w-full h-64 object-cover"
          />
        </div>
      </div>

      {/* Core Values */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6">
        <div className="p-6 bg-white rounded-xl border border-neutral-200 space-y-2 shadow-xs">
          <div className="w-9 h-9 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
            <HeartHandshake className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-neutral-900">Preserving Dignity</h3>
          <p className="text-xs text-neutral-600 leading-relaxed">
            Every meal is shared fresh and handled in pristine condition, treating every recipient with total dignity.
          </p>
        </div>

        <div className="p-6 bg-white rounded-xl border border-neutral-200 space-y-2 shadow-xs">
          <div className="w-9 h-9 rounded-lg bg-teal-100 text-teal-800 flex items-center justify-center font-bold">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-neutral-900">Zero Commercialisation</h3>
          <p className="text-xs text-neutral-600 leading-relaxed">
            This is strictly a donation network. No fees, no platform margins, and no food reselling.
          </p>
        </div>

        <div className="p-6 bg-white rounded-xl border border-neutral-200 space-y-2 shadow-xs">
          <div className="w-9 h-9 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
            <MapPin className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-neutral-900">Jaffna District Dedicated</h3>
          <p className="text-xs text-neutral-600 leading-relaxed">
            Optimised for GN divisions from Point Pedro to Chavakachcheri with smart distance matching.
          </p>
        </div>
      </div>

      {/* Action */}
      <div className="p-8 bg-neutral-900 text-white rounded-xl flex flex-col sm:flex-row items-center justify-between gap-6">
        <div>
          <h3 className="text-lg font-bold">Ready to support our community?</h3>
          <p className="text-xs text-neutral-400 mt-1">Join as a verified donor or register your care home today.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate('register')}
            className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-emerald-950 font-bold text-xs rounded-lg transition-colors"
          >
            Register Institution or Donor
          </button>
        </div>
      </div>
    </div>
  );
};

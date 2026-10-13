import React from 'react';
import { HeartHandshake, Phone, Mail, MapPin, ShieldCheck, Heart } from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface FooterProps {
  onNavigate: (page: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  const { language, t } = useApp();

  return (
    <footer className="bg-neutral-900 text-neutral-300 border-t border-neutral-800 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Col 1: Brand & Social Impact Mission */}
          <div className="space-y-3 md:col-span-1">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-emerald-600 flex items-center justify-center text-white">
                <HeartHandshake className="w-4 h-4" />
              </div>
              <span className="text-base font-bold text-white tracking-tight">FoodShare Lanka</span>
            </div>
            <p className="text-xs text-neutral-400 leading-relaxed font-tamil">
              “{t.tagline}”
            </p>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Eliminating wedding and event food waste in Jaffna District by bridging generous hosts with registered children’s and elders’ homes in dignity and hygiene.
            </p>
          </div>

          {/* Col 2: Useful Navigation */}
          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-white">Platform Navigation</h4>
            <ul className="space-y-1.5 text-neutral-400">
              <li>
                <button onClick={() => onNavigate('home')} className="hover:text-emerald-400 transition-colors">
                  {t.nav.home}
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('availableFood')} className="hover:text-emerald-400 transition-colors">
                  {t.nav.availableFood}
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('institutions')} className="hover:text-emerald-400 transition-colors">
                  {t.nav.institutions}
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('howItWorks')} className="hover:text-emerald-400 transition-colors">
                  {t.nav.howItWorks}
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('safety')} className="hover:text-emerald-400 transition-colors">
                  {t.nav.safety}
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('contact')} className="hover:text-emerald-400 transition-colors">
                  {t.nav.contact}
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('login')} className="hover:text-emerald-400 transition-colors text-emerald-400 font-medium">
                  {t.nav.login}
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('register')} className="hover:text-emerald-400 transition-colors">
                  {t.nav.register}
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Food Safety & Operating Standards */}
          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-white">Food Safety Standards</h4>
            <div className="space-y-2 text-neutral-400">
              <div className="flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>Strict 4-Hour cooked food window enforced across Jaffna.</span>
              </div>
              <div className="flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>Allergen disclosure and safe hot-holding or cold transport mandatory.</span>
              </div>
              <div className="flex items-start gap-2">
                <Heart className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>Non-commercial donation platform, zero fee for non-profits.</span>
              </div>
            </div>
          </div>

          {/* Col 4: Jaffna District Operations Office */}
          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-white">Jaffna District Desk</h4>
            <div className="space-y-1.5 text-neutral-400">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-neutral-500 shrink-0 mt-0.5" />
                <span>Kandy Road, Jaffna Town, Northern Province, Sri Lanka</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-neutral-500 shrink-0" />
                <span className="font-mono tabular-nums">+94 21 222 3456 / +94 77 123 4567</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-neutral-500 shrink-0" />
                <span>support@foodshare.lk</span>
              </div>
            </div>
            <div className="pt-2 text-[11px] text-neutral-500">
              Coverage: Nallur · Jaffna Town · Chavakachcheri · Point Pedro · Kopay · Manipay · Chunnakam · Chankanai
            </div>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-neutral-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-neutral-500">
          <div>
            © {new Date().getFullYear()} FoodShare Lanka. All rights reserved.
          </div>
          <div>
            Social Impact Project for Northern Province, Sri Lanka. Demonstration sample data for evaluation.
          </div>
        </div>
      </div>
    </footer>
  );
};

import React from 'react';
import { AlertCircle } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const DemoBanner: React.FC = () => {
  const { language } = useApp();

  return (
    <aside aria-label="Sample demonstration notice" className="bg-amber-50 border-b border-amber-200/80 px-4 py-2 text-xs text-amber-900">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-amber-700 shrink-0" />
          <span>
            {language === 'ta'
              ? 'கவனிக்க: இதில் காட்டப்படும் இல்லங்கள் மற்றும் விநியோக விபரங்கள் மாதிரி செயல்விளக்கத் தரவுகளாகும். உண்மையான உணவுப் பாதுகாப்பு நெறிமுறைகள் கண்டிப்பாகப் பின்பற்றப்பட வேண்டும்.'
              : 'Notice: Participating care homes and demonstration listings shown are sample data for Jaffna District. Real food safety deadlines and temperature checks are strictly enforced.'}
          </span>
        </div>
        <span className="hidden sm:inline font-mono tabular-nums text-amber-700 shrink-0 font-medium">
          Jaffna District · Northern Province
        </span>
      </div>
    </aside>
  );
};

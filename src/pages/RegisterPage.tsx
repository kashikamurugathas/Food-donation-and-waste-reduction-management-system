import React, { useState } from 'react';
import { HeartHandshake, UserPlus, Building, Users, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { UserRole } from '../types';
import { JAFFNA_AREA_LIST } from '../utils/geoUtils';

interface RegisterPageProps {
  onNavigate: (page: string) => void;
}

export const RegisterPage: React.FC<RegisterPageProps> = ({ onNavigate }) => {
  const { registerUser } = useApp();
  const [role, setRole] = useState<'donor' | 'institution'>('donor');
  const [successMessage, setSuccessMessage] = useState(false);

  // Donor fields
  const [donorData, setDonorData] = useState({
    name: '',
    organizationType: 'Wedding Hall',
    contactPerson: '',
    phone: '',
    email: '',
    address: '',
    area: 'Nallur',
    password: '',
  });

  // Institution fields
  const [instData, setInstData] = useState({
    name: '',
    institutionType: "Children's Home",
    registrationNumber: '',
    contactPerson: '',
    phone: '',
    email: '',
    address: '',
    area: 'Nallur',
    residentCount: 35,
    dietaryPreferences: 'Pure Vegetarian Preferred, Mild Spiced',
    operatingHours: '08:00 AM - 08:30 PM',
    needsDelivery: false,
    notes: '',
    password: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (role === 'donor') {
      if (!donorData.name || !donorData.email || !donorData.phone) return;
      registerUser(donorData, 'donor');
    } else {
      if (!instData.name || !instData.email || !instData.registrationNumber) return;
      registerUser(
        {
          ...instData,
          dietaryPreferences: instData.dietaryPreferences.split(',').map((s) => s.trim()),
        },
        'institution'
      );
    }
    setSuccessMessage(true);
    setTimeout(() => {
      if (role === 'donor') onNavigate('donorDashboard');
      else onNavigate('institutionDashboard');
    }, 1800);
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-12 space-y-8">
      <div className="text-center space-y-2">
        <div className="w-12 h-12 rounded-xl bg-emerald-700 text-white flex items-center justify-center mx-auto shadow-sm">
          <HeartHandshake className="w-6 h-6" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900">
          Create an Account on FoodShare Lanka
        </h1>
        <p className="text-xs text-neutral-500 max-w-md mx-auto">
          Register to donate event surplus or request meals for your care facility in Jaffna District.
        </p>
      </div>

      {successMessage ? (
        <div className="bg-white p-8 rounded-xl border border-neutral-200 shadow-sm text-center space-y-3">
          <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
          <h2 className="text-lg font-bold text-neutral-900">Registration Submitted Successfully!</h2>
          <p className="text-xs text-neutral-600 max-w-sm mx-auto">
            Your account profile has been created and queued for Jaffna District verification. Redirecting to your dashboard...
          </p>
        </div>
      ) : (
        <div className="bg-white p-6 sm:p-8 rounded-xl border border-neutral-200 shadow-xs space-y-6">
          {/* Role Chooser */}
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setRole('donor')}
              className={`p-4 rounded-xl border text-left transition-colors flex items-start gap-3 ${
                role === 'donor'
                  ? 'border-emerald-600 bg-emerald-50/50 text-emerald-950'
                  : 'border-neutral-200 hover:border-neutral-300 text-neutral-700'
              }`}
            >
              <Building className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-sm block">Food Donor</span>
                <span className="text-[11px] text-neutral-500">Wedding hall, hotel, caterer, or family</span>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setRole('institution')}
              className={`p-4 rounded-xl border text-left transition-colors flex items-start gap-3 ${
                role === 'institution'
                  ? 'border-emerald-600 bg-emerald-50/50 text-emerald-950'
                  : 'border-neutral-200 hover:border-neutral-300 text-neutral-700'
              }`}
            >
              <Users className="w-5 h-5 text-teal-700 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-sm block">Receiving Institution</span>
                <span className="text-[11px] text-neutral-500">Children's home or elders' sanctuary</span>
              </div>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            {role === 'donor' ? (
              /* Donor Form */
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="donor-hall-name" className="block font-medium text-neutral-700 mb-1">
                      Hall, Venue, or Organization Name *
                    </label>
                    <input
                      id="donor-hall-name"
                      type="text"
                      required
                      placeholder="e.g. Raja Palace Wedding Hall"
                      value={donorData.name}
                      onChange={(e) => setDonorData({ ...donorData, name: e.target.value })}
                      className="w-full p-2.5 border border-neutral-300 rounded-lg focus:outline-emerald-600"
                    />
                  </div>
                  <div>
                    <label htmlFor="donor-org-type" className="block font-medium text-neutral-700 mb-1">Organization Category *</label>
                    <select
                      id="donor-org-type"
                      value={donorData.organizationType}
                      onChange={(e) => setDonorData({ ...donorData, organizationType: e.target.value as any })}
                      className="w-full p-2.5 border border-neutral-300 rounded-lg bg-white focus:outline-emerald-600"
                    >
                      <option value="Wedding Hall">Wedding Hall</option>
                      <option value="Hotel/Restaurant">Hotel / Restaurant</option>
                      <option value="Catering Service">Catering Service</option>
                      <option value="Individual Host">Individual Family Host</option>
                      <option value="Bakery">Bakery / Confectionery</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="donor-contact-person" className="block font-medium text-neutral-700 mb-1">Contact Person Name *</label>
                    <input
                      id="donor-contact-person"
                      type="text"
                      required
                      placeholder="e.g. Senthil Kumaran"
                      value={donorData.contactPerson}
                      onChange={(e) => setDonorData({ ...donorData, contactPerson: e.target.value })}
                      className="w-full p-2.5 border border-neutral-300 rounded-lg focus:outline-emerald-600"
                    />
                  </div>
                  <div>
                    <label htmlFor="donor-phone" className="block font-medium text-neutral-700 mb-1">Mobile Phone (Sri Lanka) *</label>
                    <input
                      id="donor-phone"
                      type="tel"
                      required
                      placeholder="+94 77 123 4567"
                      value={donorData.phone}
                      onChange={(e) => setDonorData({ ...donorData, phone: e.target.value })}
                      className="w-full p-2.5 border border-neutral-300 rounded-lg font-mono focus:outline-emerald-600"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="donor-email" className="block font-medium text-neutral-700 mb-1">Email Address *</label>
                    <input
                      id="donor-email"
                      type="email"
                      required
                      placeholder="hall@jaffna.lk"
                      value={donorData.email}
                      onChange={(e) => setDonorData({ ...donorData, email: e.target.value })}
                      className="w-full p-2.5 border border-neutral-300 rounded-lg focus:outline-emerald-600"
                    />
                  </div>
                  <div>
                    <label htmlFor="donor-area" className="block font-medium text-neutral-700 mb-1">Jaffna Area (GN Division) *</label>
                    <select
                      id="donor-area"
                      value={donorData.area}
                      onChange={(e) => setDonorData({ ...donorData, area: e.target.value })}
                      className="w-full p-2.5 border border-neutral-300 rounded-lg bg-white focus:outline-emerald-600"
                    >
                      {JAFFNA_AREA_LIST.map((a) => (
                        <option key={a} value={a}>
                          {a}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label htmlFor="donor-address" className="block font-medium text-neutral-700 mb-1">Full Pickup Address *</label>
                  <input
                    id="donor-address"
                    type="text"
                    required
                    placeholder="e.g. Point Pedro Road, Nallur, Jaffna"
                    value={donorData.address}
                    onChange={(e) => setDonorData({ ...donorData, address: e.target.value })}
                    className="w-full p-2.5 border border-neutral-300 rounded-lg focus:outline-emerald-600"
                  />
                </div>

                <div>
                  <label htmlFor="donor-password" className="block font-medium text-neutral-700 mb-1">Set Password *</label>
                  <input
                    id="donor-password"
                    type="password"
                    required
                    placeholder="••••••••"
                    value={donorData.password}
                    onChange={(e) => setDonorData({ ...donorData, password: e.target.value })}
                    className="w-full p-2.5 border border-neutral-300 rounded-lg font-mono focus:outline-emerald-600"
                  />
                </div>
              </>
            ) : (
              /* Institution Form */
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="inst-name" className="block font-medium text-neutral-700 mb-1">Institution Name *</label>
                    <input
                      id="inst-name"
                      type="text"
                      required
                      placeholder="e.g. Anbu Children's Home"
                      value={instData.name}
                      onChange={(e) => setInstData({ ...instData, name: e.target.value })}
                      className="w-full p-2.5 border border-neutral-300 rounded-lg focus:outline-emerald-600"
                    />
                  </div>
                  <div>
                    <label htmlFor="inst-type" className="block font-medium text-neutral-700 mb-1">Institution Type *</label>
                    <select
                      id="inst-type"
                      value={instData.institutionType}
                      onChange={(e) => setInstData({ ...instData, institutionType: e.target.value as any })}
                      className="w-full p-2.5 border border-neutral-300 rounded-lg bg-white focus:outline-emerald-600"
                    >
                      <option value="Children's Home">Children's Home</option>
                      <option value="Elders' Home">Elders' Home</option>
                      <option value="Care Centre">Registered Care Centre</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="inst-reg-number" className="block font-medium text-neutral-700 mb-1">
                      Government / DSW Registration Number *
                    </label>
                    <input
                      id="inst-reg-number"
                      type="text"
                      required
                      placeholder="e.g. DSW/NP/JAF/2021/088"
                      value={instData.registrationNumber}
                      onChange={(e) => setInstData({ ...instData, registrationNumber: e.target.value })}
                      className="w-full p-2.5 border border-neutral-300 rounded-lg font-mono focus:outline-emerald-600"
                    />
                  </div>
                  <div>
                    <label htmlFor="inst-resident-count" className="block font-medium text-neutral-700 mb-1">Number of Residents to Feed *</label>
                    <input
                      id="inst-resident-count"
                      type="number"
                      required
                      min={5}
                      value={instData.residentCount}
                      onChange={(e) => setInstData({ ...instData, residentCount: Number(e.target.value) })}
                      className="w-full p-2.5 border border-neutral-300 rounded-lg font-mono focus:outline-emerald-600"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="inst-contact-person" className="block font-medium text-neutral-700 mb-1">Director / Supervisor Name *</label>
                    <input
                      id="inst-contact-person"
                      type="text"
                      required
                      placeholder="e.g. Sister Mary Therese"
                      value={instData.contactPerson}
                      onChange={(e) => setInstData({ ...instData, contactPerson: e.target.value })}
                      className="w-full p-2.5 border border-neutral-300 rounded-lg focus:outline-emerald-600"
                    />
                  </div>
                  <div>
                    <label htmlFor="inst-phone" className="block font-medium text-neutral-700 mb-1">Contact Phone *</label>
                    <input
                      id="inst-phone"
                      type="tel"
                      required
                      placeholder="+94 21 222 7890"
                      value={instData.phone}
                      onChange={(e) => setInstData({ ...instData, phone: e.target.value })}
                      className="w-full p-2.5 border border-neutral-300 rounded-lg font-mono focus:outline-emerald-600"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="inst-email" className="block font-medium text-neutral-700 mb-1">Official Email *</label>
                    <input
                      id="inst-email"
                      type="email"
                      required
                      placeholder="home@jaffnacare.org"
                      value={instData.email}
                      onChange={(e) => setInstData({ ...instData, email: e.target.value })}
                      className="w-full p-2.5 border border-neutral-300 rounded-lg focus:outline-emerald-600"
                    />
                  </div>
                  <div>
                    <label htmlFor="inst-area" className="block font-medium text-neutral-700 mb-1">Jaffna Area (GN Division) *</label>
                    <select
                      id="inst-area"
                      value={instData.area}
                      onChange={(e) => setInstData({ ...instData, area: e.target.value })}
                      className="w-full p-2.5 border border-neutral-300 rounded-lg bg-white focus:outline-emerald-600"
                    >
                      {JAFFNA_AREA_LIST.map((a) => (
                        <option key={a} value={a}>
                          {a}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label htmlFor="inst-address" className="block font-medium text-neutral-700 mb-1">Facility Address *</label>
                  <input
                    id="inst-address"
                    type="text"
                    required
                    placeholder="e.g. Temple Road, Nallur, Jaffna"
                    value={instData.address}
                    onChange={(e) => setInstData({ ...instData, address: e.target.value })}
                    className="w-full p-2.5 border border-neutral-300 rounded-lg focus:outline-emerald-600"
                  />
                </div>

                <div>
                  <label htmlFor="inst-dietary-prefs" className="block font-medium text-neutral-700 mb-1">Dietary Preferences & Restrictions</label>
                  <input
                    id="inst-dietary-prefs"
                    type="text"
                    placeholder="e.g. Pure Vegetarian Preferred, Soft rice for seniors, Mild spiced"
                    value={instData.dietaryPreferences}
                    onChange={(e) => setInstData({ ...instData, dietaryPreferences: e.target.value })}
                    className="w-full p-2.5 border border-neutral-300 rounded-lg focus:outline-emerald-600"
                  />
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="needsDeliveryCheck"
                    checked={instData.needsDelivery}
                    onChange={(e) => setInstData({ ...instData, needsDelivery: e.target.checked })}
                    className="w-4 h-4 text-emerald-600 rounded border-neutral-300"
                  />
                  <label htmlFor="needsDeliveryCheck" className="text-neutral-700 font-medium">
                    Our home lacks transport; delivery support from donor or volunteers is required.
                  </label>
                </div>

                <div>
                  <label htmlFor="inst-password" className="block font-medium text-neutral-700 mb-1">Set Password *</label>
                  <input
                    id="inst-password"
                    type="password"
                    required
                    placeholder="••••••••"
                    value={instData.password}
                    onChange={(e) => setInstData({ ...instData, password: e.target.value })}
                    className="w-full p-2.5 border border-neutral-300 rounded-lg font-mono focus:outline-emerald-600"
                  />
                </div>
              </>
            )}

            <div className="p-3 bg-neutral-50 rounded-lg border border-neutral-200 flex items-start gap-2 text-neutral-600 text-[11px]">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>
                All registrations are vetted against Northern Province district social welfare records to maintain community trust and food safety accountability.
              </span>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-emerald-800 hover:bg-emerald-900 text-white font-semibold rounded-lg text-xs flex items-center justify-center gap-2 transition-colors"
            >
              <UserPlus className="w-4 h-4" />
              <span>Complete Registration</span>
            </button>
          </form>

          <div className="text-center pt-2 border-t border-neutral-100 text-xs text-neutral-500">
            Already have an account?{' '}
            <button
              onClick={() => onNavigate('login')}
              className="font-semibold text-emerald-800 hover:underline"
            >
              Sign In Here
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

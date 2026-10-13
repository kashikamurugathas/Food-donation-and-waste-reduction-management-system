import React, { useState } from 'react';
import {
  HeartHandshake,
  UserPlus,
  Building,
  Users,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Eye,
  EyeOff,
  Lock,
  Mail,
  Phone,
  MapPin,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { JAFFNA_AREA_LIST } from '../utils/geoUtils';

interface RegisterPageProps {
  onNavigate: (page: string) => void;
}

export const RegisterPage: React.FC<RegisterPageProps> = ({ onNavigate }) => {
  const { registerUser } = useApp();
  const [role, setRole] = useState<'donor' | 'institution'>('donor');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [successMessage, setSuccessMessage] = useState(false);
  const [registeredRole, setRegisteredRole] = useState<'donor' | 'institution'>('donor');

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Common & Donor Fields
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    password_confirmation: '',
    // Donor specific
    donor_type: 'Function Hall',
    venue_name: '',
    address: '',
    area: 'Nallur',
    district: 'Jaffna',
    // Institution specific
    institution_name: '',
    institution_type: "Children's Home",
    registration_number: '',
    contact_person: '',
    resident_count: 30,
  });

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errorMessage) setErrorMessage(null);
    if (fieldErrors[field]) {
      setFieldErrors((prev) => {
        const updated = { ...prev };
        delete updated[field];
        return updated;
      });
    }
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    // 1. Basic Information
    if (!formData.name.trim()) {
      errors.name = 'Full name is required.';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      errors.email = 'Email address is required.';
    } else if (!emailRegex.test(formData.email.trim())) {
      errors.email = 'Please provide a valid email address (e.g. name@example.lk).';
    }

    if (!formData.phone.trim()) {
      errors.phone = 'Mobile phone number is required.';
    } else if (formData.phone.trim().length < 9) {
      errors.phone = 'Please provide a valid phone number (at least 9 digits).';
    }

    // 2. Passwords
    if (!formData.password) {
      errors.password = 'Password is required.';
    } else if (formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters long.';
    }

    if (!formData.password_confirmation) {
      errors.password_confirmation = 'Please confirm your password.';
    } else if (formData.password !== formData.password_confirmation) {
      errors.password_confirmation = 'Passwords do not match.';
    }

    // 3. Role-specific validation
    if (role === 'donor') {
      if (!formData.address.trim()) {
        errors.address = 'Full pickup address is required.';
      }
      if (!formData.area.trim()) {
        errors.area = 'Jaffna area is required.';
      }
    } else {
      if (!formData.institution_name.trim()) {
        errors.institution_name = 'Institution name is required.';
      }
      if (!formData.registration_number.trim()) {
        errors.registration_number = 'Social welfare registration code is required.';
      }
      if (!formData.address.trim()) {
        errors.address = 'Full institution address is required.';
      }
      if (!formData.contact_person.trim()) {
        errors.contact_person = 'Contact person name is required.';
      }
      if (!formData.resident_count || formData.resident_count < 1) {
        errors.resident_count = 'Please specify the approximate resident count.';
      }
    }

    setFieldErrors(errors);

    if (Object.keys(errors).length > 0) {
      setErrorMessage('Please correct the highlighted fields before submitting.');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!validateForm()) return;

    setIsSubmitting(true);

    const payload = {
      ...formData,
      role,
      name: role === 'institution' ? formData.institution_name || formData.name : formData.name,
    };

    const res = await registerUser(payload, role);

    setIsSubmitting(false);

    if (!res.success) {
      setErrorMessage(res.error || 'Registration failed. Please check the details and try again.');
      if (res.errors) {
        const flattened: Record<string, string> = {};
        for (const [key, msgs] of Object.entries(res.errors)) {
          if (Array.isArray(msgs) && msgs.length > 0) {
            flattened[key] = msgs[0];
          }
        }
        setFieldErrors(flattened);
      }
      return;
    }

    setRegisteredRole(role);
    setSuccessMessage(true);

    setTimeout(() => {
      if (role === 'donor') {
        onNavigate('donorDashboard');
      } else {
        onNavigate('institutionDashboard');
      }
    }, 1800);
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-12 space-y-8">
      {/* Brand & Heading */}
      <div className="text-center space-y-2">
        <div className="w-12 h-12 rounded-xl bg-emerald-700 text-white flex items-center justify-center mx-auto shadow-sm">
          <HeartHandshake className="w-6 h-6" />
        </div>
        <span className="text-xs font-semibold text-emerald-800 tracking-wider uppercase font-mono">
          FoodShare Lanka – Northern Province
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 tracking-tight">
          Create a Verified Account
        </h1>
        <p className="text-xs sm:text-sm text-neutral-600 max-w-md mx-auto">
          Register to donate event surplus food or request meals for your registered care facility in Jaffna District.
        </p>
      </div>

      {successMessage ? (
        <div className="bg-white p-8 sm:p-10 rounded-2xl border border-emerald-200 shadow-sm text-center space-y-4">
          <CheckCircle2 className="w-16 h-16 text-emerald-600 mx-auto" />
          <h2 className="text-xl font-bold text-neutral-900">Registration Saved Successfully!</h2>
          <p className="text-xs sm:text-sm text-neutral-600 max-w-md mx-auto leading-relaxed">
            Your profile has been securely saved in the database with a unique user ID and verified authentication token.
          </p>
          <div className="p-3 bg-emerald-50 rounded-lg text-emerald-900 text-xs font-semibold inline-block">
            Redirecting to {registeredRole === 'donor' ? 'Food Donor' : 'Care Home'} Dashboard...
          </div>
        </div>
      ) : (
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-neutral-200 shadow-xs space-y-6">
          {/* Role Selection Tabs */}
          <div>
            <label className="block text-xs font-bold text-neutral-800 mb-2">
              Select Your Role (Administrator role is restricted from public registration)
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => {
                  setRole('donor');
                  setErrorMessage(null);
                }}
                className={`p-4 rounded-xl border text-left transition-all flex items-start gap-3 ${
                  role === 'donor'
                    ? 'border-emerald-600 bg-emerald-50/70 text-emerald-950 ring-2 ring-emerald-500/30'
                    : 'border-neutral-200 hover:border-neutral-300 text-neutral-700 bg-white'
                }`}
              >
                <Building className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-sm block">Food Donor</span>
                  <span className="text-[11px] text-neutral-500 leading-tight block mt-0.5">
                    Function hall, hotel, restaurant, caterer, or family
                  </span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  setRole('institution');
                  setErrorMessage(null);
                }}
                className={`p-4 rounded-xl border text-left transition-all flex items-start gap-3 ${
                  role === 'institution'
                    ? 'border-emerald-600 bg-emerald-50/70 text-emerald-950 ring-2 ring-emerald-500/30'
                    : 'border-neutral-200 hover:border-neutral-300 text-neutral-700 bg-white'
                }`}
              >
                <Users className="w-5 h-5 text-teal-700 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-sm block">Receiving Institution</span>
                  <span className="text-[11px] text-neutral-500 leading-tight block mt-0.5">
                    Children's home or elders' home care centre
                  </span>
                </div>
              </button>
            </div>
          </div>

          {/* Error Banner */}
          {errorMessage && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div className="flex-1 leading-relaxed">{errorMessage}</div>
            </div>
          )}

          {/* Registration Form */}
          <form onSubmit={handleSubmit} noValidate className="space-y-4 text-xs">
            {/* 1. Account Holder Name */}
            <div>
              <label htmlFor="reg-name" className="block font-semibold text-neutral-700 mb-1">
                Full Name *
              </label>
              <input
                id="reg-name"
                type="text"
                required
                placeholder="e.g. Senthil Kumaran"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                className={`w-full p-2.5 border rounded-lg transition-colors focus:outline-emerald-600 ${
                  fieldErrors.name ? 'border-rose-400 bg-rose-50/20' : 'border-neutral-300'
                }`}
              />
              {fieldErrors.name && <p className="text-[11px] text-rose-600 mt-1">{fieldErrors.name}</p>}
            </div>

            {/* 2. Email Address & Mobile Phone */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label htmlFor="reg-email" className="block font-semibold text-neutral-700 mb-1">
                  Email Address *
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-neutral-400 absolute left-3 top-3 pointer-events-none" />
                  <input
                    id="reg-email"
                    type="email"
                    required
                    autoComplete="email"
                    placeholder="name@example.lk"
                    value={formData.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                    className={`w-full pl-9 pr-3 py-2.5 border rounded-lg transition-colors focus:outline-emerald-600 ${
                      fieldErrors.email ? 'border-rose-400 bg-rose-50/20' : 'border-neutral-300'
                    }`}
                  />
                </div>
                {fieldErrors.email && <p className="text-[11px] text-rose-600 mt-1">{fieldErrors.email}</p>}
              </div>

              <div>
                <label htmlFor="reg-phone" className="block font-semibold text-neutral-700 mb-1">
                  Mobile Phone Number *
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-neutral-400 absolute left-3 top-3 pointer-events-none" />
                  <input
                    id="reg-phone"
                    type="tel"
                    required
                    placeholder="+94 77 123 4567"
                    value={formData.phone}
                    onChange={(e) => handleChange('phone', e.target.value)}
                    className={`w-full pl-9 pr-3 py-2.5 border rounded-lg transition-colors focus:outline-emerald-600 ${
                      fieldErrors.phone ? 'border-rose-400 bg-rose-50/20' : 'border-neutral-300'
                    }`}
                  />
                </div>
                {fieldErrors.phone && <p className="text-[11px] text-rose-600 mt-1">{fieldErrors.phone}</p>}
              </div>
            </div>

            {/* 3. Password & Confirm Password */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label htmlFor="reg-password" className="block font-semibold text-neutral-700 mb-1">
                  Password (min 6 characters) *
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-neutral-400 absolute left-3 top-3 pointer-events-none" />
                  <input
                    id="reg-password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    autoComplete="new-password"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) => handleChange('password', e.target.value)}
                    className={`w-full pl-9 pr-9 py-2.5 border rounded-lg font-mono transition-colors focus:outline-emerald-600 ${
                      fieldErrors.password ? 'border-rose-400 bg-rose-50/20' : 'border-neutral-300'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2.5 top-2.5 text-neutral-400 hover:text-neutral-700 p-0.5"
                    aria-label="Toggle password visibility"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {fieldErrors.password && <p className="text-[11px] text-rose-600 mt-1">{fieldErrors.password}</p>}
              </div>

              <div>
                <label htmlFor="reg-confirm-password" className="block font-semibold text-neutral-700 mb-1">
                  Confirm Password *
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-neutral-400 absolute left-3 top-3 pointer-events-none" />
                  <input
                    id="reg-confirm-password"
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    autoComplete="new-password"
                    placeholder="••••••••"
                    value={formData.password_confirmation}
                    onChange={(e) => handleChange('password_confirmation', e.target.value)}
                    className={`w-full pl-9 pr-9 py-2.5 border rounded-lg font-mono transition-colors focus:outline-emerald-600 ${
                      fieldErrors.password_confirmation ? 'border-rose-400 bg-rose-50/20' : 'border-neutral-300'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-2.5 top-2.5 text-neutral-400 hover:text-neutral-700 p-0.5"
                    aria-label="Toggle confirm password visibility"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {fieldErrors.password_confirmation && (
                  <p className="text-[11px] text-rose-600 mt-1">{fieldErrors.password_confirmation}</p>
                )}
              </div>
            </div>

            {/* 4. Food Donor Specific Fields */}
            {role === 'donor' && (
              <div className="pt-2 border-t border-neutral-100 space-y-3">
                <h3 className="font-bold text-neutral-800 text-xs flex items-center gap-1.5">
                  <Building className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Food Donor Profile Details</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="donor-type" className="block font-semibold text-neutral-700 mb-1">
                      Donor Type *
                    </label>
                    <select
                      id="donor-type"
                      value={formData.donor_type}
                      onChange={(e) => handleChange('donor_type', e.target.value)}
                      className="w-full p-2.5 border border-neutral-300 rounded-lg bg-white focus:outline-emerald-600"
                    >
                      <option value="Function Hall">Function Hall / Wedding Hall</option>
                      <option value="Hotel">Hotel</option>
                      <option value="Restaurant">Restaurant</option>
                      <option value="Catering Service">Catering Service</option>
                      <option value="Individual">Individual Host / Family Function</option>
                      <option value="Other">Other Food Provider</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="venue-name" className="block font-semibold text-neutral-700 mb-1">
                      Organisation or Venue Name
                    </label>
                    <input
                      id="venue-name"
                      type="text"
                      placeholder="e.g. Raja Palace Wedding Hall"
                      value={formData.venue_name}
                      onChange={(e) => handleChange('venue_name', e.target.value)}
                      className="w-full p-2.5 border border-neutral-300 rounded-lg focus:outline-emerald-600"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2">
                    <label htmlFor="donor-address" className="block font-semibold text-neutral-700 mb-1">
                      Pickup Address *
                    </label>
                    <input
                      id="donor-address"
                      type="text"
                      required
                      placeholder="e.g. Point Pedro Road, Nallur"
                      value={formData.address}
                      onChange={(e) => handleChange('address', e.target.value)}
                      className={`w-full p-2.5 border rounded-lg focus:outline-emerald-600 ${
                        fieldErrors.address ? 'border-rose-400 bg-rose-50/20' : 'border-neutral-300'
                      }`}
                    />
                    {fieldErrors.address && <p className="text-[11px] text-rose-600 mt-1">{fieldErrors.address}</p>}
                  </div>

                  <div>
                    <label htmlFor="donor-area" className="block font-semibold text-neutral-700 mb-1">
                      Jaffna Area *
                    </label>
                    <select
                      id="donor-area"
                      value={formData.area}
                      onChange={(e) => handleChange('area', e.target.value)}
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
              </div>
            )}

            {/* 5. Receiving Institution Specific Fields */}
            {role === 'institution' && (
              <div className="pt-2 border-t border-neutral-100 space-y-3">
                <h3 className="font-bold text-neutral-800 text-xs flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-teal-700" />
                  <span>Care Institution Details</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="inst-name" className="block font-semibold text-neutral-700 mb-1">
                      Institution Name *
                    </label>
                    <input
                      id="inst-name"
                      type="text"
                      required
                      placeholder="e.g. Anbu Children's Home"
                      value={formData.institution_name}
                      onChange={(e) => handleChange('institution_name', e.target.value)}
                      className={`w-full p-2.5 border rounded-lg focus:outline-emerald-600 ${
                        fieldErrors.institution_name ? 'border-rose-400 bg-rose-50/20' : 'border-neutral-300'
                      }`}
                    />
                    {fieldErrors.institution_name && (
                      <p className="text-[11px] text-rose-600 mt-1">{fieldErrors.institution_name}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="inst-type" className="block font-semibold text-neutral-700 mb-1">
                      Institution Type *
                    </label>
                    <select
                      id="inst-type"
                      value={formData.institution_type}
                      onChange={(e) => handleChange('institution_type', e.target.value)}
                      className="w-full p-2.5 border border-neutral-300 rounded-lg bg-white focus:outline-emerald-600"
                    >
                      <option value="Children's Home">Children's Home</option>
                      <option value="Elders' Home">Elders' Home</option>
                      <option value="Care Centre">Care Centre</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="reg-num" className="block font-semibold text-neutral-700 mb-1">
                      Social Welfare Registration Code *
                    </label>
                    <input
                      id="reg-num"
                      type="text"
                      required
                      placeholder="e.g. DSW/NP/JAF/0412"
                      value={formData.registration_number}
                      onChange={(e) => handleChange('registration_number', e.target.value)}
                      className={`w-full p-2.5 border rounded-lg focus:outline-emerald-600 ${
                        fieldErrors.registration_number ? 'border-rose-400 bg-rose-50/20' : 'border-neutral-300'
                      }`}
                    />
                    {fieldErrors.registration_number && (
                      <p className="text-[11px] text-rose-600 mt-1">{fieldErrors.registration_number}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="resident-count" className="block font-semibold text-neutral-700 mb-1">
                      Approximate Number of Residents *
                    </label>
                    <input
                      id="resident-count"
                      type="number"
                      min={1}
                      max={1000}
                      required
                      value={formData.resident_count}
                      onChange={(e) => handleChange('resident_count', parseInt(e.target.value) || 1)}
                      className="w-full p-2.5 border border-neutral-300 rounded-lg focus:outline-emerald-600"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2">
                    <label htmlFor="inst-address" className="block font-semibold text-neutral-700 mb-1">
                      Full Institution Address *
                    </label>
                    <input
                      id="inst-address"
                      type="text"
                      required
                      placeholder="e.g. Temple Road, Nallur, Jaffna"
                      value={formData.address}
                      onChange={(e) => handleChange('address', e.target.value)}
                      className={`w-full p-2.5 border rounded-lg focus:outline-emerald-600 ${
                        fieldErrors.address ? 'border-rose-400 bg-rose-50/20' : 'border-neutral-300'
                      }`}
                    />
                    {fieldErrors.address && <p className="text-[11px] text-rose-600 mt-1">{fieldErrors.address}</p>}
                  </div>

                  <div>
                    <label htmlFor="inst-area" className="block font-semibold text-neutral-700 mb-1">
                      Jaffna Area *
                    </label>
                    <select
                      id="inst-area"
                      value={formData.area}
                      onChange={(e) => handleChange('area', e.target.value)}
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
                  <label htmlFor="contact-person" className="block font-semibold text-neutral-700 mb-1">
                    Contact Person's Name & Title *
                  </label>
                  <input
                    id="contact-person"
                    type="text"
                    required
                    placeholder="e.g. Sister Mary (Director)"
                    value={formData.contact_person}
                    onChange={(e) => handleChange('contact_person', e.target.value)}
                    className={`w-full p-2.5 border rounded-lg focus:outline-emerald-600 ${
                      fieldErrors.contact_person ? 'border-rose-400 bg-rose-50/20' : 'border-neutral-300'
                    }`}
                  />
                  {fieldErrors.contact_person && (
                    <p className="text-[11px] text-rose-600 mt-1">{fieldErrors.contact_person}</p>
                  )}
                </div>
              </div>
            )}

            {/* Privacy & Security Note */}
            <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200 flex items-start gap-2.5 text-neutral-600 text-[11px] leading-relaxed">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>
                Passwords are cryptographically hashed using standard irreversible algorithms before being saved to the database. Only necessary information required for surplus food distribution in Jaffna District is collected.
              </span>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 bg-emerald-800 hover:bg-emerald-900 text-white font-semibold rounded-lg text-xs flex items-center justify-center gap-2 transition-colors shadow-xs disabled:opacity-75 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <span>Saving Registration to Database...</span>
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4" />
                  <span>Complete Registration as {role === 'donor' ? 'Food Donor' : 'Care Institution'}</span>
                </>
              )}
            </button>
          </form>

          {/* Bi-directional Link to Login */}
          <div className="text-center pt-3 border-t border-neutral-100 text-xs text-neutral-600">
            <span>Already have a registered account? </span>
            <button
              type="button"
              onClick={() => onNavigate('login')}
              className="font-bold text-emerald-800 hover:text-emerald-950 hover:underline transition-colors ml-1"
            >
              Sign In Here
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

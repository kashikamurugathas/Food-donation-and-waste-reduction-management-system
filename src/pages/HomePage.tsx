import React from 'react';
import {
  HeartHandshake,
  ArrowRight,
  ShieldCheck,
  Clock,
  MapPin,
  Users,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { StatusBadge } from '../components/common/StatusBadge';
import { calculateDistanceKm, getCoordinatesForArea } from '../utils/geoUtils';

interface HomePageProps {
  onNavigate: (page: string) => void;
  onSelectDonation: (donationId: string) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onNavigate, onSelectDonation }) => {
  const { t, donations, institutions, currentRole, loginAs } = useApp();

  const activeDonations = donations
    .filter((d) => d.status === 'Available' || d.status === 'Request Received')
    .slice(0, 3);

  const totalPortionsDonated = donations.reduce(
    (acc, curr) => acc + (curr.totalQuantity - curr.remainingQuantity),
    340
  );
  const completedDonationsCount = donations.filter(
    (d) => d.status === 'Collected' || d.status === 'Delivered'
  ).length + 18;
  const institutionsHelpedCount = institutions.filter((i) => i.isVerified).length;
  const estimatedKg = Math.round(totalPortionsDonated * 0.42);

  return (
    <div className="space-y-16 pb-16">
      {/* Hero Section */}
      <section className="relative bg-emerald-950 text-white overflow-hidden">
        {/* Subtle decorative background pattern */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24 relative">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Column: Proposition */}
            <div className="lg:col-span-7 space-y-6">
              <div className="text-emerald-300 text-xs font-semibold tracking-wider uppercase font-mono">
                {t.heroKicker}
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight text-white text-balance">
                {t.heroTitle}
              </h1>

              <p className="text-base sm:text-lg text-emerald-100/90 leading-relaxed max-w-2xl">
                {t.heroDescription}
              </p>

              <div className="flex flex-wrap items-center gap-4 pt-2">
                <button
                  onClick={() => onNavigate('donorDashboard')}
                  className="px-6 py-3.5 bg-emerald-500 hover:bg-emerald-400 text-emerald-950 font-bold rounded-lg shadow-sm transition-colors text-sm flex items-center gap-2 whitespace-nowrap"
                >
                  <span>{t.donateFoodCta}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  onClick={() => onNavigate('availableFood')}
                  className="px-6 py-3.5 bg-emerald-900/80 hover:bg-emerald-900 text-white border border-emerald-700/80 font-semibold rounded-lg transition-colors text-sm whitespace-nowrap"
                >
                  {t.findFoodCta}
                </button>
              </div>

              {/* Trust Indicators */}
              <div className="pt-6 border-t border-emerald-900/60 flex flex-wrap items-center gap-6 text-xs text-emerald-200">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Verified Care Homes Only</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Strict 4-Hour Freshness Window</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Jaffna District Dedicated</span>
                </div>
              </div>
            </div>

            {/* Right Column: Hero Visual Asset */}
            <div className="lg:col-span-5">
              <div className="relative rounded-2xl overflow-hidden border border-emerald-800 shadow-2xl bg-emerald-900">
                <img
                  src="/src/assets/images/hero_jaffna_feast_1791886444901.jpg"
                  alt="Authentic traditional Jaffna wedding banquet meal spread on clean banana leaves and catering warmers"
                  referrerPolicy="no-referrer"
                  className="w-full h-80 lg:h-96 object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-emerald-950/90 via-emerald-950/20 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4 text-white">
                  <p className="text-xs text-emerald-300 font-medium">Traditional Jaffna Banquet Redistribution</p>
                  <p className="text-sm font-semibold mt-0.5">Freshly prepared wedding feasts shared in dignity</p>
                  <div className="mt-2 flex items-center justify-between text-[11px] text-emerald-200/80 font-mono">
                    <span>Nallur · Jaffna Town · Chavakachcheri</span>
                    <span>100% Non-Profit</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quantitative Rigor Impact Strip */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-xl border border-neutral-200 p-6 shadow-xs">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center divide-y md:divide-y-0 md:divide-x divide-neutral-100">
            <div className="pt-4 md:pt-0">
              <div className="text-2xl sm:text-3xl font-extrabold text-neutral-900 font-mono tabular-nums">
                {totalPortionsDonated.toLocaleString()}
              </div>
              <div className="text-xs text-neutral-500 mt-1">{t.stats.mealsDonated}</div>
            </div>
            <div className="pt-4 md:pt-0">
              <div className="text-2xl sm:text-3xl font-extrabold text-neutral-900 font-mono tabular-nums">
                {completedDonationsCount}
              </div>
              <div className="text-xs text-neutral-500 mt-1">{t.stats.completedDonations}</div>
            </div>
            <div className="pt-4 md:pt-0">
              <div className="text-2xl sm:text-3xl font-extrabold text-emerald-700 font-mono tabular-nums">
                {institutionsHelpedCount}
              </div>
              <div className="text-xs text-neutral-500 mt-1">{t.stats.homesHelped}</div>
            </div>
            <div className="pt-4 md:pt-0">
              <div className="text-2xl sm:text-3xl font-extrabold text-neutral-900 font-mono tabular-nums">
                {estimatedKg} kg
              </div>
              <div className="text-xs text-neutral-500 mt-1">{t.stats.foodSavedKg}</div>
            </div>
          </div>
        </div>
      </section>

      {/* Food Waste Problem in Jaffna Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
          <div className="md:col-span-5">
            <div className="rounded-xl overflow-hidden border border-neutral-200 shadow-sm">
              <img
                src="/src/assets/images/donor_food_trays_1791886447039.jpg"
                alt="Neatly packed and labeled catering food transport boxes ready for care home delivery"
                referrerPolicy="no-referrer"
                className="w-full h-72 object-cover"
              />
            </div>
          </div>
          <div className="md:col-span-7 space-y-4">
            <div className="text-xs font-semibold text-emerald-700 tracking-wider uppercase font-mono">
              The Reality in Jaffna
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-neutral-900 text-balance">
              Why Surplus Food Matters in Northern Sri Lanka
            </h2>
            <p className="text-sm text-neutral-600 leading-relaxed">
              In Jaffna District, hospitality is a cherished cultural tradition. Large wedding halls in Nallur, Chavakachcheri, and Jaffna Town routinely prepare generous feasts for hundreds of guests. Naturally, 20% to 35% of pristine, untouched food often remains surplus after functions conclude.
            </p>
            <p className="text-sm text-neutral-600 leading-relaxed">
              At the exact same time, registered children's homes and elders' homes in the peninsula face increasing grocery costs and dietary constraints. <strong className="text-neutral-900">FoodShare Lanka</strong> creates a direct, hygienic bridge so no warm, nutritious meal is discarded into waste bins.
            </p>
            <div className="pt-2 flex items-center gap-4">
              <button
                onClick={() => onNavigate('about')}
                className="text-xs font-semibold text-emerald-800 hover:text-emerald-950 flex items-center gap-1.5 transition-colors"
              >
                <span>Read our Jaffna community mission</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="bg-neutral-100/70 border-y border-neutral-200 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <h2 className="text-2xl sm:text-3xl font-bold text-neutral-900">{t.howItWorksTitle}</h2>
            <p className="text-sm text-neutral-600">{t.howItWorksDesc}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-xl border border-neutral-200 shadow-xs space-y-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold font-mono">
                01
              </div>
              <h3 className="text-base font-semibold text-neutral-900">Event Host Posts Surplus</h3>
              <p className="text-xs text-neutral-600 leading-relaxed">
                Wedding halls, caterers, or families register surplus food quantity, preparation time, safe deadline, and pickup location in Jaffna.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl border border-neutral-200 shadow-xs space-y-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold font-mono">
                02
              </div>
              <h3 className="text-base font-semibold text-neutral-900">Smart Local Matching</h3>
              <p className="text-xs text-neutral-600 leading-relaxed">
                Our algorithm matches the food with nearby verified children’s or elders’ homes based on distance (km) and dietary suitability.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl border border-neutral-200 shadow-xs space-y-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold font-mono">
                03
              </div>
              <h3 className="text-base font-semibold text-neutral-900">Quick Request & Approval</h3>
              <p className="text-xs text-neutral-600 leading-relaxed">
                The care home requests the needed portion count (capped to prevent excess). The donor reviews and approves instantly.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl border border-neutral-200 shadow-xs space-y-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold font-mono">
                04
              </div>
              <h3 className="text-base font-semibold text-neutral-900">Safe Collection & Delivery</h3>
              <p className="text-xs text-neutral-600 leading-relaxed">
                Food is collected in clean thermal containers before the deadline, inspected, served, and confirmed completed.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Recently Posted Surplus Food Donations */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <div className="text-xs font-semibold text-emerald-700 tracking-wider uppercase font-mono">
              Live Opportunities
            </div>
            <h2 className="text-2xl font-bold text-neutral-900 mt-1">Recently Posted Food Donations</h2>
            <p className="text-xs text-neutral-500 mt-0.5">
              Current surplus meals available across Nallur, Jaffna Town, and surrounding GN divisions.
            </p>
          </div>
          <button
            onClick={() => onNavigate('availableFood')}
            className="text-xs font-semibold text-emerald-800 hover:text-emerald-950 flex items-center gap-1 transition-colors self-start sm:self-auto"
          >
            <span>View all donations ({donations.length})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {activeDonations.map((donation) => {
            const deadlineHours = Math.max(
              0,
              (new Date(donation.safeCollectionDeadline).getTime() - Date.now()) / (1000 * 60 * 60)
            );
            const isNearDeadline = deadlineHours < 2;

            return (
              <div
                key={donation.id}
                className="bg-white rounded-xl border border-neutral-200 overflow-hidden shadow-xs hover:border-emerald-300 transition-colors flex flex-col justify-between"
              >
                <div>
                  <div className="relative h-44 bg-neutral-100">
                    <img
                      src={donation.photos[0] || '/src/assets/images/donor_food_trays_1791886447039.jpg'}
                      alt={donation.foodName}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-3 left-3">
                      <StatusBadge status={donation.status} size="sm" />
                    </div>
                    <div className="absolute bottom-2 left-2 bg-neutral-900/80 backdrop-blur-xs text-white text-[11px] px-2 py-0.5 rounded font-mono">
                      {donation.category}
                    </div>
                  </div>

                  <div className="p-5 space-y-3">
                    <div>
                      <h3 className="text-base font-semibold text-neutral-900 line-clamp-1">
                        {donation.foodName}
                      </h3>
                      <p className="text-xs text-neutral-500 mt-0.5 line-clamp-2">
                        {donation.description}
                      </p>
                    </div>

                    <div className="text-xs space-y-1.5 text-neutral-600 pt-2 border-t border-neutral-100">
                      <div className="flex items-center justify-between">
                        <span className="text-neutral-500">Available:</span>
                        <span className="font-semibold text-emerald-800 font-mono tabular-nums">
                          {donation.remainingQuantity} / {donation.totalQuantity} {donation.unit}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-neutral-500">Location:</span>
                        <span className="font-medium text-neutral-800">{donation.venueName}, {donation.area}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-neutral-500">Safe Until:</span>
                        <span
                          className={`font-mono tabular-nums font-semibold ${
                            isNearDeadline ? 'text-rose-600' : 'text-neutral-700'
                          }`}
                        >
                          {new Date(donation.safeCollectionDeadline).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}{' '}
                          ({Math.round(deadlineHours * 10) / 10}h left)
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-neutral-50 border-t border-neutral-100 flex items-center justify-between gap-2">
                  <button
                    onClick={() => {
                      onSelectDonation(donation.id);
                      onNavigate('availableFood');
                    }}
                    className="text-xs text-neutral-600 hover:text-neutral-900 font-medium"
                  >
                    View Details
                  </button>
                  <button
                    onClick={() => {
                      onSelectDonation(donation.id);
                      onNavigate('institutionDashboard');
                    }}
                    className="px-3 py-1.5 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg transition-colors"
                  >
                    Request Food
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Featured Receiving Institutions in Jaffna */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <div className="text-xs font-semibold text-emerald-700 tracking-wider uppercase font-mono">
              Community Partners
            </div>
            <h2 className="text-2xl font-bold text-neutral-900 mt-1">
              Registered Children's Homes & Elders' Homes
            </h2>
            <p className="text-xs text-neutral-500 mt-0.5">
              Verified social care centres in Jaffna District relying on community support.
            </p>
          </div>
          <button
            onClick={() => onNavigate('institutions')}
            className="text-xs font-semibold text-emerald-800 hover:text-emerald-950 flex items-center gap-1 transition-colors self-start sm:self-auto"
          >
            <span>View all institutions ({institutions.length})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Children's Home Card */}
          <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden shadow-xs flex flex-col sm:flex-row">
            <div className="sm:w-5/12 h-52 sm:h-auto">
              <img
                src="/src/assets/images/institution_children_home_1791886446331.jpg"
                alt="Children's care home dining hall in Northern Sri Lanka with clean wooden tables and warm meals"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="sm:w-7/12 p-6 flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center gap-2 text-xs text-emerald-700 font-medium">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Children's Care Home · Nallur</span>
                </div>
                <h3 className="text-lg font-bold text-neutral-900 mt-1">
                  Anbu Children's Home (Sample Demo)
                </h3>
                <p className="text-xs text-neutral-600 mt-1 leading-relaxed">
                  Housing 45 young boys and girls in Nallur, providing education, nourishment, and care. Equipped with a small van for prompt collection.
                </p>
              </div>

              <div className="pt-2 border-t border-neutral-100 flex items-center justify-between text-xs">
                <span className="text-neutral-500">Capacity: <strong className="text-neutral-800">45 Residents</strong></span>
                <button
                  onClick={() => onNavigate('institutions')}
                  className="font-semibold text-emerald-800 hover:underline"
                >
                  View Profile
                </button>
              </div>
            </div>
          </div>

          {/* Elders' Home Card */}
          <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden shadow-xs flex flex-col sm:flex-row">
            <div className="sm:w-5/12 h-52 sm:h-auto">
              <img
                src="/src/assets/images/institution_elders_home_1791886446896.jpg"
                alt="Senior citizens enjoying lunch together on a veranda in Jaffna Sri Lanka"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="sm:w-7/12 p-6 flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center gap-2 text-xs text-teal-700 font-medium">
                  <CheckCircle2 className="w-4 h-4 text-teal-600" />
                  <span>Elders' Sanctuary · Kopay</span>
                </div>
                <h3 className="text-lg font-bold text-neutral-900 mt-1">
                  Sivapoomi Elders' Sanctuary (Sample Demo)
                </h3>
                <p className="text-xs text-neutral-600 mt-1 leading-relaxed">
                  Dedicated care for 60 elderly residents in Kopay North. Welcomes nutritious, mild-spiced vegetarian meal donations with deep gratitude.
                </p>
              </div>

              <div className="pt-2 border-t border-neutral-100 flex items-center justify-between text-xs">
                <span className="text-neutral-500">Capacity: <strong className="text-neutral-800">60 Elders</strong></span>
                <button
                  onClick={() => onNavigate('institutions')}
                  className="font-semibold text-emerald-800 hover:underline"
                >
                  View Profile
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-emerald-800 to-teal-900 rounded-2xl p-8 sm:p-12 text-white shadow-md flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-3 max-w-xl">
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Hosting a Function or Wedding in Jaffna?
            </h2>
            <p className="text-sm text-emerald-100 leading-relaxed">
              Don't let prepared food go to waste. Register your surplus in 2 minutes. Nearby children's or elders' homes will collect it safely before your function ends.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">
            <button
              onClick={() => onNavigate('donorDashboard')}
              className="w-full sm:w-auto px-6 py-3 bg-white hover:bg-emerald-50 text-emerald-950 font-bold text-xs rounded-lg transition-colors shadow-xs"
            >
              Post Food Donation Now
            </button>
            <button
              onClick={() => onNavigate('contact')}
              className="w-full sm:w-auto px-6 py-3 bg-emerald-950/40 hover:bg-emerald-950/60 border border-emerald-400/40 text-white font-semibold text-xs rounded-lg transition-colors"
            >
              Contact Jaffna Desk
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

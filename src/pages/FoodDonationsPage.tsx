import React, { useState } from 'react';
import {
  Search,
  Filter,
  Clock,
  MapPin,
  ShieldCheck,
  AlertTriangle,
  ExternalLink,
  ChevronRight,
  Info,
  Heart,
  Flag,
  Share2,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { FoodCategory, FoodDonation } from '../types';
import { JAFFNA_AREA_LIST, getGoogleMapsDirectionsUrl } from '../utils/geoUtils';
import { StatusBadge } from '../components/common/StatusBadge';
import { FoodTimelineModal } from '../components/common/FoodTimelineModal';
import { ReportComplaintModal } from '../components/common/ReportComplaintModal';

interface FoodDonationsPageProps {
  onNavigate: (page: string) => void;
  selectedDonationId?: string | null;
}

export const FoodDonationsPage: React.FC<FoodDonationsPageProps> = ({
  onNavigate,
  selectedDonationId: initialSelectedId,
}) => {
  const {
    donations,
    currentRole,
    loginAs,
    currentUser,
    createRequest,
    requests,
  } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedArea, setSelectedArea] = useState<string>('All');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [vegetarianOnly, setVegetarianOnly] = useState<boolean>(false);
  const [selectedDonation, setSelectedDonation] = useState<FoodDonation | null>(() => {
    if (initialSelectedId) {
      return donations.find((d) => d.id === initialSelectedId) || null;
    }
    return null;
  });

  const [trackingDonation, setTrackingDonation] = useState<FoodDonation | null>(null);
  const [reportingDonation, setReportingDonation] = useState<FoodDonation | null>(null);

  // Request Form modal state
  const [requestModalDonation, setRequestModalDonation] = useState<FoodDonation | null>(null);
  const [requestedPortions, setRequestedPortions] = useState<number>(20);
  const [peopleToFeed, setPeopleToFeed] = useState<number>(20);
  const [preferredTime, setPreferredTime] = useState<string>('16:00');
  const [logisticsType, setLogisticsType] = useState<'Self Pickup' | 'Request Delivery'>('Self Pickup');
  const [dietaryRequirements, setDietaryRequirements] = useState<string>('');
  const [additionalNotes, setAdditionalNotes] = useState<string>('');
  const [requestFeedback, setRequestFeedback] = useState<{ success?: boolean; message?: string } | null>(null);

  const categories: (FoodCategory | 'All')[] = [
    'All',
    'Rice and Curry',
    'Vegetarian Meals',
    'Chicken Meals',
    'Snacks',
    'Fruits',
    'Bakery Items',
    'Other',
  ];

  // Filtering
  const filteredDonations = donations.filter((d) => {
    const matchesSearch =
      d.foodName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.venueName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.area.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesArea = selectedArea === 'All' || d.area === selectedArea;
    const matchesCategory = selectedCategory === 'All' || d.category === selectedCategory;
    const matchesVeg = !vegetarianOnly || d.isVegetarian;

    return matchesSearch && matchesArea && matchesCategory && matchesVeg;
  });

  const handleOpenRequest = (donation: FoodDonation) => {
    if (currentRole !== 'institution') {
      loginAs('institution');
    }
    setRequestModalDonation(donation);
    setRequestedPortions(Math.min(25, donation.remainingQuantity));
    setPeopleToFeed(Math.min(25, donation.remainingQuantity));
    setRequestFeedback(null);
  };

  const handleConfirmRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!requestModalDonation) return;

    const res = createRequest({
      donationId: requestModalDonation.id,
      requestedPortions: Number(requestedPortions),
      peopleToFeed: Number(peopleToFeed),
      preferredTime,
      logisticsType,
      dietaryRequirements,
      additionalNotes,
    });

    setRequestFeedback(res);
    if (res.success) {
      setTimeout(() => {
        setRequestModalDonation(null);
        setRequestFeedback(null);
        onNavigate('institutionDashboard');
      }, 1500);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <div className="text-xs font-semibold text-emerald-700 tracking-wider uppercase font-mono">
          Jaffna Food Redistribution
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900">
          Available Surplus Food Donations
        </h1>
        <p className="text-sm text-neutral-600 max-w-3xl">
          Browse surplus food prepared for weddings, functions, and events in Jaffna District. Only verified registered children's and elders' homes can request portions.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-neutral-200 shadow-xs space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          {/* Search Input */}
          <div className="md:col-span-5 relative">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search by meal, hall name, or area in Jaffna..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs border border-neutral-300 rounded-lg focus:outline-emerald-600 focus:border-emerald-600"
            />
          </div>

          {/* Area Filter */}
          <div className="md:col-span-3">
            <select
              value={selectedArea}
              onChange={(e) => setSelectedArea(e.target.value)}
              className="w-full py-2 px-3 text-xs border border-neutral-300 rounded-lg bg-white focus:outline-emerald-600"
            >
              <option value="All">All Jaffna Areas</option>
              {JAFFNA_AREA_LIST.map((area) => (
                <option key={area} value={area}>
                  {area}
                </option>
              ))}
            </select>
          </div>

          {/* Category Filter */}
          <div className="md:col-span-2">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full py-2 px-3 text-xs border border-neutral-300 rounded-lg bg-white focus:outline-emerald-600"
            >
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* Vegetarian Toggle */}
          <div className="md:col-span-2 flex items-center">
            <label className="flex items-center gap-2 text-xs font-medium text-neutral-700 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={vegetarianOnly}
                onChange={(e) => setVegetarianOnly(e.target.checked)}
                className="w-4 h-4 text-emerald-600 rounded border-neutral-300 focus:ring-emerald-500"
              />
              <span>Vegetarian Only</span>
            </label>
          </div>
        </div>
      </div>

      {/* Grid of Listings */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {filteredDonations.length === 0 ? (
          <div className="md:col-span-3 py-16 text-center space-y-3 bg-white rounded-xl border border-neutral-200">
            <Info className="w-10 h-10 text-neutral-400 mx-auto" />
            <h3 className="text-base font-semibold text-neutral-800">No Food Donations Found</h3>
            <p className="text-xs text-neutral-500 max-w-md mx-auto">
              No surplus food matches your current search or filter in Jaffna District. Try resetting the filters or check back shortly.
            </p>
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedArea('All');
                setSelectedCategory('All');
                setVegetarianOnly(false);
              }}
              className="text-xs font-semibold text-emerald-700 hover:underline"
            >
              Reset all filters
            </button>
          </div>
        ) : (
          filteredDonations.map((donation) => {
            const deadlineHours = Math.max(
              0,
              (new Date(donation.safeCollectionDeadline).getTime() - Date.now()) / (1000 * 60 * 60)
            );
            const isExpired = donation.status === 'Expired' || deadlineHours <= 0;
            const isUrgent = deadlineHours < 2 && !isExpired;

            return (
              <div
                key={donation.id}
                className="bg-white rounded-xl border border-neutral-200 overflow-hidden shadow-xs hover:border-emerald-300 transition-colors flex flex-col justify-between"
              >
                <div>
                  {/* Photo & Tag */}
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
                    {isUrgent && (
                      <div className="absolute top-3 right-3 bg-rose-600 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-xs flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>Urgent Collection</span>
                      </div>
                    )}
                    <div className="absolute bottom-2 left-2 bg-neutral-900/80 backdrop-blur-xs text-white text-[11px] px-2 py-0.5 rounded font-mono">
                      {donation.category}
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-5 space-y-3">
                    <div>
                      <div className="flex items-center justify-between text-xs text-neutral-500 mb-0.5">
                        <span className="font-medium text-emerald-800">{donation.donorName}</span>
                        <span>{donation.isVegetarian ? '🌱 Pure Veg' : '🍗 Non-Veg'}</span>
                      </div>
                      <h3 className="text-base font-semibold text-neutral-900 line-clamp-1">
                        {donation.foodName}
                      </h3>
                      <p className="text-xs text-neutral-500 mt-1 line-clamp-2 leading-relaxed">
                        {donation.description}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-neutral-100 text-xs space-y-2 text-neutral-600">
                      <div className="flex items-center justify-between">
                        <span className="text-neutral-500">Remaining Portions:</span>
                        <span className="font-bold text-emerald-800 font-mono tabular-nums">
                          {donation.remainingQuantity} / {donation.totalQuantity} {donation.unit}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-neutral-500">Pickup Area:</span>
                        <span className="font-medium text-neutral-800">
                          {donation.area}, Jaffna
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-neutral-500">Safe Deadline:</span>
                        <span
                          className={`font-mono tabular-nums font-semibold ${
                            isExpired
                              ? 'text-rose-600 line-through'
                              : isUrgent
                              ? 'text-rose-600'
                              : 'text-neutral-700'
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

                {/* Card Actions */}
                <div className="p-4 bg-neutral-50 border-t border-neutral-100 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setSelectedDonation(donation)}
                      className="text-xs text-neutral-700 hover:text-neutral-900 font-medium"
                    >
                      Details
                    </button>
                    <span className="text-neutral-300">·</span>
                    <button
                      onClick={() => setTrackingDonation(donation)}
                      className="text-xs text-neutral-600 hover:text-emerald-700"
                    >
                      Timeline
                    </button>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setReportingDonation(donation)}
                      className="p-1.5 text-neutral-400 hover:text-rose-600 rounded transition-colors"
                      title="Report Food Safety Issue"
                    >
                      <Flag className="w-3.5 h-3.5" />
                    </button>

                    <button
                      disabled={isExpired || donation.remainingQuantity <= 0}
                      onClick={() => handleOpenRequest(donation)}
                      className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                        isExpired || donation.remainingQuantity <= 0
                          ? 'bg-neutral-300 text-neutral-500 cursor-not-allowed'
                          : 'bg-emerald-700 hover:bg-emerald-800 text-white'
                      }`}
                    >
                      {isExpired ? 'Expired' : donation.remainingQuantity <= 0 ? 'Fully Reserved' : 'Request Food'}
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Full Details Modal */}
      {selectedDonation && (
        <div className="fixed inset-0 z-50 bg-neutral-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-xl border border-neutral-200 max-w-2xl w-full p-6 text-neutral-900 max-h-[90vh] overflow-y-auto space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
              <div>
                <span className="text-xs font-mono text-emerald-800 font-medium uppercase">
                  Donation #{selectedDonation.id}
                </span>
                <h3 className="text-xl font-bold text-neutral-900">{selectedDonation.foodName}</h3>
              </div>
              <button
                onClick={() => setSelectedDonation(null)}
                className="p-1 text-neutral-400 hover:text-neutral-700 rounded-lg"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="rounded-lg overflow-hidden h-52 bg-neutral-100">
                <img
                  src={selectedDonation.photos[0] || '/src/assets/images/donor_food_trays_1791886447039.jpg'}
                  alt={selectedDonation.foodName}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <span className="text-neutral-500 block">Host / Venue:</span>
                  <span className="font-semibold text-neutral-800 text-sm">
                    {selectedDonation.venueName} ({selectedDonation.eventName})
                  </span>
                </div>
                <div>
                  <span className="text-neutral-500 block">Full Pickup Address:</span>
                  <span className="font-medium text-neutral-800">
                    {selectedDonation.pickupAddress}, {selectedDonation.area}, Jaffna
                  </span>
                </div>
                <div>
                  <span className="text-neutral-500 block">Contact Person & Phone:</span>
                  <span className="font-mono text-neutral-800 font-semibold">
                    {selectedDonation.contactPerson} · {selectedDonation.contactNumber}
                  </span>
                </div>
                <div>
                  <span className="text-neutral-500 block">Storage Condition:</span>
                  <span className="font-medium text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-200 inline-block">
                    {selectedDonation.storageCondition}
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-2 text-xs">
              <span className="font-semibold text-neutral-800">Food Description & Preparation Notes:</span>
              <p className="text-neutral-600 leading-relaxed bg-neutral-50 p-3 rounded-lg border border-neutral-200">
                {selectedDonation.description}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-3 bg-neutral-50 rounded-lg border border-neutral-200 space-y-1">
                <span className="font-semibold text-neutral-800">Allergen Information:</span>
                <p className="text-neutral-600">{selectedDonation.allergenInfo || 'None specified.'}</p>
              </div>
              <div className="p-3 bg-neutral-50 rounded-lg border border-neutral-200 space-y-1">
                <span className="font-semibold text-neutral-800">Special Pickup Instructions:</span>
                <p className="text-neutral-600">{selectedDonation.specialInstructions || 'Standard food collection.'}</p>
              </div>
            </div>

            {/* Google Maps Link */}
            <div className="pt-2 flex items-center justify-between text-xs">
              <a
                href={getGoogleMapsDirectionsUrl(
                  selectedDonation.pickupAddress,
                  selectedDonation.latitude,
                  selectedDonation.longitude
                )}
                target="_blank"
                rel="noopener noreferrer"
                className="text-emerald-700 hover:text-emerald-900 font-semibold flex items-center gap-1.5"
              >
                <MapPin className="w-4 h-4" />
                <span>Open in Google Maps / Directions</span>
                <ExternalLink className="w-3 h-3" />
              </a>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setSelectedDonation(null);
                    setTrackingDonation(selectedDonation);
                  }}
                  className="px-3 py-2 text-neutral-700 hover:bg-neutral-100 rounded-lg font-medium"
                >
                  View Workflow Timeline
                </button>
                <button
                  disabled={
                    selectedDonation.status === 'Expired' || selectedDonation.remainingQuantity <= 0
                  }
                  onClick={() => {
                    const don = selectedDonation;
                    setSelectedDonation(null);
                    handleOpenRequest(don);
                  }}
                  className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold rounded-lg"
                >
                  Request Portion
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Request Food Modal */}
      {requestModalDonation && (
        <div className="fixed inset-0 z-50 bg-neutral-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl border border-neutral-200 max-w-lg w-full p-6 text-neutral-900 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
              <div>
                <h3 className="text-base font-bold text-neutral-900">Request Food Donation</h3>
                <p className="text-xs text-neutral-500">
                  {requestModalDonation.foodName} · Available: {requestModalDonation.remainingQuantity}{' '}
                  {requestModalDonation.unit}
                </p>
              </div>
              <button
                onClick={() => setRequestModalDonation(null)}
                className="p-1 text-neutral-400 hover:text-neutral-700 rounded-lg"
              >
                ✕
              </button>
            </div>

            {requestFeedback && (
              <div
                className={`p-3 rounded-lg text-xs font-medium ${
                  requestFeedback.success
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    : 'bg-rose-50 text-rose-800 border border-rose-200'
                }`}
              >
                {requestFeedback.message}
              </div>
            )}

            <form onSubmit={handleConfirmRequest} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="req-portions-input" className="block font-medium text-neutral-700 mb-1">
                    Requested Portions (Max: {requestModalDonation.remainingQuantity})
                  </label>
                  <input
                    id="req-portions-input"
                    type="number"
                    min={1}
                    max={requestModalDonation.remainingQuantity}
                    required
                    value={requestedPortions}
                    onChange={(e) => setRequestedPortions(Number(e.target.value))}
                    className="w-full p-2 border border-neutral-300 rounded-lg font-mono focus:outline-emerald-600"
                  />
                </div>
                <div>
                  <label htmlFor="req-people-input" className="block font-medium text-neutral-700 mb-1">Number of Residents to Feed</label>
                  <input
                    id="req-people-input"
                    type="number"
                    min={1}
                    required
                    value={peopleToFeed}
                    onChange={(e) => setPeopleToFeed(Number(e.target.value))}
                    className="w-full p-2 border border-neutral-300 rounded-lg font-mono focus:outline-emerald-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="req-time-input" className="block font-medium text-neutral-700 mb-1">Preferred Collection Time</label>
                  <input
                    id="req-time-input"
                    type="time"
                    required
                    value={preferredTime}
                    onChange={(e) => setPreferredTime(e.target.value)}
                    className="w-full p-2 border border-neutral-300 rounded-lg font-mono focus:outline-emerald-600"
                  />
                </div>
                <div>
                  <label htmlFor="req-logistics-select" className="block font-medium text-neutral-700 mb-1">Collection Preference</label>
                  <select
                    id="req-logistics-select"
                    value={logisticsType}
                    onChange={(e) => setLogisticsType(e.target.value as any)}
                    className="w-full p-2 border border-neutral-300 rounded-lg bg-white focus:outline-emerald-600"
                  >
                    <option value="Self Pickup">Self Pickup (Our Institution Van/Staff)</option>
                    <option value="Request Delivery">Request Donor Delivery Assistance</option>
                  </select>
                </div>
              </div>

              <div>
                <label htmlFor="req-dietary-input" className="block font-medium text-neutral-700 mb-1">Dietary Requirements or Resident Notes</label>
                <input
                  id="req-dietary-input"
                  type="text"
                  placeholder="e.g. Mild spice preferred, food containers ready"
                  value={dietaryRequirements}
                  onChange={(e) => setDietaryRequirements(e.target.value)}
                  className="w-full p-2 border border-neutral-300 rounded-lg focus:outline-emerald-600"
                />
              </div>

              <div>
                <label htmlFor="req-notes-input" className="block font-medium text-neutral-700 mb-1">Additional Notes</label>
                <textarea
                  id="req-notes-input"
                  rows={2}
                  placeholder="Name of collection driver, container type, phone..."
                  value={additionalNotes}
                  onChange={(e) => setAdditionalNotes(e.target.value)}
                  className="w-full p-2 border border-neutral-300 rounded-lg focus:outline-emerald-600"
                />
              </div>

              <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-lg flex items-center gap-2 text-amber-900 text-[11px]">
                <ShieldCheck className="w-4 h-4 text-amber-700 shrink-0" />
                <span>
                  By submitting, you agree that your institution will collect food in hygienic thermal pots before the deadline.
                </span>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setRequestModalDonation(null)}
                  className="px-3 py-2 text-neutral-600 hover:bg-neutral-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold rounded-lg"
                >
                  Submit Food Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Timeline Modal */}
      {trackingDonation && (
        <FoodTimelineModal
          donation={trackingDonation}
          relatedRequest={requests.find((r) => r.donationId === trackingDonation.id)}
          onClose={() => setTrackingDonation(null)}
        />
      )}

      {/* Safety Report Modal */}
      {reportingDonation && (
        <ReportComplaintModal
          donation={reportingDonation}
          onClose={() => setReportingDonation(null)}
        />
      )}
    </div>
  );
};

import React, { useState } from 'react';
import {
  Users,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  MapPin,
  Calendar,
  AlertTriangle,
  Building,
  Check,
  ShieldCheck,
  ExternalLink,
  ChevronRight,
  Truck,
  Heart,
  Flag,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { FoodCategory, FoodDonation, FoodRequest } from '../types';
import { JAFFNA_AREA_LIST, calculateDistanceKm, getCoordinatesForArea, getGoogleMapsDirectionsUrl } from '../utils/geoUtils';
import { StatusBadge } from '../components/common/StatusBadge';
import { FoodTimelineModal } from '../components/common/FoodTimelineModal';
import { ReportComplaintModal } from '../components/common/ReportComplaintModal';

interface InstitutionDashboardProps {
  onNavigate: (page: string) => void;
}

export const InstitutionDashboard: React.FC<InstitutionDashboardProps> = ({ onNavigate }) => {
  const {
    currentUser,
    institutions,
    donations,
    requests,
    createRequest,
    updateRequestStatus,
  } = useApp();

  const currentInst =
    institutions.find((i) => i.id === currentUser?.id || i.name.includes('Anbu')) || institutions[0];

  const [activeTab, setActiveTab] = useState<'available' | 'myRequests' | 'schedule' | 'profile'>('available');

  // Search & Filters for Available Food
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedArea, setSelectedArea] = useState<string>('All');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [vegOnly, setVegOnly] = useState(false);

  // Request Form Modal State
  const [requestModalDonation, setRequestModalDonation] = useState<FoodDonation | null>(null);
  const [requestedPortions, setRequestedPortions] = useState<number>(30);
  const [peopleToFeed, setPeopleToFeed] = useState<number>(currentInst.residentCount);
  const [preferredTime, setPreferredTime] = useState<string>('15:30');
  const [logisticsType, setLogisticsType] = useState<'Self Pickup' | 'Request Delivery'>('Self Pickup');
  const [dietaryRequirements, setDietaryRequirements] = useState<string>(
    currentInst.dietaryPreferences.join(', ')
  );
  const [additionalNotes, setAdditionalNotes] = useState<string>('');
  const [requestFeedback, setRequestFeedback] = useState<{ success?: boolean; message?: string } | null>(null);

  const [trackingDonation, setTrackingDonation] = useState<FoodDonation | null>(null);
  const [reportingDonation, setReportingDonation] = useState<FoodDonation | null>(null);

  // Compute distance for all available donations from this institution
  const availableNearbyDonations = donations
    .filter((d) => d.status === 'Available' || d.status === 'Request Received')
    .map((don) => {
      const donorCoords =
        don.latitude && don.longitude
          ? { latitude: don.latitude, longitude: don.longitude }
          : getCoordinatesForArea(don.area);

      const distanceKm = calculateDistanceKm(
        currentInst.latitude,
        currentInst.longitude,
        donorCoords.latitude,
        donorCoords.longitude
      );
      return { ...don, distanceKm };
    })
    .sort((a, b) => a.distanceKm - b.distanceKm);

  const filteredDonations = availableNearbyDonations.filter((d) => {
    const matchesSearch =
      d.foodName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.venueName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.area.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesArea = selectedArea === 'All' || d.area === selectedArea;
    const matchesCat = selectedCategory === 'All' || d.category === selectedCategory;
    const matchesVeg = !vegOnly || d.isVegetarian;

    return matchesSearch && matchesArea && matchesCat && matchesVeg;
  });

  // Institution's requests
  const myRequests = requests.filter(
    (r) => r.institutionId === currentInst.id || r.institutionName.includes('Anbu')
  );

  const pendingRequests = myRequests.filter((r) => r.status === 'Pending');
  const approvedRequests = myRequests.filter((r) => r.status === 'Approved');
  const completedRequests = myRequests.filter(
    (r) => r.status === 'Collected' || r.status === 'Delivered'
  );

  const handleOpenRequestModal = (don: FoodDonation) => {
    setRequestModalDonation(don);
    setRequestedPortions(Math.min(don.remainingQuantity, currentInst.residentCount));
    setPeopleToFeed(currentInst.residentCount);
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
        setActiveTab('myRequests');
      }, 1400);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header with Institution Verification Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-emerald-700 tracking-wider uppercase font-mono">
              Care Home Portal · {currentInst.area}
            </span>
            {currentInst.isVerified ? (
              <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Verified Facility</span>
              </span>
            ) : (
              <span className="text-[11px] font-semibold text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded">
                Pending Verification
              </span>
            )}
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900 mt-1">
            {currentInst.name}
          </h1>
          <p className="text-xs text-neutral-500 mt-0.5">
            {currentInst.institutionType} · Reg #{currentInst.registrationNumber} · {currentInst.residentCount} Residents to Feed
          </p>
        </div>

        <button
          onClick={() => setActiveTab('available')}
          className="px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold rounded-lg text-xs flex items-center gap-2 self-start sm:self-auto transition-colors shadow-xs"
        >
          <Search className="w-4 h-4" />
          <span>Browse Available Food ({availableNearbyDonations.length})</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-neutral-200 shadow-2xs">
          <div className="text-xs text-neutral-500">Available Nearby</div>
          <div className="text-2xl font-bold text-emerald-800 font-mono tabular-nums mt-1">
            {availableNearbyDonations.length}
          </div>
          <div className="text-[11px] text-neutral-400 mt-0.5">Surplus listings in Jaffna</div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-neutral-200 shadow-2xs">
          <div className="text-xs text-amber-700 font-medium">Pending Requests</div>
          <div className="text-2xl font-bold text-amber-800 font-mono tabular-nums mt-1">
            {pendingRequests.length}
          </div>
          <div className="text-[11px] text-neutral-400 mt-0.5">Awaiting donor approval</div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-neutral-200 shadow-2xs">
          <div className="text-xs text-teal-700 font-medium">Ready for Collection</div>
          <div className="text-2xl font-bold text-teal-800 font-mono tabular-nums mt-1">
            {approvedRequests.length}
          </div>
          <div className="text-[11px] text-neutral-400 mt-0.5">Approved & reserved</div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-neutral-200 shadow-2xs">
          <div className="text-xs text-neutral-600 font-medium">Received Meals</div>
          <div className="text-2xl font-bold text-neutral-900 font-mono tabular-nums mt-1">
            {completedRequests.reduce((acc, curr) => acc + curr.requestedPortions, 80)}
          </div>
          <div className="text-[11px] text-neutral-400 mt-0.5">Portions safely served</div>
        </div>
      </div>

      {/* Segmented Control Tabs */}
      <div className="flex items-center gap-1 border-b border-neutral-200 pb-2">
        <button
          onClick={() => setActiveTab('available')}
          className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors ${
            activeTab === 'available'
              ? 'bg-neutral-900 text-white shadow-xs'
              : 'text-neutral-600 hover:text-neutral-900'
          }`}
        >
          Nearby Food Donations ({availableNearbyDonations.length})
        </button>
        <button
          onClick={() => setActiveTab('myRequests')}
          className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 ${
            activeTab === 'myRequests'
              ? 'bg-neutral-900 text-white shadow-xs'
              : 'text-neutral-600 hover:text-neutral-900'
          }`}
        >
          <span>My Food Requests ({myRequests.length})</span>
          {approvedRequests.length > 0 && (
            <span className="w-2 h-2 rounded-full bg-teal-500" />
          )}
        </button>
        <button
          onClick={() => setActiveTab('schedule')}
          className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors ${
            activeTab === 'schedule'
              ? 'bg-neutral-900 text-white shadow-xs'
              : 'text-neutral-600 hover:text-neutral-900'
          }`}
        >
          Collection Schedule ({approvedRequests.length})
        </button>
        <button
          onClick={() => setActiveTab('profile')}
          className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors ${
            activeTab === 'profile'
              ? 'bg-neutral-900 text-white shadow-xs'
              : 'text-neutral-600 hover:text-neutral-900'
          }`}
        >
          Institution Profile
        </button>
      </div>

      {/* TAB 1: Nearby Available Food with Distance Ordering */}
      {activeTab === 'available' && (
        <div className="space-y-4">
          {/* Filters */}
          <div className="bg-white p-3.5 rounded-xl border border-neutral-200 shadow-2xs grid grid-cols-1 md:grid-cols-12 gap-3 text-xs">
            <div className="md:col-span-5 relative">
              <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search food item or venue..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 border border-neutral-300 rounded-lg focus:outline-emerald-600"
              />
            </div>

            <div className="md:col-span-3">
              <select
                value={selectedArea}
                onChange={(e) => setSelectedArea(e.target.value)}
                className="w-full py-1.5 px-2.5 border border-neutral-300 rounded-lg bg-white focus:outline-emerald-600"
              >
                <option value="All">All Jaffna Areas</option>
                {JAFFNA_AREA_LIST.map((a) => (
                  <option key={a} value={a}>
                    {a}
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full py-1.5 px-2.5 border border-neutral-300 rounded-lg bg-white focus:outline-emerald-600"
              >
                <option value="All">All Categories</option>
                <option value="Rice and Curry">Rice & Curry</option>
                <option value="Vegetarian Meals">Vegetarian Meals</option>
                <option value="Chicken Meals">Chicken Meals</option>
                <option value="Snacks">Snacks</option>
              </select>
            </div>

            <div className="md:col-span-2 flex items-center">
              <label className="flex items-center gap-2 font-medium text-neutral-700 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={vegOnly}
                  onChange={(e) => setVegOnly(e.target.checked)}
                  className="w-4 h-4 text-emerald-600 rounded"
                />
                <span>Veg Only</span>
              </label>
            </div>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {filteredDonations.map((don) => {
              const deadlineRemainingHours = Math.max(
                0,
                (new Date(don.safeCollectionDeadline).getTime() - Date.now()) / (1000 * 60 * 60)
              );
              const isUrgent = deadlineRemainingHours < 2;

              return (
                <div
                  key={don.id}
                  className="bg-white rounded-xl border border-neutral-200 overflow-hidden shadow-xs hover:border-emerald-300 transition-colors flex flex-col justify-between"
                >
                  <div>
                    <div className="relative h-40 bg-neutral-100">
                      <img
                        src={don.photos[0] || '/src/assets/images/donor_food_trays_1791886447039.jpg'}
                        alt={don.foodName}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-2.5 left-2.5">
                        <StatusBadge status={don.status} size="sm" />
                      </div>
                      <div className="absolute top-2.5 right-2.5 bg-neutral-900/80 backdrop-blur-xs text-white text-[11px] px-2 py-0.5 rounded font-mono font-semibold">
                        {don.distanceKm} km away
                      </div>
                      <div className="absolute bottom-2 left-2 bg-neutral-900/80 backdrop-blur-xs text-white text-[11px] px-2 py-0.5 rounded font-mono">
                        {don.category}
                      </div>
                    </div>

                    <div className="p-4 space-y-2.5">
                      <div>
                        <div className="flex items-center justify-between text-[11px] text-neutral-500">
                          <span className="font-semibold text-emerald-800">{don.venueName}</span>
                          <span>{don.isVegetarian ? '🌱 Pure Veg' : '🍗 Non-Veg'}</span>
                        </div>
                        <h3 className="text-sm font-bold text-neutral-900 line-clamp-1 mt-0.5">
                          {don.foodName}
                        </h3>
                        <p className="text-xs text-neutral-500 mt-1 line-clamp-2 leading-relaxed">
                          {don.description}
                        </p>
                      </div>

                      <div className="pt-2 border-t border-neutral-100 text-xs space-y-1.5 text-neutral-600">
                        <div className="flex items-center justify-between">
                          <span className="text-neutral-500">Available:</span>
                          <span className="font-bold text-emerald-800 font-mono tabular-nums">
                            {don.remainingQuantity} / {don.totalQuantity} {don.unit}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-neutral-500">Holding condition:</span>
                          <span className="text-[11px] font-medium text-teal-800 truncate max-w-[170px]">
                            {don.storageCondition}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-neutral-500">Safe Until:</span>
                          <span
                            className={`font-mono tabular-nums font-semibold ${
                              isUrgent ? 'text-rose-600' : 'text-neutral-700'
                            }`}
                          >
                            {new Date(don.safeCollectionDeadline).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}{' '}
                            ({Math.round(deadlineRemainingHours * 10) / 10}h left)
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-3 bg-neutral-50 border-t border-neutral-100 flex items-center justify-between gap-2">
                    <button
                      onClick={() => setTrackingDonation(don)}
                      className="text-xs text-neutral-600 hover:text-neutral-900 font-medium"
                    >
                      Timeline
                    </button>

                    <button
                      disabled={don.remainingQuantity <= 0}
                      onClick={() => handleOpenRequestModal(don)}
                      className="px-3.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-semibold transition-colors disabled:bg-neutral-300"
                    >
                      Request Food
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: My Food Requests Tracking */}
      {activeTab === 'myRequests' && (
        <div className="space-y-4">
          {myRequests.length === 0 ? (
            <div className="bg-white p-12 text-center rounded-xl border border-neutral-200 space-y-2">
              <Clock className="w-10 h-10 text-neutral-300 mx-auto" />
              <h3 className="text-base font-bold text-neutral-800">No Food Requests Submitted Yet</h3>
              <p className="text-xs text-neutral-500">
                Browse nearby listings to request surplus portions for your residents.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {myRequests.map((req) => (
                <div
                  key={req.id}
                  className="bg-white p-5 rounded-xl border border-neutral-200 shadow-2xs space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-neutral-100">
                    <div>
                      <div className="flex items-center gap-2">
                        <StatusBadge status={req.status} size="sm" />
                        <span className="text-xs text-neutral-400 font-mono">#{req.id}</span>
                        <span className="text-xs font-semibold text-neutral-900">{req.donationFoodName}</span>
                      </div>
                      <p className="text-xs text-neutral-500 mt-0.5">
                        Donor: <strong className="text-neutral-800">{req.donorName}</strong>
                      </p>
                    </div>

                    <div className="text-xs text-neutral-400 font-mono">
                      Updated: {new Date(req.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                    <div>
                      <span className="text-neutral-400 block">Requested Portions:</span>
                      <span className="font-bold text-emerald-800 font-mono tabular-nums text-sm">
                        {req.requestedPortions} Portions
                      </span>
                    </div>
                    <div>
                      <span className="text-neutral-400 block">People to Feed:</span>
                      <span className="font-medium text-neutral-800">{req.peopleToFeed} Residents</span>
                    </div>
                    <div>
                      <span className="text-neutral-400 block">Collection Time:</span>
                      <span className="font-mono text-neutral-800">{req.preferredTime}</span>
                    </div>
                    <div>
                      <span className="text-neutral-400 block">Logistics:</span>
                      <span className="font-medium text-neutral-800">{req.logisticsType}</span>
                    </div>
                  </div>

                  {/* Recipient Handover Confirmation Button */}
                  {req.status === 'Approved' && (
                    <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-2 bg-emerald-50 p-3 rounded-lg border border-emerald-200 text-xs">
                      <div className="flex items-center gap-2 text-emerald-900">
                        <ShieldCheck className="w-5 h-5 text-emerald-700 shrink-0" />
                        <span>
                          Donation approved! Please inspect food temperature upon pickup and confirm below.
                        </span>
                      </div>
                      <button
                        onClick={() => updateRequestStatus(req.id, 'Collected')}
                        className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold rounded-lg shrink-0 transition-colors shadow-2xs"
                      >
                        Confirm Food Received & Inspected
                      </button>
                    </div>
                  )}

                  {req.status === 'Collected' && (
                    <div className="p-2.5 bg-neutral-50 rounded-lg text-xs text-neutral-600 flex items-center justify-between">
                      <span className="font-medium text-emerald-800">
                        ✓ Completed & Verified on {new Date(req.collectionCompletedAt || req.updatedAt).toLocaleDateString()}
                      </span>
                      <button
                        onClick={() => {
                          const don = donations.find((d) => d.id === req.donationId);
                          if (don) setTrackingDonation(don);
                        }}
                        className="text-xs text-emerald-700 hover:underline"
                      >
                        View Impact Timeline
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: Collection Schedule */}
      {activeTab === 'schedule' && (
        <div className="space-y-4">
          <div className="bg-white p-6 rounded-xl border border-neutral-200 shadow-2xs space-y-4">
            <h3 className="text-base font-bold text-neutral-900">Today's Pickup Schedule</h3>
            {approvedRequests.length === 0 ? (
              <p className="text-xs text-neutral-500">No approved collections scheduled for today yet.</p>
            ) : (
              <div className="space-y-3">
                {approvedRequests.map((req) => (
                  <div
                    key={req.id}
                    className="p-4 bg-teal-50/60 rounded-xl border border-teal-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                  >
                    <div className="space-y-1">
                      <div className="font-bold text-teal-950 text-sm">{req.donationFoodName}</div>
                      <div className="text-teal-800">
                        Venue: <strong>{req.donorName}</strong> · Pickup Time: <strong>{req.preferredTime}</strong>
                      </div>
                      <div className="text-neutral-500">
                        {req.requestedPortions} portions for {req.peopleToFeed} residents ({req.logisticsType})
                      </div>
                    </div>

                    <button
                      onClick={() => updateRequestStatus(req.id, 'Collected')}
                      className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold rounded-lg text-xs shrink-0"
                    >
                      Confirm Collection
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 4: Institution Profile */}
      {activeTab === 'profile' && (
        <div className="bg-white p-6 rounded-xl border border-neutral-200 shadow-2xs space-y-6 max-w-2xl text-xs">
          <h3 className="text-base font-bold text-neutral-900">Facility Verification Record</h3>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="text-neutral-400 block">Registration Code</span>
              <span className="font-mono font-bold text-neutral-800 text-sm">
                {currentInst.registrationNumber}
              </span>
            </div>
            <div>
              <span className="text-neutral-400 block">Facility Type</span>
              <span className="font-semibold text-neutral-800">{currentInst.institutionType}</span>
            </div>
            <div>
              <span className="text-neutral-400 block">Supervisor / Director</span>
              <span className="font-medium text-neutral-800">{currentInst.contactPerson}</span>
            </div>
            <div>
              <span className="text-neutral-400 block">Official Contact Phone</span>
              <span className="font-mono text-neutral-800">{currentInst.phone}</span>
            </div>
            <div>
              <span className="text-neutral-400 block">Resident Capacity</span>
              <span className="font-mono font-bold text-emerald-800">{currentInst.residentCount} Residents</span>
            </div>
            <div>
              <span className="text-neutral-400 block">Operating Hours</span>
              <span className="font-medium text-neutral-800">{currentInst.operatingHours}</span>
            </div>
          </div>

          <div className="p-3 bg-neutral-50 rounded-lg border border-neutral-100 space-y-1">
            <span className="font-semibold text-neutral-700 block">Registered Address</span>
            <span className="text-neutral-800">{currentInst.address}, {currentInst.area}, Jaffna</span>
          </div>

          <div className="p-3 bg-neutral-50 rounded-lg border border-neutral-100 space-y-1">
            <span className="font-semibold text-neutral-700 block">Resident Dietary Preferences</span>
            <span className="text-neutral-800">{currentInst.dietaryPreferences.join(', ')}</span>
          </div>
        </div>
      )}

      {/* REQUEST FOOD TRANSACTION-SAFE MODAL */}
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
                  <label htmlFor="inst-req-portions-input" className="block font-medium text-neutral-700 mb-1">
                    Portions Needed (Max: {requestModalDonation.remainingQuantity})
                  </label>
                  <input
                    id="inst-req-portions-input"
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
                  <label htmlFor="inst-req-people-input" className="block font-medium text-neutral-700 mb-1">Number of People to Feed</label>
                  <input
                    id="inst-req-people-input"
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
                  <label htmlFor="inst-req-time-input" className="block font-medium text-neutral-700 mb-1">Preferred Pickup Time</label>
                  <input
                    id="inst-req-time-input"
                    type="time"
                    required
                    value={preferredTime}
                    onChange={(e) => setPreferredTime(e.target.value)}
                    className="w-full p-2 border border-neutral-300 rounded-lg font-mono focus:outline-emerald-600"
                  />
                </div>
                <div>
                  <label htmlFor="inst-req-logistics-select" className="block font-medium text-neutral-700 mb-1">Collection Mode</label>
                  <select
                    id="inst-req-logistics-select"
                    value={logisticsType}
                    onChange={(e) => setLogisticsType(e.target.value as any)}
                    className="w-full p-2 border border-neutral-300 rounded-lg bg-white focus:outline-emerald-600"
                  >
                    <option value="Self Pickup">Self Pickup (Our Institution Van)</option>
                    <option value="Request Delivery">Request Donor Delivery Assistance</option>
                  </select>
                </div>
              </div>

              <div>
                <label htmlFor="inst-req-dietary-input" className="block font-medium text-neutral-700 mb-1">Dietary Requirements</label>
                <input
                  id="inst-req-dietary-input"
                  type="text"
                  value={dietaryRequirements}
                  onChange={(e) => setDietaryRequirements(e.target.value)}
                  className="w-full p-2 border border-neutral-300 rounded-lg focus:outline-emerald-600"
                />
              </div>

              <div>
                <label htmlFor="inst-req-notes-input" className="block font-medium text-neutral-700 mb-1">Driver & Transport Container Details</label>
                <textarea
                  id="inst-req-notes-input"
                  rows={2}
                  placeholder="e.g. Bringing two stainless steel transport drums in white van WP-1234..."
                  value={additionalNotes}
                  onChange={(e) => setAdditionalNotes(e.target.value)}
                  className="w-full p-2 border border-neutral-300 rounded-lg focus:outline-emerald-600"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setRequestModalDonation(null)}
                  className="px-3 py-2 text-neutral-600 hover:bg-neutral-100 rounded-lg font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold rounded-lg shadow-xs"
                >
                  Confirm Request
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
    </div>
  );
};

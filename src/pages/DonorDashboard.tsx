import React, { useState } from 'react';
import {
  PlusCircle,
  Package,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Building,
  MapPin,
  ExternalLink,
  ChevronRight,
  Filter,
  Eye,
  Trash2,
  Edit3,
  Calendar,
  Sparkles,
  Users,
  ShieldCheck,
  Share2,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import {
  FoodCategory,
  FoodDonation,
  QuantityUnit,
  StorageCondition,
  DonationStatus,
  FoodRequest,
} from '../types';
import { JAFFNA_AREA_LIST, getCoordinatesForArea, getGoogleMapsDirectionsUrl } from '../utils/geoUtils';
import { StatusBadge } from '../components/common/StatusBadge';
import { FoodTimelineModal } from '../components/common/FoodTimelineModal';

interface DonorDashboardProps {
  onNavigate: (page: string) => void;
}

export const DonorDashboard: React.FC<DonorDashboardProps> = ({ onNavigate }) => {
  const {
    currentUser,
    donations,
    addDonation,
    updateDonation,
    deleteDonation,
    requests,
    updateRequestStatus,
    getSmartMatchesForDonation,
    institutions,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'listings' | 'requests' | 'history'>('listings');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingDonation, setEditingDonation] = useState<FoodDonation | null>(null);
  const [selectedDonationForMatching, setSelectedDonationForMatching] = useState<FoodDonation | null>(null);
  const [trackingDonation, setTrackingDonation] = useState<FoodDonation | null>(null);

  // Form State for 21 Fields
  const [formData, setFormData] = useState({
    foodName: '',
    category: 'Vegetarian Meals' as FoodCategory,
    description: '',
    totalQuantity: 50,
    unit: 'portions' as QuantityUnit,
    servesCount: 50,
    eventName: '',
    venueName: '',
    pickupAddress: '',
    area: 'Nallur',
    district: 'Jaffna',
    latitude: 9.6732,
    longitude: 80.0289,
    preparedAt: new Date().toISOString().slice(0, 16),
    safeCollectionDeadline: new Date(Date.now() + 5 * 3600 * 1000).toISOString().slice(0, 16),
    storageCondition: 'Properly Hot-Held (>60°C)' as StorageCondition,
    isVegetarian: true,
    allergenInfo: 'None (Pure Vegetarian)',
    photos: ['/src/assets/images/hero_jaffna_feast_1791886444901.jpg'],
    contactPerson: currentUser?.name || 'Senthil Kumaran',
    contactNumber: currentUser?.phone || '+94 77 123 4567',
    logisticsPreference: 'Pickup Only' as 'Pickup Only' | 'Delivery Available' | 'Flexible',
    specialInstructions: 'Bring clean stainless steel containers to function hall loading dock.',
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Filter donor's listings
  const myDonations = donations.filter(
    (d) => d.donorId === currentUser?.id || d.donorId === 'donor-1'
  );

  const availableDonations = myDonations.filter(
    (d) => d.status === 'Available' || d.status === 'Request Received'
  );

  const myRequests = requests.filter(
    (r) => r.donorId === currentUser?.id || r.donorId === 'donor-1'
  );

  const pendingRequests = myRequests.filter((r) => r.status === 'Pending');
  const completedDonations = myDonations.filter(
    (d) => d.status === 'Collected' || d.status === 'Delivered'
  );

  const validateForm = () => {
    const errors: Record<string, string> = {};
    if (!formData.foodName.trim()) errors.foodName = 'Food name is required';
    if (!formData.description.trim()) errors.description = 'Description is required';
    if (formData.totalQuantity <= 0) errors.totalQuantity = 'Quantity must be greater than 0';
    if (formData.servesCount <= 0) errors.servesCount = 'Serves count must be greater than 0';
    if (!formData.eventName.trim()) errors.eventName = 'Event/function name is required';
    if (!formData.venueName.trim()) errors.venueName = 'Venue or hall name is required';
    if (!formData.pickupAddress.trim()) errors.pickupAddress = 'Pickup address is required';
    if (!formData.contactPerson.trim()) errors.contactPerson = 'Contact person is required';
    if (!formData.contactNumber.trim()) errors.contactNumber = 'Contact phone number is required';

    const prepTime = new Date(formData.preparedAt).getTime();
    const deadlineTime = new Date(formData.safeCollectionDeadline).getTime();
    if (deadlineTime <= prepTime) {
      errors.safeCollectionDeadline = 'Collection deadline must be after preparation time';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleAreaChange = (newArea: string) => {
    const coords = getCoordinatesForArea(newArea);
    setFormData((prev) => ({
      ...prev,
      area: newArea,
      latitude: coords.latitude,
      longitude: coords.longitude,
    }));
  };

  const handleSubmitDonation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    if (editingDonation) {
      updateDonation(editingDonation.id, {
        ...formData,
      });
      setEditingDonation(null);
    } else {
      const created = addDonation({
        donorId: currentUser?.id || 'donor-1',
        donorName: formData.venueName || currentUser?.name || 'Jaffna Wedding Hall',
        donorType: 'Wedding Hall',
        ...formData,
      });
      // Immediately open Smart Matching recommendation for this new donation
      setSelectedDonationForMatching(created);
    }

    setShowAddModal(false);
  };

  const handleEdit = (don: FoodDonation) => {
    setEditingDonation(don);
    setFormData({
      foodName: don.foodName,
      category: don.category,
      description: don.description,
      totalQuantity: don.totalQuantity,
      unit: don.unit,
      servesCount: don.servesCount,
      eventName: don.eventName,
      venueName: don.venueName,
      pickupAddress: don.pickupAddress,
      area: don.area,
      district: don.district || 'Jaffna',
      latitude: don.latitude || 9.6732,
      longitude: don.longitude || 80.0289,
      preparedAt: don.preparedAt.slice(0, 16),
      safeCollectionDeadline: don.safeCollectionDeadline.slice(0, 16),
      storageCondition: don.storageCondition,
      isVegetarian: don.isVegetarian,
      allergenInfo: don.allergenInfo,
      photos: don.photos,
      contactPerson: don.contactPerson,
      contactNumber: don.contactNumber,
      logisticsPreference: don.logisticsPreference,
      specialInstructions: don.specialInstructions,
    });
    setShowAddModal(true);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header and Welcome */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-200">
        <div>
          <div className="text-xs font-semibold text-emerald-700 tracking-wider uppercase font-mono">
            Food Donor Portal · Jaffna
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900 mt-1">
            {currentUser?.name || 'Raja Palace Wedding Hall'}
          </h1>
          <p className="text-xs text-neutral-500 mt-0.5">
            Manage surplus banquet food donations, review care home requests, and coordinate pickup.
          </p>
        </div>

        <button
          onClick={() => {
            setEditingDonation(null);
            setShowAddModal(true);
          }}
          className="px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold rounded-lg text-xs flex items-center gap-2 self-start sm:self-auto transition-colors shadow-xs"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Add Food Donation</span>
        </button>
      </div>

      {/* KPI Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-neutral-200 shadow-2xs">
          <div className="text-xs text-neutral-500">Total Listed</div>
          <div className="text-2xl font-bold text-neutral-900 font-mono tabular-nums mt-1">
            {myDonations.length}
          </div>
          <div className="text-[11px] text-neutral-400 mt-0.5">Events registered</div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-neutral-200 shadow-2xs">
          <div className="text-xs text-emerald-700 font-medium">Currently Available</div>
          <div className="text-2xl font-bold text-emerald-800 font-mono tabular-nums mt-1">
            {availableDonations.length}
          </div>
          <div className="text-[11px] text-neutral-400 mt-0.5">Ready for requests</div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-neutral-200 shadow-2xs">
          <div className="text-xs text-amber-700 font-medium">Pending Requests</div>
          <div className="text-2xl font-bold text-amber-800 font-mono tabular-nums mt-1">
            {pendingRequests.length}
          </div>
          <div className="text-[11px] text-neutral-400 mt-0.5">Awaiting your approval</div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-neutral-200 shadow-2xs">
          <div className="text-xs text-teal-700 font-medium">Completed Donations</div>
          <div className="text-2xl font-bold text-teal-800 font-mono tabular-nums mt-1">
            {completedDonations.length}
          </div>
          <div className="text-[11px] text-neutral-400 mt-0.5">Delivered to care homes</div>
        </div>
      </div>

      {/* Segmented Controls / Tabs */}
      <div className="flex items-center gap-1 border-b border-neutral-200 pb-2">
        <button
          onClick={() => setActiveTab('listings')}
          className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors ${
            activeTab === 'listings'
              ? 'bg-neutral-900 text-white shadow-xs'
              : 'text-neutral-600 hover:text-neutral-900'
          }`}
        >
          My Food Listings ({myDonations.length})
        </button>
        <button
          onClick={() => setActiveTab('requests')}
          className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 ${
            activeTab === 'requests'
              ? 'bg-neutral-900 text-white shadow-xs'
              : 'text-neutral-600 hover:text-neutral-900'
          }`}
        >
          <span>Incoming Requests ({myRequests.length})</span>
          {pendingRequests.length > 0 && (
            <span className="w-2 h-2 rounded-full bg-amber-500" />
          )}
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors ${
            activeTab === 'history'
              ? 'bg-neutral-900 text-white shadow-xs'
              : 'text-neutral-600 hover:text-neutral-900'
          }`}
        >
          Completed Impact History ({completedDonations.length})
        </button>
      </div>

      {/* TAB 1: My Listings */}
      {activeTab === 'listings' && (
        <div className="space-y-4">
          {myDonations.length === 0 ? (
            <div className="bg-white p-12 text-center rounded-xl border border-neutral-200 space-y-3">
              <Package className="w-10 h-10 text-neutral-300 mx-auto" />
              <h3 className="text-base font-bold text-neutral-800">No Food Donations Listed Yet</h3>
              <p className="text-xs text-neutral-500 max-w-sm mx-auto">
                Got extra food from your function? Click the button below to register surplus meals in 2 minutes.
              </p>
              <button
                onClick={() => setShowAddModal(true)}
                className="px-4 py-2 bg-emerald-700 text-white text-xs font-semibold rounded-lg"
              >
                Create First Donation
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {myDonations.map((don) => {
                const deadlineRemainingHours = Math.max(
                  0,
                  (new Date(don.safeCollectionDeadline).getTime() - Date.now()) / (1000 * 60 * 60)
                );

                return (
                  <div
                    key={don.id}
                    className="bg-white p-5 rounded-xl border border-neutral-200 shadow-2xs hover:border-emerald-300 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    <div className="space-y-1.5 flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <StatusBadge status={don.status} size="sm" />
                        <span className="text-xs text-neutral-400 font-mono">#{don.id}</span>
                        <span className="text-xs text-neutral-300">·</span>
                        <span className="text-xs text-neutral-600 font-medium">{don.category}</span>
                        <span className="text-xs text-neutral-300">·</span>
                        <span className="text-xs text-neutral-600">{don.eventName}</span>
                      </div>

                      <h3 className="text-base font-bold text-neutral-900 truncate">
                        {don.foodName}
                      </h3>

                      <div className="flex flex-wrap items-center gap-4 text-xs text-neutral-500 pt-1">
                        <div>
                          Portions:{' '}
                          <strong className="text-emerald-800 font-mono tabular-nums">
                            {don.remainingQuantity} / {don.totalQuantity} {don.unit}
                          </strong>
                        </div>
                        <div>
                          Pickup:{' '}
                          <strong className="text-neutral-800">{don.area}, Jaffna</strong>
                        </div>
                        <div>
                          Safe Deadline:{' '}
                          <strong className="text-neutral-800 font-mono tabular-nums">
                            {new Date(don.safeCollectionDeadline).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}{' '}
                            ({Math.round(deadlineRemainingHours * 10) / 10}h left)
                          </strong>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-wrap items-center gap-2 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-neutral-100">
                      {/* Smart Match Recommendation Trigger */}
                      <button
                        onClick={() => setSelectedDonationForMatching(don)}
                        className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 text-emerald-900 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
                        title="View nearby matching children's and elders' homes"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-emerald-700" />
                        <span>Smart Match ({institutions.length})</span>
                      </button>

                      <button
                        onClick={() => setTrackingDonation(don)}
                        className="px-3 py-1.5 text-neutral-700 hover:bg-neutral-100 rounded-lg text-xs font-medium border border-neutral-200 transition-colors"
                      >
                        Timeline
                      </button>

                      <button
                        onClick={() => handleEdit(don)}
                        className="p-1.5 text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition-colors"
                        title="Edit Listing"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => deleteDonation(don.id)}
                        className="p-1.5 text-neutral-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        title="Delete Listing"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: Incoming Requests */}
      {activeTab === 'requests' && (
        <div className="space-y-4">
          {myRequests.length === 0 ? (
            <div className="bg-white p-12 text-center rounded-xl border border-neutral-200 space-y-2">
              <Users className="w-10 h-10 text-neutral-300 mx-auto" />
              <h3 className="text-base font-bold text-neutral-800">No Food Requests Received Yet</h3>
              <p className="text-xs text-neutral-500">
                When nearby children's or elders' homes request food, they will appear here for your review and approval.
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
                        <span className="text-xs font-semibold text-neutral-900">{req.institutionName}</span>
                      </div>
                      <p className="text-xs text-neutral-500 mt-0.5">
                        Requested for: <strong className="text-neutral-800">{req.donationFoodName}</strong>
                      </p>
                    </div>

                    <div className="text-xs text-neutral-400 font-mono">
                      {new Date(req.createdAt).toLocaleDateString()} at{' '}
                      {new Date(req.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
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
                      <span className="text-neutral-400 block">Residents to Feed:</span>
                      <span className="font-medium text-neutral-800">{req.peopleToFeed} Residents</span>
                    </div>
                    <div>
                      <span className="text-neutral-400 block">Preferred Time:</span>
                      <span className="font-mono text-neutral-800">{req.preferredTime}</span>
                    </div>
                    <div>
                      <span className="text-neutral-400 block">Logistics:</span>
                      <span className="font-medium text-neutral-800">{req.logisticsType}</span>
                    </div>
                  </div>

                  {req.dietaryRequirements && (
                    <div className="p-2.5 bg-neutral-50 rounded-lg text-xs text-neutral-600">
                      <span className="font-semibold text-neutral-700">Resident Dietary Notes: </span>
                      {req.dietaryRequirements}
                    </div>
                  )}

                  {req.additionalNotes && (
                    <div className="text-xs text-neutral-500 italic">
                      Notes: "{req.additionalNotes}"
                    </div>
                  )}

                  {/* Donor Approval Action Controls */}
                  {req.status === 'Pending' && (
                    <div className="pt-2 flex items-center justify-end gap-2 border-t border-neutral-100">
                      <button
                        onClick={() => updateRequestStatus(req.id, 'Rejected', 'Portion already reserved')}
                        className="px-3 py-1.5 text-xs font-medium text-rose-700 hover:bg-rose-50 rounded-lg border border-rose-200 transition-colors"
                      >
                        Decline Request
                      </button>
                      <button
                        onClick={() => updateRequestStatus(req.id, 'Approved')}
                        className="px-4 py-1.5 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg transition-colors shadow-xs"
                      >
                        Approve & Reserve Portions
                      </button>
                    </div>
                  )}

                  {req.status === 'Approved' && (
                    <div className="pt-2 flex items-center justify-between text-xs text-emerald-800 bg-emerald-50/60 p-2.5 rounded-lg border border-emerald-200">
                      <span>Portions successfully confirmed. Awaiting care home collection van.</span>
                      <button
                        onClick={() => updateRequestStatus(req.id, 'Collected')}
                        className="px-3 py-1 bg-emerald-700 text-white font-semibold rounded text-[11px] hover:bg-emerald-800"
                      >
                        Confirm Handed Over
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: Completed History */}
      {activeTab === 'history' && (
        <div className="space-y-4">
          {completedDonations.length === 0 ? (
            <div className="bg-white p-12 text-center rounded-xl border border-neutral-200 space-y-2">
              <CheckCircle className="w-10 h-10 text-neutral-300 mx-auto" />
              <h3 className="text-base font-bold text-neutral-800">No Completed Records Yet</h3>
              <p className="text-xs text-neutral-500">
                Completed donations will appear here with recipient verification records.
              </p>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-neutral-50 border-b border-neutral-200 text-neutral-500 font-medium">
                    <tr>
                      <th className="p-3">Donation / Event</th>
                      <th className="p-3">Category</th>
                      <th className="p-3 text-right">Portions Donated</th>
                      <th className="p-3">Jaffna Area</th>
                      <th className="p-3">Date Completed</th>
                      <th className="p-3 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100">
                    {completedDonations.map((d) => (
                      <tr key={d.id} className="hover:bg-neutral-50/50">
                        <td className="p-3 font-semibold text-neutral-900">{d.foodName}</td>
                        <td className="p-3 text-neutral-600">{d.category}</td>
                        <td className="p-3 text-right font-mono tabular-nums font-bold text-emerald-800">
                          {d.totalQuantity} {d.unit}
                        </td>
                        <td className="p-3 text-neutral-600">{d.area}</td>
                        <td className="p-3 font-mono text-neutral-500">
                          {new Date(d.createdAt).toLocaleDateString()}
                        </td>
                        <td className="p-3 text-right">
                          <StatusBadge status={d.status} size="sm" />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 21-FIELD ADD/EDIT FOOD DONATION MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-neutral-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-xl border border-neutral-200 max-w-3xl w-full p-6 text-neutral-900 max-h-[92vh] overflow-y-auto space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
              <div>
                <h3 className="text-lg font-bold text-neutral-900">
                  {editingDonation ? 'Edit Food Donation Listing' : 'Post Surplus Food Donation (21 Fields)'}
                </h3>
                <p className="text-xs text-neutral-500">
                  Fill in all required fields accurately for Jaffna District care home matching.
                </p>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 text-neutral-400 hover:text-neutral-700 rounded-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitDonation} className="space-y-4 text-xs">
              {/* Field 1 & 2: Food Name & Category */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="field-food-name" className="block font-medium text-neutral-700 mb-1">
                    1. Food Name *
                  </label>
                  <input
                    id="field-food-name"
                    type="text"
                    required
                    placeholder="e.g. Traditional Jaffna Vegetarian Wedding Feast"
                    value={formData.foodName}
                    onChange={(e) => setFormData({ ...formData, foodName: e.target.value })}
                    className="w-full p-2.5 border border-neutral-300 rounded-lg focus:outline-emerald-600"
                  />
                  {formErrors.foodName && (
                    <span className="text-rose-600 text-[11px] mt-0.5">{formErrors.foodName}</span>
                  )}
                </div>

                <div>
                  <label htmlFor="field-food-category" className="block font-medium text-neutral-700 mb-1">
                    2. Food Category *
                  </label>
                  <select
                    id="field-food-category"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                    className="w-full p-2.5 border border-neutral-300 rounded-lg bg-white focus:outline-emerald-600"
                  >
                    <option value="Rice and Curry">Rice and Curry</option>
                    <option value="Vegetarian Meals">Vegetarian Meals</option>
                    <option value="Chicken Meals">Chicken Meals</option>
                    <option value="Snacks">Snacks</option>
                    <option value="Fruits">Fruits</option>
                    <option value="Bakery Items">Bakery Items</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              {/* Field 3: Food Description */}
              <div>
                <label htmlFor="field-food-desc" className="block font-medium text-neutral-700 mb-1">
                  3. Food Description & Dish Details *
                </label>
                <textarea
                  id="field-food-desc"
                  rows={2}
                  required
                  placeholder="e.g. Samba rice, dhal, brinjal moju, potato varuval, vadai, payasam prepared for lunch banquet..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full p-2.5 border border-neutral-300 rounded-lg focus:outline-emerald-600"
                />
                {formErrors.description && (
                  <span className="text-rose-600 text-[11px] mt-0.5">{formErrors.description}</span>
                )}
              </div>

              {/* Field 4, 5, 6: Quantity, Unit, Serves */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label htmlFor="field-total-qty" className="block font-medium text-neutral-700 mb-1">
                    4. Total Quantity Available *
                  </label>
                  <input
                    id="field-total-qty"
                    type="number"
                    min={1}
                    required
                    value={formData.totalQuantity}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        totalQuantity: Number(e.target.value),
                        servesCount: Number(e.target.value),
                      })
                    }
                    className="w-full p-2.5 border border-neutral-300 rounded-lg font-mono focus:outline-emerald-600"
                  />
                </div>

                <div>
                  <label htmlFor="field-qty-unit" className="block font-medium text-neutral-700 mb-1">
                    5. Quantity Unit *
                  </label>
                  <select
                    id="field-qty-unit"
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value as any })}
                    className="w-full p-2.5 border border-neutral-300 rounded-lg bg-white focus:outline-emerald-600"
                  >
                    <option value="portions">Portions</option>
                    <option value="meal boxes">Meal Boxes</option>
                    <option value="kilograms">Kilograms (kg)</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="field-serves-count" className="block font-medium text-neutral-700 mb-1">
                    6. Serves Count (People) *
                  </label>
                  <input
                    id="field-serves-count"
                    type="number"
                    min={1}
                    required
                    value={formData.servesCount}
                    onChange={(e) => setFormData({ ...formData, servesCount: Number(e.target.value) })}
                    className="w-full p-2.5 border border-neutral-300 rounded-lg font-mono focus:outline-emerald-600"
                  />
                </div>
              </div>

              {/* Field 7 & 8: Event Name & Venue Name */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="field-event-name" className="block font-medium text-neutral-700 mb-1">
                    7. Event / Function Name *
                  </label>
                  <input
                    id="field-event-name"
                    type="text"
                    required
                    placeholder="e.g. Kandasamy & Priya Wedding Ceremony"
                    value={formData.eventName}
                    onChange={(e) => setFormData({ ...formData, eventName: e.target.value })}
                    className="w-full p-2.5 border border-neutral-300 rounded-lg focus:outline-emerald-600"
                  />
                </div>

                <div>
                  <label htmlFor="field-venue-name" className="block font-medium text-neutral-700 mb-1">
                    8. Hall, Hotel, Restaurant, or House Name *
                  </label>
                  <input
                    id="field-venue-name"
                    type="text"
                    required
                    placeholder="e.g. Raja Palace Wedding Hall"
                    value={formData.venueName}
                    onChange={(e) => setFormData({ ...formData, venueName: e.target.value })}
                    className="w-full p-2.5 border border-neutral-300 rounded-lg focus:outline-emerald-600"
                  />
                </div>
              </div>

              {/* Field 9, 10, 11: Full Address, Area, District */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label htmlFor="field-pickup-address" className="block font-medium text-neutral-700 mb-1">
                    9. Full Pickup Address *
                  </label>
                  <input
                    id="field-pickup-address"
                    type="text"
                    required
                    placeholder="e.g. Point Pedro Road, Nallur, Jaffna"
                    value={formData.pickupAddress}
                    onChange={(e) => setFormData({ ...formData, pickupAddress: e.target.value })}
                    className="w-full p-2.5 border border-neutral-300 rounded-lg focus:outline-emerald-600"
                  />
                </div>

                <div>
                  <label htmlFor="field-area" className="block font-medium text-neutral-700 mb-1">
                    10. GN Division or Area *
                  </label>
                  <select
                    id="field-area"
                    value={formData.area}
                    onChange={(e) => handleAreaChange(e.target.value)}
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

              {/* Field 11 & 12: District & Lat/Lng */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label htmlFor="field-district" className="block font-medium text-neutral-700 mb-1">
                    11. District
                  </label>
                  <input
                    id="field-district"
                    type="text"
                    disabled
                    value={formData.district}
                    className="w-full p-2.5 border border-neutral-200 bg-neutral-100 rounded-lg font-mono text-neutral-600"
                  />
                </div>
                <div>
                  <label htmlFor="field-latitude" className="block font-medium text-neutral-700 mb-1">
                    12. Latitude
                  </label>
                  <input
                    id="field-latitude"
                    type="number"
                    step="0.0001"
                    value={formData.latitude}
                    onChange={(e) => setFormData({ ...formData, latitude: Number(e.target.value) })}
                    className="w-full p-2.5 border border-neutral-300 rounded-lg font-mono focus:outline-emerald-600"
                  />
                </div>
                <div>
                  <label htmlFor="field-longitude" className="block font-medium text-neutral-700 mb-1">
                    12. Longitude
                  </label>
                  <input
                    id="field-longitude"
                    type="number"
                    step="0.0001"
                    value={formData.longitude}
                    onChange={(e) => setFormData({ ...formData, longitude: Number(e.target.value) })}
                    className="w-full p-2.5 border border-neutral-300 rounded-lg font-mono focus:outline-emerald-600"
                  />
                </div>
              </div>

              {/* Field 13 & 14: Prep time and Collection Deadline */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="field-prep-time" className="block font-medium text-neutral-700 mb-1">
                    13. Food Preparation Date & Time *
                  </label>
                  <input
                    id="field-prep-time"
                    type="datetime-local"
                    required
                    value={formData.preparedAt}
                    onChange={(e) => setFormData({ ...formData, preparedAt: e.target.value })}
                    className="w-full p-2.5 border border-neutral-300 rounded-lg font-mono focus:outline-emerald-600"
                  />
                </div>
                <div>
                  <label htmlFor="field-deadline" className="block font-medium text-neutral-700 mb-1">
                    14. Latest Safe Collection Deadline *
                  </label>
                  <input
                    id="field-deadline"
                    type="datetime-local"
                    required
                    value={formData.safeCollectionDeadline}
                    onChange={(e) =>
                      setFormData({ ...formData, safeCollectionDeadline: e.target.value })
                    }
                    className="w-full p-2.5 border border-neutral-300 rounded-lg font-mono focus:outline-emerald-600"
                  />
                  {formErrors.safeCollectionDeadline && (
                    <span className="text-rose-600 text-[11px] mt-0.5">
                      {formErrors.safeCollectionDeadline}
                    </span>
                  )}
                </div>
              </div>

              {/* Field 15 & 16: Storage Condition & Veg/Non-Veg */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="field-storage-cond" className="block font-medium text-neutral-700 mb-1">
                    15. Storage Condition *
                  </label>
                  <select
                    id="field-storage-cond"
                    value={formData.storageCondition}
                    onChange={(e) => setFormData({ ...formData, storageCondition: e.target.value as any })}
                    className="w-full p-2.5 border border-neutral-300 rounded-lg bg-white focus:outline-emerald-600"
                  >
                    <option value="Properly Hot-Held (>60°C)">Properly Hot-Held (&gt;60°C chafing dishes)</option>
                    <option value="Refrigerated (<5°C)">Refrigerated (&lt;5°C chillers)</option>
                    <option value="Ambient Covered / Freshly Prepared">Ambient Covered / Freshly Prepared</option>
                    <option value="Insulated Food Carrier">Insulated Thermal Food Carrier</option>
                  </select>
                </div>

                <div>
                  <span className="block font-medium text-neutral-700 mb-1">
                    16. Dietary Classification *
                  </span>
                  <div className="flex items-center gap-4 pt-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="vegClassification"
                        checked={formData.isVegetarian}
                        onChange={() => setFormData({ ...formData, isVegetarian: true })}
                        className="text-emerald-600"
                      />
                      <span className="font-semibold text-emerald-800">Pure Vegetarian</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="vegClassification"
                        checked={!formData.isVegetarian}
                        onChange={() => setFormData({ ...formData, isVegetarian: false })}
                        className="text-neutral-700"
                      />
                      <span>Non-Vegetarian (Contains Poultry/Meat)</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Field 17 & 18: Allergens & Photos */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="field-allergens" className="block font-medium text-neutral-700 mb-1">
                    17. Allergen Information
                  </label>
                  <input
                    id="field-allergens"
                    type="text"
                    placeholder="e.g. Contains dairy milk, mustard seeds, peanuts..."
                    value={formData.allergenInfo}
                    onChange={(e) => setFormData({ ...formData, allergenInfo: e.target.value })}
                    className="w-full p-2.5 border border-neutral-300 rounded-lg focus:outline-emerald-600"
                  />
                </div>

                <div>
                  <label htmlFor="field-photo-preset" className="block font-medium text-neutral-700 mb-1">
                    18. Food Photo Preset
                  </label>
                  <select
                    id="field-photo-preset"
                    value={formData.photos[0]}
                    onChange={(e) => setFormData({ ...formData, photos: [e.target.value] })}
                    className="w-full p-2.5 border border-neutral-300 rounded-lg bg-white focus:outline-emerald-600"
                  >
                    <option value="/src/assets/images/hero_jaffna_feast_1791886444901.jpg">
                      Traditional Jaffna Banquet Spread
                    </option>
                    <option value="/src/assets/images/donor_food_trays_1791886447039.jpg">
                      Insulated Food Carrier Trays
                    </option>
                  </select>
                </div>
              </div>

              {/* Field 19: Contact Person & Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="field-contact-name" className="block font-medium text-neutral-700 mb-1">
                    19. Contact Person Name *
                  </label>
                  <input
                    id="field-contact-name"
                    type="text"
                    required
                    value={formData.contactPerson}
                    onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                    className="w-full p-2.5 border border-neutral-300 rounded-lg focus:outline-emerald-600"
                  />
                </div>
                <div>
                  <label htmlFor="field-contact-phone" className="block font-medium text-neutral-700 mb-1">
                    19. Contact Phone Number *
                  </label>
                  <input
                    id="field-contact-phone"
                    type="tel"
                    required
                    value={formData.contactNumber}
                    onChange={(e) => setFormData({ ...formData, contactNumber: e.target.value })}
                    className="w-full p-2.5 border border-neutral-300 rounded-lg font-mono focus:outline-emerald-600"
                  />
                </div>
              </div>

              {/* Field 20 & 21: Logistics Preference & Special Instructions */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="field-logistics-pref" className="block font-medium text-neutral-700 mb-1">
                    20. Collection or Delivery Preference *
                  </label>
                  <select
                    id="field-logistics-pref"
                    value={formData.logisticsPreference}
                    onChange={(e) =>
                      setFormData({ ...formData, logisticsPreference: e.target.value as any })
                    }
                    className="w-full p-2.5 border border-neutral-300 rounded-lg bg-white focus:outline-emerald-600"
                  >
                    <option value="Pickup Only">Pickup Only (Care Home Van / Staff)</option>
                    <option value="Delivery Available">Donor Can Deliver (Within Jaffna Area)</option>
                    <option value="Flexible">Flexible / Discuss via Phone</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="field-special-instructions" className="block font-medium text-neutral-700 mb-1">
                    21. Special Instructions
                  </label>
                  <input
                    id="field-special-instructions"
                    type="text"
                    placeholder="e.g. Bring food-grade pots; enter via hall gate B..."
                    value={formData.specialInstructions}
                    onChange={(e) =>
                      setFormData({ ...formData, specialInstructions: e.target.value })
                    }
                    className="w-full p-2.5 border border-neutral-300 rounded-lg focus:outline-emerald-600"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-neutral-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-neutral-600 hover:bg-neutral-100 rounded-lg font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold rounded-lg shadow-xs"
                >
                  {editingDonation ? 'Update Food Listing' : 'Publish Donation & Match Homes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SMART FOOD MATCHING FOR JAFFNA DISTRICT MODAL (SECTION 5) */}
      {selectedDonationForMatching && (
        <div className="fixed inset-0 z-50 bg-neutral-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-xl border border-neutral-200 max-w-3xl w-full p-6 text-neutral-900 max-h-[90vh] overflow-y-auto space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
              <div>
                <div className="flex items-center gap-1.5 text-xs text-emerald-700 font-semibold uppercase tracking-wider font-mono">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Smart Matching Engine · Jaffna District</span>
                </div>
                <h3 className="text-lg font-bold text-neutral-900">
                  Recommended Care Homes for "{selectedDonationForMatching.foodName}"
                </h3>
                <p className="text-xs text-neutral-500">
                  Calculated based on distance from {selectedDonationForMatching.area}, resident capacity, dietary requirements, and remaining safe time.
                </p>
              </div>
              <button
                onClick={() => setSelectedDonationForMatching(null)}
                className="p-1 text-neutral-400 hover:text-neutral-700 rounded-lg"
              >
                ✕
              </button>
            </div>

            <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200 text-xs flex items-center justify-between">
              <div>
                <span className="font-bold text-emerald-950">Available to Match: </span>
                <span className="font-mono tabular-nums text-emerald-900">
                  {selectedDonationForMatching.remainingQuantity} {selectedDonationForMatching.unit}
                </span>
                <span className="text-emerald-700 mx-2">·</span>
                <span>Category: {selectedDonationForMatching.category}</span>
              </div>
              <span className="text-emerald-700 font-mono">
                Safe for {Math.round(Math.max(0, (new Date(selectedDonationForMatching.safeCollectionDeadline).getTime() - Date.now()) / 3600000) * 10) / 10}h
              </span>
            </div>

            {/* List of Smart Matched Institutions sorted by suitability and distance */}
            <div className="space-y-3">
              {getSmartMatchesForDonation(selectedDonationForMatching).map((match, idx) => (
                <div
                  key={match.institution.id}
                  className="p-4 rounded-xl border border-neutral-200 hover:border-emerald-300 transition-colors bg-white space-y-2.5"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-neutral-900">
                          {idx + 1}. {match.institution.name}
                        </span>
                        <span className="text-[11px] font-medium text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          {match.suitabilityScore}% Suitability Match
                        </span>
                      </div>
                      <p className="text-xs text-neutral-500 mt-0.5">
                        {match.institution.institutionType} · {match.institution.area}, Jaffna
                      </p>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="text-sm font-bold text-emerald-800 font-mono tabular-nums">
                        {match.distanceKm} km away
                      </div>
                      <div className="text-[11px] text-neutral-400">from pickup venue</div>
                    </div>
                  </div>

                  <p className="text-xs text-neutral-600 bg-neutral-50 p-2.5 rounded-lg border border-neutral-100">
                    💡 <strong>Algorithm Insight:</strong> {match.reason}
                  </p>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs text-neutral-600 pt-1">
                    <div>
                      <span className="text-neutral-400 block text-[11px]">Residents Count:</span>
                      <strong className="text-neutral-800 font-mono tabular-nums">
                        {match.institution.residentCount} Persons
                      </strong>
                    </div>
                    <div>
                      <span className="text-neutral-400 block text-[11px]">Can Absorb:</span>
                      <strong className="text-emerald-800 font-mono tabular-nums">
                        {match.canServePortions} Portions
                      </strong>
                    </div>
                    <div>
                      <span className="text-neutral-400 block text-[11px]">Dietary Match:</span>
                      <span className={match.dietaryFit ? 'text-emerald-700 font-semibold' : 'text-amber-700'}>
                        {match.dietaryFit ? '✓ Fully Compatible' : '⚠️ Review Spicing'}
                      </span>
                    </div>
                    <div>
                      <span className="text-neutral-400 block text-[11px]">Contact Person:</span>
                      <span className="font-mono text-neutral-800">
                        {match.institution.contactPerson} ({match.institution.phone})
                      </span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-neutral-100 flex items-center justify-between text-xs">
                    <a
                      href={getGoogleMapsDirectionsUrl(
                        match.institution.address,
                        match.institution.latitude,
                        match.institution.longitude
                      )}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-emerald-700 hover:text-emerald-900 font-semibold flex items-center gap-1"
                    >
                      <span>Map & Directions</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>

                    <div className="flex items-center gap-2">
                      <span className="text-[11px] text-neutral-400 font-mono">
                        Reg: {match.institution.registrationNumber}
                      </span>
                      <button
                        onClick={() => {
                          alert(
                            `Notice sent to ${match.institution.name} via FoodShare Lanka in-app dispatch. They will submit their requested portion count shortly!`
                          );
                        }}
                        className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg font-semibold text-xs"
                      >
                        Notify Institution Now
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setSelectedDonationForMatching(null)}
                className="px-4 py-2 bg-neutral-900 text-white rounded-lg text-xs font-semibold"
              >
                Done
              </button>
            </div>
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

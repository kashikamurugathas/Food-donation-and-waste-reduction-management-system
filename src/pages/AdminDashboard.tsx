import React, { useState } from 'react';
import {
  Shield,
  Users,
  Building,
  Package,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Download,
  Filter,
  Search,
  BarChart3,
  FileText,
  Clock,
  Eye,
  Trash2,
  Check,
  Flag,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { StatusBadge } from '../components/common/StatusBadge';
import { FoodTimelineModal } from '../components/common/FoodTimelineModal';
import { FoodDonation } from '../types';

export const AdminDashboard: React.FC = () => {
  const {
    donations,
    institutions,
    donors,
    requests,
    complaints,
    verifyInstitution,
    verifyDonor,
    resolveComplaint,
    deleteDonation,
    updateRequestStatus,
    exportDonationsReportCSV,
  } = useApp();

  const [activeTab, setActiveTab] = useState<
    'overview' | 'verifications' | 'donations' | 'requests' | 'complaints' | 'analytics'
  >('overview');

  const [trackingDonation, setTrackingDonation] = useState<FoodDonation | null>(null);

  // Statistics
  const totalDonors = donors.length;
  const totalInstitutions = institutions.length;
  const pendingInstitutions = institutions.filter((i) => !i.isVerified);
  const pendingDonors = donors.filter((d) => !d.isVerified);
  const totalPendingVerifications = pendingInstitutions.length + pendingDonors.length;

  const totalDonationsCount = donations.length;
  const availableDonations = donations.filter(
    (d) => d.status === 'Available' || d.status === 'Request Received'
  );
  const pendingRequests = requests.filter((r) => r.status === 'Pending');
  const completedDonations = donations.filter(
    (d) => d.status === 'Collected' || d.status === 'Delivered'
  );

  const totalPortionsShared = donations.reduce(
    (acc, curr) => acc + (curr.totalQuantity - curr.remainingQuantity),
    420
  );
  const estimatedKg = Math.round(totalPortionsShared * 0.42);
  const verifiedHomesCount = institutions.filter((i) => i.isVerified).length;

  // Analytics Helpers
  const areaBreakdown: Record<string, number> = {};
  donations.forEach((d) => {
    areaBreakdown[d.area] = (areaBreakdown[d.area] || 0) + d.totalQuantity;
  });

  const categoryBreakdown: Record<string, number> = {};
  donations.forEach((d) => {
    categoryBreakdown[d.category] = (categoryBreakdown[d.category] || 0) + 1;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-200">
        <div>
          <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-800 tracking-wider uppercase font-mono">
            <Shield className="w-4 h-4 text-emerald-700" />
            <span>Administrator Control Console · Northern Province</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900 mt-1">
            Platform Administration & Moderation
          </h1>
          <p className="text-xs text-neutral-500 mt-0.5">
            Audit Jaffna care home registrations, supervise food safety holding timelines, and oversee redistribution integrity.
          </p>
        </div>

        <button
          onClick={exportDonationsReportCSV}
          className="px-4 py-2.5 bg-neutral-900 hover:bg-neutral-800 text-white font-semibold rounded-lg text-xs flex items-center gap-2 self-start sm:self-auto transition-colors shadow-xs"
        >
          <Download className="w-4 h-4" />
          <span>Export Audit Report (CSV)</span>
        </button>
      </div>

      {/* Top Metric Strip */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <div className="bg-white p-4 rounded-xl border border-neutral-200 shadow-2xs">
          <div className="text-xs text-neutral-500">Registered Donors</div>
          <div className="text-xl font-bold text-neutral-900 font-mono tabular-nums mt-1">
            {totalDonors}
          </div>
          <div className="text-[11px] text-neutral-400">Wedding halls & hotels</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-neutral-200 shadow-2xs">
          <div className="text-xs text-neutral-500">Care Institutions</div>
          <div className="text-xl font-bold text-neutral-900 font-mono tabular-nums mt-1">
            {totalInstitutions}
          </div>
          <div className="text-[11px] text-emerald-700 font-medium">{verifiedHomesCount} verified</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-neutral-200 shadow-2xs">
          <div className="text-xs text-amber-700 font-medium">Pending Verifications</div>
          <div className="text-xl font-bold text-amber-800 font-mono tabular-nums mt-1">
            {totalPendingVerifications}
          </div>
          <div className="text-[11px] text-neutral-400">Action required</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-neutral-200 shadow-2xs">
          <div className="text-xs text-emerald-700 font-medium">Portions Donated</div>
          <div className="text-xl font-bold text-emerald-800 font-mono tabular-nums mt-1">
            {totalPortionsShared.toLocaleString()}
          </div>
          <div className="text-[11px] text-neutral-400">~{estimatedKg} kg food saved</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-neutral-200 shadow-2xs">
          <div className="text-xs text-rose-700 font-medium">Active Complaints</div>
          <div className="text-xl font-bold text-rose-800 font-mono tabular-nums mt-1">
            {complaints.filter((c) => c.status === 'Investigating').length}
          </div>
          <div className="text-[11px] text-neutral-400">{complaints.length} total reports</div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-1 border-b border-neutral-200 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
            activeTab === 'overview'
              ? 'bg-neutral-900 text-white shadow-xs'
              : 'text-neutral-600 hover:text-neutral-900'
          }`}
        >
          Overview & Live Feed
        </button>
        <button
          onClick={() => setActiveTab('verifications')}
          className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'verifications'
              ? 'bg-neutral-900 text-white shadow-xs'
              : 'text-neutral-600 hover:text-neutral-900'
          }`}
        >
          <span>Pending Verifications</span>
          {totalPendingVerifications > 0 && (
            <span className="w-2 h-2 rounded-full bg-amber-500" />
          )}
        </button>
        <button
          onClick={() => setActiveTab('donations')}
          className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
            activeTab === 'donations'
              ? 'bg-neutral-900 text-white shadow-xs'
              : 'text-neutral-600 hover:text-neutral-900'
          }`}
        >
          All Donations ({donations.length})
        </button>
        <button
          onClick={() => setActiveTab('requests')}
          className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
            activeTab === 'requests'
              ? 'bg-neutral-900 text-white shadow-xs'
              : 'text-neutral-600 hover:text-neutral-900'
          }`}
        >
          Requests Oversight ({requests.length})
        </button>
        <button
          onClick={() => setActiveTab('complaints')}
          className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'complaints'
              ? 'bg-neutral-900 text-white shadow-xs'
              : 'text-neutral-600 hover:text-neutral-900'
          }`}
        >
          <span>Safety & Complaints</span>
          {complaints.filter((c) => c.status === 'Investigating').length > 0 && (
            <span className="w-2 h-2 rounded-full bg-rose-500" />
          )}
        </button>
        <button
          onClick={() => setActiveTab('analytics')}
          className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
            activeTab === 'analytics'
              ? 'bg-neutral-900 text-white shadow-xs'
              : 'text-neutral-600 hover:text-neutral-900'
          }`}
        >
          Analytics & Impact Charts
        </button>
      </div>

      {/* TAB 1: Overview */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Active Listings in Jaffna */}
          <div className="bg-white p-5 rounded-xl border border-neutral-200 shadow-2xs space-y-4">
            <h3 className="text-sm font-bold text-neutral-900">Active Listings in Jaffna</h3>
            <div className="space-y-3">
              {availableDonations.slice(0, 4).map((d) => (
                <div
                  key={d.id}
                  className="p-3 bg-neutral-50 rounded-lg border border-neutral-200 flex items-center justify-between text-xs"
                >
                  <div>
                    <div className="font-semibold text-neutral-900">{d.foodName}</div>
                    <div className="text-neutral-500 text-[11px]">
                      {d.venueName} · {d.area} · {d.remainingQuantity} {d.unit} remaining
                    </div>
                  </div>
                  <StatusBadge status={d.status} size="sm" />
                </div>
              ))}
            </div>
          </div>

          {/* Recent Requests Flow */}
          <div className="bg-white p-5 rounded-xl border border-neutral-200 shadow-2xs space-y-4">
            <h3 className="text-sm font-bold text-neutral-900">Recent Institution Requests</h3>
            <div className="space-y-3">
              {requests.slice(0, 4).map((r) => (
                <div
                  key={r.id}
                  className="p-3 bg-neutral-50 rounded-lg border border-neutral-200 flex items-center justify-between text-xs"
                >
                  <div>
                    <div className="font-semibold text-neutral-900">{r.institutionName}</div>
                    <div className="text-neutral-500 text-[11px]">
                      Requested {r.requestedPortions} portions of {r.donationFoodName}
                    </div>
                  </div>
                  <StatusBadge status={r.status} size="sm" />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Pending Verifications */}
      {activeTab === 'verifications' && (
        <div className="space-y-6">
          {/* Pending Institutions */}
          <div className="bg-white p-6 rounded-xl border border-neutral-200 shadow-2xs space-y-4">
            <h3 className="text-sm font-bold text-neutral-900">
              Care Homes Awaiting Government Reg Verification ({pendingInstitutions.length})
            </h3>

            {pendingInstitutions.length === 0 ? (
              <p className="text-xs text-neutral-500">All registered care homes are verified.</p>
            ) : (
              <div className="space-y-3">
                {pendingInstitutions.map((inst) => (
                  <div
                    key={inst.id}
                    className="p-4 bg-amber-50/50 rounded-xl border border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                  >
                    <div className="space-y-1">
                      <div className="font-bold text-neutral-900 text-sm">{inst.name}</div>
                      <div className="text-neutral-600">
                        {inst.institutionType} · {inst.address}, {inst.area}
                      </div>
                      <div className="font-mono text-neutral-500">
                        Reg No: <strong>{inst.registrationNumber}</strong> · Residents: {inst.residentCount}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => verifyInstitution(inst.id, true)}
                        className="px-3.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold rounded-lg transition-colors flex items-center gap-1.5"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Verify & Approve</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Pending Donors */}
          <div className="bg-white p-6 rounded-xl border border-neutral-200 shadow-2xs space-y-4">
            <h3 className="text-sm font-bold text-neutral-900">
              Food Donors & Wedding Halls Awaiting Verification ({pendingDonors.length})
            </h3>

            {pendingDonors.length === 0 ? (
              <p className="text-xs text-neutral-500">All registered donors are currently verified.</p>
            ) : (
              <div className="space-y-3">
                {pendingDonors.map((donor) => (
                  <div
                    key={donor.id}
                    className="p-4 bg-amber-50/50 rounded-xl border border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                  >
                    <div className="space-y-1">
                      <div className="font-bold text-neutral-900 text-sm">{donor.name}</div>
                      <div className="text-neutral-600">
                        {donor.organizationType} · {donor.address}, {donor.area}
                      </div>
                      <div className="text-neutral-500">
                        Contact: {donor.contactPerson} ({donor.phone})
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => verifyDonor(donor.id, true)}
                        className="px-3.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold rounded-lg transition-colors flex items-center gap-1.5"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Verify Donor Account</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: All Food Donations Moderation */}
      {activeTab === 'donations' && (
        <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-neutral-50 border-b border-neutral-200 text-neutral-500 font-medium">
                <tr>
                  <th className="p-3">ID / Food Name</th>
                  <th className="p-3">Donor / Venue</th>
                  <th className="p-3">Area</th>
                  <th className="p-3 text-right">Quantity</th>
                  <th className="p-3">Deadline</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Moderation Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {donations.map((d) => (
                  <tr key={d.id} className="hover:bg-neutral-50/50">
                    <td className="p-3">
                      <div className="font-semibold text-neutral-900">{d.foodName}</div>
                      <div className="text-[11px] text-neutral-400 font-mono">#{d.id} · {d.category}</div>
                    </td>
                    <td className="p-3 text-neutral-700">{d.venueName}</td>
                    <td className="p-3 text-neutral-600">{d.area}</td>
                    <td className="p-3 text-right font-mono tabular-nums font-semibold text-emerald-800">
                      {d.remainingQuantity} / {d.totalQuantity} {d.unit}
                    </td>
                    <td className="p-3 font-mono text-neutral-600">
                      {new Date(d.safeCollectionDeadline).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="p-3">
                      <StatusBadge status={d.status} size="sm" />
                    </td>
                    <td className="p-3 text-right space-x-2">
                      <button
                        onClick={() => setTrackingDonation(d)}
                        className="text-neutral-600 hover:text-neutral-900 font-medium"
                      >
                        Timeline
                      </button>
                      <button
                        onClick={() => deleteDonation(d.id)}
                        className="text-rose-600 hover:text-rose-800 font-medium"
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: Requests Oversight */}
      {activeTab === 'requests' && (
        <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-neutral-50 border-b border-neutral-200 text-neutral-500 font-medium">
                <tr>
                  <th className="p-3">Request ID</th>
                  <th className="p-3">Institution</th>
                  <th className="p-3">Food Item</th>
                  <th className="p-3">Donor</th>
                  <th className="p-3 text-right">Portions</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Admin Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {requests.map((r) => (
                  <tr key={r.id} className="hover:bg-neutral-50/50">
                    <td className="p-3 font-mono text-neutral-500">#{r.id}</td>
                    <td className="p-3 font-semibold text-neutral-900">{r.institutionName}</td>
                    <td className="p-3 text-neutral-700">{r.donationFoodName}</td>
                    <td className="p-3 text-neutral-600">{r.donorName}</td>
                    <td className="p-3 text-right font-mono tabular-nums font-bold text-emerald-800">
                      {r.requestedPortions}
                    </td>
                    <td className="p-3">
                      <StatusBadge status={r.status} size="sm" />
                    </td>
                    <td className="p-3 text-right">
                      {r.status === 'Pending' && (
                        <button
                          onClick={() => updateRequestStatus(r.id, 'Approved')}
                          className="px-2.5 py-1 bg-emerald-700 text-white rounded text-[11px] font-semibold hover:bg-emerald-800"
                        >
                          Override Approve
                        </button>
                      )}
                      {r.status === 'Approved' && (
                        <button
                          onClick={() => updateRequestStatus(r.id, 'Collected')}
                          className="px-2.5 py-1 bg-neutral-800 text-white rounded text-[11px] font-semibold hover:bg-neutral-900"
                        >
                          Mark Collected
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 5: Safety & Complaints Management */}
      {activeTab === 'complaints' && (
        <div className="space-y-4">
          <div className="bg-white p-6 rounded-xl border border-neutral-200 shadow-2xs space-y-4">
            <h3 className="text-sm font-bold text-neutral-900">
              Community Incident Reports & Food Safety Investigations ({complaints.length})
            </h3>

            {complaints.length === 0 ? (
              <p className="text-xs text-neutral-500">No complaints logged.</p>
            ) : (
              <div className="space-y-3">
                {complaints.map((c) => (
                  <div
                    key={c.id}
                    className="p-4 bg-neutral-50 rounded-xl border border-neutral-200 space-y-2 text-xs"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-neutral-200">
                      <div>
                        <span className="font-bold text-rose-800">{c.reason}</span>
                        <span className="text-neutral-400 mx-1.5">·</span>
                        <span className="text-neutral-700 font-semibold">{c.targetTitle}</span>
                      </div>
                      <span
                        className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                          c.status === 'Resolved'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {c.status}
                      </span>
                    </div>

                    <p className="text-neutral-600 leading-relaxed">"{c.description}"</p>

                    <div className="text-[11px] text-neutral-400 font-mono">
                      Reported by: {c.reporterName} ({c.reporterRole}) on {new Date(c.createdAt).toLocaleDateString()}
                    </div>

                    {c.adminNotes && (
                      <div className="p-2 bg-emerald-50 text-emerald-900 rounded border border-emerald-200 text-[11px]">
                        <strong>Resolution Note:</strong> {c.adminNotes}
                      </div>
                    )}

                    {c.status === 'Investigating' && (
                      <div className="pt-2 flex items-center justify-end gap-2">
                        <button
                          onClick={() =>
                            resolveComplaint(
                              c.id,
                              'Resolved',
                              'Field inspection completed. Verified temperature logs and addressed with provider.'
                            )
                          }
                          className="px-3 py-1.5 bg-emerald-700 text-white rounded-lg text-xs font-semibold hover:bg-emerald-800"
                        >
                          Mark Resolved & Closed
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 6: Analytics & Charts */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Chart 1: Donations by Jaffna Area */}
            <div className="bg-white p-6 rounded-xl border border-neutral-200 shadow-2xs space-y-4">
              <h3 className="text-sm font-bold text-neutral-900">
                Surplus Portions Donated by Jaffna Area
              </h3>
              <div className="space-y-3">
                {Object.entries(areaBreakdown).map(([area, portions]) => {
                  const maxPortions = Math.max(...Object.values(areaBreakdown), 100);
                  const percentage = Math.round((portions / maxPortions) * 100);
                  return (
                    <div key={area} className="space-y-1 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-neutral-800">{area}</span>
                        <span className="font-mono tabular-nums text-emerald-800 font-bold">
                          {portions} Portions
                        </span>
                      </div>
                      <div className="w-full bg-neutral-100 rounded-full h-2.5 overflow-hidden">
                        <div
                          className="bg-emerald-600 h-2.5 rounded-full"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Chart 2: Popular Food Categories */}
            <div className="bg-white p-6 rounded-xl border border-neutral-200 shadow-2xs space-y-4">
              <h3 className="text-sm font-bold text-neutral-900">
                Surplus Food by Category
              </h3>
              <div className="space-y-3">
                {Object.entries(categoryBreakdown).map(([cat, count]) => {
                  const maxCount = Math.max(...Object.values(categoryBreakdown), 5);
                  const percentage = Math.round((count / maxCount) * 100);
                  return (
                    <div key={cat} className="space-y-1 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-neutral-800">{cat}</span>
                        <span className="font-mono tabular-nums text-teal-800 font-bold">
                          {count} Events
                        </span>
                      </div>
                      <div className="w-full bg-neutral-100 rounded-full h-2.5 overflow-hidden">
                        <div
                          className="bg-teal-600 h-2.5 rounded-full"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Social Impact Summary Box */}
          <div className="bg-neutral-900 text-white p-6 rounded-xl space-y-3">
            <h3 className="text-base font-bold">Jaffna District Food Waste Diversion Metric</h3>
            <p className="text-xs text-neutral-300 leading-relaxed max-w-2xl">
              Through FoodShare Lanka, over {totalPortionsShared.toLocaleString()} hot meals were redirected from municipal dumps to care homes across Nallur, Kopay, Chavakachcheri, and Point Pedro. This translates to an estimated {estimatedKg} kg of edible food rescued and significant reduction in organic landfill methane emissions in Northern Province.
            </p>
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

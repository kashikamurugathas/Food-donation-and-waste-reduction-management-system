import React, { useState } from 'react';
import { X, AlertOctagon, CheckCircle } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { FoodDonation } from '../../types';

interface ReportComplaintModalProps {
  donation?: FoodDonation;
  targetTitle?: string;
  targetId?: string;
  targetType?: 'Donation' | 'Institution' | 'Donor';
  onClose: () => void;
}

export const ReportComplaintModal: React.FC<ReportComplaintModalProps> = ({
  donation,
  targetTitle = donation?.foodName || 'Food Item',
  targetId = donation?.id || 'target-general',
  targetType = 'Donation',
  onClose,
}) => {
  const { currentUser, fileComplaint } = useApp();
  const [reason, setReason] = useState<
    'Unsafe Food Concern' | 'Inaccurate Listing Details' | 'Missed Collection' | 'Inappropriate Conduct' | 'Other'
  >('Unsafe Food Concern');
  const [description, setDescription] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) return;

    fileComplaint({
      reporterId: currentUser?.id || 'guest',
      reporterName: currentUser?.name || 'Anonymous Community User',
      reporterRole: currentUser?.role || 'donor',
      targetType,
      targetId,
      targetTitle,
      reason,
      description,
    });

    setSubmitted(true);
    setTimeout(() => {
      onClose();
    }, 1800);
  };

  return (
    <div className="fixed inset-0 z-50 bg-neutral-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl border border-neutral-200 max-w-md w-full p-6 text-neutral-900">
        <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
          <div className="flex items-center gap-2 text-rose-700">
            <AlertOctagon className="w-5 h-5 shrink-0" />
            <h3 className="text-base font-semibold text-neutral-900">Report an Issue or Safety Concern</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-neutral-400 hover:text-neutral-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {submitted ? (
          <div className="py-8 text-center space-y-2">
            <CheckCircle className="w-12 h-12 text-emerald-600 mx-auto" />
            <h4 className="text-sm font-semibold text-neutral-900">Report Logged for Admin Investigation</h4>
            <p className="text-xs text-neutral-500">
              Food safety and community trust are our highest priorities. Our Jaffna admin team will inspect this immediately.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="pt-4 space-y-4">
            <div>
              <span className="block text-xs text-neutral-500 mb-1">Target Item / Entity</span>
              <p className="text-sm font-medium text-neutral-800 bg-neutral-50 p-2.5 rounded-lg border border-neutral-200">
                {targetTitle} ({targetType})
              </p>
            </div>

            <div>
              <label htmlFor="complaint-reason-select" className="block text-xs font-medium text-neutral-700 mb-1">Reason for Report</label>
              <select
                id="complaint-reason-select"
                value={reason}
                onChange={(e) => setReason(e.target.value as any)}
                className="w-full text-xs p-2.5 border border-neutral-300 rounded-lg bg-white focus:outline-emerald-600"
              >
                <option value="Unsafe Food Concern">Unsafe Food Concern (Temperature / Freshness / Hygiene)</option>
                <option value="Inaccurate Listing Details">Inaccurate Listing Details (Portions / Allergens / Venue)</option>
                <option value="Missed Collection">Missed Collection or Delayed Transport</option>
                <option value="Inappropriate Conduct">Inappropriate Conduct or Verification Discrepancy</option>
                <option value="Other">Other Community Feedback</option>
              </select>
            </div>

            <div>
              <label htmlFor="complaint-description" className="block text-xs font-medium text-neutral-700 mb-1">Detailed Description</label>
              <textarea
                id="complaint-description"
                rows={3}
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Provide specific details, observed temperature, timing, or safety observations..."
                className="w-full text-xs p-2.5 border border-neutral-300 rounded-lg focus:outline-emerald-600"
              />
            </div>

            <div className="pt-2 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3 py-2 text-xs text-neutral-600 hover:bg-neutral-100 rounded-lg font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg transition-colors"
              >
                Submit Incident Report
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

import React from 'react';
import { X, CheckCircle2, Clock, AlertTriangle, PackageCheck } from 'lucide-react';
import { FoodDonation, FoodRequest } from '../../types';

interface FoodTimelineModalProps {
  donation: FoodDonation;
  relatedRequest?: FoodRequest;
  onClose: () => void;
}

export const FoodTimelineModal: React.FC<FoodTimelineModalProps> = ({
  donation,
  relatedRequest,
  onClose,
}) => {
  const steps = [
    {
      title: 'Food Donation Listed',
      desc: `Posted by ${donation.donorName} at ${new Date(donation.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
      date: new Date(donation.createdAt).toLocaleDateString(),
      completed: true,
      current: donation.status === 'Available',
    },
    {
      title: 'Institution Request Received',
      desc: relatedRequest
        ? `${relatedRequest.institutionName} requested ${relatedRequest.requestedPortions} portions`
        : 'Waiting for nearby institution request',
      date: relatedRequest ? new Date(relatedRequest.createdAt).toLocaleDateString() : undefined,
      completed: !!relatedRequest,
      current: donation.status === 'Request Received' || relatedRequest?.status === 'Pending',
    },
    {
      title: 'Donor / Admin Approval',
      desc: relatedRequest?.status === 'Approved'
        ? 'Request approved. Quantity reserved and collection scheduled.'
        : relatedRequest?.status === 'Rejected'
        ? `Request rejected (${relatedRequest.rejectionReason || 'Quantity unavailable'})`
        : 'Pending donor review',
      date: relatedRequest?.updatedAt ? new Date(relatedRequest.updatedAt).toLocaleDateString() : undefined,
      completed: relatedRequest?.status === 'Approved' || relatedRequest?.status === 'Collected' || relatedRequest?.status === 'Delivered',
      current: relatedRequest?.status === 'Approved',
    },
    {
      title: 'Collection & Temperature Inspection',
      desc:
        donation.status === 'Collected' || relatedRequest?.status === 'Collected'
          ? 'Inspected by care home team and safely picked up in thermal containers'
          : `Must be collected before ${new Date(donation.safeCollectionDeadline).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
      completed: donation.status === 'Collected' || relatedRequest?.status === 'Collected' || donation.status === 'Delivered',
      current: relatedRequest?.status === 'Ready for Collection',
    },
    {
      title: 'Care Home Receipt & Impact Confirmation',
      desc:
        donation.status === 'Collected' || relatedRequest?.status === 'Collected'
          ? 'Completed! Meals served to residents; recorded in Jaffna waste diversion index.'
          : 'Pending final recipient handover confirmation',
      completed: donation.status === 'Collected' || relatedRequest?.status === 'Collected',
      current: false,
    },
  ];

  const isExpired = donation.status === 'Expired' || new Date(donation.safeCollectionDeadline).getTime() < Date.now();

  return (
    <div className="fixed inset-0 z-50 bg-neutral-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-xl border border-neutral-200 max-w-lg w-full p-6 text-neutral-900">
        <div className="flex items-center justify-between pb-4 border-b border-neutral-100">
          <div>
            <h3 className="text-lg font-semibold text-neutral-900">Donation Tracking Timeline</h3>
            <p className="text-xs text-neutral-500">{donation.foodName} · {donation.area}</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {isExpired && (
          <div className="my-4 p-3 bg-rose-50 border border-rose-200 rounded-lg flex items-center gap-2.5 text-xs text-rose-800">
            <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>This listing exceeded its safe holding deadline. For hygiene protection, distribution was closed.</span>
          </div>
        )}

        <div className="py-4 space-y-6">
          {steps.map((step, idx) => (
            <div key={idx} className="flex items-start gap-3.5 relative">
              {idx < steps.length - 1 && (
                <div
                  className={`absolute left-4 top-8 -bottom-6 w-0.5 ${
                    step.completed ? 'bg-emerald-500' : 'bg-neutral-200'
                  }`}
                />
              )}
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 border ${
                  step.completed
                    ? 'bg-emerald-600 border-emerald-600 text-white'
                    : step.current
                    ? 'bg-amber-100 border-amber-500 text-amber-700'
                    : 'bg-neutral-100 border-neutral-300 text-neutral-400'
                }`}
              >
                {step.completed ? (
                  <CheckCircle2 className="w-4 h-4" />
                ) : step.current ? (
                  <Clock className="w-4 h-4" />
                ) : (
                  <span className="text-xs font-mono">{idx + 1}</span>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h4 className={`text-sm font-semibold ${step.completed ? 'text-neutral-900' : 'text-neutral-600'}`}>
                    {step.title}
                  </h4>
                  {step.date && (
                    <span className="text-xs text-neutral-400 font-mono tabular-nums">{step.date}</span>
                  )}
                </div>
                <p className="text-xs text-neutral-500 mt-0.5 leading-relaxed">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="pt-4 border-t border-neutral-100 flex items-center justify-between text-xs text-neutral-500">
          <div className="flex items-center gap-1.5">
            <PackageCheck className="w-4 h-4 text-emerald-600" />
            <span>Food Safe Chain of Custody Verified</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-neutral-900 text-white rounded-lg text-xs font-medium hover:bg-neutral-800 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

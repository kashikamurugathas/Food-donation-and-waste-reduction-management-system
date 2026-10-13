import React from 'react';
import { DonationStatus, RequestStatus } from '../../types';

interface StatusBadgeProps {
  status: DonationStatus | RequestStatus | string;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  const getStatusColor = () => {
    switch (status) {
      case 'Available':
        return 'text-emerald-700 bg-emerald-50 border-emerald-200';
      case 'Approved':
      case 'Delivered':
      case 'Collected':
        return 'text-teal-800 bg-teal-50 border-teal-200';
      case 'Request Received':
      case 'Pending':
      case 'Pending Approval':
        return 'text-amber-800 bg-amber-50 border-amber-200';
      case 'Ready for Collection':
        return 'text-blue-800 bg-blue-50 border-blue-200';
      case 'Expired':
      case 'Rejected':
      case 'Cancelled':
        return 'text-rose-800 bg-rose-50 border-rose-200';
      default:
        return 'text-neutral-700 bg-neutral-100 border-neutral-200';
    }
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium border rounded px-2 py-0.5 whitespace-nowrap ${
        size === 'sm' ? 'text-xs' : 'text-xs md:text-sm'
      } ${getStatusColor()}`}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full ${
          status === 'Available'
            ? 'bg-emerald-500'
            : status === 'Approved' || status === 'Collected'
            ? 'bg-teal-600'
            : status === 'Expired' || status === 'Rejected'
            ? 'bg-rose-500'
            : 'bg-amber-500'
        }`}
        aria-hidden="true"
      />
      <span>{status}</span>
    </span>
  );
};

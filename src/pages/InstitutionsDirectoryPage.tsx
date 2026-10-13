import React, { useState } from 'react';
import {
  Users,
  MapPin,
  ShieldCheck,
  Phone,
  Mail,
  ExternalLink,
  Clock,
  Heart,
  CheckCircle2,
  Building2,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { JAFFNA_AREA_LIST, getGoogleMapsDirectionsUrl } from '../utils/geoUtils';

export const InstitutionsDirectoryPage: React.FC = () => {
  const { institutions } = useApp();
  const [selectedType, setSelectedType] = useState<string>('All');
  const [selectedArea, setSelectedArea] = useState<string>('All');

  const filteredInstitutions = institutions.filter((inst) => {
    const matchesType = selectedType === 'All' || inst.institutionType === selectedType;
    const matchesArea = selectedArea === 'All' || inst.area === selectedArea;
    return matchesType && matchesArea;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <div className="text-xs font-semibold text-emerald-700 tracking-wider uppercase font-mono">
          Jaffna Care Centres Directory
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900">
          Children's Homes & Elders' Homes
        </h1>
        <p className="text-sm text-neutral-600 max-w-3xl">
          Registered and audited residential care facilities across Jaffna District eligible to receive surplus cooked food donations.
        </p>
      </div>

      {/* Filter Controls */}
      <div className="bg-white p-4 rounded-xl border border-neutral-200 shadow-xs flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-neutral-600">Filter by Type:</span>
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="text-xs py-1.5 px-3 border border-neutral-300 rounded-lg bg-white focus:outline-emerald-600"
          >
            <option value="All">All Facilities</option>
            <option value="Children's Home">Children's Homes</option>
            <option value="Elders' Home">Elders' Homes</option>
            <option value="Care Centre">Care Centres</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-neutral-600">Jaffna Area:</span>
          <select
            value={selectedArea}
            onChange={(e) => setSelectedArea(e.target.value)}
            className="text-xs py-1.5 px-3 border border-neutral-300 rounded-lg bg-white focus:outline-emerald-600"
          >
            <option value="All">All Areas</option>
            {JAFFNA_AREA_LIST.map((area) => (
              <option key={area} value={area}>
                {area}
              </option>
            ))}
          </select>
        </div>

        <div className="text-xs text-neutral-400 ml-auto font-mono">
          Showing {filteredInstitutions.length} of {institutions.length} verified care homes
        </div>
      </div>

      {/* Institution Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredInstitutions.map((inst) => (
          <div
            key={inst.id}
            className="bg-white rounded-xl border border-neutral-200 overflow-hidden shadow-xs p-6 flex flex-col justify-between space-y-4 hover:border-emerald-300 transition-colors"
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 text-xs font-medium text-emerald-800">
                    <Building2 className="w-4 h-4 text-emerald-700" />
                    <span>{inst.institutionType} · {inst.area}</span>
                  </div>
                  <h3 className="text-lg font-bold text-neutral-900 mt-1">{inst.name}</h3>
                </div>

                {inst.isVerified ? (
                  <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded flex items-center gap-1 shrink-0">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Verified</span>
                  </span>
                ) : (
                  <span className="text-[11px] font-semibold text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded shrink-0">
                    Pending Verification
                  </span>
                )}
              </div>

              <div className="text-xs space-y-1.5 text-neutral-600 pt-1">
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-neutral-400 shrink-0 mt-0.5" />
                  <span>{inst.address}, {inst.district}</span>
                </div>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-neutral-400 shrink-0" />
                  <span className="font-mono text-neutral-500">Reg No: {inst.registrationNumber}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-neutral-400 shrink-0" />
                  <span>Accepting hours: {inst.operatingHours}</span>
                </div>
              </div>

              <div className="p-3 bg-neutral-50 rounded-lg border border-neutral-100 text-xs space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-neutral-500 font-medium">Residents Count:</span>
                  <span className="font-bold text-neutral-900 font-mono tabular-nums">{inst.residentCount} Persons</span>
                </div>
                <div className="flex items-start justify-between gap-2">
                  <span className="text-neutral-500 font-medium">Dietary Needs:</span>
                  <span className="text-right text-emerald-900 font-medium">{inst.dietaryPreferences.join(', ')}</span>
                </div>
                {inst.notes && (
                  <p className="text-[11px] text-neutral-500 pt-1 border-t border-neutral-200 mt-1 italic">
                    "{inst.notes}"
                  </p>
                )}
              </div>
            </div>

            <div className="pt-3 border-t border-neutral-100 flex items-center justify-between text-xs">
              <div className="space-y-0.5">
                <span className="text-neutral-400 block text-[11px]">Primary Contact</span>
                <span className="font-medium text-neutral-800">{inst.contactPerson} · {inst.phone}</span>
              </div>

              <a
                href={getGoogleMapsDirectionsUrl(inst.address, inst.latitude, inst.longitude)}
                target="_blank"
                rel="noopener noreferrer"
                className="text-emerald-700 hover:text-emerald-900 font-semibold flex items-center gap-1"
              >
                <span>View Map</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

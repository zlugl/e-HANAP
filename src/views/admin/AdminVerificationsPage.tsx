import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { EmployerStatus } from '../../types';
import { PESO_EMPLOYER_REQUIREMENTS } from '../../data/pesoEmployerRequirements';
import { 
  Building2, 
  ShieldCheck, 
  ShieldAlert, 
  CheckCircle2, 
  XCircle, 
  FileText, 
  ExternalLink,
  Search,
  Filter,
  Check,
  X,
  FileCheck
} from 'lucide-react';

interface AdminVerificationsPageProps {
  initialEmployerId?: string;
  onNavigate: (view: string, params?: any) => void;
}

export const AdminVerificationsPage: React.FC<AdminVerificationsPageProps> = ({ initialEmployerId, onNavigate }) => {
  const { employers, verifyEmployer } = useApp();
  const [filter, setFilter] = useState<'all' | 'pending' | 'verified' | 'for_compliance' | 'rejected' | 'suspended'>('all');
  const [selectedEmployerId, setSelectedEmployerId] = useState<string | null>(initialEmployerId || null);
  const [verificationNotes, setVerificationNotes] = useState('');

  const filteredEmployers = employers.filter(e => {
    if (filter === 'all') return true;
    return e.status === filter;
  });

  const selectedEmployer = employers.find(e => e.id === selectedEmployerId) || filteredEmployers[0];

  const handleStatusUpdate = (status: EmployerStatus) => {
    if (!selectedEmployer) return;
    verifyEmployer(selectedEmployer.id, status, verificationNotes);
    setVerificationNotes('');
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8 font-sans">
      
      {/* Header Bar */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
            Employer Business Verification Console
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Validate DTI/SEC registration, BIR Form 2303, and Mayor's Business Permits for Oriental Mindoro employers.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5 bg-slate-100 p-1 rounded-xl text-xs font-semibold">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 rounded-lg transition-colors ${filter === 'all' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
          >
            All ({employers.length})
          </button>
          <button
            onClick={() => setFilter('pending')}
            className={`px-3 py-1.5 rounded-lg transition-colors ${filter === 'pending' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
          >
            Pending ({employers.filter(e => e.status === 'pending').length})
          </button>
          <button
            onClick={() => setFilter('for_compliance')}
            className={`px-3 py-1.5 rounded-lg transition-colors ${filter === 'for_compliance' ? 'bg-amber-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
          >
            For Compliance ({employers.filter(e => e.status === 'for_compliance').length})
          </button>
          <button
            onClick={() => setFilter('verified')}
            className={`px-3 py-1.5 rounded-lg transition-colors ${filter === 'verified' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
          >
            Verified ({employers.filter(e => e.status === 'verified').length})
          </button>
        </div>
      </div>

      {/* Main Grid: List + Detail Inspector */}
      {filteredEmployers.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-2xl border border-slate-200 space-y-3">
          <ShieldCheck className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">No Employer Records</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            {filter !== 'all' 
              ? `There are currently no employers with "${filter}" status.`
              : 'There are currently no employers registered in the system.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left List */}
          <div className="lg:col-span-5 space-y-3">
            {filteredEmployers.map(emp => {
              const isSelected = selectedEmployer?.id === emp.id;
              return (
                <div
                  key={emp.id}
                  onClick={() => setSelectedEmployerId(emp.id)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer ${
                    isSelected 
                      ? 'bg-indigo-50/60 border-indigo-400 shadow-sm' 
                      : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-3 min-w-0">
                      <img
                        src={emp.logoUrl || 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=150&auto=format&fit=crop&q=80'}
                        alt={emp.companyName}
                        className="w-10 h-10 rounded-lg object-cover ring-1 ring-slate-200 shrink-0"
                      />
                      <div className="min-w-0">
                        <h3 className="text-xs font-bold text-slate-900 truncate">{emp.companyName}</h3>
                        <p className="text-[11px] text-slate-500 truncate">{emp.municipality} • {emp.industry}</p>
                      </div>
                    </div>

                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase shrink-0 border ${
                      emp.status === 'verified' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                      emp.status === 'pending' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                      'bg-rose-50 text-rose-700 border-rose-200'
                    }`}>
                      {emp.status}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

        {/* Right Detail Inspector */}
        <div className="lg:col-span-7">
          {selectedEmployer ? (
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
              
              <div className="flex items-start justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-4">
                  <img
                    src={selectedEmployer.logoUrl || 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=150&auto=format&fit=crop&q=80'}
                    alt={selectedEmployer.companyName}
                    className="w-14 h-14 rounded-xl object-cover ring-2 ring-indigo-500/20"
                  />
                  <div>
                    <h2 className="text-lg font-bold text-slate-900">{selectedEmployer.companyName}</h2>
                    <p className="text-xs text-slate-500">{selectedEmployer.industry} • {selectedEmployer.municipality}, Oriental Mindoro</p>
                  </div>
                </div>

                <span className={`text-xs font-bold px-3 py-1 rounded-lg uppercase border ${
                  selectedEmployer.status === 'verified' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                  selectedEmployer.status === 'for_compliance' ? 'bg-amber-50 text-amber-800 border-amber-300' :
                  selectedEmployer.status === 'pending' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                  selectedEmployer.status === 'suspended' ? 'bg-slate-100 text-slate-700 border-slate-300' :
                  'bg-rose-50 text-rose-700 border-rose-200'
                }`}>
                  {selectedEmployer.status.replace(/_/g, ' ')}
                </span>
              </div>

              {/* Company Details & Compliance Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs bg-slate-50 p-4 rounded-xl border border-slate-100">
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Representative</p>
                  <p className="font-semibold text-slate-800">{selectedEmployer.representativeName}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Contact Email</p>
                  <p className="font-semibold text-slate-800">{selectedEmployer.email}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Contact Number</p>
                  <p className="font-semibold text-slate-800">{selectedEmployer.contactNumber || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Business Permit No.</p>
                  <p className="font-mono font-semibold text-slate-800">{selectedEmployer.businessPermitNo || 'BP-2026-CAL-99421'}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase">DTI / SEC Registration</p>
                  <p className="font-mono font-semibold text-slate-800">{selectedEmployer.dtiSecRegistration || 'DTI-09214-ORMIN'}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase">BIR Form 2303 (TIN)</p>
                  <p className="font-mono font-semibold text-slate-800">{selectedEmployer.bir2303No || '009-842-113-000'}</p>
                </div>
              </div>

              {/* Compliance Documents Uploads / Attachments: 11 Requirements */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <FileCheck className="w-4 h-4 text-indigo-600" />
                    <span>Mga Requirements ng Employer / Establishment (PESO Checklist)</span>
                  </p>
                  <span className="text-[10px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md font-medium">
                    Only applicable documents required
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {PESO_EMPLOYER_REQUIREMENTS.map((req, idx) => {
                    const fileVal = (selectedEmployer as any)[req.fieldKey] || 
                                    (req.fieldKey === 'mayorsPermitFile' ? (selectedEmployer.mayorsPermitFile || selectedEmployer.businessPermitFile) : '') ||
                                    (req.fieldKey === 'dtiSecFile' ? selectedEmployer.dtiSecFile : '') ||
                                    (req.fieldKey === 'sanitaryPermitFile' ? selectedEmployer.sanitaryPermitFile : '') ||
                                    (req.fieldKey === 'letterOfIntentFile' ? selectedEmployer.letterOfIntentFile : '') ||
                                    (req.fieldKey === 'buildingPermitFile' ? selectedEmployer.buildingPermitFile : '');
                    const hasFile = Boolean(fileVal && fileVal.trim());

                    return (
                      <div 
                        key={req.id} 
                        className={`p-2.5 rounded-xl border flex items-start justify-between gap-2 transition-all ${
                          hasFile 
                            ? 'bg-emerald-50/50 border-emerald-200' 
                            : 'bg-white border-slate-200'
                        }`}
                      >
                        <div className="space-y-0.5 min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="w-4 h-4 rounded-full bg-slate-100 text-slate-700 text-[9px] font-bold flex items-center justify-center shrink-0">
                              {idx + 1}
                            </span>
                            <p className="font-bold text-slate-800 text-[11px] truncate">{req.title}</p>
                          </div>
                          <p className="text-[10px] text-slate-500 truncate pl-5.5">{req.issuingAgency}</p>
                          {hasFile && (
                            <p className="text-[10px] text-emerald-800 font-mono pl-5.5 truncate">
                              📄 {fileVal}
                            </p>
                          )}
                        </div>

                        {hasFile ? (
                          <span className="text-[9px] font-bold px-1.5 py-0.5 bg-emerald-100 text-emerald-800 rounded-md shrink-0 flex items-center gap-0.5">
                            <Check className="w-2.5 h-2.5 text-emerald-600" /> Attached
                          </span>
                        ) : (
                          <span className="text-[9px] font-medium px-1.5 py-0.5 bg-slate-100 text-slate-500 rounded-md shrink-0">
                            Optional / N/A
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Remarks History if any */}
              {(selectedEmployer.complianceRemarks || selectedEmployer.verificationNotes) && (
                <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs space-y-1">
                  <p className="font-bold text-amber-900">Current PESO Remarks / Requirements:</p>
                  <p className="text-amber-800">{selectedEmployer.complianceRemarks || selectedEmployer.verificationNotes}</p>
                </div>
              )}

              {/* Description */}
              <div>
                <p className="text-xs font-bold text-slate-700 mb-1">Company Profile Description</p>
                <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-lg leading-relaxed">
                  {selectedEmployer.companyDescription}
                </p>
              </div>

              {/* Verification Decision Controls */}
              <div className="pt-4 border-t border-slate-100 space-y-3">
                <p className="text-xs font-bold text-slate-900">PESO Officer Verification Action</p>
                <textarea
                  rows={2}
                  value={verificationNotes}
                  onChange={e => setVerificationNotes(e.target.value)}
                  placeholder="Enter specific verification notes or compliance instructions for the employer..."
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
                />

                <div className="flex flex-wrap items-center gap-2.5">
                  <button
                    onClick={() => handleStatusUpdate('verified')}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
                  >
                    <Check className="w-4 h-4" />
                    Approve & Verify Employer
                  </button>

                  <button
                    onClick={() => {
                      if (!selectedEmployer) return;
                      const notes = verificationNotes || 'Please submit a clear copy of your updated 2026 Mayor\'s Business Permit and valid BIR 2303 Certificate.';
                      verifyEmployer(selectedEmployer.id, 'for_compliance', notes);
                      setVerificationNotes('');
                    }}
                    className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white font-semibold text-xs rounded-xl transition-colors flex items-center gap-1.5 shadow-xs"
                  >
                    <FileText className="w-4 h-4" />
                    Return for Compliance
                  </button>

                  <button
                    onClick={() => handleStatusUpdate('rejected')}
                    className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs rounded-xl transition-colors flex items-center gap-1.5"
                  >
                    <X className="w-4 h-4" />
                    Reject Registration
                  </button>

                  {selectedEmployer.status === 'verified' && (
                    <button
                      onClick={() => handleStatusUpdate('suspended')}
                      className="px-3.5 py-2 bg-slate-700 hover:bg-slate-800 text-white font-semibold text-xs rounded-xl transition-colors flex items-center gap-1"
                    >
                      Suspend Account
                    </button>
                  )}
                </div>
              </div>

            </div>
          ) : (
            <div className="bg-white p-12 text-center rounded-2xl border border-slate-200">
              <Building2 className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-xs font-semibold text-slate-700">Select an employer record to inspect</p>
            </div>
          )}
        </div>

      </div>
      )}

    </div>
  );
};

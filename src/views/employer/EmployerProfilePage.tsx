import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ORIENTAL_MINDORO_MUNICIPALITIES, JOB_CATEGORIES } from '../../data/mockData';
import { PESO_EMPLOYER_REQUIREMENTS } from '../../data/pesoEmployerRequirements';
import { 
  Building2, 
  ShieldCheck, 
  ShieldAlert, 
  MapPin, 
  Phone, 
  Mail, 
  Globe, 
  Save, 
  Check, 
  FileText, 
  Upload, 
  CheckCircle2, 
  AlertCircle,
  ExternalLink,
  Sparkles,
  ArrowRight,
  Briefcase,
  Users,
  Calendar,
  BarChart3
} from 'lucide-react';

interface EmployerProfilePageProps {
  onNavigate?: (view: string, params?: any) => void;
}

export const EmployerProfilePage: React.FC<EmployerProfilePageProps> = ({ onNavigate }) => {
  const { currentEmployerProfile, updateEmployerProfile, verifyEmployer, showToast } = useApp();

  if (!currentEmployerProfile) return null;

  const [companyName, setCompanyName] = useState(currentEmployerProfile.companyName || '');
  const [representativeName, setRepresentativeName] = useState(currentEmployerProfile.representativeName || '');
  const [industry, setIndustry] = useState(currentEmployerProfile.industry || JOB_CATEGORIES[0]);
  const [municipality, setMunicipality] = useState(currentEmployerProfile.municipality || 'Roxas');
  const [address, setAddress] = useState(currentEmployerProfile.address || '');
  const [contactNumber, setContactNumber] = useState(currentEmployerProfile.contactNumber || '');
  const [email, setEmail] = useState(currentEmployerProfile.email || '');
  const [website, setWebsite] = useState(currentEmployerProfile.website || '');
  const [companyDescription, setCompanyDescription] = useState(currentEmployerProfile.companyDescription || currentEmployerProfile.description || '');
  
  // PESO Regulatory Requirements State
  const [mayorsPermitFile, setMayorsPermitFile] = useState(currentEmployerProfile.mayorsPermitFile || currentEmployerProfile.businessPermitFile || '');
  const [dtiSecFile, setDtiSecFile] = useState(currentEmployerProfile.dtiSecFile || '');
  const [sanitaryPermitFile, setSanitaryPermitFile] = useState(currentEmployerProfile.sanitaryPermitFile || '');
  const [letterOfIntentFile, setLetterOfIntentFile] = useState(currentEmployerProfile.letterOfIntentFile || '');
  const [aitrFile, setAitrFile] = useState(currentEmployerProfile.aitrFile || '');
  const [sedulaFile, setSedulaFile] = useState(currentEmployerProfile.sedulaFile || '');
  const [barangayClearanceFile, setBarangayClearanceFile] = useState(currentEmployerProfile.barangayClearanceFile || '');
  const [esoCertFile, setEsoCertFile] = useState(currentEmployerProfile.esoCertFile || '');
  const [zoningCertFile, setZoningCertFile] = useState(currentEmployerProfile.zoningCertFile || '');
  const [buildingPermitFile, setBuildingPermitFile] = useState(currentEmployerProfile.buildingPermitFile || '');
  const [tourismClearanceFile, setTourismClearanceFile] = useState(currentEmployerProfile.tourismClearanceFile || '');
  const [mtoReceiptFile, setMtoReceiptFile] = useState(currentEmployerProfile.mtoReceiptFile || '');
  const [fireSafetyClearanceFile, setFireSafetyClearanceFile] = useState(currentEmployerProfile.fireSafetyClearanceFile || '');

  const [businessPermitNo, setBusinessPermitNo] = useState(currentEmployerProfile.businessPermitNo || '');
  const [dtiSecRegistration, setDtiSecRegistration] = useState(currentEmployerProfile.dtiSecRegistration || '');
  const [bir2303No, setBir2303No] = useState(currentEmployerProfile.bir2303No || '');
  const [logoUrl, setLogoUrl] = useState(currentEmployerProfile.logoUrl || '');
  const [isSaved, setIsSaved] = useState(false);

  const isForCompliance = currentEmployerProfile.status === 'for_compliance';

  const docStateMap: Record<string, { value: string; setter: (val: string) => void }> = {
    mayorsPermitFile: { value: mayorsPermitFile, setter: setMayorsPermitFile },
    dtiSecFile: { value: dtiSecFile, setter: setDtiSecFile },
    sanitaryPermitFile: { value: sanitaryPermitFile, setter: setSanitaryPermitFile },
    letterOfIntentFile: { value: letterOfIntentFile, setter: setLetterOfIntentFile },
    aitrFile: { value: aitrFile, setter: setAitrFile },
    sedulaFile: { value: sedulaFile, setter: setSedulaFile },
    barangayClearanceFile: { value: barangayClearanceFile, setter: setBarangayClearanceFile },
    esoCertFile: { value: esoCertFile, setter: setEsoCertFile },
    zoningCertFile: { value: zoningCertFile, setter: setZoningCertFile },
    buildingPermitFile: { value: buildingPermitFile, setter: setBuildingPermitFile },
    tourismClearanceFile: { value: tourismClearanceFile, setter: setTourismClearanceFile },
    mtoReceiptFile: { value: mtoReceiptFile, setter: setMtoReceiptFile },
    fireSafetyClearanceFile: { value: fireSafetyClearanceFile, setter: setFireSafetyClearanceFile },
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    // If employer was for_compliance, submitting updates moves them to pending (In Review)
    const newStatus = isForCompliance ? 'pending' : currentEmployerProfile.status;

    updateEmployerProfile({
      companyName,
      representativeName,
      industry,
      municipality,
      address,
      contactNumber,
      email,
      website,
      companyDescription,
      description: companyDescription,
      businessPermitNo,
      businessPermitFile: mayorsPermitFile,
      mayorsPermitFile,
      dtiSecRegistration,
      bir2303No,
      dtiSecFile,
      sanitaryPermitFile,
      letterOfIntentFile,
      aitrFile,
      sedulaFile,
      barangayClearanceFile,
      esoCertFile,
      zoningCertFile,
      buildingPermitFile,
      tourismClearanceFile,
      mtoReceiptFile,
      fireSafetyClearanceFile,
      logoUrl,
      status: newStatus,
      isProfileCompleted: true,
      complianceRemarks: isForCompliance ? undefined : currentEmployerProfile.complianceRemarks
    });

    setIsSaved(true);
    showToast({
      title: isForCompliance ? 'Compliance Documents Resubmitted' : 'Company Profile Updated',
      message: isForCompliance 
        ? 'Your compliance documents have been submitted to PESO-LGU for review.'
        : 'Your employer profile information has been saved successfully.',
      type: 'status'
    });
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto space-y-6 font-sans">
      
      {/* Setup Incomplete Notice Banner */}
      {!currentEmployerProfile.isProfileCompleted && onNavigate && (
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-5 rounded-2xl text-white shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-300" />
              <h3 className="font-bold text-sm sm:text-base">Step-by-Step Onboarding Incomplete</h3>
            </div>
            <p className="text-xs text-blue-100 max-w-xl leading-relaxed">
              Finish the 4-step Employer Onboarding Wizard to complete your company background, contact points, and required PESO accreditation documents.
            </p>
          </div>
          <button
            type="button"
            onClick={() => onNavigate('employer-profile-setup')}
            className="px-4 py-2 bg-white text-blue-700 hover:bg-blue-50 font-bold text-xs rounded-xl shadow-xs flex items-center gap-1.5 shrink-0 cursor-pointer"
          >
            <span>Resume Setup Wizard</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <img
            src={logoUrl || 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=150&auto=format&fit=crop&q=80'}
            alt={companyName}
            className="w-16 h-16 rounded-2xl object-cover ring-2 ring-indigo-500/20 shrink-0"
          />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-slate-900">{companyName || 'Company Profile'}</h1>
              {currentEmployerProfile.status === 'verified' ? (
                <span className="text-[10px] font-black bg-emerald-100 text-emerald-800 border border-emerald-300 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> PESO Verified
                </span>
              ) : currentEmployerProfile.status === 'for_compliance' ? (
                <span className="text-[10px] font-black bg-amber-100 text-amber-900 border border-amber-300 px-2.5 py-0.5 rounded-full flex items-center gap-1 animate-pulse">
                  <AlertCircle className="w-3.5 h-3.5 text-amber-600" /> Action Required: For Compliance
                </span>
              ) : currentEmployerProfile.status === 'suspended' ? (
                <span className="text-[10px] font-black bg-rose-100 text-rose-800 border border-rose-300 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                  <ShieldAlert className="w-3.5 h-3.5 text-rose-600" /> Account Suspended
                </span>
              ) : (
                <span className="text-[10px] font-black bg-blue-100 text-blue-800 border border-blue-300 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                  <ShieldAlert className="w-3.5 h-3.5 text-blue-600" /> Pending Review
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-0.5">{industry} • {municipality}, Oriental Mindoro</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {onNavigate && (
            <button
              type="button"
              onClick={() => onNavigate('employer-profile-setup')}
              className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors cursor-pointer"
            >
              Rerun Setup Wizard
            </button>
          )}

          {currentEmployerProfile.status !== 'verified' && (
            <button
              type="button"
              onClick={() => {
                verifyEmployer(currentEmployerProfile.id, 'verified', 'PESO Accreditation Verified.');
                showToast({
                  type: 'match',
                  title: 'Account Verified by PESO! 🏛️',
                  message: `${currentEmployerProfile.companyName} is now fully verified. You can post job vacancies!`
                });
              }}
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Simulate PESO Approval</span>
            </button>
          )}

          {isSaved && (
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200 flex items-center gap-1.5">
              <Check className="w-4 h-4 text-emerald-600" /> Changes Saved
            </span>
          )}
        </div>
      </div>



      {/* For Compliance Alert Banner */}
      {isForCompliance && (
        <div className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-5 shadow-xs space-y-3">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-600 text-white flex items-center justify-center shrink-0">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <h2 className="text-sm font-black text-amber-950">
                PESO Compliance Notice: Document Resubmission Required
              </h2>
              <p className="text-xs text-amber-900 leading-relaxed font-medium">
                {currentEmployerProfile.complianceRemarks ||
                  'Your registration documents require update or clarification. Please ensure your applicable documents are uploaded and clear.'}
              </p>
            </div>
          </div>
          <p className="text-[11px] text-amber-800 bg-white/80 p-3 rounded-xl border border-amber-200">
            ℹ️ Update your compliance document details below and click <strong>"Submit Compliance Documents"</strong>. Your profile will return to <em>"Under Review"</em> for immediate validation by the PESO verification team.
          </p>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSave} className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs space-y-6">
        
        <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
          <Building2 className="w-4 h-4 text-indigo-600" />
          Company & Business Details
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Company / Business Name *</label>
            <input
              type="text"
              required
              value={companyName}
              onChange={e => setCompanyName(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 font-semibold"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Authorized Representative *</label>
            <input
              type="text"
              required
              value={representativeName}
              onChange={e => setRepresentativeName(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 font-semibold"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Industry Sector *</label>
            <select
              value={industry}
              onChange={e => setIndustry(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white focus:ring-2 focus:ring-indigo-500 font-semibold"
            >
              {JOB_CATEGORIES.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Municipality (Oriental Mindoro) *</label>
            <select
              value={municipality}
              onChange={e => setMunicipality(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white focus:ring-2 focus:ring-indigo-500 font-semibold"
            >
              {ORIENTAL_MINDORO_MUNICIPALITIES.map(m => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>

          <div className="sm:col-span-2">
            <label className="block font-bold text-slate-700 mb-1">Complete Physical Address</label>
            <input
              type="text"
              value={address}
              onChange={e => setAddress(e.target.value)}
              placeholder="Building, Street, Barangay, Municipality"
              className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 font-medium"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Contact Telephone / Mobile *</label>
            <input
              type="text"
              required
              value={contactNumber}
              onChange={e => setContactNumber(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 font-medium"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Official Contact Email *</label>
            <input
              type="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 font-medium"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Company Website URL</label>
            <input
              type="text"
              value={website}
              onChange={e => setWebsite(e.target.value)}
              placeholder="https://yourcompany.ph"
              className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 font-medium"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Company Logo Image URL</label>
            <input
              type="text"
              value={logoUrl}
              onChange={e => setLogoUrl(e.target.value)}
              placeholder="https://..."
              className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 font-medium"
            />
          </div>
        </div>

        {/* Company Description */}
        <div className="pt-4 border-t border-slate-100 text-xs">
          <label className="block font-bold text-slate-700 mb-1">Company Overview / Description *</label>
          <textarea
            rows={4}
            required
            value={companyDescription}
            onChange={e => setCompanyDescription(e.target.value)}
            placeholder="Describe your company's mission, background, and hiring standards..."
            className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 text-slate-800"
          />
        </div>

        {/* PESO Accreditation Document Numbers */}
        <div className="pt-4 border-t border-slate-100 space-y-4 text-xs">
          <div>
            <h3 className="font-bold text-slate-900 flex items-center gap-1.5 text-sm">
              <FileText className="w-4 h-4 text-amber-600" />
              LGU Business Registration & TIN Numbers
            </h3>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Official registration and tax identification credentials.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Business Permit No.</label>
              <input
                type="text"
                value={businessPermitNo}
                onChange={e => setBusinessPermitNo(e.target.value)}
                placeholder="BP-2026-ROX-001"
                className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 font-mono"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">DTI or SEC Registration No.</label>
              <input
                type="text"
                value={dtiSecRegistration}
                onChange={e => setDtiSecRegistration(e.target.value)}
                placeholder="DTI-XXXXX or SEC-XXXXX"
                className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 font-mono"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">BIR Form 2303 (TIN)</label>
              <input
                type="text"
                value={bir2303No}
                onChange={e => setBir2303No(e.target.value)}
                placeholder="000-000-000-000"
                className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 font-mono"
              />
            </div>
          </div>
        </div>

        {/* 11 PESO Requirements Document Manager */}
        <div className="pt-4 border-t border-slate-100 space-y-4 text-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="font-bold text-slate-900 flex items-center gap-1.5 text-sm">
                <Upload className="w-4 h-4 text-indigo-600" />
                Mga Requirements ng Employer/Establishment (PESO Verification)
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Alinsunod sa pamantayan ng PESO Oriental Mindoro, i-upload ang mga kaukulang dokumento para sa akreditasyon.
              </p>
            </div>
            <span className="text-[11px] font-semibold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2.5 py-1 rounded-lg self-start sm:self-auto">
              Only applicable documents are required
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {PESO_EMPLOYER_REQUIREMENTS.map((req, idx) => {
              const docState = docStateMap[req.fieldKey];
              const val = docState?.value || '';
              const hasFile = Boolean(val.trim());

              return (
                <div 
                  key={req.id} 
                  className={`p-3.5 rounded-xl border transition-all ${
                    hasFile 
                      ? 'bg-emerald-50/40 border-emerald-200' 
                      : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-0.5 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-700 text-[10px] font-black flex items-center justify-center shrink-0">
                          {idx + 1}
                        </span>
                        <h4 className="font-bold text-slate-900 text-xs">{req.title}</h4>
                      </div>
                      <p className="text-[11px] text-slate-500 pl-7">{req.issuingAgency}</p>
                      {req.applicableEstablishments && (
                        <p className="text-[10px] text-amber-700 italic pl-7">{req.applicableEstablishments}</p>
                      )}
                    </div>

                    {hasFile ? (
                      <span className="text-[10px] font-bold px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-md shrink-0 flex items-center gap-1">
                        <Check className="w-3 h-3 text-emerald-600" /> Attached
                      </span>
                    ) : (
                      <span className="text-[10px] font-medium px-2 py-0.5 bg-slate-100 text-slate-600 rounded-md shrink-0">
                        Pending
                      </span>
                    )}
                  </div>

                  <div className="mt-2.5 pl-7 flex items-center gap-2">
                    <input
                      type="text"
                      value={val}
                      onChange={e => docState?.setter(e.target.value)}
                      placeholder={`e.g. ${req.title.split(' ')[0]}_Document.pdf`}
                      className="flex-1 px-2.5 py-1.5 text-[11px] font-mono border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                    <button
                      type="button"
                      onClick={() => docState?.setter(`${req.id}_Verified_Document.pdf`)}
                      className="text-[10px] font-bold px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors cursor-pointer shrink-0"
                    >
                      {hasFile ? 'Replace' : '+ Sample PDF'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Submit */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
          <button
            type="submit"
            className={`px-6 py-2.5 font-bold text-xs rounded-xl shadow-md transition-colors flex items-center gap-2 cursor-pointer ${
              isForCompliance
                ? 'bg-amber-600 hover:bg-amber-700 text-white'
                : 'bg-indigo-600 hover:bg-indigo-700 text-white'
            }`}
          >
            <Save className="w-4 h-4" />
            <span>{isForCompliance ? 'Submit Compliance Documents for Review' : 'Save Profile Updates'}</span>
          </button>
        </div>

      </form>

    </div>
  );
};


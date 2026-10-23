import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ORIENTAL_MINDORO_MUNICIPALITIES, JOB_CATEGORIES, ROXAS_BARANGAYS } from '../../data/mockData';
import { PESO_EMPLOYER_REQUIREMENTS, PesoRequirementDefinition } from '../../data/pesoEmployerRequirements';
import { 
  Building2, 
  MapPin, 
  Phone, 
  Mail, 
  Globe, 
  FileText, 
  Upload, 
  CheckCircle2, 
  AlertCircle, 
  ShieldCheck, 
  ShieldAlert, 
  ArrowRight, 
  ArrowLeft, 
  Sparkles,
  Info,
  Check,
  Paperclip,
  FileCheck,
  Eye,
  Trash2
} from 'lucide-react';

interface EmployerProfileSetupWizardProps {
  onComplete: () => void;
  onNavigate: (view: string, params?: any) => void;
}

export const EmployerProfileSetupWizard: React.FC<EmployerProfileSetupWizardProps> = ({ onComplete, onNavigate }) => {
  const { currentEmployerProfile, updateEmployerProfile, addNotification, showToast, currentUser } = useApp();

  const [currentStep, setCurrentStep] = useState<number>(1);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);

  // Step 1: Company Information
  const [companyName, setCompanyName] = useState(currentEmployerProfile?.companyName || currentUser?.name || '');
  const [industry, setIndustry] = useState(currentEmployerProfile?.industry || JOB_CATEGORIES[0]);
  const [companyDescription, setCompanyDescription] = useState(currentEmployerProfile?.companyDescription || currentEmployerProfile?.description || '');
  const [website, setWebsite] = useState(currentEmployerProfile?.website || '');
  const [logoUrl, setLogoUrl] = useState(currentEmployerProfile?.logoUrl || 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=150&auto=format&fit=crop&q=80');

  // Step 2: Contact Details & Location
  const [representativeName, setRepresentativeName] = useState(currentEmployerProfile?.representativeName || currentUser?.name || '');
  const [contactNumber, setContactNumber] = useState(currentEmployerProfile?.contactNumber || '');
  const [email, setEmail] = useState(currentEmployerProfile?.email || currentUser?.email || '');
  const [municipality, setMunicipality] = useState(currentEmployerProfile?.municipality || 'Roxas');
  const [barangay, setBarangay] = useState(currentEmployerProfile?.barangay || ROXAS_BARANGAYS[0]);
  const [address, setAddress] = useState(currentEmployerProfile?.address || '');

  // Step 3: PESO Establishment Requirements
  // Map of requirement id -> file name or status
  const [uploadedFiles, setUploadedFiles] = useState<Record<string, string>>({
    dti_sec: currentEmployerProfile?.dtiSecFile || 'DTI_SEC_Certificate_Registered.pdf',
    sedula: currentEmployerProfile?.sedulaFile || 'Sedula_CommunityTaxCert_2026.pdf',
    brgy_clearance: currentEmployerProfile?.barangayClearanceFile || 'Barangay_Business_Clearance.pdf',
    fire_safety: currentEmployerProfile?.fireSafetyFile || 'BFP_Fire_Safety_Inspection.pdf',
    aitr: currentEmployerProfile?.aitrFile || '',
    sanitary_permit: currentEmployerProfile?.sanitaryPermitFile || '',
    environment_cert: currentEmployerProfile?.environmentCertFile || '',
    zoning_clearance: currentEmployerProfile?.zoningClearanceFile || '',
    building_permit: currentEmployerProfile?.buildingPermitFile || '',
    tourism_clearance: currentEmployerProfile?.tourismClearanceFile || '',
    payment_receipt: currentEmployerProfile?.paymentReceiptFile || 'MTO_Official_Receipt_Taxes.pdf',
  });

  const [documentApplicability, setDocumentApplicability] = useState<Record<string, boolean>>({
    aitr: true,
    dti_sec: true,
    sedula: true,
    brgy_clearance: true,
    sanitary_permit: industry === 'Tourism & Hospitality' || industry === 'Healthcare',
    environment_cert: false,
    zoning_clearance: false,
    building_permit: false,
    tourism_clearance: industry === 'Tourism & Hospitality',
    payment_receipt: true,
    fire_safety: true,
  });

  const [activeReqModal, setActiveReqModal] = useState<PesoRequirementDefinition | null>(null);
  const [previewDocTitle, setPreviewDocTitle] = useState<string | null>(null);
  const [declarationAgreed, setDeclarationAgreed] = useState<boolean>(true);
  const [stepError, setStepError] = useState<string>('');

  if (!currentEmployerProfile) return null;

  const handleSimulateFileUpload = (reqId: string, reqTitle: string) => {
    const fileName = `${companyName.replace(/\s+/g, '_') || 'Business'}_${reqId.toUpperCase()}_Doc.pdf`;
    setUploadedFiles(prev => ({
      ...prev,
      [reqId]: fileName
    }));
    setDocumentApplicability(prev => ({
      ...prev,
      [reqId]: true
    }));
    if (showToast) {
      showToast({
        title: 'Document Attached',
        message: `${reqTitle} document attached successfully.`,
        type: 'match'
      });
    }
  };

  const handleRemoveFile = (reqId: string) => {
    setUploadedFiles(prev => ({
      ...prev,
      [reqId]: ''
    }));
  };

  const handleNextStep = () => {
    setStepError('');
    if (currentStep === 1) {
      if (!companyName.trim()) {
        setStepError('Company Name is required to proceed.');
        return;
      }
      if (!industry) {
        setStepError('Please select your business industry category.');
        return;
      }
      if (!companyDescription.trim()) {
        setStepError('Please write a brief description about your company and business operations.');
        return;
      }
      setCurrentStep(2);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (currentStep === 2) {
      if (!representativeName.trim()) {
        setStepError('Please enter the name of the official company representative.');
        return;
      }
      if (!contactNumber.trim()) {
        setStepError('Please enter an active contact number or hotline for job seekers and PESO verification.');
        return;
      }
      if (!email.trim()) {
        setStepError('Please enter a valid business email address.');
        return;
      }
      if (!address.trim()) {
        setStepError('Please provide the physical street / building address of your business establishment.');
        return;
      }
      setCurrentStep(3);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (currentStep === 3) {
      // Must have at least primary registration attached
      if (!uploadedFiles.dti_sec && !uploadedFiles.brgy_clearance) {
        setStepError('Please attach at least your DTI / SEC registration or Barangay Clearance to continue.');
        return;
      }
      setCurrentStep(4);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePreviousStep = () => {
    setStepError('');
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleFinalSubmit = () => {
    if (!declarationAgreed) {
      setStepError('Please check the affirmation statement before submitting your profile for PESO accreditation.');
      return;
    }

    const submittedList = Object.entries(uploadedFiles)
      .filter(([_, val]) => Boolean(val))
      .map(([key]) => key);

    const updatedProfile = {
      companyName: companyName.trim(),
      representativeName: representativeName.trim(),
      industry,
      companyDescription: companyDescription.trim(),
      description: companyDescription.trim(),
      website: website.trim(),
      logoUrl,
      contactNumber: contactNumber.trim(),
      email: email.trim(),
      municipality,
      barangay: municipality === 'Roxas' ? barangay : undefined,
      address: address.trim(),
      
      // PESO Requirements Files
      aitrFile: uploadedFiles.aitr || undefined,
      dtiSecFile: uploadedFiles.dti_sec || undefined,
      dtiSecRegistration: uploadedFiles.dti_sec ? 'DTI-REG-2026-OM' : undefined,
      sedulaFile: uploadedFiles.sedula || undefined,
      barangayClearanceFile: uploadedFiles.brgy_clearance || undefined,
      sanitaryPermitFile: uploadedFiles.sanitary_permit || undefined,
      environmentCertFile: uploadedFiles.environment_cert || undefined,
      zoningClearanceFile: uploadedFiles.zoning_clearance || undefined,
      buildingPermitFile: uploadedFiles.building_permit || undefined,
      tourismClearanceFile: uploadedFiles.tourism_clearance || undefined,
      paymentReceiptFile: uploadedFiles.payment_receipt || undefined,
      fireSafetyFile: uploadedFiles.fire_safety || undefined,
      
      submittedRequirements: submittedList,
      requirementsSubmitted: true,
      accreditationSubmittedAt: new Date().toISOString(),
      status: 'pending' as const, // Pending PESO verification
      isProfileCompleted: true,
      profileSetupCompletedAt: new Date().toISOString(),
      dataPrivacyConsent: {
        agreed: true,
        timestamp: new Date().toISOString()
      }
    };

    updateEmployerProfile(updatedProfile);

    // Notify Employer in real-time
    if (typeof addNotification === 'function') {
      addNotification({
        recipientId: currentUser?.id || currentEmployerProfile.userId || currentEmployerProfile.id,
        recipientRole: 'employer',
        title: 'Profile Setup Completed & Documents Submitted! 📋',
        message: 'Your company profile and establishment documents are now under review by PESO-LGU Oriental Mindoro. You will be notified once accredited so you can publish job postings.',
        type: 'info',
        actionUrl: 'employer-dashboard',
      });
    }

    if (showToast) {
      showToast({
        type: 'success',
        title: 'Profile Setup Completed',
        message: 'Your employer profile and accreditation requirements have been submitted to PESO-LGU!',
      });
    }

    setIsSubmitted(true);
  };

  const countAttached = Object.values(uploadedFiles).filter(Boolean).length;

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto space-y-8 font-sans">
      
      {/* Wizard Header & Progress Bar */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
              <Building2 className="w-3.5 h-3.5" />
              Employer Onboarding & Accreditation
            </span>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Company Profile Setup & PESO Verification
            </h1>
            <p className="text-xs sm:text-sm text-slate-500">
              Please complete these initial setup steps before accessing your employer recruitment dashboard.
            </p>
          </div>

          <div className="text-right sm:text-left bg-slate-50 px-4 py-2 rounded-2xl border border-slate-200 shrink-0">
            <p className="text-[10px] uppercase font-bold text-slate-400">Current Step</p>
            <p className="text-sm font-black text-blue-600">Step {currentStep} of 4</p>
          </div>
        </div>

        {/* Stepper Indicator */}
        <div className="grid grid-cols-4 gap-2 pt-2 border-t border-slate-100">
          {[
            { step: 1, title: 'Company Info', desc: 'Name & Industry' },
            { step: 2, title: 'Contacts & Location', desc: 'Mindoro Address' },
            { step: 3, title: 'PESO Requirements', desc: '11 Documents' },
            { step: 4, title: 'Review & Submit', desc: 'Accreditation' }
          ].map(s => {
            const isCompleted = currentStep > s.step;
            const isCurrent = currentStep === s.step;
            return (
              <div 
                key={s.step} 
                className={`p-3 rounded-2xl border transition-all ${
                  isCurrent 
                    ? 'border-blue-500 bg-blue-50/50 shadow-xs' 
                    : isCompleted 
                    ? 'border-emerald-200 bg-emerald-50/40 text-emerald-800' 
                    : 'border-slate-200 bg-slate-50/60 text-slate-400'
                }`}
              >
                <div className="flex items-center gap-2">
                  <div className={`w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center shrink-0 ${
                    isCurrent 
                      ? 'bg-blue-600 text-white' 
                      : isCompleted 
                      ? 'bg-emerald-600 text-white' 
                      : 'bg-slate-200 text-slate-600'
                  }`}>
                    {isCompleted ? <Check className="w-3.5 h-3.5" /> : s.step}
                  </div>
                  <div className="min-w-0">
                    <p className={`text-xs font-bold truncate ${isCurrent ? 'text-blue-900' : isCompleted ? 'text-emerald-900' : 'text-slate-600'}`}>
                      {s.title}
                    </p>
                    <p className="text-[10px] text-slate-400 truncate hidden sm:block">
                      {s.desc}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Error Message */}
      {stepError && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-3 text-xs text-rose-700 font-semibold shadow-xs animate-in fade-in">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
          <span>{stepError}</span>
        </div>
      )}

      {/* Step Contents */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8">
        
        {/* STEP 1: Company Information */}
        {currentStep === 1 && (
          <div className="space-y-6 animate-in fade-in">
            <div className="border-b border-slate-100 pb-4">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Building2 className="w-5 h-5 text-blue-600" />
                Step 1: Company Information & Overview
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Provide core details about your registered establishment or business enterprise.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-xs">
              <div className="sm:col-span-2">
                <label className="block font-bold text-slate-700 mb-1.5">
                  Registered Company / Business Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={companyName}
                  onChange={e => setCompanyName(e.target.value)}
                  placeholder="e.g. Roxas Tech Solutions & Trading Inc."
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-semibold text-slate-900 text-sm bg-white"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  Must match your official DTI, SEC, or Mayor's Business Permit.
                </p>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1.5">
                  Industry / Business Classification <span className="text-rose-500">*</span>
                </label>
                <select
                  value={industry}
                  onChange={e => setIndustry(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-bold text-slate-800 text-xs bg-white"
                >
                  {JOB_CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                  <option value="Agriculture & Fishery">Agriculture & Fishery</option>
                  <option value="Manufacturing & Processing">Manufacturing & Processing</option>
                  <option value="Wholesale & Retail Trade">Wholesale & Retail Trade</option>
                  <option value="Food & Beverage Services">Food & Beverage Services</option>
                </select>
                <p className="text-[11px] text-slate-400 mt-1">
                  Used by PESO to classify your postings and matches.
                </p>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1.5">
                  Company Website or Facebook Page <span className="text-slate-400">(Optional)</span>
                </label>
                <div className="relative">
                  <Globe className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    value={website}
                    onChange={e => setWebsite(e.target.value)}
                    placeholder="https://www.facebook.com/yourbusiness"
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-semibold text-slate-900 text-xs bg-white"
                  />
                </div>
              </div>

              <div className="sm:col-span-2">
                <label className="block font-bold text-slate-700 mb-1.5">
                  Company Description & Business Background <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={4}
                  value={companyDescription}
                  onChange={e => setCompanyDescription(e.target.value)}
                  placeholder="Provide an overview of your establishment, core products/services, company culture, and workplace environment in Oriental Mindoro..."
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-normal text-slate-800 text-xs bg-white leading-relaxed"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  Job seekers will view this summary when reviewing your job postings.
                </p>
              </div>

              <div className="sm:col-span-2 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <label className="block font-bold text-slate-700 mb-2">
                  Company Brand Logo
                </label>
                <div className="flex items-center gap-4">
                  <img
                    src={logoUrl}
                    alt="Company Logo Preview"
                    className="w-16 h-16 rounded-2xl object-cover ring-2 ring-blue-500/20 shadow-xs shrink-0"
                  />
                  <div className="space-y-1.5">
                    <p className="text-xs font-semibold text-slate-700">Add an image URL or choose a template:</p>
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => setLogoUrl('https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=150&auto=format&fit=crop&q=80')}
                        className="px-2.5 py-1 text-[11px] font-bold bg-white border border-slate-200 hover:border-blue-300 rounded-lg text-slate-600"
                      >
                        Modern Office
                      </button>
                      <button
                        type="button"
                        onClick={() => setLogoUrl('https://images.unsplash.com/photo-1577495508048-b635879837f1?w=150&auto=format&fit=crop&q=80')}
                        className="px-2.5 py-1 text-[11px] font-bold bg-white border border-slate-200 hover:border-blue-300 rounded-lg text-slate-600"
                      >
                        Hospitality & Resort
                      </button>
                      <button
                        type="button"
                        onClick={() => setLogoUrl('https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=150&auto=format&fit=crop&q=80')}
                        className="px-2.5 py-1 text-[11px] font-bold bg-white border border-slate-200 hover:border-blue-300 rounded-lg text-slate-600"
                      >
                        Technical & Trade
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: Contact Details & Location */}
        {currentStep === 2 && (
          <div className="space-y-6 animate-in fade-in">
            <div className="border-b border-slate-100 pb-4">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-blue-600" />
                Step 2: Official Contact Details & Establishment Location
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Designate the authorized contact person and location within Oriental Mindoro.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1.5">
                  Authorized Company Representative <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={representativeName}
                  onChange={e => setRepresentativeName(e.target.value)}
                  placeholder="e.g. Engr. Juan Dela Cruz (HR Manager)"
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-semibold text-slate-900 text-xs bg-white"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  Point person coordinating with PESO Roxas and applicants.
                </p>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1.5">
                  Official Business Email <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="careers@company.com.ph"
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-semibold text-slate-900 text-xs bg-white"
                  />
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Receives interview responses and PESO verification notices.
                </p>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1.5">
                  Contact Number / Mobile / Hotline <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type="tel"
                    value={contactNumber}
                    onChange={e => setContactNumber(e.target.value)}
                    placeholder="+63 917 123 4567 / (043) 288-0000"
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-semibold text-slate-900 text-xs bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1.5">
                  Municipality in Oriental Mindoro <span className="text-rose-500">*</span>
                </label>
                <select
                  value={municipality}
                  onChange={e => setMunicipality(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-bold text-slate-800 text-xs bg-white"
                >
                  {ORIENTAL_MINDORO_MUNICIPALITIES.map(m => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>

              {municipality === 'Roxas' && (
                <div>
                  <label className="block font-bold text-slate-700 mb-1.5">
                    Barangay in Roxas <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={barangay}
                    onChange={e => setBarangay(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-bold text-slate-800 text-xs bg-white"
                  >
                    {ROXAS_BARANGAYS.map(b => (
                      <option key={b} value={b}>{b}</option>
                    ))}
                  </select>
                </div>
              )}

              <div className={municipality === 'Roxas' ? 'sm:col-span-1' : 'sm:col-span-2'}>
                <label className="block font-bold text-slate-700 mb-1.5">
                  Complete Physical Address / Street / Bldg <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={address}
                  onChange={e => setAddress(e.target.value)}
                  placeholder="e.g. Unit 2B, Rizal Street corner Bonifacio Avenue"
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-semibold text-slate-900 text-xs bg-white"
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: PESO Establishment Requirements */}
        {currentStep === 3 && (
          <div className="space-y-6 animate-in fade-in">
            <div className="border-b border-slate-100 pb-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-blue-600" />
                    Step 3: PESO Establishment Accreditation Requirements
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">
                    Mga Requirements ng Employer/Establishment alinsunod sa pamantayan ng PESO Oriental Mindoro.
                  </p>
                </div>
                <span className="text-xs font-bold px-3 py-1.5 rounded-xl bg-blue-50 text-blue-800 border border-blue-200 shrink-0">
                  {countAttached} of 11 Attached
                </span>
              </div>
            </div>

            {/* Prominent PESO Verification Policy Warning */}
            <div className="p-4 bg-amber-50 border-2 border-amber-300 rounded-2xl flex items-start gap-3.5 text-xs text-amber-950 shadow-xs">
              <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="font-bold text-amber-900 text-sm">
                  Paalala: Kailangan munang ma-verify ng PESO bago makapag-post ng trabaho
                </p>
                <p className="text-amber-800 leading-relaxed">
                  Bago makapaglathala ng mga bakanteng posisyon at mag-match sa mga aplikante, susuriin muna ng <strong>PESO-LGU Oriental Mindoro</strong> ang mga nakalakip na legal na dokumento. <em>Tanging ang mga naaangkop na dokumento (applicable documents) ang kailangang isumite batay sa uri ng inyong establisyimento.</em>
                </p>
              </div>
            </div>

            {/* List of 11 Requirements */}
            <div className="space-y-3">
              {PESO_EMPLOYER_REQUIREMENTS.map((req, idx) => {
                const attachedFile = uploadedFiles[req.id];
                const isApplicable = documentApplicability[req.id];

                return (
                  <div
                    key={req.id}
                    className={`p-4 rounded-2xl border transition-all ${
                      attachedFile 
                        ? 'border-emerald-200 bg-emerald-50/40' 
                        : isApplicable 
                        ? 'border-slate-200 bg-white hover:border-slate-300' 
                        : 'border-slate-200 bg-slate-50/50 opacity-75'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                      <div className="space-y-1 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                            #{idx + 1}
                          </span>
                          <h3 className="text-xs font-bold text-slate-900">
                            {req.title}
                          </h3>
                          <span className="text-[10px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100">
                            {req.issuingAgency}
                          </span>
                          {req.isGeneralRequirement && (
                            <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                              General Requirement
                            </span>
                          )}
                        </div>

                        <p className="text-[11px] text-slate-600 leading-relaxed">
                          {req.description}
                        </p>
                        <p className="text-[10px] text-slate-400">
                          <span className="font-semibold text-slate-500">Applicability:</span> {req.applicableEstablishments}
                        </p>

                        {attachedFile && (
                          <div className="flex items-center gap-2 pt-1 text-emerald-800 font-bold text-xs">
                            <FileCheck className="w-4 h-4 text-emerald-600" />
                            <span className="truncate max-w-xs">{attachedFile}</span>
                            <span className="text-[10px] text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded-full">
                              Attached
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                        {attachedFile ? (
                          <button
                            type="button"
                            onClick={() => handleRemoveFile(req.id)}
                            className="p-2 text-rose-600 hover:bg-rose-50 rounded-xl transition-colors border border-rose-200"
                            title="Remove file"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleSimulateFileUpload(req.id, req.title)}
                            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
                          >
                            <Upload className="w-3.5 h-3.5" />
                            <span>Attach Document</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* STEP 4: Review & Final Submit */}
        {currentStep === 4 && (
          <div className="space-y-6 animate-in fade-in">
            <div className="border-b border-slate-100 pb-4">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-600" />
                Step 4: Review Summary & Submit for PESO Accreditation
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Pakiusap suriin ang lahat ng impormasyon at nakalakip na dokumento bago isumite sa PESO.
              </p>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
              <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                <div className="flex items-center gap-3">
                  <img
                    src={logoUrl}
                    alt={companyName}
                    className="w-12 h-12 rounded-xl object-cover ring-1 ring-slate-200 shrink-0"
                  />
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">{companyName}</h3>
                    <p className="text-slate-500">{industry}</p>
                  </div>
                </div>

                <div className="space-y-1.5 pt-2 border-t border-slate-200">
                  <p><strong className="text-slate-700">Representative:</strong> {representativeName}</p>
                  <p><strong className="text-slate-700">Email:</strong> {email}</p>
                  <p><strong className="text-slate-700">Phone:</strong> {contactNumber}</p>
                  <p><strong className="text-slate-700">Location:</strong> {address}, {municipality === 'Roxas' ? `Brgy. ${barangay}, ` : ''}{municipality}, Oriental Mindoro</p>
                </div>
              </div>

              <div className="p-5 bg-blue-50/60 rounded-2xl border border-blue-200 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-blue-950 text-sm">Attached PESO Credentials</h3>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-600 text-white">
                    {countAttached} Documents
                  </span>
                </div>

                <ul className="space-y-1.5 text-[11px] text-blue-900">
                  {PESO_EMPLOYER_REQUIREMENTS.map(req => {
                    const isAttached = Boolean(uploadedFiles[req.id]);
                    if (!isAttached) return null;
                    return (
                      <li key={req.id} className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span className="font-semibold truncate">{req.title}</span>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>

            {/* Declaration & Privacy Consent */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-700 space-y-3">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={declarationAgreed}
                  onChange={e => setDeclarationAgreed(e.target.checked)}
                  className="mt-1 w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                />
                <span className="leading-relaxed font-medium">
                  Pinatutunayan ko na ang lahat ng impormasyon at dokumentong aking ibinigay ay totoo, lehitimo, at naaayon sa batas ng Pilipinas at alituntunin ng <strong>Public Employment Service Office (PESO) - Oriental Mindoro</strong>. Nauunawaan ko na susuriin muna ito bago magkaroon ng pahintulot na makapag-post ng mga bakanteng trabaho sa eHANAP portal.
                </span>
              </label>
            </div>
          </div>
        )}

        {/* Wizard Navigation Footer */}
        <div className="flex items-center justify-between pt-6 border-t border-slate-100">
          <div>
            {currentStep > 1 && (
              <button
                type="button"
                onClick={handlePreviousStep}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors flex items-center gap-1.5"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
            )}
          </div>

          <div>
            {currentStep < 4 ? (
              <button
                type="button"
                onClick={handleNextStep}
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-2"
              >
                <span>Save & Continue</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleFinalSubmit}
                className="px-7 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl shadow-md transition-colors flex items-center gap-2"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Submit Profile for PESO Accreditation</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Celebration & Confirmation Modal */}
      {isSubmitted && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-8 shadow-2xl border border-slate-200 text-center space-y-5 animate-in zoom-in-95">
            <div className="w-16 h-16 rounded-3xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto ring-8 ring-emerald-50">
              <ShieldCheck className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <span className="text-[11px] uppercase font-bold tracking-wider px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                Setup Complete & Accreditation Pending
              </span>
              <h2 className="text-xl font-black text-slate-900">
                Company Profile Submitted for PESO Review!
              </h2>
              <p className="text-xs text-slate-600 leading-relaxed">
                Naitakda na ang profile ng <strong>{companyName}</strong>. Kasalukuyang susuriin ng <strong>PESO Oriental Mindoro</strong> ang inyong mga nakalakip na dokumento para sa akreditasyon.
              </p>
            </div>

            <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl text-left text-xs text-amber-900 space-y-1.5">
              <p className="font-bold flex items-center gap-1.5 text-amber-950">
                <Info className="w-4 h-4 text-amber-600" />
                Ano ang susunod na hakbang?
              </p>
              <ul className="list-disc list-inside space-y-1 text-amber-800 text-[11px]">
                <li>Aabisuhan kayo sa eHANAP notifications kapag na-verify na ang inyong account.</li>
                <li>Kapag verified na, magkakaroon na kayo ng buong access para makapag-post ng job vacancies.</li>
                <li>Maaari na ninyong i-explore ang inyong employer dashboard.</li>
              </ul>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setIsSubmitted(false);
                  onComplete();
                }}
                className="w-full sm:w-auto px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors"
              >
                Proceed to Employer Dashboard
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsSubmitted(false);
                  onNavigate('employer-profile');
                }}
                className="w-full sm:w-auto px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors"
              >
                View Profile Details
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

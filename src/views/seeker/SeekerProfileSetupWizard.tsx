import React, { useState, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  extractResumeInfoFromText, 
  ExtractedResumePayload,
  formatProperName,
  normalizeCivilStatus,
  normalizeSex,
  normalizeEducationalAttainment,
  normalizeBarangay,
  computeAgeFromDob,
  TRADE_SKILLS,
  ADMIN_SKILLS,
  SERVICE_HOSPITALITY_SKILLS,
  SALES_COMMERCE_SKILLS,
  IT_CREATIVE_SKILLS,
  SOFT_SKILLS_LIST
} from '../../utils/resumeExtractorCore';
import { parseResumeFile } from '../../utils/resumeParser';
import { ROXAS_BARANGAYS } from '../../data/mockData';
import { JobSeekerProfile } from '../../types';
import { 
  Upload, 
  CheckCircle2, 
  AlertCircle, 
  FileText, 
  User, 
  Briefcase, 
  Sparkles, 
  ChevronRight, 
  ChevronLeft, 
  ShieldCheck, 
  MapPin, 
  Phone, 
  Mail, 
  GraduationCap, 
  Calendar, 
  Award, 
  X, 
  Plus, 
  Check, 
  Loader2, 
  ArrowRight,
  SlidersHorizontal,
  FolderCheck,
  PartyPopper,
  Lock
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface SeekerProfileSetupWizardProps {
  onComplete: (view: string, params?: any) => void;
  onNavigate: (view: string, params?: any) => void;
}

// Helper to normalize any date string to YYYY-MM-DD for native HTML5 date input
function toDateInputValue(val?: string): string {
  if (!val) return '';
  const trimmed = val.trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return trimmed;
  const parsed = new Date(trimmed);
  if (!isNaN(parsed.getTime())) {
    const y = parsed.getFullYear();
    const m = String(parsed.getMonth() + 1).padStart(2, '0');
    const d = String(parsed.getDate()).padStart(2, '0');
    if (y >= 1930 && y <= new Date().getFullYear()) {
      return `${y}-${m}-${d}`;
    }
  }
  return '';
}

function formatDateDisplay(isoDate?: string): string {
  if (!isoDate) return '';
  const parts = isoDate.split('-');
  if (parts.length === 3) {
    const d = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
    if (!isNaN(d.getTime())) {
      return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
    }
  }
  return isoDate;
}

// Predefined Job Categories for Step 3
const PRESET_CATEGORIES = [
  // Industry sectors
  { id: 'it', label: 'Information Technology & Software', group: 'Industry Sectors' },
  { id: 'business', label: 'Business, Accounting & Finance', group: 'Industry Sectors' },
  { id: 'agri', label: 'Agriculture & Agribusiness', group: 'Industry Sectors' },
  { id: 'tourism', label: 'Tourism, Hotel & Restaurant', group: 'Industry Sectors' },
  { id: 'engineering', label: 'Engineering & Construction', group: 'Industry Sectors' },
  { id: 'healthcare', label: 'Healthcare, Nursing & Medical', group: 'Industry Sectors' },
  { id: 'education', label: 'Education & Academic Services', group: 'Industry Sectors' },
  { id: 'retail', label: 'Customer Service & Retail', group: 'Industry Sectors' },
  { id: 'govt', label: 'Government & Public Administration', group: 'Industry Sectors' },
  // Functional department tracks
  { id: 'admin_office', label: 'Administration & Office Management', group: 'Department Tracks' },
  { id: 'accounting_track', label: 'Accounting, Auditing & Bookkeeping', group: 'Department Tracks' },
  { id: 'customer_ops', label: 'Customer Support & Operations', group: 'Department Tracks' },
  { id: 'marketing_sales', label: 'Marketing, Sales & Advertising', group: 'Department Tracks' },
  { id: 'human_resources', label: 'Human Resources & Recruitment', group: 'Department Tracks' },
  // Vocational & technical trade fields
  { id: 'auto_trade', label: 'Automotive & Mechanical Servicing', group: 'Technical & Trade' },
  { id: 'electric_trade', label: 'Electrical Wiring & Electronics', group: 'Technical & Trade' },
  { id: 'weld_trade', label: 'Welding & Metal Fabrication (SMAW)', group: 'Technical & Trade' },
  { id: 'carpentry_trade', label: 'Carpentry & Construction Trade', group: 'Technical & Trade' },
  { id: 'rac_trade', label: 'Refrigeration & Air Conditioning (RAC)', group: 'Technical & Trade' },
];

// Predefined Locations for Step 3
const PRESET_LOCATIONS = [
  // Municipalities & Cities
  { id: 'roxas', label: 'Roxas, Oriental Mindoro', group: 'Municipalities & Cities' },
  { id: 'mansalay', label: 'Mansalay, Oriental Mindoro', group: 'Municipalities & Cities' },
  { id: 'bongabong', label: 'Bongabong, Oriental Mindoro', group: 'Municipalities & Cities' },
  { id: 'calapan', label: 'Calapan City, Oriental Mindoro', group: 'Municipalities & Cities' },
  { id: 'puerto_galera', label: 'Puerto Galera, Oriental Mindoro', group: 'Municipalities & Cities' },
  { id: 'pinamalayan', label: 'Pinamalayan, Oriental Mindoro', group: 'Municipalities & Cities' },
  { id: 'gloria', label: 'Gloria, Oriental Mindoro', group: 'Municipalities & Cities' },
  { id: 'bansud', label: 'Bansud, Oriental Mindoro', group: 'Municipalities & Cities' },
  // Specific Barangays in Roxas
  { id: 'brgy_dangay', label: 'Brgy. Dangay, Roxas', group: 'Specific Barangays' },
  { id: 'brgy_bagumbayan', label: 'Brgy. Bagumbayan, Roxas', group: 'Specific Barangays' },
  { id: 'brgy_poblacion', label: 'Brgy. Poblacion, Roxas', group: 'Specific Barangays' },
  { id: 'brgy_san_mariano', label: 'Brgy. San Mariano, Roxas', group: 'Specific Barangays' },
  { id: 'brgy_paclasan', label: 'Brgy. Paclasan, Roxas', group: 'Specific Barangays' },
  { id: 'brgy_cantil', label: 'Brgy. Cantil, Roxas', group: 'Specific Barangays' },
  // Broader coverage & flexible arrangements
  { id: 'within_mindoro', label: 'Within Oriental Mindoro', group: 'Regional & Flexible' },
  { id: 'outside_province', label: 'Outside Province (Nationwide)', group: 'Regional & Flexible' },
  { id: 'remote_wfh', label: 'Remote / Work From Home', group: 'Regional & Flexible' },
  { id: 'any_location', label: 'Any Location (Open to Relocation)', group: 'Regional & Flexible' },
];

// Predefined Employment Types for Step 3
const PRESET_EMPLOYMENT_TYPES = [
  { id: 'full_time', label: 'Full-Time', desc: 'Standard 40+ hours regular schedule' },
  { id: 'part_time', label: 'Part-Time', desc: 'Flexible reduced hours' },
  { id: 'flexible', label: 'Flexible Schedule', desc: 'Self-paced or shifting hours' },
  { id: 'permanent', label: 'Permanent / Regular', desc: 'Long-term job security with benefits' },
  { id: 'contractual', label: 'Contractual / Fixed-Term', desc: 'Defined contract period' },
  { id: 'project_based', label: 'Project-Based', desc: 'Specific milestone duration' },
  { id: 'freelance', label: 'Freelance / Consultant', desc: 'Independent service arrangement' },
  { id: 'seasonal', label: 'Seasonal / On-Call', desc: 'Peak-season demand' },
  { id: 'internship', label: 'Internship / OJT', desc: 'Academic or on-the-job training' },
  { id: 'apprenticeship', label: 'Apprenticeship', desc: 'Hands-on trade qualification' },
];

const PRESET_SALARIES = [
  '₱12,000 - ₱18,000 (Entry Level)',
  '₱18,000 - ₱25,000 (Mid Level)',
  '₱25,000 - ₱40,000 (Professional)',
  '₱40,000 - ₱60,000 (Senior / Supervisory)',
  '₱60,000+ (Executive / Highly Specialized)',
  'Negotiable based on standard rate'
];

export const SeekerProfileSetupWizard: React.FC<SeekerProfileSetupWizardProps> = ({ onComplete, onNavigate }) => {
  const { currentUser, currentSeekerProfile, updateJobSeekerProfile, addNotification, showToast } = useApp();

  const [currentStep, setCurrentStep] = useState<number>(1);
  const [isProcessingFile, setIsProcessingFile] = useState<boolean>(false);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [extractionSuccess, setExtractionSuccess] = useState<boolean>(false);
  const [activeFileName, setActiveFileName] = useState<string>('');
  const [isCelebrationOpen, setIsCelebrationOpen] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const dateInputRef = useRef<HTMLInputElement>(null);

  // Form state initialized from current seeker profile
  const [firstName, setFirstName] = useState(currentSeekerProfile?.firstName || '');
  const [middleName, setMiddleName] = useState(currentSeekerProfile?.middleName || '');
  const [lastName, setLastName] = useState(currentSeekerProfile?.lastName || '');
  const [dateOfBirth, setDateOfBirth] = useState(currentSeekerProfile?.dateOfBirth || '');
  const [age, setAge] = useState<string>(currentSeekerProfile?.age ? String(currentSeekerProfile.age) : '');
  const [civilStatus, setCivilStatus] = useState<string>(currentSeekerProfile?.civilStatus || 'Single');
  const [sex, setSex] = useState<string>(currentSeekerProfile?.sex || '');
  const [contactNumber, setContactNumber] = useState(currentSeekerProfile?.contactNumber || '');
  const [email, setEmail] = useState(currentSeekerProfile?.email || '');
  const [address, setAddress] = useState(currentSeekerProfile?.address || '');
  const [barangay, setBarangay] = useState(currentSeekerProfile?.barangay || '');
  const [municipality, setMunicipality] = useState(currentSeekerProfile?.municipality || 'Roxas');

  // Education state
  const [educationalAttainment, setEducationalAttainment] = useState(currentSeekerProfile?.educationalAttainment || "College Graduate");
  const [primaryDegree, setPrimaryDegree] = useState(currentSeekerProfile?.primaryDegree || '');
  const [school, setSchool] = useState(currentSeekerProfile?.education?.[0]?.school || '');
  const [yearGraduated, setYearGraduated] = useState<string>(
    currentSeekerProfile?.education?.[0]?.yearGraduated ? String(currentSeekerProfile.education[0].yearGraduated) : '2024'
  );

  // 6 Skill categories state
  const [tradeSkills, setTradeSkills] = useState<string[]>(currentSeekerProfile?.tradeSkills || []);
  const [adminSkills, setAdminSkills] = useState<string[]>(currentSeekerProfile?.administrativeSkills || []);
  const [serviceSkills, setServiceSkills] = useState<string[]>(currentSeekerProfile?.serviceHospitalitySkills || []);
  const [salesSkills, setSalesSkills] = useState<string[]>(currentSeekerProfile?.salesCustomerSkills || []);
  const [itSkills, setItSkills] = useState<string[]>(currentSeekerProfile?.itCreativeSkills || currentSeekerProfile?.technicalSkills || []);
  const [softSkills, setSoftSkills] = useState<string[]>(currentSeekerProfile?.softSkills || ['Clear Communication', 'Teamwork']);

  // Temporary skill inputs for adding new ones
  const [inputSkillTrade, setInputSkillTrade] = useState('');
  const [inputSkillAdmin, setInputSkillAdmin] = useState('');
  const [inputSkillService, setInputSkillService] = useState('');
  const [inputSkillSales, setInputSkillSales] = useState('');
  const [inputSkillIt, setInputSkillIt] = useState('');
  const [inputSkillSoft, setInputSkillSoft] = useState('');

  // Step 3: Job Preferences state
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    currentSeekerProfile?.jobPreferences?.categories || ['Information Technology & Software']
  );
  const [selectedLocations, setSelectedLocations] = useState<string[]>(
    currentSeekerProfile?.jobPreferences?.locations || ['Roxas, Oriental Mindoro']
  );
  const [selectedEmpTypes, setSelectedEmpTypes] = useState<string[]>(
    currentSeekerProfile?.jobPreferences?.employmentTypes || ['Full-Time', 'Permanent / Regular']
  );
  const [selectedSalary, setSelectedSalary] = useState<string>(
    currentSeekerProfile?.jobPreferences?.minSalary || '₱18,000 - ₱25,000 (Mid Level)'
  );

  // Resume File details for active document storage
  const [uploadedResumeObj, setUploadedResumeObj] = useState<any>(null);

  // File Upload Handler
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await processUploadedFile(file);
  };

  const processUploadedFile = async (file: File) => {
    setIsProcessingFile(true);
    setActiveFileName(file.name);

    try {
      // 1. High-accuracy resume/bio-data parsing via server route + local fallback
      const extractedData: ExtractedResumePayload = await parseResumeFile(file);

      // 2. Clean & normalize personal data
      const cleanFirst = formatProperName(extractedData.firstName);
      const cleanMiddle = formatProperName(extractedData.middleName);
      const cleanLast = formatProperName(extractedData.lastName);
      const normalizedCivil = normalizeCivilStatus(extractedData.civilStatus);
      const normalizedSexVal = normalizeSex(extractedData.sex);
      const normalizedBrgy = normalizeBarangay(extractedData.barangay, extractedData.address);
      const normalizedAttainment = normalizeEducationalAttainment(extractedData.educationalAttainment, extractedData.primaryDegree);
      const resolvedAge = (typeof extractedData.age === 'number' && extractedData.age > 0)
        ? String(extractedData.age)
        : computeAgeFromDob(extractedData.dateOfBirth);

      // 3. Auto-populate Personal & Contact details into Step 2 state
      if (cleanFirst) setFirstName(cleanFirst);
      if (cleanMiddle) setMiddleName(cleanMiddle);
      if (cleanLast) setLastName(cleanLast);
      if (extractedData.email) setEmail(extractedData.email);
      if (extractedData.contactNumber) setContactNumber(extractedData.contactNumber);
      
      // Leave birthday blank if not stated in resume as requested
      setDateOfBirth(extractedData.dateOfBirth ? extractedData.dateOfBirth.trim() : '');
      setAge(resolvedAge || '');
      setCivilStatus(normalizedCivil || 'Single');

      // Leave gender blank if not stated in resume so choices (Male/Female) show when clicked
      setSex(normalizedSexVal || '');
      if (extractedData.address) {
        setAddress(extractedData.address);
      } else if (normalizedBrgy) {
        setAddress(`Brgy. ${normalizedBrgy}, Roxas, Oriental Mindoro`);
      }
      if (normalizedBrgy) setBarangay(normalizedBrgy);
      if (extractedData.municipality) setMunicipality(extractedData.municipality);

      // 4. Auto-populate Education details
      setEducationalAttainment(normalizedAttainment);
      if (extractedData.primaryDegree) setPrimaryDegree(extractedData.primaryDegree);
      if (extractedData.school) setSchool(extractedData.school);
      if (extractedData.yearGraduated) setYearGraduated(String(extractedData.yearGraduated));

      // 5. Deep Skill Categorization across all 6 distinct buckets
      const newTrade = new Set<string>(extractedData.tradeSkills || []);
      const newAdmin = new Set<string>(extractedData.administrativeSkills || []);
      const newService = new Set<string>(extractedData.serviceHospitalitySkills || []);
      const newSales = new Set<string>(extractedData.salesCustomerSkills || []);
      const newIt = new Set<string>(extractedData.itCreativeSkills || extractedData.technicalSkills || []);
      const newSoft = new Set<string>(extractedData.softSkills || []);

      // If general extractedSkills or technicalSkills have unassigned items, distribute them
      const generalSkills = [
        ...(extractedData.extractedSkills || []),
        ...(extractedData.technicalSkills || []),
      ];

      for (const rawSkill of generalSkills) {
        const s = rawSkill.trim();
        if (!s) continue;
        const lower = s.toLowerCase();

        if (SOFT_SKILLS_LIST.some(soft => lower.includes(soft))) {
          newSoft.add(s);
        } else if (TRADE_SKILLS.some(item => lower.includes(item.toLowerCase()))) {
          newTrade.add(s);
        } else if (ADMIN_SKILLS.some(item => lower.includes(item.toLowerCase()))) {
          newAdmin.add(s);
        } else if (SERVICE_HOSPITALITY_SKILLS.some(item => lower.includes(item.toLowerCase()))) {
          newService.add(s);
        } else if (SALES_COMMERCE_SKILLS.some(item => lower.includes(item.toLowerCase()))) {
          newSales.add(s);
        } else if (IT_CREATIVE_SKILLS.some(item => lower.includes(item.toLowerCase()))) {
          newIt.add(s);
        }
      }

      // Ensure foundational soft skills exist for Step 4 validation & PESO readiness
      if (newSoft.size === 0) {
        newSoft.add('Clear Communication');
        newSoft.add('Teamwork');
        newSoft.add('Punctuality');
        newSoft.add('Adaptability');
      }

      setTradeSkills(Array.from(newTrade));
      setAdminSkills(Array.from(newAdmin));
      setServiceSkills(Array.from(newService));
      setSalesSkills(Array.from(newSales));
      setItSkills(Array.from(newIt));
      setSoftSkills(Array.from(newSoft));

      // Resume document metadata
      const newResumeRecord = {
        id: `resume-${Date.now()}`,
        fileName: file.name,
        fileType: file.type || 'application/pdf',
        fileSize: file.size || 102400,
        uploadedAt: new Date().toISOString(),
        parsedDegree: extractedData.primaryDegree || 'Educational Attainment',
        parsedSkills: Array.from(new Set([
          ...Array.from(newTrade),
          ...Array.from(newAdmin),
          ...Array.from(newService),
          ...Array.from(newSales),
          ...Array.from(newIt),
          ...Array.from(newSoft)
        ])),
        parsedAttainment: normalizedAttainment,
        isPrimary: true,
      };
      setUploadedResumeObj(newResumeRecord);

      setExtractionSuccess(true);
      showToast('Resume data extracted into your profile fields! Reviewing details...', 'success');
      
      // Advance smoothly to Step 2: Information Review & Confirmation
      setTimeout(() => {
        setCurrentStep(2);
      }, 700);
    } catch (err: any) {
      console.error('Error processing resume:', err);
      showToast('Resume uploaded. Please verify and complete details in the review step.', 'info');
      setCurrentStep(2);
    } finally {
      setIsProcessingFile(false);
    }
  };

  // Skill Add / Delete helpers
  const handleAddSkill = (
    skill: string, 
    setList: React.Dispatch<React.SetStateAction<string[]>>, 
    clearInput: React.Dispatch<React.SetStateAction<string>>
  ) => {
    const trimmed = skill.trim();
    if (!trimmed) return;
    setList(prev => Array.from(new Set([...prev, trimmed])));
    clearInput('');
  };

  const handleRemoveSkill = (
    skillToRemove: string, 
    setList: React.Dispatch<React.SetStateAction<string[]>>
  ) => {
    setList(prev => prev.filter(s => s !== skillToRemove));
  };

  // Preference Toggle Helpers
  const toggleSelection = (item: string, currentList: string[], setList: React.Dispatch<React.SetStateAction<string[]>>) => {
    if (currentList.includes(item)) {
      if (currentList.length > 1) {
        setList(currentList.filter(i => i !== item));
      } else {
        showToast('Please keep at least one preference selected.', 'info');
      }
    } else {
      setList([...currentList, item]);
    }
  };

  // Validation Checks for Step 4
  const totalEnteredSkills = 
    tradeSkills.length + 
    adminSkills.length + 
    serviceSkills.length + 
    salesSkills.length + 
    itSkills.length + 
    softSkills.length;

  const validationResults = {
    hasName: Boolean(firstName.trim() && lastName.trim()),
    hasContact: Boolean(contactNumber.trim() && email.trim()),
    hasAddress: Boolean(address.trim() || municipality.trim()),
    hasEducation: Boolean(educationalAttainment.trim() && primaryDegree.trim()),
    hasSkills: true, // Skills are optional - not everyone has skills in all categories
    hasPreferences: selectedCategories.length > 0 && selectedLocations.length > 0 && selectedEmpTypes.length > 0,
  };

  const isProfileValid = Object.values(validationResults).every(Boolean);

  // Finish Profile Setup & Save
  const handleCompleteSetup = () => {
    const seekerId = currentSeekerProfile?.id || (currentUser ? `seeker-${currentUser.id}` : `seeker-${Date.now()}`);
    const userId = currentUser?.id || currentSeekerProfile?.userId || `user-${Date.now()}`;

    const allTechCombined = Array.from(new Set([
      ...tradeSkills, 
      ...adminSkills, 
      ...serviceSkills, 
      ...salesSkills, 
      ...itSkills
    ]));

    const eduRecord = {
      id: `edu-${Date.now()}`,
      degreeCourse: primaryDegree.trim() || 'College Degree',
      school: school.trim() || 'Educational Institution',
      yearGraduated: parseInt(yearGraduated, 10) || new Date().getFullYear(),
      educationalAttainment,
    };

    const existingResumes = currentSeekerProfile?.resumes || [];
    const updatedResumes = uploadedResumeObj 
      ? [uploadedResumeObj, ...existingResumes.filter(r => r.fileName !== uploadedResumeObj.fileName)]
      : existingResumes;

    const updatedProfile: Partial<JobSeekerProfile> = {
      userId,
      firstName: firstName.trim() || (currentUser?.name?.split(' ')[0] || 'Candidate'),
      middleName: middleName.trim() || undefined,
      lastName: lastName.trim() || (currentUser?.name?.split(' ').slice(1).join(' ') || 'Applicant'),
      dateOfBirth: dateOfBirth ? dateOfBirth.trim() : undefined,
      age: age ? parseInt(age, 10) : undefined,
      civilStatus,
      sex: sex || undefined,
      contactNumber: contactNumber.trim() || (currentUser?.phone || ''),
      email: email.trim() || (currentUser?.email || ''),
      address: address.trim() || (barangay ? `Brgy. ${barangay}, ${municipality}, Oriental Mindoro` : `${municipality}, Oriental Mindoro`),
      barangay: barangay.trim() || undefined,
      municipality: municipality.trim() || 'Roxas',
      educationalAttainment,
      primaryDegree: primaryDegree.trim(),
      education: [eduRecord],
      tradeSkills,
      administrativeSkills: adminSkills,
      serviceHospitalitySkills: serviceSkills,
      salesCustomerSkills: salesSkills,
      itCreativeSkills: itSkills,
      technicalSkills: allTechCombined,
      softSkills,
      resumes: updatedResumes,
      activeResumeId: updatedResumes[0]?.id,
      jobPreferences: {
        categories: selectedCategories,
        municipalities: [municipality],
        locations: selectedLocations,
        employmentTypes: selectedEmpTypes,
        minSalary: selectedSalary,
      },
      isProfileCompleted: true,
      profileSetupCompletedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Save profile to context and persistent database
    updateJobSeekerProfile(seekerId, updatedProfile);

    // Persist completion state in localStorage so subsequent logins immediately recognize setup completion
    try {
      if (currentUser?.id) {
        localStorage.setItem(`ehanap_profile_completed_${currentUser.id}`, 'true');
      }
      if (currentUser?.email) {
        localStorage.setItem(`ehanap_profile_completed_${currentUser.email.toLowerCase()}`, 'true');
      }
      if (email.trim()) {
        localStorage.setItem(`ehanap_profile_completed_${email.trim().toLowerCase()}`, 'true');
      }
      if (seekerId) {
        localStorage.setItem(`ehanap_profile_completed_${seekerId}`, 'true');
      }
    } catch {}

    // Create real-time notification
    if (typeof addNotification === 'function') {
      addNotification({
        recipientId: userId,
        recipientRole: 'job_seeker',
        title: 'Profile Setup Completed & Saved! 🎉',
        message: 'Your qualifications and resume have been saved to your profile. The Decision Tree has unlocked personalized job recommendations aligned with your profile.',
        type: 'success',
        actionUrl: 'seeker-dashboard',
      });
    }

    if (typeof showToast === 'function') {
      showToast({
        type: 'success',
        title: 'Profile Saved & Setup Complete!',
        message: 'Loading personalized job recommendations matching your profile...',
      });
    }

    // Direct transition to Job Seeker Dashboard showing profile-matched job recommendations
    onComplete('seeker-dashboard');
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12">
      {/* Wizard Header & Stepper */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 sm:p-8 mb-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100">
                <Sparkles className="w-3.5 h-3.5" />
                Job Seeker Onboarding
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200">
                <Lock className="w-3.5 h-3.5 text-amber-600" />
                Profile Set Up
              </span>
              <button
                type="button"
                onClick={() => onComplete('seeker-dashboard')}
                className="hidden md:inline-flex items-center gap-1 text-[11px] font-bold text-slate-700 hover:text-indigo-600 bg-slate-100 hover:bg-slate-200 px-3 py-1 rounded-full border border-slate-200 transition-colors cursor-pointer"
                title="View Job Recommendations"
              >
                <span>View Job Recommendations</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Job Seeker Profile Set Up
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 mt-1.5 max-w-xl leading-relaxed">
              Welcome! Please complete your profile and skills inventory first. You must first set up your profile before you can access the dashboard and view local job postings.
            </p>
          </div>

          <div className="text-left sm:text-right bg-slate-50/90 sm:bg-transparent p-3 sm:p-0 rounded-xl sm:rounded-none border sm:border-0 border-slate-200/80 w-full sm:w-auto">
            <div className="flex items-center justify-between sm:justify-end gap-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Step {currentStep} of 5</span>
              <span className="text-[11px] font-black text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-100">
                {Math.round((currentStep / 5) * 100)}% Complete
              </span>
            </div>
            <div className="text-sm font-bold text-indigo-600 mt-1">
              {currentStep === 1 && 'Upload Resume / Bio-data'}
              {currentStep === 2 && 'Review & Edit Personal Info & Education'}
              {currentStep === 3 && 'Skills Inventory'}
              {currentStep === 4 && 'Job Preferences'}
              {currentStep === 5 && 'Profile Validation & Done'}
            </div>
          </div>
        </div>

        {/* Informational Banner */}
        <div className="mt-4 p-3 bg-amber-50/80 border border-amber-200/80 rounded-xl flex items-center gap-2.5 text-xs text-amber-900 font-medium">
          <Lock className="w-4 h-4 text-amber-600 shrink-0" />
          <span>
            <strong>Requirement Notice:</strong> Your personalized job matching dashboard and employer job postings will automatically unlock as soon as you complete the steps below.
          </span>
        </div>

        {/* Linear progress bar instead of interactive indicator buttons */}
        <div className="mt-5 pt-4 border-t border-slate-100">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1.5 font-medium">
            <span>Onboarding Progress: Step {currentStep} of 5</span>
            <span className="font-bold text-indigo-600">{Math.round((currentStep / 5) * 100)}%</span>
          </div>
          <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-indigo-500 to-emerald-500 transition-all duration-300 rounded-full"
              style={{ width: `${(currentStep / 5) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* STEP 1: Upload Resume or Bio-data */}
      {currentStep === 1 && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 sm:p-8"
        >
          <div className="text-center max-w-xl mx-auto space-y-4">
            <div className="w-14 h-14 bg-indigo-50 border border-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto">
              <Upload className="w-7 h-7" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-slate-900">
                Upload your Resume or Bio-data
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Upload your resume, CV, or bio-data. Our AI-driven parser will automatically extract your personal details, education, degree, and skills so you don't have to type them from scratch.
              </p>
            </div>

            {/* Drag & Drop Upload Zone */}
            <div
              onClick={() => !isProcessingFile && fileInputRef.current?.click()}
              onDragOver={(e) => {
                e.preventDefault();
                e.stopPropagation();
                if (!isProcessingFile) setIsDragging(true);
              }}
              onDragEnter={(e) => {
                e.preventDefault();
                e.stopPropagation();
                if (!isProcessingFile) setIsDragging(true);
              }}
              onDragLeave={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setIsDragging(false);
              }}
              onDrop={async (e) => {
                e.preventDefault();
                e.stopPropagation();
                setIsDragging(false);
                if (isProcessingFile) return;
                const file = e.dataTransfer.files?.[0];
                if (file) {
                  await processUploadedFile(file);
                }
              }}
              className={`relative border-2 border-dashed rounded-2xl p-8 sm:p-10 cursor-pointer transition-all duration-200 overflow-hidden ${
                isProcessingFile
                  ? 'border-indigo-400 bg-indigo-50/60 cursor-wait ring-4 ring-indigo-100'
                  : isDragging
                    ? 'border-indigo-600 bg-indigo-50/90 scale-[1.01] shadow-lg ring-4 ring-indigo-200'
                    : 'border-slate-300 hover:border-indigo-500 bg-gradient-to-b from-white to-slate-50/60 hover:bg-indigo-50/20 hover:shadow-md'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.docx,.doc,.txt,image/*"
                onChange={handleFileChange}
                className="hidden"
              />

              {isProcessingFile ? (
                <div className="flex flex-col items-center justify-center space-y-3">
                  <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
                  <div className="text-sm font-bold text-slate-800">
                    Extracting data from <span className="text-indigo-600 font-mono">{activeFileName}</span>...
                  </div>
                  <p className="text-xs text-slate-500 max-w-md text-center">
                    Accurately identifying full name, education, course, university, and 6 skill categories. Unstated fields will remain blank for your manual review.
                  </p>
                </div>
              ) : extractionSuccess ? (
                <div className="flex flex-col items-center justify-center space-y-2">
                  <CheckCircle2 className="w-10 h-10 text-emerald-600" />
                  <div className="text-sm font-bold text-emerald-800">Resume Extracted Successfully!</div>
                  <p className="text-xs text-emerald-600 font-mono">{activeFileName}</p>
                  <span className="text-[11px] text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">
                    Redirecting to Step 2 review...
                  </span>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center space-y-3.5">
                  <div className="w-14 h-14 rounded-2xl bg-indigo-50/80 border border-indigo-100 flex items-center justify-center text-indigo-600 shadow-2xs">
                    <FileText className="w-7 h-7" />
                  </div>
                  <div className="text-center">
                    <div className="text-sm font-bold text-slate-800">
                      Click to browse or drag and drop your file here
                    </div>
                    <p className="text-xs text-slate-400 mt-1">
                      Supported formats: PDF, DOCX, DOC, TXT, or Image Bio-data (PNG, JPG)
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center justify-center gap-1.5 pt-1">
                    <span className="text-[10px] font-semibold text-slate-600 bg-slate-100 border border-slate-200/80 px-2.5 py-0.5 rounded-md">
                      Smart Bio-Data & Resume Parser
                    </span>
                    <span className="text-[10px] font-semibold text-indigo-700 bg-indigo-50 border border-indigo-100 px-2.5 py-0.5 rounded-md">
                      Unstated Gender & Birthday Remain Blank
                    </span>
                  </div>

                  <button
                    type="button"
                    className="mt-1 px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-all shadow-xs hover:shadow-sm"
                  >
                    Select Resume File
                  </button>
                </div>
              )}
            </div>

            {/* Manual entry alternative */}
            <div className="pt-4 flex items-center justify-center gap-2">
              <span className="text-xs text-slate-400">Don't have a resume right now?</span>
              <button
                type="button"
                onClick={() => setCurrentStep(2)}
                className="text-xs font-bold text-indigo-600 hover:text-indigo-700 underline underline-offset-4"
              >
                Proceed to Manual Information Entry
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* STEP 2: Information Review & Edit */}
      {currentStep === 2 && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 sm:p-8 space-y-8"
        >
          {/* Section 1: Personal Information */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
              <User className="w-4 h-4 text-indigo-600" />
              <span>Personal & Contact Information</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  First Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={firstName}
                  onChange={e => setFirstName(e.target.value)}
                  placeholder="e.g. Maria Jade"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:border-indigo-500"
                />
                <span className="text-[10px] text-slate-400">Supports 2 or more names (e.g. Maria Jade)</span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Middle Name or Initial
                </label>
                <input
                  type="text"
                  value={middleName}
                  onChange={e => setMiddleName(e.target.value)}
                  placeholder="e.g. Ramos or R."
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Last Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={lastName}
                  onChange={e => setLastName(e.target.value)}
                  placeholder="e.g. Santos"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 pt-1">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Date of Birth</span>
                </label>
                <input
                  ref={dateInputRef}
                  type="date"
                  value={toDateInputValue(dateOfBirth)}
                  onChange={e => {
                    const val = e.target.value;
                    setDateOfBirth(val);
                    const calculated = computeAgeFromDob(val);
                    if (calculated) setAge(calculated);
                  }}
                  onClick={() => {
                    try {
                      dateInputRef.current?.showPicker?.();
                    } catch {
                      // Fallback for browsers without showPicker
                    }
                  }}
                  max={new Date().toISOString().split('T')[0]}
                  min="1940-01-01"
                  className={`w-full px-3 py-2 text-xs rounded-xl border focus:outline-hidden transition-all cursor-pointer ${
                    !dateOfBirth
                      ? 'border-slate-300 bg-slate-50/60 text-slate-400 focus:border-indigo-500 focus:bg-white'
                      : 'border-slate-200 bg-white text-slate-800 font-medium focus:border-indigo-500 shadow-2xs'
                  }`}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Age
                </label>
                <input
                  type="number"
                  value={age}
                  onChange={e => setAge(e.target.value)}
                  placeholder="e.g. 24"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:border-indigo-500 bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Civil Status
                </label>
                <select
                  value={normalizeCivilStatus(civilStatus)}
                  onChange={e => setCivilStatus(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:border-indigo-500 bg-white"
                >
                  <option value="Single">Single</option>
                  <option value="Married">Married</option>
                  <option value="Widowed">Widowed</option>
                  <option value="Separated">Separated (Sep.)</option>
                  <option value="Solo Parent">Solo Parent</option>
                  <option value="Common-Law">Common-Law</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Sex / Gender
                </label>
                <select
                  value={sex}
                  onChange={e => setSex(e.target.value)}
                  className={`w-full px-3 py-2 text-xs rounded-xl border focus:outline-hidden transition-colors ${
                    !sex
                      ? 'border-slate-300 bg-slate-50/60 text-slate-500 font-normal focus:border-indigo-500 focus:bg-white'
                      : 'border-slate-200 bg-white text-slate-800 font-medium focus:border-indigo-500'
                  }`}
                >
                  <option value="">-- Select Gender --</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Contact Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={contactNumber}
                  onChange={e => setContactNumber(e.target.value)}
                  placeholder="09171234567, +63 917 123 4567, or (043) 288-1234"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="mariajade.santos@gmail.com"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Complete Home Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={address}
                  onChange={e => setAddress(e.target.value)}
                  placeholder="House/Lot No., Street, Barangay, Municipality, Province"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Barangay
                </label>
                <select
                  value={normalizeBarangay(barangay, address)}
                  onChange={e => setBarangay(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:border-indigo-500 bg-white"
                >
                  <option value="">Select Barangay (Roxas)</option>
                  {ROXAS_BARANGAYS.map(b => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Section 2: Education Background */}
          <div className="space-y-4 pt-4 border-t border-slate-100">
            <div className="flex items-center gap-2 text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
              <GraduationCap className="w-4 h-4 text-indigo-600" />
              <span>Educational Attainment & Degree</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Highest Educational Attainment <span className="text-red-500">*</span>
                </label>
                <select
                  value={normalizeEducationalAttainment(educationalAttainment, primaryDegree)}
                  onChange={e => setEducationalAttainment(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:border-indigo-500 bg-white"
                >
                  <option value="College Graduate">College Graduate (Bachelor's Degree)</option>
                  <option value="College Undergraduate">College Undergraduate</option>
                  <option value="High School Graduate">High School Graduate</option>
                  <option value="Senior High School">Senior High School (SHS Grad)</option>
                  <option value="Vocational / TVET">Vocational / TVET (Tech-Voc)</option>
                  <option value="Master's Degree">Master's Degree</option>
                  <option value="Doctorate Degree">Doctorate Degree</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Course / Degree Program <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={primaryDegree}
                  onChange={e => setPrimaryDegree(e.target.value)}
                  placeholder="e.g. Bachelor of Science in Computer Science, BSIT, BSBA"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:border-indigo-500"
                />
                <span className="text-[10px] text-slate-400">Accurately preserved without defaulting to general IT</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  School / University
                </label>
                <input
                  type="text"
                  value={school}
                  onChange={e => setSchool(e.target.value)}
                  placeholder="e.g. John Paul College, Mindoro State University, EMC"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Year Graduated / Status
                </label>
                <input
                  type="text"
                  value={yearGraduated}
                  onChange={e => setYearGraduated(e.target.value)}
                  placeholder="2024, 2020-2024, or Expected 2025"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:border-indigo-500"
                />
              </div>
            </div>
          </div>

          {/* Navigation Controls for Step 2 */}
          <div className="flex items-center justify-between pt-6 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setCurrentStep(1)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 flex items-center gap-1.5"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Back to Resume Upload</span>
            </button>

            <button
              type="button"
              onClick={() => {
                if (!firstName.trim() || !lastName.trim()) {
                  showToast('Please provide your First Name and Last Name.', 'error');
                  return;
                }
                if (!primaryDegree.trim()) {
                  showToast('Please specify your Course or Degree.', 'error');
                  return;
                }
                setCurrentStep(3);
              }}
              className="px-6 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-all shadow-xs flex items-center gap-2"
            >
              <span>Proceed to Skills Inventory</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      )}

      {/* STEP 3: Skills Inventory across Categories */}
      {currentStep === 3 && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 sm:p-8 space-y-6"
        >
          {/* Header Banner */}
          <div className="p-4 rounded-xl bg-indigo-50/80 border border-indigo-100 flex items-start gap-3">
            <Award className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <h3 className="text-xs sm:text-sm font-bold text-indigo-900">
                    Skills Inventory across Categories
                  </h3>
                  <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                    Optional • Not All Required
                  </span>
                </div>
                <span className="text-xs font-medium text-slate-600 bg-white/80 border border-slate-200 px-2.5 py-1 rounded-lg">
                  {totalEnteredSkills} skill{totalEnteredSkills === 1 ? '' : 's'} recorded
                </span>
              </div>
              <p className="text-xs text-indigo-700 mt-1 leading-relaxed">
                Review skills extracted from your resume or add additional competencies across the 6 PESO skill categories below.
              </p>
            </div>
          </div>



          <div className="space-y-4 pt-1">

            {/* Category A: Technical & Trade */}
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-slate-800">A. Technical & Trade Skills</span>
                  <span className="text-[10px] font-medium text-slate-400 bg-slate-200/70 px-1.5 py-0.2 rounded">Optional</span>
                </div>
                <span className="text-[10px] text-slate-500">Automotive, Electrical, Welding (SMAW), RAC, Carpentry</span>
              </div>
              <div className="flex flex-wrap gap-1.5 mb-2.5">
                {tradeSkills.map(s => (
                  <span key={s} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs bg-amber-50 text-amber-800 border border-amber-200 font-medium">
                    {s}
                    <button type="button" onClick={() => handleRemoveSkill(s, setTradeSkills)} className="text-amber-500 hover:text-amber-700">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
                {tradeSkills.length === 0 && <span className="text-xs text-slate-400 italic">No trade skills added (Optional — leave blank if not applicable).</span>}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={inputSkillTrade}
                  onChange={e => setInputSkillTrade(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleAddSkill(inputSkillTrade, setTradeSkills, setInputSkillTrade))}
                  placeholder="Add trade skill (e.g. Electrical Wiring, SMAW Welding)"
                  className="flex-1 px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 bg-white"
                />
                <button
                  type="button"
                  onClick={() => handleAddSkill(inputSkillTrade, setTradeSkills, setInputSkillTrade)}
                  className="px-3 py-1 text-xs font-bold bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg cursor-pointer"
                >
                  Add
                </button>
              </div>
            </div>

            {/* Category B: Administrative & Office */}
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-slate-800">B. Administrative & Office Skills</span>
                  <span className="text-[10px] font-medium text-slate-400 bg-slate-200/70 px-1.5 py-0.2 rounded">Optional</span>
                </div>
                <span className="text-[10px] text-slate-500">Bookkeeping, Records, Data Entry, Billing, Spreadsheets</span>
              </div>
              <div className="flex flex-wrap gap-1.5 mb-2.5">
                {adminSkills.map(s => (
                  <span key={s} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs bg-blue-50 text-blue-800 border border-blue-200 font-medium">
                    {s}
                    <button type="button" onClick={() => handleRemoveSkill(s, setAdminSkills)} className="text-blue-500 hover:text-blue-700">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
                {adminSkills.length === 0 && <span className="text-xs text-slate-400 italic">No administrative skills added (Optional — leave blank if not applicable).</span>}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={inputSkillAdmin}
                  onChange={e => setInputSkillAdmin(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleAddSkill(inputSkillAdmin, setAdminSkills, setInputSkillAdmin))}
                  placeholder="Add admin skill (e.g. Bookkeeping, Data Entry)"
                  className="flex-1 px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 bg-white"
                />
                <button
                  type="button"
                  onClick={() => handleAddSkill(inputSkillAdmin, setAdminSkills, setInputSkillAdmin)}
                  className="px-3 py-1 text-xs font-bold bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg cursor-pointer"
                >
                  Add
                </button>
              </div>
            </div>

            {/* Category C: Service, Hospitality & Culinary */}
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-slate-800">C. Service, Hospitality & Culinary Skills</span>
                  <span className="text-[10px] font-medium text-slate-400 bg-slate-200/70 px-1.5 py-0.2 rounded">Optional</span>
                </div>
                <span className="text-[10px] text-slate-500">Cooking, Baking, Food & Beverage, Housekeeping, Barista</span>
              </div>
              <div className="flex flex-wrap gap-1.5 mb-2.5">
                {serviceSkills.map(s => (
                  <span key={s} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs bg-rose-50 text-rose-800 border border-rose-200 font-medium">
                    {s}
                    <button type="button" onClick={() => handleRemoveSkill(s, setServiceSkills)} className="text-rose-500 hover:text-rose-700">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
                {serviceSkills.length === 0 && <span className="text-xs text-slate-400 italic">No service skills added (Optional — leave blank if not applicable).</span>}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={inputSkillService}
                  onChange={e => setInputSkillService(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleAddSkill(inputSkillService, setServiceSkills, setInputSkillService))}
                  placeholder="Add service skill (e.g. Commercial Cooking, Barista Craft)"
                  className="flex-1 px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 bg-white"
                />
                <button
                  type="button"
                  onClick={() => handleAddSkill(inputSkillService, setServiceSkills, setInputSkillService)}
                  className="px-3 py-1 text-xs font-bold bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg cursor-pointer"
                >
                  Add
                </button>
              </div>
            </div>

            {/* Category D: Sales, Commerce & Customer Facing */}
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-slate-800">D. Sales, Commerce & Customer Facing Skills</span>
                  <span className="text-[10px] font-medium text-slate-400 bg-slate-200/70 px-1.5 py-0.2 rounded">Optional</span>
                </div>
                <span className="text-[10px] text-slate-500">Cashiering, Inventory Stocking, POS Operation, Customer Care</span>
              </div>
              <div className="flex flex-wrap gap-1.5 mb-2.5">
                {salesSkills.map(s => (
                  <span key={s} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs bg-teal-50 text-teal-800 border border-teal-200 font-medium">
                    {s}
                    <button type="button" onClick={() => handleRemoveSkill(s, setSalesSkills)} className="text-teal-500 hover:text-teal-700">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
                {salesSkills.length === 0 && <span className="text-xs text-slate-400 italic">No sales skills added (Optional — leave blank if not applicable).</span>}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={inputSkillSales}
                  onChange={e => setInputSkillSales(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleAddSkill(inputSkillSales, setSalesSkills, setInputSkillSales))}
                  placeholder="Add sales skill (e.g. Cashiering, Inventory Management)"
                  className="flex-1 px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 bg-white"
                />
                <button
                  type="button"
                  onClick={() => handleAddSkill(inputSkillSales, setSalesSkills, setInputSkillSales)}
                  className="px-3 py-1 text-xs font-bold bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg cursor-pointer"
                >
                  Add
                </button>
              </div>
            </div>

            {/* Category E: IT & Creative Skills */}
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-slate-800">E. Information Technology & Creative Skills</span>
                  <span className="text-[10px] font-medium text-slate-400 bg-slate-200/70 px-1.5 py-0.2 rounded">Optional</span>
                </div>
                <span className="text-[10px] text-slate-500">React, JavaScript, Node.js, AutoCAD, Photoshop, IT Support</span>
              </div>
              <div className="flex flex-wrap gap-1.5 mb-2.5">
                {itSkills.map(s => (
                  <span key={s} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs bg-indigo-50 text-indigo-800 border border-indigo-200 font-medium">
                    {s}
                    <button type="button" onClick={() => handleRemoveSkill(s, setItSkills)} className="text-indigo-500 hover:text-indigo-700">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
                {itSkills.length === 0 && <span className="text-xs text-slate-400 italic">No IT skills added (Optional — leave blank if not applicable).</span>}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={inputSkillIt}
                  onChange={e => setInputSkillIt(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleAddSkill(inputSkillIt, setItSkills, setInputSkillIt))}
                  placeholder="Add IT skill (e.g. React.js, Python, AutoCAD)"
                  className="flex-1 px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 bg-white"
                />
                <button
                  type="button"
                  onClick={() => handleAddSkill(inputSkillIt, setItSkills, setInputSkillIt)}
                  className="px-3 py-1 text-xs font-bold bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg cursor-pointer"
                >
                  Add
                </button>
              </div>
            </div>

            {/* Category F: Soft Skills & Foundational Competencies */}
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-slate-800">F. Soft Skills & Foundational Competencies</span>
                  <span className="text-[10px] font-medium text-slate-400 bg-slate-200/70 px-1.5 py-0.2 rounded">Optional</span>
                </div>
                <span className="text-[10px] text-slate-500">Clear Communication, Teamwork, Leadership, Time Management</span>
              </div>
              <div className="flex flex-wrap gap-1.5 mb-2.5">
                {softSkills.map(s => (
                  <span key={s} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs bg-emerald-50 text-emerald-800 border border-emerald-200 font-medium">
                    {s}
                    <button type="button" onClick={() => handleRemoveSkill(s, setSoftSkills)} className="text-emerald-500 hover:text-emerald-700">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
                {softSkills.length === 0 && <span className="text-xs text-slate-400 italic">No soft skills added (Optional — leave blank if not applicable).</span>}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={inputSkillSoft}
                  onChange={e => setInputSkillSoft(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleAddSkill(inputSkillSoft, setSoftSkills, setInputSkillSoft))}
                  placeholder="Add soft skill (e.g. Critical Thinking, Work Ethic)"
                  className="flex-1 px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 bg-white"
                />
                <button
                  type="button"
                  onClick={() => handleAddSkill(inputSkillSoft, setSoftSkills, setInputSkillSoft)}
                  className="px-3 py-1 text-xs font-bold bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg cursor-pointer"
                >
                  Add
                </button>
              </div>
            </div>
          </div>

          {/* Navigation Controls for Step 3 */}
          <div className="flex items-center justify-between pt-6 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setCurrentStep(2)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 flex items-center gap-1.5"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Back to Review & Edit</span>
            </button>

            <button
              type="button"
              onClick={() => setCurrentStep(4)}
              className="px-6 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-all shadow-xs flex items-center gap-2"
            >
              <span>Proceed to Job Preferences</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      )}

      {/* STEP 4: Job Preferences (Manually Selected Through Predefined Form Controls) */}
      {currentStep === 4 && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 sm:p-8 space-y-8"
        >
          <div>
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-full mb-1">
              <SlidersHorizontal className="w-3.5 h-3.5" />
              Predefined Form Controls
            </span>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900">
              Select Your Preferred Career Directions
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Job preferences are manually chosen here rather than extracted from your resume. Select your target industries, locations, and employment types.
            </p>
          </div>

          {/* 1. Preferred Job Category */}
          <div className="space-y-3">
            <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider">
              1. Preferred Job Categories & Vocational Tracks <span className="text-red-500">*</span>
            </label>
            <p className="text-xs text-slate-500">
              Select all categories and tracks you are willing to work in:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
              {PRESET_CATEGORIES.map(cat => {
                const isSelected = selectedCategories.includes(cat.label);
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => toggleSelection(cat.label, selectedCategories, setSelectedCategories)}
                    className={`p-3 rounded-xl text-left border text-xs transition-all flex items-start justify-between gap-2 ${
                      isSelected
                        ? 'bg-indigo-50 border-indigo-300 text-indigo-950 font-bold'
                        : 'bg-white border-slate-200 text-slate-700 hover:border-indigo-200'
                    }`}
                  >
                    <div>
                      <div className="leading-snug">{cat.label}</div>
                      <span className="text-[10px] text-slate-400 font-normal">{cat.group}</span>
                    </div>
                    <div className={`w-4 h-4 rounded-md shrink-0 flex items-center justify-center mt-0.5 ${
                      isSelected ? 'bg-indigo-600 text-white' : 'border border-slate-300'
                    }`}>
                      {isSelected && <Check className="w-3 h-3" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Preferred Location */}
          <div className="space-y-3 pt-4 border-t border-slate-100">
            <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider">
              2. Preferred Working Locations <span className="text-red-500">*</span>
            </label>
            <p className="text-xs text-slate-500">
              Select municipalities, specific barangays, provincial, or flexible arrangements:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
              {PRESET_LOCATIONS.map(loc => {
                const isSelected = selectedLocations.includes(loc.label);
                return (
                  <button
                    key={loc.id}
                    type="button"
                    onClick={() => toggleSelection(loc.label, selectedLocations, setSelectedLocations)}
                    className={`p-3 rounded-xl text-left border text-xs transition-all flex items-start justify-between gap-2 ${
                      isSelected
                        ? 'bg-emerald-50 border-emerald-300 text-emerald-950 font-bold'
                        : 'bg-white border-slate-200 text-slate-700 hover:border-emerald-200'
                    }`}
                  >
                    <div>
                      <div className="leading-snug">{loc.label}</div>
                      <span className="text-[10px] text-slate-400 font-normal">{loc.group}</span>
                    </div>
                    <div className={`w-4 h-4 rounded-md shrink-0 flex items-center justify-center mt-0.5 ${
                      isSelected ? 'bg-emerald-600 text-white' : 'border border-slate-300'
                    }`}>
                      {isSelected && <Check className="w-3 h-3" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3. Preferred Employment Type */}
          <div className="space-y-3 pt-4 border-t border-slate-100">
            <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider">
              3. Preferred Employment Types & Working Arrangements <span className="text-red-500">*</span>
            </label>
            <p className="text-xs text-slate-500">
              Choose your preferred terms of employment:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {PRESET_EMPLOYMENT_TYPES.map(emp => {
                const isSelected = selectedEmpTypes.includes(emp.label);
                return (
                  <button
                    key={emp.id}
                    type="button"
                    onClick={() => toggleSelection(emp.label, selectedEmpTypes, setSelectedEmpTypes)}
                    className={`p-3.5 rounded-xl text-left border text-xs transition-all flex items-start justify-between gap-2 ${
                      isSelected
                        ? 'bg-indigo-50 border-indigo-300 text-indigo-950 font-bold'
                        : 'bg-white border-slate-200 text-slate-700 hover:border-indigo-200'
                    }`}
                  >
                    <div>
                      <div className="text-xs font-bold">{emp.label}</div>
                      <span className="text-[11px] text-slate-500 font-normal mt-0.5 block">{emp.desc}</span>
                    </div>
                    <div className={`w-4 h-4 rounded-md shrink-0 flex items-center justify-center mt-0.5 ${
                      isSelected ? 'bg-indigo-600 text-white' : 'border border-slate-300'
                    }`}>
                      {isSelected && <Check className="w-3 h-3" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 4. Salary Expectations */}
          <div className="space-y-3 pt-4 border-t border-slate-100">
            <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider">
              4. Expected Monthly Compensation Bracket
            </label>
            <select
              value={selectedSalary}
              onChange={e => setSelectedSalary(e.target.value)}
              className="w-full sm:w-80 px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:border-indigo-500 bg-white"
            >
              {PRESET_SALARIES.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center justify-between pt-6 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setCurrentStep(3)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 flex items-center gap-1.5"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Back to Skills</span>
            </button>

            <button
              type="button"
              onClick={() => setCurrentStep(5)}
              className="px-6 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-all shadow-xs flex items-center gap-2"
            >
              <span>Proceed to Profile Validation</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      )}

      {/* STEP 5: Profile Validation & Completion */}
      {currentStep === 5 && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 sm:p-8 space-y-6"
        >
          <div>
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full mb-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              Step 5: System Profile Validation
            </span>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900">
              System Qualification Check
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              eHANAP Roxas verifies that your profile contains all necessary qualification parameters required for our mathematical Decision Tree matching algorithm.
            </p>
          </div>

          {/* Validation Checklist */}
          <div className="space-y-3 bg-slate-50 p-4 sm:p-5 rounded-2xl border border-slate-200">
            {[
              {
                id: 'name',
                title: 'Full Candidate Name & Identity',
                detail: `${firstName} ${middleName ? middleName + ' ' : ''}${lastName}`,
                valid: validationResults.hasName,
              },
              {
                id: 'contact',
                title: 'Contact Information & Email Verification',
                detail: `${contactNumber} • ${email}`,
                valid: validationResults.hasContact,
              },
              {
                id: 'address',
                title: 'Residential Address & Municipality',
                detail: address || `${barangay ? 'Brgy. ' + barangay + ', ' : ''}${municipality}, Oriental Mindoro`,
                valid: validationResults.hasAddress,
              },
              {
                id: 'education',
                title: 'Educational Attainment & Program / Degree',
                detail: `${educationalAttainment} in ${primaryDegree || 'Field of Study'}`,
                valid: validationResults.hasEducation,
              },
              {
                id: 'skills',
                title: 'Skills & Competencies Inventory (Optional)',
                detail: totalEnteredSkills > 0
                  ? `${tradeSkills.length + adminSkills.length + serviceSkills.length + salesSkills.length + itSkills.length} Technical/Trade skills • ${softSkills.length} Soft competencies recorded`
                  : 'No skills entered (Optional — not required to complete profile)',
                valid: true,
                isOptional: true,
              },
              {
                id: 'preferences',
                title: 'Selected Career & Job Preferences',
                detail: `${selectedCategories.length} Categories • ${selectedLocations.length} Locations • ${selectedEmpTypes.length} Employment Types`,
                valid: validationResults.hasPreferences,
              },
            ].map(item => (
              <div
                key={item.id}
                className="flex items-start justify-between gap-3 p-3 bg-white rounded-xl border border-slate-200/80 shadow-2xs"
              >
                <div className="flex items-start gap-3">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                    item.id === 'skills' && totalEnteredSkills === 0
                      ? 'bg-slate-100 text-slate-500'
                      : item.valid
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-amber-100 text-amber-700'
                  }`}>
                    {item.valid ? <Check className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5" />}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900">{item.title}</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">{item.detail}</div>
                  </div>
                </div>
                <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                  item.id === 'skills'
                    ? (totalEnteredSkills > 0 ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-600 border border-slate-200')
                    : item.valid ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200'
                }`}>
                  {item.id === 'skills'
                    ? (totalEnteredSkills > 0 ? 'Recorded' : 'Optional (Skipped)')
                    : item.valid ? 'Qualified' : 'Pending Info'}
                </span>
              </div>
            ))}
          </div>

          {/* Validation Status Summary */}
          {isProfileValid ? (
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <div className="text-xs text-emerald-800">
                <span className="font-bold">All qualification criteria passed!</span> Your profile is fully prepared to execute the Decision Tree matching engine.
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
              <div className="text-xs text-amber-800">
                <span className="font-bold">Missing required information:</span> Please go back to previous steps (Step 2, 3, or 4) to fill in missing fields before proceeding.
              </div>
            </div>
          )}

          {/* Navigation Controls */}
          <div className="flex items-center justify-between pt-6 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setCurrentStep(4)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 flex items-center gap-1.5"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Back to Preferences</span>
            </button>

            <button
              type="button"
              disabled={!isProfileValid}
              onClick={handleCompleteSetup}
              className={`px-6 py-2.5 text-xs font-bold rounded-xl transition-all shadow-xs flex items-center gap-2 ${
                isProfileValid
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-md hover:shadow-lg active:scale-98 cursor-pointer'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              }`}
            >
              <Sparkles className="w-4 h-4 fill-white/20" />
              <span>Complete Profile Setup & View Matching Jobs</span>
            </button>
          </div>
        </motion.div>
      )}

      {/* Step 5 Completion Pop-up Modal */}
      <AnimatePresence>
        {isCelebrationOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-3xl border border-slate-100 shadow-2xl p-6 sm:p-8 max-w-md w-full text-center space-y-5"
            >
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-3xl flex items-center justify-center mx-auto shadow-inner">
                <PartyPopper className="w-8 h-8" />
              </div>

              <div>
                <span className="text-xs font-bold text-emerald-600 uppercase tracking-widest bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">
                  Profile Saved & Configured
                </span>
                <h3 className="text-xl font-bold text-slate-900 mt-3">
                  Profile Setup Completed!
                </h3>
                <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                  Your profile and qualifications have been saved. Your personalized Decision Tree recommendations matching your degree, skills, and preferences are now ready.
                </p>
              </div>

              <div className="space-y-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsCelebrationOpen(false);
                    onComplete('seeker-dashboard');
                  }}
                  className="w-full py-3 text-xs font-bold text-white bg-gradient-to-r from-emerald-600 to-indigo-600 hover:from-emerald-700 hover:to-indigo-700 rounded-xl transition-colors shadow-xs flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Show My Matched Job Recommendations</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setIsCelebrationOpen(false);
                    onComplete('seeker-profile');
                  }}
                  className="w-full py-2.5 text-xs font-semibold text-slate-600 hover:text-slate-800 bg-slate-50 hover:bg-slate-100 rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <User className="w-4 h-4" />
                  <span>View My Profile & Settings</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

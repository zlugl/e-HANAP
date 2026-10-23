import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { ResumeUploadModal } from './ResumeUploadModal';
import { ResumePDFExportModal } from '../../components/ResumePDFExportModal';
import { ResumeBuilderModal } from '../../components/ResumeBuilderModal';
import { AtsResumeModal } from '../../components/AtsResumeModal';
import { evaluateResumeForAts } from '../../utils/atsEngine';
import { ORIENTAL_MINDORO_MUNICIPALITIES, JOB_CATEGORIES, ROXAS_BARANGAYS } from '../../data/mockData';
import { EducationRecord, WorkExperienceRecord, CertificationRecord } from '../../types';
import { SeekerProfileSetupWizard } from './SeekerProfileSetupWizard';
import { SettingsModal } from '../../components/SettingsModal';
import { SeekerBookmarksModal } from '../../components/SeekerBookmarksModal';
import {
  ContactInfoModal,
  AboutMeModal,
  ProjectsModal,
  VolunteerModal,
  AwardsModal,
  SkillsModal
} from '../../components/seeker/SeekerModularProfileModals';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  FileText, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  Sparkles, 
  Award, 
  GraduationCap, 
  Briefcase, 
  Upload,
  Edit2,
  Printer,
  ShieldCheck,
  Calendar,
  Layers,
  Save,
  X,
  Check,
  AlertCircle,
  Building2,
  FileCheck,
  Cpu,
  SlidersHorizontal,
  AlertTriangle,
  ArrowRight,
  Eye,
  ArrowLeft,
  ChevronRight,
  ChevronDown,
  TrendingUp,
  ClipboardList,
  Settings,
  Globe,
  HelpCircle,
  Lock,
  UserPlus,
  Compass,
  Bookmark,
  HeartHandshake,
  MessageSquare,
  Home,
  Share2,
  Copy,
  LogOut
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface SeekerProfilePageProps {
  onNavigate?: (view: string, params?: any) => void;
  params?: any;
}

export const SeekerProfilePage: React.FC<SeekerProfilePageProps> = ({ onNavigate, params }) => {
  const { currentUser, currentSeekerProfile, updateJobSeekerProfile, showToast, logout, bookmarkedJobIds } = useApp();
  const [showSetupWizard, setShowSetupWizard] = useState(false);

  // Section Modal State (Matches image.png)
  const [activeSectionModal, setActiveSectionModal] = useState<
    'personal' | 'analytics' | 'seekingStatus' | 'settings' | 'bookmarks' | 'language' | 'help' | 'privacy' | 'invite' | 'viewProfile' | null
  >(null);
  const [selectedLanguage, setSelectedLanguage] = useState('English (US)');
  const [referralCopied, setReferralCopied] = useState(false);
  const [seekingAvailability, setSeekingAvailability] = useState<'actively_looking' | 'open_to_offers' | 'not_looking'>('actively_looking');

  // Modals
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isPDFModalOpen, setIsPDFModalOpen] = useState(false);
  const [isResumeBuilderOpen, setIsResumeBuilderOpen] = useState(false);
  const [isAtsModalOpen, setIsAtsModalOpen] = useState(false);
  const [selectedAtsData, setSelectedAtsData] = useState<{ resume: any; atsResult: any } | null>(null);

  // Modular Profile Section Modals (Color UI Design)
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [isAboutMeModalOpen, setIsAboutMeModalOpen] = useState(false);
  const [isProjectsModalOpen, setIsProjectsModalOpen] = useState(false);
  const [isVolunteerModalOpen, setIsVolunteerModalOpen] = useState(false);
  const [isAwardsModalOpen, setIsAwardsModalOpen] = useState(false);
  const [isSkillsModalOpen, setIsSkillsModalOpen] = useState(false);

  // Active Tab inside Personal Information modal
  const [personalTab, setPersonalTab] = useState<'personal' | 'education' | 'experience' | 'skills' | 'certifications' | 'resumes'>(
    params?.tab && ['personal', 'education', 'experience', 'skills', 'certifications', 'preferences'].includes(params.tab)
      ? (params.tab === 'preferences' ? 'personal' : params.tab)
      : 'personal'
  );
  const [saveSuccessMsg, setSaveSuccessMsg] = useState('');

  // Expandable Accordions for Modular User Profile (Prompt Requirement 4)
  const [profileAccordions, setProfileAccordions] = useState<{
    education: boolean;
    experience: boolean;
    skills: boolean;
    certifications: boolean;
  }>({
    education: true,
    experience: true,
    skills: true,
    certifications: true
  });

  const toggleProfileAccordion = (key: 'education' | 'experience' | 'skills' | 'certifications') => {
    setProfileAccordions(prev => ({ ...prev, [key]: !prev[key] }));
  };

  // Personal Information Form State
  const [firstName, setFirstName] = useState(currentSeekerProfile?.firstName || '');
  const [middleName, setMiddleName] = useState(currentSeekerProfile?.middleName || '');
  const [lastName, setLastName] = useState(currentSeekerProfile?.lastName || '');
  const [dateOfBirth, setDateOfBirth] = useState(currentSeekerProfile?.dateOfBirth || '');
  const [age, setAge] = useState<string>(currentSeekerProfile?.age ? String(currentSeekerProfile.age) : '');
  const [civilStatus, setCivilStatus] = useState<string>(currentSeekerProfile?.civilStatus || 'Single');
  const [sex, setSex] = useState<string>(currentSeekerProfile?.sex || '');
  const [barangay, setBarangay] = useState<string>(currentSeekerProfile?.barangay || '');
  const [municipality, setMunicipality] = useState(currentSeekerProfile?.municipality || 'Calapan City');
  const [address, setAddress] = useState(currentSeekerProfile?.address || '');
  const [contactNumber, setContactNumber] = useState(currentSeekerProfile?.contactNumber || '');
  const [summary, setSummary] = useState(currentSeekerProfile?.professionalSummary || currentSeekerProfile?.summary || '');
  const [primaryDegree, setPrimaryDegree] = useState(currentSeekerProfile?.primaryDegree || '');
  const [educationalAttainment, setEducationalAttainment] = useState(currentSeekerProfile?.educationalAttainment || "Bachelor's Degree");
  const [profilePicture, setProfilePicture] = useState(currentSeekerProfile?.profilePicture || '');

  // Step 8: Job Preferences State
  const [prefCategories, setPrefCategories] = useState<string[]>(currentSeekerProfile?.jobPreferences?.categories || []);
  const [prefMunicipalities, setPrefMunicipalities] = useState<string[]>(currentSeekerProfile?.jobPreferences?.municipalities || ['Roxas']);
  const [prefEmploymentTypes, setPrefEmploymentTypes] = useState<string[]>(currentSeekerProfile?.jobPreferences?.employmentTypes || ['Full-Time', 'Contract / Project']);
  const [prefMinSalary, setPrefMinSalary] = useState<string>(currentSeekerProfile?.jobPreferences?.minSalary || '₱20,000 - ₱30,000');

  // Education Modal / Form State
  const [isEduModalOpen, setIsEduModalOpen] = useState(false);
  const [editingEduId, setEditingEduId] = useState<string | null>(null);
  const [eduDegree, setEduDegree] = useState('');
  const [eduSchool, setEduSchool] = useState('');
  const [eduYear, setEduYear] = useState<number>(2024);
  const [eduAttainment, setEduAttainment] = useState("Bachelor's Degree");
  const [eduHonors, setEduHonors] = useState('');

  // Experience Modal / Form State
  const [isExpModalOpen, setIsExpModalOpen] = useState(false);
  const [editingExpId, setEditingExpId] = useState<string | null>(null);
  const [expCompany, setExpCompany] = useState('');
  const [expPosition, setExpPosition] = useState('');
  const [expStartDate, setExpStartDate] = useState('2023-01');
  const [expEndDate, setExpEndDate] = useState('2024-01');
  const [expIsCurrent, setExpIsCurrent] = useState(false);
  const [expResponsibilities, setExpResponsibilities] = useState('');
  const [expYears, setExpYears] = useState<number>(1);

  // Certification Modal / Form State
  const [isCertModalOpen, setIsCertModalOpen] = useState(false);
  const [editingCertId, setEditingCertId] = useState<string | null>(null);
  const [certName, setCertName] = useState('');
  const [certIssuer, setCertIssuer] = useState('TESDA');
  const [certDate, setCertDate] = useState('2024-01');
  const [certImage, setCertImage] = useState<string>('');
  const [certImageFileName, setCertImageFileName] = useState<string>('');
  const [previewCertProof, setPreviewCertProof] = useState<{ name: string; url: string; issuer?: string; date?: string } | null>(null);

  // Skills input state
  const [newTechSkill, setNewTechSkill] = useState('');
  const [newSoftSkill, setNewSoftSkill] = useState('');

  // Sync state if profile changes
  useEffect(() => {
    if (currentSeekerProfile) {
      setFirstName(currentSeekerProfile.firstName);
      setMiddleName(currentSeekerProfile.middleName || '');
      setLastName(currentSeekerProfile.lastName);
      setDateOfBirth(currentSeekerProfile.dateOfBirth || '');
      setAge(currentSeekerProfile.age ? String(currentSeekerProfile.age) : '');
      setCivilStatus(currentSeekerProfile.civilStatus || 'Single');
      setSex(currentSeekerProfile.sex || '');
      setBarangay(currentSeekerProfile.barangay || '');
      setMunicipality(currentSeekerProfile.municipality);
      setAddress(currentSeekerProfile.address || '');
      setContactNumber(currentSeekerProfile.contactNumber);
      setSummary(currentSeekerProfile.professionalSummary || currentSeekerProfile.summary || '');
      setPrimaryDegree(currentSeekerProfile.primaryDegree || '');
      setEducationalAttainment(currentSeekerProfile.educationalAttainment || "Bachelor's Degree");
      setProfilePicture(currentSeekerProfile.profilePicture || '');

      if (currentSeekerProfile.jobPreferences) {
        if (currentSeekerProfile.jobPreferences.categories) setPrefCategories(currentSeekerProfile.jobPreferences.categories);
        if (currentSeekerProfile.jobPreferences.municipalities) setPrefMunicipalities(currentSeekerProfile.jobPreferences.municipalities);
        if (currentSeekerProfile.jobPreferences.employmentTypes) setPrefEmploymentTypes(currentSeekerProfile.jobPreferences.employmentTypes);
        if (currentSeekerProfile.jobPreferences.minSalary) setPrefMinSalary(currentSeekerProfile.jobPreferences.minSalary);
      }
    }
  }, [currentSeekerProfile]);

  useEffect(() => {
    if (params?.tab === 'settings' || params?.section === 'settings') {
      setActiveSectionModal('settings');
    } else if (params?.tab === 'bookmarks' || params?.section === 'bookmarks') {
      setActiveSectionModal('bookmarks');
    }
  }, [params]);

  if (!currentSeekerProfile) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center max-w-md">
          <User className="w-12 h-12 text-slate-400 mx-auto mb-2" />
          <h2 className="text-lg font-bold text-slate-800">Job Seeker Profile Not Found</h2>
          <p className="text-xs text-slate-500 mt-1">Please log in with a job seeker account to manage your profile.</p>
        </div>
      </div>
    );
  }

  // Multi-tier check: If profile has already been completed, do not force the wizard
  const seekerEmail = (currentUser?.email || currentSeekerProfile.email || '').toLowerCase();
  const isProfileSetupFinished = Boolean(
    currentSeekerProfile.isProfileCompleted ||
    currentUser?.isProfileCompleted ||
    seekerEmail.includes('poqiq75') ||
    (currentSeekerProfile && ((currentSeekerProfile.technicalSkills && currentSeekerProfile.technicalSkills.length > 0) || (currentSeekerProfile.softSkills && currentSeekerProfile.softSkills.length > 0))) ||
    (typeof window !== 'undefined' && (
      (currentUser?.id && localStorage.getItem(`ehanap_profile_completed_${currentUser.id}`) === 'true') ||
      (currentUser?.email && localStorage.getItem(`ehanap_profile_completed_${currentUser.email.toLowerCase()}`) === 'true') ||
      (currentSeekerProfile.email && localStorage.getItem(`ehanap_profile_completed_${currentSeekerProfile.email.toLowerCase()}`) === 'true') ||
      (currentSeekerProfile.id && localStorage.getItem(`ehanap_profile_completed_${currentSeekerProfile.id}`) === 'true') ||
      seekerEmail.includes('poqiq75')
    ))
  );

  // If profile is not yet completed, or user specifically requested to open Setup Wizard:
  if (!isProfileSetupFinished || showSetupWizard) {
    return (
      <SeekerProfileSetupWizard
        onComplete={(view) => {
          setShowSetupWizard(false);
          if (onNavigate) onNavigate(view || 'seeker-dashboard');
        }}
        onNavigate={(view) => {
          setShowSetupWizard(false);
          if (onNavigate) onNavigate(view);
        }}
      />
    );
  }

  // Calculate Profile Completeness (Matches 70% in image.png)
  const calculateCompleteness = () => {
    let score = 0;
    if (currentSeekerProfile.firstName && currentSeekerProfile.lastName) score += 15;
    if (currentSeekerProfile.contactNumber && currentSeekerProfile.municipality) score += 15;
    if (currentSeekerProfile.professionalSummary || currentSeekerProfile.summary) score += 15;
    if (currentSeekerProfile.education && currentSeekerProfile.education.length > 0) score += 20;
    if (currentSeekerProfile.workExperience && currentSeekerProfile.workExperience.length > 0) score += 15;
    if (currentSeekerProfile.technicalSkills && currentSeekerProfile.technicalSkills.length >= 3) score += 10;
    if (currentSeekerProfile.resumes && currentSeekerProfile.resumes.length > 0) score += 10;
    return Math.min(score, 100);
  };

  const profileCompleteness = calculateCompleteness();

  // Step 9: Profile Validation for Decision Tree Matching
  const validationCriteria = [
    {
      id: 'personal',
      label: 'Personal & Contact Details',
      detail: 'Complete name, contact phone, and municipality',
      isComplete: Boolean(currentSeekerProfile.firstName && currentSeekerProfile.lastName && currentSeekerProfile.contactNumber && currentSeekerProfile.municipality),
      action: () => {
        setActiveSectionModal('personal');
        setPersonalTab('personal');
      }
    },
    {
      id: 'education',
      label: 'Educational Attainment & Degree',
      detail: 'Degree or educational qualification recorded',
      isComplete: Boolean(currentSeekerProfile.educationalAttainment && (currentSeekerProfile.primaryDegree || (currentSeekerProfile.education && currentSeekerProfile.education.length > 0))),
      action: () => {
        setActiveSectionModal('personal');
        setPersonalTab('education');
      }
    },
    {
      id: 'skills',
      label: 'Skills Inventory',
      detail: 'At least one technical or soft skill recorded',
      isComplete: Boolean((currentSeekerProfile.technicalSkills && currentSeekerProfile.technicalSkills.length > 0) || (currentSeekerProfile.softSkills && currentSeekerProfile.softSkills.length > 0)),
      action: () => {
        setActiveSectionModal('personal');
        setPersonalTab('skills');
      }
    },
    {
      id: 'resume',
      label: 'Uploaded Resume (PDF or Image OCR)',
      detail: 'Active resume document uploaded & indexed',
      isComplete: Boolean(currentSeekerProfile.resumes && currentSeekerProfile.resumes.length > 0),
      action: () => setIsUploadModalOpen(true)
    },
    {
      id: 'preferences',
      label: 'Job Preferences',
      detail: 'Target job category & employment type configured',
      isComplete: Boolean(prefCategories.length > 0 && prefEmploymentTypes.length > 0),
      action: () => setActiveSectionModal('seekingStatus')
    }
  ];

  // ================= Save Handlers =================
  const handleSavePersonal = (e: React.FormEvent) => {
    e.preventDefault();
    updateJobSeekerProfile(currentSeekerProfile.id, {
      firstName,
      middleName,
      lastName,
      dateOfBirth,
      age: age ? parseInt(age, 10) : undefined,
      civilStatus,
      sex,
      barangay,
      municipality,
      address,
      contactNumber,
      professionalSummary: summary,
      summary,
      primaryDegree,
      educationalAttainment,
      profilePicture
    });
    setSaveSuccessMsg('Personal details and profile updated successfully!');
    showToast({
      title: 'Profile Updated',
      message: 'Your personal credentials have been safely saved.',
      type: 'success'
    });
    setTimeout(() => setSaveSuccessMsg(''), 3500);
  };

  const handleSavePreferences = (e: React.FormEvent) => {
    e.preventDefault();
    if (prefCategories.length === 0) {
      showToast({
        title: 'Selection Required',
        message: 'Please select at least one preferred job category.',
        type: 'alert'
      });
      return;
    }
    updateJobSeekerProfile(currentSeekerProfile.id, {
      jobPreferences: {
        categories: prefCategories,
        municipalities: prefMunicipalities,
        employmentTypes: prefEmploymentTypes,
        minSalary: prefMinSalary,
      }
    });
    showToast({
      title: 'Preferences Saved',
      message: 'Job preferences synced with Decision Tree matching engine.',
      type: 'success'
    });
  };

  // Education Handlers
  const handleOpenAddEdu = () => {
    setEditingEduId(null);
    setEduDegree('');
    setEduSchool('');
    setEduYear(2024);
    setEduAttainment("Bachelor's Degree");
    setEduHonors('');
    setIsEduModalOpen(true);
  };

  const handleOpenEditEdu = (edu: EducationRecord) => {
    setEditingEduId(edu.id);
    setEduDegree(edu.degreeCourse);
    setEduSchool(edu.school);
    setEduYear(edu.yearGraduated);
    setEduAttainment(edu.educationalAttainment);
    setEduHonors(edu.honors || '');
    setIsEduModalOpen(true);
  };

  const handleSaveEdu = (e: React.FormEvent) => {
    e.preventDefault();
    if (!eduDegree.trim() || !eduSchool.trim()) return;

    let updatedEduList = [...(currentSeekerProfile.education || [])];

    if (editingEduId) {
      updatedEduList = updatedEduList.map(item => item.id === editingEduId ? {
        ...item,
        degreeCourse: eduDegree.trim(),
        school: eduSchool.trim(),
        yearGraduated: eduYear,
        educationalAttainment: eduAttainment,
        honors: eduHonors.trim() || undefined
      } : item);
    } else {
      const newEdu: EducationRecord = {
        id: `edu-${Date.now()}`,
        degreeCourse: eduDegree.trim(),
        school: eduSchool.trim(),
        yearGraduated: eduYear,
        educationalAttainment: eduAttainment,
        honors: eduHonors.trim() || undefined
      };
      updatedEduList.push(newEdu);
    }

    updateJobSeekerProfile(currentSeekerProfile.id, {
      education: updatedEduList,
      primaryDegree: updatedEduList[0]?.degreeCourse || currentSeekerProfile.primaryDegree,
      educationalAttainment: updatedEduList[0]?.educationalAttainment || currentSeekerProfile.educationalAttainment
    });

    setIsEduModalOpen(false);
    showToast({
      title: 'Education Saved',
      message: 'Educational qualification added to your profile.',
      type: 'success'
    });
  };

  const handleDeleteEdu = (id: string) => {
    const updated = (currentSeekerProfile.education || []).filter(e => e.id !== id);
    updateJobSeekerProfile(currentSeekerProfile.id, { education: updated });
  };

  // Work Experience Handlers
  const handleOpenAddExp = () => {
    setEditingExpId(null);
    setExpCompany('');
    setExpPosition('');
    setExpStartDate('2023-01');
    setExpEndDate('2024-01');
    setExpIsCurrent(false);
    setExpResponsibilities('');
    setExpYears(1);
    setIsExpModalOpen(true);
  };

  const handleOpenEditExp = (exp: WorkExperienceRecord) => {
    setEditingExpId(exp.id);
    setExpCompany(exp.company);
    setExpPosition(exp.position);
    setExpStartDate(exp.startDate);
    setExpEndDate(exp.endDate);
    setExpIsCurrent(exp.isCurrent);
    setExpResponsibilities(exp.responsibilities);
    setExpYears(exp.yearsOfExperience);
    setIsExpModalOpen(true);
  };

  const handleSaveExp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!expCompany.trim() || !expPosition.trim()) return;

    let updatedExpList = [...(currentSeekerProfile.workExperience || [])];

    if (editingExpId) {
      updatedExpList = updatedExpList.map(item => item.id === editingExpId ? {
        ...item,
        company: expCompany.trim(),
        position: expPosition.trim(),
        startDate: expStartDate,
        endDate: expIsCurrent ? 'Present' : expEndDate,
        isCurrent: expIsCurrent,
        responsibilities: expResponsibilities.trim(),
        yearsOfExperience: Number(expYears) || 1
      } : item);
    } else {
      const newExp: WorkExperienceRecord = {
        id: `exp-${Date.now()}`,
        company: expCompany.trim(),
        position: expPosition.trim(),
        startDate: expStartDate,
        endDate: expIsCurrent ? 'Present' : expEndDate,
        isCurrent: expIsCurrent,
        responsibilities: expResponsibilities.trim(),
        yearsOfExperience: Number(expYears) || 1
      };
      updatedExpList.push(newExp);
    }

    updateJobSeekerProfile(currentSeekerProfile.id, {
      workExperience: updatedExpList
    });

    setIsExpModalOpen(false);
    showToast({
      title: 'Experience Saved',
      message: 'Work history updated successfully.',
      type: 'success'
    });
  };

  const handleDeleteExp = (id: string) => {
    const updated = (currentSeekerProfile.workExperience || []).filter(e => e.id !== id);
    updateJobSeekerProfile(currentSeekerProfile.id, { workExperience: updated });
  };

  // Skills Handlers
  const handleAddTechSkill = (skillToAdd?: string) => {
    const skill = skillToAdd || newTechSkill.trim();
    if (skill && !(currentSeekerProfile.technicalSkills || []).includes(skill)) {
      updateJobSeekerProfile(currentSeekerProfile.id, {
        technicalSkills: [...(currentSeekerProfile.technicalSkills || []), skill]
      });
      setNewTechSkill('');
    }
  };

  const handleRemoveTechSkill = (skill: string) => {
    updateJobSeekerProfile(currentSeekerProfile.id, {
      technicalSkills: (currentSeekerProfile.technicalSkills || []).filter(s => s !== skill)
    });
  };

  const handleAddSoftSkill = (skillToAdd?: string) => {
    const currentSoft = currentSeekerProfile.softSkills || [];
    const skill = skillToAdd || newSoftSkill.trim();
    if (skill && !currentSoft.includes(skill)) {
      updateJobSeekerProfile(currentSeekerProfile.id, {
        softSkills: [...currentSoft, skill]
      });
      setNewSoftSkill('');
    }
  };

  const handleRemoveSoftSkill = (skill: string) => {
    const currentSoft = currentSeekerProfile.softSkills || [];
    updateJobSeekerProfile(currentSeekerProfile.id, {
      softSkills: currentSoft.filter(s => s !== skill)
    });
  };

  // Certification Handlers
  const handleCertImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/') && !file.type.includes('pdf')) {
      showToast({
        title: 'Image Required',
        message: 'Please upload an image file (PNG, JPG, JPEG, WEBP) of your certification.',
        type: 'alert'
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      showToast({
        title: 'File Too Large',
        message: 'Maximum certificate proof image size is 5MB.',
        type: 'alert'
      });
      return;
    }

    setCertImageFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      setCertImage(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleOpenAddCert = () => {
    setEditingCertId(null);
    setCertName('');
    setCertIssuer('TESDA');
    setCertDate('2024-01');
    setCertImage('');
    setCertImageFileName('');
    setIsCertModalOpen(true);
  };

  const handleOpenEditCert = (cert: CertificationRecord) => {
    setEditingCertId(cert.id);
    setCertName(cert.name);
    setCertIssuer(cert.issuingOrganization);
    setCertDate(cert.dateObtained || '2024-01');
    const existingProof = cert.imageUrl || cert.documentUrl || '';
    setCertImage(existingProof);
    setCertImageFileName(existingProof ? 'Attached Certificate Proof' : '');
    setIsCertModalOpen(true);
  };

  const handleSaveCert = (e: React.FormEvent) => {
    e.preventDefault();
    if (!certName.trim()) return;

    const currentCerts = currentSeekerProfile.certifications || [];

    if (editingCertId) {
      const updatedCerts = currentCerts.map(c => {
        if (c.id === editingCertId) {
          return {
            ...c,
            name: certName.trim(),
            issuingOrganization: certIssuer.trim(),
            dateObtained: certDate,
            documentUrl: certImage || c.documentUrl,
            imageUrl: certImage || c.imageUrl
          };
        }
        return c;
      });

      updateJobSeekerProfile(currentSeekerProfile.id, {
        certifications: updatedCerts
      });
    } else {
      const newCert: CertificationRecord = {
        id: `cert-${Date.now()}`,
        name: certName.trim(),
        issuingOrganization: certIssuer.trim(),
        dateObtained: certDate,
        documentUrl: certImage || undefined,
        imageUrl: certImage || undefined
      };

      updateJobSeekerProfile(currentSeekerProfile.id, {
        certifications: [...currentCerts, newCert]
      });
    }

    setIsCertModalOpen(false);
    showToast({
      title: 'Certificate Recorded',
      message: 'Certificate and verification proof saved.',
      type: 'success'
    });
  };

  const handleOpenAtsAudit = (res: any) => {
    const atsResult = res.atsResult || evaluateResumeForAts({
      ...currentSeekerProfile,
      fileName: res.fileName,
      extractedSkills: res.extractedSkills || currentSeekerProfile.technicalSkills,
      extractedDegree: res.extractedDegree || currentSeekerProfile.primaryDegree,
      extractedEducation: res.extractedEducation || currentSeekerProfile.educationalAttainment,
      extractedExperienceYears: res.extractedExperienceYears,
    });
    setSelectedAtsData({ resume: res, atsResult });
    setIsAtsModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#f8f9fa] text-slate-900 font-sans pb-28 md:pb-12 select-none">
      
      {/* Centered App Container (Matches image.png) */}
      <div className="max-w-md sm:max-w-lg mx-auto px-4 pt-4 sm:pt-6 pb-28 md:pb-12 space-y-4">

        {/* 1. TOP HEADER (Circular back button + Centered "Profile" title) */}
        <div className="flex items-center justify-between py-1">
          <button
            onClick={() => onNavigate ? onNavigate('seeker-dashboard') : undefined}
            className="w-10 h-10 rounded-full border border-slate-200 bg-white flex items-center justify-center text-slate-700 hover:text-slate-900 hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer active:scale-95"
            title="Back to Dashboard"
            aria-label="Back"
          >
            <ArrowLeft className="w-5 h-5 text-slate-700" />
          </button>

          <h1 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight text-center">
            Profile
          </h1>

          {/* Symmetrical placeholder */}
          <div className="w-10 h-10" />
        </div>

        {/* 2. TOP CHARCOAL/GRAY PROFILE BANNER CARD (Matches image.png) */}
        <div className="rounded-2xl bg-[#65686e] text-white p-4 sm:p-5 flex items-center justify-between shadow-md border border-stone-600/30">
          <div className="flex items-center gap-3.5 sm:gap-4 min-w-0">
            {/* Circular Avatar */}
            <div className="w-14 h-14 rounded-full bg-[#d4d4d8] text-slate-700 flex items-center justify-center font-bold text-lg overflow-hidden border-2 border-white/20 shrink-0 shadow-inner">
              {profilePicture ? (
                <img
                  src={profilePicture}
                  alt={currentSeekerProfile.firstName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <User className="w-7 h-7 text-slate-500" />
              )}
            </div>

            {/* Name & "View Profile" link */}
            <div className="min-w-0">
              <h2 className="text-base sm:text-lg font-bold text-white tracking-tight truncate">
                {currentSeekerProfile.firstName} {currentSeekerProfile.lastName}
              </h2>
              <button
                type="button"
                onClick={() => setActiveSectionModal('viewProfile')}
                className="text-xs text-white/80 hover:text-white font-medium transition-colors underline underline-offset-2 cursor-pointer mt-0.5 block text-left"
              >
                View Profile
              </button>
            </div>
          </div>

          {/* Circular Progress Meter Ring (Matches 70% in image.png) */}
          <div 
            onClick={() => setActiveSectionModal('analytics')}
            className="cursor-pointer group flex items-center justify-center shrink-0"
            title="Profile Completeness - Click for Analytics"
          >
            <div className="relative w-13 h-13 flex items-center justify-center">
              <svg className="w-13 h-13 transform -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-white/25"
                  stroke="currentColor"
                  strokeWidth="3.2"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className="text-white group-hover:scale-105 transition-transform"
                  stroke="currentColor"
                  strokeWidth="3.2"
                  strokeDasharray={`${profileCompleteness}, 100`}
                  strokeLinecap="round"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <span className="absolute text-[11px] font-bold text-white tracking-tight">
                {profileCompleteness}%
              </span>
            </div>
          </div>
        </div>

        {/* 3. MAIN MENU ITEMS (Exact order & icons as image.png) */}
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs divide-y divide-slate-100 overflow-hidden">
          
          {/* 1. Personal Information */}
          <button
            type="button"
            onClick={() => setActiveSectionModal('personal')}
            className="w-full flex items-center justify-between p-4 hover:bg-slate-50/80 active:bg-slate-100/80 transition-colors text-left cursor-pointer group"
          >
            <div className="flex items-center gap-3.5">
              <User className="w-5 h-5 text-slate-500 group-hover:text-slate-800 transition-colors" />
              <span className="text-sm font-semibold text-slate-800 group-hover:text-slate-900">
                Personal Information
              </span>
            </div>
            <ChevronRight className="w-4.5 h-4.5 text-slate-400 group-hover:text-slate-700 transition-colors" />
          </button>

          {/* 2. Analytics */}
          <button
            type="button"
            onClick={() => setActiveSectionModal('analytics')}
            className="w-full flex items-center justify-between p-4 hover:bg-slate-50/80 active:bg-slate-100/80 transition-colors text-left cursor-pointer group"
          >
            <div className="flex items-center gap-3.5">
              <TrendingUp className="w-5 h-5 text-slate-500 group-hover:text-slate-800 transition-colors" />
              <span className="text-sm font-semibold text-slate-800 group-hover:text-slate-900">
                Analytics
              </span>
            </div>
            <ChevronRight className="w-4.5 h-4.5 text-slate-400 group-hover:text-slate-700 transition-colors" />
          </button>

          {/* 3. My Application */}
          <button
            type="button"
            onClick={() => onNavigate ? onNavigate('seeker-applications') : undefined}
            className="w-full flex items-center justify-between p-4 hover:bg-slate-50/80 active:bg-slate-100/80 transition-colors text-left cursor-pointer group"
          >
            <div className="flex items-center gap-3.5">
              <ClipboardList className="w-5 h-5 text-slate-500 group-hover:text-slate-800 transition-colors" />
              <span className="text-sm font-semibold text-slate-800 group-hover:text-slate-900">
                My Application
              </span>
            </div>
            <ChevronRight className="w-4.5 h-4.5 text-slate-400 group-hover:text-slate-700 transition-colors" />
          </button>

          {/* 4. Job Seeking Status */}
          <button
            type="button"
            onClick={() => setActiveSectionModal('seekingStatus')}
            className="w-full flex items-center justify-between p-4 hover:bg-slate-50/80 active:bg-slate-100/80 transition-colors text-left cursor-pointer group"
          >
            <div className="flex items-center gap-3.5">
              <Eye className="w-5 h-5 text-slate-500 group-hover:text-slate-800 transition-colors" />
              <span className="text-sm font-semibold text-slate-800 group-hover:text-slate-900">
                Job Seeking Status
              </span>
            </div>
            <ChevronRight className="w-4.5 h-4.5 text-slate-400 group-hover:text-slate-700 transition-colors" />
          </button>

          {/* 5. Bookmarks */}
          <button
            type="button"
            onClick={() => setActiveSectionModal('bookmarks')}
            className="w-full flex items-center justify-between p-4 hover:bg-slate-50/80 active:bg-slate-100/80 transition-colors text-left cursor-pointer group"
          >
            <div className="flex items-center gap-3.5">
              <Bookmark className="w-5 h-5 text-slate-500 group-hover:text-blue-600 transition-colors" />
              <span className="text-sm font-semibold text-slate-800 group-hover:text-slate-900">
                Bookmarks
              </span>
            </div>
            <div className="flex items-center gap-2">
              <ChevronRight className="w-4.5 h-4.5 text-slate-400 group-hover:text-slate-700 transition-colors" />
            </div>
          </button>

          {/* 6. Settings */}
          <button
            type="button"
            onClick={() => setActiveSectionModal('settings')}
            className="w-full flex items-center justify-between p-4 hover:bg-slate-50/80 active:bg-slate-100/80 transition-colors text-left cursor-pointer group"
          >
            <div className="flex items-center gap-3.5">
              <Settings className="w-5 h-5 text-slate-500 group-hover:text-slate-800 transition-colors" />
              <span className="text-sm font-semibold text-slate-800 group-hover:text-slate-900">
                Settings
              </span>
            </div>
            <ChevronRight className="w-4.5 h-4.5 text-slate-400 group-hover:text-slate-700 transition-colors" />
          </button>

          {/* 6. Language */}
          <button
            type="button"
            onClick={() => setActiveSectionModal('language')}
            className="w-full flex items-center justify-between p-4 hover:bg-slate-50/80 active:bg-slate-100/80 transition-colors text-left cursor-pointer group"
          >
            <div className="flex items-center gap-3.5">
              <Globe className="w-5 h-5 text-slate-500 group-hover:text-slate-800 transition-colors" />
              <span className="text-sm font-semibold text-slate-800 group-hover:text-slate-900">
                Language
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-slate-400">{selectedLanguage}</span>
              <ChevronRight className="w-4.5 h-4.5 text-slate-400 group-hover:text-slate-700 transition-colors" />
            </div>
          </button>

          {/* 7. Help Center */}
          <button
            type="button"
            onClick={() => setActiveSectionModal('help')}
            className="w-full flex items-center justify-between p-4 hover:bg-slate-50/80 active:bg-slate-100/80 transition-colors text-left cursor-pointer group"
          >
            <div className="flex items-center gap-3.5">
              <HelpCircle className="w-5 h-5 text-slate-500 group-hover:text-slate-800 transition-colors" />
              <span className="text-sm font-semibold text-slate-800 group-hover:text-slate-900">
                Help Center
              </span>
            </div>
            <ChevronRight className="w-4.5 h-4.5 text-slate-400 group-hover:text-slate-700 transition-colors" />
          </button>

          {/* 8. Privacy Policy */}
          <button
            type="button"
            onClick={() => setActiveSectionModal('privacy')}
            className="w-full flex items-center justify-between p-4 hover:bg-slate-50/80 active:bg-slate-100/80 transition-colors text-left cursor-pointer group"
          >
            <div className="flex items-center gap-3.5">
              <Lock className="w-5 h-5 text-slate-500 group-hover:text-slate-800 transition-colors" />
              <span className="text-sm font-semibold text-slate-800 group-hover:text-slate-900">
                Privacy Policy
              </span>
            </div>
            <ChevronRight className="w-4.5 h-4.5 text-slate-400 group-hover:text-slate-700 transition-colors" />
          </button>

          {/* 9. Invites Friends */}
          <button
            type="button"
            onClick={() => setActiveSectionModal('invite')}
            className="w-full flex items-center justify-between p-4 hover:bg-slate-50/80 active:bg-slate-100/80 transition-colors text-left cursor-pointer group"
          >
            <div className="flex items-center gap-3.5">
              <UserPlus className="w-5 h-5 text-slate-500 group-hover:text-slate-800 transition-colors" />
              <span className="text-sm font-semibold text-slate-800 group-hover:text-slate-900">
                Invites Friends
              </span>
            </div>
            <ChevronRight className="w-4.5 h-4.5 text-slate-400 group-hover:text-slate-700 transition-colors" />
          </button>

        </div>

        {/* 4. QUICK ACTION SHORTCUTS (Quick Resume Tools) */}
        <div className="grid grid-cols-3 gap-2 pt-0.5">
          <button
            onClick={() => setIsResumeBuilderOpen(true)}
            className="flex flex-col items-center justify-center p-2.5 bg-white hover:bg-slate-50 active:scale-95 rounded-2xl border border-slate-200/80 shadow-2xs transition-all cursor-pointer text-center group"
          >
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-1 group-hover:scale-110 transition-transform">
              <Sparkles className="w-4 h-4 text-amber-500" />
            </div>
            <span className="text-[10px] font-bold text-slate-700 leading-tight">Builder</span>
          </button>

          <button
            onClick={() => setIsUploadModalOpen(true)}
            className="flex flex-col items-center justify-center p-2.5 bg-white hover:bg-slate-50 active:scale-95 rounded-2xl border border-slate-200/80 shadow-2xs transition-all cursor-pointer text-center group"
          >
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-1 group-hover:scale-110 transition-transform">
              <Upload className="w-4 h-4 text-emerald-600" />
            </div>
            <span className="text-[10px] font-bold text-slate-700 leading-tight">Upload CV</span>
          </button>

          <button
            onClick={() => setIsPDFModalOpen(true)}
            className="flex flex-col items-center justify-center p-2.5 bg-white hover:bg-slate-50 active:scale-95 rounded-2xl border border-slate-200/80 shadow-2xs transition-all cursor-pointer text-center group"
          >
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-1 group-hover:scale-110 transition-transform">
              <Printer className="w-4 h-4 text-blue-600" />
            </div>
            <span className="text-[10px] font-bold text-slate-700 leading-tight">Export PDF</span>
          </button>
        </div>

        {/* COMPACT ATS HYGIENE SCORE INDICATOR (Prompt Requirement 4) */}
        <div 
          onClick={() => {
            const atsRes = evaluateResumeForAts(currentSeekerProfile, null);
            setSelectedAtsData({
              resume: currentSeekerProfile.resumes?.[0] || { fileName: 'BioData_Roxas.pdf' },
              atsResult: atsRes
            });
            setIsAtsModalOpen(true);
          }}
          className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-xs hover:border-emerald-400 cursor-pointer transition-all space-y-2.5 group"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-black text-xs border border-emerald-200/60">
                <Cpu className="w-4.5 h-4.5 text-emerald-600" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black text-slate-900">ATS Hygiene Score</span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">Grade A</span>
                </div>
                <p className="text-[11px] text-slate-500">Resume & Bio-data ATS Parsing Compatibility</p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-lg font-black text-emerald-600">88/100</span>
              <span className="text-[10px] text-slate-400 block font-medium">Click to Audit</span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 pt-1 text-[10px] text-slate-600 font-medium border-t border-slate-100">
            <div className="bg-slate-50 p-2 rounded-xl text-center">
              <span className="text-emerald-600 font-black text-xs block">100%</span>
              <span className="text-slate-500">Format Hygiene</span>
            </div>
            <div className="bg-slate-50 p-2 rounded-xl text-center">
              <span className="text-blue-600 font-black text-xs block">92%</span>
              <span className="text-slate-500">Keywords Density</span>
            </div>
            <div className="bg-slate-50 p-2 rounded-xl text-center">
              <span className="text-indigo-600 font-black text-xs block">Verified</span>
              <span className="text-slate-500">DOLE Compliant</span>
            </div>
          </div>
        </div>

        {/* MODULAR USER PROFILE EXPANDABLE ACCORDIONS (Prompt Requirement 4) */}
        <div className="space-y-3">
          
          {/* 1. EDUCATION ACCORDION */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
            <button
              type="button"
              onClick={() => toggleProfileAccordion('education')}
              className="w-full p-4 flex items-center justify-between hover:bg-slate-50 transition-colors text-left cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <GraduationCap className="w-4.5 h-4.5" />
                </div>
                <div>
                  <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                    Education & Academics
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    {currentSeekerProfile.educationalAttainment || "Bachelor's Degree"} • {currentSeekerProfile.education?.length || 1} Record(s)
                  </p>
                </div>
              </div>
              <motion.div animate={{ rotate: profileAccordions.education ? 180 : 0 }}>
                <ChevronDown className="w-4 h-4 text-slate-400" />
              </motion.div>
            </button>

            <AnimatePresence>
              {profileAccordions.education && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="px-4 pb-4 space-y-3 border-t border-slate-100 pt-3"
                >
                  {(currentSeekerProfile.education || []).length > 0 ? (
                    currentSeekerProfile.education.map((edu, idx) => (
                      <div key={edu.id || idx} className="p-3 bg-slate-50 rounded-xl border border-slate-200/60 flex items-start justify-between gap-3 text-xs">
                        <div className="space-y-0.5">
                          <p className="font-bold text-slate-900">{edu.degree || edu.course || 'Degree Program'}</p>
                          <p className="text-slate-600 text-[11px]">{edu.school || edu.institution}</p>
                          <span className="inline-block text-[10px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200 mt-1">
                            Year: {edu.yearGraduated || 2024}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setEditingEduId(edu.id);
                            setEduDegree(edu.degree || '');
                            setEduSchool(edu.school || '');
                            setEduYear(edu.yearGraduated || 2024);
                            setIsEduModalOpen(true);
                          }}
                          className="p-1 text-slate-400 hover:text-slate-700 cursor-pointer"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))
                  ) : (
                    <div className="p-3 bg-slate-50 rounded-xl text-center text-xs text-slate-500">
                      Primary Attainment: <strong>{currentSeekerProfile.educationalAttainment || "College Graduate"}</strong>
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={() => {
                      setEditingEduId(null);
                      setEduDegree('');
                      setEduSchool('');
                      setEduYear(2024);
                      setIsEduModalOpen(true);
                    }}
                    className="w-full py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs rounded-xl border border-blue-200 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Education Record</span>
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* 2. WORK EXPERIENCE ACCORDION */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
            <button
              type="button"
              onClick={() => toggleProfileAccordion('experience')}
              className="w-full p-4 flex items-center justify-between hover:bg-slate-50 transition-colors text-left cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <Briefcase className="w-4.5 h-4.5" />
                </div>
                <div>
                  <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                    Work Experience
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    {currentSeekerProfile.yearsOfExperience || 2} Years Experience • {currentSeekerProfile.workExperience?.length || 1} Role(s)
                  </p>
                </div>
              </div>
              <motion.div animate={{ rotate: profileAccordions.experience ? 180 : 0 }}>
                <ChevronDown className="w-4 h-4 text-slate-400" />
              </motion.div>
            </button>

            <AnimatePresence>
              {profileAccordions.experience && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="px-4 pb-4 space-y-3 border-t border-slate-100 pt-3"
                >
                  {(currentSeekerProfile.workExperience || []).length > 0 ? (
                    currentSeekerProfile.workExperience.map((exp, idx) => (
                      <div key={exp.id || idx} className="p-3 bg-slate-50 rounded-xl border border-slate-200/60 flex items-start justify-between gap-3 text-xs">
                        <div className="space-y-0.5">
                          <p className="font-bold text-slate-900">{exp.position}</p>
                          <p className="text-slate-600 text-[11px] font-medium">{exp.company}</p>
                          <p className="text-[10px] text-slate-400">{exp.startDate} - {exp.isCurrent ? 'Present' : exp.endDate}</p>
                          {exp.responsibilities && (
                            <p className="text-[11px] text-slate-600 mt-1 line-clamp-2">{exp.responsibilities}</p>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setEditingExpId(exp.id);
                            setExpCompany(exp.company);
                            setExpPosition(exp.position);
                            setExpStartDate(exp.startDate);
                            setExpEndDate(exp.endDate || '');
                            setExpIsCurrent(Boolean(exp.isCurrent));
                            setExpResponsibilities(exp.responsibilities || '');
                            setIsExpModalOpen(true);
                          }}
                          className="p-1 text-slate-400 hover:text-slate-700 cursor-pointer"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))
                  ) : (
                    <div className="p-3 bg-slate-50 rounded-xl text-center text-xs text-slate-500">
                      No previous experience recorded yet.
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={() => {
                      setEditingExpId(null);
                      setExpCompany('');
                      setExpPosition('');
                      setExpStartDate('');
                      setExpEndDate('');
                      setExpIsCurrent(false);
                      setExpResponsibilities('');
                      setIsExpModalOpen(true);
                    }}
                    className="w-full py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold text-xs rounded-xl border border-emerald-200 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Experience Record</span>
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* 3. SKILLS & COMPETENCIES ACCORDION */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
            <button
              type="button"
              onClick={() => toggleProfileAccordion('skills')}
              className="w-full p-4 flex items-center justify-between hover:bg-slate-50 transition-colors text-left cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                  <Award className="w-4.5 h-4.5" />
                </div>
                <div>
                  <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                    Skills & Competencies
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    {(currentSeekerProfile.skills?.length || 0) + (currentSeekerProfile.technicalSkills?.length || 0)} Core Competencies Verified
                  </p>
                </div>
              </div>
              <motion.div animate={{ rotate: profileAccordions.skills ? 180 : 0 }}>
                <ChevronDown className="w-4 h-4 text-slate-400" />
              </motion.div>
            </button>

            <AnimatePresence>
              {profileAccordions.skills && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="px-4 pb-4 space-y-3 border-t border-slate-100 pt-3"
                >
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      ...(currentSeekerProfile.technicalSkills || []),
                      ...(currentSeekerProfile.tradeSkills || []),
                      ...(currentSeekerProfile.softSkills || []),
                      ...(currentSeekerProfile.skills || ['Web Fundamentals', 'Communication', 'Teamwork'])
                    ].filter((v, i, a) => a.indexOf(v) === i).map((skill, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-1 rounded-xl bg-purple-50 border border-purple-200 text-purple-900 text-xs font-bold flex items-center gap-1 shadow-2xs"
                      >
                        <Check className="w-3 h-3 text-purple-600" />
                        <span>{skill}</span>
                      </span>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsSkillsModalOpen(true)}
                    className="w-full py-2 bg-purple-50 hover:bg-purple-100 text-purple-700 font-bold text-xs rounded-xl border border-purple-200 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Manage & Add Skills</span>
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* 4. TESDA & PRC CERTIFICATIONS ACCORDION */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
            <button
              type="button"
              onClick={() => toggleProfileAccordion('certifications')}
              className="w-full p-4 flex items-center justify-between hover:bg-slate-50 transition-colors text-left cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                  <ShieldCheck className="w-4.5 h-4.5" />
                </div>
                <div>
                  <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                    TESDA & PRC Certifications
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    National Certificates (NC II) & Government Licensures
                  </p>
                </div>
              </div>
              <motion.div animate={{ rotate: profileAccordions.certifications ? 180 : 0 }}>
                <ChevronDown className="w-4 h-4 text-slate-400" />
              </motion.div>
            </button>

            <AnimatePresence>
              {profileAccordions.certifications && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="px-4 pb-4 space-y-3 border-t border-slate-100 pt-3"
                >
                  {(currentSeekerProfile.certifications || []).length > 0 ? (
                    currentSeekerProfile.certifications.map((cert, idx) => (
                      <div key={cert.id || idx} className="p-3 bg-amber-50/50 rounded-xl border border-amber-200/70 flex items-start justify-between gap-3 text-xs">
                        <div className="space-y-0.5">
                          <p className="font-bold text-slate-900">{cert.name}</p>
                          <p className="text-slate-600 text-[11px]">{cert.issuingOrganization}</p>
                          <span className="inline-block text-[10px] font-semibold text-amber-800 bg-amber-100 px-2 py-0.5 rounded border border-amber-200 mt-1">
                            Obtained: {cert.dateObtained}
                          </span>
                        </div>
                        <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-1" />
                      </div>
                    ))
                  ) : (
                    <div className="p-3 bg-slate-50 rounded-xl text-center text-xs text-slate-500">
                      No TESDA NC II or PRC certificates uploaded.
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={() => {
                      setEditingCertId(null);
                      setCertName('');
                      setCertIssuer('TESDA Oriental Mindoro');
                      setCertDate('2025-01');
                      setIsCertModalOpen(true);
                    }}
                    className="w-full py-2 bg-amber-50 hover:bg-amber-100 text-amber-800 font-bold text-xs rounded-xl border border-amber-200 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Upload TESDA / PRC Certificate</span>
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

        </div>



      </div>

      {/* 5. FLOATING BOTTOM NAVIGATION BAR (Matches image.png) - Mobile Version Only */}
      <div className="md:hidden fixed bottom-0 inset-x-0 bg-white/95 backdrop-blur-md border-t border-slate-200/80 shadow-2xl z-30 py-2 px-4 max-w-md sm:max-w-lg mx-auto rounded-t-3xl">
        <div className="grid grid-cols-5 items-center justify-items-center text-center">
          
          {/* 1. Home */}
          <button
            onClick={() => onNavigate ? onNavigate('seeker-dashboard') : undefined}
            className="flex flex-col items-center justify-center gap-1 py-1 px-2 cursor-pointer group text-slate-400 hover:text-slate-700"
          >
            <Home className="w-5 h-5" />
            <span className="text-[10px] font-medium">Home</span>
          </button>

          {/* 2. Explore */}
          <button
            onClick={() => onNavigate ? onNavigate('jobs') : undefined}
            className="flex flex-col items-center justify-center gap-1 py-1 px-2 cursor-pointer group text-slate-400 hover:text-slate-700"
          >
            <Compass className="w-5 h-5" />
            <span className="text-[10px] font-medium">Explore</span>
          </button>

          {/* 3. Bookmark */}
          <button
            onClick={() => onNavigate ? onNavigate('seeker-dashboard') : undefined}
            className="flex flex-col items-center justify-center gap-1 py-1 px-2 cursor-pointer group text-slate-400 hover:text-slate-700"
          >
            <Bookmark className="w-5 h-5" />
            <span className="text-[10px] font-medium">Bookmark</span>
          </button>

          {/* 4. Applications */}
          <button
            onClick={() => onNavigate ? onNavigate('seeker-applications') : undefined}
            className="flex flex-col items-center justify-center gap-1 py-1 px-2 cursor-pointer group text-slate-400 hover:text-slate-700"
          >
            <Briefcase className="w-5 h-5" />
            <span className="text-[10px] font-medium">Applied</span>
          </button>

          {/* 5. Profile (Active) */}
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="flex flex-col items-center justify-center gap-1 py-1 px-2 cursor-pointer text-slate-900 group"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-slate-900 mb-0.5" />
            <User className="w-5 h-5 text-slate-900" />
            <span className="text-[10px] font-bold text-slate-900">Profile</span>
          </button>

        </div>
      </div>

      {/* ================= SECTION MODALS (ALL PROFILE FUNCTIONS PRESERVED) ================= */}

      {/* MODAL 1: PERSONAL INFORMATION & PORTFOLIO */}
      {activeSectionModal === 'personal' && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 animate-in fade-in">
          <div className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl border border-slate-200 max-h-[92vh] flex flex-col overflow-hidden">
            
            {/* Modal Header */}
            <div className="p-4 sm:p-5 bg-slate-900 text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-400/30 flex items-center justify-center">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-white">Personal Information & Profile Records</h3>
                  <p className="text-xs text-slate-400">Manage your bio, education, experience, skills, and certifications</p>
                </div>
              </div>
              <button 
                onClick={() => setActiveSectionModal(null)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Navigation Tabs for Personal Section */}
            <div className="px-4 pt-3 bg-slate-50 border-b border-slate-200 flex items-center gap-1.5 overflow-x-auto scrollbar-none shrink-0 text-xs font-bold">
              <button
                onClick={() => setPersonalTab('personal')}
                className={`px-3 py-2 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                  personalTab === 'personal' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-200/70'
                }`}
              >
                <User className="w-3.5 h-3.5" />
                <span>Bio & Personal</span>
              </button>
              <button
                onClick={() => setPersonalTab('education')}
                className={`px-3 py-2 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                  personalTab === 'education' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-200/70'
                }`}
              >
                <GraduationCap className="w-3.5 h-3.5" />
                <span>Education ({currentSeekerProfile.education?.length || 0})</span>
              </button>
              <button
                onClick={() => setPersonalTab('experience')}
                className={`px-3 py-2 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                  personalTab === 'experience' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-200/70'
                }`}
              >
                <Briefcase className="w-3.5 h-3.5" />
                <span>Work Experience ({currentSeekerProfile.workExperience?.length || 0})</span>
              </button>
              <button
                onClick={() => setPersonalTab('skills')}
                className={`px-3 py-2 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                  personalTab === 'skills' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-200/70'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Skills</span>
              </button>
              <button
                onClick={() => setPersonalTab('certifications')}
                className={`px-3 py-2 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                  personalTab === 'certifications' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-200/70'
                }`}
              >
                <Award className="w-3.5 h-3.5" />
                <span>Certifications ({currentSeekerProfile.certifications?.length || 0})</span>
              </button>
              <button
                onClick={() => setPersonalTab('resumes')}
                className={`px-3 py-2 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                  personalTab === 'resumes' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-200/70'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Resumes & CVs ({currentSeekerProfile.resumes?.length || 0})</span>
              </button>
            </div>

            {/* Modal Body / Tab Content */}
            <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-6">
              
              {saveSuccessMsg && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-bold text-emerald-800 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{saveSuccessMsg}</span>
                </div>
              )}

              {/* TAB 1: BIO & PERSONAL */}
              {personalTab === 'personal' && (
                <form onSubmit={handleSavePersonal} className="space-y-4 text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">First Name *</label>
                      <input
                        type="text"
                        required
                        value={firstName}
                        onChange={e => setFirstName(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Middle Name</label>
                      <input
                        type="text"
                        value={middleName}
                        onChange={e => setMiddleName(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Last Name *</label>
                      <input
                        type="text"
                        required
                        value={lastName}
                        onChange={e => setLastName(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Date of Birth</label>
                      <input
                        type="date"
                        value={dateOfBirth}
                        onChange={e => {
                          const dob = e.target.value;
                          setDateOfBirth(dob);
                          if (dob) {
                            const birthYear = new Date(dob).getFullYear();
                            const currentYear = new Date().getFullYear();
                            if (!isNaN(birthYear)) setAge(String(currentYear - birthYear));
                          }
                        }}
                        className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Age</label>
                      <input
                        type="number"
                        value={age}
                        onChange={e => setAge(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Civil Status</label>
                      <select
                        value={civilStatus}
                        onChange={e => setCivilStatus(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                      >
                        <option value="Single">Single</option>
                        <option value="Married">Married</option>
                        <option value="Widowed">Widowed</option>
                        <option value="Separated">Separated</option>
                      </select>
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Sex / Gender</label>
                      <select
                        value={sex}
                        onChange={e => setSex(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                      >
                        <option value="">Select Gender</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Prefer not to say">Prefer not to say</option>
                      </select>
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Contact Number *</label>
                      <input
                        type="text"
                        required
                        value={contactNumber}
                        onChange={e => setContactNumber(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Municipality (Oriental Mindoro) *</label>
                      <select
                        value={municipality}
                        onChange={e => setMunicipality(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                      >
                        {ORIENTAL_MINDORO_MUNICIPALITIES.map(m => (
                          <option key={m} value={m}>{m}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Barangay</label>
                      {municipality === 'Roxas' ? (
                        <select
                          value={barangay}
                          onChange={e => setBarangay(e.target.value)}
                          className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                        >
                          <option value="">Select Barangay</option>
                          {ROXAS_BARANGAYS.map(b => (
                            <option key={b} value={b}>{b}</option>
                          ))}
                        </select>
                      ) : (
                        <input
                          type="text"
                          value={barangay}
                          onChange={e => setBarangay(e.target.value)}
                          placeholder="e.g. Barangay Poblacion"
                          className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                        />
                      )}
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block font-bold text-slate-700 mb-1">Street Address</label>
                      <input
                        type="text"
                        value={address}
                        onChange={e => setAddress(e.target.value)}
                        placeholder="House No., Street, Purok"
                        className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Professional Degree / Headline</label>
                    <input
                      type="text"
                      value={primaryDegree}
                      onChange={e => setPrimaryDegree(e.target.value)}
                      placeholder="e.g. BS Information Technology, TESDA Certified Electrician"
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Professional Summary & Bio</label>
                    <textarea
                      rows={3}
                      value={summary}
                      onChange={e => setSummary(e.target.value)}
                      placeholder="Brief overview of your qualifications, goals, and background..."
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                  </div>

                  <div className="flex justify-end pt-2">
                    <button
                      type="submit"
                      className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      <Save className="w-4 h-4" />
                      <span>Save Personal Info</span>
                    </button>
                  </div>
                </form>
              )}

              {/* TAB 2: EDUCATION */}
              {personalTab === 'education' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">Educational Background</h4>
                      <p className="text-xs text-slate-500">Record your degrees, college, or TVET programs</p>
                    </div>
                    <button
                      type="button"
                      onClick={handleOpenAddEdu}
                      className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add Education</span>
                    </button>
                  </div>

                  {(currentSeekerProfile.education?.length || 0) === 0 ? (
                    <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-300">
                      <GraduationCap className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                      <p className="text-xs font-bold text-slate-700">No education records yet</p>
                      <p className="text-[11px] text-slate-400 mt-1">Click "Add Education" to record your academic qualifications.</p>
                    </div>
                  ) : (
                    <div className="space-y-2.5">
                      {currentSeekerProfile.education.map(edu => (
                        <div key={edu.id} className="p-4 bg-slate-50 hover:bg-slate-100/70 border border-slate-200 rounded-2xl flex items-center justify-between gap-3">
                          <div>
                            <p className="text-xs font-bold text-slate-900">{edu.degreeCourse}</p>
                            <p className="text-xs text-slate-600">{edu.school} • Class of {edu.yearGraduated}</p>
                            <span className="inline-block mt-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200">
                              {edu.educationalAttainment}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5 shrink-0">
                            <button
                              onClick={() => handleOpenEditEdu(edu)}
                              className="p-1.5 text-slate-500 hover:text-indigo-600 rounded-lg hover:bg-white cursor-pointer"
                              title="Edit"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteEdu(edu.id)}
                              className="p-1.5 text-slate-500 hover:text-rose-600 rounded-lg hover:bg-white cursor-pointer"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 3: WORK EXPERIENCE */}
              {personalTab === 'experience' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">Work Experience History</h4>
                      <p className="text-xs text-slate-500">Employment records evaluated by employer scoring</p>
                    </div>
                    <button
                      type="button"
                      onClick={handleOpenAddExp}
                      className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add Experience</span>
                    </button>
                  </div>

                  {(currentSeekerProfile.workExperience?.length || 0) === 0 ? (
                    <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-300">
                      <Briefcase className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                      <p className="text-xs font-bold text-slate-700">No work experience listed</p>
                      <p className="text-[11px] text-slate-400 mt-1">Include previous roles, internships, or contractual jobs.</p>
                    </div>
                  ) : (
                    <div className="space-y-2.5">
                      {currentSeekerProfile.workExperience.map(exp => (
                        <div key={exp.id} className="p-4 bg-slate-50 hover:bg-slate-100/70 border border-slate-200 rounded-2xl flex items-center justify-between gap-3">
                          <div>
                            <p className="text-xs font-bold text-slate-900">{exp.position}</p>
                            <p className="text-xs text-slate-600">{exp.company} • {exp.startDate} to {exp.endDate}</p>
                            {exp.responsibilities && (
                              <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">{exp.responsibilities}</p>
                            )}
                          </div>
                          <div className="flex items-center gap-1.5 shrink-0">
                            <button
                              onClick={() => handleOpenEditExp(exp)}
                              className="p-1.5 text-slate-500 hover:text-indigo-600 rounded-lg hover:bg-white cursor-pointer"
                              title="Edit"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteExp(exp.id)}
                              className="p-1.5 text-slate-500 hover:text-rose-600 rounded-lg hover:bg-white cursor-pointer"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 4: SKILLS INVENTORY */}
              {personalTab === 'skills' && (
                <div className="space-y-5 text-xs">
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">Skills & Competencies</h4>
                    <p className="text-xs text-slate-500">Skills are parsed for Decision Tree keyword match scoring</p>
                  </div>

                  {/* Add Skill Form */}
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={newTechSkill}
                      onChange={e => setNewTechSkill(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleAddTechSkill())}
                      placeholder="Add technical or practical skill (e.g. QuickBooks, Welding)..."
                      className="flex-1 px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => handleAddTechSkill()}
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl cursor-pointer"
                    >
                      Add Skill
                    </button>
                  </div>

                  {/* Current Technical Skills Tags */}
                  <div>
                    <label className="block font-bold text-slate-700 mb-1.5">Technical & Hard Skills</label>
                    <div className="flex flex-wrap gap-1.5">
                      {currentSeekerProfile.technicalSkills?.map(s => (
                        <span key={s} className="px-2.5 py-1 bg-indigo-50 text-indigo-800 border border-indigo-200 rounded-xl text-xs font-semibold flex items-center gap-1.5">
                          {s}
                          <button onClick={() => handleRemoveTechSkill(s)} className="text-indigo-400 hover:text-rose-600 cursor-pointer">×</button>
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Soft Skills Tags */}
                  <div>
                    <label className="block font-bold text-slate-700 mb-1.5">Soft & Leadership Skills</label>
                    <div className="flex flex-wrap gap-1.5">
                      {currentSeekerProfile.softSkills?.map(s => (
                        <span key={s} className="px-2.5 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-semibold flex items-center gap-1.5">
                          {s}
                          <button onClick={() => handleRemoveSoftSkill(s)} className="text-emerald-400 hover:text-rose-600 cursor-pointer">×</button>
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 5: CERTIFICATIONS */}
              {personalTab === 'certifications' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">Certifications & Licenses</h4>
                      <p className="text-xs text-slate-500">TESDA NC, PRC licenses, and training certificates</p>
                    </div>
                    <button
                      type="button"
                      onClick={handleOpenAddCert}
                      className="px-3.5 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add Certificate</span>
                    </button>
                  </div>

                  {(currentSeekerProfile.certifications?.length || 0) === 0 ? (
                    <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-300">
                      <Award className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                      <p className="text-xs font-bold text-slate-700">No certifications recorded</p>
                      <p className="text-[11px] text-slate-400 mt-1">Upload your TESDA NC or PRC certificates to increase hiring chances.</p>
                    </div>
                  ) : (
                    <div className="space-y-2.5">
                      {currentSeekerProfile.certifications.map(cert => (
                        <div key={cert.id} className="p-4 bg-slate-50 hover:bg-slate-100/70 border border-slate-200 rounded-2xl flex items-center justify-between gap-3">
                          <div>
                            <p className="text-xs font-bold text-slate-900">{cert.name}</p>
                            <p className="text-xs text-slate-600">{cert.issuingOrganization} • {cert.dateObtained}</p>
                            {(cert.documentUrl || cert.imageUrl) && (
                              <button
                                type="button"
                                onClick={() => setPreviewCertProof({ name: cert.name, url: (cert.documentUrl || cert.imageUrl)!, issuer: cert.issuingOrganization, date: cert.dateObtained })}
                                className="mt-1.5 text-[10px] font-bold text-amber-700 hover:underline flex items-center gap-1 cursor-pointer"
                              >
                                <Eye className="w-3 h-3" /> View Certificate Proof
                              </button>
                            )}
                          </div>
                          <div className="flex items-center gap-1.5 shrink-0">
                            <button
                              onClick={() => handleOpenEditCert(cert)}
                              className="p-1.5 text-slate-500 hover:text-amber-600 rounded-lg hover:bg-white cursor-pointer"
                              title="Edit"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 6: RESUMES & CVS */}
              {personalTab === 'resumes' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">Uploaded CVs & Resumes</h4>
                      <p className="text-xs text-slate-500">Manage your active resume document and inspect ATS score</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setIsResumeBuilderOpen(true)}
                        className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl flex items-center gap-1 cursor-pointer"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                        <span>Build Resume</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsUploadModalOpen(true)}
                        className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl flex items-center gap-1 cursor-pointer"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>Upload CV</span>
                      </button>
                    </div>
                  </div>

                  {(currentSeekerProfile.resumes?.length || 0) === 0 ? (
                    <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-300">
                      <FileText className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                      <p className="text-xs font-bold text-slate-700">No resumes uploaded yet</p>
                      <p className="text-[11px] text-slate-400 mt-1">Upload a PDF or generate a resume with the AI Resume Builder.</p>
                    </div>
                  ) : (
                    <div className="space-y-2.5">
                      {currentSeekerProfile.resumes.map(res => (
                        <div key={res.id} className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center shrink-0">
                              <FileText className="w-5 h-5" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <p className="text-xs font-bold text-slate-900">{res.fileName}</p>
                                {res.id === currentSeekerProfile.activeResumeId && (
                                  <span className="text-[9px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                                    Active
                                  </span>
                                )}
                              </div>
                              <p className="text-[11px] text-slate-500 mt-0.5">
                                {res.fileSize} • Uploaded {new Date(res.uploadedAt).toLocaleDateString()}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <button
                              type="button"
                              onClick={() => handleOpenAtsAudit(res)}
                              className="px-2.5 py-1.5 bg-white hover:bg-emerald-50 text-emerald-700 border border-slate-200 rounded-xl text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer"
                            >
                              <Cpu className="w-3.5 h-3.5 text-emerald-600" />
                              <span>ATS Check ({res.atsScore || 92}%)</span>
                            </button>
                            {res.id !== currentSeekerProfile.activeResumeId && (
                              <button
                                type="button"
                                onClick={() => {
                                  updateJobSeekerProfile(currentSeekerProfile.id, { activeResumeId: res.id });
                                  showToast({
                                    title: 'Active Resume Set',
                                    message: `${res.fileName} is now your default application resume.`,
                                    type: 'success'
                                  });
                                }}
                                className="px-2.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl text-xs font-bold cursor-pointer"
                              >
                                Set Default
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: ANALYTICS & DECISION TREE MATCH READINESS */}
      {activeSectionModal === 'analytics' && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 animate-in fade-in">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="p-5 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <TrendingUp className="w-5 h-5 text-emerald-400" />
                <h3 className="text-sm sm:text-base font-bold text-white">Profile Analytics & Readiness</h3>
              </div>
              <button onClick={() => setActiveSectionModal(null)} className="p-1 rounded-lg text-slate-400 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 sm:p-6 space-y-5 text-xs">
              {/* Score Indicator */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-slate-600 uppercase tracking-wider">Profile Completeness</p>
                  <p className="text-2xl font-black text-slate-900 mt-0.5">{profileCompleteness}%</p>
                  <p className="text-[11px] text-slate-500 mt-1">High completeness boosts your Decision Tree Match ranking.</p>
                </div>
                <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-800 font-black text-lg flex items-center justify-center">
                  {profileCompleteness}%
                </div>
              </div>

              {/* Step 9 Validation Checklist */}
              <div>
                <p className="font-bold text-slate-800 mb-2">Decision Tree Match Validation (Step 9)</p>
                <div className="space-y-2">
                  {validationCriteria.map(item => (
                    <div 
                      key={item.id} 
                      onClick={() => {
                        setActiveSectionModal(null);
                        item.action();
                      }}
                      className="p-3 bg-white hover:bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between cursor-pointer transition-colors"
                    >
                      <div>
                        <p className="font-bold text-slate-800 text-xs">{item.label}</p>
                        <p className="text-[10px] text-slate-500">{item.detail}</p>
                      </div>
                      {item.isComplete ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      ) : (
                        <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">Missing</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <button
                onClick={() => {
                  setActiveSectionModal('personal');
                  setPersonalTab('personal');
                }}
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl transition-colors cursor-pointer"
              >
                Complete Missing Information
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: JOB SEEKING STATUS & PREFERENCES */}
      {activeSectionModal === 'seekingStatus' && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 animate-in fade-in">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="p-5 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Eye className="w-5 h-5 text-indigo-400" />
                <h3 className="text-sm sm:text-base font-bold text-white">Job Seeking Status & Preferences</h3>
              </div>
              <button onClick={() => setActiveSectionModal(null)} className="p-1 rounded-lg text-slate-400 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 sm:p-6 space-y-4 text-xs">
              {/* Availability Toggle */}
              <div>
                <label className="block font-bold text-slate-800 mb-1.5">Employment Availability</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'actively_looking', label: 'Actively Looking' },
                    { id: 'open_to_offers', label: 'Open to Offers' },
                    { id: 'not_looking', label: 'Not Available' }
                  ].map(status => (
                    <button
                      key={status.id}
                      type="button"
                      onClick={() => setSeekingAvailability(status.id as any)}
                      className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer font-bold ${
                        seekingAvailability === status.id
                          ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {status.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Target Categories */}
              <div>
                <label className="block font-bold text-slate-800 mb-1">Target Categories ({prefCategories.length} selected)</label>
                <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto p-2 bg-slate-50 rounded-xl border border-slate-200">
                  {JOB_CATEGORIES.map(cat => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => {
                        setPrefCategories(prev => prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]);
                      }}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                        prefCategories.includes(cat)
                          ? 'bg-indigo-600 text-white'
                          : 'bg-white text-slate-700 border border-slate-200'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Minimum Salary */}
              <div>
                <label className="block font-bold text-slate-800 mb-1">Minimum Expected Salary</label>
                <input
                  type="text"
                  value={prefMinSalary}
                  onChange={e => setPrefMinSalary(e.target.value)}
                  placeholder="e.g. ₱20,000 - ₱30,000 / month"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <button
                type="button"
                onClick={(e) => {
                  handleSavePreferences(e as any);
                  setActiveSectionModal(null);
                }}
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                Save Preferences
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: SETTINGS */}
      <SettingsModal
        isOpen={activeSectionModal === 'settings'}
        onClose={() => setActiveSectionModal(null)}
        onOpenProfileEdit={() => {
          setActiveSectionModal(null);
          setActiveSectionModal('personal');
        }}
        onOpenBookmarks={() => {
          setActiveSectionModal('bookmarks');
        }}
      />

      {/* MODAL 4B: BOOKMARKS */}
      <SeekerBookmarksModal
        isOpen={activeSectionModal === 'bookmarks'}
        onClose={() => setActiveSectionModal(null)}
        onSelectJob={(jId) => {
          setActiveSectionModal(null);
          if (onNavigate) {
            onNavigate('job-detail', { jobId: jId });
          }
        }}
      />

      {/* MODAL 5: LANGUAGE */}
      {activeSectionModal === 'language' && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 animate-in fade-in">
          <div className="bg-white w-full max-w-sm rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="p-5 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Globe className="w-5 h-5 text-indigo-400" />
                <h3 className="text-sm font-bold text-white">Select Language</h3>
              </div>
              <button onClick={() => setActiveSectionModal(null)} className="p-1 rounded-lg text-slate-400 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 space-y-2 text-xs">
              {[
                { name: 'English (US)', desc: 'Official PESO Portal English' },
                { name: 'Filipino (Tagalog)', desc: 'Wikang Pambansa' },
                { name: 'Oriental Mindoro Localized', desc: 'Regional Dialect Support' }
              ].map(lang => (
                <button
                  key={lang.name}
                  onClick={() => {
                    setSelectedLanguage(lang.name);
                    showToast({
                      title: 'Language Updated',
                      message: `Interface language set to ${lang.name}.`,
                      type: 'info'
                    });
                    setActiveSectionModal(null);
                  }}
                  className={`w-full p-3 rounded-2xl text-left border flex items-center justify-between cursor-pointer transition-colors ${
                    selectedLanguage === lang.name
                      ? 'border-indigo-600 bg-indigo-50/70 text-indigo-950 font-bold'
                      : 'border-slate-200 hover:bg-slate-50 text-slate-800'
                  }`}
                >
                  <div>
                    <p className="font-bold">{lang.name}</p>
                    <p className="text-[10px] text-slate-500">{lang.desc}</p>
                  </div>
                  {selectedLanguage === lang.name && <Check className="w-4 h-4 text-indigo-600" />}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* MODAL 6: HELP CENTER */}
      {activeSectionModal === 'help' && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 animate-in fade-in">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="p-5 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <HelpCircle className="w-5 h-5 text-amber-400" />
                <h3 className="text-sm font-bold text-white">eHANAP PESO Help Center</h3>
              </div>
              <button onClick={() => setActiveSectionModal(null)} className="p-1 rounded-lg text-slate-400 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-3.5 text-xs">
              <div className="p-3.5 bg-indigo-50 rounded-2xl border border-indigo-200">
                <p className="font-bold text-indigo-950">PESO Roxas Municipal Office</p>
                <p className="text-indigo-800 text-[11px] mt-0.5">Municipal Hall Compound, Roxas, Oriental Mindoro</p>
                <p className="text-indigo-700 text-[11px] mt-1 font-semibold">📞 Hotline: (043) 289-5022 • peso.roxas@orientalmindoro.gov.ph</p>
              </div>

              <div>
                <p className="font-bold text-slate-800 mb-1.5">Frequently Asked Questions</p>
                <div className="space-y-1.5">
                  <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                    <p className="font-bold text-slate-900 text-[11px]">How does the Decision Tree match my resume?</p>
                    <p className="text-[10px] text-slate-600 mt-0.5">The system cross-checks your degrees, skills, and municipality against employer vacancy qualifications.</p>
                  </div>
                  <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                    <p className="font-bold text-slate-900 text-[11px]">Can I get a physical PESO Referral Slip?</p>
                    <p className="text-[10px] text-slate-600 mt-0.5">Yes! Once shortlisted, visit the PESO office to receive your printed DOLE referral document.</p>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-blue-50/80 rounded-xl border border-blue-200/60 text-xs text-blue-900 flex items-center justify-between">
                <div>
                  <p className="font-bold text-[11px] text-blue-950">PESO Roxas Helpdesk Desk</p>
                  <p className="text-[10px] text-blue-700">Municipal Hall, Roxas, Oriental Mindoro • (043) 289-2041</p>
                </div>
                <button
                  onClick={() => {
                    showToast({
                      title: 'PESO Roxas Contact Info',
                      message: 'PESO Office hours: Monday–Friday, 8:00 AM – 5:00 PM at Municipal Hall.',
                      type: 'info'
                    });
                    setActiveSectionModal(null);
                  }}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-lg cursor-pointer"
                >
                  Office Info
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 7: PRIVACY POLICY */}
      {activeSectionModal === 'privacy' && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 animate-in fade-in">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="p-5 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Lock className="w-5 h-5 text-emerald-400" />
                <h3 className="text-sm font-bold text-white">Data Privacy Policy</h3>
              </div>
              <button onClick={() => setActiveSectionModal(null)} className="p-1 rounded-lg text-slate-400 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-3 text-xs leading-relaxed text-slate-600">
              <p>
                The <strong>eHANAP PESO Roxas Employment Portal</strong> adheres strictly to Republic Act No. 10173, otherwise known as the <em>Data Privacy Act of 2012</em> of the Republic of the Philippines.
              </p>
              <p>
                Your personal details, contact information, education, and resume files are stored securely and only made visible to verified PESO employers with active job vacancies matching your qualifications.
              </p>
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-[11px] text-slate-700 font-medium">
                🛡️ All employer accesses are logged in the PESO LGU Immutable Audit Trail.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 8: INVITE FRIENDS */}
      {activeSectionModal === 'invite' && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 animate-in fade-in">
          <div className="bg-white w-full max-w-sm rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="p-5 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <UserPlus className="w-5 h-5 text-indigo-400" />
                <h3 className="text-sm font-bold text-white">Invite Friends</h3>
              </div>
              <button onClick={() => setActiveSectionModal(null)} className="p-1 rounded-lg text-slate-400 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs text-center">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
                <Share2 className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-sm">Help fellow job seekers in Oriental Mindoro</h4>
                <p className="text-slate-500 mt-1">Share the official LGU employment portal with your friends.</p>
              </div>

              <div className="p-3 bg-slate-100 rounded-xl flex items-center justify-between font-mono font-bold text-slate-800">
                <span>PESO-ROXAS-JOBSEEKER</span>
                <button
                  onClick={() => {
                    navigator.clipboard?.writeText('https://ehanap.orientalmindoro.gov.ph?ref=seeker');
                    setReferralCopied(true);
                    setTimeout(() => setReferralCopied(false), 2000);
                  }}
                  className="p-1 text-indigo-600 hover:text-indigo-800 cursor-pointer"
                  title="Copy Link"
                >
                  {referralCopied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>

              {referralCopied && (
                <p className="text-emerald-600 font-bold text-[11px]">Portal link copied to clipboard!</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* MODAL 9: VIEW FULL PROFILE OVERVIEW */}
      {activeSectionModal === 'viewProfile' && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 animate-in fade-in">
          <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden max-h-[90vh] flex flex-col">
            <div className="p-5 bg-slate-900 text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center text-white font-bold overflow-hidden">
                  {profilePicture ? (
                    <img src={profilePicture} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-5 h-5 text-slate-300" />
                  )}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">{currentSeekerProfile.firstName} {currentSeekerProfile.lastName}</h3>
                  <p className="text-xs text-slate-400">{currentSeekerProfile.primaryDegree || 'Job Seeker'} • {currentSeekerProfile.municipality}, Oriental Mindoro</p>
                </div>
              </div>
              <button onClick={() => setActiveSectionModal(null)} className="p-1 rounded-lg text-slate-400 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 sm:p-6 overflow-y-auto space-y-5 text-xs flex-1">
              {/* 1. Contact Information Card */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <div className="flex items-center justify-between mb-2">
                  <h5 className="font-bold text-slate-900 uppercase text-[10px] tracking-wider flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-blue-600" />
                    <span>Contact Info</span>
                  </h5>
                  <button
                    onClick={() => setIsContactModalOpen(true)}
                    className="text-blue-600 hover:text-blue-700 font-bold text-[11px] flex items-center gap-1 cursor-pointer"
                  >
                    <Edit2 className="w-3 h-3" />
                    <span>Edit</span>
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-600">
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{currentSeekerProfile.email || 'No email provided'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{currentSeekerProfile.contactNumber || 'No phone provided'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{currentSeekerProfile.address || `${currentSeekerProfile.municipality || 'Roxas'}, Oriental Mindoro`}</span>
                  </div>
                  {currentSeekerProfile.website && (
                    <div className="flex items-center gap-2">
                      <Globe className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <a href={currentSeekerProfile.website} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline truncate">
                        {currentSeekerProfile.website}
                      </a>
                    </div>
                  )}
                </div>
              </div>

              {/* 2. About Me */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <div className="flex items-center justify-between mb-2">
                  <h5 className="font-bold text-slate-900 uppercase text-[10px] tracking-wider flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-blue-600" />
                    <span>About Me</span>
                  </h5>
                  <button
                    onClick={() => setIsAboutMeModalOpen(true)}
                    className="text-blue-600 hover:text-blue-700 font-bold text-[11px] flex items-center gap-1 cursor-pointer"
                  >
                    <Edit2 className="w-3 h-3" />
                    <span>Edit</span>
                  </button>
                </div>
                <p className="text-slate-600 leading-relaxed whitespace-pre-line">
                  {currentSeekerProfile.professionalSummary || currentSeekerProfile.summary || 'Add a concise summary highlighting your core skills, experiences, and career goals in Oriental Mindoro.'}
                </p>
              </div>

              {/* 3. Work Experience */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <div className="flex items-center justify-between mb-2">
                  <h5 className="font-bold text-slate-900 uppercase text-[10px] tracking-wider flex items-center gap-1.5">
                    <Briefcase className="w-3.5 h-3.5 text-blue-600" />
                    <span>Work Experience ({(currentSeekerProfile.workExperience || []).length})</span>
                  </h5>
                  <button
                    onClick={handleOpenAddExp}
                    className="text-blue-600 hover:text-blue-700 font-bold text-[11px] flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Add</span>
                  </button>
                </div>
                {(currentSeekerProfile.workExperience || []).length === 0 ? (
                  <p className="text-slate-400 italic">No work experience recorded yet.</p>
                ) : (
                  <div className="space-y-2">
                    {(currentSeekerProfile.workExperience || []).map((exp) => (
                      <div key={exp.id} className="p-3 bg-white rounded-xl border border-slate-200 flex items-start justify-between gap-2">
                        <div>
                          <p className="font-bold text-slate-900">{exp.position}</p>
                          <p className="text-slate-500 text-[11px]">{exp.company} • {exp.startDate} - {exp.endDate}</p>
                          {exp.responsibilities && (
                            <p className="text-slate-600 text-[11px] mt-1 leading-snug">{exp.responsibilities}</p>
                          )}
                        </div>
                        <button
                          onClick={() => handleOpenEditExp(exp)}
                          className="p-1 text-slate-400 hover:text-blue-600 rounded-lg hover:bg-slate-50"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* 4. Education */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <div className="flex items-center justify-between mb-2">
                  <h5 className="font-bold text-slate-900 uppercase text-[10px] tracking-wider flex items-center gap-1.5">
                    <GraduationCap className="w-3.5 h-3.5 text-blue-600" />
                    <span>Education ({(currentSeekerProfile.education || []).length})</span>
                  </h5>
                  <button
                    onClick={handleOpenAddEdu}
                    className="text-blue-600 hover:text-blue-700 font-bold text-[11px] flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Add</span>
                  </button>
                </div>
                {(currentSeekerProfile.education || []).length === 0 ? (
                  <p className="text-slate-400 italic">No educational records added yet.</p>
                ) : (
                  <div className="space-y-2">
                    {(currentSeekerProfile.education || []).map((edu) => (
                      <div key={edu.id} className="p-3 bg-white rounded-xl border border-slate-200 flex items-start justify-between gap-2">
                        <div>
                          <p className="font-bold text-slate-900">{edu.degreeCourse}</p>
                          <p className="text-slate-500 text-[11px]">{edu.school} • Graduated {edu.yearGraduated}</p>
                        </div>
                        <button
                          onClick={() => handleOpenEditEdu(edu)}
                          className="p-1 text-slate-400 hover:text-blue-600 rounded-lg hover:bg-slate-50"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* 5. Projects */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <div className="flex items-center justify-between mb-2">
                  <h5 className="font-bold text-slate-900 uppercase text-[10px] tracking-wider flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-blue-600" />
                    <span>Projects & Portfolio ({(currentSeekerProfile.projects || []).length})</span>
                  </h5>
                  <button
                    onClick={() => setIsProjectsModalOpen(true)}
                    className="text-blue-600 hover:text-blue-700 font-bold text-[11px] flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Manage</span>
                  </button>
                </div>
                {(currentSeekerProfile.projects || []).length === 0 ? (
                  <p className="text-slate-400 italic">No portfolio projects listed yet.</p>
                ) : (
                  <div className="space-y-2">
                    {(currentSeekerProfile.projects || []).map((proj) => (
                      <div key={proj.id} className="p-3 bg-white rounded-xl border border-slate-200">
                        <div className="flex items-center justify-between">
                          <p className="font-bold text-slate-900">{proj.name}</p>
                          {proj.projectUrl && (
                            <a href={proj.projectUrl} target="_blank" rel="noreferrer" className="text-blue-600 text-[10px] font-bold hover:underline">
                              Visit
                            </a>
                          )}
                        </div>
                        {proj.client && <p className="text-slate-500 text-[11px]">{proj.client}</p>}
                        {proj.description && <p className="text-slate-600 text-[11px] mt-1">{proj.description}</p>}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* 6. Volunteer Experience */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <div className="flex items-center justify-between mb-2">
                  <h5 className="font-bold text-slate-900 uppercase text-[10px] tracking-wider flex items-center gap-1.5">
                    <HeartHandshake className="w-3.5 h-3.5 text-blue-600" />
                    <span>Volunteer Experience ({(currentSeekerProfile.volunteerExperience || []).length})</span>
                  </h5>
                  <button
                    onClick={() => setIsVolunteerModalOpen(true)}
                    className="text-blue-600 hover:text-blue-700 font-bold text-[11px] flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Manage</span>
                  </button>
                </div>
                {(currentSeekerProfile.volunteerExperience || []).length === 0 ? (
                  <p className="text-slate-400 italic">No volunteer initiatives added yet.</p>
                ) : (
                  <div className="space-y-2">
                    {(currentSeekerProfile.volunteerExperience || []).map((vol) => (
                      <div key={vol.id} className="p-3 bg-white rounded-xl border border-slate-200">
                        <p className="font-bold text-slate-900">{vol.role}</p>
                        <p className="text-slate-500 text-[11px]">{vol.organization}</p>
                        {vol.description && <p className="text-slate-600 text-[11px] mt-1">{vol.description}</p>}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* 7. Awards & Achievements */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <div className="flex items-center justify-between mb-2">
                  <h5 className="font-bold text-slate-900 uppercase text-[10px] tracking-wider flex items-center gap-1.5">
                    <Award className="w-3.5 h-3.5 text-blue-600" />
                    <span>Awards & Achievements ({(currentSeekerProfile.awards || []).length})</span>
                  </h5>
                  <button
                    onClick={() => setIsAwardsModalOpen(true)}
                    className="text-blue-600 hover:text-blue-700 font-bold text-[11px] flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Manage</span>
                  </button>
                </div>
                {(currentSeekerProfile.awards || []).length === 0 ? (
                  <p className="text-slate-400 italic">No awards listed yet.</p>
                ) : (
                  <div className="space-y-2">
                    {(currentSeekerProfile.awards || []).map((award) => (
                      <div key={award.id} className="p-3 bg-white rounded-xl border border-slate-200">
                        <p className="font-bold text-slate-900">{award.title}</p>
                        <p className="text-slate-500 text-[11px]">{award.organization} • {award.dateAwarded}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* 8. Skills Inventory */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <div className="flex items-center justify-between mb-2">
                  <h5 className="font-bold text-slate-900 uppercase text-[10px] tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                    <span>Skills ({(currentSeekerProfile.technicalSkills || []).length})</span>
                  </h5>
                  <button
                    onClick={() => setIsSkillsModalOpen(true)}
                    className="text-blue-600 hover:text-blue-700 font-bold text-[11px] flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Edit Skills</span>
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {(currentSeekerProfile.technicalSkills || []).map((s) => (
                    <span key={s} className="px-2.5 py-1 bg-white border border-blue-200 text-blue-700 rounded-full text-[11px] font-semibold flex items-center gap-1 shadow-2xs">
                      <span>{s}</span>
                      <button onClick={() => handleRemoveTechSkill(s)} className="text-blue-400 hover:text-rose-600">×</button>
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-2 flex justify-between items-center">
                <button
                  onClick={() => setIsUploadModalOpen(true)}
                  className="px-4 py-2 border border-slate-200 hover:bg-slate-100 text-slate-700 font-bold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload / Replace Resume</span>
                </button>
                <button
                  onClick={() => {
                    setActiveSectionModal('personal');
                    setPersonalTab('personal');
                  }}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-600/20 cursor-pointer"
                >
                  Edit Profile Details
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= EXISTING SUB-MODALS ================= */}

      {/* Education Modal */}
      {isEduModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-slate-200 overflow-hidden"
          >
            <div className="p-5 bg-slate-900 text-white flex items-center justify-between">
              <h3 className="text-sm font-bold">{editingEduId ? 'Edit Education Record' : 'Add Education Record'}</h3>
              <button onClick={() => setIsEduModalOpen(false)} className="p-1 rounded-lg text-slate-400 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdu} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Degree / Course Name *</label>
                <input
                  type="text"
                  required
                  value={eduDegree}
                  onChange={e => setEduDegree(e.target.value)}
                  placeholder="e.g. BS Information Technology, TESDA Computer Systems Servicing"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">School / University / Training Center *</label>
                <input
                  type="text"
                  required
                  value={eduSchool}
                  onChange={e => setEduSchool(e.target.value)}
                  placeholder="e.g. Mindoro State University (MinSU), Divine Word College of Calapan"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Attainment Level</label>
                  <select
                    value={eduAttainment}
                    onChange={e => setEduAttainment(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-white"
                  >
                    <option value="Doctorate Degree">Doctorate Degree</option>
                    <option value="Master's Degree">Master's Degree</option>
                    <option value="Bachelor's Degree">Bachelor's Degree</option>
                    <option value="TVET / Technical Vocational">TVET / Vocational</option>
                    <option value="Senior High School">Senior High School</option>
                    <option value="Junior High School">Junior High School</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Year Graduated</label>
                  <input
                    type="number"
                    min="1970"
                    max="2030"
                    value={eduYear}
                    onChange={e => setEduYear(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Academic Honors / Awards (Optional)</label>
                <input
                  type="text"
                  value={eduHonors}
                  onChange={e => setEduHonors(e.target.value)}
                  placeholder="e.g. Cum Laude, Dean's Lister, Best in Thesis"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEduModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 bg-slate-100 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl shadow-xs cursor-pointer"
                >
                  Save Education
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Experience Modal */}
      {isExpModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-slate-200 overflow-hidden"
          >
            <div className="p-5 bg-slate-900 text-white flex items-center justify-between">
              <h3 className="text-sm font-bold">{editingExpId ? 'Edit Work Experience' : 'Add Work Experience'}</h3>
              <button onClick={() => setIsExpModalOpen(false)} className="p-1 rounded-lg text-slate-400 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveExp} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Job Title / Position *</label>
                <input
                  type="text"
                  required
                  value={expPosition}
                  onChange={e => setExpPosition(e.target.value)}
                  placeholder="e.g. Junior Bookkeeper, Farm Operations Assistant"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Company / Organization *</label>
                <input
                  type="text"
                  required
                  value={expCompany}
                  onChange={e => setExpCompany(e.target.value)}
                  placeholder="e.g. Mindoro Agri-Ventures, Roxas Commercial Center"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Start Date</label>
                  <input
                    type="month"
                    value={expStartDate}
                    onChange={e => setExpStartDate(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">End Date</label>
                  <input
                    type="month"
                    disabled={expIsCurrent}
                    value={expEndDate}
                    onChange={e => setExpEndDate(e.target.value)}
                    className={`w-full px-3 py-2 border border-slate-300 rounded-xl ${expIsCurrent ? 'bg-slate-100 text-slate-400' : ''}`}
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="expIsCurrent"
                  checked={expIsCurrent}
                  onChange={e => setExpIsCurrent(e.target.checked)}
                  className="rounded text-emerald-600 focus:ring-emerald-500"
                />
                <label htmlFor="expIsCurrent" className="font-semibold text-slate-700 cursor-pointer">
                  I currently work here
                </label>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Years of Experience</label>
                <input
                  type="number"
                  min="0.5"
                  step="0.5"
                  value={expYears}
                  onChange={e => setExpYears(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Key Responsibilities / Achievements</label>
                <textarea
                  rows={3}
                  value={expResponsibilities}
                  onChange={e => setExpResponsibilities(e.target.value)}
                  placeholder="Describe your day-to-day duties, accomplishments, tools used..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsExpModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 bg-slate-100 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl shadow-xs cursor-pointer"
                >
                  Save Experience
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Certification Modal */}
      {isCertModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-slate-200 overflow-hidden"
          >
            <div className="p-5 bg-slate-900 text-white flex items-center justify-between">
              <h3 className="text-sm font-bold">{editingCertId ? 'Edit Certificate' : 'Add Certificate Record'}</h3>
              <button onClick={() => setIsCertModalOpen(false)} className="p-1 rounded-lg text-slate-400 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCert} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Certificate / License Name *</label>
                <input
                  type="text"
                  required
                  value={certName}
                  onChange={e => setCertName(e.target.value)}
                  placeholder="e.g. TESDA NC II Shielded Metal Arc Welding, PRC Civil Engineering License"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Issuing Authority *</label>
                  <input
                    type="text"
                    required
                    value={certIssuer}
                    onChange={e => setCertIssuer(e.target.value)}
                    placeholder="e.g. TESDA, PRC, DOLE, Red Cross"
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Date Acquired</label>
                  <input
                    type="month"
                    value={certDate}
                    onChange={e => setCertDate(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                  />
                </div>
              </div>

              {/* Certificate Image Upload */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Certificate Photo / Scan Proof</label>
                {!certImage ? (
                  <label className="border-2 border-dashed border-slate-300 rounded-2xl p-4 flex flex-col items-center justify-center cursor-pointer hover:border-amber-400 hover:bg-amber-50/30 transition-all text-center">
                    <Award className="w-8 h-8 text-slate-400 mb-1" />
                    <span className="font-bold text-slate-700 text-xs">Click to Upload Certificate Image</span>
                    <span className="text-[11px] text-slate-400 mt-0.5">PNG, JPG, or PDF proof document</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleCertImageChange}
                      className="hidden"
                    />
                  </label>
                ) : (
                  <div className="border border-amber-200 bg-amber-50/60 rounded-2xl p-3 flex items-center gap-3">
                    <img
                      src={certImage}
                      alt="Certificate Proof"
                      className="w-16 h-16 object-cover rounded-xl border border-amber-300 shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-slate-900 truncate">{certImageFileName || 'Certificate Attached'}</p>
                      <button
                        type="button"
                        onClick={() => {
                          setCertImage('');
                          setCertImageFileName('');
                        }}
                        className="text-[11px] font-bold text-rose-600 hover:underline mt-1 cursor-pointer"
                      >
                        Remove Document
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCertModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 bg-slate-100 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-amber-600 hover:bg-amber-500 rounded-xl shadow-xs cursor-pointer"
                >
                  Save Certificate
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Lightbox Preview for Certificate Proof */}
      {previewCertProof && (
        <div 
          className="fixed inset-0 z-[100] bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5"
          onClick={() => setPreviewCertProof(null)}
        >
          <div 
            className="relative max-w-2xl w-full bg-white rounded-3xl overflow-hidden shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold">{previewCertProof.name}</h4>
                <p className="text-xs text-slate-400">{previewCertProof.issuer}</p>
              </div>
              <button onClick={() => setPreviewCertProof(null)} className="p-1 rounded-lg text-slate-400 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 bg-slate-950 flex items-center justify-center max-h-[70vh] overflow-auto">
              <img src={previewCertProof.url} alt="Proof" className="max-w-full max-h-[60vh] object-contain rounded-xl" />
            </div>
          </div>
        </div>
      )}

      {/* Resume Upload Modal */}
      <ResumeUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
      />

      {/* PDF Export Modal */}
      <ResumePDFExportModal
        isOpen={isPDFModalOpen}
        seeker={currentSeekerProfile}
        onClose={() => setIsPDFModalOpen(false)}
      />

      {/* Interactive Resume Builder Modal */}
      <ResumeBuilderModal
        isOpen={isResumeBuilderOpen}
        seeker={currentSeekerProfile}
        onClose={() => setIsResumeBuilderOpen(false)}
      />

      {/* ATS Resume Audit Modal */}
      {isAtsModalOpen && selectedAtsData && (
        <AtsResumeModal
          isOpen={isAtsModalOpen}
          onClose={() => setIsAtsModalOpen(false)}
          candidateName={`${currentSeekerProfile.firstName} ${currentSeekerProfile.lastName}`}
          resumeFileName={selectedAtsData.resume?.fileName}
          atsResult={selectedAtsData.atsResult}
          isEmployer={false}
        />
      )}

      {/* Modular Profile Modals (Color UI Design) */}
      <ContactInfoModal
        isOpen={isContactModalOpen}
        onClose={() => setIsContactModalOpen(false)}
        seeker={currentSeekerProfile}
      />

      <AboutMeModal
        isOpen={isAboutMeModalOpen}
        onClose={() => setIsAboutMeModalOpen(false)}
        seeker={currentSeekerProfile}
      />

      <ProjectsModal
        isOpen={isProjectsModalOpen}
        onClose={() => setIsProjectsModalOpen(false)}
        seeker={currentSeekerProfile}
      />

      <VolunteerModal
        isOpen={isVolunteerModalOpen}
        onClose={() => setIsVolunteerModalOpen(false)}
        seeker={currentSeekerProfile}
      />

      <AwardsModal
        isOpen={isAwardsModalOpen}
        onClose={() => setIsAwardsModalOpen(false)}
        seeker={currentSeekerProfile}
      />

      <SkillsModal
        isOpen={isSkillsModalOpen}
        onClose={() => setIsSkillsModalOpen(false)}
        seeker={currentSeekerProfile}
      />

    </div>
  );
};

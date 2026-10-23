import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { parseResumeFile, ExtractedResumePayload } from '../../utils/resumeParser';
import { evaluateResumeForAts } from '../../utils/atsEngine';
import { AtsScanResult } from '../../types';
import { 
  X, 
  Upload, 
  FileText, 
  CheckCircle2, 
  Sparkles, 
  Loader2, 
  Edit3, 
  Plus, 
  Trash2,
  BrainCircuit,
  User,
  Mail,
  Phone,
  GraduationCap,
  Briefcase,
  Award
} from 'lucide-react';

interface ResumeUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const ResumeUploadModal: React.FC<ResumeUploadModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const { currentSeekerProfile, updateJobSeekerProfile, showToast } = useApp();

  const [step, setStep] = useState<'select' | 'parsing' | 'review'>('select');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [extractedData, setExtractedData] = useState<ExtractedResumePayload | null>(null);
  const [atsResult, setAtsResult] = useState<AtsScanResult | null>(null);
  
  // Editable Fields in Review Step
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [degree, setDegree] = useState('');
  const [educationLevel, setEducationLevel] = useState('');
  const [school, setSchool] = useState('');
  const [skills, setSkills] = useState<string[]>([]);
  const [newSkillInput, setNewSkillInput] = useState('');
  const [experienceYears, setExperienceYears] = useState(0);
  const [certifications, setCertifications] = useState<string[]>([]);
  const [professionalSummary, setProfessionalSummary] = useState('');

  const [fileError, setFileError] = useState<string>('');
  const [extractionMethod, setExtractionMethod] = useState<'pdf_text' | 'image_ocr' | 'docx'>('pdf_text');

  const PARSING_MESSAGES = [
    "Scanning document structure...",
    "Extracting educational background...",
    "Categorizing technical and trade skills...",
    "Finalizing AI profile mapping..."
  ];
  const [parsingMessageIndex, setParsingMessageIndex] = useState(0);

  useEffect(() => {
    if (step !== 'parsing') {
      setParsingMessageIndex(0);
      return;
    }
    const interval = setInterval(() => {
      setParsingMessageIndex(prev => (prev + 1) % PARSING_MESSAGES.length);
    }, 1500);
    return () => clearInterval(interval);
  }, [step]);

  if (!isOpen || !currentSeekerProfile) return null;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setFileError('');
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const lowerName = file.name.toLowerCase();
      
      // Step 5: Check file format - PDF or Image format (or Word doc)
      const isPdf = lowerName.endsWith('.pdf') || file.type === 'application/pdf';
      const isImage = lowerName.endsWith('.png') || lowerName.endsWith('.jpg') || lowerName.endsWith('.jpeg') || file.type.startsWith('image/');
      const isDocx = lowerName.endsWith('.docx') || lowerName.endsWith('.doc') || file.type.includes('word');

      if (!isPdf && !isImage && !isDocx) {
        setFileError('Unsupported file type. Please upload your resume in PDF or image format (PNG, JPG, JPEG) or Word document.');
        return;
      }

      if (file.size > 15 * 1024 * 1024) {
        setFileError('File size exceeds 15MB limit. Please upload a smaller file.');
        return;
      }

      setSelectedFile(file);
      setExtractionMethod(isPdf ? 'pdf_text' : isImage ? 'image_ocr' : 'docx');
      setStep('parsing');

      // Step 6: Text Extraction for PDF, OCR for Image
      const result = await parseResumeFile(file);
      setExtractedData(result);

      // Evaluate ATS Compatibility
      const ats = evaluateResumeForAts({
        fileName: file.name,
        fileType: isImage ? 'image' : isDocx ? 'docx' : 'pdf',
        extractedSkills: result.extractedSkills,
        extractedEducation: result.educationalAttainment,
        extractedDegree: result.primaryDegree,
        extractedExperienceYears: result.extractedExperienceYears,
        contactNumber: result.contactNumber,
        email: result.email,
        firstName: result.firstName,
        lastName: result.lastName,
        professionalSummary: result.professionalSummary,
        certifications: result.certifications,
        rawTextPreview: result.rawTextPreview,
        workExperience: result.workExperience,
        education: result.education,
      });
      setAtsResult(ats);

      // Populate Step 7: Editable Review State
      setFirstName(result.firstName || currentSeekerProfile.firstName);
      setLastName(result.lastName || currentSeekerProfile.lastName);
      setContactEmail(result.email || currentSeekerProfile.email);
      setContactPhone(result.contactNumber || currentSeekerProfile.contactNumber);
      setDegree(result.primaryDegree);
      setEducationLevel(result.educationalAttainment);
      setSchool(result.school || '');
      setSkills(result.extractedSkills);
      setExperienceYears(result.extractedExperienceYears);
      setCertifications(result.certifications);
      setProfessionalSummary(result.professionalSummary || currentSeekerProfile.professionalSummary || '');

      setStep('review');
    }
  };

  const handleAddSkill = () => {
    if (newSkillInput.trim() && !skills.includes(newSkillInput.trim())) {
      setSkills([...skills, newSkillInput.trim()]);
      setNewSkillInput('');
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setSkills(skills.filter(s => s !== skillToRemove));
  };

  const handleSaveParsedResume = () => {
    const newResumeId = `res-${Date.now()}`;
    const newResumeObj = {
      id: newResumeId,
      fileName: selectedFile?.name || 'Uploaded_Resume.pdf',
      fileSize: selectedFile ? `${(selectedFile.size / (1024 * 1024)).toFixed(1)} MB` : '1.2 MB',
      fileType: (selectedFile?.name.endsWith('.docx') ? 'docx' : 'pdf') as 'pdf' | 'doc' | 'docx',
      uploadedAt: new Date().toISOString(),
      validationStatus: 'validated' as const,
      extractedSkills: skills,
      extractedEducation: educationLevel,
      extractedDegree: degree,
      extractedExperienceYears: Number(experienceYears),
      atsScore: atsResult?.score,
      atsResult: atsResult || undefined,
    };

    // Merge updated skills with existing profile technical skills
    const mergedTechnicalSkills = Array.from(new Set([...(currentSeekerProfile.technicalSkills || []), ...skills]));

    // Construct updated education record if extracted
    const confirmedDegree = degree.trim() || extractedData?.primaryDegree || '';
    const updatedEducation = (Array.isArray(extractedData?.education) && extractedData.education.length > 0)
      ? extractedData.education.map(e => ({
          ...e,
          degreeCourse: confirmedDegree || e.degreeCourse,
          school: school.trim() || e.school,
          educationalAttainment: educationLevel || e.educationalAttainment,
        }))
      : (confirmedDegree || school) ? [{
          id: `edu-${Date.now()}`,
          degreeCourse: confirmedDegree,
          school: school.trim() || 'Educational Institution',
          yearGraduated: extractedData?.yearGraduated || new Date().getFullYear(),
          educationalAttainment: educationLevel || currentSeekerProfile.educationalAttainment,
        }] : currentSeekerProfile.education;

    // Construct updated work experience if extracted
    const updatedWorkExperience = (extractedData?.workExperience && extractedData.workExperience.length > 0)
      ? extractedData.workExperience
      : (experienceYears > 0) ? [{
          id: `exp-${Date.now()}`,
          company: 'Verified Work Experience',
          position: 'Staff / Specialist',
          startDate: `${new Date().getFullYear() - Math.max(1, Math.round(experienceYears))}`,
          endDate: 'Present',
          isCurrent: true,
          responsibilities: 'Extracted directly from resume content.',
          yearsOfExperience: Number(experienceYears),
        }] : currentSeekerProfile.workExperience;

    updateJobSeekerProfile(currentSeekerProfile.id, {
      firstName: firstName || currentSeekerProfile.firstName,
      lastName: lastName || currentSeekerProfile.lastName,
      contactNumber: contactPhone || currentSeekerProfile.contactNumber,
      resumes: [newResumeObj, ...currentSeekerProfile.resumes],
      activeResumeId: newResumeId,
      primaryDegree: confirmedDegree || currentSeekerProfile.primaryDegree || '',
      educationalAttainment: educationLevel || currentSeekerProfile.educationalAttainment,
      technicalSkills: mergedTechnicalSkills,
      education: updatedEducation,
      workExperience: updatedWorkExperience,
      professionalSummary: professionalSummary || currentSeekerProfile.professionalSummary,
      certifications: certifications.length > 0 ? certifications : currentSeekerProfile.certifications,
    });

    showToast({
      title: 'Resume Successfully Integrated',
      message: 'Your profile has been updated identically with the extracted resume data.',
      type: 'status',
    });

    onClose();
    if (onSuccess) onSuccess();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-xl overflow-hidden flex flex-col max-h-[94vh] sm:max-h-[90vh]">
        
        {/* Modal Header */}
        <div className="bg-slate-900 px-5 sm:px-6 py-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-2 min-w-0">
            <BrainCircuit className="w-5 h-5 text-emerald-400 shrink-0" />
            <div className="min-w-0">
              <h2 className="text-sm font-bold uppercase tracking-wider truncate">
                Resume Upload & Extraction
              </h2>
              <p className="text-[11px] text-slate-400 font-normal truncate">Accurately extracts genuine resume credentials</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 shrink-0">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6">
          
          {step === 'select' && (
            <div className="space-y-4 text-center">
              {fileError && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs font-semibold text-left">
                  {fileError}
                </div>
              )}

              <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-2xl text-left space-y-1">
                <span className="text-[10px] font-bold tracking-wider uppercase text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md">
                  Step 5: Resume Upload
                </span>
                <p className="text-xs text-emerald-950 font-medium pt-1">
                  Upload your resume in <strong>PDF or image format</strong> (PNG, JPG, JPEG). The system validates the file and stores it securely.
                </p>
              </div>

              <div className="p-8 border-2 border-dashed border-slate-300 hover:border-emerald-500 rounded-2xl bg-slate-50 transition-colors cursor-pointer relative group">
                <input
                  type="file"
                  accept=".pdf,.png,.jpg,.jpeg,.doc,.docx"
                  onChange={handleFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <div className="flex flex-col items-center gap-2">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Upload className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900">Click or Drag Resume File to Upload</p>
                    <p className="text-xs text-slate-500 mt-1">Supports PDF & Images (PNG, JPG, JPEG) or Word documents up to 15MB</p>
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-[10px] font-bold bg-slate-200 text-slate-700 px-2 py-0.5 rounded">PDF (Text Extraction)</span>
                    <span className="text-[10px] font-bold bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded">Images (OCR Recognition)</span>
                  </div>
                </div>
              </div>

              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-left flex items-start gap-2.5 text-xs text-slate-700">
                <Sparkles className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>
                  <strong>Step 6 Extraction Guarantee:</strong> PDF documents utilize high-speed direct text extraction, while image resumes utilize Optical Character Recognition (OCR) to accurately identify your name, education, skills, and work history.
                </span>
              </div>
            </div>
          )}

          {step === 'parsing' && (
            <div className="py-4 px-2 sm:px-6 space-y-6">
              {/* Status Header with Cycling Text */}
              <div className="text-center space-y-2">
                <span className="text-[10px] font-bold tracking-wider uppercase text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full inline-block">
                  AI Resume Extraction in Progress
                </span>
                <h3 className="text-base font-bold text-slate-900 transition-all duration-300">
                  {PARSING_MESSAGES[parsingMessageIndex]}
                </h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  {extractionMethod === 'image_ocr'
                    ? 'Optical Character Recognition (OCR) is scanning your uploaded resume image.'
                    : 'Gemini NLP engine is parsing structure, educational qualifications, and skills.'}
                </p>
              </div>

              {/* Pulsing Skeleton Outline of a Resume Document */}
              <div className="w-full max-w-md mx-auto bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 space-y-5 animate-pulse">
                {/* Header Skeleton: Avatar & Identity */}
                <div className="flex items-center gap-3.5 pb-4 border-b border-slate-100">
                  <div className="w-12 h-12 rounded-xl bg-slate-200 shrink-0"></div>
                  <div className="space-y-2 flex-1 min-w-0">
                    <div className="h-4 bg-slate-300 rounded-md w-3/5"></div>
                    <div className="h-2.5 bg-slate-200 rounded-md w-4/5"></div>
                  </div>
                </div>

                {/* Section 1: Professional Summary */}
                <div className="space-y-2">
                  <div className="h-3 bg-slate-300 rounded w-1/4"></div>
                  <div className="space-y-1.5 pt-1">
                    <div className="h-2 bg-slate-200 rounded w-full"></div>
                    <div className="h-2 bg-slate-200 rounded w-5/6"></div>
                  </div>
                </div>

                {/* Section 2: Education & Qualifications */}
                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <div className="flex items-center justify-between">
                    <div className="h-3 bg-slate-300 rounded w-1/3"></div>
                    <div className="h-2.5 bg-slate-200 rounded w-16"></div>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl space-y-1.5 border border-slate-100">
                    <div className="h-2.5 bg-slate-300 rounded w-2/3"></div>
                    <div className="h-2 bg-slate-200 rounded w-1/2"></div>
                  </div>
                </div>

                {/* Section 3: Skills & Competencies */}
                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <div className="h-3 bg-slate-300 rounded w-1/4"></div>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    <div className="h-5 bg-slate-200 rounded-lg w-16"></div>
                    <div className="h-5 bg-slate-200 rounded-lg w-24"></div>
                    <div className="h-5 bg-slate-200 rounded-lg w-20"></div>
                    <div className="h-5 bg-slate-200 rounded-lg w-28"></div>
                    <div className="h-5 bg-slate-200 rounded-lg w-14"></div>
                  </div>
                </div>

                {/* Section 4: Experience Duration */}
                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <div className="h-3 bg-slate-300 rounded w-2/5"></div>
                  <div className="h-2 bg-slate-200 rounded w-4/5"></div>
                </div>
              </div>

              {/* Progress bar indicator */}
              <div className="max-w-md mx-auto">
                <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                  <div 
                    className="bg-emerald-500 h-full rounded-full transition-all duration-500 ease-out"
                    style={{ width: `${((parsingMessageIndex + 1) / PARSING_MESSAGES.length) * 100}%` }}
                  ></div>
                </div>
                <div className="flex items-center justify-between text-[10px] text-slate-400 mt-1 font-medium">
                  <span>Extracting verified data</span>
                  <span>Step {parsingMessageIndex + 1} of {PARSING_MESSAGES.length}</span>
                </div>
              </div>
            </div>
          )}

          {step === 'review' && extractedData && (
            <div className="space-y-5">
              
              <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between text-xs text-emerald-900">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-200/60 px-2 py-0.5 rounded">
                    Step 7: Information Review
                  </span>
                  <p className="font-bold text-emerald-950 mt-1 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    Review extracted credentials from {selectedFile?.name || 'Uploaded File'}
                  </p>
                  <p className="text-[11px] text-emerald-800 font-normal">
                    Extracted via {extractionMethod === 'image_ocr' ? 'Image OCR' : 'PDF Text Extraction'}. Review details, make corrections, or add missing information before confirming.
                  </p>
                </div>
                <span className="text-[10px] bg-emerald-600 text-white px-2.5 py-1 rounded-full font-bold shrink-0">
                  Ready to Confirm
                </span>
              </div>

              {/* ATS Applicant Tracking Readiness Preview */}
              {atsResult && (
                <div className="p-3.5 bg-slate-900 text-white rounded-2xl flex items-center justify-between shadow-2xs border border-slate-800">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-black text-sm border border-emerald-500/30">
                      {atsResult.score}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-white">ATS Applicant Tracking Readiness</span>
                        <span className="text-[9px] font-black uppercase bg-emerald-500 text-slate-950 px-1.5 py-0.2 rounded">
                          Grade {atsResult.grade}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        {atsResult.formatStatus === 'ats_optimized' ? 'Optimized for employer ATS filters' : 'Ready for ATS screening'} • {skills.length} skills & {experienceYears || 0} yrs experience indexed
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] text-emerald-400 font-bold bg-emerald-950/80 border border-emerald-800/80 px-2.5 py-1 rounded-xl shrink-0">
                    ATS Ready
                  </span>
                </div>
              )}

              {/* Form Fields to Review and Edit */}
              <div className="space-y-4 text-xs">
                
                {/* Candidate Name & Contact Info */}
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2.5">
                  <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1">
                    <User className="w-3.5 h-3.5 text-emerald-600" /> Extracted Identity & Contact
                  </span>
                  <div className="grid grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-600 mb-0.5">First Name</label>
                      <input
                        type="text"
                        value={firstName}
                        onChange={e => setFirstName(e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg focus:ring-1 focus:ring-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-600 mb-0.5">Last Name</label>
                      <input
                        type="text"
                        value={lastName}
                        onChange={e => setLastName(e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg focus:ring-1 focus:ring-emerald-500"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-600 mb-0.5">Contact Phone</label>
                      <input
                        type="text"
                        value={contactPhone}
                        onChange={e => setContactPhone(e.target.value)}
                        placeholder="09..."
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg focus:ring-1 focus:ring-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-600 mb-0.5">Email Address</label>
                      <input
                        type="text"
                        value={contactEmail}
                        onChange={e => setContactEmail(e.target.value)}
                        placeholder="email@example.com"
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg focus:ring-1 focus:ring-emerald-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Primary Degree and School */}
                <div>
                  <label className="block font-bold text-slate-800 mb-1 flex items-center gap-1">
                    <GraduationCap className="w-3.5 h-3.5 text-emerald-600" /> Extracted Primary Degree / Course
                  </label>
                  <input
                    type="text"
                    value={degree}
                    onChange={e => setDegree(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                {school && (
                  <div>
                    <label className="block font-bold text-slate-800 mb-1">Educational Institution / School</label>
                    <input
                      type="text"
                      value={school}
                      onChange={e => setSchool(e.target.value)}
                      className="w-full px-3 py-1.5 border border-slate-300 rounded-lg bg-white"
                    />
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-800 mb-1">Educational Attainment</label>
                    <select
                      value={educationLevel}
                      onChange={e => setEducationLevel(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
                    >
                      <option value="Doctorate / PhD">Doctorate / PhD</option>
                      <option value="Master's Degree">Master's Degree</option>
                      <option value="Bachelor's Degree">Bachelor's Degree</option>
                      <option value="Associate Degree">Associate Degree</option>
                      <option value="TVET / Vocational">TVET / Vocational</option>
                      <option value="High School">High School</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-800 mb-1 flex items-center gap-1">
                      <Briefcase className="w-3.5 h-3.5 text-emerald-600" /> Total Work Experience (Years)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="35"
                      step="0.5"
                      value={experienceYears}
                      onChange={e => setExperienceYears(parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Detected Skills Chips */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="font-bold text-slate-800">Extracted Skills & Competencies ({skills.length})</label>
                    <span className="text-[10px] text-slate-400">From resume text</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 mb-2 max-h-36 overflow-y-auto p-1.5 bg-slate-50 border border-slate-200 rounded-lg">
                    {skills.map(skill => (
                      <span key={skill} className="px-2.5 py-1 bg-emerald-100 text-emerald-900 rounded-lg flex items-center gap-1 font-semibold text-[11px]">
                        {skill}
                        <button type="button" onClick={() => handleRemoveSkill(skill)} className="text-emerald-700 hover:text-rose-600">
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                    {skills.length === 0 && (
                      <span className="text-slate-400 italic text-[11px]">No specific skills tagged. Type below to add.</span>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newSkillInput}
                      onChange={e => setNewSkillInput(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleAddSkill())}
                      placeholder="Add custom skill..."
                      className="flex-1 px-3 py-1.5 border border-slate-300 rounded-lg text-xs"
                    />
                    <button
                      type="button"
                      onClick={handleAddSkill}
                      className="px-3 py-1.5 bg-slate-800 text-white font-bold rounded-lg flex items-center gap-1 text-xs"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add
                    </button>
                  </div>
                </div>

                {/* Certifications if any */}
                {certifications.length > 0 && (
                  <div>
                    <label className="block font-bold text-slate-800 mb-1 flex items-center gap-1">
                      <Award className="w-3.5 h-3.5 text-amber-500" /> Extracted Certifications & Licenses
                    </label>
                    <div className="flex flex-wrap gap-1.5">
                      {certifications.map(c => (
                        <span key={c} className="px-2 py-0.5 bg-amber-50 text-amber-900 border border-amber-200 rounded text-[10px] font-medium">
                          {c}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Raw Document Snippet */}
                {extractedData.rawTextPreview && (
                  <div className="p-2.5 bg-slate-100 border border-slate-200 rounded-lg">
                    <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                      Document Excerpt
                    </span>
                    <p className="text-[11px] text-slate-600 line-clamp-2 italic font-mono">
                      "{extractedData.rawTextPreview}"
                    </p>
                  </div>
                )}

              </div>

              <div className="pt-4 border-t border-slate-200 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setStep('select')}
                  className="px-4 py-2.5 border border-slate-300 rounded-xl font-bold text-xs text-slate-700 hover:bg-slate-100 transition-colors text-center"
                >
                  Upload Different File
                </button>

                <button
                  type="button"
                  onClick={handleSaveParsedResume}
                  className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-md transition-colors flex items-center justify-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Confirm & Save Profile</span>
                </button>
              </div>

            </div>
          )}

        </div>

      </div>
    </div>
  );
};


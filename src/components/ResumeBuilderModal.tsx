import React, { useState } from 'react';
import { JobSeekerProfile, ResumeFile } from '../types';
import { useApp } from '../context/AppContext';
import { evaluateResumeForAts } from '../utils/atsEngine';
import { 
  X, 
  Printer, 
  Download, 
  Copy, 
  Check, 
  Sparkles, 
  Building2, 
  MapPin, 
  Phone, 
  Mail, 
  GraduationCap, 
  Briefcase, 
  Award, 
  ShieldCheck, 
  FileText,
  Palette,
  Sliders,
  Eye,
  CheckCircle2,
  Loader2
} from 'lucide-react';

interface ResumeBuilderModalProps {
  isOpen: boolean;
  seeker: JobSeekerProfile;
  onClose: () => void;
}

type TemplateType = 'modern' | 'executive' | 'classic' | 'creative';
type ColorScheme = 'emerald' | 'indigo' | 'slate' | 'crimson' | 'teal';

export const ResumeBuilderModal: React.FC<ResumeBuilderModalProps> = ({ isOpen, seeker, onClose }) => {
  const [template, setTemplate] = useState<TemplateType>('modern');
  const [colorScheme, setColorScheme] = useState<ColorScheme>('emerald');
  const [copied, setCopied] = useState(false);

  const { updateJobSeekerProfile, showToast } = useApp();
  const [isSavingResume, setIsSavingResume] = useState(false);

  // Section Toggles
  const [showPhoto, setShowPhoto] = useState(true);
  const [showSummary, setShowSummary] = useState(true);
  const [showCertifications, setShowCertifications] = useState(true);
  const [showReferences, setShowReferences] = useState(true);

  // Editable customization overrides
  const [customTitle, setCustomTitle] = useState(seeker?.primaryDegree || 'Professional Specialist');
  const [customSummary, setCustomSummary] = useState(seeker?.professionalSummary || seeker?.summary || 'Dedicated professional with extensive background in delivering high-impact solutions in Oriental Mindoro.');

  React.useEffect(() => {
    if (seeker) {
      setCustomTitle(seeker.primaryDegree || 'Professional Specialist');
      setCustomSummary(seeker.professionalSummary || seeker.summary || 'Dedicated professional with extensive background in delivering high-impact solutions in Oriental Mindoro.');
    }
  }, [seeker]);

  if (!isOpen || !seeker) return null;

  const handleSaveGeneratedResume = () => {
    setIsSavingResume(true);
    try {
      const genId = `res-gen-${Date.now()}`;
      const templateTitle = template.charAt(0).toUpperCase() + template.slice(1);
      const generatedFileName = `${seeker.firstName}_${seeker.lastName}_Resume_${templateTitle}.pdf`;

      const evaluationData = {
        fileName: generatedFileName,
        fileType: 'pdf',
        extractedSkills: seeker.technicalSkills || [],
        extractedEducation: seeker.educationalAttainment || "Bachelor's Degree",
        extractedDegree: customTitle || seeker.primaryDegree || '',
        extractedExperienceYears: (seeker.workExperience || []).reduce((acc, exp) => acc + (exp.yearsOfExperience || 1), 0),
        contactNumber: seeker.contactNumber,
        email: seeker.email,
        firstName: seeker.firstName,
        lastName: seeker.lastName,
        municipality: seeker.municipality,
        professionalSummary: customSummary,
        certifications: seeker.certifications || [],
        workExperience: seeker.workExperience || [],
        education: seeker.education || []
      };

      const atsResult = evaluateResumeForAts(evaluationData);

      const newResume: ResumeFile = {
        id: genId,
        fileName: generatedFileName,
        fileSize: '156 KB',
        fileType: 'pdf',
        uploadedAt: new Date().toISOString(),
        validationStatus: 'validated',
        extractedSkills: seeker.technicalSkills || [],
        extractedEducation: seeker.educationalAttainment || "Bachelor's Degree",
        extractedDegree: customTitle || seeker.primaryDegree || '',
        extractedExperienceYears: evaluationData.extractedExperienceYears,
        atsScore: atsResult.score || 95,
        atsResult: atsResult
      };

      const existing = seeker.resumes || [];
      const updatedResumes = [newResume, ...existing];

      updateJobSeekerProfile(seeker.id, {
        resumes: updatedResumes,
        activeResumeId: genId,
        professionalSummary: customSummary,
        primaryDegree: customTitle || seeker.primaryDegree
      });

      showToast({
        title: 'Resume Generated Successfully',
        message: `"${generatedFileName}" was generated with an ATS score of ${newResume.atsScore}% and set as your active system resume.`,
        type: 'status'
      });

      setTimeout(() => {
        setIsSavingResume(false);
        onClose();
      }, 500);
    } catch (e) {
      console.error('Error generating resume:', e);
      setIsSavingResume(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleCopyText = () => {
    const textContent = `
${seeker.firstName} ${seeker.lastName}
${customTitle} • ${seeker.municipality}, Oriental Mindoro
Email: ${seeker.email} | Phone: ${seeker.contactNumber}

PROFESSIONAL SUMMARY
${customSummary}

WORK EXPERIENCE
${(seeker.workExperience || []).map(exp => `
- ${exp.position} at ${exp.company} (${exp.startDate} - ${exp.isCurrent ? 'Present' : exp.endDate})
  ${exp.responsibilities}
`).join('')}

EDUCATION
${(seeker.education || []).map(edu => `
- ${edu.degreeCourse}
  ${edu.school} (${edu.yearGraduated}) - ${edu.educationalAttainment} ${edu.honors ? `[${edu.honors}]` : ''}
`).join('')}

SKILLS & COMPETENCIES
Technical Skills: ${(seeker.technicalSkills || []).join(', ')}
Soft Skills: ${seeker.softSkills?.join(', ') || 'Teamwork, Problem Solving'}

CERTIFICATIONS & ELIGIBILITY
${(seeker.certifications || []).map(c => `- ${c.name} (${c.issuingOrganization}, ${c.dateObtained})`).join('\n')}

REFERENCES
Available upon request from PESO Oriental Mindoro.
    `.trim();

    navigator.clipboard.writeText(textContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Color Mapping
  const colorMap = {
    emerald: {
      primary: 'text-emerald-700',
      bg: 'bg-emerald-600',
      border: 'border-emerald-600',
      lightBg: 'bg-emerald-50',
      badgeBg: 'bg-emerald-100 text-emerald-800',
    },
    indigo: {
      primary: 'text-indigo-700',
      bg: 'bg-indigo-600',
      border: 'border-indigo-600',
      lightBg: 'bg-indigo-50',
      badgeBg: 'bg-indigo-100 text-indigo-800',
    },
    slate: {
      primary: 'text-slate-900',
      bg: 'bg-slate-900',
      border: 'border-slate-800',
      lightBg: 'bg-slate-100',
      badgeBg: 'bg-slate-200 text-slate-800',
    },
    crimson: {
      primary: 'text-rose-700',
      bg: 'bg-rose-600',
      border: 'border-rose-600',
      lightBg: 'bg-rose-50',
      badgeBg: 'bg-rose-100 text-rose-800',
    },
    teal: {
      primary: 'text-teal-700',
      bg: 'bg-teal-600',
      border: 'border-teal-600',
      lightBg: 'bg-teal-50',
      badgeBg: 'bg-teal-100 text-teal-800',
    },
  };

  const currentTheme = colorMap[colorScheme];

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/75 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto font-sans">
      
      {/* Print Stylesheet */}
      <style>{`
        @media print {
          body * {
            visibility: hidden !important;
          }
          #builder-printable-resume, #builder-printable-resume * {
            visibility: visible !important;
          }
          #builder-printable-resume {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            margin: 0 !important;
            padding: 24px !important;
            box-shadow: none !important;
            border: none !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      <div className="bg-white w-full max-w-6xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-auto flex flex-col max-h-[94vh]">
        
        {/* Modal Header */}
        <div className="no-print p-4 sm:p-5 bg-gradient-to-r from-slate-900 via-slate-850 to-indigo-950 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-300 shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="font-bold text-sm sm:text-base text-white">Interactive Dynamic Resume Builder</h3>
                <span className="text-[10px] bg-emerald-900 text-emerald-300 border border-emerald-700 px-2 py-0.5 rounded-full font-bold">
                  Live PDF Engine
                </span>
              </div>
              <p className="text-xs text-slate-300">{seeker.firstName} {seeker.lastName} • Customize templates, styles & export</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-end">
            <button
              onClick={handleSaveGeneratedResume}
              disabled={isSavingResume}
              className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5 disabled:opacity-50"
            >
              {isSavingResume ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Generating...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                  <span>Save as Active Resume</span>
                </>
              )}
            </button>

            <button
              onClick={handleCopyText}
              className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs rounded-xl border border-slate-700 transition-colors flex items-center gap-1.5"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              <span className="hidden sm:inline">{copied ? 'Copied' : 'Copy Text'}</span>
            </button>

            <button
              onClick={handlePrint}
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
            >
              <Printer className="w-4 h-4" />
              <span>Export PDF</span>
            </button>

            <button onClick={onClose} className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Builder Main Body (Controls Left + Live A4 Canvas Right) */}
        <div className="flex-1 overflow-y-auto lg:overflow-hidden grid grid-cols-1 lg:grid-cols-12 bg-slate-100">
          
          {/* Controls & Configuration Sidebar */}
          <div className="no-print lg:col-span-4 bg-white p-5 sm:p-6 border-b lg:border-b-0 lg:border-r border-slate-200 overflow-y-auto space-y-6 lg:max-h-[calc(94vh-80px)]">
            
            {/* Template Selector */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <Palette className="w-3.5 h-3.5 text-indigo-600" />
                <span>Resume Template Style</span>
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'modern', label: 'Modern Tech' },
                  { id: 'executive', label: 'Executive' },
                  { id: 'classic', label: 'Classic PESO' },
                  { id: 'creative', label: 'Creative Bento' },
                ].map(t => (
                  <button
                    key={t.id}
                    onClick={() => setTemplate(t.id as TemplateType)}
                    className={`py-2 px-3 text-xs font-bold rounded-xl border text-center transition-all ${
                      template === t.id
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-2xs'
                        : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Accent Color Selector */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-indigo-600" />
                <span>Accent Color Palette</span>
              </label>
              <div className="flex items-center gap-3">
                {[
                  { id: 'emerald', bg: 'bg-emerald-600', name: 'Emerald' },
                  { id: 'indigo', bg: 'bg-indigo-600', name: 'Indigo' },
                  { id: 'slate', bg: 'bg-slate-900', name: 'Slate' },
                  { id: 'crimson', bg: 'bg-rose-600', name: 'Crimson' },
                  { id: 'teal', bg: 'bg-teal-600', name: 'Teal' },
                ].map(c => (
                  <button
                    key={c.id}
                    onClick={() => setColorScheme(c.id as ColorScheme)}
                    title={c.name}
                    className={`w-7 h-7 rounded-full ${c.bg} transition-all flex items-center justify-center ${
                      colorScheme === c.id ? 'ring-4 ring-slate-300 scale-110' : 'opacity-80 hover:opacity-100'
                    }`}
                  >
                    {colorScheme === c.id && <Check className="w-3.5 h-3.5 text-white" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Section Toggles */}
            <div className="space-y-2.5 pt-2 border-t border-slate-100">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Include / Exclude Sections
              </label>
              <div className="space-y-2 text-xs">
                <label className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-200/60 cursor-pointer">
                  <span className="font-semibold text-slate-700">Profile Photo</span>
                  <input
                    type="checkbox"
                    checked={showPhoto}
                    onChange={e => setShowPhoto(e.target.checked)}
                    className="rounded text-indigo-600"
                  />
                </label>

                <label className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-200/60 cursor-pointer">
                  <span className="font-semibold text-slate-700">Professional Summary</span>
                  <input
                    type="checkbox"
                    checked={showSummary}
                    onChange={e => setShowSummary(e.target.checked)}
                    className="rounded text-indigo-600"
                  />
                </label>

                <label className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-200/60 cursor-pointer">
                  <span className="font-semibold text-slate-700">Certifications & Civil Service</span>
                  <input
                    type="checkbox"
                    checked={showCertifications}
                    onChange={e => setShowCertifications(e.target.checked)}
                    className="rounded text-indigo-600"
                  />
                </label>

                <label className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-200/60 cursor-pointer">
                  <span className="font-semibold text-slate-700">PESO Verified Endorsement</span>
                  <input
                    type="checkbox"
                    checked={showReferences}
                    onChange={e => setShowReferences(e.target.checked)}
                    className="rounded text-indigo-600"
                  />
                </label>
              </div>
            </div>

            {/* Quick Text Overrides */}
            <div className="space-y-3 pt-2 border-t border-slate-100 text-xs">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Custom Headline & Objective
              </label>

              <div>
                <label className="block font-bold text-slate-600 mb-1">Headline / Target Role</label>
                <input
                  type="text"
                  value={customTitle}
                  onChange={e => setCustomTitle(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 text-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-600 mb-1">Tailored Bio</label>
                <textarea
                  rows={3}
                  value={customSummary}
                  onChange={e => setCustomSummary(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 text-xs"
                />
              </div>
            </div>

          </div>

          {/* Live A4 Sheet Preview Canvas */}
          <div className="lg:col-span-8 p-3 sm:p-6 lg:p-8 overflow-y-auto lg:max-h-[calc(94vh-80px)] flex justify-center">
            
            <div
              id="builder-printable-resume"
              className="bg-white w-full max-w-[760px] min-h-[980px] p-4 sm:p-8 md:p-10 rounded-2xl shadow-xl border border-slate-200 text-slate-800 space-y-6 relative overflow-x-hidden"
            >
              
              {/* Top Resume Header */}
              <div className={`pb-5 border-b-2 ${currentTheme.border} flex flex-col sm:flex-row items-start justify-between gap-4 sm:gap-6`}>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
                      {seeker.firstName} {seeker.lastName}
                    </h1>
                    <span className="text-[9px] font-black uppercase px-2 py-0.5 bg-slate-100 text-slate-700 rounded border border-slate-300">
                      PESO Oriental Mindoro Registered
                    </span>
                  </div>
                  <p className={`text-sm font-bold ${currentTheme.primary}`}>
                    {customTitle}
                  </p>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600 pt-1">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      {seeker.municipality}, Oriental Mindoro
                    </span>
                    <span className="flex items-center gap-1">
                      <Mail className="w-3.5 h-3.5 text-slate-400" />
                      {seeker.email}
                    </span>
                    <span className="flex items-center gap-1">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      {seeker.contactNumber}
                    </span>
                  </div>
                </div>

                {showPhoto && (
                  <img
                    src={seeker.profilePicture || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'}
                    alt={seeker.firstName}
                    className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover ring-2 ring-slate-200 shrink-0"
                  />
                )}
              </div>

              {/* Summary Section */}
              {showSummary && (
                <div className="space-y-1.5">
                  <h3 className={`text-xs font-black uppercase tracking-wider ${currentTheme.primary} flex items-center gap-1.5`}>
                    <FileText className="w-3.5 h-3.5" />
                    <span>Professional Profile Summary</span>
                  </h3>
                  <p className="text-xs text-slate-700 leading-relaxed text-justify">
                    {customSummary}
                  </p>
                </div>
              )}

              {/* Work Experience */}
              <div className="space-y-3">
                <h3 className={`text-xs font-black uppercase tracking-wider ${currentTheme.primary} flex items-center gap-1.5 border-b border-slate-100 pb-1`}>
                  <Briefcase className="w-3.5 h-3.5" />
                  <span>Work Experience & Relevant Employment</span>
                </h3>

                {seeker.workExperience && seeker.workExperience.length > 0 ? (
                  (seeker.workExperience || []).map((exp) => (
                    <div key={exp.id} className="text-xs space-y-1">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-0.5 sm:gap-2 font-bold text-slate-900">
                        <span>{exp.position} — <span className="font-semibold text-slate-700">{exp.company}</span></span>
                        <span className="text-[11px] text-slate-500 font-medium shrink-0">
                          {exp.startDate} - {exp.isCurrent ? 'Present' : exp.endDate}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600 leading-relaxed">
                        {exp.responsibilities}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-400 italic">Fresh graduate candidate ready for immediate placement.</p>
                )}
              </div>

              {/* Education */}
              <div className="space-y-3">
                <h3 className={`text-xs font-black uppercase tracking-wider ${currentTheme.primary} flex items-center gap-1.5 border-b border-slate-100 pb-1`}>
                  <GraduationCap className="w-3.5 h-3.5" />
                  <span>Educational Attainment</span>
                </h3>

                {seeker.education && seeker.education.length > 0 ? (
                  (seeker.education || []).map((edu) => (
                    <div key={edu.id} className="text-xs space-y-0.5">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-0.5 sm:gap-2 font-bold text-slate-900">
                        <span>{edu.degreeCourse}</span>
                        <span className="text-[11px] text-slate-500 shrink-0">{edu.yearGraduated}</span>
                      </div>
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-0.5 text-[11px] text-slate-600">
                        <span>{edu.school}</span>
                        {edu.honors && <span className="font-bold text-emerald-700">[{edu.honors}]</span>}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-xs text-slate-700">
                    <p className="font-bold">{seeker.primaryDegree}</p>
                    <p className="text-[11px] text-slate-500">{seeker.educationalAttainment}</p>
                  </div>
                )}
              </div>

              {/* Skills & Competencies */}
              <div className="space-y-2">
                <h3 className={`text-xs font-black uppercase tracking-wider ${currentTheme.primary} flex items-center gap-1.5 border-b border-slate-100 pb-1`}>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Skills & Competencies</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="font-bold text-slate-800 text-[11px] block mb-1">Technical Skills:</span>
                    <div className="flex flex-wrap gap-1">
                      {(seeker.technicalSkills || []).map((s, idx) => (
                        <span key={idx} className="text-[10px] bg-slate-100 text-slate-800 px-2 py-0.5 rounded border border-slate-200">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <span className="font-bold text-slate-800 text-[11px] block mb-1">Soft & Transferable Skills:</span>
                    <div className="flex flex-wrap gap-1">
                      {(seeker.softSkills || ['Communication', 'Teamwork', 'Critical Thinking']).map((s, idx) => (
                        <span key={idx} className="text-[10px] bg-slate-100 text-slate-800 px-2 py-0.5 rounded border border-slate-200">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Certifications & Civil Service */}
              {showCertifications && seeker.certifications && seeker.certifications.length > 0 && (
                <div className="space-y-2">
                  <h3 className={`text-xs font-black uppercase tracking-wider ${currentTheme.primary} flex items-center gap-1.5 border-b border-slate-100 pb-1`}>
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Certifications & Government Eligibility</span>
                  </h3>
                  <div className="space-y-1 text-xs">
                    {(seeker.certifications || []).map((c) => (
                      <div key={c.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-0.5 sm:gap-2">
                        <span className="font-semibold text-slate-900">{c.name}</span>
                        <span className="text-[11px] text-slate-500 shrink-0">{c.issuingOrganization} ({c.dateObtained})</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* PESO Endorsement & References */}
              {showReferences && (
                <div className="pt-4 border-t border-slate-200 text-center space-y-1 text-[10px] text-slate-500">
                  <p className="font-bold text-slate-700">Official Candidate Profile — Public Employment Service Office (PESO)</p>
                  <p>Province of Oriental Mindoro • Document verified through the eHANAP matching database</p>
                </div>
              )}

            </div>

          </div>

        </div>

      </div>
    </div>
  );
};

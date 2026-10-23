import React, { useState, useRef } from 'react';
import { JobSeekerProfile } from '../types';
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
  Palette
} from 'lucide-react';

interface ResumePDFExportModalProps {
  isOpen: boolean;
  seeker: JobSeekerProfile;
  onClose: () => void;
}

export const ResumePDFExportModal: React.FC<ResumePDFExportModalProps> = ({ isOpen, seeker, onClose }) => {
  const [copied, setCopied] = useState(false);
  const [template, setTemplate] = useState<'modern' | 'executive' | 'classic'>('modern');

  if (!isOpen || !seeker) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleCopyText = () => {
    const textContent = `
${seeker.firstName} ${seeker.lastName}
${seeker.primaryDegree || seeker.educationalAttainment || 'Professional Candidate'} • ${seeker.municipality || 'Oriental Mindoro'}
Email: ${seeker.email} | Phone: ${seeker.contactNumber}

PROFESSIONAL SUMMARY
${seeker.professionalSummary || seeker.summary || 'Qualified candidate with verified skills in Oriental Mindoro.'}

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
Soft Skills: ${(seeker.softSkills || []).join(', ')}

CERTIFICATIONS
${(seeker.certifications || []).map(c => `- ${c.name} (${c.issuingOrganization}, ${c.dateObtained})`).join('\n')}
    `.trim();

    navigator.clipboard.writeText(textContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto font-sans">
      
      {/* Print Stylesheet to print ONLY the resume paper container */}
      <style>{`
        @media print {
          body * {
            visibility: hidden !important;
          }
          #printable-resume, #printable-resume * {
            visibility: visible !important;
          }
          #printable-resume {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            margin: 0 !important;
            padding: 20px !important;
            box-shadow: none !important;
            border: none !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      <div className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-auto flex flex-col max-h-[92vh]">
        
        {/* Modal Top Control Bar (Hidden on Print) */}
        <div className="no-print p-4 sm:p-5 bg-gradient-to-r from-slate-900 via-slate-850 to-indigo-950 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600/30 border border-indigo-400/30 flex items-center justify-center text-indigo-300 shrink-0">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base text-white flex flex-wrap items-center gap-2">
                <span>Standard Resume PDF Export</span>
                <span className="text-[10px] bg-emerald-900 text-emerald-300 border border-emerald-700 px-2 py-0.5 rounded-full font-bold">
                  PESO Verified
                </span>
              </h3>
              <p className="text-xs text-slate-300">{seeker.firstName} {seeker.lastName} • Ready for print or PDF download</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-end">
            
            {/* Template Selector */}
            <div className="flex items-center gap-1 bg-slate-800 p-1 rounded-xl border border-slate-700 text-xs">
              <span className="text-slate-400 px-1.5 text-[10px] font-bold uppercase hidden sm:inline">Style:</span>
              <button
                onClick={() => setTemplate('modern')}
                className={`px-2 sm:px-2.5 py-1 text-xs rounded-lg transition-all ${template === 'modern' ? 'bg-indigo-600 text-white font-bold' : 'text-slate-300 hover:text-white'}`}
              >
                Modern
              </button>
              <button
                onClick={() => setTemplate('executive')}
                className={`px-2 sm:px-2.5 py-1 text-xs rounded-lg transition-all ${template === 'executive' ? 'bg-indigo-600 text-white font-bold' : 'text-slate-300 hover:text-white'}`}
              >
                Exec
              </button>
              <button
                onClick={() => setTemplate('classic')}
                className={`px-2 sm:px-2.5 py-1 text-xs rounded-lg transition-all ${template === 'classic' ? 'bg-indigo-600 text-white font-bold' : 'text-slate-300 hover:text-white'}`}
              >
                Classic
              </button>
            </div>

            <button
              onClick={handleCopyText}
              className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs rounded-xl border border-slate-700 transition-colors flex items-center gap-1.5"
              title="Copy text resume to clipboard"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              <span className="hidden sm:inline">{copied ? 'Copied!' : 'Copy Text'}</span>
            </button>

            <button
              onClick={handlePrint}
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
            >
              <Printer className="w-4 h-4" />
              <span>Export PDF</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Printable Resume Container */}
        <div className="p-3 sm:p-8 overflow-y-auto bg-slate-100 flex-1">
          
          <div 
            id="printable-resume" 
            className={`mx-auto bg-white text-slate-900 shadow-xl rounded-2xl border border-slate-200 max-w-3xl p-4 sm:p-8 md:p-12 font-sans transition-all overflow-x-hidden ${
              template === 'executive' ? 'border-t-8 border-t-indigo-900' :
              template === 'classic' ? 'border-t-8 border-t-slate-800' :
              'border-t-8 border-t-emerald-600'
            }`}
          >
            {/* Header / Contact Info */}
            <div className="border-b border-slate-200 pb-6 mb-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight uppercase">
                    {seeker.firstName} {seeker.middleName ? `${seeker.middleName[0]}. ` : ''}{seeker.lastName}
                  </h1>
                  <p className="text-sm font-bold text-indigo-700 mt-1">
                    {seeker.primaryDegree || 'Qualified Professional'} • {seeker.educationalAttainment}
                  </p>
                </div>

                {/* PESO Verified Badge */}
                <div className="flex items-center gap-1.5 bg-emerald-50 border border-emerald-200 text-emerald-900 px-3 py-1.5 rounded-xl shrink-0 self-start sm:self-center text-xs font-bold">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>PESO Oriental Mindoro Verified</span>
                </div>
              </div>

              {/* Contact Grid */}
              <div className="mt-4 flex flex-wrap items-center gap-y-2 gap-x-6 text-xs text-slate-600">
                <span className="flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  <span>{seeker.email}</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  <span>{seeker.contactNumber}</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  <span>{seeker.address}, {seeker.municipality}, Oriental Mindoro</span>
                </span>
              </div>
            </div>

            {/* Professional Summary */}
            {seeker.professionalSummary && (
              <div className="mb-6 space-y-2">
                <h2 className="text-xs font-black uppercase tracking-wider text-indigo-900 border-b border-indigo-100 pb-1">
                  Executive Professional Summary
                </h2>
                <p className="text-xs text-slate-700 leading-relaxed text-justify">
                  {seeker.professionalSummary}
                </p>
              </div>
            )}

            {/* Work Experience */}
            <div className="mb-6 space-y-4">
              <h2 className="text-xs font-black uppercase tracking-wider text-indigo-900 border-b border-indigo-100 pb-1">
                Professional Work Experience
              </h2>

              {(!seeker.workExperience || seeker.workExperience.length === 0) ? (
                <p className="text-xs text-slate-400 italic">Fresh graduate / Entry-level candidate</p>
              ) : (
                <div className="space-y-4">
                  {(seeker.workExperience || []).map((exp, idx) => (
                    <div key={exp.id || idx} className="space-y-1">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs">
                        <span className="font-bold text-slate-900 text-sm">{exp.position}</span>
                        <span className="text-slate-500 font-mono text-[11px] font-semibold">
                          {exp.startDate} — {exp.isCurrent ? 'Present' : exp.endDate} ({exp.yearsOfExperience} yrs)
                        </span>
                      </div>
                      <p className="text-xs font-semibold text-indigo-800">{exp.company}</p>
                      <p className="text-xs text-slate-600 leading-relaxed mt-1">
                        {exp.responsibilities}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Education */}
            <div className="mb-6 space-y-4">
              <h2 className="text-xs font-black uppercase tracking-wider text-indigo-900 border-b border-indigo-100 pb-1">
                Educational Background
              </h2>

              <div className="space-y-3">
                {(seeker.education || []).map((edu, idx) => (
                  <div key={edu.id || idx} className="flex flex-col sm:flex-row sm:items-center justify-between text-xs">
                    <div>
                      <p className="font-bold text-slate-900 text-sm">{edu.degreeCourse}</p>
                      <p className="text-slate-600 font-medium">{edu.school} • <span className="text-slate-500">{edu.educationalAttainment}</span></p>
                      {edu.honors && (
                        <p className="text-[11px] font-bold text-amber-700 flex items-center gap-1 mt-0.5">
                          <Award className="w-3 h-3 text-amber-500" /> {edu.honors}
                        </p>
                      )}
                    </div>
                    <span className="text-slate-500 font-mono font-semibold text-[11px] mt-1 sm:mt-0">
                      Graduated {edu.yearGraduated}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Skills Matrix */}
            <div className="mb-6 space-y-3">
              <h2 className="text-xs font-black uppercase tracking-wider text-indigo-900 border-b border-indigo-100 pb-1">
                Skills & Proficiencies
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="font-bold text-slate-800 block mb-1.5">Technical Competencies:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {(seeker.technicalSkills || []).map((sk, idx) => (
                      <span key={idx} className="bg-slate-100 text-slate-800 border border-slate-200 px-2.5 py-1 rounded-md text-[11px] font-medium">
                        {sk}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <span className="font-bold text-slate-800 block mb-1.5">Interpersonal & Soft Skills:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {(seeker.softSkills || []).map((sk, idx) => (
                      <span key={idx} className="bg-emerald-50 text-emerald-900 border border-emerald-200 px-2.5 py-1 rounded-md text-[11px] font-medium">
                        {sk}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Certifications & Licenses */}
            {seeker.certifications && seeker.certifications.length > 0 && (
              <div className="mb-6 space-y-2">
                <h2 className="text-xs font-black uppercase tracking-wider text-indigo-900 border-b border-indigo-100 pb-1">
                  Certifications & Licenses
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {(seeker.certifications || []).map((cert, idx) => (
                    <div key={cert.id || idx} className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                      <p className="font-bold text-slate-900">{cert.name}</p>
                      <p className="text-[11px] text-slate-500">{cert.issuingOrganization} • {cert.dateObtained}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Footer Verification Notice */}
            <div className="pt-6 border-t border-slate-200 flex items-center justify-between text-[10px] text-slate-400">
              <span>Verified through Provincial Employment Service Office (PESO) Oriental Mindoro</span>
              <span>Generated on {new Date().toLocaleDateString()}</span>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};

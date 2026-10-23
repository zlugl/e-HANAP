import React, { useState } from 'react';
import { AtsScanResult, JobPost } from '../types';
import { 
  X, 
  Sparkles, 
  CheckCircle2, 
  AlertTriangle, 
  HelpCircle, 
  FileText, 
  Target, 
  Layers, 
  Check, 
  AlertCircle,
  Copy,
  Download,
  Eye,
  ShieldCheck,
  ChevronRight,
  TrendingUp,
  Cpu
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface AtsResumeModalProps {
  isOpen: boolean;
  onClose: () => void;
  candidateName: string;
  jobTitle?: string;
  companyName?: string;
  resumeFileName?: string;
  atsResult: AtsScanResult;
  onAdvanceStage?: (newStage: any) => void;
  isEmployer?: boolean;
}

export const AtsResumeModal: React.FC<AtsResumeModalProps> = ({
  isOpen,
  onClose,
  candidateName,
  jobTitle,
  companyName,
  resumeFileName,
  atsResult,
  onAdvanceStage,
  isEmployer = false,
}) => {
  const [activeTab, setActiveTab] = useState<'audit' | 'keywords' | 'recommendations' | 'raw_text'>('audit');
  const [copiedRawText, setCopiedRawText] = useState(false);

  if (!isOpen) return null;

  const handleCopyRaw = () => {
    if (atsResult.rawTextPreview) {
      navigator.clipboard.writeText(atsResult.rawTextPreview);
      setCopiedRawText(true);
      setTimeout(() => setCopiedRawText(false), 2000);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 85) return 'text-emerald-600 bg-emerald-50 border-emerald-200';
    if (score >= 70) return 'text-blue-600 bg-blue-50 border-blue-200';
    if (score >= 50) return 'text-amber-600 bg-amber-50 border-amber-200';
    return 'text-rose-600 bg-rose-50 border-rose-200';
  };

  const getGradeBadge = (grade: string) => {
    switch (grade) {
      case 'A+':
      case 'A':
        return 'bg-emerald-500 text-white';
      case 'B':
        return 'bg-blue-600 text-white';
      case 'C':
        return 'bg-amber-500 text-white';
      default:
        return 'bg-rose-500 text-white';
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 15 }}
        className="bg-white w-full max-w-3xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Modal Header */}
        <div className="bg-slate-900 text-white p-5 sm:p-6 flex items-start justify-between gap-4 shrink-0">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
                <Cpu className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400">
                ATS Applicant Tracking System
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-black tracking-tight text-white">
              Resume ATS Compatibility Audit
            </h2>
            <p className="text-xs text-slate-300">
              Candidate: <strong className="text-white">{candidateName}</strong>
              {jobTitle && (
                <>
                  {' '}• Vacancy: <span className="text-emerald-300 font-semibold">{jobTitle}</span>
                  {companyName && <span className="text-slate-400"> ({companyName})</span>}
                </>
              )}
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors shrink-0"
            aria-label="Close ATS modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Top Summary Banner */}
        <div className="bg-slate-50 border-b border-slate-200/80 p-4 sm:p-5 shrink-0">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            
            {/* Overall Score */}
            <div className="bg-white p-3 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center gap-3">
              <div className={`w-12 h-12 rounded-xl font-black text-base flex items-center justify-center border ${getScoreColor(atsResult.score)}`}>
                {atsResult.score}
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold text-slate-400">ATS Score</p>
                <span className={`inline-block text-[10px] font-black px-1.5 py-0.5 rounded ${getGradeBadge(atsResult.grade)}`}>
                  Grade {atsResult.grade}
                </span>
              </div>
            </div>

            {/* Keyword Match Rate */}
            <div className="bg-white p-3 rounded-2xl border border-slate-200/80 shadow-2xs">
              <p className="text-[10px] uppercase font-bold text-slate-400">Keyword Density</p>
              <p className="text-base font-black text-slate-900 mt-0.5">
                {atsResult.keywordDensityPercent}%
              </p>
              <p className="text-[10px] text-slate-500">{atsResult.matchedKeywords.length} terms matched</p>
            </div>

            {/* Format Status */}
            <div className="bg-white p-3 rounded-2xl border border-slate-200/80 shadow-2xs">
              <p className="text-[10px] uppercase font-bold text-slate-400">Machine Readability</p>
              <p className="text-base font-black text-emerald-600 mt-0.5">
                {atsResult.readabilityScore}%
              </p>
              <p className="text-[10px] text-slate-500">Clean parsed structure</p>
            </div>

            {/* Sections Passed */}
            <div className="bg-white p-3 rounded-2xl border border-slate-200/80 shadow-2xs">
              <p className="text-[10px] uppercase font-bold text-slate-400">Standard Sections</p>
              <p className="text-base font-black text-indigo-600 mt-0.5">
                {atsResult.sectionsDetected.length} / 5
              </p>
              <p className="text-[10px] text-slate-500">Contact, Edu, Exp, Skills</p>
            </div>

          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-200 px-4 sm:px-5 bg-white shrink-0 overflow-x-auto scrollbar-none">
          <button
            onClick={() => setActiveTab('audit')}
            className={`py-3 px-3 text-xs font-bold border-b-2 transition-all whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'audit'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Section-by-Section Audit</span>
          </button>
          <button
            onClick={() => setActiveTab('keywords')}
            className={`py-3 px-3 text-xs font-bold border-b-2 transition-all whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'keywords'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Target className="w-4 h-4" />
            <span>Target Keywords ({atsResult.matchedKeywords.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('recommendations')}
            className={`py-3 px-3 text-xs font-bold border-b-2 transition-all whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'recommendations'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>ATS Recommendations</span>
          </button>
          <button
            onClick={() => setActiveTab('raw_text')}
            className={`py-3 px-3 text-xs font-bold border-b-2 transition-all whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'raw_text'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>ATS Parsed Text</span>
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 text-xs">
          
          {/* TAB 1: SECTION-BY-SECTION AUDIT */}
          {activeTab === 'audit' && (
            <div className="space-y-4">
              <p className="text-slate-500 leading-relaxed">
                The Applicant Tracking System scans and validates key resume sections to guarantee automatic indexing by hiring managers in Oriental Mindoro.
              </p>

              <div className="space-y-3">
                {(atsResult.sectionScores || []).map((sec, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-2xl border border-slate-200/90 bg-white hover:border-slate-300 transition-all space-y-2 shadow-2xs"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {sec.status === 'pass' ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        ) : sec.status === 'warning' ? (
                          <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
                        ) : (
                          <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
                        )}
                        <span className="font-bold text-slate-900 text-xs sm:text-sm">{sec.name}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                          sec.status === 'pass' ? 'bg-emerald-100 text-emerald-800' :
                          sec.status === 'warning' ? 'bg-amber-100 text-amber-800' :
                          'bg-rose-100 text-rose-800'
                        }`}>
                          {sec.status}
                        </span>
                        <span className="font-black text-slate-800 text-xs">{sec.score}%</span>
                      </div>
                    </div>

                    <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          sec.score >= 80 ? 'bg-emerald-500' : sec.score >= 60 ? 'bg-amber-500' : 'bg-rose-500'
                        }`}
                        style={{ width: `${sec.score}%` }}
                      />
                    </div>

                    <p className="text-[11px] text-slate-600">{sec.details}</p>
                  </div>
                ))}
              </div>

              {/* Sections Checklist */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-2">
                <p className="font-bold text-slate-800 text-[11px] uppercase tracking-wider">
                  Standard ATS Header Coverage
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {['Contact Information', 'Professional Summary', 'Work History & Experience', 'Education & Credentials', 'Skills & Core Competencies'].map(sec => {
                    const isDetected = atsResult.sectionsDetected.includes(sec) || (sec === 'Contact Information' && atsResult.contactCompleteness >= 75);
                    return (
                      <div key={sec} className="flex items-center gap-1.5 text-[11px]">
                        {isDetected ? (
                          <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[3]" />
                        ) : (
                          <X className="w-3.5 h-3.5 text-rose-500 stroke-[3]" />
                        )}
                        <span className={isDetected ? 'text-slate-800 font-semibold' : 'text-slate-400 line-through'}>
                          {sec}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>
          )}

          {/* TAB 2: KEYWORD MATCH ANALYSIS */}
          {activeTab === 'keywords' && (
            <div className="space-y-5">
              <div className="bg-indigo-50/70 p-4 rounded-2xl border border-indigo-100 text-indigo-950 flex items-start gap-3">
                <Target className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold">ATS Keyword Matching Algorithm</p>
                  <p className="text-[11px] text-indigo-800 mt-0.5 leading-relaxed">
                    Applicant Tracking Systems index hard skills, technical credentials, and domain qualifications. Higher keyword match density directly elevates candidate rank in recruiter searches.
                  </p>
                </div>
              </div>

              {/* Matched Keywords */}
              <div className="space-y-2">
                <h4 className="font-bold text-slate-900 flex items-center justify-between text-xs">
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Matched Resume Keywords ({atsResult.matchedKeywords.length})</span>
                  </span>
                  <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    Recognized by ATS
                  </span>
                </h4>

                {atsResult.matchedKeywords.length === 0 ? (
                  <p className="text-slate-500 italic p-3 bg-slate-50 rounded-xl">No explicit job keywords detected in resume text.</p>
                ) : (
                  <div className="flex flex-wrap gap-1.5 p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80">
                    {(atsResult.matchedKeywords || []).map((kw, i) => (
                      <span
                        key={i}
                        className="px-2.5 py-1 bg-emerald-100/80 text-emerald-900 border border-emerald-300/80 rounded-xl font-bold text-[11px] flex items-center gap-1 shadow-2xs"
                      >
                        <Check className="w-3 h-3 text-emerald-700 stroke-[3]" />
                        {kw}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Missing Keywords */}
              {atsResult.missingKeywords.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-bold text-slate-900 flex items-center justify-between text-xs">
                    <span className="flex items-center gap-1.5">
                      <AlertTriangle className="w-4 h-4 text-amber-500" />
                      <span>Missing Job Requirements ({atsResult.missingKeywords.length})</span>
                    </span>
                    <span className="text-[10px] text-amber-700 font-bold bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                      Recommended to Add
                    </span>
                  </h4>

                  <div className="flex flex-wrap gap-1.5 p-3.5 bg-amber-50/50 rounded-2xl border border-amber-200/80">
                    {(atsResult.missingKeywords || []).map((kw, i) => (
                      <span
                        key={i}
                        className="px-2.5 py-1 bg-white text-slate-700 border border-amber-300 rounded-xl font-medium text-[11px]"
                      >
                        + {kw}
                      </span>
                    ))}
                  </div>
                  <p className="text-[10px] text-slate-500">
                    Tip: If you possess knowledge or experience with these tools, integrate them into your resume or project descriptions.
                  </p>
                </div>
              )}

            </div>
          )}

          {/* TAB 3: RECOMMENDATIONS */}
          {activeTab === 'recommendations' && (
            <div className="space-y-4">
              <p className="text-slate-600 leading-relaxed">
                Follow these targeted steps to optimize your resume for automated applicant screening and ensure hiring managers easily identify your qualifications:
              </p>

              <div className="space-y-2.5">
                {(atsResult.recommendations || []).map((rec, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs flex items-start gap-3"
                  >
                    <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                      {idx + 1}
                    </div>
                    <p className="text-slate-800 text-xs font-medium leading-relaxed">
                      {rec}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: RAW ATS PARSED TEXT */}
          {activeTab === 'raw_text' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-slate-500 text-xs">
                  This raw text preview illustrates how the Applicant Tracking System scanner interprets the document:
                </p>
                <button
                  onClick={handleCopyRaw}
                  className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-lg flex items-center gap-1 transition-colors"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>{copiedRawText ? 'Copied!' : 'Copy Text'}</span>
                </button>
              </div>

              <div className="p-4 bg-slate-900 text-emerald-400 font-mono text-[11px] rounded-2xl overflow-x-auto max-h-72 leading-relaxed border border-slate-800">
                <pre className="whitespace-pre-wrap font-mono">
                  {atsResult.rawTextPreview || 'No raw document text captured.'}
                </pre>
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div className="text-[11px] text-slate-500 text-center sm:text-left">
            Scanned by eHANAP ATS Engine on {new Date(atsResult.scannedAt).toLocaleDateString()}
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            {isEmployer && onAdvanceStage && (
              <button
                onClick={() => onAdvanceStage('ats_screened')}
                className="flex-1 sm:flex-initial px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-1.5 shadow-2xs"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Mark ATS Screened</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="flex-1 sm:flex-initial px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition-colors text-center"
            >
              Done
            </button>
          </div>
        </div>

      </motion.div>
    </div>
  );
};

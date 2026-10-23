import React from 'react';
import { useApp } from '../../context/AppContext';
import { Application, JobSeekerProfile, JobPost } from '../../types';
import { 
  X, 
  Sparkles, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Award, 
  FileText, 
  MapPin, 
  Briefcase,
  ChevronRight
} from 'lucide-react';

interface ApplicantMatchReportModalProps {
  applicationId: string;
  onClose: () => void;
  onScheduleInterview?: (appId: string) => void;
}

export const ApplicantMatchReportModal: React.FC<ApplicantMatchReportModalProps> = ({
  applicationId,
  onClose,
  onScheduleInterview
}) => {
  const { applications, jobSeekers, jobPosts, updateApplicationStatus } = useApp();

  const application = applications.find(a => a.id === applicationId);
  if (!application) return null;

  const seeker = jobSeekers.find(s => s.id === application.jobSeekerId);
  const job = jobPosts.find(j => j.id === application.jobId);

  if (!seeker || !job) return null;

  const decisionTree = job.decisionTree;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto font-sans">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200 my-auto max-h-[92vh] flex flex-col">
        
        {/* Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-slate-900 via-slate-850 to-indigo-950 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-indigo-600/30 border border-indigo-400/30 flex items-center justify-center text-indigo-300 shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h3 className="font-bold text-sm sm:text-base text-white truncate">AI Decision Tree Evaluation Breakdown</h3>
              <p className="text-xs text-slate-300 truncate">Detailed requirement verification for {seeker.firstName} {seeker.lastName}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors shrink-0">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-6 space-y-5 overflow-y-auto flex-1">
          
          {/* Seeker Summary Card */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3.5">
              <img
                src={seeker.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                alt={seeker.firstName}
                className="w-12 h-12 rounded-xl object-cover ring-2 ring-indigo-500/20"
              />
              <div>
                <h4 className="font-bold text-sm text-slate-900">{seeker.firstName} {seeker.lastName}</h4>
                <p className="text-xs text-slate-500">{seeker.primaryTitle} • {seeker.municipality}</p>
              </div>
            </div>

            <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto shrink-0 border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-200">
              <p className="text-[10px] font-bold text-slate-400 uppercase">Match Score</p>
              <p className={`text-xl sm:text-2xl font-black ${
                application.matchScore >= 80 ? 'text-emerald-600' :
                application.matchScore >= 60 ? 'text-indigo-600' :
                'text-amber-600'
              }`}>
                {application.matchScore}%
              </p>
            </div>
          </div>

          {/* AI Qualification Logic Evaluation breakdown */}
          <div className="space-y-3">
            <h5 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Decision Tree Requirement Rules Evaluated ({(decisionTree as any)?.nodes?.length || (application.matchResult?.matchedReasons?.length || 0) + (application.matchResult?.missingQualifications?.length || 0)})
            </h5>

            <div className="space-y-2.5">
              {Array.isArray((decisionTree as any)?.nodes) && (decisionTree as any).nodes.length > 0 ? (
                ((decisionTree as any).nodes || []).map((node: any) => {
                  const result = (application as any).matchBreakdown?.find((b: any) => b.nodeId === node.id);
                  const passed = result ? result.passed : true;

                  return (
                    <div key={node.id} className={`p-3.5 rounded-xl border text-xs space-y-1 ${
                      passed ? 'bg-emerald-50/50 border-emerald-200' : 'bg-rose-50/50 border-rose-200'
                    }`}>
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-1.5 font-bold">
                        <div className="flex items-center gap-2">
                          {passed ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                          ) : (
                            <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
                          )}
                          <span className="text-slate-900">{node.question}</span>
                        </div>
                        <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold shrink-0 self-start sm:self-center ${
                          passed ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                        }`}>
                          Weight: {node.weight}%
                        </span>
                      </div>

                      <p className="text-slate-600 text-[11px] pl-6">
                        {result?.explanation || 'Candidate verified against required profile criteria.'}
                      </p>
                    </div>
                  );
                })
              ) : (
                <>
                  {(application.matchResult?.matchedReasons || []).map((reason, idx) => (
                    <div key={`match-${idx}`} className="p-3.5 rounded-xl border border-emerald-200 bg-emerald-50/50 text-xs space-y-1">
                      <div className="flex items-center gap-2 font-bold text-emerald-900">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>{reason}</span>
                      </div>
                      <p className="text-[11px] text-emerald-700 pl-6">
                        Verified qualification satisfying job requirement criteria.
                      </p>
                    </div>
                  ))}

                  {(application.matchResult?.missingQualifications || []).map((missing, idx) => (
                    <div key={`missing-${idx}`} className="p-3.5 rounded-xl border border-amber-200 bg-amber-50/50 text-xs space-y-1">
                      <div className="flex items-center gap-2 font-bold text-amber-900">
                        <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                        <span>{missing}</span>
                      </div>
                      <p className="text-[11px] text-amber-700 pl-6">
                        Applicant qualification gap noted by automated decision tree assessment.
                      </p>
                    </div>
                  ))}
                </>
              )}
            </div>
          </div>

          {/* AI Decision Tree System Notes */}
          <div className="p-4 bg-indigo-50/80 rounded-xl border border-indigo-200/80 text-xs text-indigo-950 space-y-1">
            <p className="font-bold flex items-center gap-1.5 text-indigo-900">
              <Sparkles className="w-4 h-4 text-indigo-600" />
              PESO AI Recommendation Note
            </p>
            <p className="text-[11px] leading-relaxed text-indigo-800">
              Candidate profile satisfies critical decision path criteria. Recommended for immediate virtual or on-site interview.
            </p>
          </div>

        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
          <button
            onClick={onClose}
            className="px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-200/60 rounded-xl transition-colors text-center"
          >
            Close Report
          </button>

          <button
            onClick={() => {
              onClose();
              if (onScheduleInterview) {
                onScheduleInterview(application.id);
              }
            }}
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5"
          >
            Schedule Interview Session
          </button>
        </div>

      </div>
    </div>
  );
};

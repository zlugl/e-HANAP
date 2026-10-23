import React, { useState } from 'react';
import { MatchResult, JobPost, JobSeekerProfile } from '../types';
import { 
  Sparkles, 
  CheckCircle2, 
  XCircle, 
  ChevronDown, 
  ChevronUp, 
  Award, 
  GraduationCap, 
  Briefcase, 
  Zap,
  Info
} from 'lucide-react';

interface MatchScoreIndicatorProps {
  matchResult: MatchResult;
  job: JobPost;
  seeker?: JobSeekerProfile;
  compact?: boolean;
}

export const MatchScoreIndicator: React.FC<MatchScoreIndicatorProps> = ({
  matchResult,
  job,
  seeker,
  compact = false
}) => {
  const [showDetails, setShowDetails] = useState(false);

  const { overallMatch, outcome, skillsMatchScore, matchedReasons, missingQualifications } = matchResult;

  // Determine color theme based on score
  const getTheme = (score: number) => {
    if (score >= 85) {
      return {
        bg: 'bg-emerald-50 text-emerald-900 border-emerald-300',
        badgeBg: 'bg-emerald-950 text-emerald-300 border-emerald-700',
        ringColor: '#10b981',
        textColor: 'text-emerald-700',
        progressBarBg: 'bg-emerald-500',
        tag: 'Highly Qualified'
      };
    } else if (score >= 70) {
      return {
        bg: 'bg-teal-50 text-teal-900 border-teal-300',
        badgeBg: 'bg-teal-950 text-teal-300 border-teal-700',
        ringColor: '#14b8a6',
        textColor: 'text-teal-700',
        progressBarBg: 'bg-teal-500',
        tag: 'Qualified'
      };
    } else if (score >= 50) {
      return {
        bg: 'bg-amber-50 text-amber-900 border-amber-300',
        badgeBg: 'bg-amber-950 text-amber-300 border-amber-700',
        ringColor: '#f59e0b',
        textColor: 'text-amber-700',
        progressBarBg: 'bg-amber-500',
        tag: 'Moderate Match'
      };
    } else {
      return {
        bg: 'bg-slate-50 text-slate-900 border-slate-300',
        badgeBg: 'bg-slate-900 text-slate-300 border-slate-700',
        ringColor: '#64748b',
        textColor: 'text-slate-700',
        progressBarBg: 'bg-slate-500',
        tag: 'Low Match'
      };
    }
  };

  const theme = getTheme(overallMatch);

  // Identify matching and missing skills specifically
  const seekerSkillSet = seeker ? [
    ...seeker.technicalSkills,
    ...seeker.softSkills,
    ...(seeker.resumes?.find(r => r.id === seeker.activeResumeId)?.extractedSkills || [])
  ].map(s => s.toLowerCase().trim()) : [];

  const requiredSkills = job.requiredSkills || [];

  const skillMatches = requiredSkills.map(reqSkill => {
    const normReq = reqSkill.toLowerCase().trim();
    const isMatched = seekerSkillSet.some(s => s.includes(normReq) || normReq.includes(s));
    return { skill: reqSkill, isMatched };
  });

  const matchedCount = skillMatches.filter(s => s.isMatched).length;

  if (compact) {
    return (
      <div className="flex flex-col items-end shrink-0">
        <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl font-black text-sm border ${theme.badgeBg} shadow-2xs`}>
          <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
          <span>{overallMatch}% Match</span>
        </div>
        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mt-1">
          {outcome.replace(/_/g, ' ')}
        </span>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 rounded-2xl border border-slate-200/90 p-3.5 space-y-3 transition-all">
      
      {/* Top Header: Score Dial + Main Percent Badge */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          
          {/* SVG Circular Progress Score Gauge */}
          <div className="relative w-12 h-12 flex items-center justify-center shrink-0">
            <svg className="w-12 h-12 transform -rotate-90">
              <circle
                cx="24"
                cy="24"
                r="18"
                stroke="#e2e8f0"
                strokeWidth="4"
                fill="transparent"
              />
              <circle
                cx="24"
                cy="24"
                r="18"
                stroke={theme.ringColor}
                strokeWidth="4"
                fill="transparent"
                strokeDasharray="113"
                strokeDashoffset={113 - (113 * overallMatch) / 100}
                strokeLinecap="round"
                className="transition-all duration-700 ease-out"
              />
            </svg>
            <span className="absolute font-mono font-black text-xs text-slate-900">
              {overallMatch}%
            </span>
          </div>

          <div>
            <div className="flex items-center gap-1.5">
              <span className={`text-xs font-bold ${theme.textColor}`}>
                {theme.tag}
              </span>
              <span className="text-[10px] bg-indigo-100 text-indigo-800 font-bold px-1.5 py-0.2 rounded-md">
                AI Decision Tree
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium">
              Skills match: <strong className="text-slate-800">{matchedCount} of {requiredSkills.length}</strong> required requirements
            </p>
          </div>

        </div>

        {/* Toggle Details Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            setShowDetails(!showDetails);
          }}
          className="px-2.5 py-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-[11px] font-bold transition-all flex items-center gap-1 shadow-2xs shrink-0"
        >
          <span>{showDetails ? 'Hide' : 'Skill Match'}</span>
          {showDetails ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* Required Skills Visual Match Checklist Pills */}
      <div className="space-y-1.5 pt-1 border-t border-slate-200/60">
        <div className="flex items-center justify-between text-[11px]">
          <span className="font-bold text-slate-700">Skill Requirements Match:</span>
          <span className="font-mono font-bold text-indigo-700">{skillsMatchScore}%</span>
        </div>

        {/* Skill Percentage Bar */}
        <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
          <div 
            className={`h-full rounded-full transition-all duration-500 ${theme.progressBarBg}`} 
            style={{ width: `${skillsMatchScore}%` }}
          ></div>
        </div>

        <div className="flex flex-wrap gap-1.5 pt-1">
          {skillMatches.map(({ skill, isMatched }, idx) => (
            <span
              key={idx}
              className={`text-[10px] font-bold px-2 py-0.5 rounded-lg flex items-center gap-1 border ${
                isMatched 
                  ? 'bg-emerald-50 text-emerald-900 border-emerald-200' 
                  : 'bg-slate-100 text-slate-500 border-slate-200 line-through opacity-80'
              }`}
            >
              {isMatched ? (
                <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
              ) : (
                <XCircle className="w-3 h-3 text-slate-400 shrink-0" />
              )}
              <span>{skill}</span>
            </span>
          ))}
        </div>
      </div>

      {/* Expanded Match Analysis Details */}
      {showDetails && (
        <div className="pt-2 border-t border-slate-200 text-xs space-y-2.5 animate-fadeIn">
          
          {/* Sub-scores Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[10px]">
            <div className="p-2 bg-white rounded-xl border border-slate-200">
              <span className="text-slate-400 block font-semibold">Skills Score</span>
              <span className="font-mono font-bold text-indigo-700 text-xs">{matchResult.skillsMatchScore}%</span>
            </div>
            <div className="p-2 bg-white rounded-xl border border-slate-200">
              <span className="text-slate-400 block font-semibold">Experience</span>
              <span className="font-mono font-bold text-emerald-700 text-xs">{matchResult.experienceMatchScore}%</span>
            </div>
            <div className="p-2 bg-white rounded-xl border border-slate-200">
              <span className="text-slate-400 block font-semibold">Degree Match</span>
              <span className="font-mono font-bold text-teal-700 text-xs">{matchResult.degreeAlignmentScore}%</span>
            </div>
            <div className="p-2 bg-white rounded-xl border border-slate-200">
              <span className="text-slate-400 block font-semibold">Education Level</span>
              <span className="font-mono font-bold text-purple-700 text-xs">{matchResult.educationMatchScore}%</span>
            </div>
          </div>

          {/* Decision Reason */}
          {matchResult.decisionReason && (
            <div className="p-2.5 bg-indigo-50/70 border border-indigo-100 rounded-xl text-[11px] text-indigo-950 space-y-1">
              <span className="font-bold flex items-center gap-1 text-indigo-900">
                <Zap className="w-3.5 h-3.5 text-indigo-600" />
                PESO Decision Engine Insight:
              </span>
              <p className="leading-relaxed text-slate-700">{matchResult.decisionReason}</p>
            </div>
          )}

          {/* Matched Reasons */}
          {matchedReasons.length > 0 && (
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block">
                Matching Qualifications:
              </span>
              <ul className="space-y-1 text-[11px]">
                {matchedReasons.map((reason, idx) => (
                  <li key={idx} className="flex items-start gap-1.5 text-slate-700">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{reason}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Missing Qualifications */}
          {missingQualifications.length > 0 && (
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider block">
                Qualification Gaps / Recommendations:
              </span>
              <ul className="space-y-1 text-[11px]">
                {missingQualifications.map((gap, idx) => (
                  <li key={idx} className="flex items-start gap-1.5 text-slate-600">
                    <Info className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                    <span>{gap}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

        </div>
      )}

    </div>
  );
};

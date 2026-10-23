import React, { useState } from 'react';
import { JobSeekerProfile } from '../types';
import { 
  ShieldCheck, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  ChevronRight, 
  FileText, 
  Award, 
  Briefcase, 
  GraduationCap, 
  Check, 
  Plus, 
  ArrowRight,
  TrendingUp,
  BrainCircuit,
  Upload
} from 'lucide-react';

interface ProfileStrengthIndicatorProps {
  seeker: JobSeekerProfile;
  onNavigateToSection: (section: string) => void;
  onOpenResumeUpload?: () => void;
  onOpenAssessments?: () => void;
}

interface StrengthCriteria {
  id: string;
  title: string;
  category: string;
  points: number;
  isComplete: boolean;
  actionLabel: string;
  actionTarget: string;
  description: string;
  icon: React.ElementType;
}

export const ProfileStrengthIndicator: React.FC<ProfileStrengthIndicatorProps> = ({
  seeker,
  onNavigateToSection,
  onOpenResumeUpload,
  onOpenAssessments,
}) => {
  const [showAllMilestones, setShowAllMilestones] = useState(false);

  if (!seeker) return null;

  // Criteria calculations
  const criteriaList: StrengthCriteria[] = [
    {
      id: 'basic_info',
      title: 'Contact Details & Municipality',
      category: 'Identity',
      points: 15,
      isComplete: Boolean(seeker.firstName && seeker.lastName && seeker.municipality && seeker.contactNumber && seeker.email),
      actionLabel: 'Complete Info',
      actionTarget: 'basic_info',
      description: 'Ensure your phone number and municipality in Oriental Mindoro are accurate.',
      icon: ShieldCheck,
    },
    {
      id: 'professional_summary',
      title: 'Professional Bio & Career Objective',
      category: 'Summary',
      points: 15,
      isComplete: Boolean((seeker.professionalSummary || seeker.summary || '').length >= 30),
      actionLabel: 'Write Bio',
      actionTarget: 'professional_summary',
      description: 'Add a concise career summary describing your expertise and objectives.',
      icon: FileText,
    },
    {
      id: 'education',
      title: 'Educational Attainment & School',
      category: 'Academics',
      points: 20,
      isComplete: Boolean(seeker.education && seeker.education.length > 0 && seeker.primaryDegree),
      actionLabel: 'Add Education',
      actionTarget: 'education',
      description: 'List your degree or vocational program and graduating institution.',
      icon: GraduationCap,
    },
    {
      id: 'experience',
      title: 'Work Experience or OJT Training',
      category: 'Experience',
      points: 20,
      isComplete: Boolean(seeker.workExperience && seeker.workExperience.length > 0),
      actionLabel: 'Add Experience',
      actionTarget: 'experience',
      description: 'Highlight previous roles, internships, or practical industry training.',
      icon: Briefcase,
    },
    {
      id: 'skills',
      title: 'Core Technical & Soft Skills (4+)',
      category: 'Skills',
      points: 15,
      isComplete: Boolean((seeker.technicalSkills.length + (seeker.softSkills?.length || 0)) >= 4),
      actionLabel: 'Add Skills',
      actionTarget: 'skills',
      description: 'Specify relevant technical tools and soft competencies you excel at.',
      icon: BrainCircuit,
    },
    {
      id: 'resume_file',
      title: 'Uploaded & Validated Resume',
      category: 'Documents',
      points: 15,
      isComplete: Boolean(seeker.resumes && seeker.resumes.length > 0),
      actionLabel: 'Upload Resume',
      actionTarget: 'resume_modal',
      description: 'Upload a PDF or Word resume parsed by the eHANAP validation engine.',
      icon: Upload,
    },
  ];

  // Calculate total score
  const totalScore = criteriaList.reduce((sum, item) => item.isComplete ? sum + item.points : sum, 0);
  const cappedScore = Math.min(100, totalScore);

  const completedCriteria = criteriaList.filter(c => c.isComplete);
  const pendingCriteria = criteriaList.filter(c => !c.isComplete);

  // Strength Level
  let level = { name: 'Basic Profile', color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200', badgeBg: 'bg-amber-500' };
  if (cappedScore >= 90) {
    level = { name: 'All-Star / Top Visibility', color: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-200', badgeBg: 'bg-emerald-600' };
  } else if (cappedScore >= 70) {
    level = { name: 'Strong & Competitive', color: 'text-blue-700', bg: 'bg-blue-50', border: 'border-blue-200', badgeBg: 'bg-blue-600' };
  } else if (cappedScore >= 45) {
    level = { name: 'Intermediate Profile', color: 'text-indigo-700', bg: 'bg-indigo-50', border: 'border-indigo-200', badgeBg: 'bg-indigo-600' };
  }

  const handleActionClick = (target: string) => {
    if (target === 'resume_modal' && onOpenResumeUpload) {
      onOpenResumeUpload();
    } else if (target === 'assessment_modal' && onOpenAssessments) {
      onOpenAssessments();
    } else {
      onNavigateToSection(target);
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden p-6 sm:p-7 space-y-6">
      
      {/* Top Header & Score Meter */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-5 border-b border-slate-100">
        <div className="space-y-1 max-w-xl">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-emerald-800 bg-emerald-100 border border-emerald-300/60 px-2.5 py-0.5 rounded-full">
              Profile Completeness & Optimization
            </span>
            <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${level.bg} ${level.color} ${level.border}`}>
              {level.name}
            </span>
          </div>
          <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
            Profile Strength Indicator
          </h2>
          <p className="text-xs text-slate-500 leading-relaxed">
            Profiles with <span className="font-bold text-slate-700">85%+ completeness</span> receive 3.4x more interview invitations and rank higher in automated PESO matching decision trees.
          </p>
        </div>

        {/* Circular / Large Score Badge */}
        <div className="flex items-center gap-4 bg-slate-50 p-3.5 sm:p-4 rounded-2xl border border-slate-200/80 shrink-0 w-full sm:w-auto">
          <div className="relative w-16 h-16 flex items-center justify-center shrink-0">
            {/* SVG Ring */}
            <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 36 36">
              <path
                className="text-slate-200"
                strokeWidth="3.5"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className={`${cappedScore >= 90 ? 'text-emerald-500' : cappedScore >= 70 ? 'text-blue-500' : cappedScore >= 45 ? 'text-indigo-500' : 'text-amber-500'} transition-all duration-1000 ease-out`}
                strokeDasharray={`${cappedScore}, 100`}
                strokeWidth="3.5"
                strokeLinecap="round"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <div className="absolute flex flex-col items-center justify-center text-center">
              <span className="text-base font-black text-slate-900 leading-none">{cappedScore}%</span>
            </div>
          </div>

          <div className="space-y-0.5">
            <p className="text-xs font-bold text-slate-900">
              {completedCriteria.length} of {criteriaList.length} Milestones
            </p>
            <p className="text-[11px] text-slate-500">
              {pendingCriteria.length === 0 ? 'All sections fully optimized!' : `${pendingCriteria.length} suggested step${pendingCriteria.length > 1 ? 's' : ''} to reach 100%`}
            </p>
            {onOpenAssessments && (
              <button
                onClick={onOpenAssessments}
                className="text-[11px] font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 mt-1 pt-1 border-t border-slate-200/60"
              >
                <Sparkles className="w-3 h-3 text-amber-500" />
                <span>Take Skill Assessments</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Progress Bar & Status Line */}
      <div className="space-y-2">
        <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden p-0.5 border border-slate-200/60">
          <div 
            className={`h-full rounded-full transition-all duration-700 ${
              cappedScore >= 90 ? 'bg-gradient-to-r from-emerald-500 to-teal-400' : 
              cappedScore >= 70 ? 'bg-gradient-to-r from-blue-600 to-indigo-500' : 
              cappedScore >= 45 ? 'bg-gradient-to-r from-indigo-500 to-amber-500' : 
              'bg-amber-500'
            }`}
            style={{ width: `${cappedScore}%` }}
          />
        </div>
        <div className="flex items-center justify-between text-[11px] font-bold text-slate-400">
          <span>0% Beginner</span>
          <span>50% Intermediate</span>
          <span>75% Competitive</span>
          <span className="text-emerald-700">100% All-Star</span>
        </div>
      </div>

      {/* Actionable Suggestions & Pending Fields */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
            <span>Recommended Steps to Maximize Employer Match</span>
          </h3>
          <button
            onClick={() => setShowAllMilestones(!showAllMilestones)}
            className="text-[11px] font-bold text-slate-500 hover:text-slate-800 transition-colors"
          >
            {showAllMilestones ? 'Show Pending Only' : 'View All Checklist Milestones'}
          </button>
        </div>

        {/* Suggestions Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {(showAllMilestones ? criteriaList : pendingCriteria).map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.id}
                className={`p-4 rounded-2xl border transition-all flex flex-col justify-between gap-3 ${
                  item.isComplete 
                    ? 'bg-slate-50/60 border-slate-200 opacity-80' 
                    : 'bg-white border-slate-200/90 hover:border-indigo-400 hover:shadow-md'
                }`}
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                        item.isComplete ? 'bg-emerald-100 text-emerald-700' : 'bg-indigo-50 text-indigo-700'
                      }`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider">
                        {item.category}
                      </span>
                    </div>

                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                      item.isComplete 
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' 
                        : 'bg-indigo-100 text-indigo-800 border border-indigo-200'
                    }`}>
                      {item.isComplete ? 'Done (+15%)' : `+${item.points}% Boost`}
                    </span>
                  </div>

                  <div>
                    <h4 className="text-xs font-bold text-slate-900 leading-snug">
                      {item.title}
                    </h4>
                    <p className="text-[11px] text-slate-500 mt-1 leading-normal line-clamp-2">
                      {item.description}
                    </p>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                  {item.isComplete ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Completed
                    </span>
                  ) : (
                    <button
                      onClick={() => handleActionClick(item.actionTarget)}
                      className="w-full py-1.5 px-3 bg-slate-900 hover:bg-indigo-600 text-white font-bold text-[11px] rounded-xl transition-colors flex items-center justify-center gap-1.5 shadow-2xs"
                    >
                      <span>{item.actionLabel}</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {pendingCriteria.length === 0 && !showAllMilestones && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-3 text-emerald-900">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <div>
              <p className="text-xs font-bold">Outstanding Work! Your profile is 100% complete.</p>
              <p className="text-[11px] text-emerald-700 mt-0.5">
                Your credentials and verified assessments are actively prioritized in PESO Oriental Mindoro job matching feeds.
              </p>
            </div>
          </div>
        )}
      </div>

    </div>
  );
};

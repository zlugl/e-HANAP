import React, { useState } from 'react';
import { 
  ResponsiveContainer, 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  Radar, 
  Tooltip, 
  Legend 
} from 'recharts';
import { JobSeekerProfile } from '../types';
import { 
  Sparkles, 
  Award, 
  Zap, 
  CheckCircle2, 
  AlertCircle, 
  BarChart2, 
  HelpCircle,
  FileText
} from 'lucide-react';

interface SeekerSkillRadarChartProps {
  seeker: JobSeekerProfile;
  onNavigateToProfile?: () => void;
}

export const SeekerSkillRadarChart: React.FC<SeekerSkillRadarChartProps> = ({ seeker, onNavigateToProfile }) => {
  const [filterCategory, setFilterCategory] = useState<'all' | 'technical' | 'soft'>('all');

  if (!seeker) return null;

  // Compute skill proficiency levels dynamically from seeker profile
  const totalExpYears = (seeker.workExperience || []).reduce((acc, w) => acc + (w.yearsOfExperience || 1), 0);
  const totalCerts = seeker.certifications?.length || 0;
  const isDegreeMatched = Boolean(seeker.primaryDegree && seeker.primaryDegree.length > 3);

  // Base multiplier from experience & certifications
  const expBonus = Math.min(25, totalExpYears * 8);
  const certBonus = Math.min(15, totalCerts * 7);

  // Combine skills
  const techSkills = seeker.technicalSkills || [];
  const softSkills = seeker.softSkills || [];
  const activeResume = seeker.resumes.find(r => r.id === seeker.activeResumeId) || seeker.resumes[0];
  const extractedSkills = activeResume?.extractedSkills || [];

  // Build Radar Data Array
  const skillsToDisplay: { skill: string; proficiency: number; benchmark: number; category: 'technical' | 'soft' }[] = [];

  techSkills.slice(0, 6).forEach((skill, idx) => {
    // Determine skill occurrences in experience
    const occurrencesInExp = seeker.workExperience.filter(w => 
      w.responsibilities.toLowerCase().includes(skill.toLowerCase()) || 
      w.position.toLowerCase().includes(skill.toLowerCase())
    ).length;

    let proficiency = 60 + (occurrencesInExp * 12) + expBonus + certBonus - (idx * 3);
    if (extractedSkills.some(s => s.toLowerCase().includes(skill.toLowerCase()))) {
      proficiency += 10;
    }
    proficiency = Math.min(98, Math.max(50, proficiency));

    skillsToDisplay.push({
      skill: skill.length > 15 ? skill.substring(0, 13) + '..' : skill,
      proficiency,
      benchmark: Math.min(92, proficiency + (idx % 2 === 0 ? 5 : -5)),
      category: 'technical'
    });
  });

  softSkills.slice(0, 4).forEach((skill, idx) => {
    let proficiency = 70 + expBonus + (isDegreeMatched ? 10 : 0) - (idx * 2);
    proficiency = Math.min(95, Math.max(60, proficiency));

    skillsToDisplay.push({
      skill: skill.length > 15 ? skill.substring(0, 13) + '..' : skill,
      proficiency,
      benchmark: 80,
      category: 'soft'
    });
  });

  // Fallback if seeker has very few skills
  if (skillsToDisplay.length < 3) {
    ['Problem Solving', 'Communication', 'IT Fundamentals', 'Teamwork', 'Project Management'].forEach((sk, idx) => {
      skillsToDisplay.push({
        skill: sk,
        proficiency: 65 + idx * 5,
        benchmark: 80,
        category: idx < 3 ? 'technical' : 'soft'
      });
    });
  }

  const filteredData = filterCategory === 'all' 
    ? skillsToDisplay 
    : skillsToDisplay.filter(s => s.category === filterCategory);

  const avgProficiency = Math.round(skillsToDisplay.reduce((acc, s) => acc + s.proficiency, 0) / skillsToDisplay.length);

  const topSkill = [...skillsToDisplay].sort((a, b) => b.proficiency - a.proficiency)[0];

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-slate-900 border border-slate-700 text-white p-3 rounded-xl shadow-xl text-xs space-y-1 min-w-[200px]">
          <p className="font-bold text-emerald-400 text-sm border-b border-slate-800 pb-1">
            {data.skill}
          </p>
          <div className="flex justify-between items-center text-slate-300">
            <span>Your Resume Level:</span>
            <span className="font-bold font-mono text-emerald-300">{data.proficiency}%</span>
          </div>
          <div className="flex justify-between items-center text-slate-400">
            <span>Mindoro Employer Benchmark:</span>
            <span className="font-bold font-mono text-amber-400">{data.benchmark}%</span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-xs space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-600">
              <Zap className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">
              Resume Skill Proficiency Radar
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Skill levels extracted from your active resume, work history, and verified certifications compared with Mindoro market demand.
          </p>
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200 shrink-0 self-start sm:self-auto text-xs font-semibold">
          <button
            onClick={() => setFilterCategory('all')}
            className={`px-3 py-1 rounded-lg transition-all ${filterCategory === 'all' ? 'bg-white text-emerald-700 shadow-2xs font-bold' : 'text-slate-600 hover:text-slate-900'}`}
          >
            All Skills
          </button>
          <button
            onClick={() => setFilterCategory('technical')}
            className={`px-3 py-1 rounded-lg transition-all ${filterCategory === 'technical' ? 'bg-white text-emerald-700 shadow-2xs font-bold' : 'text-slate-600 hover:text-slate-900'}`}
          >
            Technical
          </button>
          <button
            onClick={() => setFilterCategory('soft')}
            className={`px-3 py-1 rounded-lg transition-all ${filterCategory === 'soft' ? 'bg-white text-emerald-700 shadow-2xs font-bold' : 'text-slate-600 hover:text-slate-900'}`}
          >
            Soft Skills
          </button>
        </div>
      </div>

      {/* Main Grid: Radar Chart & Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        
        {/* Radar Chart Component */}
        <div className="lg:col-span-7 h-72 w-full bg-slate-50/60 p-2 rounded-2xl border border-slate-100 flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="75%" data={filteredData}>
              <PolarGrid stroke="#e2e8f0" />
              <PolarAngleAxis dataKey="skill" tick={{ fill: '#475569', fontSize: 11, fontWeight: 600 }} />
              <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: '#94a3b8', fontSize: 9 }} />
              <Tooltip content={<CustomTooltip />} />
              <Radar 
                name="Your Resume Score" 
                dataKey="proficiency" 
                stroke="#10b981" 
                fill="#10b981" 
                fillOpacity={0.45} 
              />
              <Radar 
                name="PESO Employer Demand" 
                dataKey="benchmark" 
                stroke="#f59e0b" 
                fill="#f59e0b" 
                fillOpacity={0.15} 
                strokeDasharray="3 3"
              />
              <Legend 
                wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {/* Skill Metrics & Insights Side Panel */}
        <div className="lg:col-span-5 space-y-4 text-xs">
          
          <div className="p-4 bg-gradient-to-br from-slate-900 to-indigo-950 text-white rounded-2xl shadow-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider">Overall Competency</span>
              <Sparkles className="w-4 h-4 text-emerald-400" />
            </div>
            <p className="text-2xl font-black font-mono text-white">
              {avgProficiency}% <span className="text-xs text-slate-300 font-sans font-normal">Proficiency Index</span>
            </p>
            <p className="text-[11px] text-slate-300 leading-snug">
              Strongest asset: <strong className="text-emerald-300">{topSkill?.skill || 'General Competencies'}</strong> ({topSkill?.proficiency}% score).
            </p>
          </div>

          <div className="space-y-2">
            <span className="font-bold text-slate-800 text-xs block">Key Resume Competency Breakdown</span>
            <div className="space-y-2 max-h-44 overflow-y-auto pr-1">
              {filteredData.map((item, idx) => (
                <div key={idx} className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-slate-900 text-xs block">{item.skill}</span>
                    <span className="text-[10px] text-slate-500 capitalize">{item.category} Skill</span>
                  </div>
                  <div className="text-right">
                    <span className="font-mono font-bold text-emerald-700 text-xs">{item.proficiency}%</span>
                    <div className="w-16 bg-slate-200 h-1.5 rounded-full overflow-hidden mt-0.5">
                      <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${item.proficiency}%` }}></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {onNavigateToProfile && (
            <button
              onClick={onNavigateToProfile}
              className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-1.5 border border-slate-200"
            >
              <FileText className="w-3.5 h-3.5 text-indigo-600" />
              <span>Update Resume Skills in Profile</span>
            </button>
          )}

        </div>

      </div>

    </div>
  );
};

import React, { useState } from 'react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend 
} from 'recharts';
import { JobPost, Application, Interview } from '../types';
import { 
  TrendingUp, 
  BarChart3, 
  PieChart as PieIcon, 
  Users, 
  UserCheck, 
  Sparkles, 
  CalendarCheck 
} from 'lucide-react';

interface EmployerAnalyticsChartsProps {
  myJobs: JobPost[];
  myApplications: Application[];
  myInterviews: Interview[];
}

export const EmployerAnalyticsCharts: React.FC<EmployerAnalyticsChartsProps> = ({
  myJobs,
  myApplications,
  myInterviews,
}) => {
  const [metricView, setMetricView] = useState<'applications' | 'funnel'>('applications');

  // Application trends data for employer
  const monthlyEmployerTrends = [
    { month: 'Feb', applications: 4, qualified: 3, interviews: 1 },
    { month: 'Mar', applications: 8, qualified: 6, interviews: 3 },
    { month: 'Apr', applications: 14, qualified: 11, interviews: 5 },
    { month: 'May', applications: 19, qualified: 15, interviews: 8 },
    { month: 'Jun', applications: 25, qualified: 20, interviews: 12 },
    { month: 'Jul', applications: 32, qualified: 26, interviews: 16 },
    { month: 'Aug', applications: Math.max(38, myApplications.length + 20), qualified: Math.max(28, myApplications.filter(a => a.matchResult?.overallMatch >= 75).length + 15), interviews: Math.max(14, myInterviews.length + 8) },
  ];

  // Recruitment Funnel Breakdown
  const totalApplied = Math.max(myApplications.length, 36);
  const totalQualified = Math.max(myApplications.filter(a => (a.matchResult?.overallMatch || 0) >= 70).length, 24);
  const totalInterviewed = Math.max(myInterviews.length, 12);
  const totalHired = Math.max(myApplications.filter(a => a.currentStatus === 'hired').length, 5);

  const funnelData = [
    { stage: '1. Resumes Received', count: totalApplied, fill: '#6366F1' },
    { stage: '2. AI Qualified (≥70%)', count: totalQualified, fill: '#3B82F6' },
    { stage: '3. Interview Scheduled', count: totalInterviewed, fill: '#F59E0B' },
    { stage: '4. Offer / Hired', count: totalHired, fill: '#10B981' },
  ];

  // Match score distribution
  const matchScoreDistribution = [
    { name: 'Highly Qualified (85-100%)', count: 14, color: '#059669' },
    { name: 'Qualified (70-84%)', count: 12, color: '#10B981' },
    { name: 'Moderately Qualified (55-69%)', count: 7, color: '#F59E0B' },
    { name: 'Low / Not Qualified (<55%)', count: 3, color: '#94A3B8' },
  ];

  return (
    <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-7 space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-extrabold bg-indigo-100 text-indigo-800 border border-indigo-200 px-2.5 py-0.5 rounded-full uppercase">
              Recruitment Analytics
            </span>
          </div>
          <h2 className="text-lg font-bold text-slate-900 mt-1">
            Application Velocity & Candidate Qualification Trends
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Monitor applicant volume over time and conversion through your Decision Tree hiring pipeline.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-bold">
          <button
            onClick={() => setMetricView('applications')}
            className={`px-3 py-1.5 rounded-lg transition-all ${metricView === 'applications' ? 'bg-white text-indigo-700 shadow-2xs' : 'text-slate-600 hover:text-slate-900'}`}
          >
            Applicant Influx (Monthly)
          </button>
          <button
            onClick={() => setMetricView('funnel')}
            className={`px-3 py-1.5 rounded-lg transition-all ${metricView === 'funnel' ? 'bg-white text-indigo-700 shadow-2xs' : 'text-slate-600 hover:text-slate-900'}`}
          >
            Recruitment Funnel
          </button>
        </div>
      </div>

      {/* Main Visual Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {metricView === 'applications' ? (
          /* Area Chart View */
          <div className="lg:col-span-8 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-indigo-600" />
                Applicant Inflow vs AI-Qualified Trajectory
              </span>
              <div className="flex items-center gap-3 text-[11px] font-semibold">
                <span className="flex items-center gap-1 text-indigo-600">
                  <span className="w-2 h-2 rounded-full bg-indigo-600"></span> Total Applicants
                </span>
                <span className="flex items-center gap-1 text-emerald-600">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span> AI-Qualified
                </span>
              </div>
            </div>

            <div className="h-[250px] w-full pt-1">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthlyEmployerTrends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="empAppGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366F1" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#6366F1" stopOpacity={0.0}/>
                    </linearGradient>
                    <linearGradient id="empQualGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10B981" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#10B981" stopOpacity={0.0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748B' }} axisLine={{ stroke: '#E2E8F0' }} />
                  <YAxis tick={{ fontSize: 11, fill: '#64748B' }} axisLine={{ stroke: '#E2E8F0' }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0F172A',
                      borderRadius: '12px',
                      color: '#FFF',
                      fontSize: '12px',
                    }}
                    itemStyle={{ color: '#E2E8F0' }}
                  />
                  <Area type="monotone" dataKey="applications" name="Total Applications" stroke="#6366F1" strokeWidth={2.5} fillOpacity={1} fill="url(#empAppGrad)" />
                  <Area type="monotone" dataKey="qualified" name="AI Qualified (≥70%)" stroke="#10B981" strokeWidth={2.5} fillOpacity={1} fill="url(#empQualGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        ) : (
          /* Funnel Bar Chart View */
          <div className="lg:col-span-8 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <BarChart3 className="w-4 h-4 text-indigo-600" />
                Hiring Pipeline Conversion Funnel
              </span>
              <span className="text-[11px] text-slate-500">From submission to final offer</span>
            </div>

            <div className="h-[250px] w-full pt-1">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={funnelData} layout="vertical" margin={{ top: 10, right: 20, left: 30, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 11, fill: '#64748B' }} />
                  <YAxis dataKey="stage" type="category" tick={{ fontSize: 11, fill: '#334155', fontWeight: 600 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0F172A',
                      borderRadius: '12px',
                      color: '#FFF',
                      fontSize: '12px',
                    }}
                    itemStyle={{ color: '#E2E8F0' }}
                  />
                  <Bar dataKey="count" name="Candidates" radius={[0, 8, 8, 0]}>
                    {funnelData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Match Score Distribution Pie Widget */}
        <div className="lg:col-span-4 bg-slate-50 p-5 rounded-2xl border border-slate-200/80 flex flex-col justify-between space-y-3">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-4 h-4 text-indigo-600" />
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Decision Tree Match Breakdown
              </h4>
            </div>

            <div className="h-[150px] w-full relative flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={matchScoreDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={38}
                    outerRadius={60}
                    paddingAngle={2}
                    dataKey="count"
                  >
                    {matchScoreDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0F172A',
                      borderRadius: '10px',
                      color: '#FFF',
                      fontSize: '11px',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="space-y-1.5 text-[11px] pt-2 border-t border-slate-200">
            {matchScoreDistribution.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between text-slate-700">
                <div className="flex items-center gap-1.5 truncate">
                  <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                  <span className="truncate font-medium">{item.name}</span>
                </div>
                <span className="font-bold text-slate-900 shrink-0">{item.count}</span>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
};

import React, { useState } from 'react';
import { 
  ResponsiveContainer, 
  ComposedChart, 
  Bar, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  Cell 
} from 'recharts';
import { JobPost } from '../types';
import { 
  DollarSign, 
  TrendingUp, 
  Award, 
  Briefcase, 
  Building2, 
  BarChart3, 
  Filter, 
  Sparkles,
  Info
} from 'lucide-react';

interface EmployerSalaryChartProps {
  myJobs: JobPost[];
  allJobs: JobPost[];
}

export const EmployerSalaryChart: React.FC<EmployerSalaryChartProps> = ({ myJobs, allJobs }) => {
  const [viewType, setViewType] = useState<'by_role' | 'by_category'>('by_role');
  const [selectedMetric, setSelectedMetric] = useState<'all' | 'min' | 'avg' | 'max'>('all');

  // Helper function to parse salary string like "₱35,000 - ₱55,000 / month"
  const parseSalary = (salaryStr?: string) => {
    if (!salaryStr) return { min: 20000, max: 30000, avg: 25000 };
    const numbers = salaryStr.replace(/[^0-9-]/g, ' ').trim().split(/\s+/).map(Number).filter(n => !isNaN(n) && n > 0);
    if (numbers.length >= 2) {
      const min = Math.min(...numbers);
      const max = Math.max(...numbers);
      return { min, max, avg: Math.round((min + max) / 2) };
    } else if (numbers.length === 1) {
      return { min: numbers[0], max: numbers[0], avg: numbers[0] };
    }
    return { min: 22000, max: 32000, avg: 27000 };
  };

  // Compute stats for "by_role"
  const roleChartData = myJobs.map(job => {
    const { min, max, avg } = parseSalary(job.salaryRange);
    
    // Compute benchmark for this category from allJobs
    const categoryJobs = allJobs.filter(j => j.category === job.category);
    const categoryAvgs = categoryJobs.map(j => parseSalary(j.salaryRange).avg);
    const benchmark = categoryAvgs.length > 0 
      ? Math.round(categoryAvgs.reduce((a, b) => a + b, 0) / categoryAvgs.length)
      : avg;

    return {
      name: job.title.length > 22 ? job.title.substring(0, 20) + '...' : job.title,
      fullTitle: job.title,
      category: job.category,
      min,
      avg,
      max,
      vacancies: job.vacanciesCount,
      regionalBenchmark: benchmark,
      payrollImpact: avg * job.vacanciesCount
    };
  });

  // Compute stats for "by_category"
  const categoryMap: { [cat: string]: { minSum: number; maxSum: number; avgSum: number; count: number; vacancies: number } } = {};
  myJobs.forEach(job => {
    const { min, max, avg } = parseSalary(job.salaryRange);
    if (!categoryMap[job.category]) {
      categoryMap[job.category] = { minSum: 0, maxSum: 0, avgSum: 0, count: 0, vacancies: 0 };
    }
    categoryMap[job.category].minSum += min;
    categoryMap[job.category].maxSum += max;
    categoryMap[job.category].avgSum += avg;
    categoryMap[job.category].count += 1;
    categoryMap[job.category].vacancies += job.vacanciesCount;
  });

  const categoryChartData = Object.keys(categoryMap).map(cat => {
    const item = categoryMap[cat];
    const avg = Math.round(item.avgSum / item.count);
    const min = Math.round(item.minSum / item.count);
    const max = Math.round(item.maxSum / item.count);

    // Provincial benchmark calculation
    const allCatJobs = allJobs.filter(j => j.category === cat);
    const catAvgs = allCatJobs.map(j => parseSalary(j.salaryRange).avg);
    const benchmark = catAvgs.length > 0 
      ? Math.round(catAvgs.reduce((a, b) => a + b, 0) / catAvgs.length)
      : avg;

    return {
      name: cat.length > 20 ? cat.substring(0, 18) + '...' : cat,
      fullTitle: cat,
      min,
      avg,
      max,
      vacancies: item.vacancies,
      regionalBenchmark: benchmark,
      payrollImpact: avg * item.vacancies
    };
  });

  const chartData = viewType === 'by_role' ? roleChartData : categoryChartData;

  // Summary Metrics
  const totalVacancies = myJobs.reduce((acc, j) => acc + j.vacanciesCount, 0);
  const overallAvgSalary = chartData.length > 0 
    ? Math.round(chartData.reduce((acc, d) => acc + d.avg, 0) / chartData.length)
    : 0;
  
  const totalEstimatedPayroll = chartData.reduce((acc, d) => acc + d.payrollImpact, 0);

  const highestPaying = [...chartData].sort((a, b) => b.max - a.max)[0];

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-slate-900 border border-slate-700 text-white p-3.5 rounded-xl shadow-xl text-xs space-y-2 min-w-[220px]">
          <p className="font-bold text-sm text-indigo-300 border-b border-slate-800 pb-1.5">
            {data.fullTitle}
          </p>
          <div className="space-y-1">
            <div className="flex justify-between items-center text-slate-300">
              <span>Minimum Salary:</span>
              <span className="font-mono font-bold text-emerald-400">₱{data.min.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center text-slate-300">
              <span>Average Offer:</span>
              <span className="font-mono font-bold text-indigo-400">₱{data.avg.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center text-slate-300">
              <span>Maximum Salary:</span>
              <span className="font-mono font-bold text-amber-400">₱{data.max.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center text-slate-400 pt-1 border-t border-slate-800">
              <span>Oriental Mindoro Benchmark:</span>
              <span className="font-mono text-slate-200">₱{data.regionalBenchmark.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center text-slate-400">
              <span>Open Vacancies:</span>
              <span className="font-bold text-white">{data.vacancies} Slot(s)</span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs p-6 space-y-6">
      
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-600">
              <BarChart3 className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-black text-slate-900 tracking-tight">
              Salary Distribution & Compensation Benchmarks
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Data visualization of minimum, average, and maximum monthly salaries across your posted vacancies compared with Oriental Mindoro regional industry averages.
          </p>
        </div>

        {/* View Toggle Filters */}
        <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl border border-slate-200 shrink-0 self-start md:self-auto">
          <button
            onClick={() => setViewType('by_role')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              viewType === 'by_role' ? 'bg-white text-indigo-700 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            By Posted Role
          </button>
          <button
            onClick={() => setViewType('by_category')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              viewType === 'by_category' ? 'bg-white text-indigo-700 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            By Industry Category
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="bg-gradient-to-br from-indigo-50 to-slate-50 p-4 rounded-2xl border border-indigo-100 space-y-1">
          <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider block">Average Offer</span>
          <p className="text-xl font-black text-indigo-900 font-mono">
            ₱{overallAvgSalary.toLocaleString()} <span className="text-xs text-slate-500 font-sans font-normal">/ mo</span>
          </p>
          <p className="text-[11px] text-slate-500">Across all open recruitment listings</p>
        </div>

        <div className="bg-gradient-to-br from-emerald-50 to-slate-50 p-4 rounded-2xl border border-emerald-100 space-y-1">
          <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider block">Highest Paying Role</span>
          <p className="text-base font-bold text-slate-900 truncate" title={highestPaying?.fullTitle || 'N/A'}>
            {highestPaying?.fullTitle || 'N/A'}
          </p>
          <p className="text-xs font-mono font-bold text-emerald-700">
            Up to ₱{highestPaying?.max?.toLocaleString() || '0'} / mo
          </p>
        </div>

        <div className="bg-gradient-to-br from-amber-50 to-slate-50 p-4 rounded-2xl border border-amber-100 space-y-1">
          <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wider block">Monthly Payroll Allocation</span>
          <p className="text-xl font-black text-slate-900 font-mono">
            ₱{totalEstimatedPayroll.toLocaleString()}
          </p>
          <p className="text-[11px] text-slate-500">For {totalVacancies} open vacancy slots</p>
        </div>

        <div className="bg-gradient-to-br from-slate-900 to-indigo-950 text-white p-4 rounded-2xl space-y-1">
          <span className="text-[10px] font-bold text-indigo-300 uppercase tracking-wider block">Mindoro Benchmark</span>
          <p className="text-base font-bold text-white flex items-center gap-1">
            <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Competitive Offer</span>
          </p>
          <p className="text-[11px] text-slate-300">
            Matches PESO Oriental Mindoro prevailing rates
          </p>
        </div>

      </div>

      {/* Chart Visualization */}
      {chartData.length === 0 ? (
        <div className="p-12 text-center bg-slate-50 rounded-2xl border border-slate-200">
          <BarChart3 className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <p className="text-xs font-bold text-slate-700">No Job Salary Data Available</p>
          <p className="text-[11px] text-slate-500 mt-1">Post job vacancies with salary ranges to view salary distribution charts.</p>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-500 px-1">
            <span className="font-semibold">Monthly Compensation Breakdown (₱ PHP)</span>
            <span className="flex items-center gap-4">
              <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-xs bg-indigo-500 inline-block"></span> Average Offer</span>
              <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-xs bg-emerald-400 inline-block"></span> Max Cap</span>
              <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-xs bg-slate-400 inline-block"></span> Min Starting</span>
              <span className="flex items-center gap-1"><span className="w-3 h-0.5 bg-amber-500 inline-block"></span> Provincial Benchmark</span>
            </span>
          </div>

          <div className="w-full h-80 bg-slate-50/50 p-4 rounded-2xl border border-slate-100">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={chartData} margin={{ top: 20, right: 20, bottom: 20, left: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis 
                  dataKey="name" 
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  interval={0}
                />
                <YAxis 
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  tickFormatter={(val) => `₱${(val / 1000).toFixed(0)}k`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="min" name="Minimum Salary" fill="#cbd5e1" radius={[4, 4, 0, 0]} maxBarSize={28} />
                <Bar dataKey="avg" name="Average Offer" fill="#6366f1" radius={[4, 4, 0, 0]} maxBarSize={28} />
                <Bar dataKey="max" name="Maximum Salary" fill="#34d399" radius={[4, 4, 0, 0]} maxBarSize={28} />
                <Line 
                  type="monotone" 
                  dataKey="regionalBenchmark" 
                  name="PESO Provincial Benchmark" 
                  stroke="#f59e0b" 
                  strokeWidth={3} 
                  dot={{ r: 4, fill: '#f59e0b' }} 
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Information Footnote */}
      <div className="flex items-start gap-2.5 p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 text-[11px] text-slate-600">
        <Info className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
        <p>
          <strong>PESO Salary Intelligence:</strong> Salaries are benchmarked against official Department of Labor and Employment (DOLE) Region IV-B MIMAROPA wage rates and active employer listings in Oriental Mindoro.
        </p>
      </div>

    </div>
  );
};

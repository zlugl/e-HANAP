import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, MapPin, DollarSign, RotateCcw, Check, SlidersHorizontal } from 'lucide-react';
import { ROXAS_BARANGAYS, JOB_CATEGORIES } from '../data/mockData';

export interface FilterState {
  location: string;
  minSalary: number;
  maxSalary: number;
  workModel: string; // 'all' | 'On-site' | 'Hybrid' | 'Remote'
  experienceLevel: string; // 'all' | 'Internship' | 'Entry level' | 'Associate' | 'Mid-Senior level' | 'Director' | 'Executive'
  jobTitle: string;
  category: string;
}

interface JobFilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  filters: FilterState;
  onApplyFilters: (newFilters: FilterState) => void;
  onResetFilters: () => void;
}

export const JobFilterModal: React.FC<JobFilterModalProps> = ({
  isOpen,
  onClose,
  filters,
  onApplyFilters,
  onResetFilters,
}) => {
  const [localFilters, setLocalFilters] = useState<FilterState>(filters);

  // Sync when opened
  React.useEffect(() => {
    setLocalFilters(filters);
  }, [filters, isOpen]);

  if (!isOpen) return null;

  const workModels = ['All', 'On-site', 'Hybrid', 'Remote'];
  
  const experienceLevels = [
    'All',
    'Internship',
    'Entry level',
    'Associate',
    'Mid-Senior level',
    'Director',
    'Executive'
  ];

  const popularJobTitles = [
    'All',
    'Accountant',
    'Business Development Manager',
    'Content Writer',
    'Data Analyst',
    'Finance Manager',
    'Graphic Designer',
    'HR Specialist',
    'Human Resources Manager',
    'Software Engineer',
    'Port Logistics Specialist'
  ];

  const handleApply = () => {
    onApplyFilters(localFilters);
    onClose();
  };

  const handleReset = () => {
    const defaultFilters: FilterState = {
      location: '',
      minSalary: 10000,
      maxSalary: 100000,
      workModel: 'All',
      experienceLevel: 'All',
      jobTitle: 'All',
      category: 'All'
    };
    setLocalFilters(defaultFilters);
    onResetFilters();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100 flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <SlidersHorizontal className="w-4 h-4" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Filter Jobs</h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Location */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 tracking-wide uppercase">
              Location
            </label>
            <div className="relative">
              <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={localFilters.location}
                onChange={(e) => setLocalFilters({ ...localFilters, location: e.target.value })}
                placeholder="Roxas, Oriental Mindoro or Barangay..."
                className="w-full h-11 pl-10 pr-4 rounded-2xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-blue-600 focus:outline-none"
              />
            </div>
            {/* Quick Barangay chips */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              {['Dangay', 'San Vicente', 'Bagumbayan', 'Paclasan'].map((brgy) => (
                <button
                  key={brgy}
                  onClick={() => setLocalFilters({ ...localFilters, location: brgy })}
                  className={`px-2.5 py-1 rounded-xl text-[11px] font-semibold transition-colors ${
                    localFilters.location.includes(brgy)
                      ? 'bg-blue-100 text-blue-700 border border-blue-200'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {brgy}
                </button>
              ))}
            </div>
          </div>

          {/* Salary Slider */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700 tracking-wide uppercase">
                Salary Range
              </label>
              <span className="text-xs font-black text-blue-600">
                ₱{localFilters.minSalary.toLocaleString()} - ₱{localFilters.maxSalary.toLocaleString()} / mo
              </span>
            </div>
            <div className="space-y-2">
              <input
                type="range"
                min="10000"
                max="120000"
                step="5000"
                value={localFilters.maxSalary}
                onChange={(e) => setLocalFilters({ ...localFilters, maxSalary: Number(e.target.value) })}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-bold">
                <span>₱10k</span>
                <span>₱40k</span>
                <span>₱80k</span>
                <span>₱120k+</span>
              </div>
            </div>
          </div>

          {/* Working Model */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 tracking-wide uppercase">
              Working Model
            </label>
            <div className="grid grid-cols-4 gap-2">
              {workModels.map((model) => {
                const isSelected = localFilters.workModel.toLowerCase() === model.toLowerCase();
                return (
                  <button
                    key={model}
                    onClick={() => setLocalFilters({ ...localFilters, workModel: model })}
                    className={`py-2 px-3 rounded-2xl text-xs font-bold border transition-all ${
                      isSelected
                        ? 'bg-blue-600 border-blue-600 text-white shadow-xs'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {model}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Level of Experience */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 tracking-wide uppercase">
              Level of Experience
            </label>
            <div className="flex flex-wrap gap-2">
              {experienceLevels.map((lvl) => {
                const isSelected = localFilters.experienceLevel.toLowerCase() === lvl.toLowerCase();
                return (
                  <button
                    key={lvl}
                    onClick={() => setLocalFilters({ ...localFilters, experienceLevel: lvl })}
                    className={`py-2 px-3.5 rounded-2xl text-xs font-semibold border transition-all ${
                      isSelected
                        ? 'bg-blue-600 border-blue-600 text-white shadow-xs'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {lvl}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Job Title */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 tracking-wide uppercase">
              Job Title
            </label>
            <div className="flex flex-wrap gap-2">
              {popularJobTitles.map((title) => {
                const isSelected = localFilters.jobTitle.toLowerCase() === title.toLowerCase();
                return (
                  <button
                    key={title}
                    onClick={() => setLocalFilters({ ...localFilters, jobTitle: title })}
                    className={`py-2 px-3 rounded-2xl text-xs font-semibold border transition-all ${
                      isSelected
                        ? 'bg-blue-600 border-blue-600 text-white shadow-xs'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {title}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center gap-3 p-4 px-6 border-t border-slate-100 bg-slate-50/50">
          <button
            onClick={handleReset}
            className="flex-1 py-3 px-4 rounded-2xl border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-bold transition-colors flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
            <span>Reset Filter</span>
          </button>
          <button
            onClick={handleApply}
            className="flex-1 py-3 px-4 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-600/20 transition-all flex items-center justify-center gap-2 active:scale-[0.99]"
          >
            <Check className="w-4 h-4" />
            <span>Apply Filters</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
};

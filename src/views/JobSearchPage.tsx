import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { ROXAS_BARANGAYS, JOB_CATEGORIES } from '../data/mockData';
import { calculateDecisionTreeMatch } from '../utils/decisionTree';
import { ApplicationTrackingBar } from '../components/ApplicationTrackingBar';
import { 
  Search, 
  MapPin, 
  Briefcase, 
  Sparkles, 
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  X,
  SlidersHorizontal,
  Building2,
  Heart,
  LayoutGrid,
  List,
  Folder,
  Banknote,
  CheckCircle2,
  Zap
} from 'lucide-react';

interface JobSearchPageProps {
  initialQuery?: string;
  initialBarangay?: string;
  initialMunicipality?: string;
  onNavigate: (view: string, params?: any) => void;
}

// Visual palette generator for company squircle logos matching image.png
const LOGO_THEMES = [
  { bg: 'bg-orange-500 text-white', letter: 'A' },
  { bg: 'bg-slate-900 text-white', letter: 'S' },
  { bg: 'bg-purple-600 text-white', letter: 'C' },
  { bg: 'bg-emerald-600 text-white', letter: 'M' },
  { bg: 'bg-amber-500 text-white', letter: 'F' },
  { bg: 'bg-rose-500 text-white', letter: 'H' },
  { bg: 'bg-blue-600 text-white', letter: 'T' },
  { bg: 'bg-indigo-600 text-white', letter: 'P' },
];

export const JobSearchPage: React.FC<JobSearchPageProps> = ({ 
  initialQuery = '', 
  initialBarangay = '', 
  initialMunicipality = '',
  onNavigate 
}) => {
  const { 
    jobPosts, 
    currentSeekerProfile, 
    applications, 
    bookmarkedJobIds, 
    toggleBookmarkJob, 
    showToast 
  } = useApp();

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [selectedBarangay, setSelectedBarangay] = useState(initialBarangay || initialMunicipality);
  const [selectedCategory, setSelectedCategory] = useState('');
  
  // Sidebar Checkboxes & Selects
  const [selectedJobTypes, setSelectedJobTypes] = useState<string[]>([]);
  const [minSalaryFilter, setMinSalaryFilter] = useState<number>(0);
  const [maxSalaryFilter, setMaxSalaryFilter] = useState<number>(0);
  const [selectedExperienceLevels, setSelectedExperienceLevels] = useState<string[]>([]);
  const [selectedCareerLevels, setSelectedCareerLevels] = useState<string[]>([]);
  
  // UI Display Controls
  const [sortBy, setSortBy] = useState<'newest' | 'match' | 'deadline'>('newest');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const ITEMS_PER_PAGE = 8;

  // Toggle helpers for multi-select checkboxes
  const toggleJobType = (type: string) => {
    setSelectedJobTypes(prev => 
      prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
    );
    setCurrentPage(1);
  };

  const toggleExperienceLevel = (level: string) => {
    setSelectedExperienceLevels(prev => 
      prev.includes(level) ? prev.filter(l => l !== level) : [...prev, level]
    );
    setCurrentPage(1);
  };

  const toggleCareerLevel = (level: string) => {
    setSelectedCareerLevels(prev => 
      prev.includes(level) ? prev.filter(c => c !== level) : [...prev, level]
    );
    setCurrentPage(1);
  };

  // Filter & Score active job posts in Roxas
  const filteredJobs = useMemo(() => {
    let result = jobPosts.filter(j => j.status === 'active');

    // 1. Search Query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(j => 
        j.title.toLowerCase().includes(q) ||
        j.companyName.toLowerCase().includes(q) ||
        j.description.toLowerCase().includes(q) ||
        (j.requiredSkills && j.requiredSkills.some(s => s.toLowerCase().includes(q))) ||
        (j.workLocation && j.workLocation.toLowerCase().includes(q))
      );
    }

    // 2. Barangay / Location Filter
    if (selectedBarangay) {
      result = result.filter(j => 
        (j.workLocation && j.workLocation.toLowerCase().includes(selectedBarangay.toLowerCase())) ||
        (j.municipality && j.municipality.toLowerCase().includes(selectedBarangay.toLowerCase())) ||
        j.description.toLowerCase().includes(selectedBarangay.toLowerCase())
      );
    }

    // 3. Category Filter
    if (selectedCategory) {
      result = result.filter(j => 
        j.category.toLowerCase().includes(selectedCategory.toLowerCase())
      );
    }

    // 4. Job Types Checkbox Filter
    if (selectedJobTypes.length > 0) {
      result = result.filter(j => {
        const typeLower = (j.employmentType || '').toLowerCase();
        return selectedJobTypes.some(t => {
          if (t === 'Full Time') return typeLower.includes('full');
          if (t === 'Part Time') return typeLower.includes('part');
          if (t === 'Contractor') return typeLower.includes('contract');
          if (t === 'Temporary') return typeLower.includes('temporary') || typeLower.includes('seasonal');
          if (t === 'Intern') return typeLower.includes('intern') || typeLower.includes('ojt');
          return typeLower.includes(t.toLowerCase());
        });
      });
    }

    // 5. Experience Level Checkbox Filter
    if (selectedExperienceLevels.length > 0) {
      result = result.filter(j => {
        const exp = j.minExperienceYears ?? 0;
        return selectedExperienceLevels.some(l => {
          if (l === 'Fresh') return exp === 0;
          if (l === '1 - 2 Years') return exp >= 1 && exp <= 2;
          if (l === '3 - 5 Years') return exp >= 3 && exp <= 5;
          if (l === '6 - 8 Years') return exp >= 6 && exp <= 8;
          if (l === '9+ Years') return exp >= 9;
          return true;
        });
      });
    }

    // 6. Career Level / Education Checkbox Filter
    if (selectedCareerLevels.length > 0) {
      result = result.filter(j => {
        const edu = (j.minEducationalAttainment || '').toLowerCase();
        const title = j.title.toLowerCase();
        return selectedCareerLevels.some(cl => {
          if (cl === 'Student') return edu.includes('high school') || edu.includes('senior') || title.includes('entry');
          if (cl === 'Entry Level') return edu.includes('vocational') || edu.includes('tvet') || j.minExperienceYears <= 1;
          if (cl === 'Senior') return title.includes('senior') || title.includes('lead') || j.minExperienceYears >= 3;
          if (cl === 'Manager') return title.includes('manager') || title.includes('supervisor');
          if (cl === 'Director') return title.includes('director') || title.includes('head');
          return true;
        });
      });
    }

    // 7. Salary range filter
    if (minSalaryFilter > 0 || maxSalaryFilter > 0) {
      result = result.filter(j => {
        const minSalaryNum = j.minSalary || 0;
        const maxSalaryNum = j.maxSalary || 999999;
        if (minSalaryFilter > 0 && maxSalaryNum < minSalaryFilter) return false;
        if (maxSalaryFilter > 0 && minSalaryNum > maxSalaryFilter) return false;
        return true;
      });
    }

    // Calculate match score if job seeker profile exists
    const scoredJobs = result.map((job, idx) => {
      let matchScore = 0;
      let outcome = 'QUALIFIED';
      let matchResult: any = null;
      if (currentSeekerProfile) {
        matchResult = calculateDecisionTreeMatch(currentSeekerProfile, job);
        matchScore = matchResult.overallMatch;
        outcome = matchResult.outcome;
      }

      // Assign theme for visual logo
      const themeIndex = idx % LOGO_THEMES.length;
      const theme = LOGO_THEMES[themeIndex];
      const initial = job.companyName ? job.companyName.charAt(0).toUpperCase() : theme.letter;

      // Calculate days left from deadline
      let daysLeft = 30;
      if (job.applicationDeadline) {
        const diffMs = new Date(job.applicationDeadline).getTime() - Date.now();
        daysLeft = Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
      }

      return { 
        job, 
        matchScore, 
        outcome, 
        matchResult, 
        theme, 
        initial, 
        daysLeft 
      };
    });

    // Sorting
    if (sortBy === 'match' && currentSeekerProfile) {
      scoredJobs.sort((a, b) => b.matchScore - a.matchScore);
    } else if (sortBy === 'deadline') {
      scoredJobs.sort((a, b) => a.daysLeft - b.daysLeft);
    } else {
      // Newest
      scoredJobs.sort((a, b) => new Date(b.job.postedDate).getTime() - new Date(a.job.postedDate).getTime());
    }

    return scoredJobs;
  }, [
    jobPosts, 
    searchQuery, 
    selectedBarangay, 
    selectedCategory, 
    selectedJobTypes, 
    selectedExperienceLevels, 
    selectedCareerLevels, 
    minSalaryFilter, 
    maxSalaryFilter, 
    sortBy, 
    currentSeekerProfile
  ]);

  // Pagination calculation
  const totalPages = Math.ceil(filteredJobs.length / ITEMS_PER_PAGE) || 1;
  const paginatedJobs = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredJobs.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredJobs, currentPage]);

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedBarangay('');
    setSelectedCategory('');
    setSelectedJobTypes([]);
    setSelectedExperienceLevels([]);
    setSelectedCareerLevels([]);
    setMinSalaryFilter(0);
    setMaxSalaryFilter(0);
    setCurrentPage(1);
  };

  return (
    <div className="min-h-screen bg-[#fafbfc] text-slate-900 font-sans antialiased selection:bg-emerald-500 selection:text-white">

      {/* ======================================================== */}
      {/* 1. TOP HERO BANNER & SEARCH CAPSULE (Matches image.png) */}
      {/* ======================================================== */}
      <section className="bg-white border-b border-slate-100 pt-10 sm:pt-14 pb-12 sm:pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center space-y-4">
          
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight">
            Find Your Dream Jobs
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 max-w-xl mx-auto leading-relaxed">
            Verified local employment opportunities in Roxas, Oriental Mindoro with real-time AI Decision Tree qualification matching.
          </p>

          {/* Search Bar Capsule Card */}
          <div className="pt-4">
            <div className="bg-white rounded-3xl sm:rounded-full p-2.5 sm:p-2 shadow-xl shadow-slate-200/60 border border-slate-200/80 flex flex-col sm:flex-row items-center gap-2 sm:gap-0 transition-all">
              
              {/* Field 1: Keywords */}
              <div className="flex-1 flex items-center gap-3 px-4 py-2 sm:py-1.5 w-full">
                <Search className="w-4 h-4 text-slate-400 shrink-0" />
                <input 
                  type="text"
                  placeholder="Jobs title or keywords"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none bg-transparent"
                />
              </div>

              {/* Vertical Divider */}
              <div className="hidden sm:block w-px h-8 bg-slate-200/80" />

              {/* Field 2: Location */}
              <div className="flex-1 flex items-center gap-2.5 px-4 py-2 sm:py-1.5 w-full relative">
                <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                <select
                  value={selectedBarangay}
                  onChange={(e) => {
                    setSelectedBarangay(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full text-xs sm:text-sm text-slate-700 bg-transparent focus:outline-none cursor-pointer pr-6 appearance-none font-medium"
                >
                  <option value="">All location</option>
                  {ROXAS_BARANGAYS.map(b => (
                    <option key={b} value={b}>Brgy. {b}, Roxas</option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 text-slate-400 pointer-events-none absolute right-4" />
              </div>

              {/* Vertical Divider */}
              <div className="hidden sm:block w-px h-8 bg-slate-200/80" />

              {/* Field 3: Category */}
              <div className="flex-1 flex items-center gap-2.5 px-4 py-2 sm:py-1.5 w-full relative">
                <Folder className="w-4 h-4 text-slate-400 shrink-0" />
                <select
                  value={selectedCategory}
                  onChange={(e) => {
                    setSelectedCategory(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full text-xs sm:text-sm text-slate-700 bg-transparent focus:outline-none cursor-pointer pr-6 appearance-none font-medium"
                >
                  <option value="">All categories</option>
                  {JOB_CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 text-slate-400 pointer-events-none absolute right-4" />
              </div>

              {/* Clear Text Action */}
              {(searchQuery || selectedBarangay || selectedCategory || selectedJobTypes.length > 0) && (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="px-3 py-1.5 text-xs font-semibold text-slate-400 hover:text-slate-800 transition-colors cursor-pointer shrink-0"
                  title="Clear search parameters"
                >
                  Clear
                </button>
              )}

              {/* Search Pill Button (Emerald green, matching image.png) */}
              <button
                type="button"
                onClick={() => setCurrentPage(1)}
                className="w-full sm:w-auto px-7 py-3 bg-[#00875a] hover:bg-[#00704a] text-white font-bold text-xs sm:text-sm rounded-2xl sm:rounded-full transition-all shadow-md shadow-emerald-700/20 active:scale-95 cursor-pointer shrink-0 flex items-center justify-center gap-2"
              >
                <span>Search</span>
              </button>

            </div>
          </div>

          {/* Quick Filters toggle for Mobile */}
          <div className="pt-2 lg:hidden flex items-center justify-center">
            <button
              type="button"
              onClick={() => setShowMobileFilters(!showMobileFilters)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>{showMobileFilters ? 'Hide Advanced Filters' : 'Show Advanced Filters'}</span>
            </button>
          </div>

        </div>
      </section>

      {/* ======================================================== */}
      {/* 2. MAIN 2-COLUMN LAYOUT (Matches image.png on PC/Laptops) */}
      {/* ======================================================== */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          {/* ---------------------------------------------------- */}
          {/* LEFT COLUMN: FILTER SIDEBAR (Matches image.png)      */}
          {/* ---------------------------------------------------- */}
          <aside className={`lg:col-span-3 space-y-7 ${showMobileFilters ? 'block' : 'hidden lg:block'}`}>
            <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-6">
              
              {/* Header */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h2 className="text-base font-bold text-slate-900 tracking-tight">
                  Filter
                </h2>
                <button
                  type="button"
                  onClick={clearFilters}
                  className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 hover:underline cursor-pointer"
                >
                  Reset
                </button>
              </div>

              {/* 1. JOB TYPE (Checkboxes from image.png) */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-slate-400 tracking-wider uppercase">
                  JOB TYPE
                </h3>
                <div className="space-y-2.5">
                  {[
                    { label: 'Full Time', count: 18 },
                    { label: 'Part Time', count: 6 },
                    { label: 'Contractor', count: 4 },
                    { label: 'Temporary', count: 2 },
                    { label: 'Intern', count: 5 }
                  ].map(({ label }) => {
                    const checked = selectedJobTypes.includes(label);
                    return (
                      <label 
                        key={label}
                        className="flex items-center gap-3 text-xs font-medium text-slate-700 hover:text-slate-900 cursor-pointer select-none group"
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggleJobType(label)}
                          className="w-4 h-4 rounded-md border-slate-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer accent-[#00875a]"
                        />
                        <span className={checked ? 'font-bold text-slate-900' : ''}>
                          {label}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* 2. SALARY (Side by side Min & Max from image.png) */}
              <div className="space-y-3 pt-2 border-t border-slate-100">
                <h3 className="text-xs font-bold text-slate-400 tracking-wider uppercase">
                  SALARY (₱/mo)
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  <div className="relative">
                    <select
                      value={minSalaryFilter}
                      onChange={(e) => {
                        setMinSalaryFilter(Number(e.target.value));
                        setCurrentPage(1);
                      }}
                      className="w-full text-xs py-2 pl-3 pr-6 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 appearance-none font-medium cursor-pointer"
                    >
                      <option value="0">Min</option>
                      <option value="10000">₱10,000</option>
                      <option value="15000">₱15,000</option>
                      <option value="25000">₱25,000</option>
                      <option value="40000">₱40,000</option>
                    </select>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-3 pointer-events-none" />
                  </div>

                  <div className="relative">
                    <select
                      value={maxSalaryFilter}
                      onChange={(e) => {
                        setMaxSalaryFilter(Number(e.target.value));
                        setCurrentPage(1);
                      }}
                      className="w-full text-xs py-2 pl-3 pr-6 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 appearance-none font-medium cursor-pointer"
                    >
                      <option value="0">Max</option>
                      <option value="20000">₱20,000</option>
                      <option value="35000">₱35,000</option>
                      <option value="60000">₱60,000</option>
                      <option value="120000">₱120,000+</option>
                    </select>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-3 pointer-events-none" />
                  </div>
                </div>
              </div>

              {/* 3. EXPERIENCE LEVEL (Checkboxes from image.png) */}
              <div className="space-y-3 pt-2 border-t border-slate-100">
                <h3 className="text-xs font-bold text-slate-400 tracking-wider uppercase">
                  EXPERIENCE LEVEL
                </h3>
                <div className="space-y-2.5">
                  {[
                    'Fresh',
                    '1 - 2 Years',
                    '3 - 5 Years',
                    '6 - 8 Years',
                    '9+ Years'
                  ].map((level) => {
                    const checked = selectedExperienceLevels.includes(level);
                    return (
                      <label 
                        key={level}
                        className="flex items-center gap-3 text-xs font-medium text-slate-700 hover:text-slate-900 cursor-pointer select-none group"
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggleExperienceLevel(level)}
                          className="w-4 h-4 rounded-md border-slate-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer accent-[#00875a]"
                        />
                        <span className={checked ? 'font-bold text-slate-900' : ''}>
                          {level}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* 4. CAREER LEVEL (Checkboxes from image.png) */}
              <div className="space-y-3 pt-2 border-t border-slate-100">
                <h3 className="text-xs font-bold text-slate-400 tracking-wider uppercase">
                  CAREER LEVEL
                </h3>
                <div className="space-y-2.5">
                  {[
                    'Student',
                    'Entry Level',
                    'Senior',
                    'Manager',
                    'Director'
                  ].map((career) => {
                    const checked = selectedCareerLevels.includes(career);
                    return (
                      <label 
                        key={career}
                        className="flex items-center gap-3 text-xs font-medium text-slate-700 hover:text-slate-900 cursor-pointer select-none group"
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggleCareerLevel(career)}
                          className="w-4 h-4 rounded-md border-slate-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer accent-[#00875a]"
                        />
                        <span className={checked ? 'font-bold text-slate-900' : ''}>
                          {career}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>

            </div>
          </aside>

          {/* ---------------------------------------------------- */}
          {/* RIGHT COLUMN: JOB LISTINGS (Matches image.png)        */}
          {/* ---------------------------------------------------- */}
          <section className="lg:col-span-9 space-y-4">
            
            {/* Top Summary Bar (Count, View Mode, Sorting from image.png) */}
            <div className="flex flex-wrap items-center justify-between gap-3 bg-white px-5 py-3.5 rounded-2xl border border-slate-200/80 shadow-2xs">
              
              {/* Total Jobs Count (e.g., 1,251 jobs in image.png) */}
              <div className="flex items-center gap-2">
                <span className="text-sm font-black text-slate-900 tracking-tight">
                  {filteredJobs.length.toLocaleString()} jobs
                </span>
                {currentSeekerProfile && (
                  <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 inline-flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-emerald-600" />
                    <span>Decision Tree Match Active</span>
                  </span>
                )}
              </div>

              {/* View Mode Toggle and Sort Dropdown (Matches image.png header) */}
              <div className="flex items-center gap-4">
                
                {/* Grid / List View Toggle Icons */}
                <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
                  <button
                    type="button"
                    onClick={() => setViewMode('grid')}
                    className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                      viewMode === 'grid' 
                        ? 'bg-white text-slate-900 shadow-xs' 
                        : 'text-slate-400 hover:text-slate-700'
                    }`}
                    title="Grid layout view"
                    aria-label="Grid layout view"
                  >
                    <LayoutGrid className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode('list')}
                    className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                      viewMode === 'list' 
                        ? 'bg-white text-slate-900 shadow-xs' 
                        : 'text-slate-400 hover:text-slate-700'
                    }`}
                    title="List layout view"
                    aria-label="List layout view"
                  >
                    <List className="w-4 h-4" />
                  </button>
                </div>

                {/* Sort Dropdown (Sort by Newest from image.png) */}
                <div className="flex items-center gap-1.5 text-xs">
                  <span className="text-slate-400 font-medium hidden sm:inline">Sort by:</span>
                  <div className="relative">
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as any)}
                      className="text-xs font-bold text-slate-800 bg-transparent pr-5 py-1 focus:outline-none cursor-pointer appearance-none"
                    >
                      <option value="newest">Newest</option>
                      {currentSeekerProfile && <option value="match">Highest Match %</option>}
                      <option value="deadline">Application Deadline</option>
                    </select>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-0 top-1.5 pointer-events-none" />
                  </div>
                </div>

              </div>

            </div>

            {/* Empty State */}
            {filteredJobs.length === 0 ? (
              <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center space-y-3">
                <Briefcase className="w-12 h-12 text-slate-300 mx-auto" />
                <h3 className="text-base font-bold text-slate-800">
                  {jobPosts.length === 0 ? 'No Job Vacancies Available Yet' : 'No matching vacancies found'}
                </h3>
                <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
                  {jobPosts.length === 0
                    ? 'There are currently no employers registered or active job offers posted in Roxas. Newly approved vacancies will be published here.'
                    : 'Try clearing your filters or searching for alternative job titles or skills in Roxas, Oriental Mindoro.'}
                </p>
                {jobPosts.length > 0 && (
                  <button
                    type="button"
                    onClick={clearFilters}
                    className="px-4 py-2 bg-[#00875a] hover:bg-[#00704a] text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
                  >
                    Clear All Filters
                  </button>
                )}
              </div>
            ) : (

              /* Job Cards List (Matches visual presentation in image.png) */
              <div className={viewMode === 'grid' ? "grid grid-cols-1 sm:grid-cols-2 gap-4" : "space-y-3"}>
                {paginatedJobs.map(({ job, matchScore, theme, initial, daysLeft }) => {
                  const isBookmarked = bookmarkedJobIds.includes(job.id);
                  const ongoingApp = currentSeekerProfile 
                    ? applications.find(a => a.jobId === job.id && a.jobSeekerId === currentSeekerProfile.id)
                    : null;

                  return (
                    <div
                      key={job.id}
                      onClick={() => onNavigate('job-detail', { jobId: job.id })}
                      className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/90 hover:border-slate-300 hover:shadow-md transition-all cursor-pointer relative group space-y-3.5"
                    >
                      {/* Top Row: Logo, Title, Subtitle, Badges & Bookmark */}
                      <div className="flex items-start justify-between gap-4">
                        
                        <div className="flex items-start gap-4 min-w-0">
                          
                          {/* Squircle Company Brand Logo (Matches image.png icons) */}
                          <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl ${job.companyLogo ? 'bg-slate-50' : theme.bg} flex items-center justify-center font-serif font-black text-xl sm:text-2xl shadow-xs shrink-0 overflow-hidden`}>
                            {job.companyLogo ? (
                              <img src={job.companyLogo} alt={job.companyName} className="w-full h-full object-cover" />
                            ) : (
                              <span>{initial}</span>
                            )}
                          </div>

                          {/* Titles & Meta */}
                          <div className="min-w-0 space-y-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h3 className="font-bold text-slate-900 text-base sm:text-lg group-hover:text-[#00875a] transition-colors leading-tight line-clamp-1">
                                {job.title}
                              </h3>
                              {job.companyVerified && (
                                <span title="PESO Verified Employer" className="inline-flex">
                                  <CheckCircle2 className="w-4 h-4 text-emerald-500 fill-emerald-100 shrink-0" />
                                </span>
                              )}
                            </div>

                            {/* Subtitle: "by [Company] in [Category]" from image.png */}
                            <p className="text-xs text-slate-500 font-medium">
                              by <span className="font-semibold text-slate-800">{job.companyName}</span> in <span className="text-[#00875a] font-semibold">{job.category}</span>
                            </p>

                            {/* Badges Row (Matches image.png: Work Setup, Location, Salary) */}
                            <div className="flex items-center gap-2 flex-wrap pt-1.5">
                              {/* 1. Job Type Badge */}
                              <span className="px-3 py-0.5 rounded-full text-xs font-semibold bg-indigo-50/90 text-indigo-700 border border-indigo-100">
                                {job.employmentType}
                              </span>

                              {/* 2. Location Badge */}
                              <span className="px-3 py-0.5 rounded-full text-xs font-medium text-slate-600 bg-slate-100 flex items-center gap-1">
                                <MapPin className="w-3 h-3 text-slate-400" />
                                <span>{job.workLocation || 'Roxas, Oriental Mindoro'}</span>
                              </span>

                              {/* 3. Salary Badge */}
                              <span className="px-3 py-0.5 rounded-full text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 flex items-center gap-1">
                                <Banknote className="w-3.5 h-3.5 text-emerald-600" />
                                <span>{job.salaryRange}</span>
                              </span>

                              {/* 4. AI Match Score Badge (if seeker) */}
                              {currentSeekerProfile && (
                                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold text-amber-900 bg-amber-50 border border-amber-200 inline-flex items-center gap-1">
                                  <Sparkles className="w-3 h-3 text-amber-600" />
                                  <span>{matchScore}% Match</span>
                                </span>
                              )}
                            </div>

                          </div>

                        </div>

                        {/* Top Right: Bookmark Heart & Feature Icon */}
                        <div className="flex flex-col items-end gap-3 shrink-0">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleBookmarkJob(job.id);
                              showToast({
                                title: isBookmarked ? 'Bookmark Removed' : 'Job Bookmarked! 🔖',
                                message: isBookmarked 
                                  ? `Removed ${job.title} from saved jobs.` 
                                  : `Saved ${job.title} to your bookmarked jobs.`,
                                type: 'info'
                              });
                            }}
                            className="p-2 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-colors cursor-pointer"
                            title={isBookmarked ? 'Remove bookmark' : 'Bookmark job'}
                          >
                            <Heart className={`w-5 h-5 transition-colors ${
                              isBookmarked 
                                ? 'fill-rose-500 text-rose-500' 
                                : 'text-slate-300 hover:text-rose-500'
                            }`} />
                          </button>

                          {/* "56 days left to apply" from image.png */}
                          <div className="text-right">
                            <span className="text-xs text-slate-400 font-medium">
                              {daysLeft > 0 ? `${daysLeft} days left to apply` : 'Open for applications'}
                            </span>
                          </div>
                        </div>

                      </div>

                      {/* Ongoing Application Tracking UI (If seeker has ongoing application) */}
                      {ongoingApp && (
                        <div 
                          onClick={(e) => {
                            e.stopPropagation();
                            onNavigate('job-detail', { jobId: job.id });
                          }}
                          className="p-3 bg-blue-50/70 border border-blue-200/90 rounded-2xl space-y-2 hover:border-blue-400 transition-colors mt-2"
                        >
                          <div className="flex items-center justify-between text-xs">
                            <div className="flex items-center gap-1.5">
                              <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
                              <span className="font-bold text-blue-950 uppercase tracking-wider text-[10px]">
                                Ongoing Application Tracking
                              </span>
                            </div>
                            <span className="text-[10px] font-bold text-indigo-700 bg-white px-2 py-0.5 rounded-md border border-indigo-200">
                              Active Application · Click to Monitor
                            </span>
                          </div>
                          <ApplicationTrackingBar 
                            currentStatus={ongoingApp.currentStatus}
                            statusNotes={ongoingApp.notes}
                          />
                        </div>
                      )}

                    </div>
                  );
                })}
              </div>
            )}

            {/* Pagination Row (Matches image.png bottom pagination pills) */}
            {totalPages > 1 && (
              <div className="pt-6 flex items-center justify-center gap-2">
                
                <button
                  type="button"
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="w-9 h-9 rounded-full border border-slate-200 bg-white flex items-center justify-center text-slate-500 hover:text-slate-800 disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
                  title="Previous page"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                {Array.from({ length: totalPages }).map((_, i) => {
                  const pageNum = i + 1;
                  const isActive = currentPage === pageNum;
                  return (
                    <button
                      key={pageNum}
                      type="button"
                      onClick={() => setCurrentPage(pageNum)}
                      className={`w-9 h-9 rounded-full text-xs font-bold transition-all cursor-pointer ${
                        isActive
                          ? 'bg-[#00875a] text-white shadow-sm'
                          : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}

                <button
                  type="button"
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="w-9 h-9 rounded-full border border-slate-200 bg-white flex items-center justify-center text-slate-500 hover:text-slate-800 disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
                  title="Next page"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>

              </div>
            )}

          </section>

        </div>
      </main>
    </div>
  );
};

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { JobOfferView } from '../components/JobOfferView';

interface JobDetailPageProps {
  jobId: string;
  onNavigate: (view: string, params?: any) => void;
  onOpenAuth: (mode: 'login' | 'register') => void;
}

export const JobDetailPage: React.FC<JobDetailPageProps> = ({ jobId, onNavigate, onOpenAuth }) => {
  const { jobPosts, employers, applications, currentUser, showToast } = useApp();

  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('seeker_bookmarked_jobs');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const toggleBookmark = (jId: string, jTitle: string) => {
    const exists = bookmarkedIds.includes(jId);
    const next = exists ? bookmarkedIds.filter(id => id !== jId) : [...bookmarkedIds, jId];
    setBookmarkedIds(next);
    try {
      localStorage.setItem('seeker_bookmarked_jobs', JSON.stringify(next));
    } catch {}
    showToast({
      title: exists ? 'Removed from Bookmarks' : 'Saved to Bookmarks',
      message: exists ? `"${jTitle}" was removed from your saved list.` : `"${jTitle}" has been saved to your bookmarks.`,
      type: exists ? 'info' : 'success'
    });
  };

  const job = jobPosts.find(j => j.id === jobId);

  if (!job) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center max-w-md shadow-sm">
          <h2 className="text-lg font-bold text-slate-800">Job Posting Not Found</h2>
          <p className="text-xs text-slate-500 mt-2">The requested vacancy may have been removed or closed.</p>
          <button
            onClick={() => onNavigate(currentUser?.role === 'job_seeker' ? 'seeker-dashboard' : 'jobs')}
            className="mt-4 px-4 py-2 bg-slate-900 text-white font-bold text-xs rounded-xl hover:bg-slate-800 transition-all cursor-pointer"
          >
            Back to Vacancies
          </button>
        </div>
      </div>
    );
  }

  const isRemote = job.workLocation?.toLowerCase().includes('remote');
  const isHybrid = job.workLocation?.toLowerCase().includes('hybrid');
  const workSetup: 'Remote' | 'On-site' | 'Hybrid' = isRemote ? 'Remote' : (isHybrid ? 'Hybrid' : 'On-site');
  const initial = (job.companyName || 'J').charAt(0).toUpperCase();
  const employer = employers?.find(e => e.id === job.employerId || e.companyName.toLowerCase() === job.companyName.toLowerCase());

  const displayJob = {
    id: job.id,
    title: job.title,
    companyName: job.companyName,
    logoLetter: `${initial}.`,
    logoBg: 'bg-[#43464b] text-white',
    logoUrl: job.companyLogo || employer?.logoUrl,
    location: job.workLocation || `${job.municipality || 'Roxas'}, Oriental Mindoro`,
    tags: [
      job.employmentType || 'Full-time',
      workSetup,
      job.preferredDegree?.split('/')[0]?.trim() || job.minEducationalAttainment || 'Degree Holder'
    ],
    applicantCount: applications.filter(a => a.jobId === job.id).length,
    salary: job.salaryRange || 'Competitive',
    period: '/month',
    category: job.category || 'General',
    description: job.description || '',
    type: job.employmentType || 'Full-time',
    workSetup,
    experienceLevel: job.minExperienceYears >= 3 ? 'Mid-Senior Level' : 'Entry Level'
  };

  return (
    <JobOfferView
      job={displayJob}
      onBack={() => onNavigate(currentUser?.role === 'job_seeker' ? 'seeker-dashboard' : 'jobs')}
      onNavigate={onNavigate}
      isBookmarked={bookmarkedIds.includes(job.id)}
      onToggleBookmark={toggleBookmark}
      onSelectOtherJob={(ojId) => onNavigate('job-detail', { jobId: ojId })}
    />
  );
};

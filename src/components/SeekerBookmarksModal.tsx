import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { JobPost } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  Bookmark, 
  BookmarkCheck, 
  MapPin, 
  Building2, 
  ArrowRight, 
  Trash2,
  AlertCircle
} from 'lucide-react';

interface SeekerBookmarksModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectJob: (jobId: string) => void;
}

export const SeekerBookmarksModal: React.FC<SeekerBookmarksModalProps> = ({
  isOpen,
  onClose,
  onSelectJob,
}) => {
  const { jobPosts, bookmarkedJobIds, toggleBookmarkJob } = useApp();
  const [jobToRemove, setJobToRemove] = useState<JobPost | null>(null);

  if (!isOpen) return null;

  const bookmarkedJobs = jobPosts.filter(j => bookmarkedJobIds.includes(j.id));

  const handleConfirmRemove = () => {
    if (jobToRemove) {
      toggleBookmarkJob(jobToRemove.id);
      setJobToRemove(null);
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/60 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100 flex flex-col max-h-[85vh]"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                <Bookmark className="w-4 h-4 fill-blue-600" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 leading-none">Bookmarked Jobs</h3>
                <p className="text-[11px] text-slate-500 mt-0.5">{bookmarkedJobs.length} Saved Opportunities</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* List of Bookmarked Jobs */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3">
            {bookmarkedJobs.length === 0 ? (
              <div className="text-center py-12 space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                  <Bookmark className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-bold text-slate-800">No Bookmarked Jobs Yet</h4>
                <p className="text-xs text-slate-500 max-w-xs mx-auto">
                  Explore vacancies in Roxas and bookmark your preferred opportunities to apply later.
                </p>
              </div>
            ) : (
              bookmarkedJobs.map((job) => {
                return (
                  <div
                    key={job.id}
                    className="p-4 rounded-2xl border border-slate-100 hover:border-blue-200 bg-white hover:shadow-md transition-all flex flex-col gap-3 group"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-xl bg-blue-600 text-white font-black text-sm flex items-center justify-center shadow-xs shrink-0">
                          {job.companyName.charAt(0)}
                        </div>
                        <div>
                          <h4 
                            onClick={() => {
                              onClose();
                              onSelectJob(job.id);
                            }}
                            className="text-xs sm:text-sm font-bold text-slate-900 hover:text-blue-600 cursor-pointer transition-colors leading-tight"
                          >
                            {job.title}
                          </h4>
                          <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                            <span>{job.companyName}</span>
                            <span>•</span>
                            <span className="flex items-center gap-0.5">
                              <MapPin className="w-3 h-3 text-slate-400" />
                              {job.municipality || 'Roxas'}
                            </span>
                          </p>
                        </div>
                      </div>

                      {/* Remove from Bookmark Trigger */}
                      <button
                        onClick={() => setJobToRemove(job)}
                        className="p-2 rounded-xl text-blue-600 hover:bg-rose-50 hover:text-rose-600 transition-colors shrink-0"
                        title="Remove bookmark"
                      >
                        <BookmarkCheck className="w-4 h-4 fill-blue-600 group-hover:fill-transparent" />
                      </button>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-50 text-xs">
                      <div className="flex items-center gap-1.5">
                        <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded-lg text-[10px] font-semibold">
                          {job.employmentType}
                        </span>
                        <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded-lg text-[10px] font-semibold">
                          {job.workLocation}
                        </span>
                      </div>
                      <span className="font-bold text-blue-600 text-xs">
                        {job.salaryRange || '₱25,000 - ₱35,000 /mo'}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </motion.div>
      </div>

      {/* Remove from Bookmark? Confirmation Modal (Exact match to design) */}
      <AnimatePresence>
        {jobToRemove && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 15 }}
              className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl border border-slate-100 text-center space-y-4"
            >
              <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
                <Trash2 className="w-6 h-6" />
              </div>

              <div>
                <h4 className="text-base font-bold text-slate-900">Remove from Bookmark?</h4>
                <p className="text-xs text-slate-500 mt-1">
                  Are you sure you want to remove <span className="font-semibold text-slate-800">"{jobToRemove.title}"</span> from your saved bookmarks?
                </p>
              </div>

              {/* Mini Card Preview */}
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 text-left flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                  {jobToRemove.companyName.charAt(0)}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-slate-900 truncate">{jobToRemove.title}</p>
                  <p className="text-[10px] text-slate-500 truncate">{jobToRemove.companyName}</p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 pt-2">
                <button
                  onClick={() => setJobToRemove(null)}
                  className="flex-1 py-2.5 px-4 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmRemove}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-xs font-bold text-white shadow-md shadow-blue-600/20 transition-all active:scale-[0.98]"
                >
                  Yes, Remove
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

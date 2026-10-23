import React from 'react';
import { useApp } from '../context/AppContext';
import { motion } from 'motion/react';
import { X, TrendingUp, Eye, Building2, UserCheck, ShieldCheck, ChevronRight } from 'lucide-react';

interface ProfileViewsAnalyticsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ProfileViewsAnalyticsModal: React.FC<ProfileViewsAnalyticsModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { profileViews } = useApp();

  if (!isOpen) return null;

  // Weekly bar data
  const weeklyViews = [
    { day: 'M', count: 4, heightPct: 40 },
    { day: 'T', count: 8, heightPct: 80, isPeak: true },
    { day: 'W', count: 6, heightPct: 60 },
    { day: 'T', count: 5, heightPct: 50 },
    { day: 'F', count: 7, heightPct: 70 },
    { day: 'S', count: 9, heightPct: 90, isPeak: true },
    { day: 'S', count: 3, heightPct: 30 },
  ];

  const totalViews = 42;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/60 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100 flex flex-col max-h-[85vh]"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <Eye className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 leading-none">Profile Views</h3>
              <p className="text-[11px] text-slate-500 mt-0.5">Recruiter Engagement Analytics</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Top Metric Card */}
          <div className="p-5 rounded-3xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white shadow-lg shadow-blue-600/20 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-blue-100">Weekly Profile Impressions</span>
              <div className="flex items-center gap-1 px-2.5 py-1 bg-white/20 backdrop-blur-md rounded-full text-[11px] font-bold">
                <TrendingUp className="w-3 h-3 text-emerald-300" />
                <span>+15.4%</span>
              </div>
            </div>

            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-black">{totalViews}</span>
              <span className="text-xs text-blue-100">verified employer views</span>
            </div>

            {/* Simulated Bar Chart matching design */}
            <div className="pt-2">
              <div className="flex items-end justify-between h-24 gap-2 px-1">
                {weeklyViews.map((item, idx) => (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
                    <div
                      style={{ height: `${item.heightPct}%` }}
                      className={`w-full rounded-xl transition-all ${
                        item.isPeak ? 'bg-white' : 'bg-white/40 hover:bg-white/60'
                      }`}
                    />
                    <span className="text-[10px] font-bold text-blue-100">{item.day}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Who Viewed Your Profile Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Who Viewed Your Profile
              </h4>
              <span className="text-[11px] text-blue-600 font-semibold">{profileViews.length} Recruiters</span>
            </div>

            <div className="divide-y divide-slate-100 border border-slate-100 rounded-2xl overflow-hidden bg-slate-50/50">
              {profileViews.map((view) => (
                <div
                  key={view.id}
                  className="p-3.5 flex items-center justify-between gap-3 hover:bg-white transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={view.viewerAvatar || "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&auto=format&fit=crop&q=80"}
                      alt={view.viewerName}
                      className="w-10 h-10 rounded-full object-cover border border-slate-200"
                      referrerPolicy="no-referrer"
                    />
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h5 className="text-xs font-bold text-slate-900">{view.viewerName}</h5>
                        <ShieldCheck className="w-3 h-3 text-blue-600" />
                      </div>
                      <p className="text-[11px] text-slate-500 font-medium truncate max-w-[180px]">
                        {view.viewerCompany}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-slate-400 font-medium">{view.timeAgo}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

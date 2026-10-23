import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Clock, 
  Search, 
  Filter, 
  Eye, 
  ShieldCheck, 
  Building2, 
  User,
  History,
  X,
  FileText,
  Activity
} from 'lucide-react';
import { AuditLog } from '../../types';

export const AdminAuditLogsPage: React.FC<{ onNavigate: (view: string) => void }> = ({ onNavigate }) => {
  const { auditLogs } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'admin' | 'employer' | 'job_seeker'>('all');
  const [inspectLog, setInspectLog] = useState<AuditLog | null>(null);

  // Clean time formatting with relative/absolute options
  const formatTime = (isoString: string) => {
    const date = new Date(isoString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short', 
      day: 'numeric', 
      hour: 'numeric', 
      minute: '2-digit', 
      hour12: true
    }).format(date);
  };

  // Subtle role indicator without heavy saturated pills
  const getRoleDot = (role: string) => {
    switch (role) {
      case 'admin':
        return { dot: 'bg-amber-500', text: 'text-amber-800', label: 'PESO Admin' };
      case 'employer':
        return { dot: 'bg-blue-500', text: 'text-blue-800', label: 'Employer' };
      case 'job_seeker':
        return { dot: 'bg-emerald-500', text: 'text-emerald-800', label: 'Job Seeker' };
      default:
        return { dot: 'bg-slate-400', text: 'text-slate-600', label: role.replace(/_/g, ' ') };
    }
  };

  // Modern action style with subtle tint and dot indicator
  const getActionStyle = (action: string) => {
    if (action.includes('SUCCESS') || action.includes('APPROVED') || action.includes('HIRED') || action.includes('VERIFIED')) {
      return {
        dot: 'bg-emerald-500',
        text: 'text-emerald-800',
        bg: 'bg-emerald-50/70 border-emerald-200/60',
      };
    }
    if (action.includes('CHANGED') || action.includes('UPDATED') || action.includes('REVIEW')) {
      return {
        dot: 'bg-amber-500',
        text: 'text-amber-800',
        bg: 'bg-amber-50/70 border-amber-200/60',
      };
    }
    if (action.includes('SUBMITTED') || action.includes('ISSUED') || action.includes('SCHEDULED')) {
      return {
        dot: 'bg-indigo-500',
        text: 'text-indigo-800',
        bg: 'bg-indigo-50/70 border-indigo-200/60',
      };
    }
    if (action.includes('REJECTED') || action.includes('DELETED') || action.includes('FAILED')) {
      return {
        dot: 'bg-rose-500',
        text: 'text-rose-800',
        bg: 'bg-rose-50/70 border-rose-200/60',
      };
    }
    return {
      dot: 'bg-slate-400',
      text: 'text-slate-700',
      bg: 'bg-slate-100 border-slate-200',
    };
  };

  // Filter logs by search query and role filter
  const filteredLogs = auditLogs.filter(log => {
    const matchesRole = roleFilter === 'all' || log.userRole === roleFilter;
    const matchesSearch = 
      log.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (log.entity && log.entity.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesRole && matchesSearch;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 font-sans">
      
      {/* Header with clear hierarchy */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-wider bg-slate-900 text-slate-100 px-2 py-0.5 rounded">
              System Accountability
            </span>
            <span className="text-xs text-slate-400 font-semibold">{auditLogs.length} events logged</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 mt-1 flex items-center gap-2">
            <History className="w-6 h-6 text-amber-600" />
            Audit Logs & Activity Trail
          </h1>
          <p className="text-xs text-slate-500">
            Real-time compliance record of municipal placements, employer verifications, and auth events in Roxas.
          </p>
        </div>

        {/* Search & Role Filter Bar */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              placeholder="Search actor, action, or details..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 pr-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none shadow-2xs w-full sm:w-64 font-medium text-slate-800"
            />
          </div>

          {/* Role Filter dropdown */}
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value as any)}
            className="px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 shadow-2xs focus:ring-2 focus:ring-amber-500 cursor-pointer"
          >
            <option value="all">All Roles</option>
            <option value="admin">PESO Admins</option>
            <option value="employer">Employers</option>
            <option value="job_seeker">Job Seekers</option>
          </select>
        </div>
      </div>

      {/* Modern Data Table Card */}
      <div className="bg-white border border-slate-200/90 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[700px]">
            
            {/* Table Header: subtle, crisp typographic hierarchy */}
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] uppercase tracking-wider text-slate-500 font-bold">
                <th className="px-4 sm:px-5 py-3 w-56">Actor & Role</th>
                <th className="px-4 sm:px-5 py-3 w-48">Action Taken</th>
                <th className="px-4 sm:px-5 py-3">Context & Description</th>
                <th className="px-4 sm:px-5 py-3 w-36 text-right">Timestamp</th>
                <th className="px-3 py-3 w-16 text-center">Inspect</th>
              </tr>
            </thead>

            {/* Table Body: Subtle alternating zebra striping and interactive hover state */}
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredLogs.map((log) => {
                const roleUI = getRoleDot(log.userRole);
                const actionUI = getActionStyle(log.action);
                
                return (
                  <tr 
                    key={log.id} 
                    className="even:bg-slate-50/40 hover:bg-indigo-50/30 transition-colors group"
                  >
                    
                    {/* Column 1: Grouped Actor Name + Role */}
                    <td className="px-4 sm:px-5 py-3 whitespace-nowrap">
                      <div className="flex items-center gap-2.5">
                        <div className="min-w-0">
                          <p className="font-bold text-slate-900 truncate">{log.userName}</p>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${roleUI.dot}`}></span>
                            <span className="text-[11px] text-slate-500 font-medium">{roleUI.label}</span>
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Column 2: Action Taken (Clean text badge with dot indicator instead of loud pill) */}
                    <td className="px-4 sm:px-5 py-3 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-bold rounded-lg border ${actionUI.bg} ${actionUI.text}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${actionUI.dot}`}></span>
                        <span>{log.action.replace(/_/g, ' ')}</span>
                      </span>
                    </td>

                    {/* Column 3: Context & Details with de-emphasized metadata ID */}
                    <td className="px-4 sm:px-5 py-3">
                      <p className="text-slate-700 font-medium leading-relaxed max-w-xl">
                        {log.details}
                      </p>
                      <div className="flex items-center gap-2 mt-1 text-[10px] text-slate-400 font-mono">
                        <span className="bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-sans font-semibold">
                          {log.entity}
                        </span>
                        {log.entityId && (
                          <span className="text-slate-400 truncate max-w-[180px]">
                            ID: {log.entityId}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Column 4: Timestamp (De-emphasized metadata with clean clock icon) */}
                    <td className="px-4 sm:px-5 py-3 whitespace-nowrap text-right text-slate-500 font-medium">
                      <div className="flex items-center justify-end gap-1.5 text-[11px]">
                        <Clock className="w-3 h-3 text-slate-400 shrink-0" />
                        <span>{formatTime(log.timestamp)}</span>
                      </div>
                    </td>

                    {/* Column 5: Inspect Action */}
                    <td className="px-3 py-3 whitespace-nowrap text-center">
                      <button 
                        onClick={() => setInspectLog(log)}
                        className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
                        title="Inspect full audit record"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>

                  </tr>
                );
              })}

              {filteredLogs.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <History className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <p className="text-sm font-bold text-slate-700">No audit logs match criteria</p>
                    <p className="text-xs text-slate-400 mt-1">Try resetting the search keywords or role filters.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer metadata strip */}
        <div className="px-5 py-3 bg-slate-50/80 border-t border-slate-200 text-xs text-slate-500 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <span>
            Showing <strong className="text-slate-800">{filteredLogs.length}</strong> of {auditLogs.length} logged events
          </span>
          <span className="text-[11px] text-slate-400">
            Immutable PESO Municipal Audit Trail • Protected by LGU Security Policy
          </span>
        </div>
      </div>

      {/* Raw Audit Log Inspector Modal */}
      {inspectLog && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900">Audit Record Inspector</h3>
                  <p className="text-[11px] text-slate-400 font-mono">Event ID: {inspectLog.id}</p>
                </div>
              </div>
              <button 
                onClick={() => setInspectLog(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2 p-3 bg-slate-50 rounded-xl border border-slate-100">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Actor</span>
                  <span className="font-bold text-slate-800">{inspectLog.userName}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Role</span>
                  <span className="font-bold text-slate-800 capitalize">{inspectLog.userRole.replace(/_/g, ' ')}</span>
                </div>
              </div>

              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Action Event</span>
                <span className="px-2.5 py-1 bg-slate-100 border border-slate-200 text-slate-800 font-bold rounded-lg inline-block font-mono">
                  {inspectLog.action}
                </span>
              </div>

              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Event Description & Context</span>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-slate-700 leading-relaxed font-medium">
                  {inspectLog.details}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-500 pt-2 border-t border-slate-100">
                <div>
                  <span className="font-bold text-slate-400 block text-[10px] uppercase">Entity Target</span>
                  <span>{inspectLog.entity} ({inspectLog.entityId || 'N/A'})</span>
                </div>
                <div>
                  <span className="font-bold text-slate-400 block text-[10px] uppercase">Timestamp</span>
                  <span>{new Date(inspectLog.timestamp).toLocaleString()}</span>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setInspectLog(null)}
                className="px-4 py-2 bg-slate-900 text-white font-bold text-xs rounded-xl hover:bg-slate-800 transition-colors"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { JobAlertSubscription } from '../types';
import { ORIENTAL_MINDORO_MUNICIPALITIES, JOB_CATEGORIES } from '../data/mockData';
import { 
  X, 
  Bell, 
  Plus, 
  Trash2, 
  Edit2, 
  Check, 
  Sparkles, 
  Send, 
  Building2, 
  MapPin, 
  Briefcase, 
  Mail, 
  Zap,
  Sliders,
  CheckCircle2
} from 'lucide-react';

interface JobSubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate?: (view: string, params?: any) => void;
}

export const JobSubscriptionModal: React.FC<JobSubscriptionModalProps> = ({ isOpen, onClose, onNavigate }) => {
  const { 
    currentUser, 
    jobSubscriptions, 
    addJobSubscription, 
    updateJobSubscription, 
    deleteJobSubscription,
    simulateJobMatch
  } = useApp();

  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [keywordsText, setKeywordsText] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedMunicipalities, setSelectedMunicipalities] = useState<string[]>([]);
  const [selectedEmpTypes, setSelectedEmpTypes] = useState<string[]>(['Full-time']);
  const [minSalary, setMinSalary] = useState<number | ''>(20000);
  const [isToastAlertEnabled, setIsToastAlertEnabled] = useState(true);
  const [isEmailAlertEnabled, setIsEmailAlertEnabled] = useState(true);

  if (!isOpen) return null;

  const userSubs = jobSubscriptions.filter(s => s.userId === (currentUser?.id || 'user-seeker-1'));

  const resetForm = () => {
    setTitle('');
    setKeywordsText('');
    setSelectedCategories([]);
    setSelectedMunicipalities([]);
    setSelectedEmpTypes(['Full-time']);
    setMinSalary(20000);
    setIsToastAlertEnabled(true);
    setIsEmailAlertEnabled(true);
    setIsCreating(false);
    setEditingId(null);
  };

  const handleEditInit = (sub: JobAlertSubscription) => {
    setEditingId(sub.id);
    setTitle(sub.title);
    setKeywordsText(sub.keywords.join(', '));
    setSelectedCategories(sub.categories);
    setSelectedMunicipalities(sub.municipalities);
    setSelectedEmpTypes(sub.employmentTypes);
    setMinSalary(sub.minSalary || '');
    setIsToastAlertEnabled(sub.isToastAlertEnabled);
    setIsEmailAlertEnabled(sub.isEmailAlertEnabled);
    setIsCreating(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const keywords = keywordsText
      .split(',')
      .map(k => k.trim())
      .filter(Boolean);

    if (editingId) {
      updateJobSubscription(editingId, {
        title: title || 'Custom Job Alert',
        keywords,
        categories: selectedCategories,
        municipalities: selectedMunicipalities,
        employmentTypes: selectedEmpTypes,
        minSalary: minSalary === '' ? undefined : Number(minSalary),
        isToastAlertEnabled,
        isEmailAlertEnabled,
      });
    } else {
      addJobSubscription({
        userId: currentUser?.id || 'user-seeker-1',
        title: title || 'New Job Preference Alert',
        keywords,
        categories: selectedCategories,
        municipalities: selectedMunicipalities,
        employmentTypes: selectedEmpTypes,
        minSalary: minSalary === '' ? undefined : Number(minSalary),
        isToastAlertEnabled,
        isEmailAlertEnabled,
        isActive: true,
      });
    }

    resetForm();
  };

  const toggleCategory = (cat: string) => {
    setSelectedCategories(prev => 
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    );
  };

  const toggleMunicipality = (muni: string) => {
    setSelectedMunicipalities(prev => 
      prev.includes(muni) ? prev.filter(m => m !== muni) : [...prev, muni]
    );
  };

  const toggleEmpType = (type: string) => {
    setSelectedEmpTypes(prev => 
      prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
    );
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto font-sans">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200 my-auto flex flex-col max-h-[94vh] sm:max-h-[88vh]">
        
        {/* Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-slate-900 via-slate-850 to-indigo-950 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-indigo-600/30 border border-indigo-400/30 flex items-center justify-center text-indigo-300 shrink-0">
              <Bell className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h3 className="font-bold text-base text-white truncate">Job Alert Subscriptions</h3>
              <p className="text-xs text-slate-300 truncate">Set preferences to receive instant notifications when vacancies are posted.</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-6 space-y-6 overflow-y-auto flex-1">
          
          {/* Top Simulation Banner */}
          <div className="p-4 bg-gradient-to-r from-indigo-50 via-slate-50 to-emerald-50 rounded-xl border border-indigo-200/70 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-1.5 font-bold text-xs text-indigo-900">
                <Zap className="w-4 h-4 text-indigo-600 shrink-0" />
                <span>Test Real-Time Alert System</span>
              </div>
              <p className="text-[11px] text-slate-600 mt-0.5">
                Simulate a new employer vacancy in Oriental Mindoro to test your toast notification preferences instantly.
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                simulateJobMatch(userSubs[0]?.id);
              }}
              className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5 shrink-0"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Simulate Matching Job</span>
            </button>
          </div>

          {/* Subscriptions List vs Form */}
          {!isCreating ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Active Alert Profiles ({userSubs.length})
                </h4>
                <button
                  onClick={() => setIsCreating(true)}
                  className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs rounded-xl transition-colors flex items-center gap-1"
                >
                  <Plus className="w-4 h-4" />
                  <span>Create Preference Alert</span>
                </button>
              </div>

              {userSubs.length === 0 ? (
                <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-200">
                  <Bell className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <p className="text-xs font-bold text-slate-700">No Job Subscription Rules Configured</p>
                  <p className="text-[11px] text-slate-400 mt-1 max-w-sm mx-auto">
                    Create alert criteria based on job category, keywords, or municipality to receive toast popups when matching jobs open.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {userSubs.map(sub => (
                    <div key={sub.id} className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs space-y-3 hover:border-indigo-300 transition-colors">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <h5 className="font-bold text-sm text-slate-900">{sub.title}</h5>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                              sub.isActive ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-100 text-slate-500 border-slate-200'
                            }`}>
                              {sub.isActive ? 'Active' : 'Paused'}
                            </span>
                          </div>

                          {/* Chips */}
                          <div className="flex flex-wrap items-center gap-1.5 mt-2">
                            {(sub.categories || []).map(c => (
                              <span key={c} className="text-[10px] font-medium bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-md border border-indigo-100">
                                {c}
                              </span>
                            ))}
                            {(sub.municipalities || []).map(m => (
                              <span key={m} className="text-[10px] font-medium bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md">
                                📍 {m}
                              </span>
                            ))}
                            {(sub.keywords || []).map(k => (
                              <span key={k} className="text-[10px] font-medium bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded-md">
                                #{k}
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* Toggle & Actions */}
                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            onClick={() => updateJobSubscription(sub.id, { isActive: !sub.isActive })}
                            className={`w-10 h-6 rounded-full p-1 transition-colors relative ${
                              sub.isActive ? 'bg-indigo-600' : 'bg-slate-300'
                            }`}
                            title={sub.isActive ? 'Pause Subscription' : 'Activate Subscription'}
                          >
                            <div className={`w-4 h-4 bg-white rounded-full shadow-xs transition-transform ${
                              sub.isActive ? 'translate-x-4' : 'translate-x-0'
                            }`} />
                          </button>

                          <button
                            onClick={() => handleEditInit(sub)}
                            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                            title="Edit Subscription"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => deleteJobSubscription(sub.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                            title="Delete Subscription"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Toggles Status Bar */}
                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                        <div className="flex items-center gap-3">
                          <span className={`flex items-center gap-1 font-semibold ${sub.isToastAlertEnabled ? 'text-indigo-600' : 'text-slate-400'}`}>
                            <Zap className="w-3.5 h-3.5" /> Toast Alert: {sub.isToastAlertEnabled ? 'Enabled' : 'Off'}
                          </span>
                          <span className={`flex items-center gap-1 font-semibold ${sub.isEmailAlertEnabled ? 'text-emerald-600' : 'text-slate-400'}`}>
                            <Mail className="w-3.5 h-3.5" /> Email Digest: {sub.isEmailAlertEnabled ? 'Enabled' : 'Off'}
                          </span>
                        </div>
                        {sub.minSalary && (
                          <span className="font-mono text-slate-600 font-bold">
                            Min: ₱{sub.minSalary.toLocaleString()}/mo
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            /* Create / Edit Form */
            <form onSubmit={handleSubmit} className="space-y-5 text-xs">
              
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h4 className="font-bold text-sm text-slate-900">
                  {editingId ? 'Edit Job Preference Subscription' : 'Configure New Job Subscription Alert'}
                </h4>
                <button
                  type="button"
                  onClick={resetForm}
                  className="text-slate-500 hover:text-slate-800 text-xs font-medium"
                >
                  Cancel
                </button>
              </div>

              {/* Title & Keywords */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Subscription Title</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. IT & Software Jobs in Calapan"
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Target Keywords (comma separated)</label>
                  <input
                    type="text"
                    placeholder="e.g. React, Developer, Accounting"
                    value={keywordsText}
                    onChange={e => setKeywordsText(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {/* Categories Selection */}
              <div>
                <label className="block font-bold text-slate-700 mb-1.5">
                  Job Categories ({selectedCategories.length} selected)
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-36 overflow-y-auto p-2 bg-slate-50 rounded-xl border border-slate-200">
                  {JOB_CATEGORIES.map(cat => {
                    const isSelected = selectedCategories.includes(cat);
                    return (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => toggleCategory(cat)}
                        className={`px-2.5 py-1.5 rounded-lg text-left text-[11px] font-medium transition-colors flex items-center justify-between ${
                          isSelected ? 'bg-indigo-600 text-white font-semibold' : 'bg-white text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        <span className="truncate">{cat}</span>
                        {isSelected && <Check className="w-3.5 h-3.5 shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Municipalities Selection */}
              <div>
                <label className="block font-bold text-slate-700 mb-1.5">
                  Preferred Municipalities ({selectedMunicipalities.length === 0 ? 'All Oriental Mindoro' : `${selectedMunicipalities.length} selected`})
                </label>
                <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto p-2 bg-slate-50 rounded-xl border border-slate-200">
                  {ORIENTAL_MINDORO_MUNICIPALITIES.map(muni => {
                    const isSelected = selectedMunicipalities.includes(muni);
                    return (
                      <button
                        key={muni}
                        type="button"
                        onClick={() => toggleMunicipality(muni)}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-colors flex items-center gap-1 ${
                          isSelected ? 'bg-indigo-600 text-white font-semibold' : 'bg-white text-slate-700 hover:bg-slate-200'
                        }`}
                      >
                        <span>{muni}</span>
                        {isSelected && <Check className="w-3 h-3" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Employment Types & Min Salary */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Employment Types</label>
                  <div className="flex flex-wrap gap-1.5">
                    {['Full-time', 'Part-time', 'Contract', 'Internship'].map(type => {
                      const isSelected = selectedEmpTypes.includes(type);
                      return (
                        <button
                          key={type}
                          type="button"
                          onClick={() => toggleEmpType(type)}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-medium border transition-colors ${
                            isSelected ? 'bg-indigo-50 border-indigo-400 text-indigo-700 font-bold' : 'bg-white border-slate-200 text-slate-600'
                          }`}
                        >
                          {type}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Min Monthly Salary (₱)</label>
                  <input
                    type="number"
                    placeholder="20000"
                    value={minSalary}
                    onChange={e => setMinSalary(e.target.value ? Number(e.target.value) : '')}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 font-mono"
                  />
                </div>
              </div>

              {/* Notification Delivery Options */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <span className="block font-bold text-slate-800 text-xs">Alert Channels</span>
                
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isToastAlertEnabled}
                    onChange={e => setIsToastAlertEnabled(e.target.checked)}
                    className="rounded text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="text-slate-700 font-medium">Real-Time Screen Toast Notification Popups</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isEmailAlertEnabled}
                    onChange={e => setIsEmailAlertEnabled(e.target.checked)}
                    className="rounded text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="text-slate-700 font-medium">Daily PESO Email Job Alert Digest</span>
                </label>
              </div>

              {/* Submit Buttons */}
              <div className="pt-2 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2.5 text-slate-600 font-semibold hover:bg-slate-100 rounded-xl transition-colors text-center"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  <span>{editingId ? 'Save Changes' : 'Save Subscription Rule'}</span>
                </button>
              </div>

            </form>
          )}

        </div>

      </div>
    </div>
  );
};

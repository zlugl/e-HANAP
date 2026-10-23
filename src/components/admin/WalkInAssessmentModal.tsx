import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { JobSeekerProfile } from '../../types';
import { TESDA_CERTIFICATIONS_LIST, PRACTICAL_SKILLS_LIST } from '../../data/pesoLguData';
import { 
  Wrench, 
  Award, 
  Compass, 
  X, 
  CheckCircle2, 
  User, 
  FileText,
  Building2,
  Calendar
} from 'lucide-react';

interface WalkInAssessmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  seeker: JobSeekerProfile | null;
}

export const WalkInAssessmentModal: React.FC<WalkInAssessmentModalProps> = ({
  isOpen,
  onClose,
  seeker
}) => {
  const { assessJobSeekerWalkIn, currentUser } = useApp();

  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [customSkill, setCustomSkill] = useState('');
  const [selectedCerts, setSelectedCerts] = useState<string[]>([]);
  const [customCert, setCustomCert] = useState('');
  const [mobility, setMobility] = useState<'local_only' | 'provincial' | 'willing_to_relocate'>('local_only');
  const [willingToRelocate, setWillingToRelocate] = useState<boolean>(false);
  const [assessmentNotes, setAssessmentNotes] = useState('');

  // Sync state when seeker changes
  React.useEffect(() => {
    if (seeker) {
      setSelectedSkills(seeker.practicalSkills || seeker.tradeSkills || []);
      setSelectedCerts(seeker.tradeCertifications || (seeker.certifications || []).map(c => c.name));
      setMobility(seeker.geographicMobility || 'local_only');
      setWillingToRelocate(seeker.willingToRelocateForVisitingCompanies ?? false);
      setAssessmentNotes(seeker.walkInAssessmentNotes || seeker.bioDataDetails || '');
    }
  }, [seeker]);

  if (!isOpen || !seeker) return null;

  const toggleSkill = (skill: string) => {
    setSelectedSkills(prev => 
      prev.includes(skill) ? prev.filter(s => s !== skill) : [...prev, skill]
    );
  };

  const handleAddCustomSkill = () => {
    if (customSkill.trim() && !selectedSkills.includes(customSkill.trim())) {
      setSelectedSkills(prev => [...prev, customSkill.trim()]);
      setCustomSkill('');
    }
  };

  const toggleCert = (cert: string) => {
    setSelectedCerts(prev => 
      prev.includes(cert) ? prev.filter(c => c !== cert) : [...prev, cert]
    );
  };

  const handleAddCustomCert = () => {
    if (customCert.trim() && !selectedCerts.includes(customCert.trim())) {
      setSelectedCerts(prev => [...prev, customCert.trim()]);
      setCustomCert('');
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    assessJobSeekerWalkIn(seeker.id, {
      practicalSkills: selectedSkills,
      tradeCertifications: selectedCerts,
      geographicMobility: mobility,
      willingToRelocateForVisitingCompanies: willingToRelocate,
      walkInAssessmentNotes: assessmentNotes,
      assessedByOfficer: currentUser?.name || 'PESO Officer'
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-2 sm:p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-auto animate-in fade-in duration-200 flex flex-col max-h-[94vh] sm:max-h-[90vh]">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-amber-950 to-slate-900 text-white p-4 sm:p-6 flex items-center justify-between border-b border-amber-900/40 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-400/30 flex items-center justify-center text-amber-400 shrink-0">
              <Compass className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold bg-amber-400/20 text-amber-300 px-2 py-0.5 rounded uppercase tracking-wider">
                  PESO-LGU Profiling
                </span>
                <span className="text-xs text-slate-400 font-medium hidden sm:inline">Walk-In & Relocation Assessment</span>
              </div>
              <h2 className="text-base sm:text-lg font-black text-white truncate">
                {seeker.firstName} {seeker.lastName}
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave} className="p-4 sm:p-6 space-y-6 overflow-y-auto text-xs text-slate-700 flex-1">
          
          {/* Seeker Summary Ribbon */}
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex flex-wrap items-center justify-between gap-3">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Education & Origin</span>
              <p className="font-bold text-slate-900 text-xs mt-0.5">
                {seeker.educationCategory || seeker.educationalAttainment} • Brgy. {seeker.barangay || 'Bagumbayan'}, Roxas
              </p>
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Registration Type</span>
              <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold mt-0.5 ${
                seeker.isWalkIn ? 'bg-amber-100 text-amber-900' : 'bg-blue-100 text-blue-900'
              }`}>
                {seeker.isWalkIn ? 'Walk-In Bio-Data' : 'Online Registered'}
              </span>
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Contact</span>
              <p className="font-mono font-bold text-slate-800 text-xs mt-0.5">{seeker.contactNumber}</p>
            </div>
          </div>

          {/* Practical Capabilities */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="font-bold text-slate-900 flex items-center gap-1.5">
                <Wrench className="w-4 h-4 text-amber-600" />
                <span>Verified Practical Skills & Trade Capabilities</span>
              </label>
              <span className="text-[10px] text-slate-400">{selectedSkills.length} selected</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 max-h-36 overflow-y-auto p-2 bg-slate-50 rounded-xl border border-slate-200">
              {PRACTICAL_SKILLS_LIST.map(sk => (
                <button
                  type="button"
                  key={sk}
                  onClick={() => toggleSkill(sk)}
                  className={`text-left p-2 rounded-lg text-[11px] font-medium transition-colors flex items-center justify-between gap-1 border ${
                    selectedSkills.includes(sk)
                      ? 'bg-amber-100/80 border-amber-300 text-amber-900 font-bold'
                      : 'bg-white border-slate-200 hover:bg-slate-100 text-slate-700'
                  }`}
                >
                  <span className="truncate">{sk}</span>
                  {selectedSkills.includes(sk) && <CheckCircle2 className="w-3.5 h-3.5 text-amber-700 shrink-0" />}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Add other skill..."
                value={customSkill}
                onChange={e => setCustomSkill(e.target.value)}
                className="flex-1 px-3 py-1.5 border border-slate-200 rounded-lg text-slate-900"
              />
              <button
                type="button"
                onClick={handleAddCustomSkill}
                className="px-3 py-1.5 bg-slate-800 text-white rounded-lg font-bold hover:bg-slate-700"
              >
                Add
              </button>
            </div>
          </div>

          {/* TESDA Certifications */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="font-bold text-slate-900 flex items-center gap-1.5">
                <Award className="w-4 h-4 text-amber-600" />
                <span>TESDA Certifications Presented (NC II / NC III)</span>
              </label>
              <span className="text-[10px] text-slate-400">{selectedCerts.length} accredited</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 max-h-36 overflow-y-auto p-2 bg-slate-50 rounded-xl border border-slate-200">
              {TESDA_CERTIFICATIONS_LIST.map(cert => (
                <button
                  type="button"
                  key={cert}
                  onClick={() => toggleCert(cert)}
                  className={`text-left p-2 rounded-lg text-[11px] font-medium transition-colors flex items-center justify-between gap-1 border ${
                    selectedCerts.includes(cert)
                      ? 'bg-blue-50 border-blue-300 text-blue-900 font-bold'
                      : 'bg-white border-slate-200 hover:bg-slate-100 text-slate-700'
                  }`}
                >
                  <span className="truncate">{cert}</span>
                  {selectedCerts.includes(cert) && <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Add other certification..."
                value={customCert}
                onChange={e => setCustomCert(e.target.value)}
                className="flex-1 px-3 py-1.5 border border-slate-200 rounded-lg text-slate-900"
              />
              <button
                type="button"
                onClick={handleAddCustomCert}
                className="px-3 py-1.5 bg-slate-800 text-white rounded-lg font-bold hover:bg-slate-700"
              >
                Add Cert
              </button>
            </div>
          </div>

          {/* Relocation Profiling */}
          <div className="space-y-3">
            <label className="font-bold text-slate-900 flex items-center gap-1.5">
              <Compass className="w-4 h-4 text-amber-600" />
              <span>Relocation Profiling & Deployment Willingness</span>
            </label>

            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'local_only', title: 'Local Only', desc: 'Roxas municipality' },
                { id: 'provincial', title: 'Provincial', desc: 'Across Mindoro' },
                { id: 'willing_to_relocate', title: 'Relocation Open', desc: 'Manila / Batangas' }
              ].map(m => (
                <label
                  key={m.id}
                  className={`p-3 rounded-xl border cursor-pointer flex flex-col justify-between transition-all ${
                    mobility === m.id
                      ? 'bg-emerald-50 border-emerald-400 text-emerald-950 ring-1 ring-emerald-400'
                      : 'bg-white border-slate-200 hover:border-slate-300 text-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-xs">{m.title}</span>
                    <input
                      type="radio"
                      name="assessmentMobility"
                      checked={mobility === m.id}
                      onChange={() => setMobility(m.id as any)}
                      className="text-emerald-600"
                    />
                  </div>
                  <span className="text-[10px] text-slate-500">{m.desc}</span>
                </label>
              ))}
            </div>

            <label className="flex items-start gap-2 p-3 bg-amber-50/60 rounded-xl border border-amber-200/80 cursor-pointer">
              <input
                type="checkbox"
                checked={willingToRelocate}
                onChange={e => setWillingToRelocate(e.target.checked)}
                className="mt-0.5 rounded text-amber-600 focus:ring-amber-500"
              />
              <span className="text-xs text-amber-950 font-medium leading-tight">
                <strong>Interested in Local Recruitment Activities (LRA):</strong> Include applicant in special endorsements for external companies visiting Roxas.
              </span>
            </label>
          </div>

          {/* Assessment Notes */}
          <div className="space-y-1">
            <label className="font-bold text-slate-900 block">
              PESO Assessment Notes & Recommendations
            </label>
            <textarea
              rows={2}
              value={assessmentNotes}
              onChange={e => setAssessmentNotes(e.target.value)}
              className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 text-xs font-medium text-slate-900"
              placeholder="Officer findings regarding applicant readiness, demeanor, availability..."
            />
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors text-center"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-amber-950 font-black text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4 text-amber-950" />
              <span>Save Assessment Profile</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};

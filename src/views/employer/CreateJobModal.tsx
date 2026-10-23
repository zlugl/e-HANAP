import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ORIENTAL_MINDORO_MUNICIPALITIES, JOB_CATEGORIES } from '../../data/mockData';
import { 
  X, 
  Briefcase, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles,
  Building2
} from 'lucide-react';

interface CreateJobModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const CreateJobModal: React.FC<CreateJobModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const { currentEmployerProfile, createJobPost, verifyEmployer, reviewJobVacancy, showToast } = useApp();

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState(JOB_CATEGORIES[0]);
  const [municipality, setMunicipality] = useState(currentEmployerProfile?.municipality || ORIENTAL_MINDORO_MUNICIPALITIES[0]);
  const [employmentType, setEmploymentType] = useState<'Full-time' | 'Part-time' | 'Contract' | 'Internship'>('Full-time');
  const [salaryRange, setSalaryRange] = useState('₱20,000 - ₱30,000 / month');
  const [description, setDescription] = useState('');
  const [responsibilitiesInput, setResponsibilitiesInput] = useState('');
  
  // Qualification criteria
  const [minEducationalAttainment, setMinEducationalAttainment] = useState<"High School" | "TVET / Vocational" | "Bachelor's Degree" | "Master's Degree">("Bachelor's Degree");
  const [preferredDegree, setPreferredDegree] = useState('Bachelor of Science in Information Technology');
  const [degreeImportance, setDegreeImportance] = useState<number>(30); // 30% default weight in Decision Tree
  const [minExperienceYears, setMinExperienceYears] = useState<number>(1);
  
  // Skills lists
  const [requiredSkills, setRequiredSkills] = useState<string[]>(['Customer Service', 'Problem Solving']);
  const [reqSkillInput, setReqSkillInput] = useState('');
  const [preferredSkills, setPreferredSkills] = useState<string[]>(['Microsoft Office', 'Communication']);
  const [prefSkillInput, setPrefSkillInput] = useState('');

  const [vacanciesCount, setVacanciesCount] = useState<number>(2);
  const [deadline, setDeadline] = useState('2026-10-31');
  
  const [error, setError] = useState('');

  if (!isOpen || !currentEmployerProfile) return null;

  // STRICT VERIFICATION CHECK: Employers cannot post until verified by PESO
  if (currentEmployerProfile.status !== 'verified') {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200 font-sans">
        <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden p-6 sm:p-8 text-center space-y-5">
          <div className="w-16 h-16 rounded-3xl bg-amber-100 text-amber-700 flex items-center justify-center mx-auto ring-8 ring-amber-50">
            <AlertCircle className="w-8 h-8" />
          </div>
          <div>
            <span className="text-[11px] uppercase font-bold tracking-wider px-3 py-1 rounded-full bg-amber-100 text-amber-900 border border-amber-200">
              PESO Verification Required
            </span>
            <h2 className="text-xl font-black text-slate-900 mt-2">
              Cannot Post Job Vacancies Yet
            </h2>
            <p className="text-xs text-slate-600 mt-2 leading-relaxed">
              Bago makapag-post ng trabaho sa eHANAP portal, kailangan munang ma-verify ang inyong establisyimento ng <strong>PESO Oriental Mindoro</strong>. Ang kasalukuyang accreditation status ng <strong>{currentEmployerProfile.companyName}</strong> ay: <span className="font-bold text-amber-700 uppercase">{currentEmployerProfile.status.replace(/_/g, ' ')}</span>.
            </p>
          </div>

          <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl text-left text-xs text-slate-700 space-y-2">
            <p className="font-bold text-slate-900">Mga Kailangang Hakbang ng Establisyimento:</p>
            <ul className="list-disc list-inside space-y-1 text-slate-600 text-[11px]">
              <li>Siguraduhing nai-upload ang mga kaukulang dokumento (AITR, DTI/SEC, Sedula, Barangay Clearance, FSIC, atbp.) sa inyong profile.</li>
              <li>Hintayin ang pagsusuri at kumpirmasyon mula sa PESO Admin Officer.</li>
            </ul>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors cursor-pointer"
            >
              Close
            </button>
            <button
              type="button"
              onClick={() => {
                verifyEmployer(currentEmployerProfile.id, 'verified', 'PESO Oriental Mindoro accreditation verified.');
                showToast({
                  type: 'match',
                  title: 'Establishment Verified! 🏛️',
                  message: `${currentEmployerProfile.companyName} is now verified by PESO! You can now create and publish job vacancies.`
                });
              }}
              className="w-full sm:w-auto px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Simulate PESO Approval</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  const handleAddReqSkill = () => {
    if (reqSkillInput.trim() && !requiredSkills.includes(reqSkillInput.trim())) {
      setRequiredSkills([...requiredSkills, reqSkillInput.trim()]);
      setReqSkillInput('');
    }
  };

  const handleRemoveReqSkill = (skill: string) => {
    setRequiredSkills(requiredSkills.filter(s => s !== skill));
  };

  const handleAddPrefSkill = () => {
    if (prefSkillInput.trim() && !preferredSkills.includes(prefSkillInput.trim())) {
      setPreferredSkills([...preferredSkills, prefSkillInput.trim()]);
      setPrefSkillInput('');
    }
  };

  const handleRemovePrefSkill = (skill: string) => {
    setPreferredSkills(preferredSkills.filter(s => s !== skill));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!title.trim() || !description.trim()) {
      setError('Please provide a job title and description.');
      return;
    }

    const responsibilities = responsibilitiesInput
      .split('\n')
      .map(r => r.trim())
      .filter(Boolean);

    const newJob = createJobPost({
      title,
      employerId: currentEmployerProfile.id,
      companyName: currentEmployerProfile.companyName,
      companyLogo: currentEmployerProfile.logoUrl,
      companyMunicipality: currentEmployerProfile.municipality,
      companyVerified: currentEmployerProfile.status === 'verified',
      category,
      municipality,
      employmentType,
      salaryRange,
      description,
      responsibilities: responsibilities.length > 0 ? responsibilities : ['Perform core role responsibilities efficiently.'],
      minEducationalAttainment,
      preferredDegree,
      degreeImportance,
      minExperienceYears,
      requiredSkills,
      preferredSkills,
      vacanciesCount: Number(vacanciesCount),
      applicationDeadline: deadline,
    });

    showToast({
      type: 'status',
      title: 'Job Submitted for PESO Review 📋',
      message: `"${title}" was submitted to Municipal PESO Roxas for compliance verification before publishing.`
    });

    onClose();
    if (onSuccess) onSuccess();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden flex flex-col max-h-[94vh] sm:max-h-[90vh]">
        
        {/* Modal Header */}
        <div className="bg-slate-900 px-5 sm:px-6 py-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-blue-400" />
            <h2 className="text-sm font-bold uppercase tracking-wider">
              Post New Job Vacancy (Oriental Mindoro)
            </h2>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 overflow-y-auto space-y-5 text-xs">
          
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              <span>{error}</span>
            </div>
          )}

          {/* Job Overview */}
          <div className="space-y-3">
            <div>
              <label className="block font-bold text-slate-800 mb-1">Job Title *</label>
              <input
                type="text"
                required
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="e.g. Senior Full-Stack Software Engineer"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block font-bold text-slate-800 mb-1">Job Category</label>
                <select
                  value={category}
                  onChange={e => setCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
                >
                  {JOB_CATEGORIES.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">Municipality Location</label>
                <select
                  value={municipality}
                  onChange={e => setMunicipality(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
                >
                  {ORIENTAL_MINDORO_MUNICIPALITIES.map(m => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">Employment Type</label>
                <select
                  value={employmentType}
                  onChange={e => setEmploymentType(e.target.value as any)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
                >
                  <option value="Full-time">Full-time</option>
                  <option value="Part-time">Part-time</option>
                  <option value="Contract">Contract</option>
                  <option value="Internship">Internship</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-800 mb-1">Salary Offer Range</label>
                <input
                  type="text"
                  value={salaryRange}
                  onChange={e => setSalaryRange(e.target.value)}
                  placeholder="e.g. ₱25,000 - ₱35,000 / month"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">Vacancies & Deadline</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    min="1"
                    value={vacanciesCount}
                    onChange={e => setVacanciesCount(parseInt(e.target.value) || 1)}
                    className="w-20 px-2 py-2 border border-slate-300 rounded-lg"
                    title="Vacancies Count"
                  />
                  <input
                    type="date"
                    value={deadline}
                    onChange={e => setDeadline(e.target.value)}
                    className="flex-1 px-2 py-2 border border-slate-300 rounded-lg bg-white"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-800 mb-1">Job Description *</label>
              <textarea
                rows={3}
                required
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Describe role objectives and team culture..."
                className="w-full px-3 py-2 border border-slate-300 rounded-lg"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-800 mb-1">Responsibilities (One per line)</label>
              <textarea
                rows={3}
                value={responsibilitiesInput}
                onChange={e => setResponsibilitiesInput(e.target.value)}
                placeholder="Design and develop scalable applications&#10;Collaborate with local Mindoro clients..."
                className="w-full px-3 py-2 border border-slate-300 rounded-lg"
              />
            </div>
          </div>

          {/* AI Decision Tree Criteria Configuration */}
          <div className="p-4 bg-blue-50/80 border border-blue-200 rounded-xl space-y-3">
            <h3 className="font-bold text-blue-900 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-blue-600" />
              AI Decision Tree Qualification Logic Parameters
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-800 mb-1">Required Educational Level</label>
                <select
                  value={minEducationalAttainment}
                  onChange={e => setMinEducationalAttainment(e.target.value as any)}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg bg-white"
                >
                  <option value="Bachelor's Degree">Bachelor's Degree</option>
                  <option value="Master's Degree">Master's Degree</option>
                  <option value="TVET / Vocational">TVET / Vocational</option>
                  <option value="High School">High School</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">Preferred Degree Specialization</label>
                <input
                  type="text"
                  value={preferredDegree}
                  onChange={e => setPreferredDegree(e.target.value)}
                  placeholder="e.g. BS Information Technology"
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">Degree Weight in Match Engine ({degreeImportance}%)</label>
                <input
                  type="range"
                  min="10"
                  max="50"
                  value={degreeImportance}
                  onChange={e => setDegreeImportance(parseInt(e.target.value))}
                  className="w-full accent-blue-600"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">Min. Experience Years</label>
                <input
                  type="number"
                  min="0"
                  max="20"
                  value={minExperienceYears}
                  onChange={e => setMinExperienceYears(parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg"
                />
              </div>
            </div>

            {/* Required Skills Adder */}
            <div>
              <label className="block font-bold text-slate-800 mb-0.5">Key Relevant Skills (Preferred & Evaluated)</label>
              <p className="text-[11px] text-slate-500 mb-1.5">Specify core competencies. Candidates are matched on what they possess — not all skills are strictly required to apply.</p>
              <div className="flex flex-wrap gap-1.5 mb-2">
                {requiredSkills.map(s => (
                  <span key={s} className="px-2 py-0.5 bg-blue-100 text-blue-900 rounded font-semibold flex items-center gap-1">
                    {s}
                    <button type="button" onClick={() => handleRemoveReqSkill(s)} className="hover:text-rose-600">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={reqSkillInput}
                  onChange={e => setReqSkillInput(e.target.value)}
                  placeholder="Add required skill..."
                  className="flex-1 px-3 py-1 border border-slate-300 rounded-lg bg-white"
                />
                <button
                  type="button"
                  onClick={handleAddReqSkill}
                  className="px-3 py-1 bg-blue-600 text-white font-bold rounded-lg"
                >
                  Add
                </button>
              </div>
            </div>
          </div>

          {/* PESO-LGU Notice */}
          <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-xl space-y-2">
            <div className="flex items-start gap-2 text-[11px] text-blue-900 leading-relaxed">
              <Sparkles className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
              <span>
                <strong>PESO-LGU Publication Workflow:</strong> All new job postings are submitted to the Municipal PESO Roxas administration for review and accreditation compliance before being published to the public.
              </span>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-200 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 border border-slate-300 rounded-xl font-bold text-slate-700 hover:bg-slate-100 transition-colors text-center cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-md transition-colors text-center cursor-pointer"
            >
              Submit for PESO Review
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};

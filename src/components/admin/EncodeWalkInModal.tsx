import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ROXAS_MUNICIPALITY, ROXAS_BARANGAYS } from '../../data/mockData';
import { TESDA_CERTIFICATIONS_LIST, PRACTICAL_SKILLS_LIST } from '../../data/pesoLguData';
import { 
  UserPlus, 
  X, 
  FileText, 
  GraduationCap, 
  Wrench, 
  Award, 
  MapPin, 
  CheckCircle2,
  Sparkles,
  Phone,
  Mail,
  Compass
} from 'lucide-react';

interface EncodeWalkInModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (newSeekerId: string) => void;
}

export const EncodeWalkInModal: React.FC<EncodeWalkInModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const { encodeWalkInJobSeeker, showToast } = useApp();

  const [firstName, setFirstName] = useState('');
  const [middleName, setMiddleName] = useState('');
  const [lastName, setLastName] = useState('');
  const [sex, setSex] = useState<'Male' | 'Female'>('Male');
  const [civilStatus, setCivilStatus] = useState('Single');
  const [dateOfBirth, setDateOfBirth] = useState('2001-05-14');
  const [age, setAge] = useState<number>(24);
  const [contactNumber, setContactNumber] = useState('09');
  const [email, setEmail] = useState('');
  const [barangay, setBarangay] = useState(ROXAS_BARANGAYS[0] || 'Bagumbayan');
  const [streetAddress, setStreetAddress] = useState('');

  // Education Category (Key PESO Demographics)
  const [educationCategory, setEducationCategory] = useState<'College Graduate' | 'High School Graduate' | 'Out-of-School Youth'>('High School Graduate');
  const [primaryDegree, setPrimaryDegree] = useState('');
  const [schoolAttended, setSchoolAttended] = useState('');

  // Practical Skills & TESDA Certifications
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [customSkillInput, setCustomSkillInput] = useState('');
  const [selectedCertifications, setSelectedCertifications] = useState<string[]>([]);
  const [customCertInput, setCustomCertInput] = useState('');

  // Geographic Mobility & Relocation Profiling
  const [geographicMobility, setGeographicMobility] = useState<'local_only' | 'provincial' | 'willing_to_relocate'>('local_only');
  const [willingToRelocateForVisitingCompanies, setWillingToRelocateForVisitingCompanies] = useState<boolean>(false);

  // Bio-Data physical notes
  const [bioDataNotes, setBioDataNotes] = useState('Physical bio-data submitted and verified by PESO Roxas Intake Staff.');

  if (!isOpen) return null;

  const toggleSkill = (skill: string) => {
    setSelectedSkills(prev => 
      prev.includes(skill) ? prev.filter(s => s !== skill) : [...prev, skill]
    );
  };

  const handleAddCustomSkill = (e: React.KeyboardEvent | React.MouseEvent) => {
    if ('key' in e && e.key !== 'Enter') return;
    if (customSkillInput.trim() && !selectedSkills.includes(customSkillInput.trim())) {
      setSelectedSkills(prev => [...prev, customSkillInput.trim()]);
      setCustomSkillInput('');
    }
  };

  const toggleCertification = (cert: string) => {
    setSelectedCertifications(prev => 
      prev.includes(cert) ? prev.filter(c => c !== cert) : [...prev, cert]
    );
  };

  const handleAddCustomCert = (e: React.KeyboardEvent | React.MouseEvent) => {
    if ('key' in e && e.key !== 'Enter') return;
    if (customCertInput.trim() && !selectedCertifications.includes(customCertInput.trim())) {
      setSelectedCertifications(prev => [...prev, customCertInput.trim()]);
      setCustomCertInput('');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName.trim() || !lastName.trim()) {
      showToast({
        title: 'Missing Required Fields',
        message: 'Please enter applicant First and Last name.',
        type: 'alert'
      });
      return;
    }

    if (!contactNumber.trim() || contactNumber.length < 7) {
      showToast({
        title: 'Invalid Contact Number',
        message: 'Please provide a valid contact number (at least 7 digits).',
        type: 'alert'
      });
      return;
    }

    const newSeeker = encodeWalkInJobSeeker({
      firstName: firstName.trim(),
      middleName: middleName.trim(),
      lastName: lastName.trim(),
      sex,
      civilStatus,
      dateOfBirth,
      age: Number(age) || 24,
      contactNumber: contactNumber.trim(),
      email: email.trim(),
      barangay,
      address: `${streetAddress ? streetAddress + ', ' : ''}Brgy. ${barangay}, Roxas, Oriental Mindoro`,
      municipality: 'Roxas',
      educationCategory,
      educationalAttainment: educationCategory === 'College Graduate' 
        ? (primaryDegree ? `Bachelor's Degree in ${primaryDegree}` : "College Graduate")
        : educationCategory,
      primaryDegree: primaryDegree.trim(),
      practicalSkills: selectedSkills,
      tradeCertifications: selectedCertifications,
      geographicMobility,
      willingToRelocateForVisitingCompanies,
      bioDataDetails: bioDataNotes,
      walkInAssessmentNotes: `Encoded during walk-in intake. Education: ${educationCategory}. Mobility: ${geographicMobility}. Skills: ${selectedSkills.join(', ') || 'General'}.`
    });

    onClose();
    if (onSuccess) onSuccess(newSeeker.id);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-2 sm:p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-auto animate-in fade-in duration-200 flex flex-col max-h-[94vh] sm:max-h-[90vh]">
        
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-slate-900 via-amber-950 to-slate-900 text-white p-4 sm:p-6 flex items-center justify-between border-b border-amber-900/40 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-400/30 flex items-center justify-center text-amber-400 shrink-0">
              <UserPlus className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold bg-amber-400/20 text-amber-300 px-2 py-0.5 rounded uppercase tracking-wider">
                  PESO-LGU Walk-In Module
                </span>
                <span className="text-xs text-slate-400 font-medium hidden sm:inline">Physical Bio-Data Intake</span>
              </div>
              <h2 className="text-base sm:text-lg font-black text-white truncate">
                Encode Walk-In Job Seeker
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

        {/* Modal Body / Form */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-6 overflow-y-auto text-xs text-slate-700 flex-1">
          
          {/* Section 1: Basic Applicant Demographics */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-slate-900 font-bold text-sm border-b border-slate-100 pb-2">
              <FileText className="w-4 h-4 text-amber-600" />
              <span>1. Applicant Identification & Contact Information</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">First Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Eduardo"
                  value={firstName}
                  onChange={e => setFirstName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 font-medium text-slate-900"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Middle Name</label>
                <input
                  type="text"
                  placeholder="e.g. Ramos"
                  value={middleName}
                  onChange={e => setMiddleName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 font-medium text-slate-900"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Last Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Hernandez"
                  value={lastName}
                  onChange={e => setLastName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 font-medium text-slate-900"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Sex</label>
                <select
                  value={sex}
                  onChange={e => setSex(e.target.value as any)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white font-medium text-slate-900"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Civil Status</label>
                <select
                  value={civilStatus}
                  onChange={e => setCivilStatus(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white font-medium text-slate-900"
                >
                  <option value="Single">Single</option>
                  <option value="Married">Married</option>
                  <option value="Widowed">Widowed</option>
                  <option value="Separated">Separated</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Date of Birth</label>
                <input
                  type="date"
                  value={dateOfBirth}
                  onChange={e => setDateOfBirth(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl font-medium text-slate-900"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Age</label>
                <input
                  type="number"
                  value={age}
                  onChange={e => setAge(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl font-medium text-slate-900"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Contact Number (Mobile) *</label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="tel"
                    required
                    placeholder="09171234567"
                    value={contactNumber}
                    onChange={e => setContactNumber(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 font-medium text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Email (Optional, auto-generated if blank)</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="email"
                    placeholder="applicant@example.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 font-medium text-slate-900"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Roxas Barangay *</label>
                <select
                  value={barangay}
                  onChange={e => setBarangay(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white font-medium text-slate-900"
                >
                  {ROXAS_BARANGAYS.map(b => (
                    <option key={b} value={b}>Brgy. {b}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Sitio / Street Address</label>
                <input
                  type="text"
                  placeholder="e.g. Sitio Crossing, Purok 3"
                  value={streetAddress}
                  onChange={e => setStreetAddress(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl font-medium text-slate-900"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Educational Categorization (College, High School, OSY) */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center gap-2 text-slate-900 font-bold text-sm border-b border-slate-100 pb-2">
              <GraduationCap className="w-4 h-4 text-amber-600" />
              <span>2. Educational Attainment (PESO Priority Demographics)</span>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-2">Education Classification *</label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {[
                  { id: 'College Graduate', title: 'College Graduate', desc: 'Bachelor / Associate Degree' },
                  { id: 'High School Graduate', title: 'High School Graduate', desc: 'K-12 / Senior or Junior High' },
                  { id: 'Out-of-School Youth', title: 'Out-of-School Youth (OSY)', desc: 'Not enrolled & looking for work' }
                ].map(opt => (
                  <label
                    key={opt.id}
                    className={`p-3 rounded-xl border cursor-pointer flex flex-col justify-between transition-all ${
                      educationCategory === opt.id
                        ? 'bg-amber-50/80 border-amber-400 text-amber-950 ring-1 ring-amber-400'
                        : 'bg-white border-slate-200 hover:border-slate-300 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-black text-xs">{opt.title}</span>
                      <input
                        type="radio"
                        name="educationCategory"
                        value={opt.id}
                        checked={educationCategory === opt.id}
                        onChange={() => setEducationCategory(opt.id as any)}
                        className="text-amber-600"
                      />
                    </div>
                    <span className="text-[10px] text-slate-500">{opt.desc}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Course / Degree / Strand (if applicable)</label>
                <input
                  type="text"
                  placeholder="e.g. BS Hospitality Management or TVL Strand"
                  value={primaryDegree}
                  onChange={e => setPrimaryDegree(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl font-medium text-slate-900"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Last School Attended</label>
                <input
                  type="text"
                  placeholder="e.g. Roxas National High School"
                  value={schoolAttended}
                  onChange={e => setSchoolAttended(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl font-medium text-slate-900"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Practical Skills & Physical Capabilities */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center gap-2 text-slate-900 font-bold text-sm border-b border-slate-100 pb-2">
              <Wrench className="w-4 h-4 text-amber-600" />
              <span>3. Practical Skills & Physical Capabilities</span>
            </div>

            <p className="text-[11px] text-slate-500">
              Select verified practical capabilities noted during bio-data intake (essential for walk-in matching):
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 max-h-40 overflow-y-auto p-2 bg-slate-50 rounded-xl border border-slate-200/80">
              {PRACTICAL_SKILLS_LIST.map(skill => (
                <button
                  type="button"
                  key={skill}
                  onClick={() => toggleSkill(skill)}
                  className={`text-left p-2 rounded-lg text-[11px] font-medium transition-colors flex items-center justify-between gap-1 border ${
                    selectedSkills.includes(skill)
                      ? 'bg-amber-100/80 border-amber-300 text-amber-900 font-bold'
                      : 'bg-white border-slate-200 hover:bg-slate-100 text-slate-700'
                  }`}
                >
                  <span className="truncate">{skill}</span>
                  {selectedSkills.includes(skill) && <CheckCircle2 className="w-3.5 h-3.5 text-amber-700 shrink-0" />}
                </button>
              ))}
            </div>

            {/* Custom Skill Addition */}
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Add other specific capability..."
                value={customSkillInput}
                onChange={e => setCustomSkillInput(e.target.value)}
                onKeyDown={handleAddCustomSkill}
                className="flex-1 px-3 py-1.5 text-xs border border-slate-200 rounded-lg text-slate-900"
              />
              <button
                type="button"
                onClick={handleAddCustomSkill}
                className="px-3 py-1.5 bg-slate-800 text-white rounded-lg font-bold text-xs hover:bg-slate-700"
              >
                Add
              </button>
            </div>
          </div>

          {/* Section 4: TESDA Trade Certifications */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center gap-2 text-slate-900 font-bold text-sm border-b border-slate-100 pb-2">
              <Award className="w-4 h-4 text-amber-600" />
              <span>4. TESDA National Certificates (NC I, NC II, NC III)</span>
            </div>

            <p className="text-[11px] text-slate-500">
              Check if applicant presented physical TESDA NC certificates:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 max-h-40 overflow-y-auto p-2 bg-slate-50 rounded-xl border border-slate-200/80">
              {TESDA_CERTIFICATIONS_LIST.map(cert => (
                <button
                  type="button"
                  key={cert}
                  onClick={() => toggleCertification(cert)}
                  className={`text-left p-2 rounded-lg text-[11px] font-medium transition-colors flex items-center justify-between gap-1 border ${
                    selectedCertifications.includes(cert)
                      ? 'bg-blue-50 border-blue-300 text-blue-900 font-bold'
                      : 'bg-white border-slate-200 hover:bg-slate-100 text-slate-700'
                  }`}
                >
                  <span className="truncate">{cert}</span>
                  {selectedCertifications.includes(cert) && <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Add other TESDA or PRC certification..."
                value={customCertInput}
                onChange={e => setCustomCertInput(e.target.value)}
                onKeyDown={handleAddCustomCert}
                className="flex-1 px-3 py-1.5 text-xs border border-slate-200 rounded-lg text-slate-900"
              />
              <button
                type="button"
                onClick={handleAddCustomCert}
                className="px-3 py-1.5 bg-slate-800 text-white rounded-lg font-bold text-xs hover:bg-slate-700"
              >
                Add Cert
              </button>
            </div>
          </div>

          {/* Section 5: Relocation Profiling & Geographic Mobility */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center gap-2 text-slate-900 font-bold text-sm border-b border-slate-100 pb-2">
              <Compass className="w-4 h-4 text-amber-600" />
              <span>5. Relocation Profiling & Geographic Mobility</span>
            </div>

            <p className="text-[11px] text-slate-500">
              Determine applicant's willingness to work outside Roxas or with visiting recruitment firms (LRAs):
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {[
                { id: 'local_only', title: 'Local Roxas Only', desc: 'Prefers employment within Roxas municipality' },
                { id: 'provincial', title: 'Provincial Level', desc: 'Open to Calapan, Pinamalayan, Mansalay, etc.' },
                { id: 'willing_to_relocate', title: 'Willing to Relocate', desc: 'Open to Manila, Batangas, or out-of-town' }
              ].map(mob => (
                <label
                  key={mob.id}
                  className={`p-3 rounded-xl border cursor-pointer flex flex-col justify-between transition-all ${
                    geographicMobility === mob.id
                      ? 'bg-emerald-50 border-emerald-400 text-emerald-950 ring-1 ring-emerald-400'
                      : 'bg-white border-slate-200 hover:border-slate-300 text-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-xs">{mob.title}</span>
                    <input
                      type="radio"
                      name="geographicMobility"
                      value={mob.id}
                      checked={geographicMobility === mob.id}
                      onChange={() => setGeographicMobility(mob.id as any)}
                      className="text-emerald-600"
                    />
                  </div>
                  <span className="text-[10px] text-slate-500">{mob.desc}</span>
                </label>
              ))}
            </div>

            <label className="flex items-start gap-2.5 p-3 bg-amber-50/60 rounded-xl border border-amber-200/80 cursor-pointer">
              <input
                type="checkbox"
                checked={willingToRelocateForVisitingCompanies}
                onChange={e => setWillingToRelocateForVisitingCompanies(e.target.checked)}
                className="mt-0.5 rounded text-amber-600 focus:ring-amber-500"
              />
              <span className="text-xs text-amber-950 font-medium leading-tight">
                <strong>Interested in Local Recruitment Activities (LRA):</strong> Notify this applicant when visiting construction, maritime, or agricultural companies from Calapan, Batangas, or Manila conduct hiring drives in Roxas.
              </span>
            </label>
          </div>

          {/* Section 6: Bio-Data Archive Notes */}
          <div className="space-y-2 pt-2">
            <label className="block font-bold text-slate-700">
              PESO Officer Bio-Data Intake Remarks
            </label>
            <textarea
              rows={2}
              value={bioDataNotes}
              onChange={e => setBioDataNotes(e.target.value)}
              className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 text-xs font-medium text-slate-900"
              placeholder="Notes on physical document submission, appearance, interview assessment..."
            />
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2.5 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors text-center"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="px-6 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-amber-950 font-black text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4 text-amber-950" />
              <span>Save & Encode Walk-In Seeker</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};

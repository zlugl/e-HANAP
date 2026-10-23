import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  JobSeekerProfile, 
  EducationRecord, 
  WorkExperienceRecord, 
  CertificationRecord, 
  ProjectRecord, 
  VolunteerExperienceRecord, 
  AwardRecord 
} from '../../types';
import { motion } from 'motion/react';
import { 
  X, 
  Save, 
  Plus, 
  Trash2, 
  Check, 
  Upload, 
  FileText, 
  Calendar, 
  Building, 
  GraduationCap, 
  Award, 
  HeartHandshake, 
  FolderGit2, 
  Globe, 
  Phone, 
  Mail, 
  MapPin 
} from 'lucide-react';

// ==========================================
// 1. CONTACT INFO MODAL
// ==========================================
export const ContactInfoModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  seeker: JobSeekerProfile;
}> = ({ isOpen, onClose, seeker }) => {
  const { updateJobSeekerProfile, showToast } = useApp();
  const [email, setEmail] = useState(seeker.email || '');
  const [phone, setPhone] = useState(seeker.contactNumber || '');
  const [address, setAddress] = useState(seeker.address || '');
  const [website, setWebsite] = useState(seeker.website || '');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateJobSeekerProfile(seeker.id, {
      email,
      contactNumber: phone,
      address,
      website,
    });
    showToast({ title: "Contact Info Saved", message: "Your contact details have been updated.", type: "success" });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100 flex flex-col"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h3 className="text-base font-bold text-slate-900">Contact Info</h3>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full h-11 px-4 rounded-2xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700">Phone Number</label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full h-11 px-4 rounded-2xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700">Address / Barangay</label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full h-11 px-4 rounded-2xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700">Portfolio / Website (Optional)</label>
            <input
              type="url"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              placeholder="https://..."
              className="w-full h-11 px-4 rounded-2xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-600/20 transition-all mt-2"
          >
            Save Contact Details
          </button>
        </form>
      </motion.div>
    </div>
  );
};

// ==========================================
// 2. ABOUT ME MODAL
// ==========================================
export const AboutMeModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  seeker: JobSeekerProfile;
}> = ({ isOpen, onClose, seeker }) => {
  const { updateJobSeekerProfile, showToast } = useApp();
  const [bio, setBio] = useState(seeker.professionalSummary || seeker.summary || '');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateJobSeekerProfile(seeker.id, {
      professionalSummary: bio,
      summary: bio,
    });
    showToast({ title: "Bio Saved", message: "Your summary has been updated.", type: "success" });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100 flex flex-col"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h3 className="text-base font-bold text-slate-900">About Me</h3>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <label className="font-bold text-slate-700">Professional Summary</label>
              <span className="text-slate-400 font-mono">{bio.length}/500</span>
            </div>
            <textarea
              rows={6}
              maxLength={500}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell employers about your experience, key strengths, and career aspirations..."
              className="w-full p-4 rounded-2xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none resize-none leading-relaxed"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-600/20 transition-all"
          >
            Save Summary
          </button>
        </form>
      </motion.div>
    </div>
  );
};

// ==========================================
// 3. EDUCATION MODAL
// ==========================================
export const EducationModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  seeker: JobSeekerProfile;
}> = ({ isOpen, onClose, seeker }) => {
  const { updateJobSeekerProfile, showToast } = useApp();
  const [school, setSchool] = useState('');
  const [degree, setDegree] = useState('');
  const [attainment, setAttainment] = useState("Bachelor's Degree");
  const [yearGraduated, setYearGraduated] = useState(2024);

  if (!isOpen) return null;

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const newEdu: EducationRecord = {
      id: `edu-${Date.now()}`,
      school,
      degreeCourse: degree,
      educationalAttainment: attainment,
      yearGraduated: Number(yearGraduated),
    };
    const updated = [...(seeker.education || []), newEdu];
    updateJobSeekerProfile(seeker.id, { education: updated });
    showToast({ title: "Education Added", message: "Education record saved.", type: "success" });
    onClose();
  };

  const handleRemove = (id: string) => {
    const updated = (seeker.education || []).filter(e => e.id !== id);
    updateJobSeekerProfile(seeker.id, { education: updated });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100 flex flex-col max-h-[85vh]"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h3 className="text-base font-bold text-slate-900">Education Background</h3>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-5">
          {/* Existing list */}
          {(seeker.education || []).length > 0 && (
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Current Records</label>
              {seeker.education.map((edu) => (
                <div key={edu.id} className="p-3 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between">
                  <div>
                    <h5 className="text-xs font-bold text-slate-900">{edu.degreeCourse}</h5>
                    <p className="text-[11px] text-slate-500">{edu.school} • Graduated {edu.yearGraduated}</p>
                  </div>
                  <button onClick={() => handleRemove(edu.id)} className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Form to add new */}
          <form onSubmit={handleAdd} className="space-y-3 pt-2 border-t border-slate-100">
            <h4 className="text-xs font-bold text-blue-600 uppercase tracking-wider">Add New Education</h4>
            
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">School / University</label>
              <input
                type="text"
                value={school}
                onChange={(e) => setSchool(e.target.value)}
                placeholder="e.g., Mindoro State University - Bongabong/Calapan"
                className="w-full h-11 px-4 rounded-2xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Degree / Course</label>
              <input
                type="text"
                value={degree}
                onChange={(e) => setDegree(e.target.value)}
                placeholder="e.g., BS Information Technology / BS Agriculture"
                className="w-full h-11 px-4 rounded-2xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Attainment Level</label>
                <select
                  value={attainment}
                  onChange={(e) => setAttainment(e.target.value)}
                  className="w-full h-11 px-3 rounded-2xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none bg-white"
                >
                  <option value="Bachelor's Degree">Bachelor's Degree</option>
                  <option value="Master's Degree">Master's Degree</option>
                  <option value="TVET / Vocational">TVET / Vocational (TESDA)</option>
                  <option value="Senior High School">Senior High School</option>
                  <option value="College Undergraduate">College Undergraduate</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Graduation Year</label>
                <input
                  type="number"
                  value={yearGraduated}
                  onChange={(e) => setYearGraduated(Number(e.target.value))}
                  className="w-full h-11 px-4 rounded-2xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-600/20 transition-all mt-2"
            >
              Add Education
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

// ==========================================
// 4. WORK EXPERIENCE MODAL
// ==========================================
export const ExperienceModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  seeker: JobSeekerProfile;
}> = ({ isOpen, onClose, seeker }) => {
  const { updateJobSeekerProfile, showToast } = useApp();
  const [company, setCompany] = useState('');
  const [position, setPosition] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isCurrent, setIsCurrent] = useState(false);
  const [responsibilities, setResponsibilities] = useState('');

  if (!isOpen) return null;

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const newExp: WorkExperienceRecord = {
      id: `exp-${Date.now()}`,
      company,
      position,
      startDate: startDate || '2023',
      endDate: isCurrent ? 'Present' : (endDate || '2025'),
      isCurrent,
      responsibilities,
      yearsOfExperience: 2,
    };
    const updated = [...(seeker.workExperience || []), newExp];
    updateJobSeekerProfile(seeker.id, { workExperience: updated });
    showToast({ title: "Experience Added", message: "Work experience saved.", type: "success" });
    onClose();
  };

  const handleRemove = (id: string) => {
    const updated = (seeker.workExperience || []).filter(e => e.id !== id);
    updateJobSeekerProfile(seeker.id, { workExperience: updated });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100 flex flex-col max-h-[85vh]"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h3 className="text-base font-bold text-slate-900">Work Experience</h3>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-5">
          {(seeker.workExperience || []).length > 0 && (
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Saved Experience</label>
              {seeker.workExperience.map((exp) => (
                <div key={exp.id} className="p-3 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between">
                  <div>
                    <h5 className="text-xs font-bold text-slate-900">{exp.position}</h5>
                    <p className="text-[11px] text-slate-500">{exp.company} • {exp.startDate} - {exp.endDate}</p>
                  </div>
                  <button onClick={() => handleRemove(exp.id)} className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}

          <form onSubmit={handleAdd} className="space-y-3 pt-2 border-t border-slate-100">
            <h4 className="text-xs font-bold text-blue-600 uppercase tracking-wider">Add Experience</h4>
            
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Company Name</label>
              <input
                type="text"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="e.g., Mindoro Harvest / Roxas Port Terminal"
                className="w-full h-11 px-4 rounded-2xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Job Title / Position</label>
              <input
                type="text"
                value={position}
                onChange={(e) => setPosition(e.target.value)}
                placeholder="e.g., Warehouse Clerk / Junior Developer"
                className="w-full h-11 px-4 rounded-2xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Start Date</label>
                <input
                  type="text"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  placeholder="e.g., Jan 2023"
                  className="w-full h-11 px-4 rounded-2xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">End Date</label>
                <input
                  type="text"
                  disabled={isCurrent}
                  value={isCurrent ? 'Present' : endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  placeholder="e.g., Dec 2024"
                  className="w-full h-11 px-4 rounded-2xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none disabled:bg-slate-100"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="isCurrent"
                checked={isCurrent}
                onChange={(e) => setIsCurrent(e.target.checked)}
                className="w-4 h-4 rounded text-blue-600 accent-blue-600"
              />
              <label htmlFor="isCurrent" className="text-xs font-semibold text-slate-700">
                Currently working in this role
              </label>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Job Description / Responsibilities</label>
              <textarea
                rows={3}
                value={responsibilities}
                onChange={(e) => setResponsibilities(e.target.value)}
                placeholder="Key accomplishments and daily tasks..."
                className="w-full p-3 rounded-2xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none resize-none"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-600/20 transition-all mt-2"
            >
              Add Experience
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

// ==========================================
// 5. PROJECTS MODAL
// ==========================================
export const ProjectsModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  seeker: JobSeekerProfile;
}> = ({ isOpen, onClose, seeker }) => {
  const { updateJobSeekerProfile, showToast } = useApp();
  const [name, setName] = useState('');
  const [client, setClient] = useState('');
  const [url, setUrl] = useState('');
  const [desc, setDesc] = useState('');

  if (!isOpen) return null;

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const newProj: ProjectRecord = {
      id: `proj-${Date.now()}`,
      name,
      client,
      projectUrl: url,
      description: desc,
    };
    const updated = [...(seeker.projects || []), newProj];
    updateJobSeekerProfile(seeker.id, { projects: updated });
    showToast({ title: "Project Added", message: "Portfolio project saved.", type: "success" });
    onClose();
  };

  const handleRemove = (id: string) => {
    const updated = (seeker.projects || []).filter(p => p.id !== id);
    updateJobSeekerProfile(seeker.id, { projects: updated });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100 flex flex-col max-h-[85vh]"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h3 className="text-base font-bold text-slate-900">Projects & Portfolio</h3>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-5">
          {(seeker.projects || []).length > 0 && (
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Saved Projects</label>
              {seeker.projects?.map((proj) => (
                <div key={proj.id} className="p-3 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between">
                  <div>
                    <h5 className="text-xs font-bold text-slate-900">{proj.name}</h5>
                    <p className="text-[11px] text-slate-500">{proj.client || 'Personal Project'}</p>
                  </div>
                  <button onClick={() => handleRemove(proj.id)} className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}

          <form onSubmit={handleAdd} className="space-y-3 pt-2 border-t border-slate-100">
            <h4 className="text-xs font-bold text-blue-600 uppercase tracking-wider">Add New Project</h4>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Project Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., E-Commerce Agri-Hub Roxas"
                className="w-full h-11 px-4 rounded-2xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Client / Institution</label>
              <input
                type="text"
                value={client}
                onChange={(e) => setClient(e.target.value)}
                placeholder="e.g., Roxas LGU / Private Enterprise"
                className="w-full h-11 px-4 rounded-2xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Project URL / Link</label>
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://..."
                className="w-full h-11 px-4 rounded-2xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Description</label>
              <textarea
                rows={3}
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
                placeholder="Tech stack used and key features..."
                className="w-full p-3 rounded-2xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none resize-none"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-600/20 transition-all mt-2"
            >
              Add Project
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

// ==========================================
// 6. CERTIFICATIONS MODAL
// ==========================================
export const CertificationsModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  seeker: JobSeekerProfile;
}> = ({ isOpen, onClose, seeker }) => {
  const { updateJobSeekerProfile, showToast } = useApp();
  const [name, setName] = useState('');
  const [org, setOrg] = useState('TESDA');
  const [date, setDate] = useState('2024');

  if (!isOpen) return null;

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const newCert: CertificationRecord = {
      id: `cert-${Date.now()}`,
      name,
      issuingOrganization: org,
      dateObtained: date,
    };
    const updated = [...(seeker.certifications || []), newCert];
    updateJobSeekerProfile(seeker.id, { certifications: updated });
    showToast({ title: "Certification Added", message: "Credential recorded.", type: "success" });
    onClose();
  };

  const handleRemove = (id: string) => {
    const updated = (seeker.certifications || []).filter(c => c.id !== id);
    updateJobSeekerProfile(seeker.id, { certifications: updated });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100 flex flex-col max-h-[85vh]"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h3 className="text-base font-bold text-slate-900">Certifications & Licenses</h3>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-5">
          {(seeker.certifications || []).length > 0 && (
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Recorded Licenses</label>
              {seeker.certifications.map((c) => (
                <div key={c.id} className="p-3 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between">
                  <div>
                    <h5 className="text-xs font-bold text-slate-900">{c.name}</h5>
                    <p className="text-[11px] text-slate-500">{c.issuingOrganization} • {c.dateObtained}</p>
                  </div>
                  <button onClick={() => handleRemove(c.id)} className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}

          <form onSubmit={handleAdd} className="space-y-3 pt-2 border-t border-slate-100">
            <h4 className="text-xs font-bold text-blue-600 uppercase tracking-wider">Add Certification</h4>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Certificate Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., TESDA SMAW NC II / Civil Service Professional"
                className="w-full h-11 px-4 rounded-2xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Issuing Organization</label>
              <input
                type="text"
                value={org}
                onChange={(e) => setOrg(e.target.value)}
                placeholder="e.g., TESDA / PRC / CSC"
                className="w-full h-11 px-4 rounded-2xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Year Obtained</label>
              <input
                type="text"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                placeholder="e.g., 2024"
                className="w-full h-11 px-4 rounded-2xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-600/20 transition-all mt-2"
            >
              Add Certification
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

// ==========================================
// 7. VOLUNTEER EXPERIENCE MODAL
// ==========================================
export const VolunteerModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  seeker: JobSeekerProfile;
}> = ({ isOpen, onClose, seeker }) => {
  const { updateJobSeekerProfile, showToast } = useApp();
  const [role, setRole] = useState('');
  const [org, setOrg] = useState('');
  const [desc, setDesc] = useState('');

  if (!isOpen) return null;

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const newVol: VolunteerExperienceRecord = {
      id: `vol-${Date.now()}`,
      role,
      organization: org,
      description: desc,
    };
    const updated = [...(seeker.volunteerExperience || []), newVol];
    updateJobSeekerProfile(seeker.id, { volunteerExperience: updated });
    showToast({ title: "Volunteer Experience Added", message: "Community service saved.", type: "success" });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100 flex flex-col"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h3 className="text-base font-bold text-slate-900">Volunteer Experience</h3>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleAdd} className="p-6 space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700">Role / Title</label>
            <input
              type="text"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              placeholder="e.g., Youth Community Volunteer / Red Cross Responder"
              className="w-full h-11 px-4 rounded-2xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700">Organization Name</label>
            <input
              type="text"
              value={org}
              onChange={(e) => setOrg(e.target.value)}
              placeholder="e.g., Philippine Red Cross Oriental Mindoro / SK Roxas"
              className="w-full h-11 px-4 rounded-2xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700">Description (Optional)</label>
            <textarea
              rows={3}
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              placeholder="Brief description of outreach or volunteer initiative..."
              className="w-full p-3 rounded-2xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none resize-none"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-600/20 transition-all"
          >
            Save Volunteer Work
          </button>
        </form>
      </motion.div>
    </div>
  );
};

// ==========================================
// 8. AWARDS & ACHIEVEMENTS MODAL
// ==========================================
export const AwardsModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  seeker: JobSeekerProfile;
}> = ({ isOpen, onClose, seeker }) => {
  const { updateJobSeekerProfile, showToast } = useApp();
  const [title, setTitle] = useState('');
  const [org, setOrg] = useState('');
  const [date, setDate] = useState('2024');

  if (!isOpen) return null;

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const newAward: AwardRecord = {
      id: `award-${Date.now()}`,
      title,
      organization: org,
      dateAwarded: date,
    };
    const updated = [...(seeker.awards || []), newAward];
    updateJobSeekerProfile(seeker.id, { awards: updated });
    showToast({ title: "Award Added", message: "Honor & award recorded.", type: "success" });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100 flex flex-col"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h3 className="text-base font-bold text-slate-900">Awards & Achievements</h3>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleAdd} className="p-6 space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700">Award Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Best in Technical Proficiency / Cum Laude"
              className="w-full h-11 px-4 rounded-2xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700">Conferring Organization</label>
            <input
              type="text"
              value={org}
              onChange={(e) => setOrg(e.target.value)}
              placeholder="e.g., Mindoro State University / DOLE"
              className="w-full h-11 px-4 rounded-2xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700">Year Awarded</label>
            <input
              type="text"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              placeholder="e.g., 2024"
              className="w-full h-11 px-4 rounded-2xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-600/20 transition-all"
          >
            Save Award
          </button>
        </form>
      </motion.div>
    </div>
  );
};

// ==========================================
// 9. SKILLS MODAL
// ==========================================
export const SkillsModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  seeker: JobSeekerProfile;
}> = ({ isOpen, onClose, seeker }) => {
  const { updateJobSeekerProfile, showToast } = useApp();
  const [skills, setSkills] = useState<string[]>(seeker.technicalSkills || []);
  const [newSkill, setNewSkill] = useState('');

  if (!isOpen) return null;

  const handleAddSkill = (skillToAdd: string) => {
    const trimmed = skillToAdd.trim();
    if (trimmed && !skills.includes(trimmed)) {
      setSkills([...skills, trimmed]);
      setNewSkill('');
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setSkills(skills.filter(s => s !== skillToRemove));
  };

  const handleSave = () => {
    updateJobSeekerProfile(seeker.id, {
      technicalSkills: skills,
    });
    showToast({ title: "Skills Updated", message: `${skills.length} skills saved to profile.`, type: "success" });
    onClose();
  };

  const suggestions = [
    'React.js', 'JavaScript', 'SQL', 'Accountancy', 'Bookkeeping', 
    'Warehouse Management', 'Port Operations', 'Customer Service',
    'Driving NC II', 'Welding SMAW NC II', 'Organic Farming'
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100 flex flex-col"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h3 className="text-base font-bold text-slate-900">Skills & Competencies</h3>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="flex gap-2">
            <input
              type="text"
              value={newSkill}
              onChange={(e) => setNewSkill(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddSkill(newSkill);
                }
              }}
              placeholder="Add skill tag (e.g., Bookkeeping)..."
              className="flex-1 h-11 px-4 rounded-2xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none"
            />
            <button
              type="button"
              onClick={() => handleAddSkill(newSkill)}
              className="px-4 h-11 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs"
            >
              Add
            </button>
          </div>

          {/* Current Skill Chips */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">Selected Skills ({skills.length})</label>
            <div className="flex flex-wrap gap-2 min-h-[60px] p-3 rounded-2xl bg-slate-50 border border-slate-100">
              {skills.map((s) => (
                <span
                  key={s}
                  className="px-3 py-1 bg-white border border-blue-200 text-blue-700 rounded-full text-xs font-semibold flex items-center gap-1.5 shadow-xs"
                >
                  <span>{s}</span>
                  <button
                    onClick={() => handleRemoveSkill(s)}
                    className="hover:text-rose-600"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Suggestions */}
          <div className="space-y-1.5 pt-1">
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Popular in Roxas</label>
            <div className="flex flex-wrap gap-1.5">
              {suggestions.map((sug) => (
                <button
                  key={sug}
                  type="button"
                  onClick={() => handleAddSkill(sug)}
                  disabled={skills.includes(sug)}
                  className={`px-2.5 py-1 rounded-xl text-[11px] font-medium transition-colors ${
                    skills.includes(sug)
                      ? 'bg-slate-100 text-slate-400'
                      : 'bg-slate-100 hover:bg-blue-50 hover:text-blue-600 text-slate-700'
                  }`}
                >
                  + {sug}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleSave}
            className="w-full py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-600/20 transition-all mt-3"
          >
            Save Skills
          </button>
        </div>
      </motion.div>
    </div>
  );
};

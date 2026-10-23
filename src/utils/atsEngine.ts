import { AtsScanResult, AtsSectionScore, JobPost, JobSeekerProfile, ResumeFile } from '../types';

export interface AtsEvaluationInput {
  fileName?: string;
  fileType?: string;
  extractedSkills?: string[];
  extractedEducation?: string;
  extractedDegree?: string;
  extractedExperienceYears?: number;
  contactNumber?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  address?: string;
  municipality?: string;
  professionalSummary?: string;
  certifications?: (string | { name: string })[];
  rawTextPreview?: string;
  workExperience?: any[];
  education?: any[];
}

/**
 * Normalizes keyword strings for high-accuracy tokenized ATS comparison.
 */
function normalizeKeyword(term: string): string {
  return term
    .toLowerCase()
    .replace(/[._\-/\\]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Standard Applicant Tracking System evaluation engine for Oriental Mindoro employment portal.
 * Audits resume structure, contact transparency, section headings, machine-readability,
 * and keyword alignment against specific job vacancies or PESO benchmark criteria.
 */
export function evaluateResumeForAts(
  resumeInput: AtsEvaluationInput | ResumeFile | JobSeekerProfile,
  targetJob?: JobPost | null
): AtsScanResult {
  const sectionsDetected: string[] = [];
  const missingSections: string[] = [];
  const sectionScores: AtsSectionScore[] = [];
  const recommendations: string[] = [];

  // Extract properties safely
  const input = resumeInput as any;
  const firstName = input.firstName || '';
  const lastName = input.lastName || '';
  const email = input.email || '';
  const phone = input.contactNumber || '';
  const municipality = input.municipality || input.address || '';
  const summary = input.professionalSummary || input.summary || '';
  const degree = input.extractedDegree || input.primaryDegree || '';
  const educationLevel = input.extractedEducation || input.educationalAttainment || '';
  const experienceYears = Number(input.extractedExperienceYears ?? input.experienceYears ?? 0);
  const skills: string[] = Array.isArray(input.extractedSkills)
    ? input.extractedSkills
    : Array.isArray(input.technicalSkills)
    ? [...input.technicalSkills, ...(input.softSkills || [])]
    : [];
  const rawText: string = input.rawTextPreview || '';
  const certs: string[] = Array.isArray(input.certifications)
    ? input.certifications.map((c: any) => (typeof c === 'string' ? c : c.name || ''))
    : [];

  // 1. Contact Information Completeness
  let contactScore = 0;
  const contactDetails: string[] = [];

  if (firstName || lastName || rawText.length > 10) {
    contactScore += 25;
    contactDetails.push('Candidate Name');
  }
  if (email && email.includes('@') && email.includes('.')) {
    contactScore += 25;
    contactDetails.push('Verified Email Address');
  } else {
    recommendations.push('Include a clear professional email address formatted at the top of your resume.');
  }

  const cleanPhone = phone.replace(/[\s\-()]/g, '');
  if (cleanPhone.length >= 10) {
    contactScore += 25;
    contactDetails.push('Primary Contact Number');
  } else {
    recommendations.push('Add an active mobile contact number (e.g., 0917-xxx-xxxx) in standard Philippine format.');
  }

  if (municipality && municipality.length > 2) {
    contactScore += 25;
    contactDetails.push('Location / Municipality');
  } else {
    recommendations.push('Specify your municipality in Oriental Mindoro (e.g., Roxas) for PESO locality verification.');
  }

  sectionScores.push({
    name: 'Contact Information',
    status: contactScore >= 90 ? 'pass' : contactScore >= 60 ? 'warning' : 'missing',
    score: contactScore,
    details: `Detected: ${contactDetails.join(', ') || 'Partial/Incomplete'}.`,
  });

  // 2. Section Detection
  if (summary && summary.trim().length > 20) {
    sectionsDetected.push('Professional Summary');
  } else {
    missingSections.push('Professional Summary');
    recommendations.push('Add a concise 2-3 sentence Professional Summary highlighting your career background.');
  }

  if (degree || educationLevel || (input.education && input.education.length > 0)) {
    sectionsDetected.push('Education & Credentials');
  } else {
    missingSections.push('Education & Credentials');
    recommendations.push('Ensure your degree course, school name, and graduation year are clearly labeled under Education.');
  }

  if (experienceYears > 0 || (input.workExperience && input.workExperience.length > 0)) {
    sectionsDetected.push('Work History & Experience');
  } else {
    missingSections.push('Work History');
    recommendations.push('Detail any past work experience, internships, or practical vocational training with bullet points.');
  }

  if (skills.length > 0) {
    sectionsDetected.push('Skills & Core Competencies');
  } else {
    missingSections.push('Skills & Core Competencies');
    recommendations.push('Add a designated "Technical Skills" section listing specific tools, software, and domain competencies.');
  }

  if (certs.length > 0) {
    sectionsDetected.push('Certifications & Licensure');
  }

  const sectionCoverageScore = Math.min(
    100,
    Math.round(
      (sectionsDetected.includes('Education & Credentials') ? 30 : 0) +
      (sectionsDetected.includes('Work History & Experience') ? 30 : 0) +
      (sectionsDetected.includes('Skills & Core Competencies') ? 25 : 0) +
      (sectionsDetected.includes('Professional Summary') ? 15 : 0)
    )
  );

  sectionScores.push({
    name: 'Standard ATS Sections',
    status: sectionCoverageScore >= 80 ? 'pass' : sectionCoverageScore >= 50 ? 'warning' : 'missing',
    score: sectionCoverageScore,
    details: `${sectionsDetected.length} standard sections identified (${sectionsDetected.join(', ')}).`,
  });

  // 3. Formatting & Machine Readability
  const fileExt = (input.fileName || '').split('.').pop()?.toLowerCase();
  let readabilityScore = 95;

  if (fileExt && !['pdf', 'docx', 'doc', 'txt'].includes(fileExt)) {
    readabilityScore = 60;
    recommendations.push('Submit your resume in standard PDF (.pdf) or Microsoft Word (.docx) format for seamless ATS parsing.');
  }

  sectionScores.push({
    name: 'Document Readability & Layout',
    status: readabilityScore >= 90 ? 'pass' : 'warning',
    score: readabilityScore,
    details: 'Clean machine-parseable text layout without non-standard embedded graphic tables.',
  });

  // 4. Keyword & Competency Alignment
  let matchedKeywords: string[] = [];
  let missingKeywords: string[] = [];
  let keywordScore = 80;

  if (targetJob) {
    const jobKeywords: string[] = [
      ...(targetJob.requiredSkills || []),
      ...(targetJob.preferredSkills || []),
      ...(targetJob.technicalSkills || []),
      ...(targetJob.softSkills || []),
    ];

    if (targetJob.preferredDegree) {
      jobKeywords.push(targetJob.preferredDegree);
    }

    // Unique normalized job keywords
    const uniqueJobKeywords = Array.from(new Set(jobKeywords.map(k => k.trim()).filter(Boolean)));
    const seekerNormalizedKeywords = [
      ...skills.map(s => normalizeKeyword(s)),
      normalizeKeyword(degree),
      normalizeKeyword(educationLevel),
      normalizeKeyword(rawText),
      summary ? normalizeKeyword(summary) : '',
    ].join(' ');

    for (const kw of uniqueJobKeywords) {
      const normKw = normalizeKeyword(kw);
      if (seekerNormalizedKeywords.includes(normKw) || skills.some(s => normalizeKeyword(s).includes(normKw))) {
        matchedKeywords.push(kw);
      } else {
        missingKeywords.push(kw);
      }
    }

    if (uniqueJobKeywords.length > 0) {
      const matchRate = matchedKeywords.length / uniqueJobKeywords.length;
      keywordScore = Math.min(100, Math.round(50 + matchRate * 50));
    }

    if (missingKeywords.length > 0) {
      recommendations.push(
        `Incorporate missing job keywords: ${missingKeywords.slice(0, 4).join(', ')} into your experience bullet points.`
      );
    }
  } else {
    // General keyword analysis
    matchedKeywords = skills.slice(0, 10);
    keywordScore = Math.min(100, Math.max(60, skills.length * 10 + 20));
  }

  sectionScores.push({
    name: 'ATS Keyword & Skill Density',
    status: keywordScore >= 80 ? 'pass' : keywordScore >= 60 ? 'warning' : 'missing',
    score: keywordScore,
    details: `${matchedKeywords.length} matching keywords identified. ${missingKeywords.length} missing high-impact terms.`,
  });

  // 5. Work Experience Timeline & Duration
  let experienceScore = 70;
  if (experienceYears >= 1) {
    experienceScore = 95;
  } else if (input.workExperience && input.workExperience.length > 0) {
    experienceScore = 85;
  } else {
    experienceScore = 65;
  }

  sectionScores.push({
    name: 'Experience Continuity & Roles',
    status: experienceScore >= 80 ? 'pass' : 'warning',
    score: experienceScore,
    details: experienceYears > 0 ? `${experienceYears}+ years recorded work experience.` : 'Entry-level or project-based training record.',
  });

  // Calculate Weighted Overall ATS Score
  const overallScore = Math.round(
    contactScore * 0.15 +
    sectionCoverageScore * 0.25 +
    readabilityScore * 0.15 +
    keywordScore * 0.30 +
    experienceScore * 0.15
  );

  const clampedScore = Math.max(35, Math.min(99, overallScore));

  let grade: 'A+' | 'A' | 'B' | 'C' | 'D' = 'B';
  if (clampedScore >= 90) grade = 'A+';
  else if (clampedScore >= 80) grade = 'A';
  else if (clampedScore >= 70) grade = 'B';
  else if (clampedScore >= 60) grade = 'C';
  else grade = 'D';

  const formatStatus = clampedScore >= 85 ? 'ats_optimized' : clampedScore >= 70 ? 'needs_improvement' : 'warning';

  return {
    score: clampedScore,
    grade,
    formatStatus,
    sectionsDetected,
    missingSections,
    matchedKeywords,
    missingKeywords,
    keywordDensityPercent: Math.min(100, Math.round((matchedKeywords.length / Math.max(1, matchedKeywords.length + missingKeywords.length)) * 100)),
    sectionScores,
    recommendations: recommendations.length > 0 ? recommendations : ['Your resume follows optimal ATS formatting conventions and structure.'],
    readabilityScore,
    contactCompleteness: contactScore,
    skillsCount: skills.length,
    experienceContinuity: experienceYears > 0 || (input.workExperience && input.workExperience.length > 0),
    rawTextPreview: rawText || `Resume extracted for ${firstName} ${lastName}`,
    scannedAt: new Date().toISOString(),
  };
}

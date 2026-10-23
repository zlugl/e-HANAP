import { JobPost, JobSeekerProfile, MatchResult, DecisionTreeOutcome, DegreeAlignmentType } from '../types';

/**
 * Educational Attainment Rank Mapping
 */
const EDUCATION_LEVELS: Record<string, number> = {
  "High School": 1,
  "TVET / Vocational": 2,
  "Associate Degree": 3,
  "Bachelor's Degree": 4,
  "Postgraduate Diploma": 5,
  "Master's Degree": 6,
  "Doctorate / PhD": 7,
};

/**
 * Normalizes text string for case-insensitive matching
 */
function normalize(str: string): string {
  return str.toLowerCase().trim();
}

/**
 * Computes degree alignment between seeker's primary degree and job's preferred degree
 */
function evaluateDegreeAlignment(seekerDegree: string, jobDegree: string): {
  score: number;
  type: DegreeAlignmentType;
  reason: string;
} {
  if (!jobDegree || jobDegree.toLowerCase().includes('any') || jobDegree.toLowerCase().includes('open to all')) {
    return {
      score: 100,
      type: 'exact',
      reason: 'Job accepts any academic degree.',
    };
  }

  const normSeeker = normalize(seekerDegree);
  const normJob = normalize(jobDegree);

  // Exact match
  if (normSeeker === normJob || normSeeker.includes(normJob) || normJob.includes(normSeeker)) {
    return {
      score: 100,
      type: 'exact',
      reason: `Degree "${seekerDegree}" matches required/preferred degree "${jobDegree}".`,
    };
  }

  // Related Field Keywords grouping
  const techDegrees = ['computer science', 'information technology', 'software engineering', 'computer engineering', 'is', 'it', 'cs'];
  const bizDegrees = ['accountancy', 'business administration', 'finance', 'management', 'marketing', 'entrepreneurship', 'economics'];
  const agroDegrees = ['agriculture', 'agribusiness', 'agronomy', 'crop science', 'agricultural engineering', 'forestry'];
  const tourismDegrees = ['tourism', 'hospitality management', 'hotel and restaurant management', 'hrm'];
  const engDegrees = ['civil engineering', 'electrical engineering', 'mechanical engineering', 'industrial engineering'];

  const isBothTech = techDegrees.some(d => normSeeker.includes(d)) && techDegrees.some(d => normJob.includes(d));
  const isBothBiz = bizDegrees.some(d => normSeeker.includes(d)) && bizDegrees.some(d => normJob.includes(d));
  const isBothAgro = agroDegrees.some(d => normSeeker.includes(d)) && agroDegrees.some(d => normJob.includes(d));
  const isBothTourism = tourismDegrees.some(d => normSeeker.includes(d)) && tourismDegrees.some(d => normJob.includes(d));
  const isBothEng = engDegrees.some(d => normSeeker.includes(d)) && engDegrees.some(d => normJob.includes(d));

  if (isBothTech || isBothBiz || isBothAgro || isBothTourism || isBothEng) {
    return {
      score: 80,
      type: 'related',
      reason: `Degree "${seekerDegree}" is in a closely related field to "${jobDegree}".`,
    };
  }

  return {
    score: 40,
    type: 'unrelated',
    reason: `Degree "${seekerDegree}" differs from preferred degree "${jobDegree}".`,
  };
}

/**
 * Decision Tree Engine for eHANAP
 */
export function calculateDecisionTreeMatch(seeker: JobSeekerProfile | null | undefined, job: JobPost | null | undefined): MatchResult {
  if (!seeker || !job) {
    return {
      jobId: job?.id || '',
      jobSeekerId: seeker?.id || '',
      overallMatch: 50,
      outcome: 'NOT QUALIFIED',
      educationMatchScore: 50,
      degreeAlignmentScore: 50,
      skillsMatchScore: 50,
      experienceMatchScore: 50,
      certificationsMatchScore: 50,
      matchedReasons: [],
      missingQualifications: ['Profile or job details missing'],
      decisionReason: 'Insufficient profile or job information to compute Decision Tree evaluation.',
    };
  }

  const matchedReasons: string[] = [];
  const missingQualifications: string[] = [];

  // 1. Profile Completeness check
  const totalSkillsCount = 
    (seeker.tradeSkills?.length || 0) +
    (seeker.administrativeSkills?.length || 0) +
    (seeker.serviceHospitalitySkills?.length || 0) +
    (seeker.salesCustomerSkills?.length || 0) +
    (seeker.itCreativeSkills?.length || 0) +
    (seeker.technicalSkills?.length || 0);

  const isProfileComplete = 
    Boolean(seeker.primaryDegree) &&
    Boolean(seeker.educationalAttainment);

  if (!isProfileComplete) {
    missingQualifications.push("Profile is incomplete (missing educational attainment or degree details).");
  }

  // 2. Evaluate Educational Attainment Level
  const seekerEduRank = EDUCATION_LEVELS[seeker.educationalAttainment] || 3;
  const jobEduRank = EDUCATION_LEVELS[job.minEducationalAttainment] || 4;

  let educationMatchScore = 100;
  if (seekerEduRank >= jobEduRank) {
    educationMatchScore = 100;
    matchedReasons.push(`Educational level (${seeker.educationalAttainment}) meets or exceeds required (${job.minEducationalAttainment}).`);
  } else {
    // Penalty
    const diff = jobEduRank - seekerEduRank;
    educationMatchScore = Math.max(30, 100 - diff * 35);
    missingQualifications.push(`Required educational level is ${job.minEducationalAttainment}, but profile has ${seeker.educationalAttainment}.`);
  }

  // 3. Evaluate Degree Alignment
  const degreeEval = evaluateDegreeAlignment(seeker.primaryDegree || '', job.preferredDegree || '');
  const degreeAlignmentScore = degreeEval.score;
  if (degreeEval.score >= 80) {
    matchedReasons.push(degreeEval.reason);
  } else if (job.preferredDegree) {
    missingQualifications.push(degreeEval.reason);
  }

  // 4. Skills Match Evaluation across all 6 categories
  const assessmentVerifiedSkills = (seeker.assessments || [])
    .filter(a => a.passed)
    .flatMap(a => a.verifiedSkills || [])
    .map(s => normalize(s));

  const seekerSkills = [
    ...(seeker.tradeSkills || []),
    ...(seeker.administrativeSkills || []),
    ...(seeker.serviceHospitalitySkills || []),
    ...(seeker.salesCustomerSkills || []),
    ...(seeker.itCreativeSkills || []),
    ...(seeker.technicalSkills || []),
    ...(seeker.softSkills || []),
    ...assessmentVerifiedSkills,
    ...(seeker.resumes?.find(r => r.id === seeker.activeResumeId)?.extractedSkills || [])
  ].map(s => normalize(s));

  // Required Skills
  const reqSkills = job.requiredSkills || [];
  let reqMatchedCount = 0;
  reqSkills.forEach(reqSkill => {
    const normReq = normalize(reqSkill);
    const hasSkill = seekerSkills.some(s => s.includes(normReq) || normReq.includes(s));
    if (hasSkill) {
      reqMatchedCount++;
    } else {
      missingQualifications.push(`Missing required skill: ${reqSkill}`);
    }
  });

  const reqSkillsScore = reqSkills.length > 0 ? (reqMatchedCount / reqSkills.length) * 100 : 100;

  // Preferred Skills
  const prefSkills = job.preferredSkills || [];
  let prefMatchedCount = 0;
  prefSkills.forEach(prefSkill => {
    const normPref = normalize(prefSkill);
    const hasSkill = seekerSkills.some(s => s.includes(normPref) || normPref.includes(s));
    if (hasSkill) {
      prefMatchedCount++;
    } else {
      missingQualifications.push(`Missing preferred skill: ${prefSkill}`);
    }
  });

  const prefSkillsScore = prefSkills.length > 0 ? (prefMatchedCount / prefSkills.length) * 100 : 100;

  // Skill Assessment verification bonus
  const passedAssessments = (seeker.assessments || []).filter(a => a.passed);
  const assessmentBonus = Math.min(15, passedAssessments.length * 5);

  // Overall Skills Score (Weighted: 75% required skills, 25% preferred skills + assessment bonus)
  const baseSkillsScore = (reqSkillsScore * 0.75) + (prefSkillsScore * 0.25);
  const skillsMatchScore = Math.min(100, Math.round(baseSkillsScore + assessmentBonus));

  if (reqSkills.length > 0) {
    matchedReasons.push(`Possesses ${reqMatchedCount} of ${reqSkills.length} required technical & soft skills.`);
  }

  if (passedAssessments.length > 0) {
    matchedReasons.push(`Verified competency: Earned ${passedAssessments.length} verified PESO skill assessment badge(s) (+${assessmentBonus}% matching boost).`);
  }

  // 5. Work Experience Evaluation
  // Calculate total seeker experience in years
  let totalSeekerExperienceYears = 0;
  if (seeker.workExperience && seeker.workExperience.length > 0) {
    totalSeekerExperienceYears = seeker.workExperience.reduce((sum, exp) => sum + (exp.yearsOfExperience || 1), 0);
  } else {
    // Check active resume extracted experience years
    const activeResume = seeker.resumes?.find(r => r.id === seeker.activeResumeId);
    if (activeResume) {
      totalSeekerExperienceYears = activeResume.extractedExperienceYears || 0;
    }
  }

  const reqExperience = job.minExperienceYears || 0;
  let experienceMatchScore = 100;

  if (totalSeekerExperienceYears >= reqExperience) {
    experienceMatchScore = 100;
    if (reqExperience > 0) {
      matchedReasons.push(`Has ${totalSeekerExperienceYears} years of work experience (meets required ${reqExperience} years).`);
    } else {
      matchedReasons.push(`Has ${totalSeekerExperienceYears} years experience (fresh graduates welcome).`);
    }
  } else if (reqExperience > 0) {
    const ratio = totalSeekerExperienceYears / reqExperience;
    experienceMatchScore = Math.round(Math.max(20, ratio * 100));
    missingQualifications.push(`Requires ${reqExperience} years experience, candidate currently has ${totalSeekerExperienceYears} years.`);
  }

  // 6. Certifications Evaluation
  const seekerCerts = (seeker.certifications || []).map(c => normalize(c.name));
  const reqCerts = job.requiredCertifications || [];
  let certsMatchedCount = 0;

  reqCerts.forEach(cert => {
    const normCert = normalize(cert);
    const hasCert = seekerCerts.some(c => c.includes(normCert) || normCert.includes(c));
    if (hasCert) {
      certsMatchedCount++;
    } else {
      missingQualifications.push(`Missing required certification: ${cert}`);
    }
  });

  const certificationsMatchScore = reqCerts.length > 0 ? Math.round((certsMatchedCount / reqCerts.length) * 100) : 100;
  if (reqCerts.length > 0 && certsMatchedCount > 0) {
    matchedReasons.push(`Holds ${certsMatchedCount} of ${reqCerts.length} requested certifications.`);
  }

  // 7. DECISION TREE HEURISTIC AGGREGATION
  // Weights:
  // Skills: 35%
  // Degree Alignment: 25%
  // Experience: 20%
  // Education Level: 12%
  // Certifications: 8%

  let overallMatch = Math.round(
    (skillsMatchScore * 0.35) +
    (degreeAlignmentScore * 0.25) +
    (experienceMatchScore * 0.20) +
    (educationMatchScore * 0.12) +
    (certificationsMatchScore * 0.08)
  );

  // Decision Tree Node Classification
  let outcome: DecisionTreeOutcome;

  // Mandate rules:
  // If candidate fails mandatory education AND mandatory skills coverage < 50%, NOT QUALIFIED
  const missingMandatoryEdu = educationMatchScore < 50;
  const missingCriticalSkills = reqSkills.length > 0 && (reqMatchedCount / reqSkills.length) < 0.4;

  if (missingMandatoryEdu && missingCriticalSkills) {
    outcome = 'NOT QUALIFIED';
    overallMatch = Math.min(overallMatch, 38);
  } else if (overallMatch >= 85) {
    outcome = 'HIGHLY QUALIFIED';
  } else if (overallMatch >= 70) {
    outcome = 'QUALIFIED';
  } else if (overallMatch >= 55) {
    outcome = 'MODERATELY QUALIFIED';
  } else if (overallMatch >= 40) {
    outcome = 'LOW MATCH';
  } else {
    outcome = 'NOT QUALIFIED';
  }

  // Generate Decision Reason Summary
  let decisionReason = '';
  switch (outcome) {
    case 'HIGHLY QUALIFIED':
      decisionReason = `Candidate strongly aligns with ${job.title} at ${job.companyName}. Degree in ${seeker.primaryDegree || 'field'} and skills coverage (${reqMatchedCount}/${reqSkills.length} required skills) exceed key position benchmarks.`;
      break;
    case 'QUALIFIED':
      decisionReason = `Candidate satisfies mandatory qualifications for ${job.title}. Educational background and skill competencies align well with position requirements.`;
      break;
    case 'MODERATELY QUALIFIED':
      decisionReason = `Candidate meets baseline criteria for ${job.title}, but has slight skill or experience gaps compared to ideal candidate requirements.`;
      break;
    case 'LOW MATCH':
      decisionReason = `Candidate profile exhibits notable qualification differences or missing required skills for ${job.title}.`;
      break;
    case 'NOT QUALIFIED':
      decisionReason = `Candidate does not currently meet mandatory educational or technical skill prerequisites for this job posting.`;
      break;
  }

  return {
    jobId: job.id,
    jobSeekerId: seeker.id,
    overallMatch,
    outcome,
    educationMatchScore,
    degreeAlignmentScore,
    skillsMatchScore,
    experienceMatchScore,
    certificationsMatchScore,
    matchedReasons,
    missingQualifications,
    decisionReason,
  };
}

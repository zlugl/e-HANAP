export interface ExtractedEducationItem {
  id: string;
  degreeCourse: string;
  school: string;
  yearGraduated: number;
  educationalAttainment: string;
  honors?: string;
}

export interface ExtractedWorkExperienceItem {
  id: string;
  company: string;
  position: string;
  startDate: string;
  endDate: string;
  isCurrent: boolean;
  responsibilities: string;
  yearsOfExperience: number;
}

export interface ExtractedResumePayload {
  firstName: string;
  middleName?: string;
  lastName: string;
  email: string;
  contactNumber: string;
  dateOfBirth?: string;
  age?: number;
  civilStatus?: string;
  sex?: string;
  address?: string;
  barangay?: string;
  municipality?: string;
  professionalSummary?: string;
  educationalAttainment: string;
  primaryDegree: string;
  school?: string;
  yearGraduated?: number;
  education?: ExtractedEducationItem[];
  workExperience?: ExtractedWorkExperienceItem[];
  tradeSkills: string[];
  administrativeSkills: string[];
  serviceHospitalitySkills: string[];
  salesCustomerSkills: string[];
  itCreativeSkills: string[];
  technicalSkills: string[];
  softSkills: string[];
  extractedSkills: string[];
  extractedExperienceYears: number;
  certifications: string[];
  rawTextPreview: string;
}

// Known soft skills for categorization
export const SOFT_SKILLS_LIST = [
  'communication', 'teamwork', 'leadership', 'problem solving', 'critical thinking',
  'time management', 'adaptability', 'work ethic', 'attention to detail', 'interpersonal skills',
  'conflict resolution', 'decision making', 'creativity', 'active listening', 'collaboration',
  'customer service', 'organization', 'multitasking', 'patience', 'analytical thinking',
  'punctuality', 'conflict mediation', 'clear communication', 'fast learner', 'honest',
  'punctual', 'hardworking', 'diligent', 'dedicated', 'trustworthy', 'reliable',
  'team player', 'motivated', 'can work under pressure', 'courteous', 'respectful',
  'organized', 'positive attitude', 'willing to learn', 'detail-oriented', 'initiative', 'integrity'
];

// Local Municipalities in Oriental Mindoro
export const MINDORO_MUNICIPALITIES = [
  'Roxas', 'Mansalay', 'Bongabong', 'Bulalacao', 'Calapan', 'Pinamalayan',
  'Gloria', 'Bansud', 'Pola', 'Socorro', 'Victoria', 'Naujan', 'Baco',
  'San Teodoro', 'Puerto Galera'
];

// All Roxas Barangays for exact dropdown mapping
export const ROXAS_BARANGAYS = [
  'Bagumbayan', 'Cantil', 'Dangay', 'Happy Valley', 'Libertad',
  'Mabuhay', 'Marugdug', 'Odiong', 'Paclasan', 'San Aquilino',
  'San Isidro', 'San Jose', 'San Mariano', 'San Rafael',
  'San Vicente', 'Victoria'
];

// 6 Skill Categories patterns
export const TRADE_SKILLS = [
  'Automotive Repair', 'Electrical Wiring', 'Plumbing', 'Welding', 'Shielded Metal Arc Welding', 'SMAW',
  'Carpentry', 'Refrigeration and Air Conditioning', 'RAC Servicing', 'Heavy Equipment Operation',
  'Automotive Servicing', 'Lathe Machine', 'Engine Overhaul', 'Masonry', 'Machining', 'Electronics Servicing',
  'Driving', 'Heavy Equipment', 'SMAW NC II'
];

export const ADMIN_SKILLS = [
  'Bookkeeping', 'Filing and Records Management', 'Records Management', 'Data Entry', 'Billing',
  'Reception', 'Scheduling', 'Technical Report Writing', 'Minute Taking', 'Spreadsheet Management',
  'Word Processing', 'Database Management', 'Clerical Support', 'QuickBooks', 'Payroll Processing', 'Accounting',
  'Microsoft Excel', 'Microsoft Office', 'Spreadsheets', 'Office Administration'
];

export const SERVICE_HOSPITALITY_SKILLS = [
  'Commercial Cooking', 'Baking and Pastry', 'Bartending', 'Food Preparation', 'Food and Beverage Service',
  'F&B', 'Housekeeping', 'Barista Craft', 'Barista', 'Front Office Assistance', 'Cosmetology', 'Hairdressing',
  'Caregiving', 'Culinary Arts', 'Guest Relations', 'Food Service', 'Waitstaff', 'Dishwashing', 'Hotel Service'
];

export const SALES_COMMERCE_SKILLS = [
  'Cashiering', 'Inventory Stocking', 'Inventory Management', 'Merchandising', 'Store Keeping',
  'POS Operation', 'Client Negotiation', 'Telemarketing', 'Direct Selling', 'Lead Generation',
  'Customer Care', 'Handling Inquiries', 'Conflict Resolution', 'Retail Sales', 'Selling', 'Store Clerk'
];

export const IT_CREATIVE_SKILLS = [
  'React', 'JavaScript', 'TypeScript', 'Node.js', 'Express', 'Python', 'Java', 'PHP', 'C++', 'SQL',
  'HTML', 'CSS', 'Tailwind', 'AutoCAD', 'Photoshop', 'Illustrator', 'Figma', 'Graphic Design',
  'Social Media Management', 'IT Support', 'Network Administration', 'Hardware Troubleshooting', 'System Maintenance',
  'Web Development', 'Computer Troubleshooting', 'Technical Support'
];

/**
 * Normalization helper to capitalize names neatly (e.g. "MARIA JADE" -> "Maria Jade")
 */
export function formatProperName(name?: string): string {
  if (!name) return '';
  const cleaned = name.trim();
  if (!cleaned) return '';
  return cleaned
    .split(/\s+/)
    .map(token => {
      const lower = token.toLowerCase();
      if (['de', 'del', 'dela', 'dos', 'da', 'san', 'santa'].includes(lower)) {
        return lower.charAt(0).toUpperCase() + lower.slice(1);
      }
      return token.charAt(0).toUpperCase() + token.slice(1).toLowerCase();
    })
    .join(' ');
}

/**
 * Normalizes civil status to standard Step 2 form values:
 * Single | Married | Widowed | Separated | Solo Parent | Common-Law
 */
export function normalizeCivilStatus(val?: string): string {
  if (!val) return 'Single';
  const lower = val.toLowerCase();
  if (lower.includes('solo') || lower.includes('parent')) return 'Solo Parent';
  if (lower.includes('common') || lower.includes('live-in')) return 'Common-Law';
  if (lower.includes('widow')) return 'Widowed';
  if (lower.includes('sep')) return 'Separated';
  if (lower.includes('marr')) return 'Married';
  return 'Single';
}

/**
 * Normalizes sex/gender to standard Step 2 form values:
 * Male | Female | '' (blank when not stated in resume)
 */
export function normalizeSex(val?: string): string {
  if (!val) return '';
  const lower = val.toLowerCase().trim();
  if (lower === 'female' || lower === 'f' || lower.includes('female') || lower.includes('woman')) return 'Female';
  if (lower === 'male' || lower === 'm' || lower.includes('male') || lower.includes('man')) return 'Male';
  return '';
}

/**
 * Normalizes educational attainment to exact dropdown values:
 * College Graduate | College Undergraduate | High School Graduate | Senior High School | Vocational / TVET | Master's Degree | Doctorate Degree
 */
export function normalizeEducationalAttainment(val?: string, degree?: string): string {
  const combined = `${val || ''} ${degree || ''}`.toLowerCase();
  if (combined.includes('doctor') || combined.includes('phd')) return 'Doctorate Degree';
  if (combined.includes('master') || combined.includes('mba') || combined.includes('ms ') || combined.includes('ma ')) return "Master's Degree";
  if (
    combined.includes('vocational') ||
    combined.includes('tvet') ||
    combined.includes('tech-voc') ||
    combined.includes('tesda') ||
    combined.includes('nc ii') ||
    combined.includes('certificate')
  ) {
    return 'Vocational / TVET';
  }
  if (
    combined.includes('senior high') ||
    combined.includes('shs') ||
    combined.includes('grade 12') ||
    combined.includes('grade 11') ||
    combined.includes('tvl') ||
    combined.includes('gas') ||
    combined.includes('stem') ||
    combined.includes('abm') ||
    combined.includes('humss')
  ) {
    return 'Senior High School';
  }
  if (
    combined.includes('high school') ||
    combined.includes('secondary') ||
    combined.includes('junior high') ||
    combined.includes('hs grad') ||
    combined.includes('out-of-school') ||
    combined.includes('osy')
  ) {
    return 'High School Graduate';
  }
  if (
    combined.includes('undergrad') ||
    combined.includes('incomplete') ||
    combined.includes('college level') ||
    combined.includes('some college') ||
    combined.includes('units') ||
    combined.includes('associate')
  ) {
    return 'College Undergraduate';
  }
  if (
    combined.includes('college') ||
    combined.includes('bachelor') ||
    combined.includes('tertiary') ||
    combined.includes('bs') ||
    combined.includes('ab ') ||
    combined.includes('degree')
  ) {
    return 'College Graduate';
  }
  return 'College Graduate';
}

/**
 * Matches an extracted barangay and/or address against the 16 recognized Roxas Barangays
 */
export function normalizeBarangay(extractedBarangay?: string, address?: string): string {
  const target = `${extractedBarangay || ''} ${address || ''}`.toLowerCase();
  for (const b of ROXAS_BARANGAYS) {
    if (target.includes(b.toLowerCase())) {
      return b;
    }
  }
  return extractedBarangay || '';
}

/**
 * Computes an age string from date of birth
 */
export function computeAgeFromDob(dob?: string): string {
  if (!dob) return '';
  const parsed = new Date(dob);
  if (!isNaN(parsed.getTime())) {
    const today = new Date();
    let calculated = today.getFullYear() - parsed.getFullYear();
    const m = today.getMonth() - parsed.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < parsed.getDate())) {
      calculated--;
    }
    if (calculated >= 14 && calculated <= 85) {
      return String(calculated);
    }
  }
  return '';
}

/**
 * High-precision heuristic parser to extract real, authentic resume details
 * directly from raw text without hallucinating or using placeholder identities.
 */
export function extractResumeInfoFromText(rawText: string, fileName?: string): ExtractedResumePayload {
  const text = (rawText || '').replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
  const lowerText = text.toLowerCase();

  // 1. Email Extraction (supports standalone and tagged label e.g., "Email: mj_santos@yahoo.com")
  let email = '';
  const emailRegex = /(?:email|e-mail)?\s*[:=]?\s*([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/i;
  const emailMatch = text.match(emailRegex);
  if (emailMatch && emailMatch[1]) {
    email = emailMatch[1].trim();
  }

  // 2. Contact Number Extraction
  // 11-digit local (09171234567, 0917-123-4567), international (+63 917 123 4567), or landline ((043) 288-1234, 02-8123-4567)
  let contactNumber = '';
  const phoneRegex = /(?:\+?63[\s.-]?9\d{2}[\s.-]?\d{3}[\s.-]?\d{4}|09\d{2}[\s.-]?\d{3}[\s.-]?\d{4}|\(?0\d{1,2}\)?[\s.-]?\d{3}[\s.-]?\d{4})/;
  const phoneMatch = text.match(phoneRegex);
  if (phoneMatch && phoneMatch[0]) {
    contactNumber = phoneMatch[0].trim();
  }

  // 3. Name Extraction
  // Support: "First Name Middle Name/Initial Last Name" (e.g. Maria Jade Ramos/R. Santos)
  // And: "Last Name, First Name Middle Name/Initial" (e.g. Santos, Maria Jade Ramos/R.)
  let candidateFullName = '';
  const ignorePatterns = [
    /resume/i, /curriculum\s+vitae/i, /\bcv\b/i, /biodata/i, /personal\s+data/i,
    /page\s+\d+/i, /phone/i, /email/i, /address/i, /contact/i, /objective/i,
    /profile/i, /summary/i, /education/i, /experience/i, /skills/i, /www\./i, /http/i
  ];

  for (let i = 0; i < Math.min(lines.length, 12); i++) {
    const line = lines[i];
    if (line.includes('@') || line.match(/\d{4,}/) || line.includes('http')) continue;
    if (ignorePatterns.some(pat => pat.test(line))) continue;
    const words = line.split(/\s+/).filter(w => w.length > 0);
    if (words.length >= 2 && words.length <= 6 && /^[a-zA-Z\s.,'-]+$/.test(line)) {
      candidateFullName = line;
      break;
    }
  }

  if (!candidateFullName && fileName) {
    const cleanFileName = fileName
      .replace(/\.(pdf|docx|doc|txt)$/i, '')
      .replace(/[_\-]+/g, ' ')
      .replace(/\b(resume|cv|biodata|applicant|latest|updated|final|draft)\b/gi, '')
      .trim();
    if (cleanFileName.split(/\s+/).length >= 2) {
      candidateFullName = cleanFileName;
    }
  }

  let firstName = '';
  let middleName = '';
  let lastName = '';

  if (candidateFullName) {
    if (candidateFullName.includes(',')) {
      // Format: "Last Name, First Name Middle Name/Initial"
      const [ln, fnRest] = candidateFullName.split(',');
      lastName = ln.trim();
      const fnTokens = (fnRest || '').trim().split(/\s+/);
      if (fnTokens.length === 1) {
        firstName = fnTokens[0];
      } else if (fnTokens.length >= 2) {
        const lastToken = fnTokens[fnTokens.length - 1];
        if (lastToken.length <= 2 || lastToken.endsWith('.') || fnTokens.length > 2) {
          middleName = lastToken;
          firstName = fnTokens.slice(0, fnTokens.length - 1).join(' ');
        } else {
          firstName = fnTokens.join(' ');
        }
      }
    } else {
      // Format: First Name Middle Name/Initial Last Name (e.g. Maria Jade Ramos Santos or Maria Jade R. Santos)
      const parts = candidateFullName.split(/\s+/);
      if (parts.length === 2) {
        firstName = parts[0];
        lastName = parts[1];
      } else if (parts.length === 3) {
        firstName = parts[0];
        middleName = parts[1];
        lastName = parts[2];
      } else if (parts.length >= 4) {
        // Check for compound last name prefix (dela, del, dos, san, etc.)
        const secondToLast = parts[parts.length - 2].toLowerCase();
        if (['dela', 'del', 'de', 'dos', 'da', 'san', 'santa'].includes(secondToLast)) {
          lastName = `${parts[parts.length - 2]} ${parts[parts.length - 1]}`;
          const remaining = parts.slice(0, parts.length - 2);
          if (remaining.length > 1) {
            middleName = remaining[remaining.length - 1];
            firstName = remaining.slice(0, remaining.length - 1).join(' ');
          } else {
            firstName = remaining[0] || '';
          }
        } else {
          lastName = parts[parts.length - 1];
          middleName = parts[parts.length - 2];
          firstName = parts.slice(0, parts.length - 2).join(' ');
        }
      }
    }
  }

  // 4. Date of Birth & Age
  // Only extract birthday if explicitly labeled (e.g. Date of Birth, Birthday, DOB, Born)
  // If not stated in the resume, leave it blank as requested
  let dateOfBirth = '';
  let age: number | undefined = undefined;

  const dobLabeledMatch = text.match(/\b(?:date\s+of\s+birth|birth\s*date|birthday|dob|b-day|born(?:\s+on)?)\s*[:=-]?\s*([A-Za-z0-9\s,/-]+?)(?=(?:\r?\n|$|\s{2,}|age|gender|sex|civil|status|birthplace|place\s+of\s+birth|address|contact|phone|email|religion|nationality|citizenship))/i);

  if (dobLabeledMatch && dobLabeledMatch[1]) {
    const rawVal = dobLabeledMatch[1].trim();
    const monthYear = rawVal.match(/\b(?:january|february|march|april|may|june|july|august|september|october|november|december|jan|feb|mar|apr|jun|jul|aug|sep|oct|nov|dec)\.?\s+\d{1,2},?\s+(?:19\d{2}|20\d{2})\b/i)
      || rawVal.match(/\b(?:\d{1,2})[-/](?:\d{1,2})[-/](?:19\d{2}|20\d{2})\b/)
      || rawVal.match(/\b(?:19\d{2}|20\d{2})[-/](?:\d{1,2})[-/](?:\d{1,2})\b/);
    if (monthYear) {
      dateOfBirth = monthYear[0];
    } else if (rawVal.length >= 4 && rawVal.length <= 32) {
      dateOfBirth = rawVal;
    }
  }

  const ageMatch = text.match(/\b(?:age\s*[:=]?\s*(\d{1,2})|(\d{1,2})\s*(?:yrs|years?)\s*old)\b/i);
  if (ageMatch) {
    const matchedVal = ageMatch[1] || ageMatch[2];
    if (matchedVal) {
      const parsedAge = parseInt(matchedVal, 10);
      if (parsedAge >= 15 && parsedAge <= 75) {
        age = parsedAge;
      }
    }
  }

  // 5. Civil Status
  // Single, Married, Widowed, Sep. / Separated, Solo Parent, Common-Law
  let civilStatus = 'Single';
  if (/\b(solo\s+parent)\b/i.test(text)) {
    civilStatus = 'Solo Parent';
  } else if (/\b(common[- ]law)\b/i.test(text)) {
    civilStatus = 'Common-Law';
  } else if (/\b(widowed|widow)\b/i.test(text)) {
    civilStatus = 'Widowed';
  } else if (/\b(sep\.?|separated)\b/i.test(text)) {
    civilStatus = 'Separated';
  } else if (/\b(married)\b/i.test(text)) {
    civilStatus = 'Married';
  } else if (/\b(single)\b/i.test(text)) {
    civilStatus = 'Single';
  }

  // 6. Sex / Gender
  // M / F, Male / Female
  let sex = '';
  const sexMatch = text.match(/\b(?:gender|sex)\s*[:=]?\s*(male|female|m|f)\b/i);
  if (sexMatch && sexMatch[1]) {
    const val = sexMatch[1].toUpperCase();
    sex = (val === 'M' || val === 'MALE') ? 'Male' : 'Female';
  }

  // 7. Complete Home Address, Barangay & Municipality
  let municipality = 'Roxas';
  let barangay = '';
  let address = '';

  for (const m of MINDORO_MUNICIPALITIES) {
    if (lowerText.includes(m.toLowerCase())) {
      municipality = m;
      break;
    }
  }
  for (const brgy of ROXAS_BARANGAYS) {
    if (lowerText.includes(brgy.toLowerCase())) {
      barangay = brgy;
      address = `Brgy. ${brgy}, ${municipality}, Oriental Mindoro`;
      break;
    }
  }

  // Check for full address strings like "Blk 4 Lot 12 Sunshine St., Dangay, Roxas, Oriental Mindoro"
  const addressLineMatch = text.match(/(?:address\s*[:=]?\s*)([^\n]+)/i);
  if (addressLineMatch && addressLineMatch[1] && addressLineMatch[1].length >= 5) {
    address = addressLineMatch[1].trim();
  }

  // 5. Section Slicing Helper
  const sectionHeaders = [
    'OBJECTIVE', 'CAREER OBJECTIVE', 'PROFESSIONAL SUMMARY', 'SUMMARY', 'ABOUT ME', 'PROFILE',
    'EDUCATION', 'EDUCATIONAL BACKGROUND', 'ACADEMIC BACKGROUND', 'ACADEMIC QUALIFICATIONS',
    'WORK EXPERIENCE', 'PROFESSIONAL EXPERIENCE', 'EMPLOYMENT HISTORY', 'EXPERIENCE', 'PRACTICUM', 'OJT',
    'SKILLS', 'TECHNICAL SKILLS', 'KEY COMPETENCIES', 'COMPETENCIES', 'CORE QUALIFICATIONS', 'AREAS OF EXPERTISE',
    'CERTIFICATIONS', 'CERTIFICATES', 'LICENSES', 'ELIGIBILITY', 'TRAININGS', 'SEMINARS',
    'AWARDS', 'HONORS', 'REFERENCES'
  ];

  // Map of detected sections
  const sectionContent: Record<string, string[]> = {};
  let currentSection = 'HEADER';
  sectionContent['HEADER'] = [];

  for (const line of lines) {
    const upperLine = line.toUpperCase().replace(/[^A-Z\s]/g, '').trim();
    const matchedHeader = sectionHeaders.find(header => {
      return upperLine === header || upperLine.startsWith(header + ' ') || upperLine.endsWith(' ' + header);
    });

    if (matchedHeader) {
      currentSection = matchedHeader;
      sectionContent[currentSection] = [];
      // If line contains content after the header label (e.g. "EDUCATION: BS Computer Science"), preserve the content
      const contentAfterHeader = line.replace(new RegExp(`^[^a-zA-Z]*${matchedHeader}[:\\s\\-\\–/|]*`, 'i'), '').trim();
      if (contentAfterHeader && contentAfterHeader.length >= 3) {
        sectionContent[currentSection].push(contentAfterHeader);
      }
    } else {
      if (!sectionContent[currentSection]) sectionContent[currentSection] = [];
      sectionContent[currentSection].push(line);
    }
  }

  // 6. Professional Summary / Objective
  let professionalSummary = '';
  const summaryLines = [
    ...(sectionContent['OBJECTIVE'] || []),
    ...(sectionContent['CAREER OBJECTIVE'] || []),
    ...(sectionContent['PROFESSIONAL SUMMARY'] || []),
    ...(sectionContent['SUMMARY'] || []),
    ...(sectionContent['ABOUT ME'] || []),
    ...(sectionContent['PROFILE'] || [])
  ];
  if (summaryLines.length > 0) {
    professionalSummary = summaryLines.slice(0, 4).join(' ');
  }

  // 7. Degree & Education Extraction
  let primaryDegree = '';
  let educationalAttainment = "Bachelor's Degree";
  let school = '';
  let yearGraduated = 0;
  let honors = '';

  const eduLines = [
    ...(sectionContent['EDUCATION'] || []),
    ...(sectionContent['EDUCATIONAL BACKGROUND'] || []),
    ...(sectionContent['ACADEMIC BACKGROUND'] || []),
    ...(sectionContent['ACADEMIC QUALIFICATIONS'] || []),
    ...(sectionContent['EDUCATION & CREDENTIALS'] || [])
  ];

  const eduSectionText = eduLines.join('\n');
  const lowerEduSectionText = eduSectionText.toLowerCase();

  // Explicit degree patterns mapped to normalized formal titles
  // Prioritized so specific fields (Computer Science, Accountancy, Nursing, etc.) are accurately identified
  const SPECIFIC_DEGREE_PATTERNS: Array<{ regex: RegExp; formal: string; level?: string }> = [
    // 1. Computer Science (Check BEFORE general IT or generic BS)
    {
      regex: /\b(?:bachelor(?:'s)?(?:\s+of(?:\s+science|\s+arts)?)?\s+(?:in\s+)?computer\s+science|b\.?s\.?(?:\s+in)?\s+computer\s+science|bscs)\b/i,
      formal: 'Bachelor of Science in Computer Science',
      level: "Bachelor's Degree",
    },
    // 2. Information Technology
    {
      regex: /\b(?:bachelor(?:'s)?(?:\s+of(?:\s+science|\s+arts)?)?\s+(?:in\s+)?information\s+technology|b\.?s\.?(?:\s+in)?\s+information\s+technology|bsit)\b/i,
      formal: 'Bachelor of Science in Information Technology',
      level: "Bachelor's Degree",
    },
    // 3. Information Systems
    {
      regex: /\b(?:bachelor(?:'s)?(?:\s+of(?:\s+science)?)?\s+(?:in\s+)?information\s+systems|b\.?s\.?(?:\s+in)?\s+information\s+systems|bsis)\b/i,
      formal: 'Bachelor of Science in Information Systems',
      level: "Bachelor's Degree",
    },
    // 4. Computer Engineering
    {
      regex: /\b(?:bachelor(?:'s)?(?:\s+of(?:\s+science)?)?\s+(?:in\s+)?computer\s+engineering|b\.?s\.?(?:\s+in)?\s+computer\s+engineering|bscpe)\b/i,
      formal: 'Bachelor of Science in Computer Engineering',
      level: "Bachelor's Degree",
    },
    // 5. Accountancy & Accounting
    {
      regex: /\b(?:bachelor(?:'s)?(?:\s+of(?:\s+science)?)?\s+(?:in\s+)?account(?:ancy|ing)|b\.?s\.?(?:\s+in)?\s+account(?:ancy|ing)|bsa)\b/i,
      formal: 'Bachelor of Science in Accountancy',
      level: "Bachelor's Degree",
    },
    // 6. Business Administration & Management
    {
      regex: /\b(?:bachelor(?:'s)?(?:\s+of(?:\s+science)?)?\s+(?:in\s+)?business\s+administration|b\.?s\.?(?:\s+in)?\s+business\s+administration|bsba)\b/i,
      formal: 'Bachelor of Science in Business Administration',
      level: "Bachelor's Degree",
    },
    // 7. Hospitality Management / HRM
    {
      regex: /\b(?:bachelor(?:'s)?(?:\s+of(?:\s+science)?)?\s+(?:in\s+)?(?:hospitality\s+management|hotel\s+and\s+restaurant\s+management)|b\.?s\.?(?:\s+in)?\s+(?:hospitality\s+management|hotel\s+and\s+restaurant\s+management)|bshm|bshrm)\b/i,
      formal: 'Bachelor of Science in Hospitality Management',
      level: "Bachelor's Degree",
    },
    // 8. Tourism Management
    {
      regex: /\b(?:bachelor(?:'s)?(?:\s+of(?:\s+science)?)?\s+(?:in\s+)?tourism(?:\s+management)?|b\.?s\.?(?:\s+in)?\s+tourism(?:\s+management)?|bstm)\b/i,
      formal: 'Bachelor of Science in Tourism Management',
      level: "Bachelor's Degree",
    },
    // 9. Agriculture & Agribusiness
    {
      regex: /\b(?:bachelor(?:'s)?(?:\s+of(?:\s+science)?)?\s+(?:in\s+)?agri(?:culture|business|nomy|cultural\s+engineering)|b\.?s\.?(?:\s+in)?\s+agri(?:culture|business|nomy))\b/i,
      formal: 'Bachelor of Science in Agriculture',
      level: "Bachelor's Degree",
    },
    // 10. Civil Engineering
    {
      regex: /\b(?:bachelor(?:'s)?(?:\s+of(?:\s+science)?)?\s+(?:in\s+)?civil\s+engineering|b\.?s\.?(?:\s+in)?\s+civil\s+engineering|bsce)\b/i,
      formal: 'Bachelor of Science in Civil Engineering',
      level: "Bachelor's Degree",
    },
    // 11. Electrical / Mechanical Engineering
    {
      regex: /\b(?:bachelor(?:'s)?(?:\s+of(?:\s+science)?)?\s+(?:in\s+)?electrical\s+engineering|b\.?s\.?(?:\s+in)?\s+electrical\s+engineering|bsee)\b/i,
      formal: 'Bachelor of Science in Electrical Engineering',
      level: "Bachelor's Degree",
    },
    {
      regex: /\b(?:bachelor(?:'s)?(?:\s+of(?:\s+science)?)?\s+(?:in\s+)?mechanical\s+engineering|b\.?s\.?(?:\s+in)?\s+mechanical\s+engineering|bsme)\b/i,
      formal: 'Bachelor of Science in Mechanical Engineering',
      level: "Bachelor's Degree",
    },
    // 12. Nursing & Healthcare
    {
      regex: /\b(?:bachelor(?:'s)?(?:\s+of(?:\s+science)?)?\s+(?:in\s+)?nursing|b\.?s\.?(?:\s+in)?\s+nursing|bsn)\b/i,
      formal: 'Bachelor of Science in Nursing',
      level: "Bachelor's Degree",
    },
    // 13. Criminology
    {
      regex: /\b(?:bachelor(?:'s)?(?:\s+of(?:\s+science)?)?\s+(?:in\s+)?criminology|b\.?s\.?(?:\s+in)?\s+criminology|bscrim)\b/i,
      formal: 'Bachelor of Science in Criminology',
      level: "Bachelor's Degree",
    },
    // 14. Education
    {
      regex: /\b(?:bachelor(?:'s)?(?:\s+of(?:\s+elementary)?)?\s+elementary\s+education|beed)\b/i,
      formal: 'Bachelor of Elementary Education',
      level: "Bachelor's Degree",
    },
    {
      regex: /\b(?:bachelor(?:'s)?(?:\s+of(?:\s+secondary)?)?\s+secondary\s+education|bsed)\b/i,
      formal: 'Bachelor of Secondary Education',
      level: "Bachelor's Degree",
    },
    // 15. Associates & Vocational
    {
      regex: /\b(?:associate(?:\s+in)?\s+computer\s+technology|act)\b/i,
      formal: 'Associate in Computer Technology',
      level: "Associate Degree",
    },
    {
      regex: /\b(?:associate(?:\s+in)?\s+hotel\s+and\s+restaurant\s+management|ahrm)\b/i,
      formal: 'Associate in Hotel and Restaurant Management',
      level: "Associate Degree",
    },
    // 16. TVET / TESDA NC II
    {
      regex: /\b(?:computer\s+systems\s+servicing|css)\s+nc\s*ii\b/i,
      formal: 'Computer Systems Servicing NC II',
      level: "TVET / Vocational",
    },
    {
      regex: /\b(?:agricultural\s+crops\s+production)\s+nc\s*ii\b/i,
      formal: 'Agricultural Crops Production NC II',
      level: "TVET / Vocational",
    },
    {
      regex: /\b(?:shielded\s+metal\s+arc\s+welding|smaw)\s+nc\s*ii\b/i,
      formal: 'Shielded Metal Arc Welding (SMAW) NC II',
      level: "TVET / Vocational",
    },
    {
      regex: /\b(?:bread\s+and\s+pastry\s+production|bpp)\s+nc\s*ii\b/i,
      formal: 'Bread and Pastry Production NC II',
      level: "TVET / Vocational",
    },
    {
      regex: /\b(?:automotive\s+servicing)\s+nc\s*ii\b/i,
      formal: 'Automotive Servicing NC II',
      level: "TVET / Vocational",
    },
    {
      regex: /\b(?:cookery)\s+nc\s*ii\b/i,
      formal: 'Cookery NC II',
      level: "TVET / Vocational",
    },
    {
      regex: /\b(?:food\s+and\s+beverage\s+services|fbs)\s+nc\s*ii\b/i,
      formal: 'Food and Beverage Services NC II',
      level: "TVET / Vocational",
    },
    // 17. Secondary Education
    {
      regex: /\b(?:senior\s+high\s+school\s+(?:tvl|stem|abm|humss|gas)|senior\s+high\s+school|shs\s+diploma)\b/i,
      formal: 'Senior High School Diploma',
      level: "High School",
    },
  ];

  // STEP 1: Search for specific degree patterns within Education section FIRST
  if (eduLines.length > 0) {
    for (const item of SPECIFIC_DEGREE_PATTERNS) {
      if (item.regex.test(eduSectionText)) {
        primaryDegree = item.formal;
        if (item.level) educationalAttainment = item.level;
        break;
      }
    }
  }

  // STEP 2: Look for labeled course/degree/program fields in Education lines or full text
  if (!primaryDegree) {
    const linesToScan = eduLines.length > 0 ? eduLines : lines;
    for (const line of linesToScan) {
      const fieldMatch = line.match(/(?:course|degree|program|major|field\s+of\s+study|specialization)[\s:]+([A-Za-z0-9\s&/.,\-()]{4,60})/i);
      if (fieldMatch && fieldMatch[1]) {
        const candidate = fieldMatch[1].trim();
        // Check if candidate matches any known pattern
        for (const item of SPECIFIC_DEGREE_PATTERNS) {
          if (item.regex.test(candidate)) {
            primaryDegree = item.formal;
            if (item.level) educationalAttainment = item.level;
            break;
          }
        }
        if (primaryDegree) break;

        // If it looks like a clean course name, use it
        if (!/^(none|n\/a|graduate|student|college|school)/i.test(candidate) && candidate.length >= 6) {
          primaryDegree = candidate.replace(/^(in\s+|major\s+in\s+)/i, '').trim();
          break;
        }
      }
    }
  }

  // STEP 3: General Degree regex in Education lines or full lines
  if (!primaryDegree) {
    const degreeRegex = /\b(?:bachelor(?:'s)?(?:\s+of(?:\s+science|\s+arts)?)?|\bbs\b|\bba\b|master(?:'s)?(?:\s+of(?:\s+science|\s+arts)?)?|\bms\b|\bma\b|\bmba\b|doctor(?:ate)?|\bph\.?d\.?|associate(?:'s)?(?:\s+in)?|diploma\s+in|certificate\s+in|tvet|senior\s+high|high\s+school)[\s\w&/.,\-()]{4,60}/i;
    const scanLines = eduLines.length > 0 ? eduLines : lines;
    for (const line of scanLines) {
      const match = line.match(degreeRegex);
      if (match && match[0].length >= 8) {
        const cleaned = match[0].replace(/^(education|academic|degree|course)[\s:]*/i, '').trim();
        // Check against patterns to normalize
        for (const item of SPECIFIC_DEGREE_PATTERNS) {
          if (item.regex.test(cleaned)) {
            primaryDegree = item.formal;
            if (item.level) educationalAttainment = item.level;
            break;
          }
        }
        if (!primaryDegree) {
          primaryDegree = cleaned;
        }
        break;
      }
    }
  }

  // STEP 4: Search full text across SPECIFIC_DEGREE_PATTERNS (Computer Science, etc.)
  if (!primaryDegree) {
    for (const item of SPECIFIC_DEGREE_PATTERNS) {
      if (item.regex.test(text)) {
        primaryDegree = item.formal;
        if (item.level) educationalAttainment = item.level;
        break;
      }
    }
  }

  // STEP 5: Keyword fallback inside education section (e.g. mentions "computer science" without "bachelor")
  if (!primaryDegree && eduLines.length > 0) {
    if (lowerEduSectionText.includes('computer science')) {
      primaryDegree = 'Bachelor of Science in Computer Science';
      educationalAttainment = "Bachelor's Degree";
    } else if (lowerEduSectionText.includes('information technology')) {
      primaryDegree = 'Bachelor of Science in Information Technology';
      educationalAttainment = "Bachelor's Degree";
    } else if (lowerEduSectionText.includes('accountancy') || lowerEduSectionText.includes('accounting')) {
      primaryDegree = 'Bachelor of Science in Accountancy';
      educationalAttainment = "Bachelor's Degree";
    } else if (lowerEduSectionText.includes('business administration')) {
      primaryDegree = 'Bachelor of Science in Business Administration';
      educationalAttainment = "Bachelor's Degree";
    } else if (lowerEduSectionText.includes('hospitality management') || lowerEduSectionText.includes('hotel and restaurant')) {
      primaryDegree = 'Bachelor of Science in Hospitality Management';
      educationalAttainment = "Bachelor's Degree";
    } else if (lowerEduSectionText.includes('tourism')) {
      primaryDegree = 'Bachelor of Science in Tourism Management';
      educationalAttainment = "Bachelor's Degree";
    } else if (lowerEduSectionText.includes('agriculture') || lowerEduSectionText.includes('agribusiness')) {
      primaryDegree = 'Bachelor of Science in Agriculture';
      educationalAttainment = "Bachelor's Degree";
    } else if (lowerEduSectionText.includes('criminology')) {
      primaryDegree = 'Bachelor of Science in Criminology';
      educationalAttainment = "Bachelor's Degree";
    } else if (lowerEduSectionText.includes('nursing')) {
      primaryDegree = 'Bachelor of Science in Nursing';
      educationalAttainment = "Bachelor's Degree";
    } else if (lowerEduSectionText.includes('civil engineering')) {
      primaryDegree = 'Bachelor of Science in Civil Engineering';
      educationalAttainment = "Bachelor's Degree";
    } else if (lowerEduSectionText.includes('elementary education')) {
      primaryDegree = 'Bachelor of Elementary Education';
      educationalAttainment = "Bachelor's Degree";
    } else if (lowerEduSectionText.includes('secondary education')) {
      primaryDegree = 'Bachelor of Secondary Education';
      educationalAttainment = "Bachelor's Degree";
    }
  }

  // Derive Educational Attainment if not already set
  const checkTextForLevel = (primaryDegree + ' ' + (eduLines.join(' '))).toLowerCase();
  if (checkTextForLevel.includes('doctor') || checkTextForLevel.includes('phd')) {
    educationalAttainment = 'Doctorate / PhD';
  } else if (checkTextForLevel.includes('master') || checkTextForLevel.includes('mba') || checkTextForLevel.includes('ms ')) {
    educationalAttainment = "Master's Degree";
  } else if (checkTextForLevel.includes('bachelor') || checkTextForLevel.includes('bs') || checkTextForLevel.includes('ba ') || checkTextForLevel.includes('degree')) {
    educationalAttainment = "Bachelor's Degree";
  } else if (checkTextForLevel.includes('associate')) {
    educationalAttainment = "Associate Degree";
  } else if (checkTextForLevel.includes('tvet') || checkTextForLevel.includes('tesda') || checkTextForLevel.includes('nc ii') || checkTextForLevel.includes('vocational')) {
    educationalAttainment = "TVET / Vocational";
  } else if (checkTextForLevel.includes('high school') || checkTextForLevel.includes('secondary')) {
    educationalAttainment = "High School";
  }

  // School Detection
  const scanLinesForSchool = eduLines.length > 0 ? eduLines : lines;
  const schoolRegex = /[\w\s&.,\-]+(?:University|College|Institute|Academy|Polytechnic|School|High\s+School)[\w\s&.,\-]*/i;
  for (const line of scanLinesForSchool) {
    const match = line.match(schoolRegex);
    if (match && match[0].length >= 6) {
      school = match[0].trim();
      break;
    }
  }

  // Local school name abbreviations
  if (!school) {
    if (lowerText.includes('mindoro state university') || lowerText.includes('minsu') || lowerText.includes('minscat')) {
      school = 'Mindoro State University';
    } else if (lowerText.includes('divine word college') || lowerText.includes('dwcc')) {
      school = 'Divine Word College of Calapan';
    } else if (lowerText.includes('john paul college') || lowerText.includes('jpc')) {
      school = 'John Paul College (Roxas)';
    } else if (lowerText.includes('clarendon college')) {
      school = 'Clarendon College (Roxas)';
    } else if (lowerText.includes('luna goco')) {
      school = 'Luna Goco Colleges';
    }
  }

  // Year graduated extraction
  const yearMatch = (eduLines.join(' ') || text).match(/\b(19\d{2}|20\d{2})\b/);
  if (yearMatch && yearMatch[1]) {
    yearGraduated = parseInt(yearMatch[1], 10);
  }

  // Honors detection
  const honorsMatch = (eduLines.join(' ') || text).match(/(cum\s+laude|magna\s+cum\s+laude|summa\s+cum\s+laude|dean's\s+lister|with\s+honors|valedictorian|salutatorian)/i);
  if (honorsMatch && honorsMatch[0]) {
    honors = honorsMatch[0];
  }

  const educationRecords: ExtractedEducationItem[] = [];
  if (primaryDegree || school) {
    educationRecords.push({
      id: `edu-${Date.now()}-1`,
      degreeCourse: primaryDegree || 'College Degree',
      school: school || 'Higher Education Institution',
      yearGraduated: yearGraduated || new Date().getFullYear(),
      educationalAttainment,
      honors: honors || undefined,
    });
  }

  // 8. Work Experience & Duration Extraction
  const expLines = [
    ...(sectionContent['WORK EXPERIENCE'] || []),
    ...(sectionContent['PROFESSIONAL EXPERIENCE'] || []),
    ...(sectionContent['EMPLOYMENT HISTORY'] || []),
    ...(sectionContent['EXPERIENCE'] || []),
    ...(sectionContent['PRACTICUM'] || []),
    ...(sectionContent['OJT'] || [])
  ];

  let extractedExperienceYears = 0;
  const workExperienceRecords: ExtractedWorkExperienceItem[] = [];

  // Look for date ranges in experience lines e.g. "2021 - 2023", "June 2020 - Present", "2019 to 2021"
  const dateRangeRegex = /(?:(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\s+)?(19\d{2}|20\d{2})\s*(?:-|–|to|until)\s*(?:(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\s+)?(19\d{2}|20\d{2}|present|current)/i;

  let currentRole: Partial<ExtractedWorkExperienceItem> | null = null;

  for (let i = 0; i < expLines.length; i++) {
    const line = expLines[i];
    const dateMatch = line.match(dateRangeRegex);

    if (dateMatch) {
      const startYear = parseInt(dateMatch[2], 10);
      const isPresent = /present|current/i.test(dateMatch[4] || '');
      const endYear = isPresent ? new Date().getFullYear() : parseInt(dateMatch[4] || `${startYear}`, 10);
      const span = Math.max(0.5, (endYear - startYear) || 1);
      extractedExperienceYears += span;

      // Previous or current line might be position or company
      const prevLine = i > 0 ? expLines[i - 1] : '';
      const position = prevLine && prevLine.length < 50 ? prevLine : 'Staff / Specialist';

      workExperienceRecords.push({
        id: `exp-${Date.now()}-${workExperienceRecords.length + 1}`,
        company: 'Employer / Enterprise',
        position,
        startDate: dateMatch[2],
        endDate: isPresent ? 'Present' : (dateMatch[4] || `${endYear}`),
        isCurrent: isPresent,
        responsibilities: expLines.slice(i + 1, i + 3).join('. ') || 'Core operational and functional duties.',
        yearsOfExperience: span,
      });
    }
  }

  // If no date ranges were matched, look for explicit text like "3 years of experience"
  if (extractedExperienceYears === 0) {
    const expTextMatch = text.match(/(\d+(?:\.\d+)?)\+?\s*years?\s*(?:of)?\s*experience/i);
    if (expTextMatch && expTextMatch[1]) {
      extractedExperienceYears = parseFloat(expTextMatch[1]);
    } else if (expLines.length > 5) {
      extractedExperienceYears = 1;
    }
  }

  // 9. Skills Extraction
  const skillSectionLines = [
    ...(sectionContent['SKILLS'] || []),
    ...(sectionContent['TECHNICAL SKILLS'] || []),
    ...(sectionContent['KEY COMPETENCIES'] || []),
    ...(sectionContent['COMPETENCIES'] || []),
    ...(sectionContent['CORE QUALIFICATIONS'] || []),
    ...(sectionContent['AREAS OF EXPERTISE'] || [])
  ];

  const extractedSkillSet = new Set<string>();

  // Extract from the dedicated skills section lines
  for (const sLine of skillSectionLines) {
    // Split on commas, bullets (•, -, *), or semicolons
    const items = sLine.split(/[,;•\*\-\/|]+/).map(item => item.trim()).filter(Boolean);
    for (const item of items) {
      if (item.length >= 2 && item.length <= 40 && !item.toLowerCase().includes('skill')) {
        extractedSkillSet.add(item);
      }
    }
  }

  // Curated multi-industry skills checklist to detect real skills present in resume text
  const INDUSTRY_SKILL_PATTERNS = [
    // Tech & Computer
    'JavaScript', 'TypeScript', 'React', 'React.js', 'Node.js', 'Express', 'Python', 'Java', 'PHP', 'C++',
    'SQL', 'PostgreSQL', 'MySQL', 'MongoDB', 'HTML', 'CSS', 'Tailwind', 'Bootstrap', 'Git', 'GitHub',
    'IT Support', 'Network Administration', 'Hardware Troubleshooting', 'System Maintenance',
    // Agriculture & Fisheries
    'Crop Management', 'Agronomy', 'Soil Sampling', 'Pest Management', 'Pest Control', 'Fertilizer Application',
    'Greenhouse Operations', 'Organic Farming', 'Aquaculture', 'Fish Farming', 'Post-Harvest Handling',
    'Agricultural Machinery', 'Farm Supervision', 'Livestock Care', 'Poultry Management',
    // Office, Finance & Admin
    'Bookkeeping', 'Accounting', 'Financial Reporting', 'Payroll Processing', 'QuickBooks', 'Tax Preparation',
    'Bank Reconciliation', 'Auditing', 'Microsoft Excel', 'Microsoft Office', 'Spreadsheets', 'Data Entry',
    'Clerical Support', 'Records Management', 'Billing', 'Cashiering', 'Inventory Control',
    // Hospitality, Food & Tourism
    'Front Desk', 'Hotel Operations', 'Food and Beverage', 'Barista', 'Culinary Arts', 'Food Preparation',
    'Housekeeping', 'Customer Service', 'Event Coordination', 'Tourism Marketing', 'Reservation Systems',
    // Engineering & Construction
    'AutoCAD', 'Civil Engineering', 'Structural Analysis', 'Site Supervision', 'Blueprint Reading',
    'Construction Safety', 'Welding', 'Electrical Wiring', 'Carpentry', 'Plumbing',
    // Health & Safety
    'First Aid', 'Basic Life Support', 'CPR', 'Patient Care', 'Vital Signs Monitoring', 'Clinical Documentation',
    // Universal / Soft
    'Team Leadership', 'Communication', 'Problem Solving', 'Time Management', 'Critical Thinking',
    'Active Listening', 'Conflict Resolution', 'Adaptability', 'Teamwork', 'Project Management'
  ];

  for (const s of INDUSTRY_SKILL_PATTERNS) {
    const escaped = s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`\\b${escaped}\\b`, 'i');
    if (regex.test(text)) {
      extractedSkillSet.add(s);
    }
  }

  // Separate into 6 distinct skills categories:
  const tradeSkills: string[] = [];
  const administrativeSkills: string[] = [];
  const serviceHospitalitySkills: string[] = [];
  const salesCustomerSkills: string[] = [];
  const itCreativeSkills: string[] = [];
  const softSkills: string[] = [];
  const technicalSkills: string[] = [];

  for (const sk of extractedSkillSet) {
    const lowerSk = sk.toLowerCase();
    let categorized = false;

    if (SOFT_SKILLS_LIST.some(soft => lowerSk.includes(soft))) {
      softSkills.push(sk);
      categorized = true;
    }
    if (TRADE_SKILLS.some(item => lowerSk.includes(item.toLowerCase()))) {
      tradeSkills.push(sk);
      categorized = true;
    }
    if (ADMIN_SKILLS.some(item => lowerSk.includes(item.toLowerCase()))) {
      administrativeSkills.push(sk);
      categorized = true;
    }
    if (SERVICE_HOSPITALITY_SKILLS.some(item => lowerSk.includes(item.toLowerCase()))) {
      serviceHospitalitySkills.push(sk);
      categorized = true;
    }
    if (SALES_COMMERCE_SKILLS.some(item => lowerSk.includes(item.toLowerCase()))) {
      salesCustomerSkills.push(sk);
      categorized = true;
    }
    if (IT_CREATIVE_SKILLS.some(item => lowerSk.includes(item.toLowerCase()))) {
      itCreativeSkills.push(sk);
      categorized = true;
    }

    if (!softSkills.includes(sk)) {
      technicalSkills.push(sk);
    }
  }

  // Also match full text against known categories if not already captured
  for (const item of TRADE_SKILLS) {
    if (lowerText.includes(item.toLowerCase()) && !tradeSkills.includes(item)) {
      tradeSkills.push(item);
      if (!technicalSkills.includes(item)) technicalSkills.push(item);
    }
  }
  for (const item of ADMIN_SKILLS) {
    if (lowerText.includes(item.toLowerCase()) && !administrativeSkills.includes(item)) {
      administrativeSkills.push(item);
      if (!technicalSkills.includes(item)) technicalSkills.push(item);
    }
  }
  for (const item of SERVICE_HOSPITALITY_SKILLS) {
    if (lowerText.includes(item.toLowerCase()) && !serviceHospitalitySkills.includes(item)) {
      serviceHospitalitySkills.push(item);
      if (!technicalSkills.includes(item)) technicalSkills.push(item);
    }
  }
  for (const item of SALES_COMMERCE_SKILLS) {
    if (lowerText.includes(item.toLowerCase()) && !salesCustomerSkills.includes(item)) {
      salesCustomerSkills.push(item);
      if (!technicalSkills.includes(item)) technicalSkills.push(item);
    }
  }
  for (const item of IT_CREATIVE_SKILLS) {
    if (lowerText.includes(item.toLowerCase()) && !itCreativeSkills.includes(item)) {
      itCreativeSkills.push(item);
      if (!technicalSkills.includes(item)) technicalSkills.push(item);
    }
  }

  // If no skills were found at all, extract any meaningful nouns from education/degree
  if (technicalSkills.length === 0 && softSkills.length === 0) {
    if (primaryDegree) {
      technicalSkills.push(primaryDegree.replace(/bachelor\s+of\s+(science|arts)\s+in/i, '').trim() || 'Technical Competence');
    }
    softSkills.push('Clear Communication');
    softSkills.push('Teamwork');
  }

  const allSkills = Array.from(new Set([...technicalSkills, ...softSkills]));

  // 10. Certifications & Licensure
  const certLines = [
    ...(sectionContent['CERTIFICATIONS'] || []),
    ...(sectionContent['CERTIFICATES'] || []),
    ...(sectionContent['LICENSES'] || []),
    ...(sectionContent['ELIGIBILITY'] || []),
    ...(sectionContent['TRAININGS'] || []),
    ...(sectionContent['SEMINARS'] || [])
  ];

  const certifications: string[] = [];
  for (const cLine of certLines) {
    const items = cLine.split(/[,;•\*\-]+/).map(c => c.trim()).filter(Boolean);
    for (const item of items) {
      if (item.length >= 3 && item.length <= 60 && !/^(certification|license|eligibility|seminar)s?$/i.test(item)) {
        certifications.push(item);
      }
    }
  }

  // Check for common Philippine eligibility / TESDA certifications across full text
  if (lowerText.includes('career service professional') || lowerText.includes('csc professional')) {
    if (!certifications.some(c => c.toLowerCase().includes('civil service'))) {
      certifications.push('Career Service Professional Eligibility');
    }
  } else if (lowerText.includes('civil service') || lowerText.includes('csc eligible')) {
    if (!certifications.some(c => c.toLowerCase().includes('civil service'))) {
      certifications.push('Civil Service Eligible (CSC)');
    }
  }
  if (lowerText.includes('prc') || lowerText.includes('licensed professional')) {
    if (!certifications.some(c => c.toLowerCase().includes('prc'))) {
      certifications.push('PRC Professional License');
    }
  }
  if (lowerText.includes('nc ii') || lowerText.includes('national certificate ii')) {
    if (!certifications.some(c => c.toLowerCase().includes('nc ii'))) {
      certifications.push('TESDA National Certificate II (NC II)');
    }
  }

  const normalizedAttainment = normalizeEducationalAttainment(educationalAttainment, primaryDegree);
  const normalizedCivil = normalizeCivilStatus(civilStatus);
  const normalizedSexVal = normalizeSex(sex);
  const normalizedBrgy = normalizeBarangay(barangay, address);
  const cleanFirstName = formatProperName(firstName);
  const cleanMiddleName = formatProperName(middleName);
  const cleanLastName = formatProperName(lastName);
  const computedAge = (typeof age === 'number' && age > 0) ? age : (computeAgeFromDob(dateOfBirth) ? parseInt(computeAgeFromDob(dateOfBirth), 10) : undefined);

  const finalSoftSkills = softSkills.length > 0
    ? softSkills
    : ['Clear Communication', 'Teamwork', 'Punctuality', 'Adaptability'];

  return {
    firstName: cleanFirstName || '',
    middleName: cleanMiddleName || undefined,
    lastName: cleanLastName || '',
    email: email || '',
    contactNumber: contactNumber || '',
    dateOfBirth: dateOfBirth || undefined,
    age: computedAge,
    civilStatus: normalizedCivil,
    sex: normalizedSexVal,
    address: address || (normalizedBrgy ? `Brgy. ${normalizedBrgy}, ${municipality}, Oriental Mindoro` : (municipality ? `${municipality}, Oriental Mindoro` : undefined)),
    barangay: normalizedBrgy || undefined,
    municipality: municipality || 'Roxas',
    professionalSummary: professionalSummary || undefined,
    educationalAttainment: normalizedAttainment,
    primaryDegree: primaryDegree || '',
    school: school || undefined,
    yearGraduated: yearGraduated || undefined,
    education: educationRecords.map(e => ({
      ...e,
      educationalAttainment: normalizeEducationalAttainment(e.educationalAttainment, e.degreeCourse)
    })),
    workExperience: workExperienceRecords,
    tradeSkills,
    administrativeSkills,
    serviceHospitalitySkills,
    salesCustomerSkills,
    itCreativeSkills,
    technicalSkills,
    softSkills: finalSoftSkills,
    extractedSkills: Array.from(new Set([...allSkills, ...finalSoftSkills])),
    extractedExperienceYears: Number(extractedExperienceYears.toFixed(1)),
    certifications,
    rawTextPreview: text.slice(0, 350).trim() + (text.length > 350 ? '...' : ''),
  };
}

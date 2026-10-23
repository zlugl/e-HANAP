import { extractResumeInfoFromText, ExtractedResumePayload } from './resumeExtractorCore';

export type { ExtractedResumePayload, ExtractedEducationItem, ExtractedWorkExperienceItem } from './resumeExtractorCore';

/**
 * Converts a File object into a base64 encoded string
 */
export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const base64 = result.includes(',') ? result.split(',')[1] : result;
      resolve(base64);
    };
    reader.onerror = error => reject(error);
    reader.readAsDataURL(file);
  });
}

/**
 * Main Resume Parser function using full-stack API endpoint with high-fidelity server & local extraction
 */
export async function parseResumeFile(file: File): Promise<ExtractedResumePayload> {
  let directText = '';
  try {
    if (file.type.includes('text') || file.name.endsWith('.txt') || file.name.endsWith('.md')) {
      directText = await file.text().catch(() => '');
    }
  } catch {
    directText = '';
  }

  let base64 = '';
  try {
    base64 = await fileToBase64(file);
  } catch {
    base64 = '';
  }

  try {
    // Call server API route `/api/parse-resume`
    const response = await fetch('/api/parse-resume', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fileName: file.name,
        mimeType: file.type || (file.name.endsWith('.pdf') ? 'application/pdf' : file.name.endsWith('.docx') ? 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' : 'application/octet-stream'),
        fileBase64: base64,
        fileText: directText,
        fileContent: directText,
      }),
    });

    if (response.ok) {
      const data = await response.json();
      if (data.success && data.extracted) {
        return data.extracted;
      }
    }
  } catch {
    // Fallback gracefully without console noise
  }

  // Fallback: extract from whatever text or filename is available locally
  return extractResumeInfoFromText(directText || file.name, file.name);
}


import { parseResumeText } from './resumeParser';
import type { ResumeData } from '../types/resume';
import { getApiUrl } from './api';

/**
 * Extracts plain text from uploaded files (Text, PDF, DOC, Images).
 */
export async function extractTextFromFile(file: File): Promise<string> {
  const fileType = file.type.toLowerCase();
  const fileName = file.name.toLowerCase();

  return new Promise((resolve) => {
    const reader = new FileReader();

    if (fileType.includes('text') || fileName.endsWith('.txt') || fileName.endsWith('.md') || fileName.endsWith('.json')) {
      reader.onload = (e) => {
        resolve((e.target?.result as string) || '');
      };
      reader.onerror = () => resolve('');
      reader.readAsText(file);
    } else if (fileType.includes('pdf') || fileName.endsWith('.pdf')) {
      const formData = new FormData();
      formData.append('resume', file);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);

      fetch(getApiUrl('/api/upload/parse-pdf'), {
        method: 'POST',
        body: formData,
        signal: controller.signal
      })
      .then(response => {
        clearTimeout(timeoutId);
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(data => {
        resolve(data.text || '');
      })
      .catch(error => {
        clearTimeout(timeoutId);
        console.error('Error parsing PDF on server:', error);
        resolve(''); // Fallback to empty string on error
      });
    } else {
      // For images or unknown files, read as text snippet or provide readable fallback
      reader.onload = (e) => {
        const res = (e.target?.result as string) || '';
        resolve(res.length > 50 ? res : file.name.replace(/\.[^/.]+$/, ''));
      };
      reader.onerror = () => resolve('');
      reader.readAsText(file);
    }
  });
}

/**
 * Directly parses an uploaded file into a ResumeData object.
 */
export async function parseResumeFile(file: File): Promise<ResumeData> {
  const extractedText = await extractTextFromFile(file);
  return parseResumeText(extractedText);
}

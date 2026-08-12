import fs from 'fs';
import path from 'path';
import pdf from 'pdf-parse';
import { parseResumeText } from '../client/src/utils/resumeParser';

async function run() {
  const dataBuffer = fs.readFileSync(path.join(__dirname, '../Abhishek_Jain_SEO_Resume.pdf'));
  const data = await pdf(dataBuffer);
  const parsed = parseResumeText(data.text);
  console.log("PROJECTS LENGTH:", parsed.projects.length);
  console.log("EXPERIENCE LENGTH:", parsed.experience.length);
  console.log("EXPERIENCE:", JSON.stringify(parsed.experience, null, 2));
  console.log("EDUCATION LENGTH:", parsed.education.length);
  console.log("LOCATION:", parsed.personalInfo.location);
}

run();

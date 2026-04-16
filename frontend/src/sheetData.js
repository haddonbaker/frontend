/**
 * sheetData.js
 * Shared status sheet metadata used by StatusSheets.jsx and App.jsx.
 */

const pdfModules = import.meta.glob('./data/2025-2026 Files/*.pdf', { query: '?url', import: 'default', eager: true });

export function formatDisplayName(filename) {
  let name = filename.replace('.pdf', '').replace(/_\d{4}$/, '');
  const parts = name.split('_');
  return parts.map(part => part.replace(/([a-z])([A-Z])/g, '$1 $2')).join(' · ');
}

export const CATEGORY_MAP = {
  Accounting: 'Business',
  AppliedScienceandEngineering: 'Engineering & CS',
  AppliedStatistics: 'Sciences & Math',
  BiblicalandTheologicalStudies: 'Theology',
  Biochemistry: 'Sciences & Math',
  Biology: 'Sciences & Math',
  BiologyHealth: 'Sciences & Math',
  BusinessAnalysis: 'Business',
  BusinessEconomics: 'Business',
  BusinessStatistics: 'Business',
  Chemistry: 'Sciences & Math',
  CommunicationArts: 'Arts & Humanities',
  ComputerEngineering: 'Engineering & CS',
  ComputerProgramming: 'Engineering & CS',
  ComputerScience: 'Engineering & CS',
  ConservationBiology: 'Sciences & Math',
  DataScience: 'Engineering & CS',
  DesignandInnovation: 'Engineering & CS',
  Economics: 'Business',
  ElectricalEngineering: 'Engineering & CS',
  ElementaryEduc: 'Education',
  English: 'Arts & Humanities',
  Entrepreneurship: 'Business',
  ExerciseScience: 'Sciences & Math',
  Finance: 'Business',
  French: 'Arts & Humanities',
  History: 'Arts & Humanities',
  HumanResourceManagement: 'Business',
  InternationalBusiness: 'Business',
  Management: 'Business',
  Marketing: 'Business',
  Mathematics: 'Sciences & Math',
  MechanicalEngineering: 'Engineering & CS',
  MiddleLevel: 'Education',
  MolecularBiology: 'Sciences & Math',
  Music: 'Music',
  MusicBusiness: 'Music',
  MusicPerformance: 'Music',
  MusicReligion: 'Music',
  Nursing: 'Nursing',
  Philosophy: 'Arts & Humanities',
  Physics: 'Sciences & Math',
  PoliticalScience: 'Social Sciences',
  Psychology: 'Social Sciences',
  SocialWork: 'Social Sciences',
  Spanish: 'Arts & Humanities',
  SpecialEducation: 'Education',
  SpecialEducwithElementaryEduc: 'Education',
  SupplyChainManagement: 'Business',
  Undeclared: 'Undeclared',
};

export const CATEGORIES = [
  'Arts & Humanities', 'Business', 'Education', 'Engineering & CS',
  'Music', 'Nursing', 'Sciences & Math', 'Social Sciences', 'Theology', 'Undeclared',
];

function getMajorCategory(filename) {
  const base = filename.replace('.pdf', '').split('_')[0];
  return CATEGORY_MAP[base] || 'Other';
}

function isMajorSheet(filename) {
  if (filename.includes('Guidelines') || filename.includes('IB ') || filename.includes('AP ') || filename.includes('CLEP') || filename.includes('Cambridge')) return false;
  if (filename.startsWith('Minors')) return false;
  return true;
}

export const allSheets = Object.entries(pdfModules)
  .filter(([path]) => isMajorSheet(path.split('/').pop()))
  .map(([path, url]) => {
    const filename = path.split('/').pop();
    return { filename, url, displayName: formatDisplayName(filename), category: getMajorCategory(filename) };
  })
  .sort((a, b) => a.displayName.localeCompare(b.displayName));

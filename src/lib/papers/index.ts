import { searchSemanticScholar, PaperResult } from './semantic-scholar';
import { searchArxiv } from './arxiv';

const CATEGORY_TO_FIELD: Record<string, string> = {
  'Computer Science': 'Computer Science',
  'Mathematics': 'Mathematics',
  'Physics': 'Physics',
  'Biology': 'Biology',
  'Chemistry': 'Chemistry',
  'Business': 'Business',
  'Engineering': 'Engineering',
  'Environmental Science': 'Environmental Science',
  'Economics': 'Economics',
  'Psychology': 'Psychology',
  'Philosophy': 'Philosophy',
};

function deduplicatePapers(papers: PaperResult[]): PaperResult[] {
  const seen = new Map<string, PaperResult>();

  for (const paper of papers) {
    const normalizedTitle = paper.title.toLowerCase().replace(/[^a-z0-9]/g, '');
    if (!seen.has(normalizedTitle)) {
      seen.set(normalizedTitle, paper);
    }
  }

  return Array.from(seen.values());
}

export async function searchPapers(
  courseTitle: string,
  courseTags: string[],
  courseCategory: string,
  limit: number = 10
): Promise<PaperResult[]> {
  const queryTerms = [courseTitle, ...courseTags.slice(0, 3)].join(' ');
  const fieldOfStudy = CATEGORY_TO_FIELD[courseCategory];

  // Query Semantic Scholar first
  let papers = await searchSemanticScholar(queryTerms, fieldOfStudy, limit);

  // If fewer than 5 results, supplement with arXiv
  if (papers.length < 5) {
    const arxivPapers = await searchArxiv(queryTerms, limit - papers.length);
    papers = [...papers, ...arxivPapers];
  }

  // Deduplicate and sort by citation count
  papers = deduplicatePapers(papers);
  papers.sort((a, b) => b.citationCount - a.citationCount);

  return papers.slice(0, limit);
}

export type { PaperResult };

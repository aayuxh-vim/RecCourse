export interface PaperResult {
  paperId: string;
  title: string;
  authors: string;
  abstract: string | null;
  url: string;
  source: 'SEMANTIC_SCHOLAR' | 'ARXIV';
  citationCount: number;
  year: number | null;
  openAccessUrl?: string | null;
}

export async function searchSemanticScholar(
  query: string,
  fieldsOfStudy?: string,
  limit: number = 10
): Promise<PaperResult[]> {
  try {
    const params = new URLSearchParams({
      query,
      fields: 'title,abstract,authors,url,year,citationCount,openAccessPdf',
      limit: limit.toString(),
    });

    if (fieldsOfStudy) {
      params.set('fieldsOfStudy', fieldsOfStudy);
    }

    const response = await fetch(
      `https://api.semanticscholar.org/graph/v1/paper/search?${params.toString()}`,
      {
        headers: {
          'Accept': 'application/json',
        },
        next: { revalidate: 86400 },
      }
    );

    if (!response.ok) {
      console.error('Semantic Scholar API error:', response.status);
      return [];
    }

    const data = await response.json();

    if (!data.data || data.data.length === 0) {
      return [];
    }

    return data.data.map((paper: Record<string, unknown>) => ({
      paperId: paper.paperId as string,
      title: paper.title as string,
      authors: Array.isArray(paper.authors)
        ? (paper.authors as Array<{ name: string }>).map((a) => a.name).join(', ')
        : '',
      abstract: (paper.abstract as string) || null,
      url: (paper.url as string) || `https://www.semanticscholar.org/paper/${paper.paperId}`,
      source: 'SEMANTIC_SCHOLAR' as const,
      citationCount: (paper.citationCount as number) || 0,
      year: (paper.year as number) || null,
      openAccessUrl: paper.openAccessPdf
        ? (paper.openAccessPdf as { url: string }).url
        : null,
    }));
  } catch (error) {
    console.error('Semantic Scholar search error:', error);
    return [];
  }
}

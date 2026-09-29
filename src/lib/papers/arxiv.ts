import { parseStringPromise } from 'xml2js';
import { PaperResult } from './semantic-scholar';

export async function searchArxiv(
  query: string,
  maxResults: number = 10
): Promise<PaperResult[]> {
  try {
    const searchQuery = query
      .split(/\s+/)
      .map((term) => `all:${term}`)
      .join('+AND+');

    const url = `https://export.arxiv.org/api/query?search_query=${searchQuery}&start=0&max_results=${maxResults}&sortBy=relevance&sortOrder=descending`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    const response = await fetch(url, {
      next: { revalidate: 86400 },
      headers: {
        'User-Agent': 'RecCourse/1.0 (mailto:admin@reccourse.dev)',
      },
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);

    if (!response.ok) {
      console.error('arXiv API error:', response.status);
      return [];
    }

    const xml = await response.text();
    const parsed = await parseStringPromise(xml, { explicitArray: false });

    const feed = parsed.feed;
    if (!feed.entry) {
      return [];
    }

    const entries = Array.isArray(feed.entry) ? feed.entry : [feed.entry];

    return entries.map((entry: Record<string, unknown>) => {
      const id = entry.id as string;
      const arxivId = id.replace('http://arxiv.org/abs/', '');

      const authors = entry.author
        ? Array.isArray(entry.author)
          ? (entry.author as Array<{ name: string }>).map((a) => a.name).join(', ')
          : (entry.author as { name: string }).name
        : '';

      const links = entry.link
        ? Array.isArray(entry.link)
          ? (entry.link as Array<{ $: { title?: string; href: string } }>)
          : [entry.link as { $: { title?: string; href: string } }]
        : [];

      const pdfLink = links.find(
        (l: { $: { title?: string; href: string } }) => l.$.title === 'pdf'
      );

      const publishedStr = entry.published as string;
      const year = publishedStr ? new Date(publishedStr).getFullYear() : null;

      return {
        paperId: `arxiv:${arxivId}`,
        title: ((entry.title as string) || '').replace(/\s+/g, ' ').trim(),
        authors,
        abstract: entry.summary
          ? ((entry.summary as string) || '').replace(/\s+/g, ' ').trim()
          : null,
        url: id,
        source: 'ARXIV' as const,
        citationCount: 0,
        year,
        openAccessUrl: pdfLink ? pdfLink.$.href : null,
      };
    });
  } catch (error) {
    console.error('arXiv search error:', error);
    return [];
  }
}

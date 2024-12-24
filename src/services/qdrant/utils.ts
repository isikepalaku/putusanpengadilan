export function extractMatchedSegments(content: string, query: string): string[] {
  const contentLower = content.toLowerCase();
  const queryTerms = query.toLowerCase().split(' ');
  const matchedSegments: string[] = [];

  queryTerms.forEach(term => {
    const index = contentLower.indexOf(term);
    if (index !== -1) {
      const start = Math.max(0, index - 40);
      const end = Math.min(contentLower.length, index + term.length + 40);
      matchedSegments.push(`...${content.slice(start, end)}...`);
    }
  });

  return [...new Set(matchedSegments)];
}
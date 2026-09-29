import { searchPapers } from './src/lib/papers';

async function run() {
  console.log('Searching for papers for course: Introduction to Machine Learning');
  
  const papers = await searchPapers(
    'Introduction to Machine Learning',
    ['neural networks', 'deep learning'],
    'Computer Science',
    5
  );

  console.log(`\nFound ${papers.length} papers:`);
  papers.forEach((paper, i) => {
    console.log(`\n${i + 1}. ${paper.title}`);
    console.log(`   Authors: ${paper.authors}`);
    console.log(`   Source: ${paper.source}`);
    console.log(`   Citations: ${paper.citationCount}`);
    console.log(`   URL: ${paper.url}`);
  });
}

run().catch(console.error);

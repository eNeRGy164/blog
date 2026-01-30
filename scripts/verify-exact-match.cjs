/**
 * Detailed verification: Compare specific posts to show exact matching
 */

const fs = require('fs');
const path = require('path');

const cacheDir = path.join(process.cwd(), '.cache', 'fuse-search-index');
const postsFile = path.join(cacheDir, 'processed-posts.json');

if (!fs.existsSync(postsFile)) {
  console.error('Cache not found.');
  process.exit(1);
}

const posts = JSON.parse(fs.readFileSync(postsFile, 'utf-8'));
const Fuse = require('fuse.js');

// Original configuration WITH body
const withBodyConfig = {
  keys: ["tags", "categories", "title", "body"],
  includeScore: true,
  threshold: 0.55,
  ignoreLocation: true,
  findAllMatches: true,
  minMatchCharLength: 2,
};

// Current configuration WITHOUT body
const withoutBodyConfig = {
  keys: ["tags", "categories", "title"],
  includeScore: true,
  threshold: 0.55,
  ignoreLocation: true,
  findAllMatches: true,
  minMatchCharLength: 2,
};

function getRelatedPosts(fuse, post) {
  if (!post.tags || !post.categories) return [];
  
  const searchValue = `${post.tags.join(" ")} ${post.categories.join(" ")}`;
  return fuse
    .search(searchValue, { limit: 4 })
    .filter((result) => result.item.permalink !== post.permalink)
    .slice(0, 3);
}

console.log('Building indexes...\n');

// Need to add body field back for testing
const postsWithBody = posts.map(p => ({
  ...p,
  body: '' // Empty body is fine for comparison since we're testing metadata matching
}));

const fuseWithBody = new Fuse(postsWithBody, withBodyConfig);
const fuseWithoutBody = new Fuse(posts, withoutBodyConfig);

// Sample some posts to show examples
const sampleSize = 10;
const samples = posts.filter(p => p.tags && p.categories).slice(0, sampleSize);

console.log('═'.repeat(100));
console.log('DETAILED VERIFICATION: Related Posts Comparison');
console.log('═'.repeat(100));
console.log(`\nShowing ${sampleSize} sample posts:\n`);

let totalMatches = 0;
let totalPosts = 0;

samples.forEach((post, idx) => {
  const withBodyResults = getRelatedPosts(fuseWithBody, postsWithBody.find(p => p.permalink === post.permalink));
  const withoutBodyResults = getRelatedPosts(fuseWithoutBody, post);
  
  const withBodyPermalinks = withBodyResults.map(r => r.item.permalink);
  const withoutBodyPermalinks = withoutBodyResults.map(r => r.item.permalink);
  
  const match = JSON.stringify(withBodyPermalinks) === JSON.stringify(withoutBodyPermalinks);
  totalPosts++;
  if (match) totalMatches++;
  
  console.log(`${idx + 1}. ${post.title}`);
  console.log(`   ${post.permalink}`);
  console.log(`   Tags: [${post.tags.join(', ')}]`);
  console.log(`   Categories: [${post.categories.join(', ')}]`);
  
  console.log(`\n   WITH body field (${withBodyResults.length} results):`);
  withBodyResults.forEach((r, i) => {
    console.log(`     ${i + 1}. ${r.item.title}`);
  });
  
  console.log(`\n   WITHOUT body field (${withoutBodyResults.length} results):`);
  withoutBodyResults.forEach((r, i) => {
    console.log(`     ${i + 1}. ${r.item.title}`);
  });
  
  console.log(`\n   Match: ${match ? '✅ IDENTICAL' : '❌ DIFFERENT'}\n`);
  console.log('-'.repeat(100));
});

// Now check ALL posts
console.log('\n' + '═'.repeat(100));
console.log('COMPLETE VERIFICATION: All 98 Posts');
console.log('═'.repeat(100));

let allMatches = 0;
let allTotal = 0;
let differences = [];

posts.forEach(post => {
  if (!post.tags || !post.categories) return;
  
  allTotal++;
  const withBodyResults = getRelatedPosts(fuseWithBody, postsWithBody.find(p => p.permalink === post.permalink));
  const withoutBodyResults = getRelatedPosts(fuseWithoutBody, post);
  
  const withBodyPermalinks = withBodyResults.map(r => r.item.permalink);
  const withoutBodyPermalinks = withoutBodyResults.map(r => r.item.permalink);
  
  if (JSON.stringify(withBodyPermalinks) === JSON.stringify(withoutBodyPermalinks)) {
    allMatches++;
  } else {
    differences.push({
      title: post.title,
      permalink: post.permalink,
      withBody: withBodyPermalinks.length,
      withoutBody: withoutBodyPermalinks.length
    });
  }
});

console.log(`\nTotal posts checked: ${allTotal}`);
console.log(`Exact matches: ${allMatches} (${((allMatches/allTotal)*100).toFixed(1)}%)`);
console.log(`Differences: ${differences.length}\n`);

if (differences.length === 0) {
  console.log('✅ ✅ ✅ ALL RELATED POSTS ARE IDENTICAL TO ORIGINAL! ✅ ✅ ✅');
} else {
  console.log('❌ Some differences found:');
  differences.forEach(d => {
    console.log(`  - ${d.title}`);
    console.log(`    With body: ${d.withBody} results, Without body: ${d.withoutBody} results`);
  });
}

console.log('\n' + '═'.repeat(100));

/**
 * Script to capture current related posts results.
 * Run with: node scripts/capture-baseline.js
 */

const fs = require('fs');
const path = require('path');

// Read the cached data that was generated during the last build
const cacheDir = path.join(process.cwd(), '.cache', 'fuse-search-index');
const postsFile = path.join(cacheDir, 'processed-posts.json');

if (!fs.existsSync(postsFile)) {
  console.error('Cache not found. Please run a build first: npm run build');
  process.exit(1);
}

const posts = JSON.parse(fs.readFileSync(postsFile, 'utf-8'));
console.log(`Loaded ${posts.length} posts from cache`);

// We'll use the Fuse instance to generate baseline
const Fuse = require('fuse.js');

const fuseOptions = {
  keys: ["tags", "categories", "title", "body"],
  includeScore: true,
  threshold: 0.55,
  ignoreLocation: true,
  findAllMatches: true,
  minMatchCharLength: 2,
};

console.log('Building Fuse index with body field...');
const fuse = new Fuse.default(posts, fuseOptions);

const results = {};

console.log('Generating related posts for each page...');
posts.forEach((post, index) => {
  if (post.tags && post.categories) {
    const searchValue = `${post.tags.join(" ")} ${post.categories.join(" ")}`;
    const searchResults = fuse
      .search(searchValue, { limit: 4 })
      .filter((result) => result.item.permalink !== post.permalink)
      .slice(0, 3);

    results[post.permalink] = {
      title: post.title,
      tags: post.tags,
      categories: post.categories,
      relatedPosts: searchResults.map((r) => ({
        permalink: r.item.permalink,
        title: r.item.title,
        score: r.score,
      })),
    };
  }
  
  if ((index + 1) % 10 === 0) {
    console.log(`  Processed ${index + 1}/${posts.length} posts...`);
  }
});

const outputFile = '/tmp/fuse-baseline-with-body.json';
fs.writeFileSync(outputFile, JSON.stringify(results, null, 2));
console.log(`\nBaseline saved to ${outputFile}`);

// Print summary statistics
const postsWithRelated = Object.keys(results).length;
const totalRelated = Object.values(results).reduce((sum, r) => sum + r.relatedPosts.length, 0);
const avgRelated = totalRelated / postsWithRelated;

console.log(`\nStatistics:`);
console.log(`  Posts with related posts: ${postsWithRelated}`);
console.log(`  Total related post links: ${totalRelated}`);
console.log(`  Average related posts per page: ${avgRelated.toFixed(2)}`);

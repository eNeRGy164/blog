/**
 * Script to compare Fuse search results with and without body field.
 * This helps tune parameters to match existing behavior.
 */

const fs = require('fs');
const path = require('path');

// Check if we have cached posts
const cacheDir = path.join(process.cwd(), '.cache', 'fuse-search-index');
const postsFile = path.join(cacheDir, 'processed-posts.json');

if (!fs.existsSync(postsFile)) {
  console.error('Cache not found. Run this after a build: npm run build');
  process.exit(1);
}

const posts = JSON.parse(fs.readFileSync(postsFile, 'utf-8'));
console.log(`Loaded ${posts.length} posts from cache\n`);

const Fuse = require('fuse.js');

// Configuration WITH body (current)
const optionsWithBody = {
  keys: ["tags", "categories", "title", "body"],
  includeScore: true,
  threshold: 0.55,
  ignoreLocation: true,
  findAllMatches: true,
  minMatchCharLength: 2,
};

// Configuration WITHOUT body (proposed) - we'll test different thresholds
const optionsWithoutBody = (threshold) => ({
  keys: [
    { name: "tags", weight: 0.7 },
    { name: "categories", weight: 0.7 },
    { name: "title", weight: 0.6 }
  ],
  includeScore: true,
  threshold,
  ignoreLocation: true,
  findAllMatches: true,
  minMatchCharLength: 2,
});

function getRelatedPosts(fuse, post) {
  if (!post.tags || !post.categories) return [];
  
  const searchValue = `${post.tags.join(" ")} ${post.categories.join(" ")}`;
  return fuse
    .search(searchValue, { limit: 4 })
    .filter((result) => result.item.permalink !== post.permalink)
    .slice(0, 3);
}

function compareConfigurations() {
  console.log('Testing different configurations...\n');
  
  // Build index with body
  console.log('[1/4] Building Fuse index WITH body field...');
  const fuseWithBody = new Fuse(posts, optionsWithBody);
  
  // Test various thresholds without body
  const thresholds = [0.3, 0.4, 0.5, 0.6];
  const results = {};
  
  thresholds.forEach((threshold, idx) => {
    console.log(`[${idx + 2}/4] Testing WITHOUT body, threshold=${threshold}...`);
    const fuseWithoutBody = new Fuse(posts, optionsWithoutBody(threshold));
    
    let exactMatches = 0;
    let partialMatches = 0;
    let noMatches = 0;
    let totalPosts = 0;
    
    posts.forEach(post => {
      if (!post.tags || !post.categories) return;
      
      totalPosts++;
      const withBodyResults = getRelatedPosts(fuseWithBody, post);
      const withoutBodyResults = getRelatedPosts(fuseWithoutBody, post);
      
      const withBodyPermalinks = withBodyResults.map(r => r.item.permalink);
      const withoutBodyPermalinks = withoutBodyResults.map(r => r.item.permalink);
      
      // Check how many match
      const matchCount = withBodyPermalinks.filter(p => withoutBodyPermalinks.includes(p)).length;
      
      if (matchCount === withBodyPermalinks.length && withBodyPermalinks.length === withoutBodyPermalinks.length) {
        exactMatches++;
      } else if (matchCount > 0) {
        partialMatches++;
      } else {
        noMatches++;
      }
    });
    
    results[threshold] = {
      exactMatches,
      partialMatches,
      noMatches,
      totalPosts,
      exactMatchPercent: ((exactMatches / totalPosts) * 100).toFixed(1),
      partialMatchPercent: ((partialMatches / totalPosts) * 100).toFixed(1),
      noMatchPercent: ((noMatches / totalPosts) * 100).toFixed(1),
    };
  });
  
  // Print results
  console.log('\n' + '='.repeat(80));
  console.log('COMPARISON RESULTS');
  console.log('='.repeat(80));
  console.log(`Total posts analyzed: ${results[thresholds[0]].totalPosts}\n`);
  
  console.log('Threshold | Exact Match | Partial Match | No Match');
  console.log('-'.repeat(60));
  
  thresholds.forEach(threshold => {
    const r = results[threshold];
    console.log(
      `${threshold.toFixed(1).padEnd(9)} | ` +
      `${r.exactMatches.toString().padEnd(4)} (${r.exactMatchPercent}%) | ` +
      `${r.partialMatches.toString().padEnd(4)} (${r.partialMatchPercent}%) | ` +
      `${r.noMatches.toString().padEnd(4)} (${r.noMatchPercent}%)`
    );
  });
  
  // Find best threshold
  const bestThreshold = thresholds.reduce((best, current) => {
    const bestScore = results[best].exactMatches * 2 + results[best].partialMatches;
    const currentScore = results[current].exactMatches * 2 + results[current].partialMatches;
    return currentScore > bestScore ? current : best;
  });
  
  console.log('\n' + '='.repeat(80));
  console.log(`RECOMMENDATION: Use threshold ${bestThreshold}`);
  console.log(`This gives ${results[bestThreshold].exactMatchPercent}% exact matches`);
  console.log(`and ${results[bestThreshold].partialMatchPercent}% partial matches`);
  console.log('='.repeat(80));
}

compareConfigurations();

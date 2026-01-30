/**
 * Comprehensive analysis of Fuse configurations
 * Tests multiple settings and checks for posts with no related content
 */

const fs = require('fs');
const path = require('path');

const cacheDir = path.join(process.cwd(), '.cache', 'fuse-search-index');
const postsFile = path.join(cacheDir, 'processed-posts.json');

if (!fs.existsSync(postsFile)) {
  console.error('Cache not found. Run a build first: npm run build');
  process.exit(1);
}

const posts = JSON.parse(fs.readFileSync(postsFile, 'utf-8'));
console.log(`Loaded ${posts.length} posts from cache\n`);

const Fuse = require('fuse.js');

// Configuration WITH body (original)
const optionsWithBody = {
  keys: ["tags", "categories", "title", "body"],
  includeScore: true,
  threshold: 0.55,
  ignoreLocation: true,
  findAllMatches: true,
  minMatchCharLength: 2,
};

// Test various configurations WITHOUT body
const testConfigs = [
  {
    name: "Current (0.5, weights)",
    config: {
      keys: [
        { name: "tags", weight: 0.7 },
        { name: "categories", weight: 0.7 },
        { name: "title", weight: 0.6 }
      ],
      threshold: 0.5,
      includeScore: true,
      ignoreLocation: true,
      findAllMatches: true,
      minMatchCharLength: 2,
    }
  },
  {
    name: "Higher threshold (0.6, weights)",
    config: {
      keys: [
        { name: "tags", weight: 0.7 },
        { name: "categories", weight: 0.7 },
        { name: "title", weight: 0.6 }
      ],
      threshold: 0.6,
      includeScore: true,
      ignoreLocation: true,
      findAllMatches: true,
      minMatchCharLength: 2,
    }
  },
  {
    name: "Lower threshold (0.4, weights)",
    config: {
      keys: [
        { name: "tags", weight: 0.7 },
        { name: "categories", weight: 0.7 },
        { name: "title", weight: 0.6 }
      ],
      threshold: 0.4,
      includeScore: true,
      ignoreLocation: true,
      findAllMatches: true,
      minMatchCharLength: 2,
    }
  },
  {
    name: "Higher tag weight (0.5, tags:0.9)",
    config: {
      keys: [
        { name: "tags", weight: 0.9 },
        { name: "categories", weight: 0.7 },
        { name: "title", weight: 0.4 }
      ],
      threshold: 0.5,
      includeScore: true,
      ignoreLocation: true,
      findAllMatches: true,
      minMatchCharLength: 2,
    }
  },
  {
    name: "No weights (0.55, original threshold)",
    config: {
      keys: ["tags", "categories", "title"],
      threshold: 0.55,
      includeScore: true,
      ignoreLocation: true,
      findAllMatches: true,
      minMatchCharLength: 2,
    }
  },
];

function getRelatedPosts(fuse, post) {
  if (!post.tags || !post.categories) return [];
  
  const searchValue = `${post.tags.join(" ")} ${post.categories.join(" ")}`;
  return fuse
    .search(searchValue, { limit: 4 })
    .filter((result) => result.item.permalink !== post.permalink)
    .slice(0, 3);
}

function analyzeConfiguration(configName, fuseInstance, baselineResults) {
  let exactMatches = 0;
  let partialMatches = 0;
  let noMatches = 0;
  let postsWithNoResults = 0;
  let postsLostResults = 0;
  let totalPosts = 0;
  let totalResultsFound = 0;
  
  const details = [];
  
  posts.forEach(post => {
    if (!post.tags || !post.categories) return;
    
    totalPosts++;
    const newResults = getRelatedPosts(fuseInstance, post);
    const baselineData = baselineResults[post.permalink];
    
    totalResultsFound += newResults.length;
    
    // Check if this post now has no results
    if (newResults.length === 0) {
      postsWithNoResults++;
      if (baselineData && baselineData.length > 0) {
        postsLostResults++;
        details.push({
          permalink: post.permalink,
          title: post.title,
          issue: 'LOST_RESULTS',
          baseline: baselineData.length,
          current: 0
        });
      }
    }
    
    if (!baselineData) return;
    
    const baselinePermalinks = baselineData.map(r => r.permalink);
    const newPermalinks = newResults.map(r => r.item.permalink);
    
    const matchCount = baselinePermalinks.filter(p => newPermalinks.includes(p)).length;
    
    if (matchCount === baselinePermalinks.length && baselinePermalinks.length === newPermalinks.length) {
      exactMatches++;
    } else if (matchCount > 0) {
      partialMatches++;
    } else if (newResults.length > 0) {
      noMatches++;
    }
  });
  
  return {
    exactMatches,
    partialMatches,
    noMatches,
    postsWithNoResults,
    postsLostResults,
    totalPosts,
    avgResultsPerPost: (totalResultsFound / totalPosts).toFixed(2),
    exactMatchPercent: ((exactMatches / totalPosts) * 100).toFixed(1),
    partialMatchPercent: ((partialMatches / totalPosts) * 100).toFixed(1),
    noMatchPercent: ((noMatches / totalPosts) * 100).toFixed(1),
    noResultsPercent: ((postsWithNoResults / totalPosts) * 100).toFixed(1),
    lostResultsPercent: ((postsLostResults / totalPosts) * 100).toFixed(1),
    details: details.slice(0, 5) // Top 5 issues
  };
}

console.log('Building baseline with body field...');
const fuseWithBody = new Fuse(posts, optionsWithBody);

// Get baseline results
const baselineResults = {};
posts.forEach(post => {
  if (post.tags && post.categories) {
    const results = getRelatedPosts(fuseWithBody, post);
    baselineResults[post.permalink] = results.map(r => ({
      permalink: r.item.permalink,
      title: r.item.title,
      score: r.score
    }));
  }
});

// Count baseline stats
let baselineWithResults = 0;
let baselineTotalResults = 0;
Object.values(baselineResults).forEach(results => {
  if (results.length > 0) baselineWithResults++;
  baselineTotalResults += results.length;
});

console.log('\n' + '='.repeat(80));
console.log('BASELINE (WITH BODY FIELD)');
console.log('='.repeat(80));
console.log(`Posts with related posts: ${baselineWithResults}/${Object.keys(baselineResults).length}`);
console.log(`Total related post links: ${baselineTotalResults}`);
console.log(`Average per post: ${(baselineTotalResults / Object.keys(baselineResults).length).toFixed(2)}`);

// Test each configuration
console.log('\n' + '='.repeat(80));
console.log('TESTING CONFIGURATIONS WITHOUT BODY FIELD');
console.log('='.repeat(80));

const results = {};
testConfigs.forEach((testConfig, idx) => {
  console.log(`\n[${idx + 1}/${testConfigs.length}] Testing: ${testConfig.name}...`);
  const fuse = new Fuse(posts, testConfig.config);
  results[testConfig.name] = analyzeConfiguration(testConfig.name, fuse, baselineResults);
});

// Print comparison table
console.log('\n' + '='.repeat(100));
console.log('DETAILED COMPARISON');
console.log('='.repeat(100));
console.log('Config                          | Exact | Partial | NoMatch | NoResults | LostResults | Avg/Post');
console.log('-'.repeat(100));

Object.entries(results).forEach(([name, stats]) => {
  const score = stats.exactMatches * 3 + stats.partialMatches * 2 - stats.postsLostResults * 5;
  console.log(
    `${name.padEnd(31)} | ` +
    `${stats.exactMatchPercent.toString().padStart(5)}% | ` +
    `${stats.partialMatchPercent.toString().padStart(7)}% | ` +
    `${stats.noMatchPercent.toString().padStart(7)}% | ` +
    `${stats.noResultsPercent.toString().padStart(9)}% | ` +
    `${stats.lostResultsPercent.toString().padStart(11)}% | ` +
    `${stats.avgResultsPerPost.toString().padStart(8)} | Score: ${score}`
  );
});

// Find best configuration
const bestConfig = Object.entries(results).reduce((best, [name, stats]) => {
  const score = stats.exactMatches * 3 + stats.partialMatches * 2 - stats.postsLostResults * 5;
  const bestScore = best.score;
  return score > bestScore ? { name, stats, score } : best;
}, { name: '', stats: null, score: -Infinity });

console.log('\n' + '='.repeat(100));
console.log('RECOMMENDATION');
console.log('='.repeat(100));
console.log(`Best configuration: ${bestConfig.name}`);
console.log(`  Exact matches:     ${bestConfig.stats.exactMatchPercent}%`);
console.log(`  Partial matches:   ${bestConfig.stats.partialMatchPercent}%`);
console.log(`  Posts lost results: ${bestConfig.stats.postsLostResults} (${bestConfig.stats.lostResultsPercent}%)`);
console.log(`  Avg results/post:  ${bestConfig.stats.avgResultsPerPost}`);

if (bestConfig.stats.details.length > 0) {
  console.log('\nPosts that lost related content:');
  bestConfig.stats.details.forEach(d => {
    console.log(`  - ${d.title}`);
    console.log(`    ${d.permalink}`);
    console.log(`    Had ${d.baseline} results, now has ${d.current}`);
  });
}

console.log('\n' + '='.repeat(100));

/**
 * Performance profiling utilities for tracking build performance.
 * Helps identify bottlenecks in the rendering pipeline.
 */

import { writeFileSync, appendFileSync, existsSync, mkdirSync } from "fs";
import { join } from "path";

const PROFILE_DIR = join(process.cwd(), ".cache", "perf-profile");
const PROFILE_FILE = join(PROFILE_DIR, "profile.json");
const LOG_FILE = join(PROFILE_DIR, "profile.log");

interface TimingEntry {
  name: string;
  duration: number;
  timestamp: number;
  metadata?: any;
}

let timings: TimingEntry[] = [];
let activeTimers: Map<string, number> = new Map();

/**
 * Initialize profiling (clear previous data)
 */
export function initProfiling(): void {
  if (!existsSync(PROFILE_DIR)) {
    mkdirSync(PROFILE_DIR, { recursive: true });
  }
  
  timings = [];
  activeTimers.clear();
  
  // Clear log file
  writeFileSync(LOG_FILE, `Performance Profile Started: ${new Date().toISOString()}\n\n`);
  
  console.log("[PERF] Performance profiling enabled");
}

/**
 * Start timing an operation
 */
export function startTiming(name: string): void {
  activeTimers.set(name, performance.now());
}

/**
 * End timing an operation and record it
 */
export function endTiming(name: string, metadata?: any): void {
  const startTime = activeTimers.get(name);
  if (startTime === undefined) {
    console.warn(`[PERF] No start time found for: ${name}`);
    return;
  }
  
  const duration = performance.now() - startTime;
  activeTimers.delete(name);
  
  const entry: TimingEntry = {
    name,
    duration,
    timestamp: Date.now(),
    metadata,
  };
  
  timings.push(entry);
  
  // Log to console and file
  const logMsg = `[PERF] ${name}: ${duration.toFixed(2)}ms`;
  console.log(logMsg);
  appendFileSync(LOG_FILE, `${logMsg}\n`);
}

/**
 * Time a synchronous function
 */
export function timeSync<T>(name: string, fn: () => T, metadata?: any): T {
  startTiming(name);
  try {
    return fn();
  } finally {
    endTiming(name, metadata);
  }
}

/**
 * Time an async function
 */
export async function timeAsync<T>(
  name: string,
  fn: () => Promise<T>,
  metadata?: any,
): Promise<T> {
  startTiming(name);
  try {
    return await fn();
  } finally {
    endTiming(name, metadata);
  }
}

/**
 * Save profiling data to disk
 */
export function saveProfiling(): void {
  if (timings.length === 0) {
    return;
  }
  
  // Calculate statistics
  const stats = calculateStats();
  
  const report = {
    timestamp: new Date().toISOString(),
    totalTimings: timings.length,
    stats,
    timings,
  };
  
  writeFileSync(PROFILE_FILE, JSON.stringify(report, null, 2));
  
  // Write summary to log
  appendFileSync(LOG_FILE, `\n${"=".repeat(80)}\n`);
  appendFileSync(LOG_FILE, `PERFORMANCE SUMMARY\n`);
  appendFileSync(LOG_FILE, `${"=".repeat(80)}\n\n`);
  
  Object.entries(stats).forEach(([name, stat]) => {
    appendFileSync(
      LOG_FILE,
      `${name}:\n  Count: ${stat.count}\n  Total: ${stat.total.toFixed(2)}ms\n  Avg: ${stat.avg.toFixed(2)}ms\n  Min: ${stat.min.toFixed(2)}ms\n  Max: ${stat.max.toFixed(2)}ms\n\n`,
    );
  });
  
  console.log(`[PERF] Profile saved to ${PROFILE_FILE}`);
  console.log(`[PERF] Log saved to ${LOG_FILE}`);
}

/**
 * Calculate statistics for each operation
 */
function calculateStats(): Record<string, any> {
  const grouped = new Map<string, number[]>();
  
  timings.forEach((entry) => {
    if (!grouped.has(entry.name)) {
      grouped.set(entry.name, []);
    }
    grouped.get(entry.name)!.push(entry.duration);
  });
  
  const stats: Record<string, any> = {};
  
  grouped.forEach((durations, name) => {
    const total = durations.reduce((sum, d) => sum + d, 0);
    const avg = total / durations.length;
    const min = Math.min(...durations);
    const max = Math.max(...durations);
    
    stats[name] = {
      count: durations.length,
      total,
      avg,
      min,
      max,
    };
  });
  
  return stats;
}

/**
 * Create a wrapper for rehype/remark plugins to time their execution
 */
export function timePlugin(pluginName: string, plugin: any): any {
  return function timedPlugin(...args: any[]) {
    const result = plugin(...args);
    
    // If the plugin returns a transformer function, wrap that too
    if (typeof result === 'function') {
      return function timedTransformer(tree: any, file: any) {
        startTiming(`plugin:${pluginName}`);
        try {
          const transformResult = result(tree, file);
          
          // Handle async transformers
          if (transformResult && typeof transformResult.then === 'function') {
            return transformResult.finally(() => {
              endTiming(`plugin:${pluginName}`);
            });
          }
          
          endTiming(`plugin:${pluginName}`);
          return transformResult;
        } catch (error) {
          endTiming(`plugin:${pluginName}`);
          throw error;
        }
      };
    }
    
    return result;
  };
}

// Auto-save on process exit
process.on('exit', () => {
  saveProfiling();
});

process.on('SIGINT', () => {
  saveProfiling();
  process.exit();
});

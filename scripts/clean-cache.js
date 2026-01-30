#!/usr/bin/env node

/**
 * Cross-platform script to clean the Fuse search index cache before builds.
 * This ensures each build starts with a fresh cache.
 */

import { rmSync, existsSync } from "fs";
import { join } from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const cacheDir = join(__dirname, "..", ".cache", "fuse-search-index");

if (existsSync(cacheDir)) {
  console.log("[Clean] Removing Fuse search index cache...");
  rmSync(cacheDir, { recursive: true, force: true });
  console.log("[Clean] Cache removed successfully");
} else {
  console.log("[Clean] No cache to remove");
}

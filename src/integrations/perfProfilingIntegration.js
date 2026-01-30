/**
 * Astro integration to enable performance profiling during builds.
 * Initializes profiling at the start and saves results at the end.
 */

import { initProfiling, saveProfiling } from "../utils/perfProfile.ts";

export default function perfProfilingIntegration() {
  return {
    name: "perf-profiling",
    hooks: {
      "astro:config:done": () => {
        console.log("[PERF] Initializing performance profiling...");
        initProfiling();
      },
      "astro:build:done": () => {
        console.log("[PERF] Build complete, saving profiling data...");
        saveProfiling();
      },
    },
  };
}

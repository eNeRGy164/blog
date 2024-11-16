import { visit } from 'unist-util-visit';

/**
 * Rehype plugin to add a configurable contributor ID to specific domains in `<a>` tags.
 *
 * This plugin processes all links (`<a>` tags) in the Markdown content, checks if the link
 * points to a specified domain, and appends a `wt.mc_id` query parameter with a provided
 * contributor ID if it is not already present.
 *
 * @param {Object} options - Configuration options for the plugin.
 * @param {string} options.contributorId - The Contributor ID to append to the URL
 *   (e.g., "AZ-MVP-5004268").
 * @param {string[]} [options.domains] - List of domains to check. Defaults to the following:
 *   - startups.microsoft.com
 *   - learn.microsoft.com
 *   - azure.microsoft.com
 *   - developer.microsoft.com
 *   - techcommunity.microsoft.com
 *   - technet.microsoft.com
 *   - code.visualstudio.com
 *   - devblogs.microsoft.com
 *   - cloudblogs.microsoft.com
 *
 * @throws Will throw an error if the `contributorId` option is not provided.
 *
 * @example
 * // Usage in Astro configuration
 * import rehypeAddMvpContributorId from './rehypeAddMvpContributorId.js';
 *
 * export default defineConfig({
 *   markdown: {
 *     rehypePlugins: [
 *       [
 *         rehypeAddMvpContributorId,
 *         {
 *           contributorId: 'AZ-MVP-5004268',
 *           domains: ['learn.microsoft.com', 'azure.microsoft.com'],
 *         },
 *       ],
 *     ],
 *   },
 * });
 *
 * @example
 * // Markdown input
 * [Microsoft Learn](https://learn.microsoft.com/dotnet/csharp/)
 *
 * // Output HTML
 * <a href="https://learn.microsoft.com/dotnet/csharp/?wt.mc_id=AZ-MVP-5004268">Microsoft Learn</a>
 *
 * @returns {function} A unified transformer function to process the Markdown AST.
 */
export default function AddMvpContributorId(options = {}) {
  const { contributorId, domains } = options;

  // Validate that a Contributor ID is provided
  if (!contributorId) {
    throw new Error('The "contributorId" option is required.');
  }

  // Default list of domains to process
  const defaultDomains = [
    'startups.microsoft.com',
    'learn.microsoft.com',
    'docs.microsoft.com',
    'azure.microsoft.com',
    'developer.microsoft.com',
    'techcommunity.microsoft.com',
    'technet.microsoft.com',
    'code.visualstudio.com',
    'devblogs.microsoft.com',
    'cloudblogs.microsoft.com',
  ];

  // Use the provided domains or fall back to the default list
  const effectiveDomains = domains || defaultDomains;

  /**
   * The unified transformer function.
   *
   * @param {Object} tree - The Markdown AST (abstract syntax tree).
   */
  return (tree) => {
    visit(tree, 'element', (node) => {
      // Only process <a> tags with an `href` attribute
      if (node.tagName === 'a' && node.properties && node.properties.href) {
        const href = node.properties.href;

        try {
          // Parse the URL using the WHATWG URL API
          const url = new URL(href);

          // Check if the hostname matches any of the specified domains
          if (effectiveDomains.some((domain) => url.hostname.endsWith(domain))) {
            // Add the contributor ID if not already present
            if (!url.searchParams.has('wt.mc_id')) {
              url.searchParams.set('wt.mc_id', contributorId);
              node.properties.href = url.toString(); // Update the href attribute
            }
          }
        } catch {
          // Skip invalid URLs (e.g., malformed or relative URLs)
        }
      }
    });
  };
}

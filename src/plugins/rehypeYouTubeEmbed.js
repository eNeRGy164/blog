import fetch from 'node-fetch';
import { visit } from 'unist-util-visit';
import { URL } from 'url';

const YOUTUBE_OEMBED_URL = 'https://www.youtube.com/oembed';

/**
 * Plugin to transform YouTube links into embed blocks with configurable width and height.
 * @param {Object} options - The options object.
 * @param {number} options.defaultWidth - The default width for the YouTube embeds if not provided. Defaults to 635.
 */
export default function YouTubeEmbed({ defaultWidth = 625 } = {}) {
  return async (tree) => {
    const promises = [];

    visit(tree, 'element', (node, index, parent) => {
      if (node.tagName === 'a' && node.properties && node.properties.href) {
        const url = node.properties.href;

        // Check if the URL is a YouTube video link (not channel, playlist, etc.)
        if (isYouTubeVideo(url)) {
          // Extract the text content of the <a> tag
          const captionText = getAnchorText(node);

          promises.push(
            createEmbedBlock(url, defaultWidth, captionText).then((embedNode) => {
              if (embedNode) {
                // Replace the <a> tag with the generated embed block
                parent.children.splice(index, 1, embedNode);
              }
            })
          );
        }
      }
    });

    await Promise.all(promises);
  };
}

/**
 * Creates an embed block for YouTube videos.
 * @param {string} url - The YouTube URL.
 * @param {number} defaultWidth - The default width for the embed.
 * @param {string|null} captionText - The content of the <a> tag (if any) to be used as a <figcaption>.
 * @returns {Promise<Object>} - The embed block node.
 */
async function createEmbedBlock(originalUrl, defaultWidth, captionText) {
  try {
    const urlObj = new URL(originalUrl);

    // Extract the video ID and allowed parameters (like list)
    const videoId = extractYouTubeID(urlObj);
    const embedUrl = `https://www.youtube-nocookie.com/embed/${videoId}`;

    // Extract and retain the necessary query parameters (e.g., 'list')
    const retainedParams = ['list']; // Add more params if needed
    const embedQueryParams = new URLSearchParams();

    retainedParams.forEach((param) => {
      if (urlObj.searchParams.has(param)) {
        embedQueryParams.set(param, urlObj.searchParams.get(param));
      }
    });

    // oEmbed request URL
    const oEmbedUrl = new URL(`${YOUTUBE_OEMBED_URL}?url=https://www.youtube.com/watch?v=${videoId}&format=json`);

    // Fetch the oEmbed data
    const response = await fetch(oEmbedUrl);
    const data = await response.json();

    // Default width and height from oEmbed, or fallback to defaultWidth
    let width = defaultWidth;  // Fallback to defaultWidth
    let height = (width * 9) / 16;  // Default to 16:9 if height is not provided

    // Check for width and height in the original URL and override if found
    if (urlObj.searchParams.has('width')) {
      width = parseInt(urlObj.searchParams.get('width'), 10);
      height = Math.round((width * 9) / 16);  // Maintain 16:9 aspect ratio
    }

    if (urlObj.searchParams.has('height')) {
      height = parseInt(urlObj.searchParams.get('height'), 10);
    }

    // Generate the block structure for the YouTube embed
    const figureChildren = [
        {
          type: 'element',
          tagName: 'iframe',
          properties: {
            allow:
              'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share',
            allowfullscreen: '',
            height: height,
            loading: 'lazy',
            referrerpolicy: 'strict-origin-when-cross-origin',
            src: `${embedUrl}?${embedQueryParams.toString()}`, // Retain allowed parameters like list
            title: data.title,
            width: width,
            itemprop: 'url',
          }
        },
        {
          type: 'element',
          tagName: 'meta',
          properties: {
            content: data.title,
            itemprop: 'name',
          }
        }
    ];

    // If caption text exists, add a <figcaption> to the figure
    if (captionText) {
      figureChildren.push({
        type: 'element',
        tagName: 'figcaption',
        children: [{ type: 'text', value: captionText }],
        properties: { itemprop: 'description' }
      });
    }

    // If thumbnail_url exists, add a <meta> tag for it
    if (data.thumbnail_url) {
      figureChildren.push({
      type: 'element',
      tagName: 'meta',
      properties: {
        content: data.thumbnail_url,
        itemprop: 'thumbnailUrl',
      }}
    );

    return {
      type: 'element',
      tagName: 'figure',
      properties: { 
        className: 'wp-shadow',
        itemprop: 'video',
        itemscope: 'itemscope',
        itemtype: 'http://schema.org/VideoObject',
      },
      children: figureChildren
    };
  }
  } catch (error) {
    console.error(`Failed to fetch oEmbed data for ${originalUrl}:`, error);
    return null;
  }
}

/**
 * Determines if the given URL is a valid YouTube video link.
 * @param {string} url - The YouTube URL.
 * @returns {boolean} - True if it's a video link, false otherwise.
 */
function isYouTubeVideo(url) {
  try {
    const urlObj = new URL(url);
    
    // Only proceed if the URL is from youtube.com, youtu.be, or youtube-nocookie.com
    const isYouTubeDomain = urlObj.hostname.includes('youtube.com') || urlObj.hostname.includes('youtu.be') || urlObj.hostname.includes('youtube-nocookie.com');
    
    if (!isYouTubeDomain) {
      return false;  // If it's not a YouTube domain, skip processing
    }
    
    // Valid video link patterns:
    const videoId = extractYouTubeID(urlObj);

    // If we found a valid video ID, it's a video link
    return Boolean(videoId);
  } catch (e) {
    return false; // Invalid URL, not a YouTube video
  }
}

/**
 * Extracts the YouTube video ID from a URL.
 * @param {URL} urlObj - The parsed YouTube URL object.
 * @returns {string|null} - The video ID or null if not found.
 */
function extractYouTubeID(urlObj) {
  // Match standard YouTube video URLs and embed URLs (including nocookie)
  const regex = /(?:youtube\.com\/(?:watch\?v=|embed\/|v\/)|youtu\.be\/|youtube-nocookie\.com\/embed\/)([a-zA-Z0-9_-]{11})/;
  const matches = urlObj.href.match(regex);

  // Return the video ID if it's a match, otherwise null
  return matches ? matches[1] : null;
}

/**
 * Extracts the text content of the <a> tag, excluding any raw URLs.
 * @param {Object} node - The <a> element node.
 * @returns {string|null} - The text content or null if it contains only the raw URL.
 */
function getAnchorText(node) {
  // Get the text content of the <a> tag
  const anchorText = node.children
    .filter((child) => child.type === 'text')
    .map((child) => child.value)
    .join('');

  // If the anchor text is just the URL, return null (no figcaption needed)
  if (anchorText.trim() === node.properties.href.trim()) {
    return null;
  }

  return anchorText.trim() || null;
}

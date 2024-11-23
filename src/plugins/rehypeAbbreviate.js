import { visit } from 'unist-util-visit';

/**
 * Plugin to wrap abbreviations with <abbr> and the first occurrence with <dfn>.
 * @param {Object} options - The options object.
 * @param {Object} options.acronyms - The acronym list { ABBR: "Description" }.
 */
export default function Abbreviate(options = {}) {
  const { acronyms } = options;

  if (!acronyms || typeof acronyms !== 'object') {
    throw new Error('The "acronyms" option must be a valid object.');
  }

  return (tree) => {
    // Reset seenAcronyms for each page/tree
    const seenAcronyms = new Set();

    visit(tree, 'text', (node, index, parent) => {
      // Skip processing if the parent node is inside a `code` or `pre` block
      let current = parent;
      while (current) {
        if (current.tagName === 'code' || current.tagName === 'pre') {
          return; // Skip this node
        }
        current = current.parent; // Traverse up the tree
      }

      // Check if the parent node is already an 'abbr' or 'dfn' tag to avoid re-processing
      if (parent.tagName === 'abbr' || parent.tagName === 'dfn') {
        return;
      }

      const textContent = node.value;

      // Array to collect matches for all acronyms
      const allMatches = [];

      // Loop through each acronym and find occurrences in the text
      Object.keys(acronyms).forEach((abbr) => {
        const regex = new RegExp(`\\b${abbr}\\b`, 'g');

        let match;
        while ((match = regex.exec(textContent)) !== null) {
          allMatches.push({
            abbr,
            description: acronyms[abbr],
            index: match.index,
            length: abbr.length
          });
        }
      });

      // If we found matches, process them
      if (allMatches.length > 0) {
        // Sort matches by their index (start position) to ensure correct processing order
        allMatches.sort((a, b) => a.index - b.index);

        // Replace the text content with new nodes
        const newNodes = [];
        let lastIndex = 0;

        allMatches.forEach(({ abbr, description, index, length }) => {
          // Push the preceding text (before the match)
          if (lastIndex !== index) {
            newNodes.push({
              type: 'text',
              value: textContent.slice(lastIndex, index)
            });
          }

          // Construct the <abbr> element
          const abbrNode = {
            type: 'element',
            tagName: 'abbr',
            properties: { title: description },
            children: [{ type: 'text', value: abbr }]
          };

          // Wrap the first occurrence with <dfn>
          if (!seenAcronyms.has(abbr)) {
            seenAcronyms.add(abbr);
            newNodes.push({
              type: 'element',
              tagName: 'dfn',
              children: [abbrNode]
            });
          } else {
            newNodes.push(abbrNode);
          }

          // Update lastIndex to after the current match
          lastIndex = index + length;
        });

        // Push the remaining text (after the last match)
        if (lastIndex < textContent.length) {
          newNodes.push({
            type: 'text',
            value: textContent.slice(lastIndex)
          });
        }

        // Replace the original text node with the new nodes
        parent.children.splice(index, 1, ...newNodes);
      }
    });
  };
}

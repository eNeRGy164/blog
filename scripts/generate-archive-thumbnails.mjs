import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const FONT_STACK = `"Segoe UI", "Segoe UI Variable", "DejaVu Sans", Arial, sans-serif`;

const palettes = {
  azure: {
    start: "#0b3d91",
    end: "#0078d4",
    card: "rgba(11, 48, 113, 0.70)",
    chip: "rgba(119, 170, 223, 0.42)",
    watermark: "rgba(122, 176, 230, 0.20)",
    bubble: "rgba(214, 230, 246, 0.32)",
  },
  csharp: {
    start: "#3d2a6e",
    end: "#7c4dff",
    card: "rgba(49, 34, 88, 0.70)",
    chip: "rgba(160, 138, 216, 0.42)",
    watermark: "rgba(176, 154, 228, 0.20)",
    bubble: "rgba(229, 222, 245, 0.30)",
  },
  docker: {
    start: "#0f3042",
    end: "#2496ed",
    card: "rgba(12, 41, 57, 0.70)",
    chip: "rgba(123, 182, 222, 0.42)",
    watermark: "rgba(132, 190, 228, 0.20)",
    bubble: "rgba(216, 235, 246, 0.31)",
  },
  dynamics: {
    start: "#4b2b6b",
    end: "#8e44ad",
    card: "rgba(60, 34, 85, 0.70)",
    chip: "rgba(166, 132, 190, 0.42)",
    watermark: "rgba(178, 146, 202, 0.20)",
    bubble: "rgba(233, 220, 242, 0.30)",
  },
  hyperv: {
    start: "#10345a",
    end: "#2f74c0",
    card: "rgba(15, 48, 83, 0.70)",
    chip: "rgba(121, 162, 205, 0.42)",
    watermark: "rgba(132, 172, 212, 0.20)",
    bubble: "rgba(216, 231, 245, 0.31)",
  },
  machinelearning: {
    start: "#1f4a32",
    end: "#5faa4a",
    card: "rgba(24, 59, 40, 0.70)",
    chip: "rgba(138, 188, 129, 0.42)",
    watermark: "rgba(151, 199, 142, 0.20)",
    bubble: "rgba(224, 238, 219, 0.30)",
  },
  office: {
    start: "#6b2b00",
    end: "#d24726",
    card: "rgba(85, 35, 0, 0.70)",
    chip: "rgba(205, 142, 122, 0.42)",
    watermark: "rgba(216, 153, 132, 0.20)",
    bubble: "rgba(245, 227, 220, 0.30)",
  },
  powershell: {
    start: "#012456",
    end: "#5391fe",
    card: "rgba(1, 32, 77, 0.70)",
    chip: "rgba(122, 163, 222, 0.42)",
    watermark: "rgba(134, 175, 231, 0.20)",
    bubble: "rgba(217, 232, 246, 0.31)",
  },
  projectserver: {
    start: "#1d3f4d",
    end: "#3f93a9",
    card: "rgba(24, 52, 64, 0.70)",
    chip: "rgba(126, 175, 189, 0.42)",
    watermark: "rgba(138, 186, 199, 0.20)",
    bubble: "rgba(218, 235, 239, 0.31)",
  },
  sql: {
    start: "#1f4f3b",
    end: "#2f9d72",
    card: "rgba(25, 63, 47, 0.70)",
    chip: "rgba(126, 186, 158, 0.42)",
    watermark: "rgba(140, 198, 170, 0.20)",
    bubble: "rgba(219, 238, 229, 0.31)",
  },
  sharepoint: {
    start: "#004b50",
    end: "#00a4aa",
    card: "rgba(0, 60, 64, 0.70)",
    chip: "rgba(108, 182, 186, 0.42)",
    watermark: "rgba(121, 194, 198, 0.20)",
    bubble: "rgba(206, 234, 235, 0.31)",
  },
  surface: {
    start: "#3a3a3a",
    end: "#7b8794",
    card: "rgba(44, 44, 44, 0.70)",
    chip: "rgba(149, 161, 173, 0.42)",
    watermark: "rgba(160, 171, 181, 0.20)",
    bubble: "rgba(229, 233, 238, 0.29)",
  },
  visualstudio: {
    start: "#3b1f66",
    end: "#68217a",
    card: "rgba(47, 24, 82, 0.70)",
    chip: "rgba(155, 126, 180, 0.42)",
    watermark: "rgba(168, 138, 193, 0.20)",
    bubble: "rgba(230, 220, 238, 0.30)",
  },
  windows: {
    start: "#0e4a7b",
    end: "#168dd9",
    card: "rgba(13, 59, 98, 0.70)",
    chip: "rgba(118, 175, 220, 0.42)",
    watermark: "rgba(130, 187, 230, 0.20)",
    bubble: "rgba(214, 233, 246, 0.31)",
  },
  windowsphone: {
    start: "#7a1f57",
    end: "#c03f8f",
    card: "rgba(96, 24, 68, 0.70)",
    chip: "rgba(190, 130, 167, 0.42)",
    watermark: "rgba(202, 142, 179, 0.20)",
    bubble: "rgba(240, 223, 233, 0.30)",
  },
  architecture: {
    start: "#5a4300",
    end: "#b7860b",
    card: "rgba(72, 54, 0, 0.70)",
    chip: "rgba(186, 163, 103, 0.42)",
    watermark: "rgba(198, 174, 114, 0.20)",
    bubble: "rgba(237, 228, 201, 0.30)",
  },
  blue: {
    start: "#133a5b",
    end: "#327eb7",
    card: "rgba(19, 53, 82, 0.70)",
    chip: "rgba(121, 165, 195, 0.42)",
    watermark: "rgba(124, 170, 202, 0.20)",
    bubble: "rgba(217, 232, 245, 0.32)",
  },
  teal: {
    start: "#0e4b5a",
    end: "#2a9d8f",
    card: "rgba(12, 64, 74, 0.70)",
    chip: "rgba(109, 180, 169, 0.42)",
    watermark: "rgba(116, 191, 180, 0.20)",
    bubble: "rgba(204, 233, 228, 0.32)",
  },
  purple: {
    start: "#4b235e",
    end: "#8a4fa6",
    card: "rgba(58, 27, 74, 0.70)",
    chip: "rgba(168, 132, 186, 0.42)",
    watermark: "rgba(184, 148, 204, 0.20)",
    bubble: "rgba(233, 220, 241, 0.30)",
  },
  amber: {
    start: "#5b3c11",
    end: "#a97822",
    card: "rgba(73, 49, 15, 0.70)",
    chip: "rgba(181, 150, 98, 0.42)",
    watermark: "rgba(193, 162, 106, 0.20)",
    bubble: "rgba(236, 222, 196, 0.30)",
  },
};

const CATEGORY_PALETTE = new Map([
  ["architecture", "architecture"],
  ["azure", "azure"],
  ["c#", "csharp"],
  ["docker", "docker"],
  ["dynamics crm", "dynamics"],
  ["hyper-v", "hyperv"],
  ["machine learning", "machinelearning"],
  ["office", "office"],
  ["powershell", "powershell"],
  ["project server", "projectserver"],
  ["sql", "sql"],
  ["sharepoint", "sharepoint"],
  ["surface", "surface"],
  ["visual studio", "visualstudio"],
  ["windows", "windows"],
  ["windows phone", "windowsphone"],
]);

function parseArgs(argv) {
  const args = new Map();
  for (let i = 0; i < argv.length; i += 1) {
    const item = argv[i];
    if (!item.startsWith("--")) continue;
    const key = item.slice(2);
    const next = argv[i + 1];
    if (!next || next.startsWith("--")) {
      args.set(key, true);
      continue;
    }
    args.set(key, next);
    i += 1;
  }
  return args;
}

function parseIncludeFilter(rawValue) {
  if (!rawValue) return null;
  const set = new Set(
    String(rawValue)
      .split(",")
      .map((item) => item.trim().replace(/\.png$/i, ""))
      .filter(Boolean),
  );
  return set.size ? set : null;
}

function normalizeCategory(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

function hashString(value) {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash * 31 + value.charCodeAt(i)) >>> 0;
  }
  return hash;
}

function charWidthRatio(ch) {
  if (ch === " ") return 0.33;
  if ("ilIjtfr".includes(ch)) return 0.3;
  if ("mwMW@#%&".includes(ch)) return 0.92;
  if ("0123456789".includes(ch)) return 0.56;
  if ("ABCDEFGHIJKLMNOPQRSTUVWXYZ".includes(ch)) return 0.64;
  if ("[](){}|/\\'\"`".includes(ch)) return 0.28;
  if (".,:;!".includes(ch)) return 0.24;
  if ("-_=+*~".includes(ch)) return 0.34;
  return 0.55;
}

function estimateTextWidth(text, fontSize) {
  let units = 0;
  for (const ch of text) units += charWidthRatio(ch);
  return units * fontSize;
}

function fitTextToWidth(text, maxWidth, fontSize, withEllipsis = true) {
  const value = String(text || "").trim();
  if (!value) return { text: "", truncated: false };
  if (estimateTextWidth(value, fontSize) <= maxWidth)
    return { text: value, truncated: false };
  const ellipsis = "...";
  const ellipsisWidth = withEllipsis
    ? estimateTextWidth(ellipsis, fontSize)
    : 0;
  let acc = "";
  for (const ch of value) {
    const next = `${acc}${ch}`;
    if (estimateTextWidth(next, fontSize) + ellipsisWidth > maxWidth) break;
    acc = next;
  }
  const trimmed = acc.trimEnd();
  const textValue = withEllipsis ? `${trimmed}${ellipsis}` : trimmed;
  return { text: textValue, truncated: true };
}

function trimToWidth(text, maxWidth, fontSize) {
  return fitTextToWidth(text, maxWidth, fontSize, true).text;
}

function appendEllipsis(text, maxWidth, fontSize) {
  const value = String(text || "").trim();
  if (!value || value.endsWith("...")) return value;
  const cleanValue = value.replace(/[.]+$/, "").trimEnd();
  const withDots = `${cleanValue}...`;
  if (estimateTextWidth(withDots, fontSize) <= maxWidth) return withDots;
  return fitTextToWidth(withDots, maxWidth, fontSize, true).text;
}

function normalizeDisplayText(text) {
  return String(text || "")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/[ \t]*[.!?:;,]+$/, "")
    .trim();
}

function compressTriggerSentence(text) {
  const original = normalizeDisplayText(text);
  let value = original;
  if (!value) return { text: "", shortened: false };
  let shortened = false;

  const replaceTracked = (pattern, replacement) => {
    const next = value.replace(pattern, replacement);
    if (next !== value) shortened = true;
    value = next;
  };

  // Prefer one concise sentence: remove asides/parentheses but keep core meaning.
  replaceTracked(/\([^)]*\)/g, " ");
  replaceTracked(
    /^\s*(in this post|this post|here)\s+(i|we)\s+(show|explain|describe)\s+/i,
    "",
  );
  replaceTracked(/\bfor over [^,.;]*\b/i, " ");
  replaceTracked(/\bfinally\b/gi, " ");
  replaceTracked(/\bhaving\b/gi, " ");
  replaceTracked(/,\s*and\s*/gi, " ");
  value = value.replace(/\s+/g, " ").trim();

  const cleanEntity = (raw) =>
    String(raw || "")
      .replace(/\b(for|while|because|which|that|where|when)\b.*$/i, "")
      .replace(/[.,;:!?]+$/g, "")
      .trim();

  const switchedMatch = value.match(
    /\bswitched to\s+(.+?)(?:\s+for\s+|\s+because\b|[.,;]|$)/i,
  );
  const issueMatch = value.match(
    /\b(problems?|issues?|errors?|failures?)\s+with\s+(.+?)(?:\s+for\s+|\s+because\b|[.,;]|$)/i,
  );
  if (switchedMatch && issueMatch) {
    const issueType = cleanEntity(issueMatch[1]).toLowerCase();
    const issueTarget = cleanEntity(issueMatch[2]);
    const switchTarget = cleanEntity(switchedMatch[1]);
    if (issueType && issueTarget && switchTarget) {
      const rebuilt = normalizeDisplayText(
        `After ${issueType} with ${issueTarget}, switched to ${switchTarget}`,
      );
      if (rebuilt !== original) shortened = true;
      return { text: rebuilt, shortened };
    }
  }

  // Keep enough detail for a meaningful 1-2 line subtitle.
  const words = value.split(/\s+/).filter(Boolean);
  if (words.length > 25) {
    value = words.slice(0, 25).join(" ");
    shortened = true;
  }

  const normalized = normalizeDisplayText(value);
  if (normalized !== original) shortened = true;
  return { text: normalized, shortened };
}

function formatSubtitleForDisplay(subtitle) {
  const text = normalizeDisplayText(subtitle?.text || "");
  if (!text) return "";
  if (subtitle?.shortened) return text.endsWith("...") ? text : `${text}...`;
  return text.endsWith(".") ? text : `${text}.`;
}

function wrapByWidth(text, maxWidth, fontSize, maxLines) {
  const words = String(text || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (!words.length) return { lines: [""], overflow: false };

  const lines = [];
  let wordIndex = 0;
  let wordWasTrimmed = false;

  while (wordIndex < words.length && lines.length < maxLines) {
    let current = "";

    while (wordIndex < words.length) {
      const wordFit = fitTextToWidth(
        words[wordIndex],
        maxWidth,
        fontSize,
        true,
      );
      const safeWord = wordFit.text;
      wordWasTrimmed ||= wordFit.truncated;

      const candidate = current ? `${current} ${safeWord}` : safeWord;
      if (estimateTextWidth(candidate, fontSize) <= maxWidth) {
        current = candidate;
        wordIndex += 1;
        continue;
      }

      if (!current) {
        current = safeWord;
        wordIndex += 1;
      }
      break;
    }

    if (!current) break;
    lines.push(current);
  }

  const overflow = wordIndex < words.length || wordWasTrimmed;
  if (overflow && lines.length) {
    lines[lines.length - 1] = appendEllipsis(
      lines[lines.length - 1],
      maxWidth,
      fontSize,
    );
  }

  return { lines: lines.slice(0, maxLines), overflow };
}

function escapeXml(text) {
  return String(text || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

function markdownToPlain(markdown) {
  let value = String(markdown || "");
  value = value.replace(/```[\s\S]*?```/g, " ");
  value = value.replace(/~~~[\s\S]*?~~~/g, " ");
  value = value.replace(/!\[[^\]]*\]\([^)]*\)/g, " ");
  value = value.replace(/\[([^\]]+)\]\(([^)]+)\)/g, "$1");
  value = value.replace(/\[([^\]]+)\]\[[^\]]*\]/g, "$1");
  value = value.replace(/^\[[^\]]+\]:\s+\S+.*$/gm, " ");
  value = value.replace(/`[^`]*`/g, " ");
  value = value.replace(/<https?:\/\/[^>]+>/g, " ");
  value = value.replace(/https?:\/\/\S+/g, " ");
  value = value.replace(/<[^>]+>/g, " ");
  value = value.replace(/^[\t ]{0,3}[#>*+-]\s?/gm, " ");
  value = value.replace(/[*_~]/g, " ");
  value = value.replace(/\s+/g, " ").trim();
  return value;
}

function unquoteYamlValue(value) {
  const text = String(value || "").trim();
  if (!text) return "";
  if (
    (text.startsWith('"') && text.endsWith('"')) ||
    (text.startsWith("'") && text.endsWith("'"))
  ) {
    return text.slice(1, -1).trim();
  }
  return text;
}

function readFrontmatterField(frontmatter, key) {
  const blockMatch = frontmatter.match(
    new RegExp(
      `^${key}:\\s*[>|]-?\\s*\\r?\\n((?:[ \\t]+.*(?:\\r?\\n|$))*)`,
      "m",
    ),
  );
  if (blockMatch && blockMatch[1]) {
    const lines = blockMatch[1]
      .split(/\r?\n/)
      .filter((line) => line.trim().length > 0);
    if (lines.length) {
      return lines
        .map((line) => line.replace(/^[ \t]+/, ""))
        .join(" ")
        .trim();
    }
  }

  const inlineMatch = frontmatter.match(new RegExp(`^${key}:\\s*(.+)$`, "m"));
  return inlineMatch ? unquoteYamlValue(inlineMatch[1]) : "";
}

function buildSubtitle(frontmatter, body) {
  const excerpt = readFrontmatterField(frontmatter, "excerpt");
  const plainBody = markdownToPlain(body);
  const plainExcerpt = markdownToPlain(excerpt);
  const source = plainExcerpt || plainBody;
  const sentences = source
    .split(/(?<=[.!?])\s+/)
    .map((line) => normalizeDisplayText(line))
    .filter(Boolean);

  const triggerRegex =
    /\b(after|because|due to|when|while|issue|problem|error|fails?|failed|broken|fixed|migrat|upgrade|support)\b/i;
  let selected =
    sentences.find((line) => triggerRegex.test(line)) ||
    sentences[0] ||
    normalizeDisplayText(source);

  selected = selected
    .replace(
      /^\s*(in this post|this post|here)\s+(i|we)\s+(show|explain|describe)\s+/i,
      "",
    )
    .replace(/^\s*(the post)\s+/i, "")
    .replace(/\s+/g, " ")
    .trim();
  return compressTriggerSentence(selected);
}

function parseFrontmatter(raw) {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!match) return { frontmatter: "", body: raw };
  return { frontmatter: match[1], body: match[2] };
}

function parseCategories(frontmatter) {
  const block = frontmatter.match(
    /^categories:\s*\r?\n((?:\s*-\s*.*\r?\n?)*)/m,
  );
  if (block && block[1].trim()) {
    return block[1]
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line.startsWith("-"))
      .map((line) => line.replace(/^-+\s*/, "").trim())
      .filter(Boolean);
  }
  const inline = frontmatter.match(/^categories:\s*\[(.*)\]\s*$/m);
  if (!inline) return [];
  return inline[1]
    .split(",")
    .map((item) => item.trim().replace(/^['"]|['"]$/g, ""))
    .filter(Boolean);
}

function pickPalette(title, categories) {
  const value = `${title} ${categories.join(" ")}`.toLowerCase();
  for (const category of categories) {
    const key = CATEGORY_PALETTE.get(normalizeCategory(category));
    if (key && palettes[key]) return palettes[key];
  }
  if (categories.length) {
    const paletteKeys = Object.keys(palettes).filter(
      (key) => key !== "amber" && key !== "purple",
    );
    const hashed = hashString(
      categories.map((item) => normalizeCategory(item)).join("|"),
    );
    const key = paletteKeys[hashed % paletteKeys.length];
    if (key && palettes[key]) return palettes[key];
  }

  // Fallback for posts with sparse/legacy categories.
  if (
    /(pitfall|warning|support ends|ends soon|access denied|prevent)/.test(value)
  )
    return palettes.amber;
  if (
    /(could not|throws|nullreference|error|inaccessible|doesn.?t|fixed)/.test(
      value,
    )
  )
    return palettes.purple;
  if (/(conference|releases|extends support|release|event)/.test(value))
    return palettes.blue;
  if (
    /(sdk|config|install|using|tutorial|running|joining|linq|surface)/.test(
      value,
    )
  )
    return palettes.teal;
  return palettes.blue;
}

function deriveChips(title, categories) {
  const chips = [];
  for (const category of categories) {
    if (chips.length >= 3) break;
    chips.push(category);
  }
  const keywords = [
    "SharePoint",
    "Project Server",
    "Hyper-V",
    "Surface",
    "WordPress",
    "LINQ",
    "C#",
    "Windows",
    "Office",
    "Silverlight",
  ];
  for (const keyword of keywords) {
    if (chips.length >= 3) break;
    if (
      new RegExp(keyword.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&"), "i").test(
        title,
      )
    ) {
      if (!chips.some((item) => item.toLowerCase() === keyword.toLowerCase()))
        chips.push(keyword);
    }
  }
  if (!chips.length) chips.push("Archive");
  return chips.slice(0, 3);
}

function createChipLayout(chips) {
  const chipY = 516;
  const fontSize = 23;
  const horizontalPadding = 16;
  const verticalPadding = 8;
  const minWidth = 64;
  const maxChipWidth = 260;
  const maxRight = 844;
  const gap = 14;
  let x = 84;
  const result = [];

  for (const chip of chips) {
    if (x > maxRight) break;
    let label = trimToWidth(
      chip,
      maxChipWidth - horizontalPadding * 2,
      fontSize,
    );
    if (!label) continue;
    let width = Math.ceil(
      estimateTextWidth(label, fontSize) + horizontalPadding * 2,
    );
    width = Math.max(minWidth, Math.min(width, maxChipWidth));

    if (x + width > maxRight) {
      const available = maxRight - x;
      if (available < minWidth) break;
      label = trimToWidth(label, available - horizontalPadding * 2, fontSize);
      width = Math.max(
        minWidth,
        Math.min(
          Math.ceil(estimateTextWidth(label, fontSize) + horizontalPadding * 2),
          available,
        ),
      );
    }

    result.push({
      x,
      y: chipY,
      w: width,
      h: Math.ceil(fontSize + verticalPadding * 2),
      text: label,
      textX: x + horizontalPadding,
      textY: chipY + verticalPadding,
      fontSize,
    });
    x += width + gap;
  }
  return result;
}

function buildSocialLayout(title, subtitle) {
  const titleBox = { x: 80, y: 138, w: 760, h: 260 };
  const subtitleBox = { x: 84, y: 390, w: 900, h: 120 };

  const titleSizes = [58, 56, 54, 52, 50, 48, 46];
  let titleLines = [trimToWidth(title, titleBox.w, 58)];
  let titleSize = 58;
  let titleLineHeight = 68;
  for (const size of titleSizes) {
    const lineHeight = Math.round(size * 1.18);
    const maxLines = Math.max(1, Math.floor(titleBox.h / lineHeight));
    const wrapped = wrapByWidth(title, titleBox.w, size, maxLines);
    const textHeight = wrapped.lines.length * lineHeight;
    if (textHeight <= titleBox.h) {
      titleLines = wrapped.lines;
      titleSize = size;
      titleLineHeight = lineHeight;
      break;
    }
  }

  const subtitleSizes = [30, 28, 26, 24, 22, 20];
  let subtitleLines = [trimToWidth(subtitle, subtitleBox.w, 30)];
  let subtitleSize = 30;
  let subtitleLineHeight = 35;
  for (const size of subtitleSizes) {
    const lineHeight = Math.round(size * 1.18);
    const maxLines = Math.max(1, Math.floor(subtitleBox.h / lineHeight));
    const wrapped = wrapByWidth(
      subtitle,
      subtitleBox.w,
      size,
      Math.min(2, maxLines),
    );
    const textHeight = wrapped.lines.length * lineHeight;
    if (textHeight <= subtitleBox.h) {
      subtitleLines = wrapped.lines;
      subtitleSize = size;
      subtitleLineHeight = lineHeight;
      break;
    }
  }

  return {
    titleLines,
    titleSize,
    titleLineHeight,
    titleStartY: titleBox.y,
    subtitleLines,
    subtitleSize,
    subtitleLineHeight,
    subtitleStartY: subtitleBox.y,
  };
}

function buildSquareLayout(title) {
  const titleWidth = 149;
  const startY = 62;
  const maxBottom = 146;
  for (let size = 18; size >= 14; size -= 1) {
    const wrap = wrapByWidth(title, titleWidth, size, 5);
    const lineHeight = Math.round(size * 1.28);
    const bottom = startY + (wrap.lines.length - 1) * lineHeight;
    if (bottom <= maxBottom) {
      return { lines: wrap.lines, size, lineHeight };
    }
  }
  return {
    lines: wrapByWidth(title, titleWidth, 14, 5).lines,
    size: 14,
    lineHeight: 18,
  };
}

function socialSvg({ title, subtitle, chips, year, palette }) {
  const textLayout = buildSocialLayout(title, subtitle);
  const chipLayout = createChipLayout(chips);
  const circles = Array.from({ length: 9 }, (_, i) => {
    const x = 760 + i * 58;
    const y = -100 + i * 22;
    return `<circle cx="${x + 130}" cy="${y + 130}" r="130" fill="rgba(255,255,255,0.314)"/>`;
  }).join("");

  const titleText = textLayout.titleLines
    .map(
      (line, i) =>
        `<text x="80" y="${textLayout.titleStartY + i * textLayout.titleLineHeight}" fill="rgba(255,255,255,0.980)" font-size="${textLayout.titleSize}" font-weight="400">${escapeXml(line)}</text>`,
    )
    .join("");
  const subtitleText = textLayout.subtitleLines
    .map(
      (line, i) =>
        `<text x="84" y="${textLayout.subtitleStartY + i * textLayout.subtitleLineHeight}" fill="rgba(255,255,255,0.804)" font-size="${textLayout.subtitleSize}" font-weight="400">${escapeXml(line)}</text>`,
    )
    .join("");
  const chipsText = chipLayout
    .map(
      (chip) =>
        `<rect x="${chip.x}" y="${chip.y}" width="${chip.w}" height="${chip.h}" rx="12" fill="rgba(255,255,255,0.227)"/>` +
        `<text x="${chip.textX}" y="${chip.textY}" fill="rgba(255,255,255,0.961)" font-size="${chip.fontSize}" font-weight="400">${escapeXml(chip.text)}</text>`,
    )
    .join("");

  return `
<svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg">
  <style>
    text { font-family: ${FONT_STACK}; dominant-baseline: text-before-edge; }
  </style>
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${palette.start}"/>
      <stop offset="100%" stop-color="${palette.end}"/>
    </linearGradient>
    <pattern id="grid" width="48" height="48" patternUnits="userSpaceOnUse">
      <path d="M 48 0 L 0 0 0 48" fill="none" stroke="rgba(255,255,255,0.165)" stroke-width="1"/>
    </pattern>
  </defs>
  <rect width="1200" height="630" fill="url(#bg)"/>
  <rect width="1200" height="630" fill="url(#grid)"/>
  ${circles}
  <rect x="42" y="42" width="1116" height="546" rx="28" fill="rgba(9,14,24,0.290)" stroke="rgba(255,255,255,0.431)" stroke-width="2"/>
  <text x="84" y="86" fill="rgba(255,255,255,0.804)" font-size="24" font-weight="400">From the ${year} archive</text>
  ${titleText}
  ${subtitleText}
  ${chipsText}
  <text x="805" y="387" fill="rgba(255,255,255,0.071)" font-size="178" font-weight="700">${year}</text>
</svg>`;
}

function squareSvg({ title, year, palette }) {
  const layout = buildSquareLayout(title);
  const titleText = layout.lines
    .map(
      (line, i) =>
        `<text x="18" y="${62 + i * layout.lineHeight}" fill="#f3f8fc" font-size="${layout.size}" font-weight="700">${escapeXml(line)}</text>`,
    )
    .join("");
  return `
<svg width="185" height="185" viewBox="0 0 185 185" xmlns="http://www.w3.org/2000/svg">
  <style>
    text { font-family: ${FONT_STACK}; dominant-baseline: text-before-edge; }
  </style>
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${palette.start}"/>
      <stop offset="100%" stop-color="${palette.end}"/>
    </linearGradient>
    <pattern id="grid" width="16" height="16" patternUnits="userSpaceOnUse">
      <path d="M 16 0 L 0 0 0 16" fill="none" stroke="rgba(255,255,255,0.165)" stroke-width="1"/>
    </pattern>
  </defs>
  <rect width="185" height="185" fill="url(#bg)"/>
  <rect width="185" height="185" fill="url(#grid)"/>
  <circle cx="154" cy="18" r="34" fill="rgba(255,255,255,0.314)"/>
  <circle cx="169" cy="26" r="26" fill="rgba(255,255,255,0.314)"/>
  <rect x="8" y="8" width="169" height="169" rx="14" fill="rgba(9,14,24,0.290)" stroke="rgba(255,255,255,0.431)" stroke-width="1.5"/>
  <text x="16" y="16" fill="rgba(255,255,255,0.804)" font-size="12">${year} archive</text>
  ${titleText}
  <text x="119" y="128" fill="rgba(255,255,255,0.071)" font-size="68" font-weight="700">${String(year).slice(2)}</text>
</svg>`;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const year = String(args.get("year") || "").trim();
  if (!/^\d{4}$/.test(year)) {
    console.error(
      "Usage: node scripts/generate-archive-thumbnails.mjs --year YYYY [--overwrite] [--include name1,name2]",
    );
    process.exit(1);
  }
  const overwrite = Boolean(args.get("overwrite"));
  const includeFilter = parseIncludeFilter(args.get("include"));
  const postsDir = path.join(process.cwd(), "posts", year);
  if (!fs.existsSync(postsDir)) {
    console.error(`Posts folder not found: ${postsDir}`);
    process.exit(1);
  }

  const files = fs
    .readdirSync(postsDir)
    .filter((file) => file.endsWith(".md"))
    .sort();

  let generatedSocial = 0;
  let generatedSquare = 0;
  let skipped = 0;

  for (const file of files) {
    const fullPath = path.join(postsDir, file);
    const raw = fs.readFileSync(fullPath, "utf8");
    const { frontmatter, body } = parseFrontmatter(raw);
    const title = normalizeDisplayText(
      readFrontmatterField(frontmatter, "title"),
    );
    const imagePath = readFrontmatterField(frontmatter, "image").trim();
    if (!title || !imagePath) continue;
    if (!/\/post-\d{4}-\d{2}-\d{2}(?:-\d+)?-thumbnail\.png$/i.test(imagePath))
      continue;
    if (includeFilter) {
      const imageName = path.basename(imagePath, ".png");
      if (!includeFilter.has(imageName)) continue;
    }

    const categories = parseCategories(frontmatter);
    const baseData = {
      title,
      subtitle: buildSubtitle(frontmatter, body),
      chips: deriveChips(title, categories),
      palette: pickPalette(title, categories),
    };
    const resolvedData = baseData;
    const subtitle = formatSubtitleForDisplay(resolvedData.subtitle);
    const palette = resolvedData.palette;
    const chips = resolvedData.chips;

    const socialPath = path.join(process.cwd(), imagePath.replace(/^\//, ""));
    const squarePath = socialPath.replace(/\.png$/i, "-185x185.png");

    fs.mkdirSync(path.dirname(socialPath), { recursive: true });

    if (overwrite || !fs.existsSync(socialPath)) {
      const social = socialSvg({
        title: resolvedData.title,
        subtitle,
        chips,
        year,
        palette,
      });
      await sharp(Buffer.from(social))
        .png({ compressionLevel: 9 })
        .toFile(socialPath);
      generatedSocial += 1;
    } else {
      skipped += 1;
    }

    if (overwrite || !fs.existsSync(squarePath)) {
      const square = squareSvg({ title: resolvedData.title, year, palette });
      await sharp(Buffer.from(square))
        .png({ compressionLevel: 9 })
        .toFile(squarePath);
      generatedSquare += 1;
    }
  }

  console.log(`Year: ${year}`);
  console.log(`Social generated: ${generatedSocial}`);
  console.log(`Square generated: ${generatedSquare}`);
  console.log(`Skipped existing socials: ${skipped}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

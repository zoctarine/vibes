/**
 * Website to Markdown Flattener
 * 
 * This script crawls a website starting from a root URL and converts all pages
 * into a single Markdown document, preserving the hierarchical structure.
 * 
 * Features:
 * - Crawls links within the same domain
 * - Converts HTML content to Markdown
 * - Uses Reading Mode-like extraction to focus on main content
 * - Preserves links as local anchors within the document
 * - Handles page titles as headers
 * - Supports custom depth for crawling
 * - Two modes: flat (sections at end) or nested (inline content)
 * 
 * Usage:
 * 1. Install dependencies: npm install puppeteer turndown cheerio @mozilla/readability jsdom
 * 2. Run: node index.js <root-url> <max-depth> <output-file> [--mode=nested|flat]
 */

const puppeteer = require('puppeteer');
const fs = require('fs');
const TurndownService = require('turndown');
const cheerio = require('cheerio');
const { URL } = require('url');
const path = require('path');
const { Readability } = require('@mozilla/readability');
const { JSDOM } = require('jsdom');

// Configuration
const DEFAULT_OUTPUT_FILE = 'flattened-doc.md';
const DEFAULT_MAX_DEPTH = 2;
const DEFAULT_MODE = 'flat'; // 'flat' or 'nested'

// Added global variables for tracking progress
let totalProcessedPages = 0;
let lastProgressUpdate = Date.now();
const PROGRESS_UPDATE_INTERVAL = 5000; // Update file every 5 seconds

// Parse command line arguments
const args = process.argv.slice(2);
const rootUrl = args[0];
const maxDepth = args[1] ? parseInt(args[1]) : DEFAULT_MAX_DEPTH;
const outputFile = args[2] || DEFAULT_OUTPUT_FILE;

// Check for mode flag (--mode=nested or --mode=flat)
let mode = DEFAULT_MODE;
args.forEach(arg => {
  if (arg.startsWith('--mode=')) {
    const requestedMode = arg.split('=')[1].toLowerCase();
    if (['nested', 'flat'].includes(requestedMode)) {
      mode = requestedMode;
    }
  }
});

if (!rootUrl) {
  console.error('Please provide a root URL to crawl');
  console.error('Usage: node website-to-markdown.js <root-url> [max-depth] [output-file] [--mode=nested|flat]');
  process.exit(1);
}

console.log(`Mode: ${mode} (${mode === 'nested' ? 'content will be nested inline' : 'content will be flat at the end'})`);


// Store a single browser instance
let browser;

/**
 * Initialize the browser
 */
async function initBrowser() {
  if (!browser) {
    console.log('Initializing browser...');
    browser = await puppeteer.launch({ 
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox'] 
    });
  }
  return browser;
}

/**
 * Close the browser when we're done
 */
async function closeBrowser() {
  if (browser) {
    console.log('Closing browser...');
    await browser.close();
    browser = null;
  }
}

// Initialize Turndown for HTML to Markdown conversion
const turndownService = new TurndownService({
  headingStyle: 'atx',
  codeBlockStyle: 'fenced'
});

// Add GitHub-flavored Markdown support
// Note: We can't use rules directly as plugins, so we'll just configure tables and strikethrough
turndownService.addRule('tableCell', {
  filter: ['th', 'td'],
  replacement: function (content, node) {
    return cell(content, node) 
  }
});

turndownService.addRule('strikethrough', {
  filter: ['del', 's', 'strike'],
  replacement: function (content) {
    return '~~' + content + '~~'
  }
});

// Keep track of visited URLs to avoid duplicates
const visitedUrls = new Set();

// Store content in a map where keys are URLs and values are page content
const pageContents = new Map();

// Store URL to anchor mapping
const urlToAnchor = new Map();

// Store the TOC structure
const tocEntries = [];

// Store parent-child relationships for nested mode
const linkRelationships = new Map(); // key: child URL, value: parent URL
const urlToLinks = new Map();        // key: URL, value: array of links found on that page

// Helper function for table cells
function cell(content, node) {
  const index = Array.prototype.indexOf.call(node.parentNode.childNodes, node)
  const prefix = ' '
  let character = '|'
  return prefix + character + ' ' + content + ' '
}

/**
 * Generate a valid anchor ID from a title
 */
function generateAnchorId(title) {
  return title
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-');
}

/**
 * Process a single URL, extract content and find links
 */
async function processUrl(url, baseUrl, currentDepth, parentUrl = null) {
  if (currentDepth > maxDepth || visitedUrls.has(url)) {
    // If we've visited this URL before but this is a new parent reference, still record the relationship
    if (parentUrl && !linkRelationships.has(url)) {
      linkRelationships.set(url, parentUrl);
    }
    return [];
  }

  console.log(`Processing (depth ${currentDepth}): ${url}`);
  visitedUrls.add(url);
  
  // Record parent-child relationship for nested mode
  if (parentUrl) {
    linkRelationships.set(url, parentUrl);
  }

  try {
    // Get the shared browser instance
    const sharedBrowser = await initBrowser();
    
    // Create a new page in the existing browser
    const page = await sharedBrowser.newPage();
    
    try {
      // Set a timeout for navigation to avoid hanging
      await page.setDefaultNavigationTimeout(30000);
      
      // Navigate to URL
      await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });

      // Get page title
      const title = await page.title();

      // Generate anchor ID for this page
      const anchorId = generateAnchorId(title || new URL(url).pathname);
      urlToAnchor.set(url, anchorId);

      // Add to TOC
      tocEntries.push({
        url,
        title: title || url,
        depth: currentDepth,
        anchorId
      });

      // Get HTML content
      const html = await page.content();
      
      // Parse HTML with cheerio
      const $ = cheerio.load(html);
      
      // Remove unnecessary elements
      $('script, style, nav, footer, header, .sidebar, .navigation, .ads, .comments').remove();
      
      // Use Readability for smart content extraction
      const dom = new JSDOM($.html());
      const reader = new Readability(dom.window.document);
      const article = reader.parse();
      let content = article ? article.content : $('body').html();
      
      // Convert HTML to Markdown
      let markdown = turndownService.turndown(content);
      
      // Store content in the map
      pageContents.set(url, {
        title: title || url,
        markdown,
        anchorId
      });
      
      // Find all links on the page
      const links = await page.evaluate(() => {
        return Array.from(document.querySelectorAll('a[href]'))
          .map(a => a.href);
      });
      
      // Filter links to keep only those from the same domain
      const baseUrlObj = new URL(baseUrl);
      const urlsToVisit = links
        .filter(link => {
          try {
            const linkUrl = new URL(link);
            return linkUrl.hostname === baseUrlObj.hostname && 
                  !link.includes('#') && 
                  !visitedUrls.has(link) &&
                  !link.endsWith('.pdf') &&
                  !link.endsWith('.zip') &&
                  !link.endsWith('.png') &&
                  !link.endsWith('.jpg') &&
                  !link.endsWith('.jpeg') &&
                  !link.endsWith('.gif');
          } catch (e) {
            return false;
          }
        });
      
      // Store links found on this page (for nested mode)
      urlToLinks.set(url, urlsToVisit);
      
      // Close the page when done but keep the browser open
      await page.close();
      
      // Update progress count and possibly write to file
      totalProcessedPages++;
      const currentTime = Date.now();
      if (currentTime - lastProgressUpdate > PROGRESS_UPDATE_INTERVAL) {
        await updateOutputFile();
        lastProgressUpdate = currentTime;
      }

      // Process each link with limited concurrency
      const concurrencyLimit = 3; // Process 3 pages at a time
      const results = [];
      
      for (let i = 0; i < urlsToVisit.length; i += concurrencyLimit) {
        const batch = urlsToVisit.slice(i, i + concurrencyLimit);
        const batchPromises = batch.map(link => 
          processUrl(link, baseUrl, currentDepth + 1, url)
        );
        const batchResults = await Promise.all(batchPromises);
        results.push(...batchResults);
      }
      
      return urlsToVisit;
    } catch (error) {
      console.error(`Error processing ${url}:`, error.message);
      // Close the page on error
      await page.close();
      return [];
    }
  } catch (error) {
    console.error(`Browser error processing ${url}:`, error.message);
    return [];
  }
}

/**
 * Update the output file with current progress
 */
async function updateOutputFile() {
  console.log(`Updating output file with ${totalProcessedPages} processed pages...`);
  try {
    // Generate the current markdown content
    let currentMarkdown = '# Flattened Documentation (In Progress)\n\n';
    currentMarkdown += `*Last updated: ${new Date().toLocaleString()} - ${totalProcessedPages} pages processed*\n\n`;
    
    // Add table of contents for current pages
    currentMarkdown += '## Table of Contents (Current Progress)\n\n';
    currentMarkdown += generateTOC();
    currentMarkdown += '\n\n';
    
    // Add content based on selected mode
    if (mode === 'flat') {
      currentMarkdown += generateFlatContent();
    } else { // nested mode
      currentMarkdown += generateNestedContent();
    }
    
    // Write to file
    fs.writeFileSync(outputFile, currentMarkdown);
    
  } catch (error) {
    console.error('Error updating output file:', error.message);
  }
}

/**
 * Replace all URLs in markdown with local anchors
 */
function replaceUrlsWithAnchors(markdown) {
  let result = markdown;
  
  urlToAnchor.forEach((anchorId, url) => {
    // Replace markdown links [text](url) with [text](#anchor)
    const linkRegex = new RegExp(`\\[([^\\]]+)\\]\\(${escapeRegExp(url)}[^)]*\\)`, 'g');
    result = result.replace(linkRegex, (match, text) => `[${text}](#${anchorId})`);
  });
  
  return result;
}

/**
 * Escape special regex characters in a string
 */
function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Generate table of contents
 */
function generateTOC() {
  if (mode === 'flat') {
    // For flat mode, just list all pages in order of depth
    return tocEntries
      .sort((a, b) => a.depth - b.depth)
      .map(entry => {
        const indent = '  '.repeat(entry.depth - 1);
        return `${indent}- [${entry.title}](#${entry.anchorId})`;
      })
      .join('\n');
  } else {
    // For nested mode, create a hierarchical TOC based on parent-child relationships
    const rootEntries = tocEntries.filter(entry => !linkRelationships.has(entry.url));
    
    function generateNestedTOC(entries) {
      let result = '';
      for (const entry of entries) {
        const indent = '  '.repeat(entry.depth - 1);
        result += `${indent}- [${entry.title}](#${entry.anchorId})\n`;
        
        // Find children of this entry
        const childEntries = tocEntries.filter(child => 
          linkRelationships.has(child.url) && 
          linkRelationships.get(child.url) === entry.url
        );
        
        if (childEntries.length > 0) {
          result += generateNestedTOC(childEntries);
        }
      }
      return result;
    }
    
    return generateNestedTOC(rootEntries);
  }
}

/**
 * Generate content for flat mode (all pages as sections at the end)
 */
function generateFlatContent() {
  let result = '';
  tocEntries.forEach(entry => {
    const pageContent = pageContents.get(entry.url);
    if (pageContent) {
      result += `\n\n## ${pageContent.title} {#${pageContent.anchorId}}\n\n`;
      result += replaceUrlsWithAnchors(pageContent.markdown);
    }
  });
  return result;
}

/**
 * Generate content for nested mode (content appears where links are found)
 */
function generateNestedContent() {
  // Start with the root pages (those that aren't children of any other page)
  const rootEntries = tocEntries.filter(entry => !linkRelationships.has(entry.url));
  
  function processNestedPage(entry, headerLevel = 2) {
    let result = '';
    const pageContent = pageContents.get(entry.url);
    
    if (pageContent) {
      // Add this page's content with the appropriate header level
      const headerMarker = '#'.repeat(Math.min(headerLevel, 6));
      result += `\n\n${headerMarker} ${pageContent.title} {#${pageContent.anchorId}}\n\n`;
      
      // Get the content of this page
      let pageMarkdown = pageContent.markdown;
      
      // Find links in this page
      const childLinks = urlToLinks.get(entry.url) || [];
      
      // For each link in this page, find where it appears in the markdown
      for (const childLink of childLinks) {
        if (visitedUrls.has(childLink)) {
          const childAnchorId = urlToAnchor.get(childLink);
          const childContent = pageContents.get(childLink);
          
          if (childContent) {
            // Find where this link appears in the markdown
            const linkRegex = new RegExp(`\\[([^\\]]+)\\]\\(${escapeRegExp(childLink)}[^)]*\\)`, 'g');
            
            // Replace the link with the link followed by the content
            pageMarkdown = pageMarkdown.replace(linkRegex, (match, text) => {
              // Keep the original link but make it point to the local anchor
              const localLink = `[${text}](#${childAnchorId})`;
              
              // Add the nested content
              const nestedContent = processNestedPage({
                url: childLink,
                title: childContent.title,
                anchorId: childAnchorId
              }, headerLevel + 1);
              
              return `${localLink}\n\n${nestedContent}`;
            });
          }
        }
      }
      
      // Add the processed content with remaining links converted to local anchors
      result += replaceUrlsWithAnchors(pageMarkdown);
    }
    
    return result;
  }
  
  // Process all root pages
  let result = '';
  for (const rootEntry of rootEntries) {
    result += processNestedPage(rootEntry);
  }
  
  return result;
}

/**
 * Main function to crawl the website and generate markdown
 */
async function main() {
  console.log(`Starting to crawl ${rootUrl} with max depth ${maxDepth}`);
  
  try {
    // Create an initial empty output file
    fs.writeFileSync(outputFile, '# Flattened Documentation (Starting)\n\n*Crawling in progress...*\n\n');
    
    // Process the root URL and recursively all links
    await processUrl(rootUrl, rootUrl, 1);
    
    console.log(`Found ${visitedUrls.size} pages.`);
    
    // Generate the final markdown content with complete status
    let finalMarkdown = '# Flattened Documentation (Complete)\n\n';
    finalMarkdown += `*Completed: ${new Date().toLocaleString()} - ${totalProcessedPages} pages processed*\n\n`;
    
    // Add table of contents
    finalMarkdown += '## Table of Contents\n\n';
    finalMarkdown += generateTOC();
    finalMarkdown += '\n\n';
    
    // Add content based on selected mode
    if (mode === 'flat') {
      finalMarkdown += generateFlatContent();
    } else { // nested mode
      finalMarkdown += generateNestedContent();
    }
    
    // Write to file
    fs.writeFileSync(outputFile, finalMarkdown);
    
    console.log(`Markdown saved to ${outputFile} using ${mode} mode`);
  } finally {
    // Make sure to close the browser when done
    await closeBrowser();
  }
}

main()
  .catch(error => {
    console.error('Error:', error);
    // Close browser on error too
    closeBrowser().then(() => process.exit(1));
  });
// Import all template files statically
import title from './templates/title.md?raw';
import segment from './templates/segment.md?raw';
import summary from './templates/summary.md?raw';

// Version 1 templates
import v1Title from './templates/v1/title.md?raw';
import v1Segment from './templates/v1/segment.md?raw';
import v1Summary from './templates/v1/summary.md?raw';

// Version 2 templates
import v2Title from './templates/v2/title.md?raw';
import v2Segment from './templates/v2/segment.md?raw';
import v2Summary from './templates/v2/summary.md?raw';

// Export all templates as a single object
export const templates = {
  // Base templates
  'title': title,
  'segment': segment,
  'summary': summary,
  
  // V1 templates
  'v1/title.md': v1Title,
  'v1/segment.md': v1Segment,
  'v1/summary.md': v1Summary,
  
  // V2 templates
  'v2/title.md': v2Title,
  'v2/segment.md': v2Segment,
  'v2/summary.md': v2Summary,
};
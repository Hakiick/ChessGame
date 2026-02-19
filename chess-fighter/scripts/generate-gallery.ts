import * as fs from 'fs';
import * as path from 'path';

const SCREENSHOTS_DIR = path.join(__dirname, '..', 'screenshots');
const OUTPUT_FILE = path.join(__dirname, '..', 'SCREENSHOTS.md');

function generateGallery() {
  if (!fs.existsSync(SCREENSHOTS_DIR)) {
    console.log('No screenshots directory found.');
    return;
  }

  const files = fs
    .readdirSync(SCREENSHOTS_DIR)
    .filter((f) => f.endsWith('.png'))
    .sort();

  if (files.length === 0) {
    console.log('No screenshots found.');
    return;
  }

  // Group by scene (prefix before the viewport name)
  const groups = new Map<string, string[]>();
  for (const file of files) {
    // e.g., "01-landing-mobile.png" → scene "01-landing"
    const parts = file.replace('.png', '').split('-');
    const viewport = parts[parts.length - 1]; // mobile, tablet, desktop
    const scene = parts.slice(0, -1).join('-');
    if (!groups.has(scene)) {
      groups.set(scene, []);
    }
    groups.get(scene)!.push(file);
  }

  let md = '# Chess Fighter — Screenshots Gallery\n\n';
  md += `> Auto-generated on ${new Date().toISOString().split('T')[0]}\n`;
  md += `> ${files.length} screenshots captured\n\n`;

  for (const [scene, sceneFiles] of groups) {
    const title = scene
      .replace(/^\d+-/, '')
      .replace(/-/g, ' ')
      .replace(/\b\w/g, (c) => c.toUpperCase());

    md += `## ${title}\n\n`;
    md += '| Mobile (375px) | Tablet (768px) | Desktop (1440px) |\n';
    md += '|:-:|:-:|:-:|\n';

    const mobile = sceneFiles.find((f) => f.includes('mobile'));
    const tablet = sceneFiles.find((f) => f.includes('tablet'));
    const desktop = sceneFiles.find((f) => f.includes('desktop'));

    const cell = (f?: string) => (f ? `![${scene}](screenshots/${f})` : '-');
    md += `| ${cell(mobile)} | ${cell(tablet)} | ${cell(desktop)} |\n\n`;
  }

  fs.writeFileSync(OUTPUT_FILE, md);
  console.log(`Gallery generated: ${OUTPUT_FILE} (${files.length} screenshots, ${groups.size} scenes)`);
}

generateGallery();

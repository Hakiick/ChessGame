import { execSync, execFileSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const require = createRequire(import.meta.url);

// Resolve ffmpeg path from ffmpeg-static
let FFMPEG: string;
try {
  FFMPEG = require('ffmpeg-static') as string;
} catch {
  FFMPEG = 'ffmpeg';
}

const PROJECT_DIR = path.join(__dirname, '..');
const DEMO_DIR = path.join(PROJECT_DIR, 'demo');
const CLIPS_DIR = path.join(DEMO_DIR, 'clips');
const OUTPUT_FILE = path.join(DEMO_DIR, 'chess-fighter-demo.mp4');
const TEMP_DIR = path.join(DEMO_DIR, 'temp');

// Scene definitions — order matters
const SCENES = [
  'scene-01-landing',
  'scene-02-themes',
  'scene-03-setup',
  'scene-04-gameplay',
  'scene-05-neon-game',
  'scene-06-marvel-game',
  'scene-07-replay',
  'scene-08-mobile',
] as const;

function ensureDir(dir: string) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function run(cmd: string, args: string[], label: string) {
  console.log(`  [${label}] ${cmd} ${args.slice(0, 3).join(' ')}...`);
  try {
    execFileSync(cmd, args, { stdio: 'pipe', timeout: 120_000 });
  } catch (err: unknown) {
    const error = err as { stderr?: Buffer };
    const stderr = error.stderr ? error.stderr.toString().slice(-500) : '';
    console.error(`  [${label}] FAILED:\n${stderr}`);
    throw err;
  }
}

/**
 * Step 1: Find recorded .webm clips from Playwright test results
 */
function findClips(): Map<string, string> {
  const found = new Map<string, string>();

  // Playwright stores videos in test-results/<test-name>-<browser>/video.webm
  const testResultsDir = path.join(PROJECT_DIR, 'test-results');
  if (!fs.existsSync(testResultsDir)) {
    console.error('No test-results directory found. Run the Playwright demo tests first.');
    process.exit(1);
  }

  const dirs = fs.readdirSync(testResultsDir);
  for (const scene of SCENES) {
    // Find directory matching this scene
    const matchDir = dirs.find((d) => d.includes(scene));
    if (matchDir) {
      const videoPath = path.join(testResultsDir, matchDir, 'video.webm');
      if (fs.existsSync(videoPath)) {
        found.set(scene, videoPath);
      }
    }
  }

  return found;
}

/**
 * Step 2: Convert .webm clips to .mp4 with consistent encoding
 */
function convertClips(clips: Map<string, string>) {
  ensureDir(CLIPS_DIR);

  for (const [scene, webmPath] of clips) {
    const mp4Path = path.join(CLIPS_DIR, `${scene}.mp4`);
    run(
      FFMPEG,
      [
        '-y',
        '-i',
        webmPath,
        '-vf',
        'scale=1920:1080:force_original_aspect_ratio=decrease,pad=1920:1080:(ow-iw)/2:(oh-ih)/2:black,fps=30',
        '-c:v',
        'libx264',
        '-preset',
        'fast',
        '-crf',
        '23',
        '-pix_fmt',
        'yuv420p',
        '-an',
        mp4Path,
      ],
      scene,
    );
    console.log(`  Converted: ${scene}.mp4`);
  }
}

/**
 * Step 3: Generate title cards as plain color video
 * Uses lavfi color source (no text overlay, since drawtext isn't available in static ffmpeg).
 * Title cards are simple dark screens used as transitions.
 */
function generateTitleCard(_title: string, _subtitle: string, outputPath: string, duration: number) {
  run(
    FFMPEG,
    [
      '-y',
      '-f',
      'lavfi',
      '-i',
      `color=c=0x1a1a2e:s=1920x1080:d=${duration}:r=30`,
      '-c:v',
      'libx264',
      '-preset',
      'fast',
      '-crf',
      '23',
      '-pix_fmt',
      'yuv420p',
      '-t',
      String(duration),
      outputPath,
    ],
    'title',
  );
}

/**
 * Step 4: Add fade transitions to clips
 */
function addFades(inputPath: string, outputPath: string, fadeInDuration = 0.5, fadeOutDuration = 0.5) {
  // Get video duration
  const durationStr = execFileSync(FFMPEG, [
    '-i', inputPath,
    '-f', 'null',
    '-'
  ], { stdio: ['pipe', 'pipe', 'pipe'] }).toString();

  // Use ffprobe approach instead
  let duration = 5;
  try {
    const probe = execSync(
      `${FFMPEG} -i "${inputPath}" 2>&1 | grep "Duration" | head -1`,
      { encoding: 'utf-8' },
    );
    const match = probe.match(/Duration:\s*(\d+):(\d+):(\d+\.\d+)/);
    if (match) {
      duration = parseInt(match[1]) * 3600 + parseInt(match[2]) * 60 + parseFloat(match[3]);
    }
  } catch {
    // fallback: skip fades
    fs.copyFileSync(inputPath, outputPath);
    return;
  }

  const fadeOutStart = Math.max(0, duration - fadeOutDuration);

  run(
    FFMPEG,
    [
      '-y',
      '-i',
      inputPath,
      '-vf',
      `fade=t=in:st=0:d=${fadeInDuration},fade=t=out:st=${fadeOutStart}:d=${fadeOutDuration}`,
      '-c:v',
      'libx264',
      '-preset',
      'fast',
      '-crf',
      '23',
      '-pix_fmt',
      'yuv420p',
      '-an',
      outputPath,
    ],
    'fade',
  );
}

/**
 * Step 5: Concatenate all clips into final video
 */
function concatenate(clipPaths: string[]) {
  const listFile = path.join(TEMP_DIR, 'concat-list.txt');
  const content = clipPaths.map((p) => `file '${p}'`).join('\n');
  fs.writeFileSync(listFile, content);

  run(
    FFMPEG,
    [
      '-y',
      '-f',
      'concat',
      '-safe',
      '0',
      '-i',
      listFile,
      '-c:v',
      'libx264',
      '-preset',
      'medium',
      '-crf',
      '20',
      '-pix_fmt',
      'yuv420p',
      '-movflags',
      '+faststart',
      '-an',
      OUTPUT_FILE,
    ],
    'concat',
  );
}

/* ------------------------------------------------------------------ */
/*  Main pipeline                                                      */
/* ------------------------------------------------------------------ */

async function main() {
  console.log('=== Chess Fighter Demo Video Generator ===\n');

  ensureDir(DEMO_DIR);
  ensureDir(CLIPS_DIR);
  ensureDir(TEMP_DIR);

  // Step 1: Find Playwright clips
  console.log('Step 1: Finding recorded clips...');
  const clips = findClips();

  if (clips.size === 0) {
    console.error('No clips found! Run the demo recording first:');
    console.error('  npx playwright test e2e/demo-video.spec.ts --project=demo');
    process.exit(1);
  }

  console.log(`  Found ${clips.size} clips: ${[...clips.keys()].join(', ')}\n`);

  // Step 2: Convert to consistent mp4
  console.log('Step 2: Converting clips to MP4...');
  convertClips(clips);
  console.log();

  // Step 3: Generate title cards
  console.log('Step 3: Generating title cards...');
  const introPath = path.join(TEMP_DIR, 'intro.mp4');
  const outroPath = path.join(TEMP_DIR, 'outro.mp4');

  generateTitleCard('Chess Fighter', 'A Modern Chess Experience', introPath, 3);
  generateTitleCard('Chess Fighter', 'github.com/Hakiick/ChessGame', outroPath, 3);
  console.log();

  // Step 4: Add fade transitions
  console.log('Step 4: Adding fade transitions...');
  const fadedClips: string[] = [];

  // Intro with fade
  const fadedIntro = path.join(TEMP_DIR, 'intro-faded.mp4');
  addFades(introPath, fadedIntro, 0.5, 0.5);
  fadedClips.push(fadedIntro);

  // Each scene clip with fades
  for (const scene of SCENES) {
    const clipPath = path.join(CLIPS_DIR, `${scene}.mp4`);
    if (fs.existsSync(clipPath)) {
      const fadedPath = path.join(TEMP_DIR, `${scene}-faded.mp4`);
      addFades(clipPath, fadedPath, 0.3, 0.3);
      fadedClips.push(fadedPath);
    }
  }

  // Outro with fade
  const fadedOutro = path.join(TEMP_DIR, 'outro-faded.mp4');
  addFades(outroPath, fadedOutro, 0.5, 0.5);
  fadedClips.push(fadedOutro);
  console.log();

  // Step 5: Concatenate
  console.log('Step 5: Concatenating final video...');
  concatenate(fadedClips);
  console.log();

  // Get final file size
  const stats = fs.statSync(OUTPUT_FILE);
  const sizeMB = (stats.size / 1024 / 1024).toFixed(1);

  // Get duration
  let durationStr = 'unknown';
  try {
    const probe = execSync(`${FFMPEG} -i "${OUTPUT_FILE}" 2>&1 | grep Duration`, {
      encoding: 'utf-8',
    });
    const match = probe.match(/Duration:\s*(\d+:\d+:\d+\.\d+)/);
    if (match) durationStr = match[1];
  } catch {
    // ignore
  }

  console.log('=== Demo Video Generated ===');
  console.log(`  Output:   ${OUTPUT_FILE}`);
  console.log(`  Size:     ${sizeMB} MB`);
  console.log(`  Duration: ${durationStr}`);
  console.log(`  Format:   1080p MP4 (H.264)`);

  // Cleanup temp
  fs.rmSync(TEMP_DIR, { recursive: true, force: true });
  console.log('\nTemp files cleaned up.');
}

main().catch((err) => {
  console.error('Pipeline failed:', err.message);
  process.exit(1);
});

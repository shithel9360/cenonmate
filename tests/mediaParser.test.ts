import test from 'node:test';
import assert from 'node:assert';
import { parseMediaUrl } from '../lib/utils/mediaParser.ts';

test('mediaParser - parses YouTube shorts correctly', () => {
  const res = parseMediaUrl('https://www.youtube.com/shorts/dQw4w9WgXcQ');
  assert.strictEqual(res.platform, 'youtube');
  assert.strictEqual(res.videoId, 'dQw4w9WgXcQ');
  assert.ok(res.embedUrl?.includes('embed/dQw4w9WgXcQ'));
  assert.strictEqual(res.thumbnailUrl, 'https://i.ytimg.com/vi/dQw4w9WgXcQ/maxresdefault.jpg');
});

test('mediaParser - parses YouTube shorts with query params', () => {
  const res = parseMediaUrl('https://www.youtube.com/shorts/dQw4w9WgXcQ?feature=share&t=10');
  assert.strictEqual(res.platform, 'youtube');
  assert.strictEqual(res.videoId, 'dQw4w9WgXcQ');
  assert.ok(res.embedUrl?.includes('embed/dQw4w9WgXcQ?'));
});

test('mediaParser - parses youtu.be shortlinks', () => {
  const res = parseMediaUrl('https://youtu.be/dQw4w9WgXcQ?t=5s');
  assert.strictEqual(res.platform, 'youtube');
  assert.strictEqual(res.videoId, 'dQw4w9WgXcQ');
  assert.ok(res.embedUrl?.includes('embed/dQw4w9WgXcQ?'));
});

test('mediaParser - parses standard youtube watch?v= links', () => {
  const res = parseMediaUrl('https://www.youtube.com/watch?v=dQw4w9WgXcQ&list=123');
  assert.strictEqual(res.platform, 'youtube');
  assert.strictEqual(res.videoId, 'dQw4w9WgXcQ');
  assert.ok(res.embedUrl?.includes('embed/dQw4w9WgXcQ?'));
});

test('mediaParser - parses Instagram reel with trailing slash without double slashes', () => {
  const res = parseMediaUrl('https://www.instagram.com/reel/C7xPzwr3abc/');
  assert.strictEqual(res.platform, 'instagram');
  assert.strictEqual(res.embedUrl, 'https://www.instagram.com/reel/C7xPzwr3abc/embed/');
});

test('mediaParser - parses Instagram reel WITHOUT trailing slash without malformed embed', () => {
  const res = parseMediaUrl('https://www.instagram.com/reel/C7xPzwr3abc');
  assert.strictEqual(res.platform, 'instagram');
  assert.strictEqual(res.embedUrl, 'https://www.instagram.com/reel/C7xPzwr3abc/embed/');
});

test('mediaParser - parses Instagram reel with query params', () => {
  const res = parseMediaUrl('https://www.instagram.com/reel/C7xPzwr3abc/?utm_source=ig_web_copy_link');
  assert.strictEqual(res.platform, 'instagram');
  assert.strictEqual(res.embedUrl, 'https://www.instagram.com/reel/C7xPzwr3abc/embed/');
});

test('mediaParser - parses direct MP4 / WebM video files', () => {
  const res = parseMediaUrl('https://example.com/assets/video.mp4');
  assert.strictEqual(res.platform, 'direct');
  assert.strictEqual(res.embedUrl, 'https://example.com/assets/video.mp4');
});

test('mediaParser - handles empty or unsupported URLs gracefully', () => {
  assert.strictEqual(parseMediaUrl('').platform, 'unknown');
  assert.strictEqual(parseMediaUrl('https://vimeo.com/123456').platform, 'unknown');
});

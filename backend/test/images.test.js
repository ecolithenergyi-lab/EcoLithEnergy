const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const createApp = require('../src/app');

test('all local image references in the frontend resolve to image assets', async (t) => {
  const server = createApp().listen(0, '127.0.0.1');
  await new Promise((resolve, reject) => {
    server.once('listening', resolve);
    server.once('error', reject);
  });
  t.after(() => new Promise((resolve, reject) => {
    server.close((error) => error ? reject(error) : resolve());
  }));

  const html = fs.readFileSync(path.resolve(__dirname, '../../frontend/index.html'), 'utf8');
  const imageReferences = [...html.matchAll(/(?:src|href|content)="([^"]*client\/images\/[^"]+)"/g)]
    .map(([, reference]) => new URL(reference, `http://127.0.0.1:${server.address().port}/`).pathname);

  assert.ok(imageReferences.length > 0, 'expected frontend image references');

  for (const imagePath of new Set(imageReferences)) {
    const response = await fetch(`http://127.0.0.1:${server.address().port}${imagePath}`);
    assert.equal(response.status, 200, `${imagePath} should resolve`);
    assert.match(response.headers.get('content-type') || '', /^image\//, `${imagePath} should be an image`);
  }

  const legacyProductImage = await fetch(
    `http://127.0.0.1:${server.address().port}/images/NMC-60V32AH.jpeg`
  );
  assert.equal(legacyProductImage.status, 200);

  const legacyQualityImage = await fetch(
    `http://127.0.0.1:${server.address().port}/images/quality.jpeg`,
    { redirect: 'manual' }
  );
  assert.equal(legacyQualityImage.status, 308);
  assert.equal(legacyQualityImage.headers.get('location'), '/images/quality-testing-blueprint.jpeg');
});

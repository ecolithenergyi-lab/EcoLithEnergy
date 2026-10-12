const test = require('node:test');
const assert = require('node:assert/strict');
const SiteSettings = require('../src/models/SiteSettings');
const Product = require('../src/models/Product');
const Gallery = require('../src/models/Gallery');
const Review = require('../src/models/Review');
const { seedDatabase } = require('../src/scripts/seed');

test('database seeding propagates failures to the startup caller', async () => {
  const originalFindOne = SiteSettings.findOne;
  SiteSettings.findOne = async () => {
    throw new Error('database unavailable');
  };

  try {
    await assert.rejects(seedDatabase(), /database unavailable/);
  } finally {
    SiteSettings.findOne = originalFindOne;
  }
});

test('database seeding upserts the five customer reviews', async () => {
  const originals = {
    settingsFindOne: SiteSettings.findOne,
    productCountDocuments: Product.countDocuments,
    galleryCountDocuments: Gallery.countDocuments,
    reviewBulkWrite: Review.bulkWrite,
    reviewDeleteOne: Review.deleteOne
  };
  let reviewOperations;
  let deleteFilter;

  SiteSettings.findOne = async () => ({});
  Product.countDocuments = async () => 1;
  Gallery.countDocuments = async () => 1;
  Review.bulkWrite = async (operations) => {
    reviewOperations = operations;
  };
  Review.deleteOne = async (filter) => {
    deleteFilter = filter;
  };

  try {
    await seedDatabase();

    assert.equal(reviewOperations.length, 5);
    assert.ok(reviewOperations.every(({ updateOne }) => {
      assert.deepEqual(Object.keys(updateOne.filter).sort(), ['review', 'source']);
      assert.equal(updateOne.filter.source, 'Google Business Profile');
      assert.equal(updateOne.filter.review, updateOne.update.$set.review);
      assert.equal(updateOne.update.$set.isPublished, true);
      return updateOne.upsert;
    }));
    assert.ok(reviewOperations.some(({ updateOne }) => updateOne.update.$set.name === 'Ilma Khan'));
    assert.deepEqual(deleteFilter, {
      name: 'EcoLith Energy',
      source: 'Google Business Profile',
      review: 'Best service and premium quality battery'
    });
  } finally {
    SiteSettings.findOne = originals.settingsFindOne;
    Product.countDocuments = originals.productCountDocuments;
    Gallery.countDocuments = originals.galleryCountDocuments;
    Review.bulkWrite = originals.reviewBulkWrite;
    Review.deleteOne = originals.reviewDeleteOne;
  }
});

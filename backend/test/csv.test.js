const test = require('node:test');
const assert = require('node:assert/strict');
const { escapeCsvValue } = require('../src/controllers/inquiry.controller');

test('CSV encoding quotes fields and escapes embedded quotes', () => {
  assert.equal(escapeCsvValue('Alice "A"'), '"Alice ""A"""');
});

test('CSV encoding neutralizes spreadsheet formula prefixes', () => {
  for (const value of ['=1+1', '+SUM(A1:A3)', '-1+2', '@SUM(A1)', ' \t=1+1', '\uFEFF@SUM(A1)']) {
    assert.equal(escapeCsvValue(value).startsWith('"\'') , true);
  }
});

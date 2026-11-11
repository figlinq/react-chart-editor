/* eslint-disable no-console */
// Writes the attributes of Figlinq's `summary` plotly.js transform to a JSON fixture the panel test compares the controls with.
//
//   node scripts/exportSummaryAttributes.js <streambed>/shelly/plotlyjs/static/plotlyjs/src/addons/summaryTransform.js
//
// (the module only needs plotly.js 2.x sources, which this repository has in node_modules). Re-run it and commit the result when the transform's
// attributes change in Streambed.
const fs = require('fs');
const path = require('path');

const source = process.argv[2];
if (!source) {
  console.error('usage: node scripts/exportSummaryAttributes.js <path to summaryTransform.js>');
  process.exit(1);
}
// plotly.js sources expect a browser: give them a jsdom window
const {JSDOM} = require('jsdom');
const {window} = new JSDOM('');
global.window = window;
global.self = window;
global.document = window.document;
global.navigator = window.navigator;
const transform = require(path.resolve(source));
const out = path.join(__dirname, '../src/default_panels/__tests__/fixtures/summaryTransformAttributes.json');
const attributes = {};
Object.keys(transform.attributes).forEach((key) => {
  const {valType, values, dflt, min, max} = transform.attributes[key];
  attributes[key] = key === 'editType' ? transform.attributes[key] : {valType, values, dflt, min, max};
});
fs.writeFileSync(out, JSON.stringify({name: transform.name, attributes}, null, 2) + '\n');
console.log('wrote', out);

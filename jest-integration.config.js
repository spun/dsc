// We have two Jest config files variants, one for Unit Tests and one
// for Integration Tests (puppeteer). This division allow us to define
// the minimun required preset for each type of test.
// We haven't done any testing to check if this has any positive impact
// on performance.
module.exports = {
  preset: './utils/ts_and_puppeteer_preset.js',
};

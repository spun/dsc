import { prepareEmptyDir, checkFileExistsWithTimeout } from '../testUtils/fileUtils';

const path = require('path');

const fs = require('fs');

const twitchTestInput = [
  {
    name: 'Bob Ross Anniversary video',
    url: 'https://www.twitch.tv/videos/100285305',
    expectedFileName: '100285305.m3u8',
  },
];

const downloadsPath = path.join(__dirname, '../tmp_downloads');

const twitchTests = (name: string, url: string, expectedFileName: string) => {
  describe(name, () => {
    beforeAll(async () => {
      // @ts-ignore Set download destination
      // eslint-disable-next-line no-underscore-dangle
      const client = await page.target().createCDPSession();
      await client.send('Page.setDownloadBehavior', {
        behavior: 'allow',
        downloadPath: downloadsPath,
      });

      // Prepare downloads directory
      prepareEmptyDir(downloadsPath);

      // Open page
      await page.goto(url);

      // Inject bookmarklet
      await page.addScriptTag({ url: 'http://localhost:8080/dist/main.js' });

      // Wait for download
      const filePath = path.join(downloadsPath, expectedFileName);
      await checkFileExistsWithTimeout(filePath, 6000);
    }, 10000);

    afterAll(() => {
      // Delete downloads directory recursively
      if (fs.existsSync(downloadsPath)) {
        fs.rmSync(downloadsPath, { recursive: true });
      }
    });

    it('should have downloaded a file"', () => {
      // This is just a PoC for future tests
      const files = fs.readdirSync(downloadsPath);
      expect(files.length).toBeGreaterThan(0);
    });
  });
};

describe('Twitch', () => {
  twitchTestInput.forEach((it) => {
    twitchTests(it.name, it.url, it.expectedFileName);
  });
});

// Run just this file
// npx jest __tests__/integrationTests/twitch.test.ts -c jest-integration.config.js

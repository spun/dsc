import { prepareEmptyDir, checkFileExistsWithTimeout } from '../testUtils/fileUtils';

const path = require('path');
const fs = require('fs');

const downloadsPath = path.join(__dirname, '../tmp_downloads');

const twitchLiveTests = (name: string, url: string, expectedFileName: string) => {
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

    it('should have downloaded a file"', () => {
      // This is just a PoC for future tests
      const files = fs.readdirSync(downloadsPath);
      expect(files.length).toBeGreaterThan(0);
    });

    afterAll(() => {
      // Delete downloads directory recursively
      if (fs.existsSync(downloadsPath)) {
        fs.rmSync(downloadsPath, { recursive: true, force: true });
      }
    });
  });
};

const twitchVodTests = (name: string, url: string) => {
  describe(name, () => {
    beforeAll(async () => {
      // Open page
      await page.goto(url);
      // Inject bookmarklet
      await page.addScriptTag({ url: 'http://localhost:8080/dist/main.js' });
    }, 10000);

    it('should show the popup window', async () => {
      const popupElement = await page.waitForSelector('xpath/.//*[@id="dsc_popup"]', { visible: true, timeout: 5000 });
      expect(popupElement).not.toBeNull();
    });

    it('should contain at least one download element', async () => {
      // Step 1: Wait until the first popup list element is added
      await page.waitForSelector('xpath/.//*[@id="dsc_popup"]/ul/li', { visible: true, timeout: 5000 });
      // Step 2: Check if there is more than one
      // NOTE: Since our popup elements are added one by one, this check should always return 1 and is not really neccessary. 
      //  We are leaving it as a reference in case we decide to modify how the popup gets populated and we want to test it.
      const listItemCount = await page.$$eval('xpath/.//*[@id="dsc_popup"]/ul/li', items => items.length);
      expect(listItemCount).toBeGreaterThan(0);
    });

    // TODO: Check if we can download m3u8 files by clicking an element from the popup
  });
};

describe('Twitch live', () => {
  [
    {
      // This is the channel with the highest viewer count in the "Always On" category
      // https://www.twitch.tv/directory/category/always-on?sort=VIEWER_COUNT
      name: 'Always live channel',
      url: 'https://www.twitch.tv/theburntpeanut_247',
      expectedFileName: 'theburntpeanut_247.m3u8',
    }
  ].forEach((it) => {
    twitchLiveTests(it.name, it.url, it.expectedFileName);
  });
});

describe('Twitch VOD', () => {
  [
    {
      // Old vods use different format segment.
      // See twitch.js for more info.
      name: 'Bob Ross Anniversary video (legacy formats)',
      url: 'https://www.twitch.tv/videos/100285305',
    },
    {
      name: 'Bob Ross Anniversary video (modern formats)',
      url: 'https://www.twitch.tv/videos/2374922078',
    },
  ].forEach((it) => {
    twitchVodTests(it.name, it.url);
  });
});


// Run just this file
// npx jest __tests__/integrationTests/twitch.test.ts -c jest-integration.config.js

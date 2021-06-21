// We are differenciating between "standard navigation" (the user goes directly to the video url)
// and "SPA navigation" (the user goes to the video after, for example, searching for it). This is
// necessary because some information is not availabe to the bookmarklet in SPA navigation and it
// needs to use alternative methods to get the information. To test the correct behaviour in all
// cases, he have tests for both navigation methods.

// --- Standard navigation ---
const youtubeStandardTestInput = [{
  name: 'New in Chrome 87',
  url: 'https://www.youtube.com/watch?v=NCKMMzVn1c8',
}];

const youtubeStandardTests = (name: string, url: string) => {
  describe(name, () => {
    beforeAll(async () => {
      await page.goto(url);
      // Cookie consent
      if (page.url().includes('consent.youtube.com')) {
        await Promise.all([
          page.waitForNavigation(),
          page.click('button'),
        ]);
      }
      await page.addScriptTag({ url: 'http://localhost:8080/dist/main.js' });
    }, 10000);

    it('should show the popup window"', async () => {
      const popupElement = await page.waitForXPath('//*[@id="dsc_popup"]', { visible: true, timeout: 5000 });
      expect(popupElement).not.toBeNull();
    });

    it('should contain at least one download element', async () => {
      const listItems = await page.$x('//*[@id="dsc_popup"]/ul/li/a/p[2]');
      expect(listItems.length).toBeGreaterThan(0);
    });

    it('should have an english subtitle', async () => {
      const listItems = await page.$x('//*[@id="dsc_popup"]/ul/li/a/p[2]');
      const titleItems = await Promise.all(listItems.map(async (item) => {
        const title = await page.evaluate((it) => it.textContent, item);
        return title;
      }));
      expect(titleItems).toContain('Subtitle en');
    });
  });
};

describe('Youtube (standard navigation)', () => {
  // Run standard tests (we run the bookmarklet in the url we go to)
  youtubeStandardTestInput.forEach((it) => {
    youtubeStandardTests(it.name, it.url);
  });
});

// --- SPA navigation ---

const youtubeSPATestInput = [{
  name: 'What’s new in Puppeteer',
  searchUrl: 'https://www.youtube.com/results?search_query=What%E2%80%99s+new+in+Puppeteer+Google+Chrome+Developers',
}];

const youtubeSPATests = (name: string, searchUrl: string) => {
  describe(name, () => {
    beforeAll(async () => {
      await page.goto(searchUrl);
      // Cookie consent
      if (page.url().includes('consent.youtube.com')) {
        await Promise.all([
          page.waitForNavigation(),
          page.click('button'),
        ]);
      }
      // First search result
      await Promise.all([
        page.waitForNavigation(),
        // Click on first result
        page.click('#video-title'),
      ]);
      // Inject bookmarklet
      await page.addScriptTag({ url: 'http://localhost:8080/dist/main.js' });
    }, 10000);

    it('should show the popup window"', async () => {
      const popupElement = await page.waitForXPath('//*[@id="dsc_popup"]', { visible: true, timeout: 5000 });
      expect(popupElement).not.toBeNull();
    });

    it('should contain at least one download element', async () => {
      const listElements = await page.$x('//*[@id="dsc_popup"]/ul/li');
      expect(listElements.length).toBeGreaterThan(0);
    });

    // Note: The Bookmarklet is not able to get subtitles is SPA navigation.
    // We only check for them in Standard navigation.
  });
};

describe('Youtube (SPA navigation)', () => {
  // Run standard tests (we perform a search and navigate to the page
  // where we are going to run the bookmarklet)
  youtubeSPATestInput.forEach((it) => {
    youtubeSPATests(it.name, it.searchUrl);
  });
});

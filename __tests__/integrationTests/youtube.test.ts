const tests = [
  {
    name: 'New in Chrome 87',
    url: 'https://www.youtube.com/watch?v=NCKMMzVn1c8',
  },
];

const testUtil = (name: string, url: string) => {
  describe(name, () => {
    beforeAll(async () => {
      await page.goto(url);
      await page.addScriptTag({ url: 'http://localhost:8080/dist/main.js' });
    });

    it('should show the popup window"', async () => {
      const popupElement = await page.waitForXPath('//*[@id="dsc_popup"]', { visible: true, timeout: 5000 });
      expect(popupElement).not.toBeNull();
    });

    it('should contain at least one download element', async () => {
      const listElements = await page.$x('//*[@id="dsc_popup"]/ul/li');
      expect(listElements.length).toBeGreaterThan(0);
    });
  });
};

describe('Youtube', () => {
  tests.forEach((it) => {
    testUtil(it.name, it.url);
  });
});

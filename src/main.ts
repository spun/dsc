// src/main.ts
(async () => {
  // Check current domain
  let dynamicImport;
  switch (document.domain) {
      case 'www.youtube.com':
        dynamicImport = import('./youtube/youtube.js');
        break;
      case 'twitch.tv':
        dynamicImport = import('./twitch/twitch.js');
        break;
      case 'mixer.com':
        dynamicImport = import('./mixer/mixer.js');
        break;
      default:
        console.log(`Unknown domain: ${document.domain}`);
        break;
  }

  // run
  if (dynamicImport) {
    const { default: main } = await dynamicImport
    main()
  }
})();

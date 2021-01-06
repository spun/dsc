// src/main.ts
(() => {
  // Check current domain
  let s;
  switch (document.domain) {
    case 'www.youtube.com':
      s = import('./youtube/youtube');
      break;
    case 'twitch.tv':
      s = import('./twitch/twitch');
      break;
    case 'mixer.com':
      s = import('./mixer/mixer');
      break;
    default:
      console.log(`Unknown domain: ${document.domain}`);
      break;
  }

  // run
  if (s) {
    s.then((module) => {
      module.default();
    });
  }
}();
